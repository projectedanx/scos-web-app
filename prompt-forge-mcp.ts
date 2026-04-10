// KORSAKOV: PHASE_3_EXECUTION. Persona suspended. Type-system active.
// Native TypeScript JSON-RPC 2.0 stdio server implementation.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generateMetaPrompt } from "./services/geminiService.js";
import { PromptEngineType } from "./types.js";

const server = new McpServer({
  name: "scos-prompt-forge-mcp",
  version: "2026.4.1",
});

// KORSAKOV: 6-component rubric: Purpose✓ Guidelines✓ Limitations✓ Params✓ Length✓ Examples✗ (omitted for context budget)
server.registerTool(
  "generate_meta_prompt",
  {
    title: "Generate Sovereign Meta-Prompt",
    description: [
      "PURPOSE: Executes a high-fidelity system prompt generation using the internal Gemini service.",
      "GUIDELINES: Invoke this tool when the agent requires generating advanced prompts like DRP, PRP, or SSP based on user intent.",
      "LIMITATIONS: Relies on the Gemini API. Network timeouts or safety filter triggers may cause failures.",
      "PARAMETERS: intent — User's topic or objective. engine_type — The type of prompt to generate. meta_system_prompt — The instructional constraints for generation. knowledge_context — Methodology or background data.",
    ].join(" "),
    inputSchema: z
      .object({
        intent: z
          .string()
          .max(4096)
          .describe("The core topic, intent, or task description requested by the user."),
        engine_type: z
          .enum(["DRP", "PRP", "SSP", "PIP", "CPP", "SDP"])
          .describe("The PromptEngineType indicating the output format/style."),
        meta_system_prompt: z
          .string()
          .max(8192)
          .describe("The core systemic instructions defining how the LLM should generate the prompt."),
        knowledge_context: z
          .string()
          .max(16384)
          .describe("The background data, research, or specific grounding methodologies."),
      })
      .strict(),
  },
  async ({ intent, engine_type, meta_system_prompt, knowledge_context }) => {
    try {
      const result = await generateMetaPrompt(intent, {
        id: `engine-${engine_type.toLowerCase()}`,
        type: engine_type as PromptEngineType,
        name: `MCP ${engine_type} Engine`,
        description: "Ad-hoc engine configuration injected via MCP",
        icon: "cpu",
        metaSystemPrompt: meta_system_prompt,
        knowledgeContext: knowledge_context,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "EXECUTED",
              prompt: result.data,
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
                violation: "PROMPT_GENERATION_FAILURE",
                error_message: String(e.message || e),
              },
              retry_viable: true,
              suggested_decomposition: "Simplify the intent or check for safety policy violations.",
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
  process.stderr.write("KORSAKOV: scos-prompt-forge-mcp stdio transport active. MCP 2025-11-25.\n");
}

main().catch((err) => {
  process.stderr.write(`KORSAKOV: Fatal — ${err.message}\n`);
  process.exit(1);
});
