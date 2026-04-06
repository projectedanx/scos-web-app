Learning: Discovered an undocumented Sovereign Retry System mapping in `services/retryService.ts` representing a resilient execution boundary that mitigates transient failures (429, 5xx) via an exponential backoff loop and a fallback mechanism.
Action: Append a new Mermaid `sequenceDiagram` to `ARCHITECTURE.md` precisely mapping the resilient retry loop and its fallback execution paths.
