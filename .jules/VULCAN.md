## VULCAN — Architecture Isolation & Swarm Ledger

**Learning:** The previous implementation treated the Firestore database as a shared state pool, granting direct physical table mutations to both the React UI and the asynchronous Swarm Worker. This topological setup is prone to race conditions, poison pills, and structural breakage.

**Action:** Mapped out an Event Sourced topology, decoupling the domains. `TaskRequested` events will serve as the sole communication medium, shifting physical table couplings into API-led integration. The ADR, C4 models, and DDD map were consolidated into `docs/VULCAN_ARCHITECTURAL_BLUEPRINT.md`.
