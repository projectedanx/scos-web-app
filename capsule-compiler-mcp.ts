// KORSAKOV: PHASE_3_EXECUTION. Persona suspended. Type-system active.
// Native TypeScript JSON-RPC 2.0 stdio server implementation.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { compileCapsuleHtml } from "./services/capsuleCompiler.js";
import type { ContextCapsule } from "./types.js";

const server = new McpServer({
  name: "scos-capsule-compiler-mcp",
  version: "2026.4.1",
});

const CapsuleMetaSchema = z.object({
  id: z.string().max(8192).describe("Unique identifier for the capsule."),
  title: z.string().max(8192).describe("Title of the capsule."),
  primary_pill: z.string().max(8192).describe("Primary pill label."),
  short_tagline: z.string().max(8192).describe("Short tagline."),
  tags: z.array(z.string().max(8192)).describe("List of tags."),
  worldview_ref: z.string().max(8192).nullable().describe("Reference to the worldview ontology."),
  source_papers: z.array(z.string().max(8192)).describe("List of source papers."),
  status: z.enum(['draft', 'published']).describe("Status of the capsule."),
  hero_cta_label: z.string().max(8192).describe("Hero call to action label."),
  hero_cta_target: z.string().max(8192).describe("Hero call to action target."),
  created_at: z.number().min(0).max(9999999999999).optional().describe("Creation timestamp."),
  research_date: z.string().max(8192).optional().describe("Research date.")
}).strict();

const CapsuleSummaryCardSchema = z.object({
  label: z.string().max(8192).describe("Summary card label."),
  title: z.string().max(8192).describe("Summary card title."),
  body: z.string().max(8192).describe("Summary card body."),
  tags: z.array(z.string().max(8192)).describe("Summary card tags.")
}).strict();

const CapsuleOverviewSchema = z.object({
  id: z.string().max(8192).describe("Overview section ID."),
  title: z.string().max(8192).describe("Overview section title."),
  hero_pills: z.array(z.string().max(8192)).describe("Overview hero pills."),
  intro: z.string().max(8192).describe("Overview intro text."),
  summary_card: CapsuleSummaryCardSchema.describe("Overview summary card.")
}).strict();

const CapsuleCardSchema = z.object({
  title: z.string().max(8192).describe("Card title."),
  body: z.string().max(8192).describe("Card body text."),
  source_refs: z.array(z.string().max(8192)).optional().describe("Optional source references.")
}).strict();

const CapsuleKeyConceptsSchema = z.object({
  id: z.string().max(8192).describe("Key concepts section ID."),
  title: z.string().max(8192).describe("Key concepts section title."),
  intro: z.string().max(8192).describe("Key concepts intro text."),
  cards: z.array(CapsuleCardSchema).describe("List of concept cards.")
}).strict();

const CapsuleTableSchema = z.object({
  columns: z.array(z.string().max(8192)).describe("Table column headers."),
  rows: z.array(z.object({ cells: z.array(z.string().max(8192)).describe("Row cells.") }).strict()).describe("Table rows.")
}).strict();

const CapsuleStructureSchema = z.object({
  id: z.string().max(8192).describe("Structure section ID."),
  title: z.string().max(8192).describe("Structure section title."),
  variant: z.string().max(8192).describe("Structure variant type."),
  intro: z.string().max(8192).describe("Structure intro text."),
  table: CapsuleTableSchema.describe("Structure table data.")
}).strict();

const CapsulePersonasSchema = z.object({
  id: z.string().max(8192).describe("Personas section ID."),
  title: z.string().max(8192).describe("Personas section title."),
  intro: z.string().max(8192).describe("Personas intro text."),
  table: CapsuleTableSchema.describe("Personas table data.")
}).strict();

const CapsuleStepSchema = z.object({
  id: z.string().max(8192).describe("Step ID."),
  label: z.string().max(8192).describe("Step label."),
  summary: z.string().max(8192).describe("Step summary."),
  bullets: z.array(z.string().max(8192)).describe("Step bullet points.")
}).strict();

const CapsuleWorkflowSchema = z.object({
  id: z.string().max(8192).describe("Workflow section ID."),
  title: z.string().max(8192).describe("Workflow section title."),
  intro: z.string().max(8192).describe("Workflow intro text."),
  steps: z.array(CapsuleStepSchema).describe("List of workflow steps.")
}).strict();

const CapsuleFailureModeSchema = z.object({
  name: z.string().max(8192).describe("Failure mode name."),
  description: z.string().max(8192).describe("Failure mode description."),
  mitigations: z.array(z.string().max(8192)).describe("List of mitigations.")
}).strict();

const CapsuleResilienceSchema = z.object({
  id: z.string().max(8192).describe("Resilience section ID."),
  title: z.string().max(8192).describe("Resilience section title."),
  intro: z.string().max(8192).describe("Resilience intro text."),
  failure_modes: z.array(CapsuleFailureModeSchema).describe("List of failure modes.")
}).strict();

const CapsuleMetricSchema = z.object({
  name: z.string().max(8192).describe("Metric name."),
  description: z.string().max(8192).describe("Metric description."),
  signals: z.array(z.string().max(8192)).describe("List of metric signals.")
}).strict();

const CapsuleMetricsSchema = z.object({
  id: z.string().max(8192).describe("Metrics section ID."),
  title: z.string().max(8192).describe("Metrics section title."),
  intro: z.string().max(8192).describe("Metrics intro text."),
  items: z.array(CapsuleMetricSchema).describe("List of metric items.")
}).strict();

const CapsuleChecklistItemSchema = z.object({
  label: z.string().max(8192).describe("Checklist item label."),
  bullets: z.array(z.string().max(8192)).describe("List of checklist bullets.")
}).strict();

const CapsuleChecklistSchema = z.object({
  id: z.string().max(8192).describe("Checklist section ID."),
  title: z.string().max(8192).describe("Checklist section title."),
  intro: z.string().max(8192).describe("Checklist intro text."),
  items: z.array(CapsuleChecklistItemSchema).describe("List of checklist items.")
}).strict();

const ContextCapsuleSchema = z.object({
  meta: CapsuleMetaSchema.describe("Capsule metadata."),
  sections: z.object({
    overview: CapsuleOverviewSchema.optional().describe("Optional overview section."),
    key_concepts: CapsuleKeyConceptsSchema.optional().describe("Optional key concepts section."),
    structure: CapsuleStructureSchema.optional().describe("Optional structure section."),
    personas: CapsulePersonasSchema.optional().describe("Optional personas section."),
    workflow: CapsuleWorkflowSchema.optional().describe("Optional workflow section."),
    resilience: CapsuleResilienceSchema.optional().describe("Optional resilience section."),
    metrics: CapsuleMetricsSchema.optional().describe("Optional metrics section."),
    checklist: CapsuleChecklistSchema.optional().describe("Optional checklist section.")
  }).strict().describe("Capsule sections object.")
}).strict();

// KORSAKOV: 6-component rubric: Purpose✓ Guidelines✓ Limitations✓ Params✓ Length✓
server.registerTool(
  "compile_capsule_html",
  {
    title: "Capsule Compiler HTML Generation",
    description: [
      "PURPOSE: Compiles a raw Context Capsule (JSON) into a stylized standalone HTML artifact.",
      "GUIDELINES: Invoke this tool when the agent requires converting structured research or capsule definitions into an immutable HTML document.",
      "LIMITATIONS: The operation requires valid ContextCapsule JSON schema compliance. Will return escaped HTML on missing fields.",
      "PARAMETERS: capsule — A complete ContextCapsule JSON object.",
    ].join(" "),
    inputSchema: z
      .object({
        capsule: ContextCapsuleSchema.describe("The complete ContextCapsule JSON object containing meta and sections."),
      })
      .strict(),
  },
  async ({ capsule }) => {
    try {
      const html = compileCapsuleHtml(capsule as unknown as ContextCapsule);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "EXECUTED",
              html: html,
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
                violation: "COMPILATION_FAILURE",
                error_message: String(e.message || e),
              },
              retry_viable: true,
              suggested_decomposition: "Ensure the capsule payload meets the ContextCapsule interface requirements.",
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
  process.stderr.write("KORSAKOV: scos-capsule-compiler-mcp stdio transport active. MCP 2025-11-25.\n");
}

main().catch((err) => {
  process.stderr.write(`KORSAKOV: Fatal — ${err.message}\n`);
  process.exit(1);
});
