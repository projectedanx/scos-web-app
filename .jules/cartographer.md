## Cartographer — MCP Ecosystem Atlas

**Learning:** SCOS implements a robust Multi-Server MCP integration pattern, isolating distinct functional domains (Vault access, Prompt Forging, Word Mapping, Capsule Compilation, and Conductor Schema generation) into separate Node.js scripts serving JSON-RPC over stdio.

**Action:** When making future architectural modifications or adding new capabilities, ensure changes are explicitly mapped within the appropriate domain boundary in `docs/MCP_ECOSYSTEM_ATLAS.md` using the C4/Sequence diagram conventions established.