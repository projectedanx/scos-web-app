import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import * as firestoreService from '../firestoreService.ts';

// In Node.js built-in test runner, mocking module exports that are destructured or used directly
// is hard without experimental loaders. Since firestoreService relies on Firebase, and we want to
// assert `handleFirestoreError` logic, we can verify that native errors triggered by invalid arguments
// bubble up through `handleFirestoreError`.

describe('firestoreService', () => {

    beforeEach(() => {
        mock.restoreAll();

        // Mock window object for error handling
        global.window = {
            dispatchEvent: mock.fn()
        } as any;

        // Suppress console.error
        mock.method(console, 'error', () => {});
    });

    describe('saveAgentToCloud', () => {
        it('handles save error properly and triggers handleFirestoreError', async () => {
            const agent = {
                id: 'test-agent-id',
                identity: { name: 'Test Agent' },
            } as any;

            try {
                // By providing an empty UID, the getCollectionRef internally fails during doc construction
                await firestoreService.saveAgentToCloud('', agent);
                assert.fail('Should have thrown an error');
            } catch (err: any) {
                // Firebase paths validation handles this by asserting invalid references
                assert.ok(err.message.includes('users//manifests/test-agent') || err.message.includes('write') || err.message.includes('Invalid collection reference') || err.message.includes('Expected first argument to collection() to be a CollectionReference'), `Expected err.message to mention invalid collection reference, got: ${err.message}`);
            }

            assert.strictEqual((console.error as any).mock.calls.length, 1);
            assert.strictEqual((global.window.dispatchEvent as any).mock.calls.length, 1);

            const dispatchedEvent = (global.window.dispatchEvent as any).mock.calls[0].arguments[0];
            assert.strictEqual(dispatchedEvent.type, 'firestore-error');
        });
    });

    describe('batchSaveAgentsToCloud', () => {
        it('handles empty array boundary correctly without throwing', async () => {
            await assert.doesNotReject(firestoreService.batchSaveAgentsToCloud('test-uid', []));
            assert.strictEqual((console.error as any).mock.calls.length, 0);
        });
    });

    describe('batchSaveCapsulesToCloud', () => {
        it('handles empty array boundary correctly without throwing', async () => {
            await assert.doesNotReject(firestoreService.batchSaveCapsulesToCloud('test-uid', []));
            assert.strictEqual((console.error as any).mock.calls.length, 0);
        });
    });

    describe('batchSavePromptsToCloud', () => {
        it('handles empty array boundary correctly without throwing', async () => {
            await assert.doesNotReject(firestoreService.batchSavePromptsToCloud('test-uid', []));
            assert.strictEqual((console.error as any).mock.calls.length, 0);
        });
    });

    describe('batchSaveContractsToCloud', () => {
        it('handles empty array boundary correctly without throwing', async () => {
            await assert.doesNotReject(firestoreService.batchSaveContractsToCloud('test-uid', []));
            assert.strictEqual((console.error as any).mock.calls.length, 0);
        });
    });

    describe('batchSaveProvenanceToCloud', () => {
        it('handles empty array boundary correctly without throwing', async () => {
            await assert.doesNotReject(firestoreService.batchSaveProvenanceToCloud('test-uid', []));
            assert.strictEqual((console.error as any).mock.calls.length, 0);
        });
    });

    describe('syncAgents', () => {
        it('handles native firestore error via snapshot callback safely', () => {
            try {
                firestoreService.syncAgents('', () => {});
                assert.fail('Should have thrown an error');
            } catch (err: any) {
                assert.ok(err.message.includes('Invalid collection reference') || err.message.includes('Expected first argument to collection() to be a CollectionReference'), `Expected err.message to mention invalid collection reference, got: ${err.message}`);
            }
        });
    });
});
