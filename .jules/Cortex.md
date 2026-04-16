## Cortex — Structural Enforcement of JSON Parsing
**Learning:** Heuristic string parsing introduces downstream type hazards by forcing truncated structures into unexpected states, bypassing strict validation.
**Action:** Always rely on native SDK structural schema enforcement and strict runtime validation. Replace heuristic repair with `secureJSONParse` and explicit falsy fallback guards to ensure truncated payloads fail fast and trigger deterministic retry loops.

## Cortex — Deterministic Shell Upgrade
**Learning:** Legacy Python SDKs (like `google.generativeai`) allow raw JSON extraction but don't natively enforce strict Pydantic return types in `response.parsed`. By upgrading to `google.genai`, we can pass structural schemas directly via `types.GenerateContentConfig` and eliminate manual string parsing while explicitly enforcing network timeouts.
**Action:** When migrating AI SDKs, enforce a deterministic boundary by migrating to the latest schema-aware native SDK, standardizing `secureJSONParse` across the TS codebase, and ensuring `if (!parsed)` explicit falsy fallbacks are present before continuing execution.

## Cortex — Deterministic JSON Plumbing in MCP
**Learning:** Reimplementing heuristic schema validation mechanisms directly inside specific boundary servers (like `SchemaValidator.parse` in `mcp-server.ts`) breaks the DRY principle, misses the globally enforced prototype pollution checks, and risks downstream runtime crashes.
**Action:** Always import centralized, robust determinisitic parsers (e.g. `secureJSONParse` from `utils/json.js`) in execution boundaries and rely on their native explicitly enforced falsy and prototype pollution checks.

## Cortex — Dependency Migration
**Learning:** When Python codebase integrates the `google.genai` SDK natively without corresponding lock file updates, `ModuleNotFoundError` will occur downstream. Replacing `google.generativeai` with `google-genai` resolves this deterministic boundary gap.
**Action:** Always verify requirements.txt explicitly reflects the structural schema bindings of the core modules utilized.
