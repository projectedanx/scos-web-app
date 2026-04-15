## Modernizer — Agnostic Nullish Coalescing in MCP Server
**Learning:** Legacy logical OR (`||`) fallbacks risk masking valid falsy values (like empty strings or zeroes) in parsed API payloads and request parameters.
**Action:** Replaced loose `||` with strict nullish coalescing (`??`) in `mcp-server.ts` to enforce strict null-checks and guarantee type-safety without masking valid falsy values.
