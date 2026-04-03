## Inspector — Capsule Compiler XSS & Null Boundary Interrogation
**Edge Case:** The `capsuleCompiler.ts` module constructs HTML by heavily relying on nested optional chaining (`?.`) and loose coalescing (`??`) without comprehensive bounds testing for completely undefined payloads, missing deep nested arrays, or malicious XSS injection within title and content strings.
**Assertion:** Bombarded the HTML generator with a completely null payload, simulated nested objects missing mandatory iteration arrays, and injected `<script>`, `<iframe>`, and special characters to mathematically prove the pure functions default to empty strings without crashing and the `escapeHtml` accurately neutralizes malicious tags.

## Inspector — Capsule Compiler Key Concepts & Personas Interrogation
**Edge Case:** The `renderPersonas` and `renderKeyConcepts` HTML generation functions in `capsuleCompiler.ts` completely lacked test coverage, leaving potential edge cases involving undefined arrays and missing literal string properties untested.
**Assertion:** Targeted the generator pure functions with null array properties and explicit `undefined` object fields within the payload to mathematically verify that the implementation securely defaulted to empty strings rather than leaking "undefined" text or crashing the loop. Sabotaged the function boundary logic to prove the failure.
