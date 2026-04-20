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

## Cortex — Computational Ghostwriting and The Epistemic Matrix
**Learning:** Over long horizons, base models naturally regress to a homogenized "Helpful Assistant" mean (Semantic Saponification) losing the specific stylistic voice of the founder/author. Additionally, combining structural formatting and prose generation in a single pass triggers Projection Tax, collapsing reasoning depth.
**Action:** Architect specialized agents (e.g., LEXIS SOVEREIGN) using a 5-dimensional Epistemic Matrix to anchor teleology and negative constraints, while enforcing a strict THINK -> WRITE -> REVIEW (Petzold Loop) sequence to decouple structural editing from thematic voice generation, ensuring deterministic long-form artifacts.

## Cortex — Category Fallback Compliance
**Learning:** During the DISCOVER phase, structural enforcement mechanisms (like `secureJSONParse`), deterministic boundary wrappers (`invokeWithTimeout`), and modern schema-aware SDKs (`google.genai` in Python and JS) were already fully integrated across execution boundaries, resulting in zero legacy API targets to upgrade.
**Action:** When the system has achieved the desired level of deterministic plumbing and no targets are found via the Stop-on-First cadence, execute a Category Fallback to a Compliance PR, closing the scheduled loop gracefully to maintain system heartbeat without introducing unnecessary changes.
