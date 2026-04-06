import { test, mock } from 'node:test';
import assert from 'node:assert';

process.env.VITE_FIREBASE_GEMINI_API_KEY = 'dummy-key';

import { fabricateAgent, researchTopic, analyzeDocument, distillCapsule } from '../geminiService.ts';

const mockFetchResponse = (jsonPayload: any, ok = true) => {
  return async () => ({
    ok,
    status: ok ? 200 : 500,
    headers: { entries: () => [] },
    json: async () => jsonPayload
  });
};

test('geminiService - validateAgentManifest structural check', async (t) => {
  const malformedManifest = {
    identity: { designation: 'D', primeDirective: 'P', corePhilosophy: 'C' },
    epistemicMatrix: {}
  };

  t.mock.method(global, 'fetch', mockFetchResponse({
    candidates: [{
      content: { parts: [{ text: JSON.stringify(malformedManifest) }] },
      finishReason: 'STOP'
    }],
    usageMetadata: {}
  }));

  await assert.rejects(
    async () => fabricateAgent('test', false),
    /ERR_STRUCTURAL_VALIDATION|ERR_MAX_RETRIES/
  );
});

test('geminiService - validateResearchPlan missing queries array', async (t) => {
  t.mock.method(global, 'fetch', mockFetchResponse({
    candidates: [{
      content: { parts: [{ text: JSON.stringify({ notQueries: [] }) }] },
      finishReason: 'STOP'
    }],
    usageMetadata: {}
  }));

  const result = await researchTopic('topic');
  assert.ok(result.data.includes('DEEP RESEARCH SYNTHESIS'));
});

test('geminiService - abort controller cancels slow requests', async (t) => {
  // Override the timeout strictly for this test using a mock to prevent a 15-second hang
  const fastTimeoutMs = 100;

  // We mock fetch to hang indefinitely. It will be aborted when the signal fires.
  t.mock.method(global, 'fetch', async (url: RequestInfo | URL, options?: RequestInit) => {
    return new Promise((resolve, reject) => {
      if (options?.signal) {
        options.signal.addEventListener('abort', () => reject(new Error('AbortError')));
        setTimeout(() => options.signal?.dispatchEvent(new Event('abort')), fastTimeoutMs);
      }
    });
  });

  // Since executeWithRetry has fallback for analyzeDocument, it will catch the abort and use fallback
  const result = await analyzeDocument('test');
  assert.strictEqual(result.data.sentiment, 'COMPLEX');

  // fabricateAgent doesn't have a fallback function, it will exhaust retries and throw
  await assert.rejects(
    async () => fabricateAgent('test', false),
    /AbortError|ERR_MAX_RETRIES/
  );
});

test('geminiService - distillCapsule validates output', async (t) => {
  const malformedCapsule = { meta: { id: 'test' } }; // missing sections

  t.mock.method(global, 'fetch', mockFetchResponse({
    candidates: [{
      content: { parts: [{ text: JSON.stringify(malformedCapsule) }] },
      finishReason: 'STOP'
    }],
    usageMetadata: {}
  }));

  await assert.rejects(
    async () => distillCapsule('test'),
    /ERR_STRUCTURAL_VALIDATION: Context capsule missing 'sections'/
  );
});
