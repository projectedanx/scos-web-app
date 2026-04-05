// KORSAKOV: PHASE_3_EXECUTION. Persona suspended. Type-system active.
// Native JSON-RPC 2.0 stdio server implementation.

import * as fs from 'fs';
import * as path from 'path';

// --- Native Schema Validator ---
const SchemaValidator = {
  parse: (jsonStr: string): any => {
    return JSON.parse(jsonStr, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });
  }
};

// --- JSON-RPC 2.0 Types ---
interface JSONRPCRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

interface JSONRPCResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// --- Server Implementation ---

function sendResponse(response: JSONRPCResponse) {
  process.stdout.write(JSON.stringify(response) + '\n');
}

function sendError(id: string | number, code: number, message: string, data?: any) {
  sendResponse({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data
    }
  });
}

// Local Vault Simulation for Server Use
// In a real deployed scenario, this might need to connect to Firebase.
// Since this is a local stdio server, we'll try to read from a local file if available,
// or provide a mock/empty vault for demonstration of protocol adherence.
const getVaultAgents = (): any[] => {
  // Try to read an exported vault file if passed as env var, or just return empty for now.
  const vaultPath = process.env.SCOS_VAULT_PATH;
  if (vaultPath && fs.existsSync(vaultPath)) {
    try {
        const data = fs.readFileSync(vaultPath, 'utf-8');
        const parsed = SchemaValidator.parse(data);
        return parsed.agents || [];
    } catch (e) {
        process.stderr.write(`Failed to read vault: ${e}\n`);
        return [];
    }
  }
  return [];
};

function handleInitialize(request: JSONRPCRequest) {
  sendResponse({
    jsonrpc: "2.0",
    id: request.id,
    result: {
      protocolVersion: "2025-11-25",
      capabilities: {
        tools: {
           listChanged: false
        }
      },
      serverInfo: {
        name: "scos-vault-mcp",
        version: "2026.4.1"
      }
    }
  });
}

function handleToolsList(request: JSONRPCRequest) {
  sendResponse({
    jsonrpc: "2.0",
    id: request.id,
    result: {
      tools: [
        {
          name: "list_vault_agents",
          description: [
             "PURPOSE: Lists all Sovereign Agents available in the currently accessible vault.",
             "GUIDELINES: Invoke this to discover available agents.",
             "LIMITATIONS: Only returns agents from the locally provided vault export.",
             "PARAMETERS: None required."
          ].join(" "),
          inputSchema: {
            $schema: "https://json-schema.org/draft/2020-12/schema",
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false
          }
        },
        {
          name: "get_agent_manifest",
          description: [
             "PURPOSE: Retrieves the complete Sovereign Agent Manifest for a given agent name.",
             "GUIDELINES: Use this to inspect the exact Epistemic Matrix and tools of an agent.",
             "LIMITATIONS: Will fail if the agent name is not found.",
             "PARAMETERS: agent_name — string, exactly matching the agent's identity.name."
          ].join(" "),
          inputSchema: {
            $schema: "https://json-schema.org/draft/2020-12/schema",
            type: "object",
            properties: {
              agent_name: {
                type: "string",
                maxLength: 256,
                description: "The name of the agent to retrieve."
              }
            },
            required: ["agent_name"],
            additionalProperties: false
          }
        }
      ]
    }
  });
}

async function handleToolsCall(request: JSONRPCRequest) {
  const { name, arguments: args } = request.params || {};

  if (name === "list_vault_agents") {
    const agents = getVaultAgents();
    const names = agents.map((a: any) => ({
       name: a.identity?.name,
       designation: a.identity?.designation
    }));
    sendResponse({
      jsonrpc: "2.0",
      id: request.id,
      result: {
        content: [{
          type: "text",
          text: JSON.stringify({ status: "SUCCESS", agents: names })
        }]
      }
    });
    return;
  }

  if (name === "get_agent_manifest") {
    if (!args || typeof args.agent_name !== 'string') {
        sendResponse({
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{
                type: "text",
                text: JSON.stringify({
                  error_code: "TOOL_FAULT_SERVER_TOOL_CONFIGURATION",
                  fault_category: "SERVER_TOOL_CONFIGURATION",
                  structured_detail: { violation: "MISSING_ARGUMENT", expected: "agent_name" },
                  retry_viable: false,
                  suggested_decomposition: null
                })
              }],
              isError: true
            }
        });
        return;
    }

    const agents = getVaultAgents();
    const agent = agents.find((a: any) => a.identity?.name === args.agent_name);

    if (!agent) {
         sendResponse({
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{
                type: "text",
                text: JSON.stringify({
                  error_code: "TOOL_FAULT_SERVER_TOOL_CONFIGURATION",
                  fault_category: "SERVER_TOOL_CONFIGURATION",
                  structured_detail: { violation: "AGENT_NOT_FOUND", agent_name: args.agent_name },
                  retry_viable: true,
                  suggested_decomposition: "Use list_vault_agents to find valid agent names."
                })
              }],
              isError: true
            }
        });
        return;
    }

    sendResponse({
      jsonrpc: "2.0",
      id: request.id,
      result: {
        content: [{
          type: "text",
          text: JSON.stringify({ status: "SUCCESS", manifest: agent })
        }]
      }
    });
    return;
  }

  sendError(request.id, -32601, "Method not found or tool not implemented");
}

let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const request: JSONRPCRequest = SchemaValidator.parse(line);

      if (request.method === "initialize") {
        handleInitialize(request);
      } else if (request.method === "notifications/initialized") {
        // Just acknowledge internally, no response needed for notifications
      } else if (request.method === "tools/list") {
        handleToolsList(request);
      } else if (request.method === "tools/call") {
        handleToolsCall(request);
      } else {
        // Unknown method
        sendError(request.id, -32601, `Method not found: ${request.method}`);
      }
    } catch (e: any) {
      process.stderr.write(`Error parsing request: ${e.message}\n`);
    }
  }
});

process.stderr.write("KORSAKOV: scos-vault-mcp stdio transport active. MCP 2025-11-25.\n");
