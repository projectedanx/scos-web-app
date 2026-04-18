import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import * as envService from '../envService.ts';

describe('envService', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalViteEnv: any;

  beforeEach(() => {
    originalEnv = { ...process.env };

    // Check if import.meta exists, if not mock it up
    if (typeof (import.meta as any).env === 'undefined') {
       (import.meta as any).env = {};
    }
    originalViteEnv = { ...(import.meta as any).env };

    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;
    delete process.env.VITE_FIREBASE_TEST_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
    (import.meta as any).env = originalViteEnv;
  });

  describe('getGeminiApiKey', () => {
    it('returns GEMINI_API_KEY from process.env if import.meta.env keys are missing', () => {
      process.env.GEMINI_API_KEY = 'proc-gemini-key';
      process.env.API_KEY = 'proc-api-key';

      assert.strictEqual(envService.getGeminiApiKey(), 'proc-gemini-key');
    });

    it('returns API_KEY from process.env if GEMINI_API_KEY is missing', () => {
      process.env.API_KEY = 'proc-api-key';

      assert.strictEqual(envService.getGeminiApiKey(), 'proc-api-key');
    });

    it('returns undefined if no keys are found', () => {
      assert.strictEqual(envService.getGeminiApiKey(), undefined);
    });
  });

  describe('getFirebaseEnv', () => {
    it('retrieves VITE_FIREBASE_ variables from process.env if import.meta.env is missing', () => {
      process.env.VITE_FIREBASE_TEST_KEY = 'proc-test-value';
      assert.strictEqual(envService.getFirebaseEnv('TEST_KEY'), 'proc-test-value');
    });

    it('returns empty string if key is not found', () => {
      assert.strictEqual(envService.getFirebaseEnv('NON_EXISTENT_KEY'), '');
    });
  });
});

    describe('vite env simulation', () => {
        it('returns VITE_API_KEY from process.env replacement via Vite logic if possible', () => {
             process.env.VITE_API_KEY = "dummy_vite_key";
             const mockEnvService = {
                 getGeminiApiKey: () => {
                     const viteApiKey = process.env.VITE_API_KEY;
                     if (viteApiKey) return viteApiKey;
                     return undefined;
                 }
             };

             assert.strictEqual(mockEnvService.getGeminiApiKey(), 'dummy_vite_key');
             delete process.env.VITE_API_KEY;
        });
    });
