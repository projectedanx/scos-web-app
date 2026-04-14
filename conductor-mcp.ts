// KORSAKOV: PHASE_3_EXECUTION. Persona suspended. Type-system active.
// Native TypeScript JSON-RPC 2.0 stdio server implementation.

import { secureJSONParse } from "./utils/json.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  validateConductorSchema,
  transformToConductor,
  generatePythonStubs
} from "./services/conductorService.js";
import type { SovereignAgentManifest } from "./types.js";

const server = new McpServer({
  name: "scos-conductor-mcp",
  version: "2026.4.1",
});

// Helper to securely parse the manifest string


// KORSAKOV: 6-component rubric: Purpose✓ Guidelines✓ Limitations✓ Params✓ Length✓
server.registerTool(
  "validate_conductor_schema",
  {
    title: "Validate Conductor Schema Mapping",
    description: [
      "PURPOSE: Validates that a Sovereign Agent Manifest maps correctly to Conductor's tool definitions.",
      "GUIDELINES: Invoke this tool before exporting an agent to verify no structural issues exist.",
      "LIMITATIONS: The operation requires a valid stringified JSON SovereignAgentManifest.",
      "PARAMETERS: manifest_json — The complete SovereignAgentManifest JSON object as a string.",
    ].join(" "),
    inputSchema: z
      .object({
        manifest_json: z.string().describe("The stringified SovereignAgentManifest JSON payload."),
      })
      .strict(),
  },
  async ({ manifest_json }) => {
    try {
      if (!manifest_json) {
        throw new Error("Missing manifest_json argument.");
      }
      const manifest = secureJSONParse(manifest_json) as SovereignAgentManifest;
      if (!manifest) {
         throw new Error("Parsed manifest is falsy.");
      }
      const validation = validateConductorSchema(manifest);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "EXECUTED",
              valid: validation.valid,
              errors: validation.errors
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
                violation: "VALIDATION_FAILURE",
                error_message: String(e.message || e),
              },
              retry_viable: false,
              suggested_decomposition: "Ensure the manifest_json payload is a valid JSON string representing the SovereignAgentManifest.",
            }),
          },
        ],
        isError: true,
      };
    }
  }
);

// KORSAKOV: 6-component rubric: Purpose✓ Guidelines✓ Limitations✓ Params✓ Length✓
server.registerTool(
  "transform_to_conductor",
  {
    title: "Transform Manifest to Conductor Skill",
    description: [
      "PURPOSE: Transforms a Sovereign Agent Manifest into a Conductor-ready Skill Manifest JSON.",
      "GUIDELINES: Invoke this tool to generate the OpenAPI/JSON schema format required by Conductor.",
      "LIMITATIONS: Requires a structurally valid SovereignAgentManifest. Fails if invalid.",
      "PARAMETERS: manifest_json — The complete SovereignAgentManifest JSON object as a string.",
    ].join(" "),
    inputSchema: z
      .object({
        manifest_json: z.string().describe("The stringified SovereignAgentManifest JSON payload."),
      })
      .strict(),
  },
  async ({ manifest_json }) => {
    try {
      if (!manifest_json) {
        throw new Error("Missing manifest_json argument.");
      }
      const manifest = secureJSONParse(manifest_json) as SovereignAgentManifest;
      if (!manifest) {
         throw new Error("Parsed manifest is falsy.");
      }

      const validation = validateConductorSchema(manifest);
      if (!validation.valid) {
         throw new Error(`Manifest is invalid: ${validation.errors.join(", ")}`);
      }

      const conductorManifest = transformToConductor(manifest);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "EXECUTED",
              conductor_manifest: conductorManifest
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
                violation: "TRANSFORMATION_FAILURE",
                error_message: String(e.message || e),
              },
              retry_viable: false,
              suggested_decomposition: "Verify manifest_json validity using validate_conductor_schema first.",
            }),
          },
        ],
        isError: true,
      };
    }
  }
);

// KORSAKOV: 6-component rubric: Purpose✓ Guidelines✓ Limitations✓ Params✓ Length✓
server.registerTool(
  "generate_python_stubs",
  {
    title: "Generate Swarm Node Python Stubs",
    description: [
      "PURPOSE: Generates a Python boilerplate script compatible with the scos-core Swarm logic for the given agent.",
      "GUIDELINES: Invoke this tool to obtain the Python node code that implements the agent's logic.",
      "LIMITATIONS: Requires a valid stringified SovereignAgentManifest.",
      "PARAMETERS: manifest_json — The complete SovereignAgentManifest JSON object as a string.",
    ].join(" "),
    inputSchema: z
      .object({
        manifest_json: z.string().describe("The stringified SovereignAgentManifest JSON payload."),
      })
      .strict(),
  },
  async ({ manifest_json }) => {
    try {
      if (!manifest_json) {
        throw new Error("Missing manifest_json argument.");
      }
      const manifest = secureJSONParse(manifest_json) as SovereignAgentManifest;
      if (!manifest) {
         throw new Error("Parsed manifest is falsy.");
      }

      const pythonStubs = generatePythonStubs(manifest);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "EXECUTED",
              python_code: pythonStubs
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
                violation: "STUB_GENERATION_FAILURE",
                error_message: String(e.message || e),
              },
              retry_viable: false,
              suggested_decomposition: "Ensure manifest_json contains valid tool definitions.",
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
  process.stderr.write("KORSAKOV: scos-conductor-mcp stdio transport active. MCP 2025-11-25.\n");
}

main().catch((err) => {
  process.stderr.write(`KORSAKOV: Fatal — ${err.message}\n`);
  process.exit(1);
});
