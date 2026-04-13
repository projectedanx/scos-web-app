## Cortex — Top-level Architect
**Learning:** KORSAKOV must build a specific MCP server within SCOS based on the context. The context describes an architectural boundary between SCOS Vault manifests and a Swarm node, via Conductor/MCP layer, in `conductorService.ts`. I will build an MCP server that acts as a bridge to transform/validate SCOS Manifests, similar to the logic in `conductorService.ts`, or build `conductor-mcp.ts` to expose `validateConductorSchema`, `transformToConductor`, `generatePythonStubs`, etc.
**Action:** Enforce strict JSON Schema Draft 2020-12 compliance using Zod (`.strict()`) for all inputs, and use CABP / SERF patterns.

## Cortex — Structural Enforcement of JSON Parsing
**Learning:** Heuristic string parsing (e.g., `repairJson`) introduces downstream type hazards by forcing truncated structures into unexpected states, bypassing strict validation.
**Action:** Always rely on native SDK structural schema enforcement and strict runtime validation. Replace heuristic repair with `secureJSONParse` and explicit falsy fallback guards to ensure truncated payloads fail fast and trigger deterministic retry loops.
