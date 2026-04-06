import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getFirebaseEnv } from '../envService.ts';

describe('Firebase Environment Configuration', () => {
  it('getFirebaseEnv retrieves VITE_FIREBASE_ variables from process.env', () => {
    process.env.VITE_FIREBASE_TEST_KEY = 'test-value';
    const value = getFirebaseEnv('TEST_KEY');
    assert.strictEqual(value, 'test-value');
    delete process.env.VITE_FIREBASE_TEST_KEY;
  });

  it('getFirebaseEnv returns empty string if key is not found', () => {
    const value = getFirebaseEnv('NON_EXISTENT_KEY');
    assert.strictEqual(value, '');
  });
});
