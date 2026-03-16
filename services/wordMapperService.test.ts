import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the external GenAI module using vitest's hoisting
vi.mock('@google/genai', () => {
  const mockGenerateContent = vi.fn();
  return {
    GoogleGenAI: class MockGoogleGenAI {
      models = {
        generateContent: mockGenerateContent
      }
    },
    Type: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING' },
    Schema: {},
    __mockGenerateContent: mockGenerateContent // Export it to use in tests
  };
});

// Mock retryService so we don't wait for actual retries
vi.mock('./retryService', () => {
  return {
    executeWithRetry: async (fn: any, options: any) => {
      try {
        return await fn();
      } catch (error) {
        if (options && options.fallback !== undefined) {
          return typeof options.fallback === 'function' ? options.fallback() : options.fallback;
        }
        throw error;
      }
    }
  };
});

import { triangulateConcepts, MapStrategy, fetchWikipediaDefinition } from './wordMapperService';
import * as genai from '@google/genai';

// Retrieve the mock
const mockGenerateContent = (genai as any).__mockGenerateContent;

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234'
});

describe('wordMapperService', () => {
  let globalFetch: typeof fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    globalFetch = global.fetch;
    global.fetch = vi.fn();

    // Silence console warnings and errors for clean test output
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = globalFetch;
    vi.restoreAllMocks();
  });

  describe('triangulateConcepts', () => {
    it('should successfully map concepts using default strategy', async () => {
      // Mock Datamuse response
      const mockDatamuseResponse = [
        { word: 'apple', score: 100 },
        { word: 'fruit', score: 90 }
      ];

      // Mock ConceptNet response
      const mockConceptNetResponse = {
        edges: [
          { weight: 2.0, start: { language: 'en' }, end: { language: 'en', label: 'tree' } }
        ]
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('datamuse')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockDatamuseResponse)
          });
        }
        if (url.includes('conceptnet')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockConceptNetResponse)
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const mockGenAIResponse = {
        text: JSON.stringify({
          nodes: [
            {
              concept: 'apple',
              type: 'SEED',
              dimension: 'SENSORY',
              definition: 'A fruit.'
            }
          ]
        }),
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 20,
          totalTokenCount: 30
        }
      };

      mockGenerateContent.mockResolvedValue(mockGenAIResponse);

      const result = await triangulateConcepts(['apple'], MapStrategy.GENERAL);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);

      // Check if prompt correctly includes the seed and raw associations
      const generateContentArgs = mockGenerateContent.mock.calls[0][0];
      expect(generateContentArgs.contents).toContain('SEED: "apple"');
      expect(generateContentArgs.contents).toContain('apple');
      expect(generateContentArgs.contents).toContain('tree');
      expect(generateContentArgs.contents).toContain('TASKS:'); // Part of GENERAL strategy prompt

      expect(result).toEqual({
        nodes: [
          {
            concept: 'apple',
            type: 'SEED',
            dimension: 'SENSORY',
            definition: 'A fruit.',
            id: 'test-uuid-1234'
          }
        ],
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30
        }
      });
    });

    it('should handle Datamuse API failure gracefully (timeout from retries)', async () => {
      // Mock Datamuse failure
      const mockConceptNetResponse = {
        edges: [
          { weight: 2.0, start: { language: 'en' }, end: { language: 'en', label: 'tree' } }
        ]
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('datamuse')) {
          return Promise.reject(new Error('fetch failed'));
        }
        if (url.includes('conceptnet')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockConceptNetResponse)
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const mockGenAIResponse = {
        text: JSON.stringify({
          nodes: [
            {
              concept: 'tree',
              type: 'SEED',
              dimension: 'SENSORY',
              definition: 'A tall plant.'
            }
          ]
        })
      };

      mockGenerateContent.mockResolvedValue(mockGenAIResponse);

      await triangulateConcepts(['apple']);

      const generateContentArgs = mockGenerateContent.mock.calls[0][0];
      expect(generateContentArgs.contents).toContain('RAW ASSOCIATIONS: tree');
      expect(console.warn).toHaveBeenCalledWith('Datamuse failed', expect.anything());
    });

    it('should handle Datamuse not ok gracefully', async () => {
      // Mock Datamuse failure
      const mockConceptNetResponse = {
        edges: [
          { weight: 2.0, start: { language: 'en' }, end: { language: 'en', label: 'tree' } }
        ]
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('datamuse')) {
          return Promise.resolve({
            ok: false,
            status: 500
          });
        }
        if (url.includes('conceptnet')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockConceptNetResponse)
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const mockGenAIResponse = {
        text: JSON.stringify({
          nodes: [
            {
              concept: 'tree',
              type: 'SEED',
              dimension: 'SENSORY',
              definition: 'A tall plant.'
            }
          ]
        })
      };

      mockGenerateContent.mockResolvedValue(mockGenAIResponse);

      await triangulateConcepts(['apple']);

      const generateContentArgs = mockGenerateContent.mock.calls[0][0];
      expect(generateContentArgs.contents).toContain('RAW ASSOCIATIONS: tree');
      // fetch returns ok:false, which returns [], it does not throw an error in fetchDatamuse
    });

    it('should handle ConceptNet API timeout/failure gracefully', async () => {
      const mockDatamuseResponse = [
        { word: 'apple', score: 100 }
      ];

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('datamuse')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockDatamuseResponse)
          });
        }
        if (url.includes('conceptnet')) {
          return Promise.reject(new Error('fetch failed'));
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const mockGenAIResponse = {
        text: JSON.stringify({
          nodes: [
            {
              concept: 'apple',
              type: 'SEED',
              dimension: 'SENSORY',
              definition: 'A fruit.'
            }
          ]
        })
      };

      mockGenerateContent.mockResolvedValue(mockGenAIResponse);

      await triangulateConcepts(['apple']);

      const generateContentArgs = mockGenerateContent.mock.calls[0][0];
      expect(generateContentArgs.contents).toContain('RAW ASSOCIATIONS: apple');
      // ConceptNet retries multiple times, testing that the fallback empty array is used correctly
    });

    it('should filter out irrelevant ConceptNet edges', async () => {
      const mockDatamuseResponse: any[] = [];
      const mockConceptNetResponse = {
        edges: [
          // valid
          { weight: 2.0, start: { language: 'en' }, end: { language: 'en', label: 'tree' } },
          // invalid weight
          { weight: 0.5, start: { language: 'en' }, end: { language: 'en', label: 'grass' } },
          // invalid start language
          { weight: 2.0, start: { language: 'fr' }, end: { language: 'en', label: 'arbre' } },
          // invalid end language
          { weight: 2.0, start: { language: 'en' }, end: { language: 'fr', label: 'pomme' } },
          // self-referential
          { weight: 2.0, start: { language: 'en' }, end: { language: 'en', label: 'apple' } }
        ]
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('datamuse')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockDatamuseResponse) });
        }
        if (url.includes('conceptnet')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockConceptNetResponse) });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      mockGenerateContent.mockResolvedValue({ text: '{"nodes":[]}' });

      await triangulateConcepts(['apple']);
      const generateContentArgs = mockGenerateContent.mock.calls[0][0];
      expect(generateContentArgs.contents).toContain('RAW ASSOCIATIONS: tree');
      expect(generateContentArgs.contents).not.toContain('grass');
      expect(generateContentArgs.contents).not.toContain('arbre');
      expect(generateContentArgs.contents).not.toContain('pomme');
      // The self-referential node should be filtered out from raw associations
    });

    it('should use different strategy prompts correctly', async () => {
      (global.fetch as any).mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
      mockGenerateContent.mockResolvedValue({ text: '{"nodes":[]}' });

      await triangulateConcepts(['apple'], MapStrategy.WORLDVIEW);

      const generateContentArgs = mockGenerateContent.mock.calls[0][0];
      expect(generateContentArgs.contents).toContain('MISSION: WORLDVIEW CAPSULE GENERATOR');
    });

    it('should handle missing JSON gracefully from GenAI', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]) // Empty results for APIs
      });

      mockGenerateContent.mockResolvedValue({
        text: '', // Empty text
        usageMetadata: null
      });

      const result = await triangulateConcepts(['apple']);

      expect(result.nodes).toEqual([]);
      expect(result.usage).toEqual({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
    });

    it('should throw an error if GenAI generation throws', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      mockGenerateContent.mockRejectedValue(new Error('GenAI Error'));

      await expect(triangulateConcepts(['apple'])).rejects.toThrow('Failed to map concepts.');
      expect(console.error).toHaveBeenCalledWith('Triangulation failed', expect.anything());
    });
  });

  describe('fetchWikipediaDefinition', () => {
    it('should return the definition if page is found', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          query: {
            pages: {
              '123': { extract: 'An apple is a sweet, edible fruit.' }
            }
          }
        })
      });

      const result = await fetchWikipediaDefinition('apple');
      expect(result).toBe('An apple is a sweet, edible fruit.');
    });

    it('should return null if page is not found (pageId -1)', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          query: {
            pages: {
              '-1': { extract: 'Not found' }
            }
          }
        })
      });

      const result = await fetchWikipediaDefinition('apple');
      expect(result).toBeNull();
    });

    it('should return null if query.pages is undefined', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          query: {}
        })
      });

      const result = await fetchWikipediaDefinition('apple');
      expect(result).toBeNull();
    });

    it('should return null on fetch error', async () => {
      (global.fetch as any).mockRejectedValue(new Error('fetch failed'));

      const result = await fetchWikipediaDefinition('apple');
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('Wikipedia failed', expect.anything());
    });
  });
});
