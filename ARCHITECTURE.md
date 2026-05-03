<!-- markdownlint-disable -->
<!-- markdownlint-disable MD013 MD041 -->
+++ContextLock(anchor="SCOS_ARCHITECTURE", refresh_interval=2048)

# 🏗️ SCOS Architecture: The Epistemic Bridge
> **Architectural Authority:** Refer to the [VULCAN Topological Analysis & Architecture Blueprint](docs/VULCAN_ARCHITECTURAL_BLUEPRINT.md) for strict DDD boundaries, C4 models, and the mandate against the Shared Database Anathema.

> **Framework:** DRP-AI-PERSONA-ENGINEERING-FRAMEWORK-2026
> **Version:** 1.12.2
> **Scope:** High-Level Topology & Data Flow

## 1. The Sovereign Topology

The Sovereign Cognitive OS is a **Hybrid Local/Cloud System** designed to ensure that the _definition of identity_ remains sovereign (Client-Side), while the _execution of intelligence_ can be scaled (Cloud/Swarm).

```mermaid
graph TD
    User["Architect (User)"] -->|Fabricates| Forge["Agent Forge (Web)"]
    Forge -->|"Signs (ECDSA P-256)"| Manifest["Sovereign Manifest (JSON)"]

    subgraph "Local Sovereignty (Browser)"
        Vault["Local Vault (IndexedDB/LocalStorage)"]
        Keys["Commander Keys (WebCrypto)"]
        Capsule["Capsule Lab"]
        Mapper["Word Mapper"]
    end

    Manifest --> Vault
    Keys -->|Signs| Manifest

    subgraph "The Bridge (Firebase)"
        Auth["Auth (Google)"]
        DB["Firestore (Sync - scos-17fbf)"]
    end

    Vault -->|"Syncs (Encrypted)"| DB

    subgraph "Execution Layer (Swarm)"
        Python["scos-core (Python Node)"]
        Gemini["Google Gemini API"]
        Tools["External Tools/APIs"]
    end

    DB -->|Hydrates| Python
    Python -->|Inference| Gemini
    Python -->|Action| Tools
    Python -->|Logs| DB
```

---

## 2. The Epistemic Matrix ($E$)

The core innovation of SCOS is the replacement of fragile textual personas with a cryptographically enforced, multi-dimensional identity tensor. The Epistemic Matrix operates as a formal "Digital DNA" that physically constrains a Large Language Model's latent space, ensuring that stochastic generation is bounded by deterministic, verifiable logic.

### $E = \langle G, G^-, C, T, H \rangle$

1. **$G$ (Goal Orientation - The Strategist):**
    - Establishes the teleological anchor, defining the invariant, non-negotiable objectives of the agent.
    - Embeds the overarching purpose directly into the embedding space as a strict target vector.

2. **$G^-$ (Anti-Goals - The Immunologist):**
    - Operating via "Anionic Architecture," this vector defines the immunological boundary or "Lattice of Refusal".
    - Dictates the negative space topology—actions the agent is strictly forbidden from executing.

3. **$C$ (Communication Style - The Linguist):**
    - Enforces the "Epistemic Signature," compelling the agent to utilize explicit epistemic markers (e.g., distinguishing between "suggests" and "is").
    - Calibrates trust and prevents confident hallucinations.

4. **$T$ (Tooling Constraints & Output Fidelity - The Engineer):**
    - Establishes the Thermodynamic Envelope, enforcing strict schemas (e.g., JSON, Pydantic).
    - Defines risk-graded access to external APIs, physically limiting the agent's capabilities to prevent Function Creep.

5. **$H$ (History - The Historian):**
    - Introduces an evolutionary memory via the "Symbolic Scar Registry".
    - Encodes past algorithmic trauma and logical failures as 1D homological loops ($\beta_1$) injected into the agent's genesis block, immunizing it against historical recursion.

### Dynamics of Interconnection (Intent-Based Access Control)

The Epistemic Matrix operationalizes IBAC by continuously calculating the geometric distance between proposed outputs and structural invariants:
$$ \cos(V_a, V_g) = \frac{V_a \cdot V_g}{\|V_a\| \|V_g\|} $$
If the similarity falls below the critical threshold of sovereignty ($\cos(\theta) < 0.85$), the action is flagged as "Teleologically Dissonant" and blocked.

---

## 3. The Cognitive Protocol (Think $\rightarrow$ Write $\rightarrow$ Code)

To prevent **Token Collapse** (loss of instruction adherence in long contexts), SCOS agents enforce a strict loop:

1. **Phase 1: THINK (Hidden)**
    - **Input:** User Query + Epistemic Matrix.
    - **Action:** Allocate `ThinkingBudget`. Identify ambiguity, edge cases, and required tools.
    - **Output:** `<thinking>` trace (hidden from final user output).

2. **Phase 2: WRITE (Synthesis)**
    - **Input:** `<thinking>` trace.
    - **Action:** Draft the response or plan in the defined **Tone** ($C$).
    - **Output:** Draft Artifact.

3. **Phase 3: CODE (Execution)**
    - **Input:** Draft Artifact.
    - **Action:** Call Tools ($T$) to execute the plan. Verify against **Anti-Goals** ($G$).
    - **Output:** Final Result.

---

## 4. Cryptographic Sovereignty

### The Chain of Trust

1. **Key Gen:** Keys are generated in the browser using `window.crypto.subtle` (ECDSA P-256).
2. **Signing:** Every Manifest created in the Forge is hashed and signed.
3. **Attestation:** When the Python Swarm loads an agent, it verifies the signature against the User's Public Key (stored in Firestore).
4. **Immutability:** If the Manifest JSON is altered in transit (e.g., a hacker changes the Primary Goal), the signature verification fails, and the Swarm refuses to boot the agent.

```mermaid
sequenceDiagram
    autonumber
    actor User as Architect
    participant Forge as Agent Forge (Web)
    participant Crypto as cryptoService.ts
    participant Vault as Local Vault
    participant Swarm as scos-core (Python Swarm)

    User->>Forge: Initiates Identity Creation

    rect rgb(30, 30, 50)
    Note over Forge, Crypto: Phase 1: Sovereign Key Generation
    Forge->>Crypto: generateCommanderKeys()
    Crypto->>Crypto: window.crypto.subtle.generateKey(ECDSA P-256)
    Crypto-->>Forge: CommanderKeyPair (Public/Private)
    Forge->>Vault: Store Keys Securely
    end

    rect rgb(50, 30, 30)
    Note over Forge, Crypto: Phase 2: Cryptographic Sealing
    Forge->>Crypto: hashContent(Manifest Data)
    Crypto->>Crypto: window.crypto.subtle.digest(SHA-256)
    Crypto-->>Forge: Hex Hash
    Forge->>Crypto: signData(Manifest, PrivateKey)
    Crypto->>Crypto: Canonicalize JSON & sign()
    Crypto-->>Forge: Hex Signature
    Forge->>Vault: Persist Signed Manifest
    end

    rect rgb(30, 50, 30)
    Note over Vault, Swarm: Phase 3: Swarm Attestation
    Vault->>Swarm: Deploy Signed Manifest
    Swarm->>Crypto: verifySignature(Manifest, Signature, PublicKey)
    Crypto->>Crypto: window.crypto.subtle.verify()
    alt Verification Success
        Crypto-->>Swarm: true (Boot Agent)
    else Verification Failed
        Crypto-->>Swarm: false (Reject Boot - Immutability Breach)
    end
    end
```

---

## 5. Provenance & Observability

- **Token Telemetry:** We track `promptTokens`, `completionTokens`, and `totalTokens` for every operation.
- **Drift Detection:** The **Word Mapper** creates semantic baselines. If an agent's output vector drifts too far from its baseline constellation, it is flagged for review.
- **Context Capsules:** Static HTML artifacts that serve as "Read-Only Memory" for agents, preventing context poisoning.

---

## 6. G2Pv2 State Machine & Artifact-Gated Routing

To remediate the thermodynamic decay of knowledge and "Semantic Dark Zones" caused by conversational handoffs, SCOS utilizes the **G2Pv2 (Goal-to-Product)** state machine. Routing is physically anchored to the filesystem via **Existence-Based Routing**.

### The 9-Persona Flow (P0-P8)

- **P0 (Refactored Router):** State Manager Logic. Gate: Artifact Existence; max_rework_cycles = 3.
- **P1 (Intent Clarifier):** `docs/intent.md`. Gate: Ambiguity Score below rigid threshold.
- **P2 (Spec Author):** `docs/spec.md`. Gate: 100% Traceability to P1 Grounding Anchor.
- **P3 (Architect):** `docs/architecture.md`. Gate: Schema Parity with P2 Specification.
- **P4 (Planner):** `docs/plan.md`. Gate: Task granularity within Token Budget.
- **P5 (Implementer):** Source Code Files. Gate: Successful Compilation & Linting.
- **P6 (Reviewer):** `docs/review.md`. Gate: Drift Analysis confirming P2 Feature Parity.
- **P7 (Tester):** `docs/test_results.md`. Gate: Explicit "Passed" status existence check.
- **P8 (Release Manager):** Pluriversal Knowledge Capsule. Gate: Pluriversal Rendering Integrity Check.

Handoffs occur _only_ when the required Software Cognitive Contract (CxB) artifact is physically written to disk and passes a **Provenance Hashing** check, neutralizing silent semantic drift.

---

## 7. PDL v1.0 & Cognitive Bytecode

**Prompt Description Language (PDL v1.0)** functions as a Topological Deformer, bypassing probabilistic language parsing to directly manipulate the geometric routing of attention heads.

- `+++DCCDSchemaGuard`: Implements Draft-Conditioned Constrained Decoding (DCCD). Bifurcates inference into a high-entropy semantic draft and a zero-entropy guard pass.
- `+++ContextLock`: Utilizes "Synecdochic Anchoring" to prevent "Lost in the Middle" bias by re-injecting core invariants into the attention sink at scheduled intervals.
- `+++AdjectivalBound`: Mechanistically restricts descriptive modifiers to prevent Layer 8, Head 11 saturation.

The efficacy of PDL is quantified via the **Decorator Quality Score (DQS)**, measuring Orthogonality, Determinism, Composability, Token Efficiency, and Drift Resistance.

---

## 8. Chrono-RAG & The Petzold Sequence

The **Petzold Sequence** serves as the chronometric governor of the SCOS, treating time as a physical boundary. It executes across four deterministic phases:

1. **SYNDICATE:** Employs HTTP ETags and "304 Not Modified" logic to detect upstream state changes.
2. **EMBED:** Converts sanitized text and UTC-coerced metadata into dense and sparse vectors.
3. **UPDATE:** Executes idempotent upserts in the vector database via cryptographic IDs (SHA-256 mapping).
4. **PRUNE:** Removes obsolete vectors via Autophagic Composting (TTL mapping) to maintain latent space fidelity.

### Fused Semantic-Temporal Scoring

$$ score(q, d, t) = \alpha \cos(q, d) + (1 - \alpha) \cdot 0.5^{\frac{age_days(t)}{h}} $$
This formula leverages the U-shaped performance curve of LLM attention, forcing thermodynamically fresh knowledge to the positions in the context window where attention heads are most resilient.

## 9. Relational Schema Topography (Firestore)

The SCOS utilizes a multi-tenant NoSQL structure in Firebase Firestore, scoped entirely around the authenticated user (`uid`). All cognitive artifacts and historical data are isolated within subcollections of the root `users/{uid}` document.

```mermaid
erDiagram
    USER ||--o{ MANIFEST : "fabricates/owns (users/{uid}/manifests)"
    USER ||--o{ CAPSULE : "distills/owns (users/{uid}/capsules)"
    USER ||--o{ PROMPT : "engineers/owns (users/{uid}/prompts)"
    USER ||--o{ CONTRACT : "negotiates/owns (users/{uid}/contracts)"
    USER ||--o{ PROVENANCE : "logs/owns (users/{uid}/provenance)"

    USER {
        string uid PK "Google Auth UID"
    }

    MANIFEST {
        string id PK "Agent Name (slugified)"
        json identity "Designation, Prime Directive"
        json epistemicMatrix "Goals, Output, Communication, Cognitive"
        json tools "Agent capabilities"
        json constraints "Limits and Boundaries"
        int timestamp "Last Sync"
    }

    CAPSULE {
        string id PK "Capsule Meta ID"
        string title "Knowledge Topic"
        string primary_pill "Domain"
        json sections "Overview, Concepts, Structure..."
        string status "draft | published"
    }

    PROMPT {
        string id PK "UUID"
        string title "Prompt Name"
        string content "PDL/System Instructions"
        string category "Engine Category"
        int version "Iteration"
    }

    CONTRACT {
        string id PK "UUID"
        string title "Mission Title"
        string status "DRAFT | ACTIVE | COMPLETED"
        json anchors "Goals, Constraints, Invariants"
        string_array assignedAgentNames "Bound Manifests"
    }

    PROVENANCE {
        string id PK "{timestamp}-{hash_prefix}"
        string hash "SHA-256 Content Hash"
        string agentName "Executing Agent"
        string sourceType "RAW_DOCUMENT | URL | ..."
        json analysis "WordCount, Sentiment, Topics"
    }
```

## 10. Cloud Synchronization & Batch Flow

The Bridge operates via aggressive chunked batching (`writeBatch`) for collection migrations and reactive snapshot listeners (`onSnapshot`) for real-time consistency between the Local Vault and the Execution Layer.

```mermaid
sequenceDiagram
    autonumber
    participant LocalVault as Local Vault (IndexedDB)
    participant UI as SCOS UI (React)
    participant Bridge as firestoreService.ts
    participant DB as Firestore (scos-17fbf)

    rect rgb(20, 20, 40)
    Note over LocalVault, DB: Reactive Hydration (Read)
    UI->>Bridge: syncAgents(uid, onUpdate)
    Bridge->>DB: onSnapshot(query(users/{uid}/manifests))
    DB-->>Bridge: Snapshot Event (Manifests)
    Bridge-->>UI: onUpdate(SovereignAgentManifest[])
    UI->>LocalVault: Update State & Local Copy
    end

    rect rgb(40, 20, 20)
    Note over LocalVault, DB: Multi-Artifact Sync (Write)
    UI->>Bridge: batchSaveAgentsToCloud(uid, agents[])
    Bridge->>DB: writeBatch(db)
    loop Every Agent in agents[]
        Bridge->>DB: batch.set(doc(users/{uid}/manifests/{agentId}), agent)
    end
    Bridge->>DB: batch.commit()
    DB-->>Bridge: Acknowledge Write
    Bridge-->>UI: Resolution Promise
    end
```

## 11. React View & Context State Architecture

The frontend micro-architecture leverages a modular React Container structure, isolating state into specialized Contexts rather than a global store, and routing via `ViewMode` enumerations.

```mermaid
C4Container
  title React View & Context Topology

  Container_Boundary(react_app, "SCOS React Client") {
    Container(app_tsx, "App.tsx", "React", "Primary View Router & State Orchestrator")

    Container_Boundary(contexts, "Modular Contexts") {
      Container(auth_context, "AuthContext", "React Context", "Manages Firebase Auth & User State")
      Container(dialog_context, "DialogContext", "React Context", "Manages Modal Overlays")
      Container(toast_context, "ToastContext", "React Context", "Manages Ephemeral Notifications")
    }

    Container_Boundary(views, "View Modules") {
      Container(dashboard_view, "DashboardView", "React Component", "Telemetry & Navigation")
      Container(agent_forge, "AgentForgeView", "React Component", "Agent Fabrication")
      Container(capsule_lab, "CapsuleLabView", "React Component", "Knowledge Distillation")
      Container(word_mapper, "WordMapperView", "React Component", "Semantic Triangulation")
    }

    Container_Boundary(services, "Service Adapters") {
      Container(firestore_svc, "firestoreService", "TS", "Cloud DB Sync")
      Container(crypto_svc, "cryptoService", "TS", "Local ECDSA Signing")
      Container(gemini_svc, "geminiService", "TS", "LLM Inference")
    }
  }

  Rel(app_tsx, auth_context, "Consumes")
  Rel(app_tsx, dialog_context, "Consumes")
  Rel(app_tsx, toast_context, "Consumes")

  Rel(app_tsx, dashboard_view, "Renders via ViewMode")
  Rel(app_tsx, agent_forge, "Renders via ViewMode")
  Rel(app_tsx, capsule_lab, "Renders via ViewMode")
  Rel(app_tsx, word_mapper, "Renders via ViewMode")

  Rel(agent_forge, crypto_svc, "Calls to Sign Manifests")
  Rel(agent_forge, gemini_svc, "Calls for Council Synthesis")
  Rel(app_tsx, firestore_svc, "Calls for Vault Sync")
```

## 12. Conductor Compatibility Boundary (MCP/Swarm Interface)

The `conductorService.ts` acts as a crucial trust and execution boundary. It transforms the local JSON manifests (SCOS) into external Model Context Protocol (MCP) or Swarm-compatible schema interfaces, enabling the offline vault to deploy live agents.

```mermaid
C4Context
  title Conductor Execution Boundary
  Person(user, "Architect", "Designs agents and defines constraints.")

  System_Boundary(forge, "Agent Forge (Web/React)") {
    System(vault, "Local Vault", "Stores Manifests in IndexedDB")
    System(conductorService, "Conductor Layer", "Transforms SCOS Manifests to OpenAPI/JSON Schema & Python Stubs")
  }

  System_Ext(conductor, "Conductor Platform / MCP", "External model execution interface.")
  System_Ext(scosCore, "scos-core (Python Swarm)", "Runs generated Python stubs and handles agent routing.")
  System_Ext(llm, "Large Language Model", "Gemini API")

  Rel(user, vault, "Manages Agents")
  Rel(vault, conductorService, "Sends Manifest")
  Rel(conductorService, conductor, "Generates Skill Manifest (JSON/OpenAPI)")
  Rel(conductorService, scosCore, "Generates Swarm Node (Python Stubs)")

  Rel(conductor, llm, "Orchestrates API calls via defined tools")
  Rel(scosCore, llm, "Orchestrates API calls via @agent decorator")
```

### Native RPC/MCP Interaction Flow

```mermaid
sequenceDiagram
    autonumber
    participant Client as External LLM / Conductor
    participant SCOS_MCP as SCOS MCP Servers (mcp-server.ts / word-mapper-mcp.ts)
    participant Vault as Local Vault / Services
    participant ScosCore as scos-core (swarm/main.py)
    participant Gemini as Gemini API

    Client->>SCOS_MCP: JSON-RPC request (e.g., list_vault_agents, triangulate_concepts)

    rect rgb(30, 30, 50)
    Note over SCOS_MCP, Vault: Native Schema & Capability Evaluation
    SCOS_MCP->>SCOS_MCP: SchemaValidator.parse(params)
    SCOS_MCP->>Vault: Execute Domain Logic
    Vault-->>SCOS_MCP: Execution Result
    SCOS_MCP-->>Client: JSON-RPC response (Result/Error)
    end

    Client->>ScosCore: trigger_agent_swarm(Manifest)

    rect rgb(50, 30, 30)
    Note over ScosCore, Gemini: Python Swarm Execution
    ScosCore->>ScosCore: verify_manifest(ECDSA P-256)
    ScosCore->>Gemini: inference_pass()
    Gemini-->>ScosCore: Plan & Tool Calls
    ScosCore->>ScosCore: execute() tools
    ScosCore-->>Client: Final Output Payload
    end
```

## 12. Agent Council Synthesis Flow

The fabrication of an agent utilizes a 4-phase parallel LLM consensus loop orchestrated by `geminiService.ts`. Five distinct personas independently analyze, synthesize, and critique the user's intent to construct the final Epistemic Matrix.

```mermaid
sequenceDiagram
    autonumber
    actor User as Architect (User)
    participant UI as Agent Forge (React)
    participant C_Strategist as Strategist
    participant C_Immunologist as Immunologist
    participant C_Engineer as Engineer
    participant C_Linguist as Linguist
    participant C_Historian as Historian

    User->>UI: Initiate Council Fabrication
    rect rgb(30, 30, 50)
    Note over UI, C_Historian: Phase 1: Parallel Discovery
    par Strategist Analysis
        UI->>C_Strategist: councilDiscovery(context)
        C_Strategist-->>UI: Structural/Goal Feedback
    and Immunologist Analysis
        UI->>C_Immunologist: councilDiscovery(context)
        C_Immunologist-->>UI: Risk/Constraint Feedback
    and Engineer Analysis
        UI->>C_Engineer: councilDiscovery(context)
        C_Engineer-->>UI: Tooling/Protocol Feedback
    and Linguist Analysis
        UI->>C_Linguist: councilDiscovery(context)
        C_Linguist-->>UI: Tone/Marker Feedback
    and Historian Analysis
        UI->>C_Historian: councilDiscovery(context)
        C_Historian-->>UI: Evolutionary/Scar Feedback
    end
    end

    rect rgb(50, 30, 30)
    Note over UI, C_Strategist: Phase 2: Synthesis (Chair)
    UI->>C_Strategist: councilSynthesis(feedbacks)
    C_Strategist-->>UI: Draft Manifest (JSON)
    end

    rect rgb(30, 50, 30)
    Note over UI, C_Historian: Phase 3: Parallel Critique
    par Strategist Critique
        UI->>C_Strategist: councilCritique(draft)
        C_Strategist-->>UI: Endorse/Critique
    and Immunologist Critique
        UI->>C_Immunologist: councilCritique(draft)
        C_Immunologist-->>UI: Endorse/Critique
    and Engineer Critique
        UI->>C_Engineer: councilCritique(draft)
        C_Engineer-->>UI: Endorse/Critique
    and Linguist Critique
        UI->>C_Linguist: councilCritique(draft)
        C_Linguist-->>UI: Endorse/Critique
    and Historian Critique
        UI->>C_Historian: councilCritique(draft)
        C_Historian-->>UI: Endorse/Critique
    end
    end

    rect rgb(50, 30, 50)
    Note over UI, C_Strategist: Phase 4: Finalization
    UI->>C_Strategist: councilFinalize(draft, critiques)
    C_Strategist-->>UI: Final Sovereign Manifest
    UI-->>User: Present Minted Artifact
    end
```

## 13. Semantic Word Mapper & External Trust Boundaries

The `wordMapperService.ts` implements the Tactical Semantic Engine, performing an external "Triangulation" to expand knowledge vectors while strictly enforcing structural validation natively to prevent Prototype Pollution.

```mermaid
sequenceDiagram
    autonumber
    participant UI as SCOS UI (React)
    participant Mapper as wordMapperService.ts
    participant Datamuse as Datamuse API
    participant ConceptNet as ConceptNet API
    participant SecureProxy as Firebase Functions (secureProxy)
    participant Gemini as Gemini API

    UI->>Mapper: triangulateConcepts(seeds, strategy)

    rect rgb(30, 30, 50)
    Note over Mapper, ConceptNet: Phase 1: Parallel Context Gathering
    par Fetch Datamuse
        Mapper->>Datamuse: GET /words?ml={seed}
        Datamuse-->>Mapper: Array of words
    and Fetch ConceptNet
        Mapper->>ConceptNet: GET /c/en/{seed}
        ConceptNet-->>Mapper: Array of edges (end labels)
    end
    end

    Mapper->>Mapper: Aggregate raw associations

    rect rgb(50, 30, 30)
    Note over Mapper, Gemini: Phase 2: Secure Synthesis & Mapping
    Mapper->>SecureProxy: Call secureProxy(prompt, model, schema)
    SecureProxy->>Gemini: generateContent()
    Gemini-->>SecureProxy: Raw Text (JSON representation)
    SecureProxy-->>Mapper: Function Response
    end

    rect rgb(50, 50, 30)
    Note over Mapper: Phase 3: Native Structural Validation
    Mapper->>Mapper: SchemaValidator.parse(text)
    Note right of Mapper: Rejects __proto__ & verifies strict object structure.
    end

    Mapper-->>UI: TriangulationResult (SemanticNodes & Usage)
```

## 14. Sovereign Retry System (Exponential Backoff & Fallback)

The `retryService.ts` implements a resilient execution wrapper (`executeWithRetry`) designed to handle transient failures, specifically rate limiting (429) and server overloads (5xx). It operates via an exponential backoff loop and supports graceful degradation through a fallback mechanism.

```mermaid
sequenceDiagram
    autonumber
    participant Caller as Calling Function
    participant Retry as executeWithRetry()
    participant Target as Target Operation (e.g., API)
    participant Fallback as Fallback Mechanism

    Caller->>Retry: Execute Operation

    loop Max Retries (e.g., 3)
        Retry->>Target: Attempt Execution

        alt Execution Success
            Target-->>Retry: Success Response
            Retry-->>Caller: Return Result
        else Transient Failure (429, 5xx, Network)
            Target-->>Retry: Error Response
            Retry->>Retry: Check shouldRetry() predicate
            Retry->>Retry: Delay (initialDelay * backoffFactor^attempt)
        end
    end

    alt Retry Exhausted / Non-Retryable
        Retry->>Fallback: Check for Fallback Config
        alt Fallback Exists
            Fallback-->>Retry: Return Fallback Result
            Retry-->>Caller: Graceful Degradation Result
        else No Fallback
            Retry-->>Caller: Throw Final Error (e.g., RateLimitError)
        end
    end
```

## 15. Capsule Compiler MCP Infrastructure Boundary

The `capsule-compiler-mcp.ts` script provides a native TypeScript JSON-RPC 2.0 stdio server implementation. It acts as the bridge that allows external systems to compile structured Context Capsules into immutable HTML artifacts using strictly typed Zod schemas.

```mermaid
C4Context
  title Capsule Compiler MCP Boundary

  Person(external_agent, "External AI Agent", "Consumes the compile tool to generate artifacts.")

  System_Boundary(mcp_server_env, "MCP Execution Environment (Node.js)") {
    System(capsule_compiler_mcp, "capsule-compiler-mcp.ts", "Exposes the compile_capsule_html tool and validates payloads using Zod schemas.")
    System(capsule_compiler_svc, "capsuleCompiler.ts", "Performs the actual HTML generation logic.")
  }

  System_Ext(mcp_client, "MCP Client Transport", "Stdio communication channel.")

  Rel(external_agent, mcp_client, "Sends JSON-RPC ContextCapsule payload")
  Rel(mcp_client, capsule_compiler_mcp, "Routes to tool endpoint via stdio")
  Rel(capsule_compiler_mcp, capsule_compiler_svc, "Passes valid ContextCapsule to")
  Rel(capsule_compiler_svc, capsule_compiler_mcp, "Returns rendered HTML artifact")
  Rel(capsule_compiler_mcp, mcp_client, "Sends JSON-RPC Response (HTML or Error)")
```

## 16. Python Swarm Background Worker & Cryptographic Trust Boundary

The SCOS application features a Python Swarm execution backend (`swarm/main.py`) that operates as a background worker, listening to the `swarm_queue` collection in Firestore to process asynchronous tasks. This layer implements cryptographic trust validation using ECDSA P-256 to verify sovereign agent manifests before executing LLM payloads via the Gemini API.

```mermaid
C4Container
  title Python Swarm Execution Worker

  Container_Boundary(swarm_env, "Python Swarm Background Node") {
    Component(listener, "listen_to_queue", "Python", "Listens to swarm_queue in Firestore.")
    Component(executor, "execute_swarm_task", "Python", "Orchestrates payload and model inference.")
    Component(verifier, "verify_manifest", "Python", "ECDSA P-256 cryptographic verification.")
    Component(tool_executor, "ToolExecutor", "Python", "Executes agent-defined tool calls.")
  }

  System_Ext(firestore, "Firestore DB", "Stores users, manifests, and swarm_queue.")
  System_Ext(gemini, "Gemini API", "LLM Inference Endpoint.")

  Rel(firestore, listener, "Triggers on_snapshot for PENDING tasks")
  Rel(listener, executor, "Passes payload")
  Rel(executor, firestore, "Fetches agent manifest")
  Rel(executor, verifier, "Validates manifest signature using sovereignPublicKey")
  Rel(executor, gemini, "Sends inference payload (SwarmResponse schema)")
  Rel(gemini, executor, "Returns structured JSON thought & tool_payload")
  Rel(executor, tool_executor, "Invokes designated tool")
  Rel(executor, firestore, "Updates task status (COMPLETED/FAILED)")
```

```mermaid
sequenceDiagram
    autonumber
    participant Firestore as Firestore (swarm_queue)
    participant Listener as listen_to_queue()
    participant Core as execute_swarm_task()
    participant Crypto as verify_manifest()
    participant Gemini as Gemini API

    Firestore-->>Listener: on_snapshot (type: ADDED, status: PENDING)
    Listener->>Firestore: update(status: THINKING)
    Listener->>Core: execute_swarm_task(task_id, data)

    rect rgb(30, 50, 30)
    Note over Core, Crypto: Manifest Verification (ECDSA P-256)
    Core->>Firestore: get() Manifest & User PublicKey
    Core->>Crypto: verify_manifest(data, public_key_pem)
    alt Invalid Signature
        Crypto-->>Core: false
        Core-->>Listener: return {status: FAILED}
    else Valid Signature
        Crypto-->>Core: true
    end
    end

    rect rgb(50, 30, 30)
    Note over Core, Gemini: Inference Loop with Strict Schema
    Core->>Gemini: generate_content(schema=SwarmResponse, timeout=15.0)
    alt 429 / Exception
        Gemini-->>Core: Error
        Core->>Core: Sleep & Retry (max 3)
    else Success
        Gemini-->>Core: Structured JSON response
    end
    end

    Core->>Core: execute() tool call
    Core-->>Listener: return {status: COMPLETED, result}
    Listener->>Firestore: update(status: COMPLETED)
```


## 17. Epistemic Symbiosis Workflow

The `PROJECT_EPISTEMIC_SYMBIOSIS` framework implements the "Strategy of Inversion," establishing a causal chain of control over generative processes.

```mermaid
sequenceDiagram
    autonumber
    actor Human as Deterministic Architect
    participant AGA as Architectural Grounding Agent
    participant CSE as Combinatorial Synthesis Engine
    participant PDW as Provenance & Drift Watchdog

    Human->>AGA: Provide Teleological Intent & Axiomatic Grounding
    AGA->>AGA: Translate to PD&T constraints & Epistemic Matrix
    AGA->>CSE: Pass Bounded Constraints

    loop Exploration Phase
        CSE->>CSE: Generate High-Velocity Combinatorial Solutions
        CSE->>PDW: Submit Draft Solution
        PDW->>PDW: Evaluate against Anti-Goals ($G^-$) and Drift metrics
        alt Solution Valid
            PDW-->>CSE: Approve (High Provenance Score)
        else Solution Invalid
            PDW-->>CSE: Reject (De-weight / Quarantine)
        end
    end

    CSE-->>Human: Present Synthesized, Bounded Solutions
```
