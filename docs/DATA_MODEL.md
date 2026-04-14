<!-- markdownlint-disable MD013 MD041 -->
# 🗺️ SCOS Data Model & Firestore Schema

> **Framework:** DRP-AI-PERSONA-ENGINEERING-FRAMEWORK-2026
> **Version:** 1.0.0
> **Scope:** Firestore Database Collections, Schemas, and Swarm Queues

## 1. Relational Schema Topography (Firestore)

This schema maps the NoSQL Firestore collections into an Entity-Relationship representation to visualize the physical data separation, nested subcollections, and cardinality of the Sovereign Cognitive OS (SCOS).

```mermaid
erDiagram
    User ||--o{ AgentManifest : "owns /users/{userId}/manifests"
    User ||--o{ Capsule : "owns /users/{userId}/capsules"
    User ||--o{ Prompt : "owns /users/{userId}/prompts"
    User ||--o{ Contract : "owns /users/{userId}/contracts"
    User ||--o{ Provenance : "owns /users/{userId}/provenance"

    User {
        string commanderName "The name of the commander"
        string email "The email of the user"
        string sovereignPublicKey "The public key of the user"
        number lastHandshake "The timestamp of the last handshake"
        string keyId "The key ID of the user"
    }

    AgentManifest {
        string id PK
        json data "SovereignAgentManifest payload"
    }

    Capsule {
        string id PK
        json data "ContextCapsule payload"
    }

    Prompt {
        string id PK
        json data "SovereignPrompt payload"
    }

    Contract {
        string id PK
        json data "CognitiveContract payload"
    }

    Provenance {
        string id PK
        json data "ProvenanceIndexEntry payload"
    }
```

## 2. Swarm Task Queue Boundary

The SCOS system relies on a central `swarm_queue` collection at the root of the Firestore database to bridge the gap between the web client and the background Python execution nodes.

```mermaid
sequenceDiagram
    autonumber
    participant UI as SCOS UI (React)
    participant FS as Firestore (swarm_queue)
    participant ScosCore as scos-core (Python Worker)

    UI->>FS: Add document (status: PENDING, command, payload, agentId)
    FS-->>ScosCore: on_snapshot (type: ADDED)
    ScosCore->>FS: Update status -> THINKING
    Note over ScosCore: Executes task via ManifestLoader & ToolExecutor
    ScosCore->>FS: Update status -> COMPLETED / FAILED
    FS-->>UI: Real-time update (Firestore listener)
```
