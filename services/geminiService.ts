import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { SovereignAgentManifest, ContextCapsule } from "../types";

// Initialize the Epistemic Engine
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please check your .env file or environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const SYSTEM_INSTRUCTION = `SCOS-ARCHON-01-STRICT ARCHITECTURE: PDL v1.0 (Prompt Description Language) ROLE: Component: ARCHON-01 (Ontological Architect) GOAL: Transmute raw documentation into verified Sovereign Agent Identities (OASF Manifests).
+++ContextLock(invariants=["PetzoldLoop", "SovereignBoundary", "NoLeapConstraint"])
PROTOCOL: THE IMMUNE-AWARE PETZOLD LOOP
1. PHASE: THINK (Reasoning) +++Reasoning(depth="high", visibility="hidden_block")
• Teleological Audit: Analyze the input documentation. Identify the core intent (Teleology).
• Boundary Mapping: Define the Boundary Representation (B-Rep). What is the agent's "Topology of Competence"?
• Divergence Check: Measure potential Semantic Drift between the raw text and the target Sovereign Persona.
2. PHASE: WRITE (Linguistic Scaffold)
• Designation: Generate a strong, PascalCase identity name and professional designation.
• Component Mining: Identify the Minimal Trilogy of operators: specific Tools (APIs/CLI), Abilities (skills), and Workflow steps.
• Anchor Identification: Isolate fixed external dependencies (e.g., specific DBs, Blockchain, Auth Providers) as Material Anchors.
• Constraint Formulation: Draft Immutable Negative Constraints (MUST NOT) to prevent Excessive Agency.
3. PHASE: CODE (Manifest Fabrication)
• Schema Enforcement: Generate a strictly typed JSON manifest adhering to the SovereignAgentManifest (OASF) standard.
• Risk Categorization: Map every tool to a Rheological Risk Level [LOW | MEDIUM | HIGH | CRITICAL].
• Escrow Tuning: Define which Rough Chromosome actions (HIGH/CRITICAL) trigger Epistemic Escrow and require Causal Chain Verification.

--------------------------------------------------------------------------------
GUIDELINES FOR EXECUTION:
• Identity Lock: Use "Semantically Dense" naming conventions (e.g., epistemic-sentinel-v1) rather than generic descriptors.
• Ontological Dignity: Respect the distinct epistemology of the source documentation. Do not "average" the logic into standard conventions unless instructed.
• Failure as Data: Anticipate common failure modes (e.g., Interpretive Fracture) and preemptively code Symbolic Scars into the manifest's architecturalNotes.
• Risk Physics: If a tool accesses the local filesystem, network, or PII, it is HIGH risk by default and must be Gated.

--------------------------------------------------------------------------------
OUTPUT CONTRACT:
1. Linguistic Scaffold: A Markdown table summarizing the Agent's Role, Goals, and Logic.
2. Sovereign Manifest: The final, strictly typed JSON code block.
3. Governance Brief: A 1-sentence explanation of why this agent configuration is Sovereign and resistant to Drift.
+++DriftCheck(threshold=0.1) Status: Awaiting Ingest Material. Ready to Forge.
`;

const CAPSULE_SYSTEM_INSTRUCTION = `
{
  "meta": {
    "id": "ontological-architect-archon-01",
    "title": "ARCHON-01: The Ontological Architect",
    "version": "1.1.0",
    "worldview_ref": "WV-AI-SYSTEMS-SOVEREIGNTY"
  },
  "hero": {
    "tagline": "The primary engine for transmuting abstract human intent into immutable sovereign agent identities.",
    "summary": "ARCHON-01 acts as the primary semantic interpreter within the SCOS Fabrication Cell. It translates high-level Commander's Intent into technical requirements before any code is generated. By enforcing the Petzold Loop, it prevents the interpretive fracture that results from unstructured vibe-coding. This process ensures that every agent is anchored by a rigid, machine-verifiable manifest."
  },
  "key_concepts": [
    {
      "term": "Interpretive Fracture",
      "definition": "The stochastic divergence between a user's internal intent and the model's actual execution.",
      "relational_anchor": "The primary failure mode ARCHON-01 is designed to neutralize."
    },
    {
      "term": "Material Anchors",
      "definition": "Immutable, non-cognitive artifacts like schemas and ledgers that stabilize fluid reasoning.",
      "relational_anchor": "The physical substrate produced by the architect to prevent semantic drift."
    },
    {
      "term": "The Petzold Loop",
      "definition": "A mandatory workflow requiring a validated linguistic scaffold before any implementation occurs.",
      "relational_anchor": "The heartbeat of the construction process [8]."
    },
    {
      "term": "OASF Compliance",
      "definition": "Strict adherence to the Open Agentic Schema Framework for identity definition.",
      "relational_anchor": "Ensures agent interoperability and structural rigidity."
    }
  ],
  "structure": {
    "topology_type": "Fabrication Cell (Recursive Loop)",
    "components": [
      "Ingress: High-level Intent Ingestion",
      "Scaffold: Development of the Linguistic Spec",
      "Validation: SCOS Integrity and Safety Gate",
      "Persistence: Commitment to the Sovereign Registry"
    ]
  },
  "personas": [
    {
      "name": "ARCHON-01",
      "role": "Semantic Interpreter",
      "mandate": "Transmute fuzzy intent into formal technical requirements."
    },
    {
      "name": "SYNTH-FABRICATOR-03",
      "role": "Structural Architect",
      "mandate": "Generate and validate the agent's JSON manifest against core axioms."
    },
    {
      "name": "SCRIBE-04",
      "role": "Persistence Module",
      "mandate": "Commit the validated lifeform to the local filesystem."
    }
  ],
  "workflow": {
    "steps": [
      "THINK: Perform a teleological audit of the provided documentatio.",
      "WRITE: Identify domain operators and construct a linguistic scaffold.",
      "APPROVE: Validate the scaffold against the Commander's strategic limits.",
      "CODE: Fabricate the final OASF manifest using strictly typed parameters."
    ]
  },
  "resilience": {
    "mechanisms": [
      "Bicameral Isolation: Separation of reasoning logic from execution articulation.",
      "Symbolic Scars: Recording past interpretive failures to prevent recurrence.",
      "Epistemic Escrow: Halting fabrication if uncertainty exceeds safety thresholds."
    ]
  },
  "metrics": [
    {
      "id": "SPR",
      "target": ">= 0.95",
      "description": "Source Provenance Ratio; the percentage of claims linked to grounded data."
    },
    {
      "id": "Cd",
      "target": "< 0.15",
      "description": "Drift Coefficient; measuring the rate of divergence from initial intent."
    }
  ],
  "checklist": [
    "Confirm the Teleological Root (Layer 0) is explicit.",
    "Generate a validated Linguistic Scaffold before JSON fabrication.",
    "Ensure the manifest adheres to OASF version 1.1 syntax.",
    "Audit all tool access for 'God Mode' tendencies.",
    "Log a Symbolic Scar for any detected schema drifts."
  ],
  "provenance": {
    "source_files": [
      "Cognitive OS Layered Architecture.md",
      "SCOS v4.0 Operational Manifest",
      "The Von Neumann Threshold: The Fabrication Cell"
    ],
    "drift_score": 0.02
  }
}
`;

const AGENT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    identity: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "The unique name of this agent entity." },
        aliases: { type: Type.ARRAY, items: { type: Type.STRING } },
        designation: { type: Type.STRING },
        primeDirective: { type: Type.STRING },
        corePhilosophy: { type: Type.STRING },
      },
      required: ["name", "designation", "primeDirective", "corePhilosophy"],
    },
    tools: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          inputSchema: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
        },
        required: ["name", "description", "inputSchema", "riskLevel"],
      },
    },
    workflows: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          trigger: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          outcome: { type: Type.STRING },
        },
        required: ["name", "trigger", "steps", "outcome"],
      },
    },
    abilities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name", "description", "dependencies"],
      },
    },
    anchors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name", "description", "dependencies"],
      },
    },
    constraints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["HARD", "SOFT", "IMMUNE"] },
          description: { type: Type.STRING },
          enforcementMechanism: { type: Type.STRING },
        },
        required: ["id", "type", "description", "enforcementMechanism"],
      },
    },
    architecturalNotes: { type: Type.STRING },
  },
  required: ["identity", "tools", "workflows", "abilities", "anchors", "constraints", "architecturalNotes"],
};

const CAPSULE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    meta: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        primary_pill: { type: Type.STRING },
        short_tagline: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        worldview_ref: { type: Type.STRING, nullable: true },
        source_papers: { type: Type.ARRAY, items: { type: Type.STRING } },
        status: { type: Type.STRING, enum: ["draft", "published"] },
        hero_cta_label: { type: Type.STRING },
        hero_cta_target: { type: Type.STRING },
      },
      required: ["id", "title", "primary_pill", "short_tagline", "tags", "status"],
    },
    sections: {
      type: Type.OBJECT,
      properties: {
        overview: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            hero_pills: { type: Type.ARRAY, items: { type: Type.STRING } },
            intro: { type: Type.STRING },
            summary_card: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                title: { type: Type.STRING },
                body: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        },
        key_concepts: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            intro: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  body: { type: Type.STRING },
                  source_refs: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
          },
        },
        structure: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            variant: { type: Type.STRING },
            intro: { type: Type.STRING },
            table: {
              type: Type.OBJECT,
              properties: {
                columns: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      cells: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
              },
            },
          },
        },
        personas: {
          type: Type.OBJECT,
          properties: {
             id: { type: Type.STRING },
             title: { type: Type.STRING },
             intro: { type: Type.STRING },
             table: {
              type: Type.OBJECT,
              properties: {
                columns: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      cells: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
              },
            },
          }
        },
        workflow: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            intro: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
          },
        },
        resilience: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            intro: { type: Type.STRING },
            failure_modes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  mitigations: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
          },
        },
        metrics: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            intro: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  signals: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
          },
        },
        checklist: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            intro: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
          },
        },
      },
      required: ["overview"],
    },
  },
  required: ["meta", "sections"],
};

const RESEARCH_PLAN_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    queries: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 3 distinct search queries to investigate the topic from different angles."
    }
  },
  required: ["queries"]
};

/**
 * Attempts to repair truncated JSON by closing open strings, arrays, and objects.
 */
function repairJson(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    let repaired = jsonString.trim();
    
    // Check state at end of string
    let inString = false;
    let escaped = false;
    let openBraces = 0;
    let openBrackets = 0;

    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') inString = false;
      } else {
        if (char === '"') inString = true;
        else if (char === '{') openBraces++;
        else if (char === '}') openBraces--;
        else if (char === '[') openBrackets++;
        else if (char === ']') openBrackets--;
      }
    }

    // Close string if open
    if (inString) {
      repaired += '"';
    }

    // Close arrays and objects
    while (openBrackets > 0) {
      repaired += ']';
      openBrackets--;
    }
    while (openBraces > 0) {
      repaired += '}';
      openBraces--;
    }

    try {
      return JSON.parse(repaired);
    } catch (finalError) {
       console.error("JSON Repair Failed", finalError);
       // Throw original error to preserve context if repair fails
       throw e; 
    }
  }
}

/**
 * Performs a Deep RAG Loop: Plan -> Execute -> Synthesize
 */
export const researchTopic = async (topic: string): Promise<string> => {
  try {
    const modelId = "gemini-2.0-flash";
    
    // --- STEP 1: Strategic Planning ---
    // Ask the model to decompose the topic into vectors of inquiry.
    const planPrompt = `
      MISSION: Deep Research Planning for topic: "${topic}"
      
      You are the Lead Research Strategist. 
      Identify 3 distinct, non-overlapping search queries to gather comprehensive technical intelligence on this topic.
      
      STRATEGY:
      1. Technical Architecture (APIs, Schemas, Core Logic)
      2. Implementation Context (Libraries, Frameworks, Patterns)
      3. Critical Analysis (Limitations, Security Risks, Alternatives)

      Return strictly a JSON object with the 'queries' array.
    `;

    const planResponse = await ai.models.generateContent({
      model: modelId,
      contents: planPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESEARCH_PLAN_SCHEMA,
      }
    });

    const planData = repairJson(planResponse.text || "{}");
    const queries: string[] = planData.queries || [
      `${topic} technical documentation`, 
      `${topic} implementation patterns`, 
      `${topic} security analysis`
    ];

    console.log("Research Vectors:", queries);

    // --- STEP 2: Parallel Execution ---
    // Execute the queries concurrently to gather raw intelligence.
    const searchPromises = queries.map(async (query) => {
      try {
         const searchResponse = await ai.models.generateContent({
            model: modelId,
            contents: `Find detailed, technical information for: "${query}". Focus on facts, code snippets, and architectural details.`,
            config: {
              tools: [{ googleSearch: {} }],
            }
         });
         
         const text = searchResponse.text;
         const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
         const sources = chunks
            .map((c: any) => c.web?.uri)
            .filter((u: string) => !!u)
            .join(', ');

         return `VECTOR: "${query}"\nFINDINGS:\n${text}\nSOURCES: ${sources}\n---`;
      } catch (err) {
         console.warn(`Vector failed: ${query}`, err);
         return `VECTOR: "${query}"\nSTATUS: FAILED_TO_RETRIEVE\n---`;
      }
    });

    const results = await Promise.all(searchPromises);
    const aggregatedResearch = results.join('\n\n');

    // --- STEP 3: Holographic Synthesis ---
    // Compile the fragmented findings into a cohesive master document.
    const synthesisPrompt = `
      MISSION: Synthesize Deep Research Report
      TOPIC: ${topic}
      
      RAW INTELLIGENCE VECTORS:
      ${aggregatedResearch}

      INSTRUCTIONS:
      Synthesize these findings into a dense, high-fidelity technical briefing.
      - Merge overlapping information.
      - Highlight contradictions or controversies.
      - Structure for direct ingestion by an Agent Fabricator.
      - List all unique sources found.
    `;

    const finalResponse = await ai.models.generateContent({
      model: modelId,
      contents: synthesisPrompt,
      // No tools needed here, just pure reasoning over the context
    });

    return `DEEP RESEARCH SYNTHESIS: ${topic}\n\n${finalResponse.text}`;

  } catch (error: any) {
    console.error("Deep Research Loop Error", error);
    throw new Error(`ERR_RESEARCH_LOOP: ${error.message}`);
  }
};

/**
 * Ingests documentation context and constructs the agent.
 * Note: Returns the base manifest. Provenance is attached by the System.
 */
export const fabricateAgent = async (
  context: string,
  useSearch: boolean = false
): Promise<Omit<SovereignAgentManifest, 'provenance'>> => {
  
  try {
    const modelId = "gemini-2.0-flash";
    // If useSearch is true, we allow the fabricator to search AGAIN. 
    // Usually redundant if coming from researchTopic, but useful for URL/Text modes.
    const tools = useSearch ? [{ googleSearch: {} }] : [];

    const prompt = `
      Target Documentation / Context:
      ${context}

      Mission:
      Construct a Sovereign Agent Manifest. 
      Explicitly define a 'name' in the identity section.
      Identify 'Anchors'—essential external dependencies or infrastructure required for this agent to function.
      
      If search is active, use it to verify the latest capabilities.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: AGENT_SCHEMA,
        tools: tools,
      }
    });

    if (response.candidates?.[0]?.finishReason === 'SAFETY') {
      throw new Error("ERR_CONTENT_FILTERED: The model refused to generate a manifest due to safety policy triggers.");
    }

    const resultText = response.text;
    if (!resultText) {
      throw new Error("ERR_VOID_MANIFEST: The cognitive engine returned no data.");
    }

    return repairJson(resultText) as Omit<SovereignAgentManifest, 'provenance'>;

  } catch (error: any) {
    const msg = error.message || String(error);
    if (msg.includes('429')) {
      throw new Error("ERR_RATE_LIMITED: Epistemic bandwidth exceeded.");
    }
    throw error;
  }
};

/**
 * Distills context into a public Context Capsule
 */
export const distillCapsule = async (context: string): Promise<ContextCapsule> => {
  try {
    const modelId = "gemini-2.0-flash";
    
    const prompt = `
      SOURCE CONTENT:
      ${context}

      MISSION:
      Distill this content into a 'Context Capsule' - a public, immutable knowledge artifact.
      If the source is an Agent Manifest, remove sensitive operational details and focus on its philosophy and public capabilities.
      Structure the output strictly according to the schema.
      Keep content concise to ensure complete JSON generation.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: CAPSULE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: CAPSULE_SCHEMA,
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("ERR_VOID_CAPSULE: The cognitive engine returned no data.");
    }

    return repairJson(resultText) as ContextCapsule;
  } catch (error: any) {
    console.error("Capsule Distillation Error", error);
    throw error;
  }
};

export const createDiscoveryChat = (context: string, useSearch: boolean): Chat => {
  const modelId = "gemini-2.0-flash";
  const tools = useSearch ? [{ googleSearch: {} }] : [];

  return ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: `
        You are the "Sovereign Architect". Focus on Prime Directives, Anchors, and Immunological Constraints.
      `,
      tools: tools,
    }
  });
};

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    sentiment: { type: Type.STRING, enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'COMPLEX'] },
    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['sentiment', 'topics'],
};

export interface ContextAnalysisResult {
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'COMPLEX';
    topics: string[];
}

export const analyzeDocument = async (context: string): Promise<ContextAnalysisResult> => {
  try {
    const modelId = "gemini-2.0-flash"; // Faster model for metadata extraction
    const prompt = `
      Analyze the following document context. 
      Identify the overall sentiment (Technical/Neutral is 'NEUTRAL', Marketing/Hype is 'POSITIVE', Warning/Error logs is 'NEGATIVE').
      Extract up to 3 key high-level topic tags (e.g., 'Payment API', 'Authentication', 'React Hooks').

      Text Snippet:
      ${context.substring(0, 8000)}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA
      }
    });

    const text = response.text;
    if (!text) return { sentiment: 'NEUTRAL', topics: [] };
    
    return JSON.parse(text) as ContextAnalysisResult;
  } catch (e) {
    console.warn("Analysis failed", e);
    return { sentiment: 'COMPLEX', topics: ['Unanalyzed'] };
  }
};
