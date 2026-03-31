Learning: Discovered `services/conductorService.ts`, which bridges SCOS Manifests to standard OpenAPI/JSON Schemas for external environments like Model Context Protocol (MCP) and Conductor. This represents a critical trust and compatibility boundary, transforming local JSON manifests into executable Python code and schema interfaces.
Action: Add a C4Context diagram to `ARCHITECTURE.md` mapping the `Conductor Compatibility Boundary` between the local React vault and external execution layer (`scos-core` Python Swarm and Conductor Platform).

Learning: Discovered complex multi-agent Council flow logic in `services/geminiService.ts` (`councilDiscovery`, `councilSynthesis`, `councilCritique`, `councilFinalize`). This represents a sophisticated LLM-driven consensus algorithm over multiple steps.
Action: Add a Mermaid sequence diagram detailing the `Agent Council Synthesis Flow` showing the orchestration of Strategist, Immunologist, Engineer, Linguist, and Historian roles, to `ARCHITECTURE.md`.
Learning: Discovered exact Firestore database topography handling batches and real-time syncing via firestoreService.ts
Action: Continue mapping data flows through NoSQL boundaries into backend markdown files.
