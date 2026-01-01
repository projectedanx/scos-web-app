# SCOS Backend Architecture: Hybrid Sovereignty

> **Status:** Specification (Draft)
> **Target Infrastructure:** Firebase (Google Cloud Platform)
> **Philosophy:** Cloud for Synchronization, Client for Sovereignty.

## 1. Core Philosophy: The Sovereign Bridge

The transition to a cloud backend **must not** compromise the "Sovereign" aspect of the OS.
- **Identity:** Users authenticate via Firebase (Google/Email) for *access*, but use local ECDSA keys for *attestation*.
- **Data:** Manifests are stored in Firestore for availability but are cryptographically signed on the client before upload.
- **Compute:** The "Forge" (Web) defines the intent; The "Swarm" (Python) executes the logic.

---

## 2. Infrastructure Components

### A. Authentication (Firebase Auth)
- **Primary:** Google Sign-In & Email/Password.
- **The Link:** Upon login, the client checks for a local `localStorage` Commander Key. If found, the Public Key is uploaded to the User Profile. This links the "Cloud Identity" to the "Sovereign Identity".

### B. Persistence (Cloud Firestore)
NoSQL Document structure designed for real-time syncing between the Web Forge and Python Swarm nodes.

**Schema Definitions:**

*   `users/{userId}`
    *   `commanderName`: string
    *   `sovereignPublicKey`: string (PEM)
    *   `createdAt`: timestamp

*   `users/{userId}/manifests/{agentId}`
    *   Contains the full `SovereignAgentManifest`.
    *   `status`: 'DRAFT' | 'DEPLOYED' | 'ACTIVE' | 'HIBERNATING'
    *   `lastHeartbeat`: timestamp (Updated by Python Swarm)
    *   `currentContext`: string (Real-time logs from Python)

*   `public_capsules/{capsuleId}`
    *   Contains `ContextCapsule`.
    *   Readable by authenticated users (if published).
    *   Writeable only by owner.

*   `swarm_queue/{jobId}`
    *   `agentId`: string
    *   `command`: string
    *   `payload`: JSON
    *   `status`: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    *   *Purpose:* The Web App writes here; Python Swarm listens here.

### C. Secure Compute (Cloud Functions 2nd Gen)
Move the Gemini API calls from the client to the server to protect your `GEMINI_API_KEY` and enforce quotas.

*   `fabricateAgent(prompt: string)`: Secure wrapper for Gemini Pro.
*   `distillCapsule(context: string)`: Secure wrapper for Capsule generation.
*   `verifySignature(payload: any)`: Server-side validation of the ECDSA signature before allowing deployment.

---

## 3. The Python Swarm Integration (`scos-core`)

The Python layer is the **Runtime Environment**. It does not *design* agents; it *ingests* manifests from the Forge and gives them life.

### Logic Flow
1.  **Boot:** Python script starts, authenticates with Firebase Admin SDK (Service Account).
2.  **Hydration:** Script listens to `users/{uid}/manifests`.
3.  **Instantiation:** When a manifest status changes to `DEPLOYED`:
    *   Python parses the JSON.
    *   It validates the ECDSA signature against the user's Public Key.
    *   It dynamically loads Python functions that match the `tools` defined in the manifest.
4.  **Execution Loop:**
    *   Listens to `swarm_queue`.
    *   When a job arrives, passes context to the LLM (Gemini via Python SDK).
    *   Executes mapped Python tools.
    *   Writes results back to Firestore.

### Security Boundary
*   The Python Swarm runs in a **Docker Container**.
*   It has **READ** access to Manifests.
*   It has **WRITE** access to Logs and Queue Results.
*   It **CANNOT** modify the Agent Identity (Immutable).

---

## 4. Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Sovereignty: Only you can touch your agents
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Swarm Nodes (Service Accounts) need specific access
    // This usually requires a custom claim or specific collection structure
    match /swarm_queue/{jobId} {
      allow read, write: if request.auth != null; // Refine for production
    }
  }
}
```
