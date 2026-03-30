## Cortex — Structural Mapping Shield
**Learning:** Legacy `JSON.parse()` on `httpsCallable` returns lack structural validation and execution timeouts, risking application hangs when the LLM core response is non-deterministic.
**Action:** Enforce strict deterministic boundaries by wrapping proxy calls in `AbortController` signals with a 15-second timeout and replace naive parsing with defensive runtime schema validators mimicking Pydantic/Zod structures natively.

## Cortex — Deterministic Shell Upgrade
**Learning:** Legacy `JSON.parse()` without structural validation, and LLM SDK calls missing `AbortController` signals, cause non-deterministic behavior and application hangs.
**Action:** Enforce strict deterministic boundaries by injecting a 15-second `AbortController` signal into `ai.models.generateContent` calls, and implement native schema validation (mimicking Pydantic/Zod) for `RESEARCH_PLAN_SCHEMA`, `AGENT_SCHEMA`, `CAPSULE_SCHEMA`, and `ANALYSIS_SCHEMA` responses.
