// KORSAKOV: PHASE_3_EXECUTION. Persona suspended. Type-system active.
// Native TypeScript JSON-RPC 2.0 stdio server implementation.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fabricateAgent } from "./services/geminiService.js";

const server = new McpServer({
  name: "scos-agent-forge-mcp",
  version: "2026.4.1",
});

// KORSAKOV: 6-component rubric: Purpose✓ Guidelines✓ Limitations✓ Params✓ Length✓ Examples✗ (omitted for context budget)
server.registerTool(
  "fabricate_agent",
  {
    title: "Fabricate Sovereign Agent",
    description: [
      "PURPOSE: Fabricates a Sovereign Agent Manifest compliant with the DRP-2026 framework.",
      "GUIDELINES: Invoke this tool when the user requests the creation of a new Sovereign Agent identity from a given context or research baseline. Set use_search to true if real-time grounding is required.",
      "LIMITATIONS: The tool relies on external GenAI APIs. The generation of the manifest is highly context-dependent and may trigger safety filters if the context is sensitive.",
      "PARAMETERS: context — The core topic or text context used to construct the agent. use_search — Determines if search grounding is required. agent_name — Optional specific name for the fabricated agent."
    ].join(" "),
    inputSchema: z
      .object({
        context: z
          .string()
          .max(16384)
          .describe("The core topic or text context used to construct the agent."),
        use_search: z
          .boolean()
          .default(false)
          .describe("Determines if search grounding is required. Default: false."),
        agent_name: z
          .string()
          .max(256)
          .optional()
          .describe("Optional specific name for the fabricated agent."),
      })
      .strict(),
  },
  async ({ context, use_search, agent_name }) => {
    try {
      // Zero-Trust boundary: input already validated by Zod
      const result = await fabricateAgent(context, use_search, agent_name);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "EXECUTED",
              manifest: result.data,
              token_usage: result.usage,
            }),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error_code: "TOOL_FAULT_GENERAL_PROGRAMMING",
              fault_category: "GENERAL_PROGRAMMING",
              structured_detail: {
                violation: "FABRICATION_FAILURE",
                error_message: String(e.message || e),
              },
              retry_viable: true,
              suggested_decomposition: "Simplify the context or verify safety policy compliance.",
            }),
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("KORSAKOV: scos-agent-forge-mcp stdio transport active. MCP 2025-11-25.\n");
}

main().catch((err) => {
  process.stderr.write(`KORSAKOV: Fatal — ${err.message}\n`);
  process.exit(1);
});
