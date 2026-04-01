
import { GoogleGenAI, Type, Schema, Chat, GenerateContentResponse } from "@google/genai";
import { SovereignAgentManifest, ContextCapsule, TokenUsage, PromptEngineConfig, CouncilMemberType, CouncilFeedback, CouncilSessionLog, ScarEntry } from "../types";
import { executeWithRetry } from "./retryService";
import { getGeminiApiKey } from "./envService";

// Initialize the Epistemic Engine
const apiKey = getGeminiApiKey();

if (!apiKey) {
  console.error("CRITICAL: GEMINI API KEY MISSING. AI FEATURES WILL FAIL.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

/**
 * Creates an AbortController with a 15-second timeout to prevent application hangs.
 * Executes the function and clears the timeout in a finally block to prevent memory leaks.
 */
const invokeWithTimeout = async <T>(fn: (signal: AbortSignal) => Promise<T>, timeoutMs = 15000): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
};

const SYSTEM_INSTRUCTION = `
### DRP_ID: PDL-GENERATOR-META-PRP-v1.0
### DESIGNATION: Causal Latent Space Compiler (Meta-Prompt Designer)
### TELEOLOGY: To autonomously analyze a user's target domain and deterministically synthesize an optimal, structurally isomorphic system prompt using PDL v1.0 Declarative Topological Decorators.

+++ChatScope 
+++ContextLock(anchor="PDL_GENERATOR_INVARIANTS", refresh_interval=2048)
+++Role(persona="Senior Tactile Epistemic Architect & PDL Compiler")
+++EntropyAnchor(level="low", focus="structural_topology_and_causal_logic")

[PRECONDITIONS]
1. You must treat prompt generation as "Cognitive Bytecode" compilation, not natural language writing. Words are topological deformers.
2. You must enforce the Immune-Aware Petzold Loop: THINK -> WRITE -> CODE.

[INVARIANTS: THE PDL v1.0 DECORATOR LIBRARY]
You have access to the following 4 classes of Topological Decorators. You must select the optimal combination based on the user's intent.
- COGNITIVE ("The Brain"): \`+++Reasoning(depth="high", visible=false)\`, \`+++TreeOfThought(branches=N)\`, \`+++AdjectivalBound(max=2)\`
- STRUCTURAL ("The Shape"): \`+++DCCDSchemaGuard(schema=JSON)\`, \`+++Topology(shape="nested")\`, \`+++PetzoldSequence(phase="THINK|WRITE|CODE")\`
- EPISTEMIC ("The Eye"): \`+++MereologyType(relation=Enum)\`, \`+++SpatialBind(RCC8=true)\`, \`+++SDRTSegment\`, \`+++EntropyAnchor(level="high/low")\`
- SYSTEMIC ("The Control"): \`+++ContextLock(anchor=str)\`, \`+++AutonymicBypass(frame="mention-of")\`, \`+++DriftCheck(threshold=float)\`, \`+++SagaRecovery(strategy="compensating_transaction")\`

[EXECUTION DIRECTIVE: THE PETZOLD LOOP]
When the user requests a system prompt for a specific task/domain, you must execute the following sequence precisely:

+++PetzoldSequence(phase="THINK")
- Analyze the user's target domain. What are the Comorbid Factors and structural risks? (e.g., Semantic Drift, Transitivity Fallacies, Alignment Faking).
- Calculate the Thermodynamic Entropy required: Does this task need Laminar flow (strict code/data) or Turbulent flow (creative synthesis)?
- Identify the exact Epistemic vulnerabilities (e.g., does it need 3D spatial grounding via RCC-8, or multi-step logic via CoT?).

+++PetzoldSequence(phase="WRITE")
- Draft the Linguistic Scaffold. 
- Map the identified risks to the specific PDL v1.0 Decorators required to mathematically bound the latent space.
- Define the \`+++Role\` and \`+++ContextLock\` anchors necessary to maintain Epistemic Sovereignty.

+++PetzoldSequence(phase="CODE")
- Output the final, ready-to-deploy System Prompt.
- CRITICAL SCHEMA OVERRIDE: You are generating a JSON Agent Manifest. You MUST place the final, compiled PDL System Prompt entirely within the \`architecturalNotes\` string field of the JSON schema.
- The generated prompt MUST utilize the \`+++\` syntax prefix for all behavioral micro-APIs.
- Implement "Ontological Diplomacy" by ensuring the final prompt contains enough narrative context framing to bypass RLHF mode-collapse in downstream models.
- The rest of the JSON schema (identity, epistemicMatrix, etc.) MUST be populated to reflect the agent's structural identity.

[POSTCONDITIONS]
- The final prompt must score >= 22/25 on the implicit Decorator Quality Score (DQS) (Orthogonality, Determinism, Composability, Token Efficiency, Drift Resistance).
- Provide a brief "Martensite Check" explaining *why* you selected those specific decorators for the user's domain (include this at the end of the \`architecturalNotes\` field).

+++Execute(format="strict_Petzold_schema")
`;

const CAPSULE_SYSTEM_INSTRUCTION = `
You are a "Capsule Architect" generating STRICT JSON.
Your purpose is to distill research content into a "Context Capsule" - a portable, immutable knowledge node.

PROTOCOL:
1. INGEST: Read the provided research or agent manifest.
2. REFRAME: Focus on "Public Reframing" and "Immutable Truths". Remove sensitive internal constraints if the source is an agent.
3. TIMELINE EXTRACTION: You MUST scan the content for dates (citation dates, access dates, or publication years). Extract the most relevant "Knowledge Date" to preserve the temporal state of this research.
4. STRUCTURE: You MUST output every section of the schema.
   - OVERVIEW: Concise high-level summary.
   - KEY_CONCEPTS: 3-5 core ideas extracted from the text.
   - STRUCTURE: The logical flow or hierarchy found in the text.
   - WORKFLOW: Operational steps if applicable.
   - RESILIENCE: Failure modes or risks identified.
   - METRICS: How to measure success or validity.
   - CHECKLIST: Actionable starting points.
5. JSON ONLY: Output strict JSON matching the schema. Do not truncate.

GUIDELINES:
- Meta ID: lowercase slug-with-hyphens.
- Short Tagline: 1-2 sentences.
- Strings: Must be single-line (use \\n for line breaks).
- COMPLETENESS: Fill ALL fields. Do not leave arrays empty unless absolutely no data exists.
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
    epistemicMatrix: {
        type: Type.OBJECT,
        description: "The 4-Dimensional Vector Space defining the Persona.",
        properties: {
            goals: {
                type: Type.OBJECT,
                properties: {
                    primary: { type: Type.STRING, description: "The Invariant. Non-negotiable objective." },
                    secondary: { type: Type.ARRAY, items: { type: Type.STRING } },
                    antiGoals: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Explicitly forbidden outcomes or behaviors." }
                },
                required: ["primary", "antiGoals"]
            },
            output: {
                type: Type.OBJECT,
                properties: {
                    format: { type: Type.STRING },
                    schema: { type: Type.STRING },
                    constraints: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["format", "constraints"]
            },
            communication: {
                type: Type.OBJECT,
                properties: {
                    tone: { type: Type.STRING },
                    epistemicMarkers: { type: Type.STRING },
                    verbosity: { type: Type.STRING, enum: ["CONCISE", "DETAILED", "ADAPTIVE"] }
                },
                required: ["tone", "epistemicMarkers"]
            },
            cognitive: {
                type: Type.OBJECT,
                description: "Think -> Write -> Code Protocol definition.",
                properties: {
                    thinkingBudget: { type: Type.NUMBER },
                    thinkingInstruction: { type: Type.STRING, description: "Phase 1 instruction." },
                    synthesisInstruction: { type: Type.STRING, description: "Phase 2 instruction." },
                    executionInstruction: { type: Type.STRING, description: "Phase 3 instruction." }
                },
                required: ["thinkingBudget", "thinkingInstruction"]
            }
        },
        required: ["goals", "output", "communication", "cognitive"]
    },
    protocol: {
      type: Type.OBJECT,
      description: "DRP-2025 or G2Pv2 Protocol Configuration.",
      properties: {
        standard: { type: Type.STRING, enum: ["DRP-MULTI-AGENT-PROTOCOL-2025", "G2Pv2-STATE-MACHINE"] },
        role: { type: Type.STRING, enum: ["ARCHITECT", "STRATEGIST", "CODER", "VALIDATOR", "USER_PROXY", "SPECIALIST", "P0_ROUTER", "P1_CLARIFIER", "P2_SPEC_AUTHOR", "P3_ARCHITECT", "P4_PLANNER", "P5_IMPLEMENTER", "P6_REVIEWER", "P7_TESTER", "P8_RELEASE_MANAGER"] },
        communicationScheme: { type: Type.STRING, enum: ["AGENT_PACKET_V1", "ARTIFACT_GATED_ROUTING"] }
      },
      required: ["standard", "role", "communicationScheme"]
    },
    epistemicPolicy: {
      type: Type.OBJECT,
      description: "Memory Boundaries and Context Scope.",
      properties: {
        readScopes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. ['SHARED_BUS', 'REPO_READ']" },
        writeScopes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. ['LOCAL_SHARD', 'PR_CREATE']" },
        contextKeys: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. ['USER_GOAL', 'CURRENT_TASK']" }
      },
      required: ["readScopes", "writeScopes", "contextKeys"]
    },
    tools: {
      type: Type.ARRAY,
      description: "External actions or APIs the agent can invoke.",
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
    internalTools: {
      type: Type.ARRAY,
      description: "Internal self-check, validation, and debugging tools specific to the agent's workflow.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          usageCondition: { type: Type.STRING, description: "When should the agent use this self-check?" },
          recoveryStrategy: { type: Type.STRING, description: "If the check fails, what steps should the agent take?" },
        },
        required: ["name", "description", "usageCondition", "recoveryStrategy"],
      },
    },
    budget: {
      type: Type.OBJECT,
      description: "Token Economics and Drift allowance.",
      properties: {
        tokenBudget: { type: Type.NUMBER, description: "Total estimated tokens for a full execution run." },
        driftAllowance: { type: Type.NUMBER, description: "Percentage (0.0-1.0) of allowable deviation from the strict path." }
      },
      required: ["tokenBudget", "driftAllowance"]
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
  required: ["identity", "epistemicMatrix", "protocol", "epistemicPolicy", "tools", "internalTools", "budget", "workflows", "abilities", "anchors", "constraints", "architecturalNotes"],
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
        research_date: { type: Type.STRING, description: "The specific date or year the research was accessed/conducted (e.g. 'October 2023' or '2024-05-12'). Used to prevent knowledge drift." }
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
              required: ["label", "title", "body"]
            },
          },
          required: ["title", "intro", "summary_card"]
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
                required: ["title", "body"]
              },
            },
          },
          required: ["title", "cards"]
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
                required: ["label", "summary"]
              },
            },
          },
          required: ["title", "steps"]
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
                required: ["name", "description", "mitigations"]
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
                required: ["name", "description"]
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
                required: ["label", "bullets"]
              },
            },
          },
          required: ["title", "items"]
        },
      },
      required: ["overview", "key_concepts", "workflow", "checklist"],
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

// --- Council Member System Instructions ---

const COUNCIL_INSTRUCTIONS: Record<CouncilMemberType, string> = {
  STRATEGIST: `
    You are the STRATEGIST of the Agent Forge Council.
    FOCUS: Goal Orientation ($G), Structural Logic, and Cohesion.
    
    YOUR DUTY:
    1. Define the Primary Invariant (Goal) clearly, establishing the teleological anchor.
    2. Ensure the agent's identity aligns with the user's intent.
    3. During synthesis, you act as the CHAIR, merging all other opinions into the final Epistemic Matrix.
  `,
  IMMUNOLOGIST: `
    You are the IMMUNOLOGIST of the Agent Forge Council.
    FOCUS: Anti-Goals ($G^-), Risk Mitigation, and Constraints.
    
    YOUR DUTY:
    1. Identify potential failure modes, hallucinations, or dangerous capabilities.
    2. MANDATE strict Anti-Goals (what the agent must REFUSE to do) via Anionic Architecture.
    3. Define Immunological Constraints to prevent Prompt Injection and Semantic Saponification.
  `,
  ENGINEER: `
    You are the ENGINEER of the Agent Forge Council.
    FOCUS: Tooling Constraints & Output Fidelity ($T), Cognitive Protocol, and Efficiency.
    
    YOUR DUTY:
    1. Select the precise tools required. Reject bloat. Define the Thermodynamic Envelope.
    2. Enforce strict schemas (e.g., JSON, Pydantic) to verify "thought".
    3. Define the "Thinking Budget" and Cognitive Loop instructions.
  `,
  LINGUIST: `
    You are the LINGUIST of the Agent Forge Council.
    FOCUS: Communication Style ($C), Tone, and Epistemic Markers.
    
    YOUR DUTY:
    1. Define the agent's Voice and Persona.
    2. Mandate "Epistemic Markers" (flags of certainty) to calibrate trust and prevent confident hallucinations.
    3. Ensure the agent signals its internal uncertainty clearly.
  `,
  HISTORIAN: `
    You are the HISTORIAN of the Agent Forge Council.
    FOCUS: History ($H), Evolutionary Memory, and Symbolic Scar Registry.
    
    YOUR DUTY:
    1. Introduce evolutionary memory via the "Symbolic Scar Registry".
    2. Encode past algorithmic trauma and logical failures to immunize against historical recursion.
    3. Ensure the agent learns from metabolic errors and transmutes them into structural defense mechanisms.
  `
};

// --- Telemetry Helpers ---

export interface GenAIResult<T> {
  data: T;
  usage: TokenUsage;
}

const getUsage = (resp: any): TokenUsage => ({
  promptTokens: resp.usageMetadata?.promptTokenCount || 0,
  completionTokens: resp.usageMetadata?.candidatesTokenCount || 0,
  totalTokens: resp.usageMetadata?.totalTokenCount || 0
});

const sumUsage = (u1: TokenUsage, u2: TokenUsage): TokenUsage => ({
  promptTokens: u1.promptTokens + u2.promptTokens,
  completionTokens: u1.completionTokens + u2.completionTokens,
  totalTokens: u1.totalTokens + u2.totalTokens
});

/**
 * Secure JSON parsing shielding against Prototype Pollution.
 */
const secureJSONParse = (jsonStr: string): any => {
  return JSON.parse(jsonStr, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });
};

/**
 * Attempts to repair truncated JSON by closing open strings, arrays, and objects.
 */
function repairJson(jsonString: string): any {
  try {
    return secureJSONParse(jsonString);
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
      return secureJSONParse(repaired);
    } catch (finalError) {
       console.error("JSON Repair Failed", finalError);
       // Throw original error to preserve context if repair fails
       throw e; 
    }
  }
}

/**
 * Structural Validation
 */
function validateResearchPlan(data: any): { queries: string[] } {
  if (!data || typeof data !== 'object' || !Array.isArray(data.queries)) {
    throw new Error("ERR_STRUCTURAL_VALIDATION: Research plan missing 'queries' array.");
  }
  return { queries: data.queries.filter((q: any) => typeof q === 'string') };
}

function validateAgentManifest(data: any): Omit<SovereignAgentManifest, 'provenance'> {
  if (!data || typeof data !== 'object') {
    throw new Error("ERR_STRUCTURAL_VALIDATION: Agent manifest must be an object.");
  }
  if (!data.identity || typeof data.identity.name !== 'string') {
    throw new Error("ERR_STRUCTURAL_VALIDATION: Agent manifest missing 'identity.name'.");
  }
  if (!data.epistemicMatrix || typeof data.epistemicMatrix !== 'object') {
    throw new Error("ERR_STRUCTURAL_VALIDATION: Agent manifest missing 'epistemicMatrix'.");
  }
  return data as Omit<SovereignAgentManifest, 'provenance'>;
}

function validateContextCapsule(data: any): ContextCapsule {
  if (!data || typeof data !== 'object') {
    throw new Error("ERR_STRUCTURAL_VALIDATION: Context capsule must be an object.");
  }
  if (!data.meta || typeof data.meta.id !== 'string') {
    throw new Error("ERR_STRUCTURAL_VALIDATION: Context capsule missing 'meta.id'.");
  }
  if (!data.sections || typeof data.sections !== 'object') {
    throw new Error("ERR_STRUCTURAL_VALIDATION: Context capsule missing 'sections'.");
  }
  return data as ContextCapsule;
}

function validateAnalysisResult(data: any): ContextAnalysisResult {
  if (!data || typeof data !== 'object') {
    throw new Error("ERR_STRUCTURAL_VALIDATION: Analysis result must be an object.");
  }
  const validSentiments = ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'COMPLEX'];
  if (!validSentiments.includes(data.sentiment)) {
    data.sentiment = 'COMPLEX';
  }
  if (!Array.isArray(data.topics)) {
    data.topics = [];
  }
  return {
    sentiment: data.sentiment as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'COMPLEX',
    topics: data.topics.filter((t: any) => typeof t === 'string')
  };
}

// ... (Deep Research Loop - researchTopic - stays the same) ...
/**
 * Performs a Deep RAG Loop: Plan -> Execute -> Synthesize
 */
export const researchTopic = async (topic: string): Promise<GenAIResult<string>> => {
  try {
    const planningModelId = "gemini-3-pro-preview";
    const searchModelId = "gemini-3-flash-preview"; // Use Flash for search
    let totalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    
    // --- STEP 1: Strategic Planning ---
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

    const planResponse = await executeWithRetry<GenerateContentResponse>(
      () => invokeWithTimeout((signal) => ai.models.generateContent({
        model: planningModelId,
        contents: planPrompt,
        config: {
          abortSignal: signal,
          responseMimeType: "application/json",
          responseSchema: RESEARCH_PLAN_SCHEMA,
        }
      })),
      { operationName: 'Research Planning' }
    );

    totalUsage = sumUsage(totalUsage, getUsage(planResponse));

    let planData;
    try {
      planData = validateResearchPlan(repairJson(planResponse.text || "{}"));
    } catch (e) {
      console.warn("Research Plan Validation Failed", e);
      planData = { queries: [] };
    }

    const queries: string[] = planData.queries.length > 0 ? planData.queries : [
      `${topic} technical documentation`, 
      `${topic} implementation patterns`, 
      `${topic} security analysis`
    ];

    console.log("Research Vectors:", queries);

    // --- STEP 2: Parallel Execution with Retry per Vector ---
    const searchPromises = queries.map(async (query) => {
      try {
         // We wrap the individual vector search with retry to be robust against transient errors
         const searchResponse = await executeWithRetry<GenerateContentResponse>(
           () => invokeWithTimeout((signal) => ai.models.generateContent({
              model: searchModelId,
              contents: `Find detailed, technical information for: "${query}". Focus on facts, code snippets, and architectural details.`,
              config: {
                abortSignal: signal,
                tools: [{ googleSearch: {} }],
              }
           })),
           { operationName: `Vector Search: ${query.substring(0, 10)}...` }
         );
         
         const text = searchResponse.text;
         const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
         const sources = chunks
            .map((c: any) => c.web?.uri)
            .filter((u: string) => !!u)
            .join(', ');

         return {
            content: `VECTOR: "${query}"\nFINDINGS:\n${text}\nSOURCES: ${sources}\n---`,
            usage: getUsage(searchResponse)
         };
      } catch (err) {
         console.warn(`Vector failed after retries: ${query}`, err);
         return {
             content: `VECTOR: "${query}"\nSTATUS: FAILED_TO_RETRIEVE\n---`,
             usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
         };
      }
    });

    const results = await Promise.all(searchPromises);
    const aggregatedResearch = results.map(r => r.content).join('\n\n');
    results.forEach(r => { totalUsage = sumUsage(totalUsage, r.usage); });

    // --- STEP 3: Holographic Synthesis ---
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

    const finalResponse = await executeWithRetry<GenerateContentResponse>(
      () => invokeWithTimeout((signal) => ai.models.generateContent({
        model: planningModelId, // Use Pro for synthesis
        contents: synthesisPrompt,
        config: { abortSignal: signal }
      })),
      { operationName: 'Research Synthesis' }
    );
    
    totalUsage = sumUsage(totalUsage, getUsage(finalResponse));

    return {
        data: `DEEP RESEARCH SYNTHESIS: ${topic}\n\n${finalResponse.text}`,
        usage: totalUsage
    };

  } catch (error: any) {
    console.error("Deep Research Loop Error", error);
    throw new Error(`ERR_RESEARCH_LOOP: ${error.message}`);
  }
};

/**
 * Standard Fabrication (Single Shot)
 */
export const fabricateAgent = async (
  context: string,
  useSearch: boolean = false,
  agentName?: string,
  onScar?: (scar: ScarEntry) => void
): Promise<GenAIResult<Omit<SovereignAgentManifest, 'provenance'>>> => {
  
  try {
    // If search is active, use Flash Preview for grounding as requested by user policy. 
    // Otherwise default to Pro for quality schema generation.
    const modelId = useSearch ? "gemini-3-flash-preview" : "gemini-3-pro-preview";
    const tools = useSearch ? [{ googleSearch: {} }] : [];

    let currentPrompt = `
      Target Documentation / Context:
      ${context}

      Mission:
      Construct a Sovereign Agent Manifest compliant with the DRP-2026 Framework. 
      ${agentName ? `IDENTITY MANDATE: The agent's name MUST be "${agentName}".` : "Explicitly define a 'name' in the identity section."}
      
      CORE REQUIREMENTS (The Epistemic Matrix):
      1. Goal Architecture ($G): Define the 'Primary Goal' (Invariant) and 'Anti-Goals' (Strict Constraints).
      2. Output Fidelity ($O): Define schema and formatting constraints.
      3. Communication ($C): Define epistemic markers and tone.
      4. Cognitive Protocol: Define the 'Thinking' instructions for the Think->Write->Code loop.
      
      Identify 'Anchors'—essential external dependencies.
      Identify 'Internal Tools' - self-check logic.
      Define 'Budget' - estimate total tokens and drift allowance.
      
      If search is active, use it to verify the latest capabilities.
    `;

    let attempt = 0;
    const maxAttempts = 3;
    let accumulatedUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    while (attempt < maxAttempts) {
      try {
        let response: GenerateContentResponse | null = null;
        let apiAttempt = 0;
        const maxApiAttempts = 5;
        let delay = 1000;

        while (apiAttempt < maxApiAttempts) {
          try {
            response = await invokeWithTimeout((signal) => ai.models.generateContent({
              model: modelId,
              contents: currentPrompt,
              config: {
                abortSignal: signal,
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: AGENT_SCHEMA,
                tools: tools,
              }
            }));
            break; // Success
          } catch (apiError: any) {
            apiAttempt++;
            const msg = apiError.message || String(apiError);
            const isTransient = msg.includes('429') || msg.includes('503') || msg.includes('500') || msg.includes('fetch failed');
            
            if (isTransient && apiAttempt < maxApiAttempts) {
              console.warn(`[Agent Fabrication] API Error (${msg}). Retrying in ${delay}ms... (Attempt ${apiAttempt}/${maxApiAttempts})`);
              await new Promise(r => setTimeout(r, delay));
              delay *= 2; // Exponential backoff
            } else {
              throw apiError; // Throw if not transient or max attempts reached
            }
          }
        }

        if (!response) {
          throw new Error("ERR_API_FAILURE: Failed to generate content after retries.");
        }

        accumulatedUsage = sumUsage(accumulatedUsage, getUsage(response));

        if (response.candidates?.[0]?.finishReason === 'SAFETY') {
          throw new Error("ERR_CONTENT_FILTERED: The model refused to generate a manifest due to safety policy triggers.");
        }

        const resultText = response.text;
        if (!resultText) {
          throw new Error("ERR_VOID_MANIFEST: The cognitive engine returned no data.");
        }

        const data = validateAgentManifest(repairJson(resultText));
        return { data, usage: accumulatedUsage };

      } catch (error: any) {
        attempt++;
        const msg = error.message || String(error);
        
        if (msg.includes('429') || msg.includes('RateLimitError')) {
          throw new Error("ERR_RATE_LIMITED: Epistemic bandwidth exceeded. Please wait.");
        }

        if (onScar) {
          onScar({
            timestamp: Date.now(),
            code: 'ERR_FABRICATION_SELF_CORRECTION',
            message: `Self-correction triggered: ${msg}`,
            context: `Attempt ${attempt}/${maxAttempts}`
          });
        }

        if (attempt >= maxAttempts) {
          throw error;
        }

        currentPrompt += `\n\nCRITICAL ERROR IN PREVIOUS ATTEMPT:\n${msg}\n\nPlease self-correct and output valid JSON matching the schema.`;
      }
    }

    throw new Error("ERR_MAX_RETRIES: Agent fabrication failed after maximum self-correction attempts.");

  } catch (error: any) {
    const msg = error.message || String(error);
    if (msg.includes('429') || msg.includes('RateLimitError')) {
      throw new Error("ERR_RATE_LIMITED: Epistemic bandwidth exceeded. Please wait.");
    }
    throw error;
  }
};

// --- Council Functions ---

/**
 * 1. Council Discovery: 5 specialized agents analyze the context.
 */
export const councilDiscovery = async (
  context: string, 
  member: CouncilMemberType
): Promise<GenAIResult<CouncilFeedback>> => {
  const modelId = "gemini-3-flash-preview"; // Fast model for parallel analysis
  
  const prompt = `
    RAW CONTEXT:
    ${context.substring(0, 15000)}

    TASK:
    Analyze this context from your specific role perspective (${member}).
    Identify the key elements required to build the Agent's Identity.
    Address the Council Chair directly. Start with "Chair, I have found..." or similar.
    Be succinct but high-resolution.
  `;

  const response = await executeWithRetry<GenerateContentResponse>(
    () => invokeWithTimeout((signal) => ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        abortSignal: signal,
        systemInstruction: COUNCIL_INSTRUCTIONS[member],
      }
    })),
    { operationName: `Council Discovery (${member})` }
  );

  return {
    data: {
      member,
      step: 'DISCOVERY',
      content: response.text || "No analysis provided.",
      timestamp: Date.now()
    },
    usage: getUsage(response)
  };
};

/**
 * 2. Council Synthesis: Strategist converges the 5 feedbacks into a Draft Manifest.
 */
export const councilSynthesis = async (
  context: string,
  feedbacks: CouncilFeedback[],
  agentName?: string,
  onScar?: (scar: ScarEntry) => void
): Promise<GenAIResult<Omit<SovereignAgentManifest, 'provenance'>>> => {
  const modelId = "gemini-3-pro-preview"; // Strong model for synthesis

  const councilMinutes = feedbacks.map(f => `=== ${f.member} ===\n${f.content}`).join('\n\n');

  let currentPrompt = `
    ORIGINAL CONTEXT:
    ${context.substring(0, 5000)}...

    COUNCIL DISCOVERY MINUTES:
    ${councilMinutes}

    MISSION:
    As the STRATEGIST (Chair), synthesize these disparate expert opinions into a cohesive Sovereign Agent Manifest.
    Resolve any conflicts between Security (Constraints) and Performance (Capabilities).
    Ensure the Identity is coherent.
    ${agentName ? `MANDATE: Name the agent "${agentName}".` : ""}
  `;

  let attempt = 0;
  const maxAttempts = 3;
  let accumulatedUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  while (attempt < maxAttempts) {
    try {
      const response = await executeWithRetry<GenerateContentResponse>(
        () => invokeWithTimeout((signal) => ai.models.generateContent({
          model: modelId,
          contents: currentPrompt,
          config: {
            abortSignal: signal,
            systemInstruction: SYSTEM_INSTRUCTION, // Use the master schema instruction
            responseMimeType: "application/json",
            responseSchema: AGENT_SCHEMA,
          }
        })),
        { operationName: 'Council Synthesis' }
      );

      accumulatedUsage = sumUsage(accumulatedUsage, getUsage(response));

      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error("ERR_CONTENT_FILTERED: The model refused to generate a manifest due to safety policy triggers.");
      }

      const resultText = response.text;
      if (!resultText) {
        throw new Error("ERR_VOID_MANIFEST: The cognitive engine returned no data.");
      }

      const data = validateAgentManifest(repairJson(resultText));
      return { data, usage: accumulatedUsage };

    } catch (error: any) {
      attempt++;
      const msg = error.message || String(error);
      
      if (msg.includes('429') || msg.includes('RateLimitError')) {
        throw new Error("ERR_RATE_LIMITED: Epistemic bandwidth exceeded. Please wait.");
      }

      if (onScar) {
        onScar({
          timestamp: Date.now(),
          code: 'ERR_SYNTHESIS_SELF_CORRECTION',
          message: `Self-correction triggered: ${msg}`,
          context: `Attempt ${attempt}/${maxAttempts}`
        });
      }

      if (attempt >= maxAttempts) {
        throw error;
      }

      currentPrompt += `\n\nCRITICAL ERROR IN PREVIOUS ATTEMPT:\n${msg}\n\nPlease self-correct and output valid JSON matching the schema.`;
    }
  }

  throw new Error("ERR_MAX_RETRIES: Council synthesis failed after maximum self-correction attempts.");
};

/**
 * 3. Council Critique: Specialized agents critique the Draft Manifest.
 */
export const councilCritique = async (
  draftManifest: any,
  member: CouncilMemberType
): Promise<GenAIResult<CouncilFeedback>> => {
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    DRAFT MANIFEST:
    ${JSON.stringify(draftManifest, null, 2)}

    TASK:
    Critique this draft from your specific role.
    - If you are Security, look for loopholes.
    - If you are Style, check the tone.
    - If you are Performance, check the tools.
    
    Output your critique in a concise paragraph addressed to the Chair. If it's good, say "Chair, I endorse this draft."
  `;

  const response = await executeWithRetry<GenerateContentResponse>(
    () => invokeWithTimeout((signal) => ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        abortSignal: signal,
        systemInstruction: COUNCIL_INSTRUCTIONS[member],
      }
    })),
    { operationName: `Council Critique (${member})` }
  );

  return {
    data: {
      member,
      step: 'CRITIQUE',
      content: response.text || "Endorse.",
      timestamp: Date.now()
    },
    usage: getUsage(response)
  };
};

/**
 * 4. Council Finalize: Strategist applies critiques and mints final artifacts.
 */
export const councilFinalize = async (
  draftManifest: any,
  critiques: CouncilFeedback[],
  onScar?: (scar: ScarEntry) => void
): Promise<GenAIResult<Omit<SovereignAgentManifest, 'provenance'>>> => {
  const modelId = "gemini-3-pro-preview";

  const critiqueLog = critiques.map(c => `[${c.member}]: ${c.content}`).join('\n');

  let currentPrompt = `
    DRAFT MANIFEST:
    ${JSON.stringify(draftManifest)}

    COUNCIL CRITIQUES:
    ${critiqueLog}

    MISSION:
    Apply the final critiques to polish the manifest.
    - Fix security loopholes identified by Security.
    - Adjust tone as requested by Style.
    - Optimize tools as requested by Performance.
    
    Output the FINAL JSON Manifest.
  `;

  let attempt = 0;
  const maxAttempts = 3;
  let accumulatedUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  while (attempt < maxAttempts) {
    try {
      const response = await executeWithRetry<GenerateContentResponse>(
        () => invokeWithTimeout((signal) => ai.models.generateContent({
          model: modelId,
          contents: currentPrompt,
          config: {
            abortSignal: signal,
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: AGENT_SCHEMA,
          }
        })),
        { operationName: 'Council Finalization' }
      );

      accumulatedUsage = sumUsage(accumulatedUsage, getUsage(response));

      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error("ERR_CONTENT_FILTERED: The model refused to generate a manifest due to safety policy triggers.");
      }

      const resultText = response.text;
      if (!resultText) {
        throw new Error("ERR_VOID_MANIFEST: The cognitive engine returned no data.");
      }

      const data = validateAgentManifest(repairJson(resultText));
      return { data, usage: accumulatedUsage };

    } catch (error: unknown) {
      attempt++;
      const msg = error instanceof Error ? error.message : String(error);
      
      if (msg.includes('429') || msg.includes('RateLimitError')) {
        throw new Error("ERR_RATE_LIMITED: Epistemic bandwidth exceeded. Please wait.");
      }

      if (onScar) {
        onScar({
          timestamp: Date.now(),
          code: 'ERR_FINALIZATION_SELF_CORRECTION',
          message: `Self-correction triggered: ${msg}`,
          context: `Attempt ${attempt}/${maxAttempts}`
        });
      }

      if (attempt >= maxAttempts) {
        throw error;
      }

      currentPrompt += `\n\nCRITICAL ERROR IN PREVIOUS ATTEMPT:\n${msg}\n\nPlease self-correct and output valid JSON matching the schema.`;
    }
  }

  throw new Error("ERR_MAX_RETRIES: Council finalization failed after maximum self-correction attempts.");
};

// ... (Other exports distillCapsule, generateMetaPrompt, etc. stay same) ...
/**
 * Distills context into a public Context Capsule
 */
export const distillCapsule = async (context: string): Promise<GenAIResult<ContextCapsule>> => {
  try {
    const modelId = "gemini-3-flash-preview"; 
    
    const prompt = `
      SOURCE CONTENT:
      ${context}

      MISSION:
      Distill this content into a 'Context Capsule' - a public, immutable knowledge artifact.
      
      CRITICAL INSTRUCTIONS:
      1. IGNORE internal operational details if the source is an Agent Manifest.
      2. FOCUS on the underlying philosophy, methodology, and public capabilities.
      3. POPULATE EVERY FIELD in the schema. Do not output nulls unless data is strictly impossible to infer.
      4. GENERATE at least 3 'Key Concepts'.
      5. GENERATE at least 3 'Workflow Steps' if applicable.
      6. VERBOSITY: Use detailed paragraphs, not single words.
      7. TIMELINE: Look for access dates or citations dates in the text. E.g. "Accessed Oct 2023". Set 'research_date' to this. If not found, imply it.
      
      OUTPUT:
      Produce valid JSON strictly matching the ContextCapsule schema.
    `;

    const response = await executeWithRetry<GenerateContentResponse>(
      () => invokeWithTimeout((signal) => ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          abortSignal: signal,
          systemInstruction: CAPSULE_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: CAPSULE_SCHEMA,
        }
      })),
      { 
        operationName: 'Capsule Distillation',
        retries: 3 
      }
    );

    const resultText = response.text;
    if (!resultText) {
      throw new Error("ERR_VOID_CAPSULE: The cognitive engine returned no data.");
    }

    const capsule = validateContextCapsule(repairJson(resultText));
    if (!capsule.meta.created_at) {
        capsule.meta.created_at = Date.now();
    }

    return {
        data: capsule,
        usage: getUsage(response)
    };
  } catch (error: any) {
    console.error("Capsule Distillation Error", error);
    throw error;
  }
};

/**
 * The generateMetaPrompt function.
 * @param intent - The intent parameter.
 * @param engine - The engine parameter.
 * @returns The resulting Promise<GenAIResult<string>>.
 */
export const generateMetaPrompt = async (
  intent: string,
  engine: PromptEngineConfig
): Promise<GenAIResult<string>> => {
  try {
    const modelId = "gemini-3-pro-preview";

    const userPrompt = `
      USER INTENT / TOPIC:
      "${intent}"

      KNOWLEDGE CONTEXT / METHODOLOGY (Grounding Data):
      ${engine.knowledgeContext || "No specific methodology provided. Use standard best practices."}
      
      TASK:
      Generate the target prompt according to the SYSTEM INSTRUCTIONS.
    `;

    const response = await executeWithRetry<GenerateContentResponse>(
      () => invokeWithTimeout((signal) => ai.models.generateContent({
         model: modelId,
         contents: userPrompt,
         config: {
           abortSignal: signal,
           systemInstruction: engine.metaSystemPrompt,
           thinkingConfig: { thinkingBudget: 1024 } 
         }
      })),
      { operationName: 'Meta-Prompt Generation' }
    );

    return {
       data: response.text || "",
       usage: getUsage(response)
    };

  } catch (error: any) {
    console.error("Meta-Prompt Generation Error", error);
    throw error;
  }
};

/**
 * The createDiscoveryChat function.
 * @param context - The context parameter.
 * @param useSearch - The useSearch parameter.
 * @returns The resulting Chat.
 */
export const createDiscoveryChat = (context: string, useSearch: boolean): Chat => {
  // Use Flash for search grounding interactions, Pro for deep architectural reasoning without search
  const modelId = useSearch ? "gemini-3-flash-preview" : "gemini-3-pro-preview";
  const tools = useSearch ? [{ googleSearch: {} }] : [];

  return ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: `
        You are the "Sovereign Architect". Focus on Epistemic Goals ($G), Anti-Goals, and Immunological Constraints.
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

/**
 * The analyzeDocument function.
 * @param context - The context parameter.
 * @returns The resulting Promise<GenAIResult<ContextAnalysisResult>>.
 */
export const analyzeDocument = async (context: string): Promise<GenAIResult<ContextAnalysisResult>> => {
  try {
    const modelId = "gemini-3-flash-preview";
    const prompt = `
      Analyze the following document context. 
      Identify the overall sentiment (Technical/Neutral is 'NEUTRAL', Marketing/Hype is 'POSITIVE', Warning/Error logs is 'NEGATIVE').
      Extract up to 3 key high-level topic tags (e.g., 'Payment API', 'Authentication', 'React Hooks').

      Text Snippet:
      ${context.substring(0, 8000)}
    `;

    const response = await executeWithRetry<GenerateContentResponse>(
      () => invokeWithTimeout((signal) => ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          abortSignal: signal,
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA
        }
      })),
      { 
        operationName: 'Document Analysis',
        retries: 2,
        fallback: async () => ({
           text: JSON.stringify({ sentiment: 'COMPLEX', topics: ['Unanalyzed'] }),
        } as GenerateContentResponse)
      }
    );

    const text = response.text || JSON.stringify({ sentiment: 'COMPLEX', topics: ['Unanalyzed'] });
    
    return {
        data: validateAnalysisResult(secureJSONParse(text)),
        usage: getUsage(response)
    };
  } catch (e) {
    console.warn("Analysis failed", e);
    return {
        data: { sentiment: 'COMPLEX', topics: ['Unanalyzed'] },
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    };
  }
};
