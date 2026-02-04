
# ⚡ System Updates Log

## v1.9.7: Resilience & The Prompt Forge (Current)
**Focus:** Reliability, Prompt Engineering, and Asset Management.

### 🛡️ System Resilience
*   **Sovereign Retry System:** Implemented a global retry service with exponential backoff.
*   **Failure Mitigation:** The system now gracefully handles `429 Too Many Requests` and `5xx` errors across:
    *   Deep Research Loops (Gemini)
    *   Semantic Mapping (Datamuse/ConceptNet)
    *   Capsule Distillation

### 🧪 Prompt Engineering Suite
*   **Prompt Forge:** A new dedicated module for generating high-fidelity system prompts.
    *   **Engines:** Deep Research (DRP), Product Requirements (PRP), Sovereign System (SSP), and more.
    *   **Grounding:** Upload knowledge context to anchor prompt generation.
*   **Prompt Library:** A persistent "Memory Layer" for prompts.
    *   **Organization:** Categories, Subcategories, and Semantic Tags.
    *   **Agent Linkage:** Bind specific prompts to Sovereign Agents in the Vault.

---

## v1.9.0: The Epistemic Matrix
**Focus:** DRP-2026 Framework Adoption & Cognitive Architecture.

### 🧠 Major Architectural Shift
*   **Epistemic Matrix ($G, $O, $C, $T):** 
    *   Agents are no longer defined by simple prompts. They are defined by a 4-dimensional vector space.
    *   **Goal Architecture ($G):** Explicit separation of Primary Goals (Invariants) and Anti-Goals (Refusals).
    *   **Output Fidelity ($O):** Strict schema enforcement.
*   **Cognitive Protocols:**
    *   Implemented the **Think $\rightarrow$ Write $\rightarrow$ Code** loop within the manifest.
    *   Added `ThinkingBudget` to control the depth of reasoning in Phase 1.
*   **UI Enhancements:**
    *   New `ManifestDisplay` visualizes the Matrix and Cognitive Loop.
    *   **Token Telemetry:** Added `TokenUsage` tracking (Prompt/Completion/Total) to Forge, Capsule Lab, and Mapper.

---

## v1.8.0: The Conductor Bridge
**Focus:** Interoperability and Swarm Execution.

*   **Export to Swarm:** Added `ConductorExportModal` to generate:
    *   `manifest.json` (Conductor/MCP compatible).
    *   `agent_node.py` (Python Swarm stubs).
    *   `README.md` (Skill documentation).
*   **Legacy Migration:** Updated `App.tsx` to auto-migrate older JSON manifests to the v1.8+ schema.

---

## v1.6.0: The Metacognitive Upgrade
**Focus:** Self-Correction, Economic Constraints, and Artifact Export.

*   **Metacognitive Diagnostics:** `internalTools` for self-debugging.
*   **Token Economics:** Drift Allowance and Stability Tax calculations.
*   **Spec Export:** Human-readable Markdown generation.

---

## v1.5.0: Semantic Cartography
**Focus:** Knowledge Graphing and Context Capsules.

*   **Word Mapper:** Tactical semantic engine using Datamuse/ConceptNet.
*   **Capsule Lab:** HTML artifact minting for portable context.
*   **Registry:** Provenance indexing for all vectors.
