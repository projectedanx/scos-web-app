## Inspector — Capsule Compiler XSS & Null Boundary Interrogation
**Edge Case:** The `capsuleCompiler.ts` module constructs HTML by heavily relying on nested optional chaining (`?.`) and loose coalescing (`??`) without comprehensive bounds testing for completely undefined payloads, missing deep nested arrays, or malicious XSS injection within title and content strings.
**Assertion:** Bombarded the HTML generator with a completely null payload, simulated nested objects missing mandatory iteration arrays, and injected `<script>`, `<iframe>`, and special characters to mathematically prove the pure functions default to empty strings without crashing and the `escapeHtml` accurately neutralizes malicious tags.

## Inspector — Capsule Compiler Key Concepts & Personas Interrogation
**Edge Case:** The `renderPersonas` and `renderKeyConcepts` HTML generation functions in `capsuleCompiler.ts` completely lacked test coverage, leaving potential edge cases involving undefined arrays and missing literal string properties untested.
**Assertion:** Targeted the generator pure functions with null array properties and explicit `undefined` object fields within the payload to mathematically verify that the implementation securely defaulted to empty strings rather than leaking "undefined" text or crashing the loop. Sabotaged the function boundary logic to prove the failure.

## Inspector — CryptoService Boundary Interrogation
**Edge Case:** The `hashContent`, `signData`, and `verifySignature` functions in `cryptoService.ts` lacked test coverage, creating vulnerabilities around deterministic hashing and the parsing of malformed or invalid hex strings when verifying ECDSA signatures.
**Assertion:** Assailed the crypto validation logic with corrupted input objects, invalid ECDSA signature hashes, and malformed strings designed to crash the `Uint8Array` parser boundary. Mathematically verified that catch blocks degrade securely and simulated a Sabotage Check by mutating the signature algorithm to SHA-1 to prove the tests actively police the SHA-256 requirement.

## Inspector — JSON Schema and Timeout Boundary Assertions for GeminiService
**Edge Case:** The orchestrating LLM integration `services/geminiService.ts` lacked native unit test coverage for its structural validation logic (e.g. `validateAgentManifest`, `validateResearchPlan`) and asynchronous timeout boundaries via `AbortController`.
**Assertion:** Wrote a test suite in `services/__tests__/geminiService.test.ts` utilizing native mocks for `global.fetch` to bombard the integration logic with malformed schemas, missing arrays, truncated JSON structures, and unresolvable network states to mathematically verify the fallback triggers, error boundaries, and self-repairing functions executed properly under stress.

## Inspector — Crypto Service Test Improvement
**Edge Case:** Test the success path of generateCommanderKeys explicitly to verify it interfaces with the cryptography API (subtle) correctly.
**Assertion:** Mocked the crypto.subtle API to intercept generateKey and exportKey calls, then verified the correct ECDSA P-256 algorithms, parameters, and that keys are successfully returned.
