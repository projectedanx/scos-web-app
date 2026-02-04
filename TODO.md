
# 📝 Implementation Roadmap

## Phase 1: Foundation (Firebase Setup)
- [x] **Initialize Project:** Create Project in Firebase Console.
- [x] **Config:** Add `firebaseConfig` to `src/services/firebase.ts`.
- [x] **Auth Wrapper:** Create `AuthProvider.tsx` context to handle Login/Logout and loading states.
- [x] **Profile Sync:** Create logic to upload the local "Commander Public Key" to Firestore upon first login.
- [x] **Migration Script:** (Done via `App.tsx` Legacy Migration Utility).

## Phase 1.5: Semantic Cartography (Completed)
- [x] **Tactical Engine:** Implement `WordMapperService` with specialized prompting strategies.
- [x] **External APIs:** Integrate Datamuse and ConceptNet for non-LLM grounding.
- [x] **Visualization:** Build `WordMapperView` with dimensional filtering and interactive nodes.
- [x] **Provenance:** Connect Word Mapper exports to the Registry (`ProvenanceIndex`).

## Phase 1.6: Metacognition & Economics (Completed)
- [x] **Internal Tools Schema:** Update manifest to support `internalTools` (metacognition).
- [x] **Budgeting Logic:** Implement `BudgetConfig` and Drift Allowance calculations.
- [x] **Visualization:** Update `ManifestDisplay` to show Metacognition and Budget bars.
- [x] **Spec Export:** Implement Markdown generator for human-readable agent specs.

## Phase 1.9: Epistemic Matrix & Telemetry (Completed)
- [x] **Schema Upgrade:** Implement DRP-2026 (`epistemicMatrix`, `cognitiveProtocol`).
- [x] **Token Telemetry:** Track and display token usage in all generative views.
- [x] **Goal Hierarchy:** UI for Primary Goals vs Anti-Goals.

## Phase 1.9.5: Prompt Engineering (Completed)
- [x] **Prompt Forge:** Create `PromptForgeView` with meta-prompt engines (DRP, PRP, etc.).
- [x] **Prompt Library:** Create `PromptLibraryView` for saving and organizing prompts.
- [x] **Agent Linking:** Allow linking specific prompts to agents in the library.

## Phase 1.9.7: System Resilience (Completed)
- [x] **Retry Service:** Implement `executeWithRetry` with exponential backoff.
- [x] **Integration:** Wrap Gemini, Datamuse, and ConceptNet calls with retry logic.
- [x] **Error Handling:** Graceful fallback for non-critical analysis features.

## Phase 2: The Secure Proxy & Conductor Bridge
- [ ] **Environment:** Set up `functions/` directory (TypeScript).
- [ ] **Secrets:** Store `GEMINI_API_KEY` in Google Cloud Secret Manager.
- [ ] **Conductor Schema Check:** Validate that `SovereignAgentManifest` maps correctly to Conductor's tool definitions.
- [ ] **Skill Transformer:** Write a utility to export `sovereign-agent-[name].json` as a Gemini Skill folder structure (`ConductorExportModal`).

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
    -   **Enforcement:** Validate that the runtime environment (swarm) respects the `tokenBudget` and `driftAllowance` defined in the manifest.

### C. Tool Mapping System
- [ ] Create a `@tool` decorator in Python.
- [ ] Write logic that maps the JSON `tools[].name` to decorated Python functions.
- [ ] **Internal Loop:** Implement logic to execute `internalTools` (metacognition) *before* external tools if triggers are met.

### D. The Loop
- [ ] Implement a Firestore Snapshot Listener in Python on the `swarm_queue` collection.
- [ ] When a new doc appears:
    1.  Lock the doc.
    2.  Run the Agent Loop (Think -> Write -> Code).
    3.  Update the doc with the Result.

## Phase 4: Frontend "Live Link"
- [ ] **Live Status:** Update `AgentForgeView` to show if a Python Swarm node is currently "Online".
- [ ] **Remote Execute:** Add a "Run in Swarm" button to the UI.
- [ ] **Terminal Stream:** Create a real-time log viewer in the web UI.
