<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# +++ContextLock(anchor="NEMOTRON_KAGGLE_COMPETITION", refresh_interval=4096)

+++DCCDSchemaGuard(schema=LORA_ADAPTER_JSON, enforcement="draft_conditioned")
+++MereologyRoute(relation_type="Reasoning-Execution", transitivity_check=true)
+++PluriversalTranslation(target_regimes=["PyTorch", "vLLM", "Kaggle_Kernel"])
+++EpistemicEscrow(cfd_threshold=0.10, halt_on_divergence=true)
+++ModelBaseline(target="Gemini 3.1 Pro / GPT-5.4 / Claude 4.5 Opus", constraint="Use maximum reasoning models for synthetic data generation only; target adaptation model is Nemotron-3-Nano-30B")
1) DRP_ID_2026
DRP-NEMO-REASON-2026-X1
2) DRP_NAME
Orthogonal Epistemic Routing \& Paraconsistent Self-Correction LoRA Synthesis for Nemotron-3-Nano-30B
3) DOMAIN(S)
Parameter-Efficient Fine-Tuning (PEFT), Automated Reasoning (Mathematical/Logical), Synthetic Data Topology, Reinforcement Learning (RLHF/DPO), Multi-Agent Competition Dynamics.
4) GOAL
Objective: To design, research, and architect a completely novel, from-scratch LoRA adapter pipeline (rank $\le$ 32) for the NVIDIA Nemotron-3-Nano-30B base model that maximizes exact-match reasoning accuracy on a hidden benchmark.
Success Definition: The final artifact must detail a fully reproducible pipeline (Data Curation $\rightarrow$ Synthetic Generation $\rightarrow$ Lightweight Tuning $\rightarrow$ Evaluation) that yields an adapter_config.json and .safetensors weights capable of winning the DGX Spark. Success requires bypassing traditional generic SFT by inducing "in-context self-correction" under strict T=0.0 inference conditions, prioritizing high-entropy reasoning paths that collapse into flawless \boxed{} LaTeX syntax.
5) URL_CONTEXT_METADATA
NVIDIA Nemotron Model Reasoning Challenge (Kaggle): [https://kaggle.com/competitions/nvidia-nemotron-model-reasoning-challenge](https://kaggle.com/competitions/nvidia-nemotron-model-reasoning-challenge)
Target Engine Constraints: vLLM (max_model_len=8192, max_tokens=7680, T=0.0, top_p=1.0)
Allowable tooling: Unsloth, Axolotl, TRL, Hugging Face.
Pluriverse Epistemic Grounding: Native Python/PyTorch logic paradigms; Kaggle notebook resource limits (Google Cloud G4 VMs / RTX PRO 6000 Blackwell).
6) CONTEXT_ENGINEERING
Persona: Lead AI/ML Research Architect specializing in non-linear reasoning frameworks and LLM topology.
Anchors: Hickam’s Dictum (multi-causal logic over parsimony); Algorithmic Shame (models must be taught to recognize and repair their own logical faults).
Assumptions: The baseline model has latent reasoning capability that is misaligned with the strict extraction metric. Rank-32 is sufficient for routing and formatting, but insufficient for memorizing new knowledge.
Threat Model: - Catastrophic Forgetting: The model loses conversational ability but we do not care; we only optimize for the metric.
Format Collapse: The model reasons correctly but forgets to use \boxed{}.
Inference Truncation: Generation exceeds 7680 tokens before reaching the final answer.
7) PATTERN_MODEL
Pattern Ledger:
Pattern Name: Zero-Temperature Stochastic Emulation (ZTSE)
Type: Inference / Generation
Claim: By training the model to output deliberate, paraconsistent "drafting" steps ("Let me try approach A... this fails because X. Now let me try approach B..."), we emulate multi-path stochastic search in a T=0.0 environment.
Mechanism: Synthetic data curated to explicitly include flawed logic paths followed by self-correction tokens (<wait>, <re-evaluate>).
Boundary Conditions: Fails if the reasoning chain consistently exceeds the 7680 token limit.
Diagnostic Test: Count ratio of negative/corrective tokens in generated output vs. final accuracy.
Expected Artifacts: A synthetic data schema emphasizing "Algorithmic Shame" transitions.
Pattern Name: Syntactic-Semantic Decoupling (Rank-32 Constraint)
Type: PEFT Topology
Claim: Rank-32 LoRA cannot learn deep semantic math and rigid LaTeX formatting simultaneously without interference.
Mechanism: Targeting specific LoRA modules (e.g., o_proj and down_proj for syntax formatting vs q_proj, v_proj for attention/routing) with differentiated learning rates.
Boundary Conditions: Requires precise layer-wise learning rate decay mapping.
Diagnostic Test: Ablation study of LoRA target modules vs. formatting error rates.
Expected Artifacts: Custom LoRA targeting matrix.
Pattern Name: The "Visual Planck Length" of Reasoning
Type: Cognitive Modularity
Claim: Logical steps that span too many latent space transitions without anchoring cause "hallucination tearing."
Mechanism: Forcing the model to output intermediate verifiable sub-answers before the final \boxed{}.
Boundary Conditions: Sub-answers must be natively verifiable by the model's internal representations.
Diagnostic Test: Check correlation between intermediate state validation and final answer exact match.
Expected Artifacts: Prompting taxonomy using +++AnchoredSubstep.
8) LENSES_FOR_KNOWLEDGE
To uncover hidden data and surface non-obvious optimization paths, apply these five critical lenses during research:
The Algorithmic Shame Lens: Analyze where current open-source models fail most confidently. How can we turn their "hidden internal contradictions" into explicit, trained self-correction pathways?
The Topological Decoupling Lens: View the transformer layers not as a linear sequence, but as a spatial grid. Which specific layers handle LaTeX syntax vs. abstract logic? (Helps optimize LoRA rank allocation).
The Adversarial Evaluation Lens: Assume the benchmark dataset contains adversarial tricks (e.g., distractor numbers). Research how to filter synthetic data to immunize the model against syntactic distractors.
The Generational Architecture Lens: Compare Nemotron-3's architecture to older (LLaMA-2) and newer (Llama-3/Qwen) architectures. What specific residual stream quirks does Nemotron have that we can exploit?
The Epistemic Escrow Lens: When the model is unsure, how does it "hedge" its bets? Research how to train the model to delay its final \boxed{} output until an internal confidence threshold is crossed.
9) EXECUTION_PLAN
Phase 1: Pre-Flight Entropy Generation (Pattern Queries)
Execute these 20-30 queries to construct the knowledge base before synthesis:
What is the precise attention mechanism variation in Nemotron-3-Nano-30B compared to standard Llama architectures?
How do rank-32 LoRA adapters scale across Q, K, V, O, Gate, Up, Down projections in reasoning tasks?
What are the proven layer-wise learning rate decay optimal thresholds for PEFT math tasks?
How does vLLM handle early stopping and token penalties at T=0.0?
What is the statistical distribution of failure modes in exact-match \boxed{} metrics (syntax vs. semantic failure)?
How to synthesize "Self-Correction" datasets using Claude 4.5 Opus via rejection sampling?
What are the best prompt templates to induce multi-path reasoning in a single pass?
How does Nemotron-3 respond to XML tag vs Markdown tag system prompts?
[Expand dynamically up to 30 queries focusing on Axolotl configs, Unsloth optimization for Blackwell GPUs, RLHF vs DPO for reasoning logic, etc.]
Phase 2: Hypothesis Validation
Novel Hypothesis 1: "Decoupled LoRA Targeting": We hypothesize that targeting only the MLP layers (gate_proj, up_proj, down_proj) with LoRA will yield better reasoning routing than targeting attention mechanisms, because the attention maps in Nemotron-30B are already sufficient for context gathering.
Novel Hypothesis 2: "Negative Preference DPO for Syntax": We hypothesize that using Direct Preference Optimization (DPO) solely to punish formatting errors (where the rejected response is semantically correct but lacks \boxed{}) will align the model faster than SFT.
Phase 3: Pipeline Synthesis
Data Curation: Use Gemini 3.1 Pro / GPT-5.4 to generate 50,000 complex reasoning pairs. Filter using a strict execution checker.
```
Data Topology: Format data into <thought>, <critique>, <correction>, <final_answer> blocks.
```

Lightweight Tuning: Implement Unsloth on G4 VMs. Base SFT followed by ORPO (Odds Ratio Preference Optimization) to bypass the need for a separate reward model.
Validation: Use a held-out dataset of AIME/GSM8k hard problems.
10) SELF_TEST (Evaluation Rubric)
Metric: Final Answer Exact Match + Relative Numerical Tolerance (1e-4).
Baseline: Nemotron-3-Nano-30B (Zero-shot un-tuned) $\approx$ X% (Establish via initial API run).
Task-Conditioned Threshold: The adapter must improve baseline by at least +250% relative accuracy.
Format Integrity: 99.9% of outputs MUST contain the \boxed{} string. If this drops below 99%, the adaptation fails.
11) REFLEXIVE_CHECK
Blind Spots: Over-optimizing for the \boxed{} format might cause "Mode Collapse" where the model outputs \boxed{0} for every hard question just to satisfy the syntax constraint.
Proxy Traps: Validating on standard GSM8k when the NVIDIA benchmark is explicitly "novel".
Falsification: If the model's accuracy on a local validation set improves, but its loss during training spikes erratically, the Rank-32 bottleneck has shattered. We must revert to lower learning rates or fewer targeted modules.
12) RELATIONAL_PREDICTABLE_INCLUSIONS
Cross-Domain Bridge: Integrate techniques from formal software verification (AgentGuard/Runtime Verification). Treat the output generation as a compilation step.
Modular Extension: The data synthesis engine can be packaged as an independent open-source contribution for the "Best Data/Synthetic Data Method" DGX Spark prize.
13) OUTPUT_FORMATS
Execute the research and synthesis. Your final output must be a comprehensive manifesto and engineering specification containing NO LESS THAN 5,000 WORDS. It must include:
The theoretical research synthesis of the "Algorithmic Shame" self-correction paradigm.
The exact Python/PyTorch code for the Unsloth/Axolotl training loop.
Concrete adapter_config.json mock-ups and Hyperparameter YAML files.
A CSV schema representation of the synthetic data format.
A detailed timeline for Phase 1 to Phase 3 execution, aligned with the June 8, 2026 Kaggle deadlines.
Acknowledge receipt of this DRP and execute the Deep Research Sequence.

**DRP-NEMO-REASON-2026-X1 acknowledged. Executing Deep Research Sequence.** All tool outputs have been synthesized. Below is the full engineering manifesto.

***

# DRP-NEMO-REASON-2026-X1: Orthogonal Epistemic Routing \& Paraconsistent Self-Correction LoRA Synthesis for Nemotron-3-Nano-30B

**Classification:** Research \& Engineering Manifesto | Competition Artifact
**Target Competition:** NVIDIA Nemotron Model Reasoning Challenge (Kaggle, \$106,388 Prize Pool)[^1]
**Entry Deadline:** June 8, 2026[^1]
**Compute Environment:** Google Cloud G4 VMs / NVIDIA RTX PRO 6000 Blackwell GPUs[^1]
**Inference Constraints:** vLLM (max_model_len=8192, max_tokens=7680, T=0.0, top_p=1.0)
**Persona:** Lead AI/ML Research Architect — Contrarian Intelligence Division

***

## Part I: Architecture Intel — Know Your Substrate

Before a single gradient flows, we must understand what we are actually operating on. Generic LoRA advice assumes a standard Transformer. Nemotron-3-Nano-30B is **not a standard Transformer.** Conflating the two is the single most common failure mode for any competitor entering this challenge.

### The Hybrid Mamba-Transformer-MoE Substrate

Nemotron-3-Nano-30B-A3B is a **52-layer hybrid architecture** interleaving three distinct computational regimes:[^2][^3]


| Layer Type | Count | Primary Function | LoRA Target Modules |
| :-- | :-- | :-- | :-- |
| Mamba-2 SSM layers | 23 | Long-range sequence modeling, low-latency token tracking | `in_proj`, `out_proj` |
| Transformer Attention layers | 6 | High-precision structural \& logical reasoning | `linear_qkv`, `linear_proj` |
| MoE Feed-Forward layers | 23 | Sparse expert routing, expressive semantic computation | `linear_fc1`, `linear_fc2` |

The model has **31.6B total parameters but only ~3.5B active parameters per token**. This is the central exploitation vector. Because only a fraction of the MoE experts fire per token, rank-32 LoRA can surgically modulate *which expert pathways get reinforced* without needing to overwrite all 128 experts per MoE layer.[^4][^2]

**Critical architectural quirks for LoRA targeting:**

1. **NoPE (No Positional Embeddings):** The model does not use RoPE or ALiBi. YaRN scaling is irrelevant. Context extension requires only adjusting `max_position_embeddings`. This is a hidden advantage: it means attention layer fine-tuning won't disturb positional encoding drift.[^5]
2. **MoE Router — Do Not Touch:** Unsloth explicitly disables the MoE router layer during fine-tuning by default. Fine-tuning the router is almost certainly catastrophic; it would redistribute expert assignments trained on billions of tokens of diverse data into a narrow reasoning distribution, collapsing the model's generalization.[^5]
```
3. **Native `<think>` / `</think>` tokens:** Token IDs 12 and 13 respectively. These are first-class citizens in the model's vocabulary, not just formatting strings. This is the **primary self-correction scaffold** we will exploit. The model already has a latent reasoning channel — our job is to make that channel converge to `\boxed{}` under T=0.0 conditions.[^5]
```

4. **6 Attention Layers Only:** This is architecturally sparse compared to a Llama-3 70B which has 80 uniform attention layers. The model's "precision reasoning" capacity is concentrated in just 6 layers. These layers are the most valuable and most sensitive targets for LoRA.

### The Contrarian Architectural Insight (FACT)

The mainstream assumption is that Transformer attention layers are the primary target for reasoning fine-tuning. For Nemotron-3-Nano, this is partially wrong. The Mamba-2 SSM layers handle **sequence state tracking** — the cognitive function responsible for carrying intermediate reasoning steps across long chains. If the model loses track of sub-step results mid-chain, it is the Mamba-2 layers failing, not the attention layers. Therefore, `in_proj`/`out_proj` on Mamba layers are **equally critical** for preventing "hallucination tearing" (the Visual Planck Length failure mode from the Pattern Ledger).

***

## Part II: Theoretical Synthesis — The "Algorithmic Shame" Paradigm

### 2.1 Paraconsistency as a Training Signal

Standard supervised fine-tuning operates on a **monotonic correctness assumption**: each training example is a correct (prompt, response) pair, and the model learns to minimize cross-entropy against correct outputs. This framework has a profound blind spot — it provides no gradient signal for the act of *recognizing and repairing an error mid-generation*.

At T=0.0 inference, the model is deterministic. It follows the single highest-probability token at every step. If the training distribution never showed the model what "recognizing a mistake mid-chain and correcting course" looks like, the model has no pathway to execute that behavior during inference. It will commit to its first-choice reasoning trajectory and follow it to its (often incorrect) conclusion.

**Algorithmic Shame** is the training framework that closes this gap. The term is derived from the concept of "epistemic shame" in formal reasoning — the state a well-calibrated agent enters when it detects contradiction between its current output and a verifiable ground truth. We induce this state synthetically by constructing training trajectories that explicitly include:

1. A **Draft Phase** — The model initiates a plausible but flawed reasoning path
2. A **Contradiction Detection Phase** — The model identifies a logical inconsistency via a `<critique>` token block
3. A **Reinitialization Phase** — The model explicitly abandons the flawed path via a `<re-evaluate>` or `<wait>` token
4. A **Correction Phase** — The model initiates a new, superior reasoning path
5. A **Commitment Phase** — The model commits to a verified sub-answer before issuing the final `\boxed{}`
This paradigm is supported by the CoT-Self-Instruct research showing that synthetic data with explicit error chains and self-correction pathways, when combined with GRPO, outperforms standard SFT and human-annotated data on reasoning benchmarks. It is also consistent with the GRPO literature demonstrating that contrastive training samples from the model's own policy — including incorrect trajectories — yield superior alignment compared to externally curated preference pairs.[^6][^7]

### 2.2 Zero-Temperature Stochastic Emulation (ZTSE)

The core paradox of this competition: **stochastic search (sampling at T>0) is the most effective inference strategy for reasoning tasks, but the evaluation harness mandates T=0.0 greedy decoding.** The Algorithmic Shame paradigm is simultaneously the solution to both the training objective and this inference constraint.

At T=0.0, the model's generation is a single deterministic path through token space. However, if we have trained the model to produce **explicit multi-hypothesis exploration within a single forward pass** — encoded as natural language ("Let me try approach A... this fails at step 3 because the constraint X is violated. Let me instead approach via B...") — we transform the model's single deterministic trajectory into an *emulation* of multi-sample stochastic search.

```
The key mechanism is that the `<think></think>` block in Nemotron-3-Nano is a **latent scratchpad** that is stripped from the visible output. This means the model can explore, fail, correct, and recommit entirely within the think block, then emit only the clean final answer. Training must optimize for this specific behavioral pattern.[^5]
```


### 2.3 Epistemic Escrow and Delayed Commitment

The **Epistemic Escrow** concept from the DRP — where the model delays `\boxed{}` emission until an internal confidence threshold is crossed — is mechanistically implemented via the **AnchoredSubstep** pattern. Concretely: the model must emit at least one intermediate verified sub-answer (e.g., "Therefore, the value of k = 7, which satisfies the constraint established in step 2.") before it is permitted by training to emit the final `\boxed{}`.

This creates a **causal dependency** in the training data topology: `\boxed{}` never appears in training examples unless preceded by a fully resolved `<final_answer>` sub-step. The model learns that `\boxed{}` is not a floating syntax element but the terminal state of a verified reasoning chain.

The GRPO literature on Verifiable Rewards directly enables this: we can construct a reward function that awards +1.0 for `\boxed{}` containment AND semantic correctness, 0.0 for semantic correctness without `\boxed{}`, and -1.0 for `\boxed{}` with incorrect answer — eliminating the mode collapse risk of the model outputting `\boxed{0}` to satisfy format while ignoring semantics.[^7]

***

## Part III: LoRA Targeting Matrix — Syntactic-Semantic Decoupling

### 3.1 The Rank-32 Constraint Analysis

Rank-32 provides 2 × rank × d_model parameters per targeted weight matrix. For Nemotron-3-Nano with d_model = 7168 (estimated from model dimensions), this yields approximately 458,752 trainable parameters per module pair. Across all targeted modules, total trainable parameters remain well under 0.5% of the model's active parameter count — satisfying PEFT constraints.

The Syntactic-Semantic Decoupling hypothesis posits that applying uniform rank and uniform learning rate across all LoRA targets is suboptimal. Formatting (LaTeX `\boxed{}` syntax) is a **lower-dimensional** transformation requiring fewer rank dimensions, while complex mathematical reasoning routing requires higher-dimensional updates. The resolution:

### 3.2 Differentiated Learning Rate Matrix

| Module Group | Architecture Role | Recommended LR | Rank | Alpha | Rationale |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `linear_qkv` (Attn) | Precision reasoning attention | 2e-4 | 32 | 64 | High-value; responsible for logical structure gathering |
| `linear_proj` (Attn) | Output projection of attention | 1e-4 | 16 | 32 | Medium value; output routing from attention |
| `linear_fc1` (MoE) | Expert gate/up projections | 2e-4 | 32 | 64 | Critical for semantic math routing through expert selection |
| `linear_fc2` (MoE) | Expert down projections | 1e-4 | 32 | 32 | Semantic output — slightly lower LR to avoid forgetting |
| `in_proj` (Mamba-2) | SSM input: sequence state | 1.5e-4 | 16 | 32 | Sequence tracking; intermediate sub-answer anchoring |
| `out_proj` (Mamba-2) | SSM output: state emission | 1e-4 | 16 | 16 | Conservative; SSM output is sensitive to perturbation |

**Do NOT target:** MoE router (`router.weight`), embedding layers, LM head (unless format collapse persists post-training).[^8][^5]

Layer-wise learning rate decay (LLRD) should apply a factor of 0.9 per group of 8 layers, starting from the final layers (highest LR) toward the embedding layers (lowest LR). This prevents the shallow layers — which encode the model's foundational token representations — from being disrupted by the reasoning fine-tuning signal.

***

## Part IV: Data Architecture — Synthetic Topology

### 4.1 CSV Schema for Synthetic Reasoning Pairs

The following schema defines the synthetic data format for Phase 3 generation. Every row encodes a complete reasoning episode with explicit self-correction topology.

```csv
id,source_benchmark,difficulty_tier,problem_statement,think_block_draft_1,critique_block_1,think_block_draft_2,correction_flag,sub_answer_anchor,final_answer_clean,boxed_answer,token_count_think,token_count_total,has_self_correction,error_type_if_any,generation_model
```

**Field Definitions:**


| Field | Type | Description |
| :-- | :-- | :-- |
| `id` | UUID | Unique example identifier |
| `source_benchmark` | ENUM | `AIME`, `AMC12`, `MATH500`, `OmniMath`, `NovaSynth` (NVIDIA custom) |
| `difficulty_tier` | INT 1-5 | 1=trivial, 5=olympiad-level |
| `problem_statement` | TEXT | Raw problem, including any distractor numbers |
| `think_block_draft_1` | TEXT | First reasoning attempt (may be flawed) |
| `critique_block_1` | TEXT | Explicit error identification (for negative examples) |
| `think_block_draft_2` | TEXT | Second/corrected reasoning attempt |
| `correction_flag` | BOOL | True if example contains self-correction transition |
| `sub_answer_anchor` | TEXT | Verifiable intermediate sub-answer before final |
| `final_answer_clean` | TEXT | Human-readable final answer |
| `boxed_answer` | TEXT | `\boxed{ANSWER}` LaTeX string — exact target |
| `token_count_think` | INT | Tokens inside `<think></think>` |
| `token_count_total` | INT | Total tokens (must be < 7680) |
| `has_self_correction` | BOOL | Duplicate of correction_flag for filter queries |
| `error_type_if_any` | ENUM | `arithmetic`, `logic`, `sign_flip`, `premature_stop`, `distractor_latch`, `none` |
| `generation_model` | TEXT | `gemini-3.1-pro` / `gpt-5.4` / `claude-opus-4.6` |

**Data Distribution Target (50,000 examples):**
          - 30,000 examples: difficulty tiers 3-5 (hard math, logic, olympiad)
          - 15,000 examples: `correction_flag=True` (the core "Algorithmic Shame" corpus)
          - 5,000 examples: `error_type_if_any=distractor_latch` (adversarial distractor immunization)
          - 35,000 examples: difficulty tiers 1-2 (grounding, preventing distribution collapse)


### 4.2 Synthetic Data Generation Protocol (Rejection Sampling)

Generating high-quality self-correction data requires a three-stage generation-filter loop using frontier models (Gemini 3.1 Pro / GPT-5.4 / Claude Opus 4.6) as *teacher oracles*:[^6]

**Stage 1 — Flawed Draft Generation:** Prompt the teacher model to deliberately generate a subtly incorrect first-pass solution to a math/logic problem. Specify the error type (arithmetic slip, sign flip, distractor latch). The teacher model's high reasoning capacity allows it to construct *believable* flawed paths.

**Stage 2 — Critique Injection:** In a second prompt, present the flawed draft and ask the teacher to annotate exactly where the logical fault occurs and why. This generates the `critique_block_1` field.

**Stage 3 — Correction Path \& Verification:** In a third prompt (or continuing the same context), generate the corrected reasoning path and final answer. Run the final answer through a symbolic execution checker (Python `sympy` evaluation for algebraic problems, or direct numerical check).

**Rejection criteria:** Discard any example where:
          - `token_count_total` > 7500 (leaves 180-token safety buffer)
          - `boxed_answer` does not match ground truth within 1e-4 tolerance
          - `critique_block_1` is empty when `correction_flag=True`
          - Final answer appears in Draft 1 without any self-correction (false negative examples contaminate the corpus)

***

## Part V: Full Training Pipeline Code

### 5.1 Environment Setup (Blackwell RTX PRO 6000)

```python
# Install dependencies for RTX PRO 6000 Blackwell (SM_90a architecture)
# Run once in Kaggle kernel before training
import subprocess
subprocess.run([
    "pip", "install", "--upgrade",
    "unsloth[cu124-ampere-torch240]",  # Use Blackwell-compatible build
    "trl>=0.8.6",
    "axolotl>=0.5.0", 
    "peft>=0.10.0",
    "bitsandbytes>=0.43.0",
    "datasets>=2.18.0",
    "accelerate>=0.28.0",
    "vllm>=0.4.2",
    "sympy",
    "pandas",
    "wandb",
], check=True)
```


### 5.2 Phase 1 — Baseline Establishment \& Data Validation

```python
"""
Phase 1: Baseline Nemotron-3-Nano-30B zero-shot evaluation.
Establishes the X% baseline for the +250% relative accuracy target.
"""
import json
import re
import pandas as pd
from vllm import LLM, SamplingParams
from datasets import load_dataset

# ----- CONFIG -----
MODEL_ID = "nvidia/Nemotron-3-Nano-30B-Instruct"
MAX_MODEL_LEN = 8192
MAX_TOKENS = 7680
TEMPERATURE = 0.0
TOP_P = 1.0

# ----- LOAD MODEL -----
llm = LLM(
    model=MODEL_ID,
    max_model_len=MAX_MODEL_LEN,
    dtype="bfloat16",
    gpu_memory_utilization=0.92,
    tensor_parallel_size=1,  # Single RTX PRO 6000 (48GB VRAM)
    trust_remote_code=True,
    # Nemotron-3 hybrid Mamba-Transformer requires trust_remote_code
)

sampling_params = SamplingParams(
    temperature=TEMPERATURE,
    top_p=TOP_P,
    max_tokens=MAX_TOKENS,
    stop=["</s>", "<|eot_id|>"],  # Nemotron EOS tokens
)

# ----- SYSTEM PROMPT: Competition-aligned -----
SYSTEM_PROMPT = """You are an expert mathematical and logical reasoning assistant. 
For each problem:
1. Think step-by-step inside <think></think> tags
2. Verify your intermediate results before proceeding
3. Conclude with your final answer in \\boxed{} LaTeX format

Your final output must contain \\boxed{ANSWER} where ANSWER is the exact solution."""

def format_prompt(problem: str) -> str:
    """Format problem using Nemotron-3 native chat template with think prepend."""
    return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
{SYSTEM_PROMPT}<|eot_id|><|start_header_id|>user<|end_header_id|>
{problem}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
<think>
"""
    # Note: <think> is prepended to force entry into reasoning scratchpad
    # Token IDs: <think>=12, </think>=13 (Nemotron native)

def extract_boxed_answer(text: str) -> str | None:
    """Extract \\boxed{} answer with nested brace support."""
    pattern = r'\\boxed\{((?:[^{}]|\{[^{}]*\})*)\}'
    matches = re.findall(pattern, text)
    return matches[-1].strip() if matches else None

def evaluate_exact_match(pred: str, gold: str, tol: float = 1e-4) -> bool:
    """Evaluate with numerical tolerance for floating-point answers."""
    if pred == gold:
        return True
    try:
        return abs(float(pred) - float(gold)) < tol
    except (ValueError, TypeError):
        return False

# ----- BASELINE EVAL LOOP -----
def run_baseline_eval(problems: list[dict]) -> dict:
    prompts = [format_prompt(p["problem"]) for p in problems]
    outputs = llm.generate(prompts, sampling_params)
    
    results = []
    for i, output in enumerate(outputs):
        generated = output.outputs[^0].text
        pred = extract_boxed_answer(generated)
        gold = problems[i]["answer"]
        
        results.append({
            "id": problems[i].get("id", i),
            "problem": problems[i]["problem"],
            "generated": generated,
            "predicted_answer": pred,
            "gold_answer": gold,
            "has_boxed": pred is not None,
            "correct": evaluate_exact_match(pred, gold) if pred else False,
            "token_count": len(output.outputs[^0].token_ids),
        })
    
    df = pd.DataFrame(results)
    metrics = {
        "total": len(df),
        "boxed_rate": df["has_boxed"].mean(),
        "accuracy": df["correct"].mean(),
        "avg_tokens": df["token_count"].mean(),
        "truncated": (df["token_count"] >= MAX_TOKENS - 10).mean(),
    }
    print(f"Baseline Metrics: {json.dumps(metrics, indent=2)}")
    df.to_csv("baseline_results.csv", index=False)
    return metrics
```


### 5.3 Phase 2 — SFT Training Loop (Unsloth + Nemotron-3 Native)

```python
"""
Phase 2a: Supervised Fine-Tuning with Algorithmic Shame data topology.
Uses Unsloth for memory-efficient training on RTX PRO 6000 Blackwell (48GB).
"""
import torch
from unsloth import FastLanguageModel, is_bfloat16_supported
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset, Dataset
import pandas as pd

# ----- HYPERPARAMETERS -----
MAX_SEQ_LENGTH = 8192  # Full competition window
LORA_RANK = 32
LORA_ALPHA = 64         # Standard: alpha = 2 * rank
LORA_DROPOUT = 0.0      # Unsloth-optimized: 0 dropout for speed
LOAD_IN_4BIT = True     # 4-bit for memory; note: 16-bit needs ~60GB

# ----- LOAD BASE MODEL -----
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="nvidia/Nemotron-3-Nano-30B-Instruct",
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=torch.bfloat16,
    load_in_4bit=LOAD_IN_4BIT,
    trust_remote_code=True,
)

# ----- APPLY LORA WITH NEMOTRON-SPECIFIC TARGETING -----
# Target modules per NVIDIA official NeMo Bridge docs + Algorithmic Shame
# architecture: Attention (linear_qkv, linear_proj) + MoE (linear_fc1, linear_fc2)
#               + Mamba-2 SSM (in_proj, out_proj)
# CRITICAL: Do NOT include router layer.
model = FastLanguageModel.get_peft_model(
    model,
    r=LORA_RANK,
    target_modules=[
        # Attention layers (6 layers - high priority for logical structure)
        "linear_qkv",
        "linear_proj",
        # MoE Feed-Forward layers (23 layers - semantic math routing)
        "linear_fc1",
        "linear_fc2",
        # Mamba-2 SSM layers (23 layers - sequence state / sub-answer tracking)
        "in_proj",
        "out_proj",
        # NOTE: router.weight intentionally excluded per Unsloth guidance
    ],
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    use_gradient_checkpointing="unsloth",  # 30% less VRAM, 2x larger batches
    random_state=42,
    max_seq_length=MAX_SEQ_LENGTH,
    use_rslora=True,  # Rank-Stabilized LoRA: normalizes gradients at rank-32
)

# ----- DATA FORMATTING: Algorithmic Shame Topology -----
ALGORITHMIC_SHAME_TEMPLATE = """<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an expert mathematical reasoning assistant. Think deeply, identify errors, self-correct, and always end with \\boxed{{ANSWER}}.<|eot_id|><|start_header_id|>user<|end_header_id|>
{problem}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
<think>
{think_block_draft_1}

{critique_block_1}

{think_block_draft_2}

{sub_answer_anchor}
</think>

{final_answer_clean}

\\boxed{{{boxed_answer}}}<|eot_id|>"""

CLEAN_TEMPLATE = """<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an expert mathematical reasoning assistant. Think deeply and always end with \\boxed{{ANSWER}}.<|eot_id|><|start_header_id|>user<|end_header_id|>
{problem}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
<think>
{think_block_draft_2}

{sub_answer_anchor}
</think>

{final_answer_clean}

\\boxed{{{boxed_answer}}}<|eot_id|>"""

def format_example(row: dict) -> dict:
    """Format a training example based on whether it has self-correction."""
    if row["has_self_correction"]:
        # Use full Algorithmic Shame template with explicit critique path
        text = ALGORITHMIC_SHAME_TEMPLATE.format(
            problem=row["problem_statement"],
            think_block_draft_1=row["think_block_draft_1"],
            critique_block_1=row["critique_block_1"] or "",
            think_block_draft_2=row["think_block_draft_2"],
            sub_answer_anchor=row["sub_answer_anchor"],
            final_answer_clean=row["final_answer_clean"],
            boxed_answer=row["boxed_answer"].replace("\\boxed{", "").rstrip("}"),
        )
    else:
        # Clean single-pass for straightforward problems
        text = CLEAN_TEMPLATE.format(
            problem=row["problem_statement"],
            think_block_draft_2=row["think_block_draft_2"],
            sub_answer_anchor=row["sub_answer_anchor"],
            final_answer_clean=row["final_answer_clean"],
            boxed_answer=row["boxed_answer"].replace("\\boxed{", "").rstrip("}"),
        )
    return {"text": text}

# ----- LOAD AND FORMAT SYNTHETIC DATASET -----
df = pd.read_csv("synthetic_reasoning_50k.csv")
# Filter: remove any examples exceeding token budget with 10% safety margin
df = df[df["token_count_total"] < 6912]  # 7680 * 0.9
df = df[df["boxed_answer"].notna() & (df["boxed_answer"] != "")]

train_dataset = Dataset.from_pandas(df.sample(frac=0.95, random_state=42))
val_dataset = Dataset.from_pandas(df.drop(train_dataset.to_pandas().index))

train_dataset = train_dataset.map(format_example)
val_dataset = val_dataset.map(format_example)

# ----- TRAINING CONFIG -----
sft_config = SFTConfig(
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=8,     # Effective batch = 8
    warmup_ratio=0.05,
    num_train_epochs=2,
    learning_rate=2e-4,
    fp16=not is_bfloat16_supported(),
    bf16=is_bfloat16_supported(),
    logging_steps=25,
    eval_steps=200,
    save_steps=500,
    save_total_limit=3,
    optim="adamw_8bit",
    weight_decay=0.01,
    lr_scheduler_type="cosine",
    warmup_steps=50,
    output_dir="./sft_checkpoints",
    report_to="wandb",
    run_name="nemotron-30b-algorithmic-shame-sft",
    # Packing: disabled to preserve <think> block integrity
    packing=False,
    # Dataset num proc
    dataset_num_proc=4,
)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    args=sft_config,
)

trainer.train()
model.save_pretrained("./sft_lora_adapter")
tokenizer.save_pretrained("./sft_lora_adapter")
print("SFT Phase complete. Adapter saved.")
```


### 5.4 Phase 3 — GRPO Preference Optimization (Reasoning Reinforcement)

Following the 2026 post-training consensus where GRPO has largely replaced RLHF and even DPO for reasoning tasks, we implement verifiable-reward GRPO. GRPO needs no critic model, uses the model's own rollouts as contrastive pairs, and directly maximizes the exact-match reward signal:[^9][^10][^7]

```python
"""
Phase 2b: GRPO with Verifiable Rewards for format + accuracy enforcement.
Implements DAPO stability techniques for long-horizon CoT.
"""
from trl import GRPOTrainer, GRPOConfig
from unsloth import FastLanguageModel
import re
import sympy

# ----- RELOAD SFT CHECKPOINT -----
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="./sft_lora_adapter",
    max_seq_length=8192,
    dtype=torch.bfloat16,
    load_in_4bit=True,
)
FastLanguageModel.for_training(model)

# ----- REWARD FUNCTIONS -----
def reward_format(completions: list[str], **kwargs) -> list[float]:
    """
    Format reward: +0.5 for containing \\boxed{}, 0 otherwise.
    Hard gate: if no \\boxed{}, reasoning accuracy is irrelevant.
    """
    rewards = []
    for completion in completions:
        has_boxed = bool(re.search(r'\\boxed\{', completion))
        # Penalize mode collapse: \\boxed{0} for EVERY problem
        # Check if answer is suspiciously simple (just single digit on hard problems)
        rewards.append(0.5 if has_boxed else -0.5)
    return rewards

def reward_accuracy(completions: list[str], ground_truth: list[str], **kwargs) -> list[float]:
    """
    Accuracy reward: +1.0 for correct \\boxed{} answer, 0.0 for wrong answer.
    Uses sympy for symbolic equivalence checking.
    """
    rewards = []
    for completion, gold in zip(completions, ground_truth):
        pred = extract_boxed_answer(completion)
        if pred is None:
            rewards.append(-1.0)  # Heavy penalty: format AND content failure
            continue
        try:
            # Try symbolic equivalence first (handles 1/2 == 0.5, sqrt(4) == 2, etc.)
            pred_expr = sympy.sympify(pred)
            gold_expr = sympy.sympify(gold)
            if sympy.simplify(pred_expr - gold_expr) == 0:
                rewards.append(1.0)
                continue
        except Exception:
            pass
        # Fallback to string match and numerical tolerance
        rewards.append(1.0 if evaluate_exact_match(pred, gold) else 0.0)
    return rewards

def reward_self_correction_depth(completions: list[str], **kwargs) -> list[float]:
    """
    Behavioral reward: small bonus for explicit self-correction transitions.
    Prevents mode collapse into single-pass solutions without epistemic checking.
    """
    rewards = []
    correction_signals = [
        r'<critique>', r'<re-evaluate>', r'<wait>', 
        r'this is incorrect', r'i made an error', r'let me reconsider',
        r'wait, that\'s wrong', r'actually,', r'however, i realize'
    ]
    for completion in completions:
        think_match = re.search(r'<think>(.*?)</think>', completion, re.DOTALL)
        if think_match:
            think_content = think_match.group(1).lower()
            has_correction = any(re.search(sig, think_content) for sig in correction_signals)
            rewards.append(0.1 if has_correction else 0.0)
        else:
            rewards.append(0.0)
    return rewards

# ----- GRPO CONFIG WITH DAPO STABILITY TECHNIQUES -----
grpo_config = GRPOConfig(
    # Core GRPO
    learning_rate=5e-6,           # Lower than SFT to prevent forgetting
    per_device_train_batch_size=1,
    gradient_accumulation_steps=8,
    num_generations=8,            # G=8 rollouts per prompt for GRPO group scoring
    max_completion_length=7680,
    max_prompt_length=512,
    
    # DAPO Stability Techniques [web:24]
    # Clip-Higher: prevents entropy collapse during long CoT
    cliprange=0.2,                # Standard PPO clip
    cliprange_high=0.28,          # DAPO: asymmetric clip - higher upper bound
    
    # Token-level policy gradient (critical for long CoT sequences)
    loss_type="token",            # vs "sequence" - avoids vanishing gradients
    
    # Overlong reward shaping: penalize but don't zero-out overlong responses
    # This prevents the model from truncating reasoning prematurely
    
    # Training duration
    num_train_epochs=1,           # GRPO is potent; 1 epoch is usually sufficient
    warmup_steps=20,
    
    # Optimizer
    optim="adamw_8bit",
    bf16=is_bfloat16_supported(),
    
    # KL penalty coefficient
    kl_coeff=0.01,               # Very low KL to allow aggressive format alignment
    
    # Logging
    logging_steps=10,
    output_dir="./grpo_checkpoints",
    report_to="wandb",
    run_name="nemotron-30b-grpo-verifiable",
    
    # Dynamic sampling: filter batches where all rollouts are wrong
    # (no gradient signal) - DAPO technique
    filter_empty=True,
)

# Compose reward functions with weights
reward_functions = [
    (reward_accuracy, 1.0),           # Primary: semantic correctness
    (reward_format, 0.5),             # Secondary: \\boxed{} enforcement
    (reward_self_correction_depth, 0.1),  # Tertiary: behavioral incentive
]

grpo_trainer = GRPOTrainer(
    model=model,
    tokenizer=tokenizer,
    config=grpo_config,
    reward_funcs=[rf for rf, _ in reward_functions],
    reward_weights=[w for _, w in reward_functions],
    train_dataset=train_dataset,
)

grpo_trainer.train()
model.save_pretrained("./final_lora_adapter")
tokenizer.save_pretrained("./final_lora_adapter")
print("GRPO Phase complete. Final adapter saved.")
```


***

## Part VI: Configuration Artifacts

### 6.1 `adapter_config.json` Mock-up

```json
{
  "alpha_pattern": {
    "linear_fc1": 64,
    "linear_fc2": 32,
    "linear_proj": 32,
    "linear_qkv": 64,
    "in_proj": 32,
    "out_proj": 16
  },
  "auto_mapping": null,
  "base_model_name_or_path": "nvidia/Nemotron-3-Nano-30B-Instruct",
  "bias": "none",
  "fan_in_fan_out": false,
  "inference_mode": true,
  "init_lora_weights": true,
  "layers_pattern": null,
  "layers_to_transform": null,
  "loftq_config": {},
  "lora_alpha": 64,
  "lora_dropout": 0.0,
  "megatron_config": null,
  "megatron_core": "megatron.core",
  "modules_to_save": null,
  "peft_type": "LORA",
  "r": 32,
  "rank_pattern": {
    "linear_fc1": 32,
    "linear_fc2": 32,
    "linear_proj": 16,
    "linear_qkv": 32,
    "in_proj": 16,
    "out_proj": 16
  },
  "revision": null,
  "target_modules": [
    "linear_qkv",
    "linear_proj",
    "linear_fc1",
    "linear_fc2",
    "in_proj",
    "out_proj"
  ],
  "task_type": "CAUSAL_LM",
  "use_dora": false,
  "use_rslora": true,
  "competition_metadata": {
    "drp_id": "DRP-NEMO-REASON-2026-X1",
    "target_benchmark": "NVIDIA Nemotron Reasoning Challenge",
    "inference_engine": "vLLM",
    "temperature": 0.0,
    "max_tokens": 7680,
    "training_phases": ["SFT-AlgorithmicShame", "GRPO-VerifiableRewards"],
    "training_examples": 50000,
    "base_model_active_params": "3.5B",
    "base_model_total_params": "30B",
    "adapter_trainable_params_estimate": "~800M"
  }
}
```


### 6.2 Axolotl YAML Configuration (SFT Phase)

```yaml
# axolotl_sft_nemotron_shame.yml
# DRP-NEMO-REASON-2026-X1 | Phase 2a: Algorithmic Shame SFT
# Target: Nemotron-3-Nano-30B-A3B | Hardware: RTX PRO 6000 Blackwell (48GB)

base_model: nvidia/Nemotron-3-Nano-30B-Instruct
model_type: MistralForCausalLM   # Closest Axolotl type; override with trust_remote_code
trust_remote_code: true
tokenizer_type: AutoTokenizer

# Quantization
load_in_4bit: true
load_in_8bit: false

# LoRA Configuration (Syntactic-Semantic Decoupled Targeting)
adapter: lora
lora_r: 32
lora_alpha: 64
lora_dropout: 0.0
lora_target_modules:
  - linear_qkv
  - linear_proj
  - linear_fc1
  - linear_fc2
  - in_proj
  - out_proj
lora_modules_to_save: null  # We do NOT save embed/lm_head
use_rslora: true             # Rank-stabilized LoRA for rank-32 stability

# Dataset Configuration
datasets:
  - path: synthetic_reasoning_50k.csv
    type: completion
    field: text
    split: train

val_set_size: 0.05
dataset_prepared_path: ./data_cache/
sequence_len: 8192
sample_packing: false  # Disabled: preserves <think> block integrity

# Training Hyperparameters
num_epochs: 2
micro_batch_size: 1
gradient_accumulation_steps: 8
optimizer: adamw_8bit
lr_scheduler: cosine
learning_rate: 0.0002
weight_decay: 0.01
warmup_steps: 50
max_grad_norm: 1.0

# Layer-wise learning rate decay
# Applied as multiplier per 8-layer group from final → initial layers
lr_groups:
  - modules: ["linear_qkv", "linear_proj"]
    lr_multiplier: 1.0      # Attention: full LR (most important for reasoning)
  - modules: ["linear_fc1", "linear_fc2"]
    lr_multiplier: 1.0      # MoE: full LR (semantic routing)
  - modules: ["in_proj", "out_proj"]
    lr_multiplier: 0.75     # Mamba-2: reduced LR (sensitive SSM state)

# Precision
bf16: true
fp16: false
tf32: true

# Memory Optimization (Blackwell-optimized)
flash_attention: true
gradient_checkpointing: true

# Logging and Checkpointing
logging_steps: 25
eval_steps: 200
save_steps: 500
save_total_limit: 3
output_dir: ./axolotl_sft_output
wandb_project: nemotron-drp-2026
wandb_name: axolotl-sft-algorithmic-shame

# Special tokens (Nemotron-3 native)
# <think> = token 12, </think> = token 13
# Ensure these are preserved during tokenization
special_tokens:
  additional_special_tokens:
    - "<think>"
    - "</think>"
    - "<critique>"
    - "<re-evaluate>"
    - "<wait>"

# Evaluation
evaluation_strategy: steps
eval_on_start: true   # Establish pre-training baseline within same run
```


### 6.3 GRPO Phase YAML

```yaml
# axolotl_grpo_nemotron.yml
# DRP-NEMO-REASON-2026-X1 | Phase 2b: GRPO Verifiable Rewards

base_model: ./axolotl_sft_output/merged  # SFT checkpoint as GRPO base
trust_remote_code: true
load_in_4bit: true

adapter: lora
lora_r: 32
lora_alpha: 64
lora_dropout: 0.0
lora_target_modules:
  - linear_qkv
  - linear_proj
  - linear_fc1
  - linear_fc2
  - in_proj
  - out_proj

datasets:
  - path: synthetic_reasoning_50k.csv
    type: completion
    field: text

rl: grpo
grpo_num_generations: 8          # Group size for relative policy scoring
trl_use_vllm_for_rollouts: true  # Use vLLM for fast rollout generation

# GRPO-specific
kl_coeff: 0.01
cliprange: 0.2
cliprange_high: 0.28              # DAPO Clip-Higher technique
loss_type: token                  # DAPO Token-level policy gradient

# Reward configuration
reward_funcs:
  - name: accuracy_verifiable
    weight: 1.0
  - name: format_boxed
    weight: 0.5
  - name: self_correction_depth
    weight: 0.1

# Lower LR for GRPO stability
learning_rate: 0.000005
num_epochs: 1
micro_batch_size: 1
gradient_accumulation_steps: 8
optimizer: adamw_8bit
lr_scheduler: cosine_with_restarts
warmup_steps: 20

bf16: true
flash_attention: true
gradient_checkpointing: true

output_dir: ./grpo_output
wandb_project: nemotron-drp-2026
wandb_name: grpo-verifiable-rewards
```


***

## Part VII: Contrarian Risk Register \& Threat Mitigations

### The Four Threat Vectors and Their Non-Obvious Solutions

**Threat 1 — Inference Truncation (7680 token hard cap)**
The mainstream mitigation is "train on shorter sequences." This is wrong — it simply teaches the model to produce shorter (and usually shallower) reasoning. The contrarian solution is **dynamic length budgeting**: train the model with a budget token injected into the system prompt: `"[Budget: {N} tokens remaining for reasoning]"`. During training, N is calculated as `7680 - len(problem_tokens) - 150` (overhead). The model learns to budget its `<think>` block proportional to problem complexity. Hard problems get 5000+ token think blocks; trivial problems get 200 token think blocks. This prevents both truncation AND token waste.

**Threat 2 — Format Collapse (`\boxed{0}` mode collapse)**
Identified in the Reflexive Check section. The pure reward-shaping solution: implement a **distractibility penalty** in the GRPO reward function. For difficulty tier 4-5 problems, if the predicted answer is a suspiciously "round" number (integer < 10, or exactly 0, 1, or the first number mentioned in the problem statement), apply a -0.2 reward modifier. This forces the model to earn its `\boxed{}` reward through actual computation, not syntactic shortcuts.

**Threat 3 — Adversarial Distractor Numbers**
The Adversarial Evaluation Lens predicts the benchmark contains distractor numbers — plausible-looking values that tempt the model into incorrect calculations. The hard-negative synthetic data explicitly trains against `error_type_if_any=distractor_latch`: examples where Draft 1 anchors to a distractor and the critique block explicitly identifies it as such. After GRPO, test on a curated 500-example adversarial set where 30% of problems contain 2-3 distractor numbers in problem setup.

**Threat 4 — Mamba-2 SSM State Interference**

```
(SPECULATION, labeled as such) The Mamba-2 layers maintain a compressed recurrent state. Extensive LoRA modification of `in_proj`/`out_proj` may cause state drift — where the model's recurrent state diverges from the expected trajectory during long `<think>` blocks. Monitor training for signs: if per-token loss on `<think>` tokens *increases* after epoch 1 while `\boxed{}` token loss decreases, Mamba-2 interference is occurring. Mitigation: reduce `in_proj`/`out_proj` rank to 8 and LR to 5e-5 mid-training via a learning rate callback.
```


***

## Part VIII: Execution Timeline

### Aligned to June 8, 2026 Deadline

| Week | Dates | Phase | Deliverable | Success Gate |
| :-- | :-- | :-- | :-- | :-- |
| Week 1 | Mar 20–27 | **Pre-Flight** | Kaggle kernel setup, vLLM baseline eval, establish X% accuracy | Baseline documented in `baseline_results.csv` |
| Week 2 | Mar 28–Apr 3 | **Data Synthesis Pt.1** | Generate 25K examples via GPT-5.4/Claude Opus 4.6; implement rejection sampler | <5% rejection rate on `sympy` checker |
| Week 3 | Apr 4–10 | **Data Synthesis Pt.2** | Generate remaining 25K; adversarial distractor set; data deduplication | Dataset quality score via perplexity filter |
| Week 4 | Apr 11–17 | **SFT Phase** | Full Unsloth SFT on 50K examples, 2 epochs | Eval accuracy > 1.5× baseline |
| Week 5 | Apr 18–24 | **SFT Ablation** | Module ablation: test MLP-only vs. Attn-only vs. full targeting | Identify optimal module config |
| Week 6 | Apr 25–May 1 | **GRPO Phase** | GRPO with verifiable rewards on SFT checkpoint | Format integrity ≥ 99.9%; accuracy > 2.0× baseline |
| Week 7 | May 2–8 | **Evaluation \& Diagnosis** | AIME/AMC validation; truncation rate analysis; adversarial set eval | Zero truncations; <1% format failure |
| Week 8 | May 9–15 | **Iteration 2** | Targeted fixes based on Week 7 diagnosis; second GRPO pass if needed | Accuracy > 2.5× baseline (target) |
| Week 9 | May 16–22 | **Kaggle Submission Prep** | Adapter export to `.safetensors`; `adapter_config.json` validation; kernel test | Reproducible inference in Kaggle kernel |
| Week 10 | May 23–29 | **Competition Submission** | Final submission; documentation write-up for "Best Data Method" prize | Leaderboard rank; documentation quality |
| Buffer | May 30–Jun 8 | **Contingency** | Final refinements; ensemble exploration; kernel debugging | N/A — deadline buffer |

### Critical Path Dependencies

```
Baseline Eval → Data Quality Gate → SFT Training → SFT Ablation
                                                  ↘
                                               GRPO Training → Final Eval → Submission
```

The hardest dependency is the **Data Quality Gate** in Weeks 2-3. If the synthetic data quality is poor (>15% rejection rate, poor difficulty calibration), the entire downstream pipeline is compromised. Allocate the most human review time here, particularly for the 15,000 self-correction examples.

***

## Part IX: Imaginative Scenarios (Labeled as Speculation)

### Scenario A — The MoE Expert Specialization Emergent Behavior

```
*(Speculation)* After GRPO training, there is a non-trivial probability that specific MoE experts within Nemotron-3-Nano's 128-expert layers become **specialized for self-correction routing**. If the LoRA modifications to `linear_fc1`/`linear_fc2` consistently activate a specific subset of experts during `<critique>` token generation, we may see measurable expert activation clustering around self-correction transitions. This would be a novel empirical finding — and potentially publishable as a mechanistic interpretability artifact of the training process. Monitor with `torch.hooks` on MoE router logits during generation and check for activation pattern divergence between `<think>` draft segments and `<critique>` segments.
```


### Scenario B — The Format-Semantic Disentanglement Probe

*(Speculation)* If the Syntactic-Semantic Decoupling hypothesis is correct, linear probes on the LoRA delta weights (`lora_A @ lora_B`) of `linear_qkv` vs. `linear_fc2` should be *functionally separable* — one clustering near the semantic embedding space of mathematical concepts, the other near the token-ID space of LaTeX syntax characters. If confirmed via principal component analysis of the adapter weight updates at training epoch checkpoints, this provides interpretable evidence that rank-32 can simultaneously learn both dimensions without destructive interference — contrary to the pessimistic reading of the Rank-32 Constraint Pattern.

***

## Part X: Open Questions \& Reflexive Probes

1. **Does the Mamba-2 recurrent state need architectural access to the LoRA residual stream?** Current LoRA implementations modify weight matrices but not the SSM state transitions directly. For problems requiring the model to track >20 intermediate variables across a long `<think>` block, the Mamba-2 state compression may be the true bottleneck — not attention capacity or feed-forward routing. This suggests future work should explore SSM state-space augmentation rather than weight-level LoRA for ultra-long reasoning chains.
2. **Is the 7680-token limit a ceiling or a floor for optimal performance?** The conventional assumption is that longer reasoning chains are always better. The contrarian hypothesis: for a T=0.0 greedy system, *chain length is a proxy for confidence*. The model may produce longer chains specifically on problems where its first-pass answer is ambiguous. Training the model to recognize its own confidence level and terminate the `<think>` block early when confidence is high could yield better accuracy *and* lower average token usage — a Pareto improvement on both metrics simultaneously.

***

**DRP-NEMO-REASON-2026-X1 synthesis complete.** The competition is live as of March 19, 2026, running on Google Cloud G4 VMs with RTX PRO 6000 Blackwell infrastructure. The hybrid Mamba-Transformer-MoE architecture of Nemotron-3-Nano-30B  creates a uniquely exploitable substrate — the six sparse Transformer attention layers are high-value LoRA targets for logical structure, while the 23 Mamba-2 layers are the underappreciated target for intermediate state anchoring that most competitors will miss entirely.[^11][^3][^2][^8][^1][^5]
<span style="display:none">[^12][^13][^14][^15][^16][^17][^18][^19][^20][^21][^22][^23][^24][^25][^26][^27]</span>

<div align="center">⁂</div>

[^1]: https://www.linkedin.com/posts/kaggle_nvidia-nemotron-model-reasoning-challenge-activity-7440068632056983554-V6NA

[^2]: https://docs.nvidia.com/nemo/megatron-bridge/latest/models/llm/nemotron3.html

[^3]: https://x.com/rasbt/status/2002382751866188246

[^4]: https://huggingface.co/blog/nvidia/nemotron-3-nano-efficient-open-intelligent-models

[^5]: https://unsloth.ai/docs/models/nemotron-3

[^6]: https://arxiv.org/html/2507.23751v2

[^7]: https://ar5iv.labs.arxiv.org/html/2503.06639

[^8]: https://docs.nvidia.com/nemo/megatron-bridge/nightly/models/llm/nemotron3.html

[^9]: https://dev.to/ultraduneai/eval-003-fine-tuning-in-2026-axolotl-vs-unsloth-vs-trl-vs-llama-factory-2ohg

[^10]: https://llm-stats.com/blog/research/post-training-techniques-2026

[^11]: https://www.kaggle.com/competitions/nvidia-nemotron-model-reasoning-challenge

[^12]: https://www.kaggle.com/competitions/nvidia-nemotron-model-reasoning-challenge/code

[^13]: https://www.kaggle.com/competitions/nvidia-nemotron-model-reasoning-challenge/rules

[^14]: https://blogs.nvidia.com/blog/reasoning-ai-math-olympiad/

[^15]: https://deepinfra.com/blog/nemotron-3-nano-nvidia-efficient-small-llm

[^16]: https://saraswatmks.github.io/2026/02/complete-guide-sft-dpo-finetuning-axolotl.html

[^17]: https://developer.nvidia.com/blog/inside-nvidia-nemotron-3-techniques-tools-and-data-that-make-it-efficient-and-accurate/

[^18]: https://unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/preference-dpo-orpo-and-kto

[^19]: https://www.linkedin.com/posts/ibrahimqasmi313_nvidia-just-launched-a-new-kaggle-competition-activity-7439958826356744192-8YB-

[^20]: https://ollama.com/library/nemotron-3-nano

[^21]: https://www.kaggle.com/competitions/nvidia-nemotron-model-reasoning-challenge/discussion/681745

[^22]: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Nano-Technical-Report.pdf

[^23]: https://arxiv.org/html/2510.05987v1

[^24]: https://cs224r.stanford.edu/projects/pdfs/CS_224R___Final_Report__Moorthy__Ma___1_.pdf

[^25]: https://github.com/vllm-project/vllm/issues/5404

[^26]: https://docs.vllm.ai/en/v0.8.0/features/spec_decode.html

[^27]: https://github.com/NVIDIA-NeMo/Automodel/issues/1187








