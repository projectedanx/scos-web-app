<!-- /// file: architecture.md /// -->
# SCOS 1.12.2 Architectural Topography

## 1. System Context (C4 Model)
```mermaid
C4Context
  title System Context diagram for Sovereign Cognitive OS (SCOS)
  Person(user, "Architect", "Designs agents and defines Epistemic Matrix.")
  System(scos_forge, "SCOS Agent Forge", "Client-side neural interface for identity fabrication and knowledge distillation.")
  System_Ext(firebase, "Firebase (scos-17fbf)", "Cloud sync, Auth, and Storage.")
  System_Ext(gemini, "Gemini API", "Primary LLM for generative synthesis.")
  System_Ext(external_apis, "Datamuse / ConceptNet", "Semantic triangulation and external grounding.")
  System_Ext(scos_core, "scos-core (Swarm)", "Python runtime environment for executing autonomous agents.")

  Rel(user, scos_forge, "Fabricates Identities / Manages Vault")
  Rel(scos_forge, firebase, "Syncs encrypted Manifests and Profiles via")
  Rel(scos_forge, gemini, "Synthesizes intent via")
  Rel(scos_forge, external_apis, "Triangulates semantic concepts via")
  Rel(scos_forge, scos_core, "Deploys Python Stubs to")
```

## 2. Container Map (Meso-Scale)
```mermaid
C4Container
  title Container diagram for Sovereign Cognitive OS
  Person(user, "Architect", "Manages Sovereign Agents.")

  System_Boundary(scos_frontend, "React/Vite Client") {
    Container(auth_context, "AuthContext", "React Context", "Firebase OAuth Wrapper.")
    Container(ui_views, "UI Views", "React Components", "Dashboard, Forge, Capsule Lab, Vault.")
    Container(gemini_service, "geminiService.ts", "TypeScript", "LLM Inference Engine, Flash Grounding.")
    Container(crypto_service, "cryptoService.ts", "WebCrypto", "ECDSA P-256 Key Gen and Manifest Signing.")
    Container(mapper_service, "wordMapperService.ts", "TypeScript", "Semantic Concept Triangulation.")
    Container(conductor_service, "conductorService.ts", "TypeScript", "MCP / Swarm Artifact Exporter.")
  }

  System_Boundary(scos_backend, "Firebase Infrastructure") {
    ContainerDb(firestore, "Firestore DB", "NoSQL", "Stores User Profiles, Encrypted Manifests, and Capsules.")
    Container(cloud_functions, "Cloud Functions", "Node.js", "Secure Proxy for Gemini API.")
  }

  Rel(user, ui_views, "Interacts with")
  Rel(ui_views, auth_context, "Uses")
  Rel(ui_views, gemini_service, "Prompts")
  Rel(ui_views, crypto_service, "Signs via")
  Rel(ui_views, mapper_service, "Triangulates via")
  Rel(ui_views, conductor_service, "Exports via")
  Rel(gemini_service, cloud_functions, "Calls Secure Proxy")
  Rel(auth_context, firestore, "Reads/Writes User State")
```

## 3. Relational Schema Topography
```mermaid
erDiagram
    USER ||--o{ MANIFEST : "fabricates (users/{uid}/manifests)"
    USER ||--o{ CAPSULE : "distills (users/{uid}/capsules)"
    USER ||--o{ PROMPT : "engineers (users/{uid}/prompts)"
    USER ||--o{ CONTRACT : "negotiates (users/{uid}/contracts)"
    USER ||--o{ PROVENANCE : "logs (users/{uid}/provenance)"

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

## 4. Auth & Identity Provisioning Pipeline
```mermaid
sequenceDiagram
    autonumber
    actor User as Architect
    participant App as App.tsx / AuthContext
    participant Crypto as cryptoService.ts
    participant Firebase as Firebase Auth
    participant DB as Firestore (scos-17fbf)

    User->>App: Login via OAuth
    App->>Firebase: Authenticate()
    Firebase-->>App: UID & Token

    rect rgb(30, 30, 50)
    Note over App, Crypto: Key Generation
    App->>Crypto: generateCommanderKeys()
    Crypto->>Crypto: window.crypto.subtle.generateKey(ECDSA P-256)
    Crypto-->>App: CommanderKeyPair (Public/Private)
    end

    rect rgb(50, 30, 30)
    Note over App, DB: Profile Sync & Provisioning
    App->>DB: Upsert users/{uid}/profile (Public Key)
    DB-->>App: Acknowledge
    end

    App-->>User: Granted Access to Sovereign Forge
```
