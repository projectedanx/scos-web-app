// KORSAKOV: PHASE_3_EXECUTION. Persona suspended. Type-system active.
// Native TypeScript JSON-RPC 2.0 stdio server implementation.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { triangulateConcepts, MapStrategy } from "./services/wordMapperService.js";

const server = new McpServer({
  name: "scos-word-mapper-mcp",
  version: "2026.4.1",
});

// KORSAKOV: 6-component rubric: Purpose✓ Guidelines✓ Limitations✓ Params✓ Length✓
server.registerTool(
  "triangulate_concepts",
  {
    title: "Semantic Word Mapper Triangulation",
    description: [
      "PURPOSE: Executes a semantic triangulation of concepts against Datamuse, ConceptNet, and LLM to build Worldview Ontologies or Anti-Pattern arrays.",
      "GUIDELINES: Invoke this tool when the agent requires expanding abstract concepts into concrete maps, identifying invariants, or plotting semantic drift.",
      "LIMITATIONS: The operation relies on external APIs (Datamuse, ConceptNet, GenAI). Network timeouts or rate limits may cause failures.",
      "PARAMETERS: seeds — Array of strings (the base concepts). strategy — The mapping mode to use (e.g. GENERAL, WORLDVIEW, TRACER, ANTI_PATTERN).",
    ].join(" "),
    inputSchema: z.object({
      seeds: z
        .array(z.string().max(256))
        .min(1)
        .max(10)
        .describe("Array of base concepts to map. Minimum 1, Maximum 10 seeds."),
      strategy: z
        .enum([
          "GENERAL",
          "WORLDVIEW",
          "TRACER",
          "ANTI_PATTERN",
          "SCAFFOLDING",
          "POLYSEMY",
        ])
        .default("GENERAL")
        .describe("The Mapping Strategy mode to apply to the semantic generation."),
    }),
  },
  async ({ seeds, strategy }) => {
    try {
      const mapStrategy = strategy as MapStrategy;
      const result = await triangulateConcepts(seeds, mapStrategy);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "EXECUTED",
              nodes: result.nodes,
              token_usage: result.usage
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
                violation: "TRIANGULATION_FAILURE",
                error_message: String(e.message || e),
              },
              retry_viable: true,
              suggested_decomposition: "Attempt with fewer seeds or a different strategy.",
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
  process.stderr.write("KORSAKOV: scos-word-mapper-mcp stdio transport active. MCP 2025-11-25.\n");
}

main().catch((err) => {
  process.stderr.write(`KORSAKOV: Fatal — ${err.message}\n`);
  process.exit(1);
});
