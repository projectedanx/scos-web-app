import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import * as firestoreService from '../firestoreService.ts';
import * as firestore from 'firebase/firestore';

describe('firestoreService', () => {
    describe('saveAgentToCloud', () => {
        beforeEach(() => {
            mock.restoreAll();

            // Mock window object for error handling
            global.window = {
                dispatchEvent: mock.fn()
            } as any;

            // Suppress console.error
            mock.method(console, 'error', () => {});
        });

        it('handles save error properly and triggers handleFirestoreError', async () => {
            const agent = {
                id: 'test-agent-id',
                identity: { name: 'Test Agent' },
            } as any;

            try {
                // If we pass an empty uid, getCollectionRef() will create a reference like 'users//manifests'
                // This has an even number of segments, which firestore forbids for a collection.
                // This reliably throws a native error from firestore, testing our error handling wrapper
                await firestoreService.saveAgentToCloud('', agent);
                assert.fail('Should have thrown an error');
            } catch (err: any) {
                // handleFirestoreError JSON-stringifies the error payload
                // Actual implementation in firestoreService.ts calls handleFirestoreError:
                // handleFirestoreError(error, OperationType.WRITE, `users/${uid}/manifests/${agentId}`);
                assert.ok(err.message.includes('users//manifests/test-agent') || err.message.includes('write'), `Expected err.message to include write info, got: ${err.message}`);
                assert.ok(err.message.includes('Invalid collection reference'), `Expected err.message to mention invalid collection reference, got: ${err.message}`);
            }

            // Verify our error handler mechanism was invoked exactly as expected
            assert.strictEqual((console.error as any).mock.calls.length, 1);
            assert.strictEqual((global.window.dispatchEvent as any).mock.calls.length, 1);

            const dispatchedEvent = (global.window.dispatchEvent as any).mock.calls[0].arguments[0];
            assert.strictEqual(dispatchedEvent.type, 'firestore-error');
        });
    });
});
