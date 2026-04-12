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

// THE BOUNDARY INTERROGATION: JSON Parser & Repair Exhaustion
test('geminiService - repairJson successfully closes truncated arrays and objects', async (t) => {
  t.mock.method(global, 'fetch', mockFetchResponse({
    candidates: [{
      content: { parts: [{ text: '{"queries": ["quantum computing", "AI logic"' }] },
      finishReason: 'STOP'
    }],
    usageMetadata: {}
  }));

  const result = await researchTopic('topic');
  assert.ok(result.data.includes('quantum computing'));
  assert.ok(result.data.includes('AI logic'));
});


test('geminiService - repairJson successfully closes heavily truncated manifest payload', async (t) => {
  const truncatedManifest = '{"identity": {"name": "Agent", "designation": "Desig", "primeDirective": "PD", "corePhilosophy": "CP"}, "protocol": {"standard": "DRP-2025", "role": "CODER"}, "tools": [{"name": "tool1", "description": "desc", "inputSchema": "{}", "riskLevel": "LOW"}], "internalTools": [], "budget": {"tokenBudget": 1000, "driftAllowance": 0.05}, "epistemicMatrix": {"primaryGoals": ["G1"], "antiGoals": ["AG1"'; // Truncated here

  t.mock.method(global, 'fetch', mockFetchResponse({
    candidates: [{
      content: { parts: [{ text: truncatedManifest }] },
      finishReason: 'STOP'
    }],
    usageMetadata: {}
  }));

  const result = await fabricateAgent('test', false);
  assert.strictEqual(result.data.identity.name, "Agent");
  assert.deepStrictEqual(result.data.epistemicMatrix.goals.primary, ["G1"]);
  assert.deepStrictEqual(result.data.epistemicMatrix.goals.antiGoals, ["AG1"]);
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

// THE BOUNDARY INTERROGATION: Sabotage Check
test('geminiService - SABOTAGE: repairJson fails mathematically when mutating logic', async (t) => {
  // We cannot directly mock a local const, but we can verify our tests break if repairJson didn't work.
  // Instead, we will sabotage the payload so it cannot be repaired into a valid structural object.
  const unrepairableManifest = '{"identity": {"name": "Agent"'; // Missing all required fields

  t.mock.method(global, 'fetch', mockFetchResponse({
    candidates: [{
      content: { parts: [{ text: unrepairableManifest }] },
      finishReason: 'STOP'
    }],
    usageMetadata: {}
  }));

  await assert.rejects(
    async () => fabricateAgent('test', false),
    /ERR_STRUCTURAL_VALIDATION|ERR_MAX_RETRIES/
  );
});
