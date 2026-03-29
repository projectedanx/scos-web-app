Learning: Discovered `services/firestoreService.ts` implements a multi-tenant NoSQL structure where `users/{uid}` serves as the root document for five sub-collections: `manifests`, `capsules`, `prompts`, `contracts`, and `provenance`.
Action: Proceeding to map Firestore schema topography as an `erDiagram` and the Cloud Sync flow as a `sequenceDiagram` into `ARCHITECTURE.md`.
