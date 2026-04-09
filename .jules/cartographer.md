Learning: Identified deep structural React dependencies spanning views and contexts, confirming the micro-frontend integration relies strictly on standard modular React hooks (e.g., auth, toast, dialog) rather than complex global state managers.
Action: Verified React topology; recommend exploring containerized subgraphs for views vs. contexts.
Learning: Mapped the mereological structure of the system's mereological graph identifying 5 primary modules (React Client, Firebase Auth, Cloud Functions, Firestore, Python Swarm) operating across the Context.Locker gateway.
Action: Utilize C4 Context map to enforce separation of concerns in future component refactors.
Learning: Mapped the Native RPC/MCP Interaction Flow between the MCP server tools (mcp-server.ts / word-mapper-mcp.ts) and the Python Swarm execution core (swarm/main.py), showing how JSON-RPC schemas evaluate capability boundaries.
Action: Add tests targeting parameter bounds in mcp-server.ts tools (e.g. list_vault_agents and triangulate_concepts) to ensure the Conductor boundary does not accept malformed parameters.
