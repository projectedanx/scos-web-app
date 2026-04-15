🎯 What: Replaced manual JSON parsing logic inside `mcp-server.ts` with the centralized `secureJSONParse` function from `utils/json.js`.
💡 Why: This mitigates prototype pollution vulnerabilities that could arise from unsafe manual JSON string parsing, prevents manual bypasses of deterministic boundary checks, and enforces global strict falsy fallback structures for truncated payloads.
🧹 Scope: `mcp-server.ts`.
📊 Delta: Replaced manual string parsing with secure centralized function, eliminating 1 unsafe `JSON.parse` hazard.
