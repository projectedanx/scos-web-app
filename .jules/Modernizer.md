## Modernizer — Upgrading JSON.parse to secureJSONParse
**Learning:** Replaced raw JSON.parse with secureJSONParse to safely handle non-deterministic outputs and prevent Prototype Pollution, maintaining explicit truthy checks upon parsing.
**Action:** Continue to verify closure logic, apply fallback defaults `|| []` or conditional branching when upgrading parse routines.

## Modernizer — Agnostic Nullish Coalescing in MCP Server
**Learning:** Legacy logical OR (`||`) fallbacks risk masking valid falsy values (like empty strings or zeroes) in parsed API payloads and request parameters.
**Action:** Replaced loose `||` with strict nullish coalescing (`??`) in `mcp-server.ts` and `contracts-mcp.ts` to enforce strict null-checks and guarantee type-safety without masking valid falsy values.

## Modernizer — Agnostic Nullish Coalescing
**Learning:** When parsing JSON-RPC or API arguments, checking for property existence and type using the loose `||` operator (e.g. `!args || typeof args.property !== 'string'`) is a fossilized syntax pattern. It can mask falsy object payloads entirely. Using modern optional chaining coupled with exact type checks (e.g., `typeof args?.property !== 'string'`) provides a robust, native way to resolve deep properties while mitigating runtime errors.
**Action:** Enforce optional chaining and strict type checks for nested payload properties in API route validators and MCP servers.

## Modernizer — Agnostic Nullish Coalescing in Frontend Views
**Learning:** Legacy logical OR (`||`) fallbacks risk masking valid falsy values (like empty strings or zeroes) in React components, which can lead to UI rendering bugs.
**Action:** Replaced loose `||` with strict nullish coalescing (`??`) in `views/CapsuleLabView.tsx` to enforce strict null-checks and guarantee type-safety.
