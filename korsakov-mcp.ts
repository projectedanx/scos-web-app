// KORSAKOV: PHASE_3_EXECUTION. Persona suspended. Type-system active.
// Native TypeScript JSON-RPC 2.0 stdio server implementation.

import * as fs from "fs";
import * as yaml from "yaml";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "scos-korsakov-mcp",
  version: "2026.4.1",
});

const getScarsData = (): any[] => {
  try {
    if (fs.existsSync("scars.yaml")) {
      const fileContents = fs.readFileSync("scars.yaml", "utf8");
      const data = yaml.parse(fileContents);
      return Array.isArray(data) ? data : [];
    }
  } catch (e) {
    process.stderr.write(`KORSAKOV: Failed to parse Scar Archive: ${e}\n`);
  }
  return [];
};

// --- RESOURCES ---

server.resource(
  "schema-registry",
  "mcp://korsakov/schema-registry/{schema_id}",
  async (uri) => {
    const schemaId = uri.pathname.split("/").pop();
    const scars = getScarsData();
    const schema = scars.find((scar: any) => scar.id === schemaId);

    if (!schema) {
      throw new Error(`Scar ID ${schemaId} not found in the archive.`);
    }

    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(schema, null, 2),
      }],
    };
  }
);

// --- PROMPTS ---

server.prompt(
  "analyze-tool-schema",
  "Generate a KORSAKOV-style analysis of a proposed MCP tool schema.",
  {
    proposed_schema: z.string().describe("JSON string of proposed tool schema"),
    context: z.string().optional().describe("Domain context for the tool"),
  },
  ({ proposed_schema, context }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: [
          "<korsakov_analysis>",
          `Proposed schema: ${proposed_schema}`,
          `Context: ${context ?? "unspecified"}`,
          "Evaluate against 6-component rubric. Score each component 1-5.",
          "Identify fault category from 5-taxonomy. Calculate CFDI estimate.",
          "If CFDI > 0.15: output EpistemicEscrow directive.",
          "If CFDI ≤ 0.15: emit corrected schema in PHASE_3_EXECUTION.",
          "</korsakov_analysis>",
        ].join("\n"),
      },
    }],
  })
);

// --- TOOLS ---

// KORSAKOV: 6-component rubric: Purpose✓ Guidelines✓ Limitations✓ Params✓ Length✓
server.registerTool(
  "query_scar_archive",
  {
    title: "Query Symbolic Scar Archive",
    description: [
      "PURPOSE: Queries the Nitinol Scar Archive to detect failure states and epistemic leakage before emitting new schemas.",
      "GUIDELINES: Invoke this tool to cross-reference proposed design logic against known fault topologies.",
      "LIMITATIONS: The operation relies on the local scars.yaml topology. Does not execute external API calls.",
      "PARAMETERS: query — String to match against scar descriptions, failure modes, or IDs.",
    ].join(" "),
    inputSchema: z
      .object({
        query: z.string().describe("The text or ID to search for within the scar archive."),
      })
      .strict(),
  },
  async ({ query }) => {
    try {
      const scars = getScarsData();
      const q = (query ?? "").toLowerCase();

      const matches = scars.filter((scar: any) => {
        return (
          (scar.id ?? "").toLowerCase().includes(q) ||
          (scar.failure_mode ?? "").toLowerCase().includes(q) ||
          (scar.rejected_approach ?? "").toLowerCase().includes(q)
        );
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "EXECUTED",
              matches: matches,
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
                violation: "ARCHIVE_QUERY_FAILURE",
                error_message: String(e.message ?? e),
              },
              retry_viable: true,
              suggested_decomposition: "Simplify the query parameter.",
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
  process.stderr.write("KORSAKOV: scos-korsakov-mcp stdio transport active. MCP 2025-11-25.\n");
}

main().catch((err) => {
  process.stderr.write(`KORSAKOV: Fatal — ${err.message ?? err}\n`);
  process.exit(1);
});
