1. Add boundary interrogation tests for `firestoreService.ts` to improve coverage on batch operations and handleFirestoreError bubbles (lines 330-406 roughly, batch saving functions error handling).
   - Mock Firebase `writeBatch()` to throw errors to verify `.catch()` block executions for `batchSaveCapsulesToCloud`, `batchSavePromptsToCloud`, `batchSaveContractsToCloud`, `batchSaveProvenanceToCloud`, and `batchSaveAgentsToCloud`.
2. Add test coverage for missing lines in `geminiService.ts` related to error handling in `distillCapsule` (lines ~1214-1220) and `generateMetaPrompt` (lines ~1270-1272)
   - Ensure the error bubbling is verified correctly via test failure expectations.
3. Complete pre commit steps to make sure proper testing, verifications, reviews and reflections are done.
4. Clean up `temp_test.js` if necessary and submit the change.
