# Sovereign Cognitive OS: Agent Forge & Capsule Lab

> **Role:** Epistemic Architect, Sovereign Identity Fabricator & Knowledge Distiller  
> **Status:** Operational (v1.4.0)  
> **Philosophy:** Pluriversal Awareness, Security-by-Design & Immutable Context

## 🌌 Overview

The **Sovereign Cognitive OS (SCOS)** is a client-side neural interface designed to architect secure AI dependencies. It consists of three primary foundries:

1.  **The Agent Forge:** Ingests raw documentation to construct **Sovereign AI Agent Identities**. It enforces strict immunological constraints, risk-graded tooling, and epistemic anchors to prevent hallucination and scope creep.
2.  **The Agent Library:** A visual archive of all fabricated Sovereign Identities stored in the Vault, allowing for rapid inspection, filtering, and restoration of agents into the Forge for iterative refinement.
3.  **The Capsule Lab:** Distills unstructured research, papers, or chaotic notes into **Context Capsules**—immutable, portable knowledge artifacts (JSON + HTML) that can be shared or embedded into agent context windows.

## 🛡️ Core Architecture

### The Frontend (React + TypeScript)
- **Zero-Trust UI:** No sensitive logic executes in the DOM without validation.
- **Cognitive Engine:** Utilizes Google Gemini (via `gemini-3-pro-preview`) for high-fidelity reasoning.
- **Resilient Parsing:** Implements heuristic JSON repair to handle truncated or malformed LLM responses.
- **The Vault:** A JSON-based file system storage mechanism for "Cold Storage" of agent identities.

### The Artifacts (The DNA)

#### 1. Sovereign Agent Manifest (`.json`)
The operational blueprint for an autonomous agent:
- **Identity:** Designation, Prime Directive, Philosophy.
- **Immune System:** Hard/Soft constraints.
- **Capability Graph:** Tools (with Risk Levels), Workflows, and Abilities.
- **Anchors:** Infrastructure dependencies.
- **Cryptography:** Signed with client-side ECDSA P-256 keys.

#### 2. Context Capsule (`.html` / `.json`)
A portable knowledge node containing:
- **Overview & Taglines:** High-level framing.
- **Key Concepts:** Atomic ideas extracted from source.
- **Personas & Workflows:** Operational guides.
- **Resilience Metrics:** Failure modes and mitigations.
- **Artifact:** Compiles into a standalone, single-file HTML page for distribution.

## 🚀 Deployment

### Prerequisites
- Node.js v18+
- Google Gemini API Key

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-org/sovereign-agent-forge.git
    cd sovereign-agent-forge
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

4.  **Ignite the Forge**
    ```bash
    npm start
    ```

## 📖 Usage Protocol

### 🛠️ Agent Forge
1.  **Ingest:** Provide a URL (e.g., `https://docs.stripe.com/api`) or raw text context.
2.  **Distill:** The Architect will analyze the material and propose a Sovereign Identity.
3.  **Refine:** Use the "Architectural Discourse" chat to tweak constraints.
4.  **Filter:** Toggle "External Tools" visibility based on **Risk Level** (Critical/High/Medium/Low) to assess safety.
5.  **Manifest:** Save the agent to your **Vault**.

### 📚 Agent Library
1.  **Browse:** View a grid of all authorized agents currently residing in the local Vault.
2.  **Inspect:** Review core philosophies, stats (Tools/Abilities/Anchors), and designations at a glance.
3.  **Restore:** Select any agent to load it back into the **Agent Forge** for updates or re-signing.

### 🧪 Capsule Lab
1.  **Input:** Paste a research paper, messy notes, or an existing Agent Manifest.
2.  **Transmute:** Click "Generate Capsule" to restructure the data into a standard SCOS Capsule format.
3.  **Mint:** Download the `.json` for data portability or the `.html` artifact for a beautiful, standalone documentation page.

## ⚠️ Security Directives

- **API Keys:** Never commit `.env` files.
- **Agent Risks:** Always review "Critical" risk tools before deploying agents to a runtime environment.
- **Vault Integrity:** Ensure `sovereign_vault.json` backups are stored in secure, encrypted locations.

---
*Built for the Sovereign Cognitive OS.*