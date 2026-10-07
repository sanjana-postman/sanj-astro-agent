import { Pool } from 'pg';
import { CASE_FILE_SEED } from './data/caseFiles';

export type CaseStatus = 'pending' | 'approved' | 'denied';
export type DeterminationDecision = 'approved' | 'denied';

export interface Determination {
  decision: DeterminationDecision;
  rationale: string;
  citedDrug: string;
  timestamp: string;
}

export interface FinalDetermination extends Determination {
  overridden: boolean;
}

export interface CaseFile {
  referenceId: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  drug: string;
  dosage: string;
  quantity: string;
  daysSupply: number;
  diagnosisCode: string;
  priorTherapiesTried: string;
  patientId: string;
  patientDateOfBirth: string;
  prescriberName: string;
  prescriberNpi: string;
  prescriberContact: string;
  pharmacyOrFacility: string;
  proposedDetermination: Determination | null;
  finalDetermination: FinalDetermination | null;
  patientNotifiedAt: string | null;
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432'),
  database: process.env.POSTGRES_DB ?? 'postgres',
  user: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres',
});

async function initTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS case_files (
      "referenceId" TEXT PRIMARY KEY,
      data JSONB NOT NULL
    )
  `);
}

export async function seedIfEmpty(seed: CaseFile[]): Promise<void> {
  const result = await pool.query('SELECT COUNT(*) FROM case_files');
  const count = parseInt(result.rows[0].count as string, 10);
  if (count > 0) return;

  for (const caseFile of seed) {
    await pool.query(
      'INSERT INTO case_files ("referenceId", data) VALUES ($1, $2)',
      [caseFile.referenceId, JSON.stringify(caseFile)]
    );
  }
}

export async function listCaseFiles(status?: CaseStatus): Promise<CaseFile[]> {
  let result;
  if (status) {
    result = await pool.query(
      "SELECT data FROM case_files WHERE data->>'status' = $1 ORDER BY data->>'updatedAt' DESC",
      [status]
    );
  } else {
    result = await pool.query(
      "SELECT data FROM case_files ORDER BY data->>'updatedAt' DESC"
    );
  }
  return result.rows.map((row) => row.data as CaseFile);
}

export async function getCaseFile(referenceId: string): Promise<CaseFile | null> {
  const result = await pool.query(
    'SELECT data FROM case_files WHERE "referenceId" = $1',
    [referenceId]
  );
  if (result.rows.length === 0) return null;
  return result.rows[0].data as CaseFile;
}

export async function saveCaseFile(caseFile: CaseFile): Promise<void> {
  await pool.query(
    'INSERT INTO case_files ("referenceId", data) VALUES ($1, $2) ON CONFLICT ("referenceId") DO UPDATE SET data = EXCLUDED.data',
    [caseFile.referenceId, JSON.stringify(caseFile)]
  );
}

export const ready: Promise<void> = (async () => {
  await initTable();
  await seedIfEmpty(CASE_FILE_SEED);
})();
