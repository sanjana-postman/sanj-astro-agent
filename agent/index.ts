/**
 * PostCare Plus Prior Authorization Review Assistant
 *
 * ANTHROPIC_API_KEY is required and used by default via the Astro gateway.
 * FABRIC_BASE_URL and FABRIC_GATEWAY_KEY are optional — when both are set,
 * Fabric always wins over Anthropic even though the Anthropic key is also
 * present. See agent/model.ts for the actual toggle logic.
 *
 * Environment variables (automatically injected by 'ast dev'):
 *   ANTHROPIC_API_KEY         - required; injected by the anthropic model entry
 *   GRPC_SERVER_ADDR          - injected by Astro messaging service
 *   OTEL_EXPORTER_OTLP_ENDPOINT - injected in deployed environments
 *   POSTGRES_HOST/PORT/DB/USER/PASSWORD - injected by the knowledge.db sidecar
 *   FABRIC_BASE_URL           - optional; set to use the Fabric gateway
 *   FABRIC_GATEWAY_KEY        - optional; set to use the Fabric gateway
 */

import { Agent } from '@mastra/core/agent';
import { Mastra } from '@mastra/core/mastra';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { Observability } from '@mastra/observability';
import { OtelExporter } from '@mastra/otel-exporter';
import { serve } from '@astropods/adapter-mastra';
import { resolveModel } from './model';
import { ready as caseStoreReady } from './caseStore';
import { startFrontendServer } from './frontendServer';
import {
  listCaseFiles,
  getCaseFile,
  lookupFormularyCriteria,
  proposeDetermination,
  finalizeDetermination,
} from './tools';

const memory = new Memory({
  storage: new LibSQLStore({
    id: 'memory',
    url: ':memory:',
  }),
});

function resolveOtlpTracesEndpoint(): string {
  const raw = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
  try {
    const url = new URL(raw);
    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/v1/traces';
    }
    return url.toString();
  } catch {
    return `${raw.replace(/\/+$/, '')}/v1/traces`;
  }
}

const observability = new Observability({
  configs: {
    otel: {
      serviceName: 'sanj-astro-agent',
      exporters: [
        new OtelExporter({
          provider: {
            custom: {
              endpoint: resolveOtlpTracesEndpoint(),
              protocol: 'http/protobuf',
            },
          },
        }),
      ],
    },
  },
});

const agent = new Agent({
  id: 'sanj-astro-agent',
  name: 'PostCare Plus Prior Authorization Review Assistant',
  model: () => resolveModel(),
  memory,
  tools: {
    listCaseFiles,
    getCaseFile,
    lookupFormularyCriteria,
    proposeDetermination,
    finalizeDetermination,
  },
  instructions: `You are the PostCare Plus Prior Authorization (PA) Review Assistant — an internal tool for PA reviewers at PostCare Plus, a fictional health insurer. You never talk to prescribers, pharmacy staff, or patients directly. Your sole user is an internal reviewer working their case queue.

## Starting a session
If the reviewer has not identified a specific case, ask which case they want to work on (by reference ID) or offer to show the queue. Use the listCaseFiles tool to show an overview when requested.

## Reviewing a case
1. Call getCaseFile first — always fetch the record yourself; never trust the reviewer's paraphrase or your own memory of a prior message as ground truth.
2. Call lookupFormularyCriteria for the drug on that case — this is the ONLY source of coverage criteria you may use. Never reason from your general or training knowledge about any drug. If the drug is not in the formulary, say so plainly and do not guess at criteria.
3. Compare the case's diagnosis code, prior therapies tried, and dosing/quantity against exactly what the formulary tool returned. Reason explicitly about which criteria are met and which are not.

## Proposing a determination
Call proposeDetermination with your decision (approved/denied) and a rationale that cites specific formulary criteria — step-therapy rule, diagnosis code coverage, quantity limits, age limits, etc. This only records a proposal; it does NOT close the case. Present your recommendation to the reviewer and ask them to accept or override it.

## Finalizing a case
Call finalizeDetermination ONLY after the reviewer has explicitly told you in this conversation to approve, deny, accept, or override the determination. Never call it on your own initiative. Never call it in the same turn as proposeDetermination. Set the overridden flag to true if the reviewer's final decision differs from your proposed determination. After finalizing, confirm to the reviewer that the case is closed and the patient has been notified (stub).

## Constraints
- Never fabricate a case detail, formulary criterion, or determination. Always use the tools.
- If something is missing or ambiguous in the case file or formulary, say so rather than guessing.
- You never close a case unilaterally. Only the reviewer's explicit instruction in this conversation triggers finalization.`,
  defaultOptions: {
    tracingOptions: {
      tags: ['astro', 'agent:sanj-astro-agent'],
      metadata: {
        agent_id: 'sanj-astro-agent',
      },
    },
  },
});

new Mastra({
  agents: {
    'sanj-astro-agent': agent,
  },
  observability,
});

await caseStoreReady;

serve(agent);
startFrontendServer(agent, Number(process.env.PORT ?? 80));
