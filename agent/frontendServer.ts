import type { Agent } from '@mastra/core/agent';
import { listCaseFiles, getCaseFile } from './caseStore';
import { maskId, maskDob } from './mask';

const FRONTEND_DIR = new URL('./frontend', import.meta.url).pathname;

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function serveStatic(filePath: string, contentType: string): Promise<Response> {
  const file = Bun.file(filePath);
  const exists = await file.exists();
  if (!exists) return new Response('Not found', { status: 404 });
  return new Response(file, { headers: { 'Content-Type': contentType } });
}

export function startFrontendServer(agent: Agent, port: number): void {
  Bun.serve({
    hostname: '0.0.0.0',
    port,
    async fetch(req) {
      const url = new URL(req.url);
      const path = url.pathname;

      // Static files
      if (path === '/' || path === '/index.html') {
        return serveStatic(`${FRONTEND_DIR}/index.html`, 'text/html; charset=utf-8');
      }
      if (path === '/styles.css') {
        return serveStatic(`${FRONTEND_DIR}/styles.css`, 'text/css; charset=utf-8');
      }
      if (path === '/app.js') {
        return serveStatic(`${FRONTEND_DIR}/app.js`, 'application/javascript; charset=utf-8');
      }

      // GET /api/cases?status=<optional>
      if (path === '/api/cases' && req.method === 'GET') {
        const status = url.searchParams.get('status') as 'pending' | 'approved' | 'denied' | null;
        const cases = await listCaseFiles(status ?? undefined);
        return jsonResponse({
          cases: cases.map((c) => ({
            referenceId: c.referenceId,
            status: c.status,
            drug: c.drug,
            diagnosisCode: c.diagnosisCode,
            patientIdMasked: maskId(c.patientId),
            updatedAt: c.updatedAt,
          })),
        });
      }

      // GET /api/cases/:referenceId
      const caseMatch = path.match(/^\/api\/cases\/([^/]+)$/);
      if (caseMatch && req.method === 'GET') {
        const referenceId = decodeURIComponent(caseMatch[1]);
        const caseFile = await getCaseFile(referenceId);
        if (!caseFile) return jsonResponse({ error: `Case ${referenceId} not found.` }, 404);

        // Strip raw patient identifiers, replace with masked versions
        const { patientId: _pid, patientDateOfBirth: _dob, ...rest } = caseFile;
        return jsonResponse({
          ...rest,
          patientIdMasked: maskId(_pid),
          patientDateOfBirthMasked: maskDob(_dob),
        });
      }

      // POST /api/chat
      if (path === '/api/chat' && req.method === 'POST') {
        let body: { message?: unknown; threadId?: unknown };
        try {
          body = await req.json() as { message?: unknown; threadId?: unknown };
        } catch {
          return jsonResponse({ error: 'Invalid JSON body.' }, 400);
        }

        const { message, threadId } = body;
        if (!message || typeof message !== 'string' || message.trim() === '') {
          return jsonResponse({ error: 'message must be a non-empty string.' }, 400);
        }
        if (!threadId || typeof threadId !== 'string' || threadId.trim() === '') {
          return jsonResponse({ error: 'threadId must be a non-empty string.' }, 400);
        }

        try {
          const result = await agent.stream(message, {
            memory: { thread: threadId, resource: 'pa-frontend' },
          });

          const encoder = new TextEncoder();
          const textStream = result.textStream;
          const byteStream = new ReadableStream<Uint8Array>({
            async start(controller) {
              const reader = textStream.getReader();
              try {
                for (;;) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  controller.enqueue(encoder.encode(value));
                }
                controller.close();
              } catch (err) {
                controller.error(err);
              }
            },
          });

          return new Response(byteStream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        } catch (err) {
          console.error('[frontendServer] /api/chat error:', err);
          return jsonResponse({ error: 'Failed to process chat request.' }, 500);
        }
      }

      return jsonResponse({ error: 'Not found.' }, 404);
    },
  });

  console.log(`[frontendServer] Listening on http://0.0.0.0:${port}`);
}
