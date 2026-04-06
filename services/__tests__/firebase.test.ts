// Set up environment BEFORE importing the module to bypass `firebase/auth` initialization errors
process.env.VITE_FIREBASE_API_KEY = "test"; // a dummy valid key for initialization

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isFirebaseConfigured, firebaseConfig } from '../firebase';

describe('isFirebaseConfigured', () => {
    it('returns true when valid key is provided', () => {
        firebaseConfig.apiKey = "AIzaSyValidKeyThatIsNotPlaceholder";
        assert.strictEqual(isFirebaseConfigured(), true);
    });

    it('returns false when key is placeholder', () => {
        firebaseConfig.apiKey = "AIzaSy...";
        assert.strictEqual(isFirebaseConfigured(), false);
    });

    it('returns false when key is empty', () => {
        firebaseConfig.apiKey = "";
        assert.strictEqual(isFirebaseConfigured(), false);
    });

    it('returns false when key is undefined', () => {
        // use any to bypass typescript type checking for test
        firebaseConfig.apiKey = undefined as any;
        assert.strictEqual(isFirebaseConfigured(), false);
    });
});
