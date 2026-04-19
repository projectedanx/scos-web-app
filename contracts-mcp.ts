// KORSAKOV: PHASE_3_EXECUTION. Persona suspended. Type-system active.
// Native TypeScript JSON-RPC 2.0 stdio server implementation.

import { secureJSONParse } from "./utils/json.js";

import * as fs from "fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "scos-contracts-mcp",
  version: "2026.4.1",
});


const getVaultData = (): { contracts: any[] } => {
  const vaultPath = process.env.SCOS_VAULT_PATH;
  if (vaultPath && fs.existsSync(vaultPath)) {
    try {
      const data = fs.readFileSync(vaultPath, "utf-8");
      const parsed = secureJSONParse(data);
      if (!parsed) {
        process.stderr.write(`Falsy vault data detected.\n`);
        return { contracts: [] };
      }
      return {
        contracts: parsed.contracts ?? [],
      };
    } catch (e) {
      process.stderr.write(`Failed to read vault: ${e}\n`);
    }
  }
  return { contracts: [] };
};

// KORSAKOV: 6-component rubric: Purpose✓ Guidelines✓ Limitations✓ Params✓ Length✓
server.registerTool(
  "list_contracts",
  {
    title: "List Vault Contracts",
    description: [
      "PURPOSE: Lists all Cognitive Contracts available in the currently accessible vault.",
      "GUIDELINES: Invoke this to discover available contracts and their statuses.",
      "LIMITATIONS: Only returns contracts from the locally provided vault export.",
      "PARAMETERS: None required.",
    ].join(" "),
    inputSchema: z.object({}).strict(),
  },
  async () => {
    try {
      const vaultData = getVaultData();
      const contracts = vaultData.contracts.map((c: any) => ({
        id: c.id,
        title: c.title,
        status: c.status,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ status: "SUCCESS", contracts }),
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
                violation: "READ_FAILURE",
                error_message: String(e.message ?? e),
              },
              retry_viable: true,
              suggested_decomposition: null,
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
  "get_contract",
  {
    title: "Get Contract Details",
    description: [
      "PURPOSE: Retrieves the complete Cognitive Contract artifact for a given contract ID.",
      "GUIDELINES: Use this to inspect the goals, constraints, and assigned agents of a specific project.",
      "LIMITATIONS: Will fail if the contract ID is not found in the vault.",
      "PARAMETERS: contract_id — string, exactly matching the target contract's id property.",
    ].join(" "),
    inputSchema: z
      .object({
        contract_id: z.string().describe("The exact ID of the contract to retrieve."),
      })
      .strict(),
  },
  async ({ contract_id }) => {
    try {
      if (!contract_id) {
         throw new Error("Missing contract_id argument.");
      }

      const vaultData = getVaultData();
      const contract = vaultData.contracts.find((c: any) => c.id === contract_id);

      if (!contract) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error_code: "TOOL_FAULT_SERVER_TOOL_CONFIGURATION",
                fault_category: "SERVER_TOOL_CONFIGURATION",
                structured_detail: {
                  violation: "CONTRACT_NOT_FOUND",
                  contract_id,
                },
                retry_viable: true,
                suggested_decomposition: "Use list_contracts to discover valid contract IDs before requesting specific details.",
              }),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ status: "SUCCESS", contract }),
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
                violation: "READ_FAILURE",
                error_message: String(e.message ?? e),
              },
              retry_viable: false,
              suggested_decomposition: null,
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
  process.stderr.write("KORSAKOV: scos-contracts-mcp stdio transport active. MCP 2025-11-25.\n");
}

main().catch((err) => {
  process.stderr.write(`KORSAKOV: Fatal — ${err.message}\n`);
  process.exit(1);
});