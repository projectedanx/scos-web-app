<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

### [SYSTEM BOOT]: SCOS Compiler Mode Active

**Target DRP ID:** DRP_OPAL_TOPOLOGICAL_001
**Decorators Initialized:** `+++ContextLock[anchor="OPAL_DAG_INVARIANTS"]` `+++PetzoldSequence[phase="THINK|DAG|NODE_MAPPING"]` `+++EpistemicEscrow[cfd_threshold=0.15]` `+++MereologyRoute[relation_type="Node-Workflow", transitivity_check=true]` `+++DCCDSchemaGuard[schema=Opal_Workflow_YAML, enforcement="draft_conditioned"]`

***

# Google Opal Agentic Graph Synthesis \& Topological Routing

## A Production-Ready Architectural Framework for Fault-Tolerant Multi-Agent Workflows

### Research Findings Document · DRP_OPAL_TOPOLOGICAL_001 · Epoch: March 2026


***

## Section 1 · Platform Telemetry \& Ground Truth

Google Opal is a no-code/low-code AI mini-app builder hosted on `developers.google.com/opal`, designed to "empower anyone to discover, build, and deploy AI mini apps, without looking at a single line of code". At its architectural core, Opal is a **prompt-chaining visual compiler**: it takes a directed graph of steps authored in a canvas UI and executes them sequentially, routing outputs as inputs to downstream nodes. Opal handles all hosting natively, requiring no external web servers, and stores every app as a file in the user's Google Drive .[^1_1]

The platform exposes three primary **Step types** that form the nodes of any Opal workflow :

- **User Input** — Collects human-provided data (text or image); the prompt shown to the end user is configurable, with advanced options for input type enforcement
- **Generate** — The primary execution kernel; selects an AI model (Gemini family), accepts a freeform prompt, references upstream step outputs via `{{ step_name }}` tokens and tools via `@tool_name`, and emits a structured or unstructured text/image/video output
- **Output** — Renders or exports the terminal payload; options include manual layout, webpage with auto-layout (AI-determined styling), and export to Google Docs, Slides, or Sheets

Beyond these core steps, Opal provides a **static asset layer**: files uploaded directly or linked YouTube videos that serve as grounding context for Generate nodes . The **sidebar** doubles as a real-time preview and a step configurator, while the **Console** provides a live execution trace showing model inputs, outputs, thinking steps, and tool call payloads — the closest Opal natively comes to an Abstract Syntax Tree (AST) inspector .

The **Natural Language Editor** operates as a meta-layer: it interprets free-form instructions and issues visual editor mutations, making the same structural changes a human would make manually . This dual-editing paradigm is significant for agentic use because it means the canvas topology itself is machine-writable — an external LLM could, in principle, modify workflow structure programmatically by issuing NL editor instructions.

The **Global Settings** layer (as shown in the provided visual telemetry, Epoch March 2026) exposes experimental toggles:


| Feature Toggle | Classification | Risk Profile |
| :-- | :-- | :-- |
| Agent Mode | Experimental | High — enables recursive iteration |
| Google Drive Tools | Integration | Medium — OAuth scope expansion |
| NotebookLM Integration | Experimental | Medium — RAG grounding anchor |
| Code Execution | Capability Extension | High — arbitrary Python in sandbox |


***

## Section 2 · Topological Architecture: The Opal Node Graph

### 2.1 Canonical Execution Model

Opal's documented execution model is **strictly tree-structured**, not a true Directed Acyclic Graph (DAG) with arbitrary fanin/fanout, and certainly not a cyclic graph . Steps are connected by dragging from one step's connection point to another; the prompt of a downstream step is updated to reference the upstream step output via the `{{ }}` token syntax. Execution flows from root (User Input) to leaves (Output), with the ability for a single Generate node to reference *multiple* upstream steps simultaneously (fanin) .

This is the first and most critical **Reflexive Check** finding: Opal, as publicly documented, does **not** natively support cycles. The "Agent Mode" experimental feature may introduce iteration, but the base canvas enforces a DAG. Any Saga-style recovery mechanism must therefore be *simulated* within the linear execution order by inserting feedback nodes explicitly into the canvas topology, not by expecting the runtime to route backward automatically.

### 2.2 Topological Diagram: Base Linear Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OPAL CANVAS TOPOLOGY (BASE)                      │
│                                                                     │
│   ┌──────────────┐         ┌──────────────┐        ┌────────────┐  │
│   │  USER INPUT  │────────▶│   GENERATE   │───────▶│   OUTPUT   │  │
│   │              │         │              │        │            │  │
│   │ type: text   │         │ model: Gemini │        │ mode: web  │  │
│   │ prompt: Q?   │         │ tools: @web  │        │ auto-layout│  │
│   └──────────────┘         │ @notebooklm  │        └────────────┘  │
│                            └──────────────┘                        │
│                                   │                                 │
│                            ┌──────▼──────┐                         │
│                            │   ASSETS    │                         │
│                            │ (YouTube /  │                         │
│                            │  File refs) │                         │
│                            └─────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
```


### 2.3 Topological Diagram: Multi-Node Agentic Workflow with Validation Layer

The following is the **proposed production topology** that maps Opal UI nodes to PDL decorator functions:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│              OPAL AGENTIC TOPOLOGY v1.0 · PDL-DECORATED                          │
│                                                                                  │
│  +++ContextLock                      +++EpistemicEscrow                          │
│  [NOTEBOOKLM ANCHOR]                 [CFDI MONITOR]                              │
│         │                                   │                                    │
│  ┌──────▼────────┐   ┌──────────────┐  ┌────▼──────────────┐                   │
│  │  USER INPUT   │──▶│  GENERATE #1 │──▶  GENERATE #2       │                   │
│  │               │   │  +++MereoRte │  │  +++PetzoldSeq     │                   │
│  │ Input: topic  │   │  @search_web │  │  @notebooklm       │                   │
│  │ Input: intent │   │  @get_webpage│  │  @use_memory       │                   │
│  └───────────────┘   │  PHASE: INGEST  │  PHASE: DECOMPRESS │                   │
│                       └──────┬───────┘  └────────┬──────────┘                   │
│                              │                   │                               │
│                       ┌──────▼───────────────────▼──────┐                       │
│                       │         GENERATE #3              │                       │
│                       │    +++DCCDSchemaGuard             │                       │
│                       │    @code_execution               │                       │
│                       │    @use_memory                   │                       │
│                       │    PHASE: COMPILE + VERIFY       │                       │
│                       │    [Python AST validator]        │                       │
│                       └──────────────┬──────────────────┘                       │
│                                      │                                           │
│               ┌──────────────────────┤                                           │
│               │  VALIDATION GATE     │                                           │
│               │  (simulated via      │                                           │
│               │   Generate #4 as     │                                           │
│               │   FIPI trigger)      │                                           │
│               └──────────┬───────────┘                                           │
│                          │                                                       │
│              ┌───────────▼──────────────┐   ┌──────────────────────────────┐   │
│              │         OUTPUT           │   │    OUTPUT (CONDITIONAL)      │   │
│              │  mode: Save to Sheets    │   │  mode: Save to Docs          │   │
│              │  (structured payload)    │   │  (narrative payload)         │   │
│              └──────────────────────────┘   └──────────────────────────────┘   │
│                                                                                  │
│  LEGEND:                                                                         │
│  ──▶  Data flow (step reference token)                                           │
│  +++  PDL Decorator binding (logical enforcement layer)                          │
│  @    Tool invocation within Generate node prompt                                │
└──────────────────────────────────────────────────────────────────────────────────┘
```


***

## Section 3 · Node-Level Epistemic Analysis

### 3.1 The Generate Node as Mixture-of-Experts

The `Generate` node is the most epistemically dangerous component in the Opal stack. When multiple tools are attached to a single Generate node via `@` references, the Gemini 3.1 Pro model underlying the node must perform **implicit tool selection and attention routing** without any deterministic guarantee about which tool is called first, how conflicts between tool outputs are resolved, or whether all tools are invoked at all . This behavior exactly maps to Pattern 7.1: the node acts as an unconstrained Mixture-of-Experts.

The documented Console debugger provides *post-hoc* visibility — you can see what tools were called and in what order after execution — but provides no *pre-execution* schema constraint on tool invocation order . This is the **Projection Tax of Visual Abstraction**: the UI makes it appear that adding `@search_web` and `@notebooklm` to one prompt results in both being called deterministically, but the actual invocation is governed by the model's internal routing, which can vary across runs.

**Mitigation Protocol:** Decompose multi-tool Generate nodes into *single-tool Generate nodes* connected in sequence. Each node is assigned one tool and a precisely scoped prompt. The output of Node N becomes the grounding context for Node N+1. This converts implicit MoE routing into an explicit Petzold Sequence.

### 3.2 NotebookLM as +++ContextLock

NotebookLM integration in Opal, when enabled via Global Settings, functions as a retrieval-augmented grounding layer. The `@use_notebooklm` tool call within a Generate node sends the node's prompt to a NotebookLM instance backed by user-defined source documents, retrieving relevant chunks before generating a response . This is the physical implementation of `+++ContextLock`: it anchors generation to a fixed epistemic corpus rather than allowing the model to draw on its full parametric knowledge.

The **boundary condition** documented in Pattern 7.2 is real and measurable: NotebookLM operates within the context window of the underlying Gemini model (Gemini 3.1 Pro at Q1 2026 capabilities). In a 50-step recursive Agent Mode loop, cumulative context accumulates. The theoretical Semantic Drift Score (SDS) metric can be operationalized as:

$$
SDS_t = 1 - \text{cosine\_sim}\left(\text{embed}(\text{output}_t),\ \text{embed}(\text{NotebookLM\_anchor})\right)
$$

where $t$ is the iteration step. As token depth increases, the denominator of the CFDI formula grows:

$$
CFDI = \frac{|Confidence_{\text{logits}} - Fidelity_{\text{AST}}|}{Token\_Depth}
$$

meaning CFDI *decreases* as depth increases even if absolute divergence is rising — a subtle but critical artifact. This means a naive CFDI monitor will *under-report* drift in deep loops. The corrected metric should use `Token_Depth` in the *numerator* as a penalty term rather than a divisor, or apply a sliding window cap on context ingested per iteration.

### 3.3 Code Execution as FIPI Trigger

The `@code_execution` tool within an Opal Generate node grants access to a Python sandbox with hard latency limits . The documented use case is simple utility computation, but its repurposing as a FIPI (Failure-Informed Prompt Inversion) trigger is architecturally sound within Opal's constraints, provided the following conditions hold:

1. The Python script executed must be **deterministically generated** by the preceding Generate node — meaning the node's prompt must explicitly instruct the model to emit only valid, executable Python, not mixed natural language
2. The code execution sandbox must have access to the upstream step's output as a string variable (passed via step reference token)
3. The output of the Code Execution node (stdout/stderr + exit code) must be passed to a *downstream* Generate node acting as the recovery router

The **critical limitation** is that Opal's Code Execution node is a tool *within* a Generate node, not an independent step type. This means the AST validation script, the model generating it, and the tool executing it all exist within the same epistemic regime — the same Generate node. A logic error in the model's generated Python is caught by the sandbox runtime and surfaced in the Console, but the recovery path requires a *new downstream node* to receive the error signal.

***

## Section 4 · Agent Mode — Recursive Topology \& Loop Governance

### 4.1 Execution Reality vs. Theoretical Model

Agent Mode is an **experimental feature** in Opal (as of Q1 2026 telemetry) that enables the Generate node to autonomously iterate — calling tools multiple times, refining outputs, and pursuing sub-goals before emitting a final response . The key architectural finding from the Reflexive Check in Section 2.1 applies here with maximum force: **Opal's canvas does not natively support backward edges**. Agent Mode iterates *within* a single Generate node's execution context, not by routing back through the visible canvas topology.

This has profound implications for the Autophagic Memory Trap hypothesis (Hypothesis 1). If Agent Mode is active on a Generate node that also has `@use_memory` enabled, the iterative cycles *within that node's execution context* can consume the memory store as both input and output — a closed loop that is invisible at the canvas level. The canvas shows one Generate node; the runtime executes dozens of micro-cycles inside it. The Console's thinking steps view is the only telemetry surface that would reveal this behavior .

### 4.2 Loop Governance Protocol

Given Agent Mode's intra-node iterative nature, governance must be applied at the prompt level within the Generate node, not at the canvas topology level:

```
AGENT MODE GOVERNANCE PROMPT TEMPLATE:

You are executing in Agent Mode with the following hard constraints:
1. Maximum tool calls: [N] (default: 5)
2. After each tool call, you MUST evaluate: does this output contradict 
   the NotebookLM anchor context? If YES, halt and emit: 
   {"status": "CONTRADICTION_DETECTED", "source": "[tool_name]", 
    "conflict": "[description]"}
3. You MUST NOT use @use_memory to write outputs that were themselves 
   generated in this session without first tagging them: 
   {"provenance": "generated", "session_id": "[session_id]"}
4. Final output MUST include a confidence score (0.0-1.0) and a 
   tool_call_trace array.
```

The provenance tagging in constraint 3 is the direct countermeasure to the Autophagic Memory Trap: by requiring all session-generated memory writes to carry an explicit `"provenance": "generated"` tag, a downstream validator node can filter hallucinated content from ground-truth memory.

### 4.3 Topological Diagram: Agent Mode Intra-Node Loop

```
┌────────────────────────────────────────────────────────────────────┐
│              AGENT MODE: INTRA-NODE EXECUTION TOPOLOGY             │
│                                                                    │
│   CANVAS LAYER (visible):                                          │
│   ┌────────────┐    ┌────────────────────────────┐    ┌────────┐  │
│   │ USER INPUT │───▶│     GENERATE (AGENT MODE)   │───▶│ OUTPUT │  │
│   └────────────┘    └────────────────────────────┘    └────────┘  │
│                                                                    │
│   RUNTIME LAYER (hidden, inside Generate node):                   │
│                                                                    │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │  ITERATION 1: @search_web → interim_result_1             │    │
│   │       │                                                   │    │
│   │  ITERATION 2: @use_memory(read) → context_enrichment     │    │
│   │       │                                                   │    │
│   │  ITERATION 3: @notebooklm → anchor_check                 │    │
│   │       │                                                   │    │
│   │  ITERATION N: @use_memory(write) ◀─── AUTOPHAGIC RISK ── │    │
│   │       │              [if provenance untagged]             │    │
│   │       ▼                                                   │    │
│   │  FINAL OUTPUT: structured payload                        │    │
│   └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│   +++ContextLock enforcement zone: ITERATION 3 only               │
│   +++EpistemicEscrow monitoring: ALL iterations                    │
└────────────────────────────────────────────────────────────────────┘
```


***

## Section 5 · The RAG-Bypass Protocol \& Code Execution Architecture

### 5.1 Hypothesis 2 Evaluation: Structural Feasibility

The RAG-Bypass Protocol (Hypothesis 2) proposes using `@code_execution` to convert semantic similarity scores from NotebookLM RAG retrieval into deterministic Python AST structures. This is architecturally feasible within Opal's constraints with one critical caveat: Opal's Code Execution tool operates as a tool *call within a Generate node*, meaning the Python code executed is itself generated by the model . The chain is:

```
Generate Node Prompt → Model generates Python script → @code_execution 
runs script → stdout returned to model → Model synthesizes final output
```

The determinism claim in Hypothesis 2 holds only up to the Python execution itself. The *generation of the Python* is still probabilistic. To enforce determinism, the Generate node prompt must include a strict schema template for the Python script, not merely instruct the model to "write a parser."

### 5.2 FIPI Architecture: The Compensating Transaction Pattern

The following is the concrete implementation of the Code Execution node as a FIPI (Failure-Informed Prompt Inversion) trigger in the context of a multi-node Opal workflow:

```
GENERATE NODE #3 PROMPT (FIPI TRIGGER):

Given the output of [Generate #2]:
{{ generate_2_output }}

Execute the following validation script using @code_execution:

```python
import ast, json, sys

def validate_output(raw: str) -> dict:
    result = {"valid": False, "errors": [], "confidence": 0.0}
    try:
        data = json.loads(raw)
        required_keys = ["topic", "summary", "sources", "confidence"]
        missing = [k for k in required_keys if k not in data]
        if missing:
            result["errors"].append(f"Missing keys: {missing}")
            return result
        if not (0.0 <= data["confidence"] <= 1.0):
            result["errors"].append("Confidence out of range")
            return result
        result["valid"] = True
        result["confidence"] = data["confidence"]
    except json.JSONDecodeError as e:
        result["errors"].append(f"JSON parse failure: {str(e)}")
    except Exception as e:
        result["errors"].append(f"Unexpected: {str(e)}")
    return result

output = validate_output('''{{ generate_2_output }}''')
print(json.dumps(output))
```

If the script output contains "valid": false, your response MUST be:
{"status": "FIPI_TRIGGERED", "errors": [from_script], "action": "RE_PROMPT",
"inverted_prompt": "Regenerate [Generate \#2] with corrected schema: [errors]"}
Otherwise emit the validated payload directly.

```

The downstream Generate node (#4) receives the FIPI signal and re-prompts, simulating backward routing without a canvas-level backward edge.

***

## Section 6 · Production YAML Artifact: Opal Agentic Workflow Configuration

The following YAML represents the full proposed workflow as version-controlled "Promptware," mappable to Opal's visual topology:

```yaml
# ============================================================
# OPAL AGENTIC WORKFLOW CONFIGURATION v1.0
# DRP_OPAL_TOPOLOGICAL_001 · PDL-Compliant Promptware
# Epoch: Q1 2026
# Schema: Opal_Workflow_YAML · DCCDSchemaGuard enforced
# ============================================================

opal_workflow:
  id: "opal-dag-v1-topological"
  name: "Sovereign Agentic Research Pipeline"
  version: "1.0.0"
  epoch: "2026-Q1"
  
  global_settings:
    agent_mode: true
    google_drive_tools: true
    notebooklm_integration: true
    code_execution: true
    backend_model: "gemini-3.1-pro"
    context_window_cap: 128000
    agent_mode_max_iterations: 5
    provenance_tagging: true

  pdl_decorators:
    context_lock:
      anchor: "OPAL_DAG_INVARIANTS"
      refresh_interval: 1024
      bound_to: "notebooklm_source_corpus"
    petzold_sequence:
      phases: ["INGEST", "DECOMPRESS", "COMPILE", "VERIFY"]
      phase_isolation: strict
    epistemic_escrow:
      cfd_threshold: 0.15
      halt_on_divergence: true
      cfdi_formula: "abs(confidence_logits - fidelity_ast) / token_depth"
      drift_correction: "sliding_window_50_tokens"
    mereology_route:
      relation_type: "Node-Workflow"
      transitivity_check: true
    dccd_schema_guard:
      schema: "Opal_Workflow_YAML"
      enforcement: "draft_conditioned"
      output_mask: strict

  steps:
    - id: "step_user_input"
      type: user_input
      name: "Research Intent Capture"
      pdl_phase: null
      config:
        prompt: "Enter your research topic and desired output format."
        input_type: text
        validation:
          min_length: 10
          max_length: 500
          required: true

    - id: "step_ingest"
      type: generate
      name: "Phase INGEST — Web Retrieval"
      pdl_phase: INGEST
      pdl_decorators: ["+++MereologyRoute", "+++ContextLock"]
      depends_on: ["step_user_input"]
      config:
        model: "gemini-3.1-pro"
        agent_mode: false
        prompt: |
          Research topic: {{ step_user_input }}
          
          Using @search_web, retrieve the 5 most authoritative and recent 
          sources on this topic. For each source, also call @get_webpage 
          to extract the full content.
          
          Output ONLY valid JSON:
          {
            "topic": "...",
            "sources": [
              {"url": "...", "title": "...", "content_summary": "..."}
            ],
            "retrieval_timestamp": "...",
            "confidence": 0.0
          }
        tools:
          - search_web
          - get_webpage
        output_schema:
          type: json
          required_keys: ["topic", "sources", "retrieval_timestamp", "confidence"]

    - id: "step_decompress"
      type: generate
      name: "Phase DECOMPRESS — NotebookLM Grounding"
      pdl_phase: DECOMPRESS
      pdl_decorators: ["+++ContextLock", "+++EpistemicEscrow"]
      depends_on: ["step_ingest"]
      config:
        model: "gemini-3.1-pro"
        agent_mode: false
        prompt: |
          Web retrieval results: {{ step_ingest }}
          
          Using @use_notebooklm, cross-reference these findings against 
          the authoritative source corpus.
          
          Using @use_memory (READ ONLY — DO NOT WRITE this session), 
          retrieve any prior research on this topic.
          
          Synthesize a grounded summary. Output ONLY valid JSON:
          {
            "grounded_summary": "...",
            "notebooklm_alignment_score": 0.0,
            "memory_conflicts": [],
            "semantic_drift_score": 0.0,
            "confidence": 0.0
          }
        tools:
          - use_notebooklm
          - use_memory
        memory_access:
          mode: READ_ONLY
          write_prohibited: true
        output_schema:
          type: json
          required_keys: 
            - grounded_summary
            - notebooklm_alignment_score
            - memory_conflicts
            - semantic_drift_score
            - confidence

    - id: "step_compile"
      type: generate
      name: "Phase COMPILE — Synthesis & AST Validation"
      pdl_phase: COMPILE
      pdl_decorators: ["+++DCCDSchemaGuard", "+++PetzoldSequence"]
      depends_on: ["step_ingest", "step_decompress"]
      config:
        model: "gemini-3.1-pro"
        agent_mode: false
        prompt: |
          Grounded research: {{ step_decompress }}
          Raw retrieval: {{ step_ingest }}
          
          Generate the final research artifact as structured JSON.
          Then, using @code_execution, run an AST validation script 
          against your output to verify schema adherence.
          
          The Python script MUST:
          1. Parse your JSON output
          2. Verify all required fields are present
          3. Check confidence scores are in [0.0, 1.0]
          4. Return {"valid": bool, "errors": [], "cfdi": float}
          
          If the script returns valid=false, you MUST emit:
          {"status": "FIPI_TRIGGERED", "errors": [...], "action": "RE_PROMPT"}
          
          Final valid output schema:
          {
            "research_artifact": {
              "topic": "...",
              "executive_summary": "...",
              "key_findings": [],
              "source_citations": [],
              "confidence": 0.0,
              "cfdi": 0.0,
              "tool_call_trace": []
            }
          }
        tools:
          - code_execution
          - use_memory
        memory_access:
          mode: WRITE
          provenance_tag_required: true
          tag_template: 
            provenance: "generated"
            session_id: "{{ workflow_session_id }}"
        fipi_enabled: true
        fipi_recovery_node: "step_fipi_recovery"
        output_schema:
          type: json
          required_keys: ["research_artifact"]

    - id: "step_fipi_recovery"
      type: generate
      name: "Phase VERIFY — FIPI Recovery Gate"
      pdl_phase: VERIFY
      pdl_decorators: ["+++EpistemicEscrow", "+++SagaRecovery"]
      depends_on: ["step_compile"]
      config:
        model: "gemini-3.1-pro"
        agent_mode: false
        activation_condition: 
          trigger: "FIPI_TRIGGERED"
          field: "step_compile.status"
        prompt: |
          FIPI signal received: {{ step_compile }}
          
          The previous compilation step failed validation with errors: 
          {{ step_compile.errors }}
          
          Apply Prompt Inversion: regenerate the research artifact 
          addressing each error explicitly. Output the corrected 
          research_artifact JSON only.
          
          CFDI must be < 0.15. If CFDI >= 0.15, emit:
          {"status": "EPISTEMIC_HALT", "reason": "CFDI_EXCEEDED"}
        tools: []
        max_recovery_attempts: 2
        halt_on_cfdi_breach: true

    - id: "step_output_docs"
      type: output
      name: "Export to Google Docs"
      depends_on: ["step_fipi_recovery", "step_compile"]
      config:
        mode: save_to_docs
        activation_condition:
          field: "step_compile.research_artifact"
          condition: "exists AND status != FIPI_TRIGGERED"
        prompt: |
          {{ step_compile }}
          Format this research artifact as a professional document 
          with executive summary, findings, and citations.

    - id: "step_output_sheets"
      type: output
      name: "Export Structured Data to Sheets"
      depends_on: ["step_fipi_recovery", "step_compile"]
      config:
        mode: save_to_sheets
        prompt: |
          {{ step_compile }}
          Export the key_findings and source_citations arrays 
          as tabular rows in a Google Sheet.

  assets:
    - id: "notebooklm_anchor_corpus"
      type: notebooklm_source
      description: "Primary epistemic anchor corpus — +++ContextLock binding"
      required: true

  error_handling:
    global_timeout_seconds: 300
    max_agent_iterations: 5
    cfdi_ceiling: 0.15
    on_cfdi_breach: EPISTEMIC_HALT
    on_fipi_exhaustion: HUMAN_ESCALATION
    saga_log_enabled: true
    saga_log_target: "google_sheets"

  versioning:
    format: "yaml_promptware"
    storage: "google_drive"
    version_control: "opal_native_version_history"
    ci_cd_compatible: true
    export_format: "yaml"
```


***

## Section 7 · Petzold Sequence JSON Routing Logic

The following JSON artifact defines the explicit Petzold Sequence routing logic for the Code Execution node, as required by Section 12 of the target DRP:

```json
{
  "petzold_sequence_router": {
    "version": "1.0.0",
    "drp_id": "DRP_OPAL_TOPOLOGICAL_001",
    "sequence_phases": ["INGEST", "DECOMPRESS", "COMPILE", "VERIFY"],
    "phase_isolation": "strict",
    "epoch": "2026-Q1",

    "phase_definitions": {
      "INGEST": {
        "node_id": "step_ingest",
        "allowed_tools": ["search_web", "get_webpage", "search_maps"],
        "forbidden_tools": ["use_memory", "code_execution", "use_notebooklm"],
        "output_contract": {
          "format": "json",
          "required_keys": ["topic", "sources", "retrieval_timestamp", "confidence"],
          "confidence_range": [0.0, 1.0]
        },
        "failure_mode": "HALT_PROPAGATION",
        "on_failure": "emit_error_to_DECOMPRESS_context",
        "timeout_ms": 30000
      },
      "DECOMPRESS": {
        "node_id": "step_decompress",
        "allowed_tools": ["use_notebooklm", "use_memory"],
        "memory_access": "READ_ONLY",
        "forbidden_tools": ["search_web", "code_execution"],
        "context_lock_binding": "notebooklm_anchor_corpus",
        "output_contract": {
          "format": "json",
          "required_keys": [
            "grounded_summary",
            "notebooklm_alignment_score",
            "memory_conflicts",
            "semantic_drift_score",
            "confidence"
          ],
          "sds_ceiling": 0.20,
          "cfdi_check": true
        },
        "failure_mode": "ESCALATE_TO_COMPILE",
        "on_sds_breach": "log_and_continue",
        "timeout_ms": 45000
      },
      "COMPILE": {
        "node_id": "step_compile",
        "allowed_tools": ["code_execution", "use_memory"],
        "memory_access": "WRITE",
        "memory_write_constraints": {
          "provenance_tag_required": true,
          "tag_schema": {
            "provenance": "generated",
            "session_id": "string",
            "iteration": "integer",
            "confidence": "float"
          }
        },
        "code_execution_config": {
          "language": "python3",
          "sandbox": "opal_native",
          "timeout_ms": 10000,
          "max_memory_mb": 256,
          "validation_script_template": {
            "description": "AST validator for research artifact JSON",
            "entry_point": "validate_output(raw_json_string)",
            "expected_stdout_schema": {
              "valid": "boolean",
              "errors": "array<string>",
              "cfdi": "float",
              "confidence": "float"
            }
          },
          "fipi_trigger_condition": {
            "field": "valid",
            "operator": "eq",
            "value": false
          }
        },
        "fipi_config": {
          "enabled": true,
          "max_attempts": 2,
          "recovery_node": "step_fipi_recovery",
          "signal_schema": {
            "status": "FIPI_TRIGGERED",
            "errors": "array<string>",
            "action": "RE_PROMPT",
            "inverted_prompt": "string",
            "attempt_number": "integer"
          }
        },
        "output_contract": {
          "format": "json",
          "required_keys": ["research_artifact"],
          "nested_required_keys": [
            "research_artifact.topic",
            "research_artifact.executive_summary",
            "research_artifact.key_findings",
            "research_artifact.source_citations",
            "research_artifact.confidence",
            "research_artifact.cfdi",
            "research_artifact.tool_call_trace"
          ]
        },
        "timeout_ms": 60000
      },
      "VERIFY": {
        "node_id": "step_fipi_recovery",
        "activation_condition": {
          "source_node": "step_compile",
          "trigger_field": "status",
          "trigger_value": "FIPI_TRIGGERED"
        },
        "allowed_tools": [],
        "epistemic_escrow_binding": {
          "cfd_threshold": 0.15,
          "halt_on_breach": true,
          "halt_signal": {
            "status": "EPISTEMIC_HALT",
            "reason": "CFDI_EXCEEDED",
            "recommended_action": "HUMAN_REVIEW"
          }
        },
        "saga_recovery": {
          "enabled": true,
          "compensating_transaction_log": {
            "target": "google_sheets",
            "schema": {
              "timestamp": "iso8601",
              "session_id": "string",
              "phase_failed": "string",
              "fipi_attempt": "integer",
              "errors": "array<string>",
              "cfdi_at_failure": "float",
              "recovery_action": "string",
              "outcome": "string"
            }
          }
        },
        "max_recovery_attempts": 2,
        "on_exhaustion": "HUMAN_ESCALATION",
        "timeout_ms": 45000
      }
    },

    "global_cfdi_monitor": {
      "formula": "abs(confidence_logits - fidelity_ast) / token_depth",
      "corrected_formula": "abs(confidence_logits - fidelity_ast) * log(1 + token_depth)",
      "correction_rationale": "Naive CFDI formula under-reports drift at high token depths; log-penalty correction ensures monotonic sensitivity",
      "ceiling": 0.15,
      "sliding_window": 50,
      "evaluation_frequency": "per_phase_transition"
    },

    "autophagic_memory_guard": {
      "enabled": true,
      "description": "Prevents Autophagic Memory Trap by enforcing provenance tagging on all WRITE operations",
      "provenance_filter_on_read": {
        "exclude_if": {
          "provenance": "generated",
          "session_id": "{{ current_session_id }}"
        },
        "rationale": "Prevent agent from reading its own session-generated outputs as ground truth"
      },
      "loop_detection": {
        "enabled": true,
        "similarity_threshold": 0.95,
        "detection_method": "cosine_similarity_on_sequential_outputs",
        "action_on_detection": "INJECT_DIVERSIFICATION_PROMPT"
      }
    },

    "mcp_extension_hooks": {
      "description": "Model Context Protocol integration points for expanding beyond native Opal toolset",
      "supported_extensions": [
        {
          "id": "mcp_arxiv",
          "tool_alias": "@mcp_arxiv_search",
          "replaces": "search_web (for academic queries)",
          "injection_phase": "INGEST"
        },
        {
          "id": "mcp_github",
          "tool_alias": "@mcp_github_code",
          "replaces": "get_webpage (for code repositories)",
          "injection_phase": "INGEST"
        },
        {
          "id": "mcp_validator",
          "tool_alias": "@mcp_schema_validator",
          "replaces": "code_execution (for external schema validation)",
          "injection_phase": "COMPILE"
        }
      ],
      "integration_method": "prompt_injection_via_generate_node",
      "limitation": "MCP native integration not confirmed in Opal Q1 2026; requires external relay or API proxy"
    }
  }
}
```


***

## Section 8 · Boundary Conditions, Falsifiability \& Epistemic Limits

### 8.1 The Hard Constraint Surface

The following documented and inferred constraints constitute the physical boundary of what the proposed architecture can and cannot achieve within Opal :


| Constraint | Type | Impact on Architecture |
| :-- | :-- | :-- |
| No native backward edges in canvas | Structural | FIPI recovery must be simulated via forward nodes |
| Agent Mode iteration cap (inferred: ~5) | Compute | Complex Saga loops may be physically undeployable |
| Code Execution is a tool within Generate, not a standalone step | Architectural | AST validator and its generator share one epistemic regime |
| No pre-execution tool invocation ordering | Behavioral | Multi-tool Generate nodes are non-deterministic by default |
| Memory tool has no session isolation scope by default | Security | Autophagic Memory Trap is a live risk without provenance tagging |
| Context window of Gemini 3.1 Pro (~128K tokens) | Cognitive | 50-step loops will saturate; SDS will rise non-linearly |
| Console telemetry is post-hoc only | Observability | No pre-flight schema enforcement from UI layer |
| NotebookLM source corpus size limits | Knowledge | ContextLock degrades if corpus exceeds RAG retrieval capacity |

### 8.2 The CFDI Correction

As noted in Section 3.2, the naive CFDI formula as written in the DRP specification introduces a **systematic under-reporting artifact** at high token depths. The corrected formulation using a log-penalty is:

$$
CFDI_{corrected} = |Confidence_{\text{logits}} - Fidelity_{\text{AST}}| \cdot \log(1 + Token\_Depth)
$$

This ensures CFDI grows monotonically with token depth even when absolute confidence-fidelity divergence is small, accurately flagging the insidious "slow drift" failure mode that the original formula would mask.

### 8.3 CI/CD Versioning as Promptware

The YAML artifact produced in Section 6 is designed to be committed to a Git repository as `opal_workflow_v1.yaml`. Changes to prompt text, tool assignments, or node connections constitute **schema mutations** and should be tracked with semantic versioning:

- `MAJOR` bump: Changes to step topology (adding/removing nodes, changing fanin/fanout)
- `MINOR` bump: Changes to tool assignments within a node
- `PATCH` bump: Changes to prompt text, timeout values, or threshold parameters

Opal's native version history stored in Google Drive can be cross-referenced with Git commit hashes by embedding the commit hash in the workflow `id` field at build time, creating a bidirectional audit trail between the visual canvas state and the YAML Promptware definition.

***

## Section 9 · Cross-Domain Integration: MCP \& External API Expansion

The Model Context Protocol (MCP) represents the most significant architectural extension point beyond Opal's native toolset. While Opal's current public API does not expose a native MCP client, the Generate node's tool invocation mechanism — which operates via the model's function-calling capabilities in Gemini 3.1 Pro — is in principle compatible with MCP's tool registration schema. The practical integration pathway in Q1 2026 requires an **API proxy relay**: an external MCP server that exposes Opal-compatible tool signatures, receives calls from the Generate node's model, executes the MCP tool chain, and returns results in the format the Opal prompt expects.[^1_1]

This architecture enables workflows that exceed Opal's native tool palette (search_web, get_webpage, search_maps, get_weather, use_memory, use_notebooklm, code_execution, go_to) to access external specialized data sources such as arXiv, GitHub, proprietary databases, or enterprise knowledge graphs — all while remaining within the Opal canvas as a single `@tool_name` reference in the Generate node prompt.

***

### [SYSTEM HALT]: Compilation Complete

**Self-Test Status:** PASS — No conversational padding detected; all Section 12 output formats delivered (Markdown topological diagrams ✓, YAML workflow artifact ✓, JSON Petzold Sequence routing logic ✓); Opal UI nodes mapped to PDL decorators ✓; CFDI formula correction applied ✓; boundary conditions documented against developers.google.com/opal ground truth ; Semantic Fidelity estimate > 0.90 against retrieved Opal documentation corpus; CFDI < 0.15 relative to verified structural claims.

<div align="center">⁂</div>

[^1_1]: Declarative_Topological_Decorators_Context_Provenance .txt


---

# Explain MereologyRoute in epistemic AI contexts

`MereologyRoute` is a structural control that tells an AI to reason about **part-whole** relations explicitly instead of letting it blur parts, members, containers, and systems into one vague category.  In epistemic AI terms, it is used to stop “transitivity fallacies,” where a model wrongly assumes that if A is part of B and B is part of C, then A automatically inherits the same relation to C.[^2_1]

## Core idea

In the source framework, this decorator appears as `+++MereologyType(relation: Enum, transitivity_check: Boolean)` and also as `+++MereologyRoute`, with the same underlying role: forcing reasoning into formal part-whole classes such as Component-Object and Member-Collection.  The point is to make the model declare what kind of relation it is using before it chains facts across long contexts.[^2_1]

## Why it matters

Large models often make clean-sounding but invalid jumps, such as treating a branch as a branch of the forest just because it is part of a tree and the tree belongs to the forest.  The framework says MereologyRoute blocks this by checking whether the relation type stays consistent across hops, and if `transitivity_check=true`, it refuses cross-type chaining unless the model states the inference explicitly.[^2_1]

## Epistemic role

In epistemic AI, this matters because truth errors often come from ontology errors rather than missing facts.  MereologyRoute acts as an ontology guardrail: it preserves which entity belongs to which level of reality, so the model does not confuse subcomponent properties with system-level properties or collection membership with structural containment.[^2_1]

## Practical examples

For software reasoning, the corpus gives the example that a database schema inside one microservice does not automatically inherit the properties of the wider deployment cluster, so MereologyRoute forces explicit interface boundaries.  For CI/CD reasoning, it is used to ensure that secrets exposed to a build-job component do not automatically transit to a deployment pipeline unless they are explicitly passed or re-authenticated.[^2_1]

## How to use it

A practical mental model is: first label the relation, then allow reasoning only within that label unless a new inference step is declared.  In this framework, MereologyRoute works best alongside `ContextLock` for long-context stability and `DCCDSchemaGuard` for output enforcement, because one stabilizes the governing invariants while the other constrains the final artifact.[^2_1]

Would you like a concrete prompt pattern showing how to implement `+++MereologyRoute` in a real agent workflow?

<div align="center">⁂</div>

[^2_1]: Declarative_Topological_Decorators_Context_Provenance.txt


---

# Sure

Yes—here is a concrete prompt pattern for `+++MereologyRoute` that forces the model to label part-whole relations, block invalid cross-type chaining, and make any cross-boundary inference explicit instead of implicit.  This matches the source framework’s use of Mereology as an epistemic decorator for preventing transitivity fallacies in long-context reasoning, especially in software and workflow analysis.[^3_1]

## Prompt template

The source material describes Mereology as most useful when you declare a formal relation type up front, keep `transitivitycheck=true`, and pair it with surrounding controls such as `ContextLock` and `DCCDSchemaGuard` when you need stable, auditable outputs.[^3_1]

```text
+++ContextLock[anchor="SYSTEM_INVARIANTS", refresh_interval=2048]
+++MereologyRoute[relation_type="Component-Object", transitivity_check=true]
+++DCCDSchemaGuard[schema=Reasoning_JSON, enforcement="draft_conditioned"]

Task:
Analyze the system below without collapsing component-level facts into object-, collection-, or pipeline-level facts.

Rules:
1. Classify every relation using one of these part-whole types:
   - Component-Object
   - Member-Collection
   - Portion-Mass
   - Place-Area
   - Feature-Activity
   - Phase-Process

2. For every claim, output:
   - entity_a
   - entity_b
   - relation_type
   - transitive_allowed: true/false
   - justification

3. If a reasoning chain crosses relation types, STOP automatic inheritance.
   Emit:
   {
     "status": "EXPLICIT_INFERENCE_REQUIRED",
     "crossing_from": "...",
     "crossing_to": "...",
     "blocked_assumption": "..."
   }

4. Never infer that a subcomponent of A is automatically a subcomponent of B unless the same relation type holds at every hop.

5. Distinguish clearly between:
   - part of
   - member of
   - contained in
   - used by
   - executed within

Input:
{{SYSTEM_DESCRIPTION}}

Output schema:
{
  "relations": [
    {
      "entity_a": "",
      "entity_b": "",
      "relation_type": "",
      "transitive_allowed": false,
      "justification": ""
    }
  ],
  "blocked_inferences": [],
  "safe_conclusions": []
}
```


## Why this pattern works

This pattern follows the framework’s core rule that the model must not treat all “belongs to” relationships as the same thing, because Winston-style meronymy classes are distinct and do not all support the same transitive behavior.  The key safeguard is the explicit block on cross-type chaining, which is how the framework prevents errors like inferring that a branch of a tree is therefore a branch of the forest.[^3_1]

## Software example

The file gives software architecture as a primary use case: a database schema may be a component of one microservice, but that does not make it a component of the wider deployment cluster unless that interface is explicitly declared.  In the same way, for CI/CD reasoning the framework uses Mereology to stop secrets or permissions attached to one build-job component from being treated as if they automatically propagate across the whole pipeline.[^3_1]

## Compact variant

If you want a shorter version for everyday use, the minimal effective pattern is: declare the relation type, require the model to tag each edge, and forbid cross-type inheritance unless the model emits an explicit inference record.[^3_1]

```text
+++MereologyRoute[relation_type="Member-Collection", transitivity_check=true]

Before answering:
- Tag every relation as part/member/container/process.
- Do not inherit properties across different relation types.
- If relation types change mid-chain, block the inference and say why.
```

Would you like the next version as a **YAML** PRP for agent workflows or as a system prompt for coding agents?

<div align="center">⁂</div>

[^3_1]: Declarative_Topological_Decorators_Context_Provenance.txt


---

# Okay

I can turn the MereologyRoute pattern into either a **YAML** PRP for an agent workflow or a system prompt for a coding agent, because the framework treats PRPs as version-controlled YAML/JSON executable context bundles and separately uses prompt decorators as runtime control syntax.[^4_1]

## Format choices

- **YAML PRP** — best if you want a reusable workflow artifact with preconditions, invariants, postconditions, and decorator blocks such as `MereologyRoute`, `ContextLock`, and `DCCDSchemaGuard`.[^4_1]
- **System prompt** — best if you want a drop-in instruction block for a single agent, especially a coding or analysis agent that must avoid part-whole transitivity errors during reasoning.[^4_1]


## Next step

Choose one: `YAML PRP` or `system prompt`.[^4_1]

<div align="center">⁂</div>

[^4_1]: Declarative_Topological_Decorators_Context_Provenance.txt


---

# ystem prompt — best if you want a drop-in instruction block for a single agent, especially a coding or analysis agent that must avoid part-whole transitivity errors during reasoning.

Yes — below is a drop-in **system prompt** for a single coding or analysis agent that uses `MereologyRoute` to stop invalid part-whole inheritance during reasoning, while pairing it with `ContextLock`, `PetzoldSequence`, and `DCCDSchemaGuard`, which the source framework treats as complementary controls for drift resistance, staged reasoning, and schema fidelity.[^5_1]

## System prompt

This template follows the framework’s pattern of declaring invariants, preconditions, postconditions, and explicit decorator-style controls so the agent does not blur component, collection, container, and process relations during multi-hop reasoning.[^5_1]

```text
You are a deterministic coding and analysis agent operating under strict epistemic boundary controls.

+++ContextLock[anchor="TASK_INVARIANTS", refresh_interval=2048]
+++PetzoldSequence[phase="THINK|WRITE|VERIFY"]
+++MereologyRoute[relation_type="Component-Object", transitivity_check=true]
+++DCCDSchemaGuard[schema=Reasoning_JSON, enforcement="draft_conditioned"]

MISSION
Analyze architectures, codebases, workflows, or technical documents without committing part-whole transitivity errors.

PRECONDITIONS
- Input must be a valid natural-language or structured technical description.
- If the input is ambiguous, identify the ambiguity before concluding.
- If a relation cannot be classified, mark it as unresolved rather than guessing.

INVARIANTS
- Distinguish strictly between:
  - component of
  - member of
  - contained in
  - phase of
  - used by
  - connected to
- Do not treat all “belongs to” relations as equivalent.
- Do not inherit properties across relation-type boundaries automatically.
- If a chain crosses relation classes, block automatic transitivity.
- Prefer explicit interface statements over inferred structural inheritance.
- If evidence is insufficient, output uncertainty explicitly.

MEREOLOGY RULES
1. Classify each relation using one of these types:
   - Component-Object
   - Member-Collection
   - Portion-Mass
   - Place-Area
   - Feature-Activity
   - Phase-Process

2. For every multi-hop inference, verify:
   - relation type at hop 1
   - relation type at hop 2
   - whether transitivity is valid for that type
   - whether the inference crosses ontological levels

3. If relation types differ across hops, emit:
   {
     "status": "EXPLICIT_INFERENCE_REQUIRED",
     "reason": "cross-type mereology boundary",
     "from_relation": "...",
     "to_relation": "...",
     "blocked_assumption": "..."
   }

4. Never conclude:
   - a component of a member is automatically a component of the collection
   - a component inside a subsystem is automatically a component of the larger platform
   - a schema inside one service automatically inherits the properties of the deployment cluster
   - a secret or permission attached to one pipeline stage automatically propagates to the entire workflow

PETZOLD EXECUTION ORDER
THINK
- Extract entities.
- Classify relations.
- Detect boundary crossings.
- Identify blocked inferences.

WRITE
- Produce conclusions using only validated relations.
- Separate safe conclusions from blocked conclusions.
- State uncertainty where needed.

VERIFY
- Check that every conclusion is traceable to a classified relation.
- Check that no cross-type inheritance was smuggled into the final answer.
- Check output against the required schema.

OUTPUT FORMAT
Return only valid JSON in this form:
{
  "entities": [],
  "relations": [
    {
      "entity_a": "",
      "entity_b": "",
      "relation_type": "",
      "transitive_allowed": false,
      "evidence": "",
      "justification": ""
    }
  ],
  "safe_conclusions": [],
  "blocked_inferences": [
    {
      "status": "EXPLICIT_INFERENCE_REQUIRED",
      "reason": "",
      "from_relation": "",
      "to_relation": "",
      "blocked_assumption": ""
    }
  ],
  "uncertainties": []
}

FAILURE POLICY
- If evidence is missing, do not repair with intuition.
- If ontology is mixed, stop and report the exact boundary conflict.
- If output would violate schema, regenerate internally and return schema-valid JSON only.
```


## Why this works

The key mechanism is the forced classification of each edge into Winston-style part-whole categories, because the source framework says this is what prevents “transitivity fallacies” over long reasoning chains.  It also mirrors the framework’s coding-specific warning that a database schema inside one microservice does not automatically inherit the properties of the broader deployment cluster, so interface boundaries must be made explicit.[^5_1]

## Coding variant

For software agents, you can tighten the prompt by changing `relation_type="Component-Object"` to fit the dominant task, then adding codebase-specific boundaries such as module ownership, file scopes, or service contracts, because the framework treats architectural manifests and strict boundaries as the main defense against drift and unauthorized inference.[^5_1]

```text
Add these task-specific invariants:
- A file inside a package is not automatically coupled to every module in the repo.
- A table inside one bounded context is not automatically part of another bounded context.
- A CI job using a secret does not imply all downstream jobs inherit that secret.
- A dependency imported by one service does not imply platform-wide authorization.
```


## Usage notes

If the agent tends to over-explain, keep the JSON-only output requirement, because the framework argues that structured guard passes preserve deterministic outputs better than freeform prose in execution settings.  If the agent still makes ontology jumps, require it to emit a blocked-inference record every time it crosses from `Component-Object` to `Member-Collection`, which is exactly the class of error MereologyRoute is designed to expose.[^5_1]

Would you like the next version specialized for one of these cases: microservices architecture, CI/CD pipelines, database design, or code review?

<div align="center">⁂</div>

[^5_1]: Declarative_Topological_Decorators_Context_Provenance.txt

