
# 🏗️ SCOS Architecture: The Epistemic Bridge

> **Framework:** DRP-AI-PERSONA-ENGINEERING-FRAMEWORK-2026
> **Version:** 1.0.0
> **Scope:** High-Level Topology & Data Flow

## 1. The Sovereign Topology

The Sovereign Cognitive OS is a **Hybrid Local/Cloud System** designed to ensure that the *definition of identity* remains sovereign (Client-Side), while the *execution of intelligence* can be scaled (Cloud/Swarm).

```mermaid
graph TD
    User[Architect (User)] -->|Fabricates| Forge[Agent Forge (Web)]
    Forge -->|Signs (ECDSA P-256)| Manifest[Sovereign Manifest (JSON)]
    
    subgraph "Local Sovereignty (Browser)"
        Vault[Local Vault (IndexedDB/LocalStorage)]
        Keys[Commander Keys (WebCrypto)]
        Capsule[Capsule Lab]
        Mapper[Word Mapper]
    end
    
    Manifest --> Vault
    Keys -->|Signs| Manifest
    
    subgraph "The Bridge (Firebase)"
        Auth[Auth (Google)]
        DB[Firestore (Sync)]
    end
    
    Vault -->|Syncs (Encrypted)| DB
    
    subgraph "Execution Layer (Swarm)"
        Python[scos-core (Python Node)]
        Gemini[Google Gemini API]
        Tools[External Tools/APIs]
    end
    
    DB -->|Hydrates| Python
    Python -->|Inference| Gemini
    Python -->|Action| Tools
    Python -->|Logs| DB
```

---

## 2. The Epistemic Matrix ($E$)

The core innovation of SCOS v1.9.0 is the replacement of flat "Personas" with **Epistemic Matrices**. An agent is not a prompt; it is a 4-dimensional vector space.

### $E = <G, O, C, T>$

1.  **$G (Goal Orientation):**
    *   **Primary Goal (Invariant):** The non-negotiable objective.
    *   **Secondary Goals:** Contextual objectives.
    *   **Anti-Goals (Constraints):** Explicit refusals (e.g., "Do not output code without explanation").

2.  **$O (Output Fidelity):**
    *   Defines the strict shape of the agent's thoughts (JSON, Markdown, Pydantic).
    *   Prevents "blob" responses.

3.  **$C (Communication):**
    *   **Epistemic Markers:** Linguistic flags of certainty ("I suspect" vs "I know").
    *   **Tone Drift:** Thresholds for when an agent loses its voice.

4.  **$T (Tooling):**
    *   **External Tools:** APIs the agent can call.
    *   **Internal Tools:** Metacognitive functions (Self-Correction, Plan Verification).

---

## 3. The Cognitive Protocol (Think $\rightarrow$ Write $\rightarrow$ Code)

To prevent **Token Collapse** (loss of instruction adherence in long contexts), SCOS agents enforce a strict loop:

1.  **Phase 1: THINK (Hidden)**
    *   **Input:** User Query + Epistemic Matrix.
    *   **Action:** Allocate `ThinkingBudget`. Identify ambiguity, edge cases, and required tools.
    *   **Output:** `<thinking>` trace (hidden from final user output).

2.  **Phase 2: WRITE (Synthesis)**
    *   **Input:** `<thinking>` trace.
    *   **Action:** Draft the response or plan in the defined **Tone** ($C$).
    *   **Output:** Draft Artifact.

3.  **Phase 3: CODE (Execution)**
    *   **Input:** Draft Artifact.
    *   **Action:** Call Tools ($T$) to execute the plan. Verify against **Anti-Goals** ($G$).
    *   **Output:** Final Result.

---

## 4. Cryptographic Sovereignty

### The Chain of Trust
1.  **Key Gen:** Keys are generated in the browser using `window.crypto.subtle` (ECDSA P-256).
2.  **Signing:** Every Manifest created in the Forge is hashed and signed.
3.  **Attestation:** When the Python Swarm loads an agent, it verifies the signature against the User's Public Key (stored in Firestore).
4.  **Immutability:** If the Manifest JSON is altered in transit (e.g., a hacker changes the Primary Goal), the signature verification fails, and the Swarm refuses to boot the agent.

---

## 5. Provenance & Observability

*   **Token Telemetry:** We track `promptTokens`, `completionTokens`, and `totalTokens` for every operation.
*   **Drift Detection:** The **Word Mapper** creates semantic baselines. If an agent's output vector drifts too far from its baseline constellation, it is flagged for review.
*   **Context Capsules:** Static HTML artifacts that serve as "Read-Only Memory" for agents, preventing context poisoning.
