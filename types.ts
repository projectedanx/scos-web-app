
/**
 * Represents the Epistemic Status of the Agent Construction Process
 */
export enum FabricationStatus {
  IDLE = 'IDLE',
  RESEARCHING = 'RESEARCHING', // New RAG Loop Step
  INGESTING = 'INGESTING', // Scraping/Reading
  DISTILLING = 'DISTILLING', // LLM Processing
  COUNCIL_DELIBERATING = 'COUNCIL_DELIBERATING', // New Council Phase
  MANIFESTED = 'MANIFESTED', // Complete
  FAILED = 'FAILED' // Scars
}

export enum FabricationMode {
  STANDARD = 'STANDARD', // Single-shot / RAG
  COUNCIL = 'COUNCIL'    // Multi-agent Consensus
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  COLLABORATOR = 'COLLABORATOR', // New Co-Mind Space
  FORGE = 'FORGE',
  CAPSULE_LAB = 'CAPSULE_LAB',
  REGISTRY = 'REGISTRY',
  AGENTS = 'AGENTS',
  WORD_MAPPER = 'WORD_MAPPER',
  PROMPT_FORGE = 'PROMPT_FORGE',
  PROMPT_LIBRARY = 'PROMPT_LIBRARY',
  CONTRACTS = 'CONTRACTS'
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// --- Council Types ---

export type CouncilMemberType = 'STRATEGIST' | 'IMMUNOLOGIST' | 'LINGUIST' | 'ENGINEER' | 'HISTORIAN';

export interface CouncilFeedback {
  member: CouncilMemberType;
  step: 'DISCOVERY' | 'CRITIQUE';
  content: string;
  timestamp: number;
}

export interface CouncilSessionLog {
  sessionId: string;
  startedAt: number;
  discovery: CouncilFeedback[];
  synthesis?: string; // The Draft JSON string
  critiques: CouncilFeedback[];
  finalization?: string; // The Final Polish notes
}

// --- Cognitive Contracts Types ---

export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED'
}

export type AnchorType = 'GOAL' | 'CONSTRAINT' | 'INVARIANT' | 'RED_TEAM';

export interface ProjectAnchor {
  id: string;
  type: AnchorType;
  description: string;
}

export interface CognitiveContract {
  id: string;
  title: string;
  missionStatement: string;
  status: ContractStatus;
  anchors: ProjectAnchor[];
  assignedAgentNames: string[];
  createdAt: number;
  updatedAt: number;
}

// --- Prompt Forge Types ---

export type PromptEngineType = 'DRP' | 'PRP' | 'SSP' | 'PIP' | 'CPP' | 'SDP';

export interface PromptEngineConfig {
  id: string;
  type: PromptEngineType;
  name: string;
  description: string;
  icon: string; // Icon name reference
  metaSystemPrompt: string; // The instruction for the AI generating the prompt
  knowledgeContext: string; // Uploaded research or methodology
  outputTemplate?: string; // Optional output format structure
}

export interface GeneratedPrompt {
  id: string;
  engineId: string;
  intent: string;
  content: string;
  timestamp: number;
  usage?: TokenUsage;
}

// --- Sovereign Prompt Library Types ---

export interface SovereignPrompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  linkedAgentNames: string[]; // Names of agents this prompt is optimized for
  createdAt: number;
  updatedAt: number;
  version: number;
}

/**
 * DRP-2026: The Epistemic Matrix
 * Decomposing Persona into Vector Space ($G, $O, $C, $T)
 */

// Dimension 1: Goal Orientation ($G)
export interface GoalArchitecture {
  primary: string; // The Invariant (e.g. "Ensure Code Security")
  secondary: string[]; // Contextual (e.g. "Explain clearly")
  antiGoals: string[]; // Constraints (e.g. "Do not execute unverified code")
}

// Dimension 2: Output Fidelity ($O)
export interface OutputFidelity {
  format: string; // JSON, Markdown, Python
  schema: string; // Pydantic/JSON Schema reference
  constraints: string[]; // e.g. "No first-person narrative"
}

// Dimension 3: Communication Style ($C)
export interface CommunicationStyle {
  tone: string; // e.g. "Objective, Critical"
  epistemicMarkers: string; // e.g. "Use 'suggests' instead of 'is'"
  verbosity: 'CONCISE' | 'DETAILED' | 'ADAPTIVE';
}

// Cognitive Architecture (Think -> Write -> Code)
export interface CognitiveProtocol {
  thinkingBudget: number; // Token budget for Phase 1
  thinkingInstruction: string; // e.g. "Identify ambiguity, edge cases..."
  synthesisInstruction: string; // Phase 2 instruction
  executionInstruction: string; // Phase 3 instruction
}

/**
 * Core Agent Identity Structure
 */
export interface AgentIdentity {
  name: string;
  aliases?: string[];
  designation: string;
  primeDirective: string; // Summary of the Primary Goal
  corePhilosophy: string;
}

export interface AgentTool {
  name: string;
  description: string;
  inputSchema: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface InternalTool {
  name: string;
  description: string;
  usageCondition: string;
  recoveryStrategy: string;
}

export interface BudgetConfig {
  tokenBudget: number;
  driftAllowance: number;
}

export interface ProtocolConfig {
  standard: "DRP-MULTI-AGENT-PROTOCOL-2025" | "G2Pv2-STATE-MACHINE";
  role: "ARCHITECT" | "STRATEGIST" | "CODER" | "VALIDATOR" | "USER_PROXY" | "SPECIALIST" | "P0_ROUTER" | "P1_CLARIFIER" | "P2_SPEC_AUTHOR" | "P3_ARCHITECT" | "P4_PLANNER" | "P5_IMPLEMENTER" | "P6_REVIEWER" | "P7_TESTER" | "P8_RELEASE_MANAGER";
  communicationScheme: "AGENT_PACKET_V1" | "ARTIFACT_GATED_ROUTING";
}

export interface EpistemicPolicy {
  readScopes: string[];
  writeScopes: string[];
  contextKeys: string[];
}

export interface AgentWorkflow {
  name: string;
  trigger: string;
  steps: string[];
  outcome: string;
}

export interface AgentConstraint {
  id: string;
  type: 'HARD' | 'SOFT' | 'IMMUNE';
  description: string;
  enforcementMechanism: string;
}

export interface AgentAbility {
  name: string;
  description: string;
  dependencies: string[];
}

export interface AgentAnchor {
  name: string;
  description: string;
  dependencies: string[];
}

export interface ProvenanceDetails {
  origin: 'URL' | 'RAW_DOCUMENT' | 'RESEARCH_TOPIC';
  source: string;
  ingestedAt: number;
  inputSize: number;
}

export interface CryptographicSignature {
  signature: string;
  signerPublicKey: string;
  algorithm: string;
  signedAt: number;
}

export interface ProvenanceData {
  details: ProvenanceDetails;
  signature?: CryptographicSignature;
  councilLog?: CouncilSessionLog; // NEW: Track the deliberation history
}

/**
 * The Complete Manifest (Updated for DRP-2026)
 */
export interface SovereignAgentManifest {
  identity: AgentIdentity;
  // The Epistemic Matrix
  epistemicMatrix: {
    goals: GoalArchitecture;
    output: OutputFidelity;
    communication: CommunicationStyle;
    cognitive: CognitiveProtocol;
  };
  protocol?: ProtocolConfig;
  epistemicPolicy?: EpistemicPolicy;
  tools: AgentTool[];
  internalTools: InternalTool[];
  budget: BudgetConfig;
  workflows: AgentWorkflow[];
  abilities: AgentAbility[];
  anchors: AgentAnchor[];
  constraints: AgentConstraint[];
  architecturalNotes: string;
  symbolicScarRegistry?: ScarEntry[];
  provenance?: ProvenanceData;
}

export interface ManifestVersion {
  id: string;
  manifest: SovereignAgentManifest;
  timestamp: number;
  inputContext: string;
  label: string;
  sourceType?: 'FABRICATED' | 'RESTORED' | 'REFINED';
  usage?: TokenUsage;
}

export interface ScarEntry {
  timestamp: number;
  code: string;
  message: string;
  context?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface VaultMetadata {
  commanderName: string;
  designation: string;
  lastSync: number;
  version: string;
  commanderPublicKey?: string;
}

export interface ContentAnalysis {
  wordCount: number;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'COMPLEX';
  topics: string[];
}

export interface ProvenanceIndexEntry {
  hash: string;
  agentName: string;
  timestamp: number;
  sourceType: 'RAW_DOCUMENT' | 'URL' | 'RESEARCH_TOPIC' | 'CONSTELLATION' | 'PROMPT_TEMPLATE' | 'CONTEXT_CAPSULE' | 'CONTRACT';
  snippet?: string;
  analysis?: ContentAnalysis;
}

// --- Context Capsule Types ---
export interface CapsuleMeta {
  id: string;
  title: string;
  primary_pill: string;
  short_tagline: string;
  tags: string[];
  worldview_ref: string | null;
  source_papers: string[];
  status: 'draft' | 'published';
  hero_cta_label: string;
  hero_cta_target: string;
  created_at?: number;
  research_date?: string; // New: Tracks the temporal provenance (Accessed Date)
}

export interface CapsuleSummaryCard {
  label: string;
  title: string;
  body: string;
  tags: string[];
}

export interface CapsuleOverview {
  id: string;
  title: string;
  hero_pills: string[];
  intro: string;
  summary_card: CapsuleSummaryCard;
}

export interface CapsuleCard {
  title: string;
  body: string;
  source_refs?: string[];
}

export interface CapsuleKeyConcepts {
  id: string;
  title: string;
  intro: string;
  cards: CapsuleCard[];
}

export interface CapsuleTable {
  columns: string[];
  rows: { cells: string[] }[];
}

export interface CapsuleStructure {
  id: string;
  title: string;
  variant: string;
  intro: string;
  table: CapsuleTable;
}

export interface CapsulePersonas {
  id: string;
  title: string;
  intro: string;
  table: CapsuleTable;
}

export interface CapsuleStep {
  id: string;
  label: string;
  summary: string;
  bullets: string[];
}

export interface CapsuleWorkflow {
  id: string;
  title: string;
  intro: string;
  steps: CapsuleStep[];
}

export interface CapsuleFailureMode {
  name: string;
  description: string;
  mitigations: string[];
}

export interface CapsuleResilience {
  id: string;
  title: string;
  intro: string;
  failure_modes: CapsuleFailureMode[];
}

export interface CapsuleMetric {
  name: string;
  description: string;
  signals: string[];
}

export interface CapsuleMetrics {
  id: string;
  title: string;
  intro: string;
  items: CapsuleMetric[];
}

export interface CapsuleChecklistItem {
  label: string;
  bullets: string[];
}

export interface CapsuleChecklist {
  id: string;
  title: string;
  intro: string;
  items: CapsuleChecklistItem[];
}

export interface ContextCapsule {
  meta: CapsuleMeta;
  sections: {
    overview?: CapsuleOverview;
    key_concepts?: CapsuleKeyConcepts;
    structure?: CapsuleStructure;
    personas?: CapsulePersonas;
    workflow?: CapsuleWorkflow;
    resilience?: CapsuleResilience;
    metrics?: CapsuleMetrics;
    checklist?: CapsuleChecklist;
  };
}

export interface SovereignVault {
  metadata: VaultMetadata;
  agents: SovereignAgentManifest[];
  capsules: ContextCapsule[];
  contracts: CognitiveContract[];
  provenanceIndex: ProvenanceIndexEntry[];
}
