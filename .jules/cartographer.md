Learning: Discovered complex but undocumented Firestore relational schemas nested within `firebase-blueprint.json` and NoSQL collection definitions. Identified the `swarm_queue` implementation acting as a critical trust boundary bridging the React frontend and Python background workers.
Action: Generated `docs/DATA_MODEL.md` to visually map the undocumented schema topography and message queue event flow using Mermaid `erDiagram` and `sequenceDiagram`.
Learning: The `swarm/main.py` execution node operates as an offline background worker processing `swarm_queue` tasks from Firestore and implements cryptographic trust validation via ECDSA P-256 before invoking external Gemini LLM APIs.
Action: Append `C4Container` and `sequenceDiagram` to `ARCHITECTURE.md` to map the `swarm/main.py` execution layer and cryptographic trust boundary.
Learning: Discovered `contracts-mcp.ts` executing as an MCP server with `list_contracts` and `get_contract` tools, integrating with the JSON-RPC stdio boundary but missing from the MCP System Atlas.
Action: Update `docs/MCP_ECOSYSTEM_ATLAS.md` to map the `contracts-mcp.ts` architectural boundary and document its `list_contracts` and `get_contract` tools in the Component map.
Learning: Discovered `secureProxy` Cloud Function in `functions/src/index.ts` acting as a secure boundary encapsulating the `GEMINI_API_KEY` via Google Cloud Secret Manager.
Action: Generated `docs/SERVERLESS_TRUST_BOUNDARY.md` mapping the serverless proxy boundary and execution flow using Mermaid `C4Context` and `sequenceDiagram`.
Learning: The SCOS Multi-Server MCP Ecosystem includes a conceptual 'scos-korsakov-mcp' server boundary that exposes the 'scars.yaml' file (Nitinol Archive / Symbolic Scar Registry), which was missing from the MCP Ecosystem Atlas topography.
Action: Add 'scos-korsakov-mcp' to the C4Context and C4Container maps in docs/MCP_ECOSYSTEM_ATLAS.md.
