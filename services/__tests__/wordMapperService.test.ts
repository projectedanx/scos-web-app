import { test, mock } from 'node:test';
import assert from 'node:assert';

process.env.VITE_FIREBASE_API_KEY = 'dummy-key-that-is-long-enough';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'dummy-domain';
process.env.VITE_FIREBASE_PROJECT_ID = 'dummy-project';

const createMockFetch = (mockResponses: Record<string, any>) => {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlString = input.toString();

    if (init?.signal?.aborted) {
        throw new Error('AbortError');
    }

    // Catch Firebase Cloud Functions POST calls
    if (urlString.includes('cloudfunctions.net') || urlString.includes('secureProxy')) {
        const mockResp = mockResponses['secureProxy'];
        if (mockResp?.error) {
             // Firebase handles non-ok statuses
             return { ok: false, status: 500, json: async () => ({ error: { message: mockResp.error.message }}) };
        }
        return {
            ok: true,
            status: 200,
            json: async () => ({ data: mockResp?.data || { text: JSON.stringify({ nodes: [] }) } })
        };
    }

    for (const [key, responseDef] of Object.entries(mockResponses)) {
      if (urlString.includes(key)) {
        if (responseDef.error) throw responseDef.error;
        return {
          ok: responseDef.ok ?? true,
          status: responseDef.ok === false ? 500 : 200,
          json: async () => responseDef.data
        };
      }
    }

    return { ok: true, status: 200, json: async () => ({}) };
  };
};

test('wordMapperService', async (t) => {

    t.mock.method(global, 'fetch', createMockFetch({
        'datamuse': { data: [{ word: 'test1' }] },
        'conceptnet': { data: { edges: [{ weight: 2.0, start: { language: 'en' }, end: { language: 'en', label: 'test2' } }] } },
        'secureProxy': {
            data: {
                text: JSON.stringify({
                    nodes: [{
                        concept: 'TestConcept',
                        type: 'SEED',
                        dimension: 'TEMPORAL',
                        definition: 'A test definition'
                    }]
                })
            }
        }
    }));

    const { triangulateConcepts, fetchWikipediaDefinition } = await import('../wordMapperService.ts');

    await t.test('triangulateConcepts valid response', async () => {
        const result = await triangulateConcepts(['seedWord']);
        assert.strictEqual(result.nodes.length, 1);
        assert.strictEqual(result.nodes[0].concept, 'TestConcept');
    });

    await t.test('triangulateConcepts structural validation rejects missing nodes array', async () => {
        t.mock.method(global, 'fetch', createMockFetch({
            'datamuse': { data: [{ word: 'test1' }] },
            'conceptnet': { data: { edges: [] } },
            'secureProxy': { data: { text: JSON.stringify({ missingNodes: [] }) } }
        }));

        await assert.rejects(
            async () => triangulateConcepts(['seedWord']),
            /Failed to map concepts/
        );
    });

    await t.test('triangulateConcepts filters out malformed node entries', async () => {
        t.mock.method(global, 'fetch', createMockFetch({
            'datamuse': { data: [] },
            'conceptnet': { data: { edges: [] } },
            'secureProxy': {
                data: {
                    text: JSON.stringify({
                        nodes: [
                            { concept: 'Valid', type: 'SEED', dimension: 'TEMPORAL', definition: 'Valid' },
                            { concept: 'Invalid-MissingType', dimension: 'TEMPORAL', definition: '...' }
                        ]
                    })
                }
            }
        }));

        const result = await triangulateConcepts(['seedWord']);
        assert.strictEqual(result.nodes.length, 1);
        assert.strictEqual(result.nodes[0].concept, 'Valid');
    });

    await t.test('fetchWikipediaDefinition handles network failure securely without throwing', async () => {
        t.mock.method(global, 'fetch', createMockFetch({
            'wikipedia': { error: new Error('Network timeout') }
        }));

        const result = await fetchWikipediaDefinition('test');
        assert.strictEqual(result, null);
    });

    await t.test('fetchWikipediaDefinition parses missing pages securely', async () => {
        t.mock.method(global, 'fetch', createMockFetch({
            'wikipedia': { data: { query: { pages: { '-1': { missing: true } } } } }
        }));

        const result = await fetchWikipediaDefinition('non_existent_term');
        assert.strictEqual(result, null);
    });

    await t.test('internal concurrent fetch methods gracefully degrade on HTTP 500', async () => {
        t.mock.method(global, 'fetch', createMockFetch({
            'datamuse': { ok: false, data: [] },
            'conceptnet': { ok: false, data: [] },
            'secureProxy': { data: { text: JSON.stringify({ nodes: [] }) } }
        }));

        const result = await triangulateConcepts(['seedWord']);
        assert.deepStrictEqual(result.nodes, []);
    });

    await t.test('internal concurrent fetch methods simulate timeout successfully', async () => {
        t.mock.method(global, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
            const urlStr = input.toString();
            if (urlStr.includes('cloudfunctions.net') || urlStr.includes('secureProxy')) {
                return { ok: true, status: 200, json: async () => ({ data: { text: JSON.stringify({ nodes: [] }) } }) };
            }

             return new Promise((resolve, reject) => {
                  if (init?.signal) {
                      init.signal.addEventListener('abort', () => reject(new Error('AbortError')));
                      setTimeout(() => init.signal?.dispatchEvent(new Event('abort')), 10);
                  }
             });
        });

        const result = await triangulateConcepts(['seedWord']);
        assert.deepStrictEqual(result.nodes, []);
    });
});
