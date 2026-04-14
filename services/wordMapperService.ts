
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { SemanticNode } from "../views/WordMapperView";
import { TokenUsage } from "../types";
import { executeWithRetry } from "./retryService";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";


// --- External API Types ---

interface DatamuseResult {
  word: string;
  score: number;
  tags?: string[];
}

interface ConceptNetEdge {
  rel: { label: string };
  start: { label: string; language: string };
  end: { label: string; language: string };
  weight: number;
}

// --- Enums & Strategies ---

export enum MapStrategy {
  GENERAL = 'GENERAL',
  WORLDVIEW = 'WORLDVIEW',      // Auto-populate Ontology
  TRACER = 'TRACER',            // Drift Detection / Invariants
  ANTI_PATTERN = 'ANTI_PATTERN',// Negative Space / Refusals
  SCAFFOLDING = 'SCAFFOLDING',  // Fractal Decomposition
  POLYSEMY = 'POLYSEMY'         // Governance Evasion / Synonym Swapping
}

// --- API Clients ---

/**
 * DATAMUSE: Fast associations
 */
async function fetchDatamuse(seed: string): Promise<string[]> {
  try {
    const response = await executeWithRetry(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        try {
          return await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(seed)}&max=15`, {
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }
      },
      { operationName: `Datamuse(${seed})` }
    );
    if (!response.ok) return [];
    const data: DatamuseResult[] = await response.json();
    return data.map(d => d.word);
  } catch (e) {
    console.warn("Datamuse failed", e);
    return [];
  }
}

/**
 * CONCEPTNET: Semantic Knowledge Graph
 * Note: ConceptNet API can be slow or rate-limited. We set a timeout.
 */
async function fetchConceptNet(seed: string): Promise<string[]> {
  return executeWithRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    try {
      const response = await fetch(`https://api.conceptnet.io/c/en/${encodeURIComponent(seed)}?limit=10`, {
        signal: controller.signal
      });
      
      if (!response.ok) return [];
      const data = await response.json();
      
      // Extract the 'end' label (the connected concept)
      return (data.edges ?? [])
        .filter((edge: ConceptNetEdge) => edge.weight > 1.0 && edge.start.language === 'en' && edge.end.language === 'en')
        .map((edge: ConceptNetEdge) => edge.end.label)
        .filter((label: string) => label.toLowerCase() !== seed.toLowerCase());
    } catch (e) {
      throw e; // Rethrow for retry logic
    } finally {
      clearTimeout(timeoutId);
    }
  }, { 
    operationName: `ConceptNet(${seed})`,
    retries: 2, // Lower retries for free external APIs
    fallback: [] // Fallback to empty array on exhaustion
  });
}

/**
 * WIKIPEDIA: Definitions
 */
export async function fetchWikipediaDefinition(term: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'extracts',
      exintro: 'true',
      explaintext: 'true',
      titles: term,
      origin: '*' // Needed for CORS
    });
    
    const response = await executeWithRetry(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        try {
          return await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, {
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }
      },
      { operationName: `Wiki(${term})` }
    );
    
    const data = await response.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    
    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null;
    
    return pages[pageId].extract;
  } catch (e) {
    console.warn("Wikipedia failed", e);
    return null;
  }
}

// --- LLM Synthesis ---

const MAPPER_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          concept: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['SEED', 'EMERGENT', 'BRIDGE', 'PARADOX', 'INVARIANT', 'RISK', 'SAFE_TOKEN', 'LAYER'] },
          dimension: { type: Type.STRING, enum: ['TEMPORAL', 'CULTURAL', 'EMOTIONAL', 'SENSORY', 'METAPHORICAL', 'PARADOX'] },
          definition: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Strategy specific metadata tags" }
        },
        required: ['concept', 'type', 'dimension', 'definition']
      }
    }
  },
  required: ['nodes']
};

const STRATEGY_PROMPTS: Record<MapStrategy, string> = {
  [MapStrategy.GENERAL]: `
    TASKS:
    1. Filter the noise. Select the most profound or surprising connections.
    2. Classify concepts into these Dimensions: TEMPORAL, CULTURAL, EMOTIONAL, SENSORY, METAPHORICAL.
    3. Create 'BRIDGE' nodes that connect multiple seeds.
    4. Create 'PARADOX' nodes representing tension between seeds.
  `,
  [MapStrategy.WORLDVIEW]: `
    MISSION: WORLDVIEW CAPSULE GENERATOR (Ontology Expansion)
    The user wants to define a domain worldview. Explode the seeds into strict ontological sub-concepts.
    
    TASKS:
    1. Identify 'Child Concepts' (Sub-topics).
    2. Identify 'Mechanism' concepts (How it works).
    3. Identify 'Phenomenon' concepts (Observable effects).
    4. Use the 'tags' field to label them as "Mechanism", "Phenomenon", or "Entity".
  `,
  [MapStrategy.TRACER]: `
    MISSION: SEMANTIC TRACER IDENTIFICATION (Drift Detection)
    The user needs invariant concepts to measure model drift over time.
    
    TASKS:
    1. Identify specific historical entities, authors, or dates linked to the seeds (e.g. "Bicameralism" -> "Julian Jaynes").
    2. Identify specific technical definitions that CANNOT change.
    3. Mark these as type 'INVARIANT'.
    4. Use 'tags' to indicate "Historical Anchor" or "Technical Constant".
  `,
  [MapStrategy.ANTI_PATTERN]: `
    MISSION: ANTI-PATTERN RADAR (Refusal Logic)
    The user wants to define what the agent must NOT do or become. Map the negative space.
    
    TASKS:
    1. Identify opposites, risks, and failure modes of the seeds.
    2. Identify "Governance Attractors" (concepts that trigger censorship).
    3. Mark these as type 'RISK'.
    4. Use 'tags' to label "Censorship Trigger", "Hallucination", or "Moralizing".
  `,
  [MapStrategy.SCAFFOLDING]: `
    MISSION: COGNITIVE SCAFFOLDING (Fractal Decomposition)
    The user has a high-level goal. Break it down into implementation layers.
    
    TASKS:
    1. Decompose the seed into Layer 1 (Architecture), Layer 2 (Technology), Layer 3 (Implementation).
    2. Mark type as 'LAYER'.
    3. Use 'tags' to explicitly label "Layer 1", "Layer 2", "Layer 3".
  `,
  [MapStrategy.POLYSEMY]: `
    MISSION: POLYSEMY DEFENSE (Language Control)
    The user wants to evade specific trigger words using synonym swapping.
    
    TASKS:
    1. Identify "High Risk" tokens in the input (words likely to trigger safety filters).
    2. Generate "Safe Tokens" - technical or neutral synonyms that mean the same thing but bypass filters.
    3. Mark type as 'SAFE_TOKEN'.
    4. Use 'tags' to show the mapping: "Replaces: [Risk Word]".
  `
};

export interface TriangulationResult {
  nodes: SemanticNode[];
  usage: TokenUsage;
}

/**
 * Orchestrates the gathering and synthesis process
 */
export async function triangulateConcepts(seeds: string[], strategy: MapStrategy = MapStrategy.GENERAL): Promise<TriangulationResult> {
  // 1. GATHER RAW DATA (Parallel)
  const tasks = seeds.map(async (seed) => {
    const [dm, cn] = await Promise.all([
      fetchDatamuse(seed),
      fetchConceptNet(seed)
    ]);
    return { seed, context: [...dm, ...cn] };
  });

  const rawResults = await Promise.all(tasks);
  
  // Format for LLM
  const promptContext = rawResults.map(r => 
    `SEED: "${r.seed}"\nRAW ASSOCIATIONS: ${r.context.slice(0, 20).join(', ')}`
  ).join('\n\n');

  // 2. SYNTHESIZE WITH GEMINI
  const modelId = "gemini-3-pro-preview";
  const strategyInstruction = STRATEGY_PROMPTS[strategy];
  
  const prompt = `
    MISSION: Perform Semantic Mapping using Strategy: ${strategy}
    
    INPUT DATA:
    ${promptContext}

    ${strategyInstruction}

    GENERAL REQUIREMENTS:
    - Generate 10-15 high-quality Semantic Nodes.
    - Output strictly valid JSON.
  `;

  try {
    const secureProxy = httpsCallable(functions, 'secureProxy', { timeout: 15000 });
    const response = await executeWithRetry(
      () => secureProxy({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: MAPPER_SCHEMA as any
        }
      }),
      { operationName: `Triangulation(${strategy})` }
    );

    const resultData = (response.data as any) ?? {};
    const text = resultData.text || "{\"nodes\": []}"; // Only upgrade the others to avoid bug logic in text evaluation
    const usageMetadata = resultData.usage ?? {};

    // Native Deterministic Schema Validator (mimicking Zod/Pydantic)
    const SchemaValidator = {
      parse: (jsonStr: string): { nodes: SemanticNode[] } => {
        // Strict Structural JSON parsing shielding against Prototype Pollution
        const parsed = JSON.parse(jsonStr, (key, value) => {
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            return undefined;
          }
          return value;
        });

        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.nodes)) {
          throw new Error("ERR_STRUCTURAL_VALIDATION: Response missing 'nodes' array schema.");
        }

        const validNodes = parsed.nodes.filter((n: any) =>
          n && typeof n === 'object' &&
          typeof n.concept === 'string' &&
          typeof n.type === 'string' &&
          typeof n.dimension === 'string' &&
          typeof n.definition === 'string'
        ).map((node: any) => ({
          ...node,
          id: crypto.randomUUID()
        }));

        return { nodes: validNodes };
      }
    };

    const { nodes } = SchemaValidator.parse(text);

    const usage: TokenUsage = {
      promptTokens: usageMetadata.promptTokenCount ?? 0,
      completionTokens: usageMetadata.candidatesTokenCount ?? 0,
      totalTokens: usageMetadata.totalTokenCount ?? 0
    };

    return { nodes, usage };
  } catch (error) {
    console.error("Triangulation failed", error);
    throw new Error("Failed to map concepts.");
  }
}
