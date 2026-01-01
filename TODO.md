# 📝 Implementation Roadmap

## Phase 1: Foundation (Firebase Setup)
- [ ] **Initialize Project:** Create Project in Firebase Console.
- [ ] **Config:** Add `firebaseConfig` to `src/services/firebase.ts`.
- [ ] **Auth Wrapper:** Create `AuthProvider.tsx` context to handle Login/Logout and loading states.
- [ ] **Profile Sync:** Create logic to upload the local "Commander Public Key" to Firestore upon first login.
- [ ] **Migration Script:** Create a utility to read `localStorage` ("The Vault") and batch-write existing agents to Firestore `users/{uid}/manifests`.

## Phase 2: The Secure Proxy (Cloud Functions)
- [ ] **Environment:** Set up `functions/` directory (TypeScript).
- [ ] **Secrets:** Store `GEMINI_API_KEY` in Google Cloud Secret Manager.
- [ ] **Port Logic:** Move `fabricateAgent` and `researchTopic` from `geminiService.ts` to a generic `onCall` Cloud Function.
- [ ] **Update Frontend:** Update `geminiService.ts` to call `httpsCallable` instead of using the direct SDK.

## Phase 3: The Python Swarm Uplink (`scos-core`)
This is the creation of the Python runner that executes the agents designed in the web app.

### A. Python Package Structure
- [ ] Create `swarm/` directory.
- [ ] `requirements.txt`: `firebase-admin`, `google-generativeai`, `pydantic`.
- [ ] `main.py`: The bootloader.

### B. Manifest Hydrator (Logic)
- [ ] Write `ManifestLoader` class:
    -   Connects to Firestore.
    -   Downloads JSON manifest.
    -   **Crucial:** Verifies the `provenance.signature` using the stored Public Key to ensure the agent hasn't been tampered with.

### C. Tool Mapping System
- [ ] Create a `@tool` decorator in Python.
- [ ] Write logic that maps the JSON `tools[].name` to decorated Python functions.
    *   *Example:* If Manifest has tool `web_search`, Python must have a function `@tool("web_search")` registered.
- [ ] Implement a "Safe Executor" that checks the `riskLevel` from the JSON before running the Python function.

### D. The Loop
- [ ] Implement a Firestore Snapshot Listener in Python on the `swarm_queue` collection.
- [ ] When a new doc appears:
    1.  Lock the doc.
    2.  Run the Agent Loop (Thought -> Tool -> Observation).
    3.  Update the doc with the Result.

## Phase 4: Frontend "Live Link"
- [ ] **Live Status:** Update `AgentForgeView` to show if a Python Swarm node is currently "Online" (connected to Firestore).
- [ ] **Remote Execute:** Add a "Run in Swarm" button to the UI that pushes a job to `swarm_queue`.
- [ ] **Terminal Stream:** Create a real-time log viewer in the web UI that streams stdout from the Python script via Firestore.

## Phase 5: The "Capsule" Market
- [ ] Update `CapsuleLabView` to save capsules to a public `capsules` collection.
- [ ] Add a "Browse" view to download capsules created by other Architects.
