import { test, describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import * as envService from '../envService.ts';

// 1. We test the native process.env integration naturally.
describe('envService (Native process.env paths)', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;
    delete process.env.VITE_FIREBASE_TEST_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('handles missing import.meta gracefully for GEMINI_API_KEY', () => {
      process.env.GEMINI_API_KEY = 'proc-gemini';
      assert.strictEqual(envService.getGeminiApiKey(), 'proc-gemini');
  });

  it('handles API_KEY fallback', () => {
      process.env.API_KEY = 'proc-api';
      assert.strictEqual(envService.getGeminiApiKey(), 'proc-api');
  });

  it('handles missing import.meta gracefully for FIREBASE_ENV', () => {
      process.env.VITE_FIREBASE_TEST_KEY = 'proc-firebase';
      assert.strictEqual(envService.getFirebaseEnv('TEST_KEY'), 'proc-firebase');
  });

  it('handles empty fallback', () => {
      assert.strictEqual(envService.getGeminiApiKey(), undefined);
      assert.strictEqual(envService.getFirebaseEnv('MISSING'), '');
  });
});

describe('envService (import.meta mocking via globalThis)', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
        delete process.env.GEMINI_API_KEY;
        delete process.env.API_KEY;
        delete process.env.VITE_FIREBASE_TEST_KEY;
    });

    afterEach(() => {
        process.env = originalEnv;
        delete (globalThis as any).__MOCK_IMPORT_META_ENV;
    });

    it('returns VITE_API_KEY from simulated import.meta.env natively', () => {
        (globalThis as any).__MOCK_IMPORT_META_ENV = { VITE_API_KEY: 'vite-1' };
        assert.strictEqual(envService.getGeminiApiKey(), 'vite-1');
    });

    it('returns GEMINI_API_KEY from simulated import.meta.env natively', () => {
        (globalThis as any).__MOCK_IMPORT_META_ENV = { GEMINI_API_KEY: 'gemini-1' };
        assert.strictEqual(envService.getGeminiApiKey(), 'gemini-1');
    });

    it('returns VITE_FIREBASE_ from simulated import.meta.env natively', () => {
        (globalThis as any).__MOCK_IMPORT_META_ENV = { VITE_FIREBASE_TEST_KEY: 'fb-1' };
        assert.strictEqual(envService.getFirebaseEnv('TEST_KEY'), 'fb-1');
    });
});
