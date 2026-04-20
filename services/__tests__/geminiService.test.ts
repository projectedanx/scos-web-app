import { test, mock } from 'node:test';
import assert from 'node:assert';

process.env.VITE_FIREBASE_GEMINI_API_KEY = 'dummy-key';

import { fabricateAgent, researchTopic, analyzeDocument, distillCapsule, generateMetaPrompt, createDiscoveryChat } from '../geminiService.ts';

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
  const fastTimeoutMs = 100;

  t.mock.method(global, 'fetch', async (url: RequestInfo | URL, options?: RequestInit) => {
    return new Promise((resolve, reject) => {
      if (options?.signal) {
        options.signal.addEventListener('abort', () => reject(new Error('AbortError')));
        setTimeout(() => options.signal?.dispatchEvent(new Event('abort')), fastTimeoutMs);
      }
    });
  });

  const result = await analyzeDocument('test');
  assert.strictEqual(result.data.sentiment, 'COMPLEX');

  await assert.rejects(
    async () => fabricateAgent('test', false),
    /AbortError|ERR_MAX_RETRIES/
  );
});

test('geminiService - distillCapsule validates output', async (t) => {
  const malformedCapsule = { meta: { id: 'test' } };

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

test('geminiService - handles null falsy payload bypassing try/catch', async (t) => {
  t.mock.method(global, 'fetch', mockFetchResponse({
    candidates: [{
      content: { parts: [{ text: 'null' }] },
      finishReason: 'STOP'
    }],
    usageMetadata: {}
  }));

  const result = await analyzeDocument('test');
  assert.strictEqual(result.data.sentiment, 'COMPLEX');
  assert.deepStrictEqual(result.data.topics, ['Unanalyzed']);
});

test('geminiService - secureJSONParse strips prototype pollution payloads', async (t) => {
  t.mock.method(global, 'fetch', mockFetchResponse({
    candidates: [{
      content: { parts: [{ text: '{"sentiment": "POSITIVE", "topics": ["Valid"], "__proto__": {"polluted": true}}' }] },
      finishReason: 'STOP'
    }],
    usageMetadata: {}
  }));

  const result = await analyzeDocument('test');
  assert.strictEqual(result.data.sentiment, 'POSITIVE');
  assert.deepStrictEqual(result.data.topics, ['Valid']);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(result.data, "__proto__"), false);
});

test('geminiService - generateMetaPrompt handles null intent securely', async (t) => {
  t.mock.method(global, 'fetch', mockFetchResponse({
    candidates: [{
      content: { parts: [{ text: "Generated Meta Prompt" }] },
      finishReason: 'STOP'
    }],
    usageMetadata: {}
  }));

  const result = await generateMetaPrompt('', { knowledgeContext: '', metaSystemPrompt: '' } as any);
  assert.strictEqual(result.data, 'Generated Meta Prompt');
});

test('geminiService - createDiscoveryChat creates valid chat object', async (t) => {
    const chat = createDiscoveryChat('context', true);
    assert.ok(chat);
});
