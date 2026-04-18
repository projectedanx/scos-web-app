import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import * as firestoreService from '../firestoreService.ts';

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

            await assert.rejects(
                async () => firestoreService.saveAgentToCloud('', agent),
                (err: any) => {
                    assert.ok(err.message.includes('users//manifests/test-agent') || err.message.includes('write') || err.message.includes('Invalid collection reference') || err.message.includes('Expected first argument to collection() to be a CollectionReference'));
                    return true;
                }
            );

            assert.strictEqual((console.error as any).mock.calls.length, 1);
            assert.strictEqual((global.window.dispatchEvent as any).mock.calls.length, 1);

            const dispatchedEvent = (global.window.dispatchEvent as any).mock.calls[0].arguments[0];
            assert.strictEqual(dispatchedEvent.type, 'firestore-error');
        });
    });

    describe('batch operations boundary tests', () => {
        it('batchSaveAgentsToCloud handles empty array boundary correctly without throwing', async () => {
            await assert.doesNotReject(firestoreService.batchSaveAgentsToCloud('test-uid', []));
            assert.strictEqual((console.error as any).mock.calls.length, 0);
        });

        it('batchSaveAgentsToCloud handles invalid inputs natively bubbling', async () => {
            await assert.rejects(
                async () => firestoreService.batchSaveAgentsToCloud('', [{ identity: { name: "test" } }] as any),
                (err: any) => { return true; }
            );
        });

        it('batchSaveCapsulesToCloud handles empty array boundary correctly without throwing', async () => {
            await assert.doesNotReject(firestoreService.batchSaveCapsulesToCloud('test-uid', []));
            assert.strictEqual((console.error as any).mock.calls.length, 0);
        });

        it('batchSaveCapsulesToCloud handles invalid inputs natively bubbling', async () => {
            await assert.rejects(
                async () => firestoreService.batchSaveCapsulesToCloud('', [{ meta: { id: "test" } }] as any),
                (err: any) => { return true; }
            );
        });

        it('batchSavePromptsToCloud handles empty array boundary correctly without throwing', async () => {
            await assert.doesNotReject(firestoreService.batchSavePromptsToCloud('test-uid', []));
            assert.strictEqual((console.error as any).mock.calls.length, 0);
        });

        it('batchSavePromptsToCloud handles invalid inputs natively bubbling', async () => {
            await assert.rejects(
                async () => firestoreService.batchSavePromptsToCloud('', [{ id: "test" }] as any),
                (err: any) => { return true; }
            );
        });

        it('batchSaveContractsToCloud handles empty array boundary correctly without throwing', async () => {
            await assert.doesNotReject(firestoreService.batchSaveContractsToCloud('test-uid', []));
            assert.strictEqual((console.error as any).mock.calls.length, 0);
        });

        it('batchSaveContractsToCloud handles invalid inputs natively bubbling', async () => {
            await assert.rejects(
                async () => firestoreService.batchSaveContractsToCloud('', [{ id: "test" }] as any),
                (err: any) => { return true; }
            );
        });

        it('batchSaveProvenanceToCloud handles empty array boundary correctly without throwing', async () => {
            await assert.doesNotReject(firestoreService.batchSaveProvenanceToCloud('test-uid', []));
            assert.strictEqual((console.error as any).mock.calls.length, 0);
        });

        it('batchSaveProvenanceToCloud handles invalid inputs natively bubbling', async () => {
            await assert.rejects(
                async () => firestoreService.batchSaveProvenanceToCloud('', [{ hash: "test" }] as any),
                (err: any) => { return true; }
            );
        });
    });

    describe('syncAgents', () => {
        it('handles native firestore error via snapshot callback safely', () => {
            assert.throws(
                () => firestoreService.syncAgents('', () => {}),
                (err: any) => {
                    assert.ok(err.message.includes('Cannot use \'in\' operator') || err.message.includes('Invalid collection reference') || err.message.includes('Expected first argument to collection() to be a CollectionReference'));
                    return true;
                }
            );
        });
    });
});
