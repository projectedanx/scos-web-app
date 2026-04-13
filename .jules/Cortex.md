## Cortex — Compliance Verification

**Learning:** Legacy fetch implementations and `JSON.parse` invocations across the stack (`wordMapperService.ts`, `geminiService.ts`, `swarm/main.py`) already strictly enforce schema validation, timeouts, and prototype pollution guards. Falsy fallback hazards are already mitigated by explicit checks.
**Action:** Since no deterministic vulnerabilities remain, invoke the Category Fallback to generate a Zero Targets Compliance PR.
## Cortex — Top-level Architect
**Learning:** KORSAKOV must build a specific MCP server within SCOS based on the context. The context describes an architectural boundary between SCOS Vault manifests and a Swarm node, via Conductor/MCP layer, in `conductorService.ts`. I will build an MCP server that acts as a bridge to transform/validate SCOS Manifests, similar to the logic in `conductorService.ts`, or build `conductor-mcp.ts` to expose `validateConductorSchema`, `transformToConductor`, `generatePythonStubs`, etc.
**Action:** Enforce strict JSON Schema Draft 2020-12 compliance using Zod (`.strict()`) for all inputs, and use CABP / SERF patterns.
