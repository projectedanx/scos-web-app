## Cortex — Structural Mapping Shield
**Learning:** Legacy `JSON.parse()` on `httpsCallable` returns lack structural validation and execution timeouts, risking application hangs when the LLM core response is non-deterministic.
**Action:** Enforce strict deterministic boundaries by wrapping proxy calls in `AbortController` signals with a 15-second timeout and replace naive parsing with defensive runtime schema validators mimicking Pydantic/Zod structures natively.
