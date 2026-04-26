
+++ContextLock(anchor="SCOS_ARCHITECTURE_AND_STATE", refresh_interval=2048)

# 🧠 SYSTEM STATE: Context.Locker OS

> **Version:** v1.12.4 (Deterministic G2Pv2 State Machines)
> **Focus:** Phase 2 - Local Swarm & Knowledge Vaults
> **Status:** STABLE / CLOUD SYNC ACTIVE (`scos-17fbf`)

## 🔒 CONTEXT LOCK DIRECTIVE
**AI ASSISTANT:** You are bound by the `+++ContextLock` decorator. Before executing any architectural changes, you MUST read this `STATE.md` file to align with the current Sovereign Cognitive OS topology.

## ⚠️ PRESERVATION DIRECTIVE
**DO NOT REMOVE OR SIMPLIFY CODE IN THE FOLLOWING FILES WITHOUT EXPLICIT USER CONSENT.**
The frontend identity schema is FROZEN to ensure compatibility with the upcoming Python Swarm backend.

### 1. Critical Infrastructure (The Core)
| File | Status | Key Responsibilities |
|------|--------|----------------------|
| `services/geminiService.ts` | **COMPLEX** | LLM Interface, Schema Definitions, **Search Grounding (Flash)**, **Conversational Council Logic**. |
| `services/retryService.ts` | **STABLE** | **Exponential Backoff & Rate Limit Handling**. |
| `services/conductorService.ts` | **STABLE** | Transformation engine for Gemini Conductor & Python Swarm artifacts. |
| `types.ts` | **LOCKED** | The Source of Truth. DRP-2025/2026 Protocols, **Epistemic Schema**, **Council Logs**. |
| `services/cryptoService.ts` | **CRITICAL** | Native ECDSA P-256 key generation and signing. |
| `services/wordMapperService.ts`| **STABLE** | Semantic Triangulation & Strategy Prompts. |
| `services/capsuleCompiler.ts` | **STABLE** | HTML Artifact Engine. |

### 2. View Controllers (The Interface)
| File | Status | Features Implemented |
|------|--------|----------------------|
| `views/DashboardView.tsx` | **STABLE** | Command Dashboard & Risk Telemetry. |
| `views/AgentForgeView.tsx` | **COMPLEX** | **Live Council UI**, **Streaming Logs**, **Defensive Rendering**, **Clean Signature**. |
| `views/CollaboratorView.tsx`| **NEW** | **Sovereign Co-Mind**, Context-Aware Chat over Vault Assets. |
| `views/PromptForgeView.tsx` | **STABLE** | **WIP Persistence**, Meta-Prompt Engine, DRP/PRP/SSP Generators. |
| `views/PromptLibraryView.tsx`| **STABLE** | **Sovereign Pluriversal Prompt Library**, Categorization, Agent Linking. |
| `views/ContractBuilderView.tsx`| **NEW** | **Cognitive Contracts**, Project Anchors (Goals/Constraints), Agent Assignment. |
| `views/CapsuleLabView.tsx` | **COMPLEX** | **Vault, Gateway Sim, Distillation**. Switched to Flash-3 for stability. |
| `views/WordMapperView.tsx` | **STABLE** | Semantic Constellation Mapping, **Token Costs**. |
| `views/AgentLibraryView.tsx` | **STABLE** | **Clean JSON Export**, Search, Filtering, Stats. |
| `views/PublicGatewayView.tsx`| **NEW** | **Public Context.Locker Shell**, Random Capsule Loader, Login Gateway. |
| `components/ManifestDisplay.tsx` | **STABLE** | **Clean JSON Export**, Matrix Visualization. |

---

## 🎯 Strategic Alignment (`USERINTENT.md`)

The system is now aligning with the **Context.Locker** vision.
*   **Current Layer:** Sovereign Cognitive OS (Forge, Mapper, **Co-Mind**, **Capsule Vault**, **Prompt Forge**, **Contracts**, **Council**, **Public Gateway**).
*   **Next Layer:** Local Sovereign Swarm (Runtime Execution).
*   **Future Layer:** Context.Locker Public Gateway (Simulated in `CapsuleLabView`, Implemented in `PublicGatewayView`).

## 📝 Recent Changelog
*   **G2Pv2 State Machine Integration:** Replaced stochastic "Planner-Coder" loops with the 9-Persona Flow (P0-P8). Routing is now physically anchored to the filesystem via Existence-Based Routing and Provenance Hashing.
*   **PDL v1.0 & Chrono-RAG:** Implemented Cognitive Bytecode decorators (`+++DCCDSchemaGuard`, `+++ContextLock`, `+++AdjectivalBound`) and the Petzold Sequence (SYNDICATE, EMBED, UPDATE, PRUNE) to remediate Chronological Saponification.
*   **Epistemic Matrix Update:** Refactored the Agent Forge Council to align with the 5D topological tensor model ($E = \langle G, G^-, C, T, H \rangle$). Council members are now: STRATEGIST, IMMUNOLOGIST, LINGUIST, ENGINEER, and HISTORIAN.
*   **Context Lock Implementation:** Added `+++ContextLock` directive to `STATE.md` to ensure AI assistants maintain architectural continuity across sessions.
*   **Public Gateway Integration:** Created `PublicGatewayView.tsx` to replicate the "Context.Locker" site shell. It loads random capsules from the local vault for unauthenticated users.
*   **Auth Routing:** Updated `App.tsx` to show the Public Gateway by default. Logging in via the new header button reveals the Sovereign Agent Forge.
*   **Prompt Forge Persistence:** Implemented local state preservation (`ENGINES_WIP_KEY`) in `PromptForgeView.tsx` to prevent data loss of custom system prompts during refresh. Added explicit visual feedback for "Save Template".
*   **Live Council Visualization:** Upgraded `AgentForgeView` to display real-time, streaming deliberations from Council members. Added dynamic status indicators (e.g., "DISCOVERING", "CHAIRING") for better immersion.
*   **Conversational Protocol:** Refined `geminiService.ts` system instructions to enforce a "Boardroom" narrative flow where Council members address the Chair directly.
*   **Search Grounding:** Integrated `googleSearch` tool with `gemini-3-flash-preview` in `researchTopic` and `createDiscoveryChat` for rapid, up-to-date information retrieval.
*   **Defensive Rendering:** Patched `AgentForgeView.tsx` with optional chaining (`?.`) on all Council Log arrays to prevent crashes on legacy data.
*   **Clean Export Architecture:** Decoupled the **Council Log** from the **Identity Manifest**.
    *   **Signing:** The system now signs a "clean" manifest payload (excluding logs).
    *   **Storage:** The logs are re-attached locally for UI display.
    *   **Export:** JSON exports now strip the `councilLog` to ensure the artifact is pure identity data.
*   **Cognitive Contracts:** Implemented `ContractBuilderView` to define projects, goals, constraints, and assign Agent swarms.
*   **Sovereign Co-Mind:** Implemented `CollaboratorView` (Co-Mind), a dedicated workspace where the AI has full visibility into the User's Vault.

*   **Manifest Architecture:** Integrated AXIOM v1.0, the Sovereign Syntactician, setting the new baseline for DCCD-based Agentic Manifests and Semantic Drift reduction (`+++SemanticDriftMonitor`).
*   **LSP Architecture:** Integrated VANCE v1.0, the Topological LSP Architect, establishing the new baseline for CFRSG-based semantic indexing and schema-validated JSON-RPC execution.
