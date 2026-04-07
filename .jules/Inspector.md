## Inspector — Firestore Error Handling Tests
**Edge Case:** saveAgentToCloud missing test coverage for Firebase firestore rejection/errors
**Assertion:** Pass invalid `uid` empty string into getCollectionRef which forces a native `Invalid collection reference` Firebase error. Then assert that `handleFirestoreError` intercepts the failure, emits `firestore-error` window event, logs to console, and constructs a JSON error payload containing context path.
