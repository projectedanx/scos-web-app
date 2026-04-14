## Modernizer — Agnostic Nullish Coalescing in wordMapperService
**Learning:** Loose logical OR (`||`) fallbacks on token counts and response data risk false-falsy bugs if a value is legitimately `0` or `""`.
**Action:** Replaced loose `||` with strict nullish coalescing (`??`) to enforce strict null-checks and guarantee type-safety without masking valid falsy values.
