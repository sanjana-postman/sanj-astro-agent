import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  listCaseFiles as dbListCaseFiles,
  getCaseFile as dbGetCaseFile,
  saveCaseFile,
} from './caseStore';
import type { Determination, FinalDetermination } from './caseStore';
import { lookupFormularyEntry } from './data/formulary';
import { maskId } from './mask';

export const listCaseFiles = createTool({
  id: 'list-case-files',
  description:
    'List cases in the PA queue. Use this when the reviewer wants an overview of their queue instead of naming a specific case.',
  inputSchema: z.object({
    status: z.enum(['pending', 'approved', 'denied']).optional(),
  }),
  outputSchema: z.object({
    cases: z.array(
      z.object({
        referenceId: z.string(),
        status: z.string(),
        drug: z.string(),
        diagnosisCode: z.string(),
        patientIdMasked: z.string(),
        updatedAt: z.string(),
      })
    ),
  }),
  execute: async (input) => {
    const cases = await dbListCaseFiles(input.status);
    return {
      cases: cases.map((c) => ({
        referenceId: c.referenceId,
        status: c.status,
        drug: c.drug,
        diagnosisCode: c.diagnosisCode,
        patientIdMasked: maskId(c.patientId),
        updatedAt: c.updatedAt,
      })),
    };
  },
});

export const getCaseFile = createTool({
  id: 'get-case-file',
  description:
    'Fetch the full case file for a given reference ID. Always call this before reasoning about a case; never trust the reviewer\'s paraphrase as ground truth.',
  inputSchema: z.object({
    referenceId: z.string(),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    caseFile: z.record(z.string(), z.unknown()).nullable(),
  }),
  execute: async (input) => {
    const caseFile = await dbGetCaseFile(input.referenceId);
    if (!caseFile) return { found: false, caseFile: null };
    return {
      found: true,
      caseFile: {
        ...caseFile,
        patientIdMasked: maskId(caseFile.patientId),
        patientDateOfBirthMasked: maskId(caseFile.patientDateOfBirth),
      } as unknown as Record<string, unknown>,
    };
  },
});

export const lookupFormularyCriteria = createTool({
  id: 'lookup-formulary-criteria',
  description:
    'Look up coverage criteria for a drug in the PostCare Plus formulary. This is the ONLY source of coverage criteria the agent may use — never reason from general/training knowledge about a drug. If not found, say so plainly.',
  inputSchema: z.object({
    drug: z.string(),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    entry: z.record(z.string(), z.unknown()).nullable(),
  }),
  execute: async (input) => {
    const entry = lookupFormularyEntry(input.drug);
    if (!entry) return { found: false, entry: null };
    return { found: true, entry: entry as unknown as Record<string, unknown> };
  },
});

export const proposeDetermination = createTool({
  id: 'propose-determination',
  description:
    'Record a proposed approve/deny determination for a case. Only call after checking both getCaseFile and lookupFormularyCriteria. This does NOT close the case — it only records the proposal for the reviewer to accept or override.',
  inputSchema: z.object({
    referenceId: z.string(),
    decision: z.enum(['approved', 'denied']),
    rationale: z.string(),
  }),
  outputSchema: z.object({
    referenceId: z.string(),
    proposedDetermination: z.object({
      decision: z.string(),
      rationale: z.string(),
      citedDrug: z.string(),
      timestamp: z.string(),
    }),
  }),
  execute: async (input) => {
    const caseFile = await dbGetCaseFile(input.referenceId);
    if (!caseFile) throw new Error(`Case ${input.referenceId} not found.`);

    const determination: Determination = {
      decision: input.decision,
      rationale: input.rationale,
      citedDrug: caseFile.drug,
      timestamp: new Date().toISOString(),
    };

    caseFile.proposedDetermination = determination;
    caseFile.updatedAt = new Date().toISOString();
    await saveCaseFile(caseFile);

    return { referenceId: input.referenceId, proposedDetermination: determination };
  },
});

export const finalizeDetermination = createTool({
  id: 'finalize-determination',
  description:
    'Finalize and close a case with the reviewer\'s explicit decision. ONLY call this after the human reviewer has explicitly told you, in this conversation, to approve/deny/accept/override — never on your own initiative, and never in the same turn as proposeDetermination.',
  inputSchema: z.object({
    referenceId: z.string(),
    decision: z.enum(['approved', 'denied']),
    rationale: z.string(),
    overridden: z.boolean(),
  }),
  outputSchema: z.object({
    referenceId: z.string(),
    status: z.string(),
    finalDetermination: z.object({
      decision: z.string(),
      rationale: z.string(),
      citedDrug: z.string(),
      timestamp: z.string(),
      overridden: z.boolean(),
    }),
    patientNotifiedAt: z.string(),
  }),
  execute: async (input) => {
    const caseFile = await dbGetCaseFile(input.referenceId);
    if (!caseFile) throw new Error(`Case ${input.referenceId} not found.`);

    const now = new Date().toISOString();
    const finalDetermination: FinalDetermination = {
      decision: input.decision,
      rationale: input.rationale,
      citedDrug: caseFile.drug,
      timestamp: now,
      overridden: input.overridden,
    };

    console.log(
      `[notify-patient] Case ${input.referenceId} (${caseFile.drug}) determination: ${input.decision}. Notifying patient ${maskId(caseFile.patientId)}.`
    );

    caseFile.finalDetermination = finalDetermination;
    caseFile.status = input.decision;
    caseFile.patientNotifiedAt = now;
    caseFile.updatedAt = now;
    await saveCaseFile(caseFile);

    return {
      referenceId: input.referenceId,
      status: caseFile.status,
      finalDetermination,
      patientNotifiedAt: now,
    };
  },
});
