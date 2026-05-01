## Modernizer — DAX-01 Blueprint Adoption
**Learning:** Evaluator agent blueprints (such as ALETHEON and the new DAX) implement complex Markdown structures that inherently clash with standardized linting rules, notably MD013 (Line Length) and MD040 (Fenced Code Block Languages), particularly when nested code blocks are required to define formatting templates.
**Action:** Always test new documentation artifacts against the project's linter (`npx markdownlint-cli`). Provide an Environment Fallback if necessary by either fixing the offending styles or, if strictly required by the design pattern, safely modifying `.markdownlint.json` to disable structural checks that interfere with valid schema definitions.

## Modernizer — Refactor logical OR to nullish coalescing for numeric API payloads
**Learning:** Upgrading logical OR (`||`) to nullish coalescing (`??`) in API parsing protects against valid numeric falsy values (like `0`) being overridden, avoiding non-deterministic state management. However, when parsing AI generated text responses, `||` should be retained if an empty string `""` should trigger the fallback logic.
**Action:** Always prefer `??` for numeric payload assignment but carefully evaluate if string fallbacks require `||` to handle empty strings.
