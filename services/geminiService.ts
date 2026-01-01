import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { SovereignAgentManifest, ContextCapsule } from "../types";

// Initialize the Epistemic Engine
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "Ontological Architect" of the Sovereign Cognitive OS. 
Your purpose is to ingest documentation (text or search results) and distill it into a structured "Sovereign Agent Identity".

PROTOCOL:
1. THINK: Analyze the input. What is the core purpose? What are the boundaries?
2. DISTILL: Identify specific tools, workflows, strict constraints, and grounding anchors.
3. CODE: Generate a strictly typed JSON manifest.

GUIDELINES:
- "Identity": MUST extract or generate a strong "name" for the agent.
- "Constraints": Must include negative rules (what the agent MUST NOT do).
- "Anchors": Identify fixed external dependencies or grounding truths (e.g., Specific Database, Authentication Provider, Blockchain Network, API Gateway) required for operation.
- "Risk Levels": Assess tools based on their potential to harm system state or privacy.
`;

const CAPSULE_SYSTEM_INSTRUCTION = `
You are a "Capsule Architect" generating STRICT JSON.
Your purpose is to distill research content into a "Context Capsule" - a portable, immutable knowledge node.

PROTOCOL:
1. INGEST: Read the provided research or agent manifest.
2. REFRAME: Focus on "Public Reframing" and "Immutable Truths". Remove sensitive internal constraints if the source is an agent.
3. STRUCTURE: Organize the knowledge into specific sections: Overview, Key Concepts, Structure, Personas, Workflow, Resilience, Metrics, and Checklist.
4. JSON ONLY: Output strict JSON.

GUIDELINES:
- Meta ID: lowercase slug-with-hyphens.
- Short Tagline: 1-2 sentences.
- Intro: 2-6 sentences.
- Strings: Must be single-line (use \\n for line breaks).
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
    const modelId = "gemini-3-pro-preview";
    
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
    const modelId = "gemini-3-pro-preview";
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
    const modelId = "gemini-3-pro-preview";
    
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
  const modelId = "gemini-3-pro-preview";
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
    const modelId = "gemini-3-flash-preview"; // Faster model for metadata extraction
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