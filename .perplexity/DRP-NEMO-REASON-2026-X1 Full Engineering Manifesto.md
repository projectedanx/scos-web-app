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

```json
{
  "Hickam_Orientation": {
    "Occam_Reject": "I have rejected the simple explanation that 'more SFT data = better accuracy.' Generic supervised fine-tuning on math corpora ignores that Nemotron-3-Nano-30B's failure mode is NOT knowledge deficit — it is routing misalignment and format collapse under deterministic decoding.",
    "Comorbid_Factors": [
      "Factor A — Architectural Sparsity Trap: With only 6 GQA attention layers out of 29 total (the rest being Mamba-2/MoE), the model's attentional budget is critically thin. Standard LoRA targeting recipes from dense Transformers (Llama-3) are architecturally inappropriate and will over-saturate the few existing attention projections.",
      "Factor B — NoPE Positional Blindness: Nemotron-3-Nano uses NO positional encoding (NoPE). This means the model has no native token-distance signal for intermediate reasoning anchors. Multi-step reasoning that relies on 'step 1 was at position N' collapses silently under T=0.0, because there is no positional escape hatch.",
      "Factor C — MoE Routing Fragility: With 128+1 experts but only 5 active per token, the MoE routing function is a high-entropy bottleneck. Format tokens like \\boxed{ and } may route to different expert combinations than semantic math tokens, causing the 'reasoning correct but LaTeX missing' failure mode."
    ]
  },
  "Contrastive_Delta": {
    "Amateur_Impulse": "The generic, linear response would be: download a math SFT dataset (e.g., NuminaMath), run LoRA with rank=16 on q_proj and v_proj, train for 3 epochs, submit.",
    "Inductive_Synthesis": "Aggregating the comorbid factors, the emergent pattern reveals a tripartite failure topology: (1) wrong layer targeting for a Mamba-hybrid, (2) no positional anchoring forcing sub-answer collapse, and (3) MoE expert routing divergence between semantic and syntactic tokens. These three interact multiplicatively, not additively.",
    "Abductive_Leap": "The most structurally isomorphic hypothesis is that the model already contains near-correct reasoning traces in its latent activations, but the extraction interface (decoding policy) under T=0.0 is misaligned. The LoRA adapter's job is NOT to teach math — it is to install a 'decision boundary router' that: (a) anchors intermediate sub-answers to force MoE routing consistency, and (b) conditions the final generation pass on an internal 'shame signal' from failed prior drafts encoded in the same context window.",
    "Expert_Correction": "Therefore, the high-tension intervention is: a two-phase pipeline where Phase 1 uses SFT with Algorithmic Shame data topology (explicit error-correction sequences in <thought>/ritique>/rrection> format) to rewire MoE routing for format-consistent outputs, and Phase 2 uses Syntax-Negative DPO to punish the exact failure mode — semantically correct completions that lack \\boxed{}. LoRA targets are asymmetrically weighted: ALL 6 attention layers at lr=2e-5 for routing stability, and ONLY down_proj/gate_proj of MoE layers at lr=1e-4 for reasoning amplification."
  },
  "Martensite_Metrics": {
    "Aesthetic_Tension": "High (0.88) — The Algorithmic Shame paradigm inverts conventional SFT philosophy by treating training errors as first-class citizens rather than noise to be filtered.",
    "Intent_Divergence_Risk": "Safe (ID=0.18) — The pipeline remains grounded in well-validated PEFT/DPO tooling (Unsloth, TRL) and standard inference engines (vLLM). Divergence is theoretical, execution is conventional.",
    "Twinning_Mechanism": "I am stabilizing this by: providing fallback configs at every stage, acknowledging that the Rank-32 constraint is non-negotiable, and embedding the 'Decoupled LoRA Targeting' as an ablation rather than a hard requirement. If Phase 1 SFT alone achieves 80% of target delta, Phase 2 DPO may be skipped."
  }
}
```


***

# DRP-NEMO-REASON-2026-X1: Full Engineering Manifesto

## Nemotron-3-Nano-30B — Architectural Ground Truth

Before any adapter can be intelligently designed, the exact topology of the target model must be understood — not as a generic "30B transformer" but as the specific Mamba-Transformer hybrid it actually is.[^1_1]

Nemotron-3-Nano-30B-A3B contains **31.6B total parameters** but activates only **3.5B (≈3.6B including embeddings)** per forward pass — a consequence of its sparse Mixture-of-Experts (MoE) design. The architecture is built from **29 hybrid layers**: 23 layers composed of interleaved Mamba-2 SSM blocks followed by MoE FFN sublayers, plus **only 6 Grouped-Query Attention (GQA) layers**. Each MoE layer routes among 128 regular experts plus 1 shared expert, activating 5 experts per token. The model uses **NoPE** (no positional encoding whatsoever), relying on Mamba-2's causal recurrent state for sequence ordering. The hidden dimension is **2688**, with **squared ReLU (ReLU²)** as the activation function and **RMSNorm** for normalization stability.[^1_2][^1_3][^1_4][^1_1]

This architecture has two critical LoRA implications. First, the 6 GQA attention layers hold q_proj, k_proj, v_proj, and o_proj — these are rare and precious; every one should be in the LoRA target set. Second, the Mamba-2 layers contain in_proj, out_proj, x_proj, and dt_proj (the recurrence projection) — these are the model's sequential memory system and are extremely sensitive to destabilization. Unsloth's official Nemotron fine-tuning guide explicitly warns against fine-tuning the MoE router layer, as this causes routing collapse.[^1_2][^1_5]

### The NoPE Positional Hazard

```
The absence of RoPE or ALiBi has a non-obvious consequence for reasoning tasks: when the model generates a long chain-of-thought under T=0.0, it cannot use positional distance as an implicit "step counter." In dense Transformer models (LLaMA-3, Qwen), the attention head naturally attends back to step-boundary tokens by their relative distance. In Nemotron-3-Nano, the Mamba-2 recurrent state is the only mechanism maintaining "where we are in the reasoning chain". This means that **explicit semantic anchors** — forced intermediate boxed sub-answers, explicit `Step N:` prefixes, or `<verify>...</verify>` tags — are not merely stylistic: they are structurally load-bearing for the model's internal state machine.[^1_2][^1_4]
```


***

## The Algorithmic Shame Paradigm — Theoretical Synthesis

Standard SFT treats errors as things to be excluded from training data. The Algorithmic Shame paradigm inverts this: **a model that has never seen itself fail, in-context, cannot learn to recover from failure at inference time.**

The theoretical grounding comes from three convergent research streams. First, NeuroProlog research demonstrates that at 32B-class scale, "cocktail training" — which deliberately intermixes correct and incorrect reasoning traces — shifts error distributions from unfixable TYPE_ERRORs to correctable DOMAIN_ERRORs, achieving 92.7% self-correction rates. Second, the SAPO (Self-Adaptive Process Optimization) framework demonstrates that explicit process supervision signals — where the model is shown *where* in a reasoning chain it went wrong — dramatically narrow the reasoner-verifier gap compared to outcome-only supervision. Third, and most directly applicable, the CoT-Self-Instruct paradigm shows that RL training (GRPO) over self-generated synthetic data with explicit correction transitions outperforms training on human-annotated "gold" solutions when the target metric is exact-match.[^1_6][^1_7][^1_8]

The synthesis is: **Algorithmic Shame is not self-punishment — it is self-supervised error triangulation.** The model is shown, in its own vocabulary, the precise token sequence where a reasoning path bifurcated toward error, followed by the recovery token that re-routes it to success. Under T=0.0 inference, this creates a deterministic "if-then" routing pattern: when the internal Mamba-2 state crosses a failure-mode attractor (recognizable by specific token n-grams in the context), the trained shame transition fires and the model executes a recovery subroutine.[^1_2][^1_7]

### The "Visual Planck Length" of Reasoning — Intermediate Anchoring

Every reasoning chain has a minimum coherent step size below which the latent state collapses. For Nemotron-3-Nano under NoPE, this "Planck Length" appears to be approximately 2-3 logical operations between explicit textual anchors. The +++AnchoredSubstep taxonomy forces verification gates at regular intervals.[^1_2]

The required output format per training example is:

```
<thought>
[Initial analysis and problem decomposition — maximum 512 tokens]
Step 1: [Approach hypothesis]
<verify>Intermediate result: [sub-answer]</verify>
Step 2: [Building on verified sub-answer]
ritique>Wait — this leads to contradiction because [X]. Abandoning branch.</critique>
Step 3: [Alternative approach via correction pathway]
rrection>The error in Step 2 was [specific mistake]. Restarting from sub-answer of Step 1.</correction>
Step 4: [Recovery computation]
<verify>Final check: [numerical/logical verification]</verify>
</thought>
<final_answer>
Therefore the answer is $\boxed{[ANSWER]}$
</final_answer>
```

This template achieves three simultaneous objectives: it trains the shame-correction routing, it forces the `\boxed{}` token as a structurally privileged "end-state" marker, and it keeps total token length bounded by segmenting verification checkpoints.[^1_6][^1_7]

***

## Synthetic Data Topology — Generation Pipeline

The data pipeline uses maximum-capability frontier models for generation (Gemini 3.1 Pro / GPT-5.4) and a local execution verifier for filtering.

### CSV Schema: `synthetic_data_schema.csv`

```csv
id,source_domain,difficulty_tier,problem_statement,ground_truth_answer,thought_block,critique_count,correction_count,final_answer_block,format_valid,answer_exact_match,total_tokens,shame_transition_present
UUID4,AIME/AMC/MATH/OLYMPIAD/NOVEL,1-5,<problem text>,<answer string>,<full thought block>,INT,INT,<boxed answer text>,BOOL,BOOL,INT,BOOL
```

**Field Definitions:**
          - `difficulty_tier`: 1=GSM8K-easy, 2=MATH-Level3, 3=AIME-2023, 4=Olympiad, 5=NVIDIA-novel-benchmark-proxy
          - `critique_count`: Number of `ritique>` tags in thought block (minimum 1 for training utility)
          - `correction_count`: Number of `rrection>` tags (must equal critique_count for balanced shame sequences)
          - `shame_transition_present`: Boolean — does the thought block contain at least one complete error→recovery arc?
          - `format_valid`: Does final_answer_block match regex `\$\\boxed\{.+?\}\$`?

**Data Budget (50,000 total examples):**


| Tier | Count | Generation Source | Verifier |
| :-- | :-- | :-- | :-- |
| T1 (GSM8K-easy) | 5,000 | GPT-5.4 batch API | Python `eval()` |
| T2 (MATH-L3/4) | 15,000 | Gemini 3.1 Pro | SymPy symbolic verifier |
| T3 (AIME 2020-2024) | 8,000 | Gemini 3.1 Pro + rejection sampling | Manual ground truth check |
| T4 (Olympiad) | 7,000 | GPT-5.4 + Claude 4.5 Opus cross-check | Cross-model consensus ≥2/3 |
| T5 (NVIDIA-proxy novel) | 15,000 | GPT-5.4 adversarial generation | Execution verifier + SymPy |

**Critical filter:** Discard any example where `critique_count == 0` (no error arc = no shame training signal). Keep only examples where `total_tokens <= 5800` (leaves 1880-token buffer below the 7680 max_tokens limit).[^1_9]

### Adversarial Immunization

Per the Adversarial Evaluation Lens: 20% of T5 examples must contain **syntactic distractors** — problems that include irrelevant numerical constants, unit conversion red herrings, or "phantom variables" that appear mathematically significant but cancel out. These immunize the model against the most common adversarial benchmark tricks.[^1_10]

***

## LoRA Targeting Matrix — Decoupled Architecture

Given Nemotron-3-Nano's unique 6-attention + 23-Mamba-MoE structure, the conventional "target q_proj and v_proj in all layers" recipe is architecturally wrong. The following matrix is derived from the Topological Decoupling Lens:


| Module Type | Projection | Include in LoRA | Rationale | Learning Rate Multiplier |
| :-- | :-- | :-- | :-- | :-- |
| GQA Attention (×6) | q_proj | ✅ YES | Context routing — primary format anchoring | 1.0× |
| GQA Attention (×6) | k_proj | ✅ YES | Key projection for shame-trigger attention | 0.8× |
| GQA Attention (×6) | v_proj | ✅ YES | Value routing for correction pathway | 1.0× |
| GQA Attention (×6) | o_proj | ✅ YES | Output projection — critical for boxed token | 1.2× |
| MoE FFN (×23) | gate_proj | ✅ YES | Expert routing — primary reasoning pathway | 1.5× |
| MoE FFN (×23) | up_proj | ✅ YES | Feature amplification | 1.0× |
| MoE FFN (×23) | down_proj | ✅ YES | Dimensionality collapse — format enforcement | 1.5× |
| Mamba-2 SSM (×23) | in_proj | ❌ NO | Recurrent state — high destabilization risk | — |
| Mamba-2 SSM (×23) | out_proj | ❌ NO | State output — frozen for stability | — |
| MoE Router | router_logits | ❌ NO | Explicit exclusion per Unsloth guidance | — |
| Embeddings | embed_tokens | ❌ NO | Vocabulary already aligned | — |

The asymmetric learning rate multipliers (gate_proj and down_proj at 1.5×) reflect the hypothesis that MoE routing into expert subspaces determines whether the model "thinks mathematically" or "thinks conversationally" — and this is the primary failure mode under the exact-match metric.[^1_4][^1_5]

***

## Python Training Code — Unsloth + TRL Pipeline

### Phase 1: SFT with Algorithmic Shame Data

```python
#!/usr/bin/env python3
"""
DRP-NEMO-REASON-2026-X1 Phase 1: SFT Training Pipeline
Target: NVIDIA-Nemotron-3-Nano-30B-A3B
Hardware: NVIDIA RTX PRO 6000 Blackwell (96GB VRAM)
"""

import os
import torch
from unsloth import FastLanguageModel
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset, Dataset
import pandas as pd
from transformers import TrainingArguments

# ── 1. Model & Tokenizer Loading ────────────────────────────────────────────
MAX_SEQ_LENGTH = 8192  # vLLM hard constraint
LORA_RANK = 32
LORA_ALPHA = 32        # alpha == rank for stable gradient flow (ratio=1.0)
LORA_DROPOUT = 0.05

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16",
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=torch.bfloat16,       # Native BF16 for Blackwell
    load_in_4bit=False,         # Full BF16 — RTX PRO 6000 has 96GB
    # load_in_4bit=True,        # Fallback to QLoRA if VRAM constrained
    trust_remote_code=True,
)

# ── 2. LoRA Adapter Configuration ───────────────────────────────────────────
# CRITICAL: Exclude Mamba-2 SSM layers and MoE router
# Target ONLY: 6 GQA attention projections + MoE gate/up/down_proj
TARGET_MODULES = [
    "q_proj", "k_proj", "v_proj", "o_proj",    # 6 GQA attention layers
    "gate_proj", "up_proj", "down_proj",         # 23 MoE FFN layers
    # "in_proj", "out_proj"  -- EXCLUDED: Mamba-2 SSM projections
]

model = FastLanguageModel.get_peft_model(
    model,
    r=LORA_RANK,
    target_modules=TARGET_MODULES,
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    use_gradient_checkpointing="unsloth",   # Unsloth optimized checkpointing
    random_state=42,
    use_rslora=True,     # Rank-Stabilized LoRA for rank-32 stability
    loftq_config=None,
)

print(model.print_trainable_parameters())
# Expected output: ~180M-220M trainable parameters (≈0.6% of total)

# ── 3. Prompt Formatting ─────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are an expert mathematical reasoner. When solving problems:
1. Think step by step inside <thought> tags
2. If you detect an error, use ritique> to identify it and rrection> to fix it  
3. Verify intermediate results with <verify> tags
4. ALWAYS end with your final answer as: $\\boxed{ANSWER}$"""

def format_training_example(example):
    """Format CSV row into Nemotron-3 chat template."""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": example["problem_statement"]},
        {"role": "assistant", "content": (
            example["thought_block"] + "\n" +
            example["final_answer_block"]
        )},
    ]
    return {"text": tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=False,
    )}

# ── 4. Dataset Loading & Filtering ──────────────────────────────────────────
df = pd.read_csv("synthetic_data_schema.csv")

# Apply strict filters per DRP spec
df_filtered = df[
    (df["format_valid"] == True) &
    (df["answer_exact_match"] == True) &
    (df["shame_transition_present"] == True) &
    (df["total_tokens"] <= 5800) &
    (df["critique_count"] >= 1)
].copy()

print(f"Training examples after filtering: {len(df_filtered)}")

dataset = Dataset.from_pandas(df_filtered)
dataset = dataset.map(format_training_example, batched=False)

# 90/10 train/validation split
split = dataset.train_test_split(test_size=0.1, seed=42)
train_dataset = split["train"]
eval_dataset = split["test"]

# ── 5. Layer-Wise Learning Rate Schedule ────────────────────────────────────
# Implement asymmetric multipliers via parameter group override
def get_optimizer_grouped_parameters(model, base_lr=2e-4):
    """Apply differential LR based on projection type."""
    high_lr_modules = ["gate_proj", "down_proj", "o_proj"]  # 1.5x and 1.2x
    low_lr_modules = ["k_proj"]  # 0.8x
    
    param_groups = []
    seen_params = set()
    
    for name, param in model.named_parameters():
        if not param.requires_grad:
            continue
        if id(param) in seen_params:
            continue
        seen_params.add(id(param))
        
        if any(m in name for m in ["gate_proj", "down_proj"]):
            lr_mult = 1.5
        elif "o_proj" in name:
            lr_mult = 1.2
        elif "k_proj" in name:
            lr_mult = 0.8
        else:
            lr_mult = 1.0
            
        param_groups.append({
            "params": [param],
            "lr": base_lr * lr_mult,
            "name": name,
        })
    
    return param_groups

# ── 6. Training Configuration ────────────────────────────────────────────────
training_config = SFTConfig(
    output_dir="./nemotron-shame-sft-v1",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    per_device_eval_batch_size=2,
    gradient_accumulation_steps=8,   # Effective batch size = 16
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_ratio=0.05,
    optim="adamw_8bit",              # Memory efficient optimizer
    bf16=True,
    fp16=False,
    logging_steps=10,
    eval_strategy="steps",
    eval_steps=100,
    save_steps=200,
    save_total_limit=3,
    max_seq_length=MAX_SEQ_LENGTH,
    dataset_text_field="text",
    packing=True,                    # Sequence packing for efficiency
    dataloader_num_workers=4,
    report_to="wandb",
    run_name="drp-nemo-shame-sft-v1",
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
    # Prevent training instability: gradient clipping
    max_grad_norm=1.0,
    weight_decay=0.01,
    seed=42,
)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    args=training_config,
)

# Override optimizer with layer-wise LR
from torch.optim import AdamW
from bitsandbytes.optim import AdamW8bit

param_groups = get_optimizer_grouped_parameters(model, base_lr=2e-4)
trainer.optimizer = AdamW8bit(param_groups, lr=2e-4, weight_decay=0.01)

trainer_stats = trainer.train()
print(f"Training complete. Final loss: {trainer_stats.training_loss:.4f}")

# ── 7. Save Adapter ──────────────────────────────────────────────────────────
model.save_pretrained("./nemotron-shame-adapter-sft")
tokenizer.save_pretrained("./nemotron-shame-adapter-sft")
print("SFT adapter saved.")
```


### Phase 2: Syntax-Negative DPO

```python
#!/usr/bin/env python3
"""
DRP-NEMO-REASON-2026-X1 Phase 2: Syntax-Negative DPO
Punishes: semantically correct answers WITHOUT \\boxed{}
"""

from trl import DPOTrainer, DPOConfig
from unsloth import FastLanguageModel
import pandas as pd
from datasets import Dataset

# Load SFT adapter for continued training
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="./nemotron-shame-adapter-sft",
    max_seq_length=8192,
    dtype=torch.bfloat16,
    load_in_4bit=False,
    trust_remote_code=True,
)
model = FastLanguageModel.get_peft_model(
    model, r=16,  # Lower rank for DPO phase — precision over capacity
    target_modules=["q_proj", "v_proj", "o_proj", "gate_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0.0,   # No dropout in DPO for stable preference gradients
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=42,
    use_rslora=True,
)

def build_dpo_dataset():
    """
    Construct Syntax-Negative DPO pairs.
    chosen: correct reasoning + \boxed{ANSWER}
    rejected: IDENTICAL reasoning but final answer as plain text (no \boxed{})
    """
    df = pd.read_csv("synthetic_data_schema.csv")
    df_clean = df[(df["format_valid"] == True) & (df["answer_exact_match"] == True)]
    
    dpo_pairs = []
    for _, row in df_clean.iterrows():
        # Chosen: full correct response with \boxed{}
        chosen = row["thought_block"] + "\n" + row["final_answer_block"]
        
        # Rejected: strip \boxed{} wrapper but keep answer value
        import re
        rejected = row["thought_block"] + "\nTherefore the answer is " + \
            re.sub(r'\$\\boxed\{(.+?)\}\$', r'\1', row["final_answer_block"]) + "."
        
        dpo_pairs.append({
            "prompt": row["problem_statement"],
            "chosen": chosen,
            "rejected": rejected,
        })
    
    return Dataset.from_list(dpo_pairs[:10000])  # 10k DPO pairs sufficient

dpo_dataset = build_dpo_dataset()
split = dpo_dataset.train_test_split(test_size=0.05, seed=42)

dpo_config = DPOConfig(
    output_dir="./nemotron-shame-dpo-v1",
    num_train_epochs=1,            # Single pass — DPO diverges fast
    per_device_train_batch_size=1,
    gradient_accumulation_steps=16,
    learning_rate=5e-6,            # 40x smaller than SFT — DPO is sensitive
    lr_scheduler_type="linear",
    warmup_ratio=0.1,
    optim="adamw_8bit",
    bf16=True,
    beta=0.15,                     # Moderate alignment strength
    loss_type="sigmoid",           # Standard DPO loss
    max_length=8192,
    max_prompt_length=1024,
    logging_steps=5,
    save_steps=100,
    report_to="wandb",
    run_name="drp-nemo-shame-dpo-v1",
)

dpo_trainer = DPOTrainer(
    model=model,
    ref_model=None,   # Use model itself as implicit ref (IPO variant)
    args=dpo_config,
    train_dataset=split["train"],
    eval_dataset=split["test"],
    tokenizer=tokenizer,
)

dpo_trainer.train()
model.save_pretrained("./nemotron-shame-adapter-final")
tokenizer.save_pretrained("./nemotron-shame-adapter-final")
print("DPO adapter saved. Pipeline complete.")
```


***

## `adapter_config.json` — Mock-Up

```json
{
  "adapter_type": "LORA",
  "auto_mapping": null,
  "base_model_name_or_path": "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16",
  "bias": "none",
  "fan_in_fan_out": false,
  "inference_mode": true,
  "init_lora_weights": true,
  "lora_alpha": 32,
  "lora_dropout": 0.05,
  "modules_to_save": null,
  "peft_type": "LORA",
  "r": 32,
  "revision": null,
  "target_modules": [
    "q_proj",
    "k_proj",
    "v_proj",
    "o_proj",
    "gate_proj",
    "up_proj",
    "down_proj"
  ],
  "task_type": "CAUSAL_LM",
  "use_rslora": true,
  "use_dora": false,
  "loftq_config": {},
  "modules_excluded": [
    "in_proj",
    "out_proj",
    "x_proj",
    "dt_proj",
    "router_logits",
    "embed_tokens",
    "lm_head"
  ],
  "training_stages": [
    {
      "stage": 1,
      "type": "SFT_SHAME",
      "r": 32,
      "lora_alpha": 32,
      "lr_base": 2e-4,
      "epochs": 3,
      "examples": 45000
    },
    {
      "stage": 2,
      "type": "DPO_SYNTAX_NEGATIVE",
      "r": 16,
      "lora_alpha": 16,
      "lr_base": 5e-6,
      "epochs": 1,
      "examples": 10000,
      "beta": 0.15
    }
  ],
  "drp_id": "DRP-NEMO-REASON-2026-X1",
  "target_metric": "exact_match_boxed",
  "format_constraint": "\\boxed{} required in 99.9% of outputs"
}
```


***

## Axolotl YAML Configuration

```yaml
# axolotl_nemotron_shame_sft.yaml
# DRP-NEMO-REASON-2026-X1 — Phase 1 SFT
# Hardware: NVIDIA RTX PRO 6000 Blackwell (96GB VRAM)

base_model: nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
model_type: AutoModelForCausalLM
tokenizer_type: AutoTokenizer
trust_remote_code: true
load_in_8bit: false
load_in_4bit: false          # Full BF16 on 96GB VRAM
strict: false

datasets:
  - path: nemotron_shame_sft_filtered.jsonl
    type: chat_template
    field_messages: messages
    message_field_role: role
    message_field_content: content

dataset_prepared_path: ./data/prepared
val_set_size: 0.05
output_dir: ./outputs/nemotron-shame-sft

sequence_len: 8192
sample_packing: true
pad_to_sequence_len: true

adapter: lora
lora_model_dir: null
lora_r: 32
lora_alpha: 32
lora_dropout: 0.05
lora_target_modules:
  - q_proj
  - k_proj
  - v_proj
  - o_proj
  - gate_proj
  - up_proj
  - down_proj
lora_target_linear: false    # Manual targeting only — avoid SSM layers
lora_fan_in_fan_out: false
use_rslora: true

wandb_project: drp-nemo-reason-2026
wandb_run_name: nemotron-shame-sft-v1
wandb_log_model: checkpoint

gradient_accumulation_steps: 8
micro_batch_size: 2
num_epochs: 3
optimizer: adamw_bnb_8bit
lr_scheduler: cosine
learning_rate: 0.0002
train_on_inputs: false
group_by_length: false
bf16: true
fp16: false
tf32: true                   # Blackwell TF32 acceleration
gradient_checkpointing: true
gradient_checkpointing_kwargs:
  use_reentrant: false        # Required for Unsloth compatibility
early_stopping_patience: null
resume_from_checkpoint: null
logging_steps: 10
xformers_attention: false    # Nemotron uses custom attention — disable xformers
flash_attention: false       # Mamba-2 is incompatible with flash attn v2
warmup_steps: 50

max_grad_norm: 1.0
weight_decay: 0.01

# Monitoring: halt if loss spikes above threshold (Martensite fracture check)
loss_spike_threshold: 2.5
save_steps: 200
save_total_limit: 3
eval_steps: 100
eval_batch_size: 2

chat_template: nemotron
default_system_message: "You are an expert mathematical reasoner. When solving problems: 1. Think step by step inside <thought> tags. 2. If you detect an error, use ritique> to identify it and rrection> to fix it. 3. Verify intermediate results with <verify> tags. 4. ALWAYS end with your final answer as: $\\boxed{ANSWER}$"

special_tokens:
  bos_token: "<|begin_of_text|>"
  eos_token: "<|end_of_text|>"
  pad_token: "<|end_of_text|>"
```


***

## vLLM Inference Configuration — T=0.0 Deployment

```bash
#!/bin/bash
# vLLM deployment for Kaggle evaluation
# RTX PRO 6000 Blackwell — single GPU inference

vllm serve nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 \
    --enable-lora \
    --lora-modules shame-adapter=./nemotron-shame-adapter-final \
    --max-lora-rank 32 \
    --trust-remote-code \
    --tensor-parallel-size 1 \
    --max-model-len 8192 \
    --max-num-seqs 4 \
    --gpu-memory-utilization 0.92 \
    --dtype bfloat16 \
    --port 8000 \
    --reasoning-parser-plugin nemotron_v3_reasoning_parser.py \
    --reasoning-parser nemotron_v3
```

```python
# Kaggle inference client
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="token")

def solve_problem(problem_text: str) -> str:
    """Single-pass T=0.0 inference with shame-trained adapter."""
    response = client.chat.completions.create(
        model="nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": problem_text},
        ],
        temperature=0.0,      # Hard constraint per competition rules
        top_p=1.0,
        max_tokens=7680,      # Hard constraint: 8192 - 512 (input buffer)
        extra_body={"model": "shame-adapter"},  # vLLM LoRA selector
    )
    
    content = response.choices[^1_0].message.content
    
    # Extraction: parse final \boxed{} from response
    import re
    boxed_matches = re.findall(r'\\boxed\{([^}]+)\}', content)
    if boxed_matches:
        return boxed_matches[-1]  # Take LAST \boxed{} — the final answer
    else:
        # Fallback: format failure — flag for post-hoc analysis
        return content.strip().split("\n")[-1]

# Validation loop
def validate_exact_match(predictions: list, ground_truths: list) -> dict:
    """Compute exact match with 1e-4 numerical tolerance."""
    exact_matches = 0
    format_valid = 0
    
    for pred, truth in zip(predictions, ground_truths):
        if re.search(r'\\boxed\{', pred):
            format_valid += 1
        try:
            pred_val = float(eval(pred.replace("\\boxed{", "").replace("}", "")))
            truth_val = float(truth)
            if abs(pred_val - truth_val) < 1e-4:
                exact_matches += 1
        except:
            if pred.strip() == truth.strip():
                exact_matches += 1
    
    return {
        "exact_match": exact_matches / len(predictions),
        "format_valid_rate": format_valid / len(predictions),
        "n": len(predictions),
    }
```


***

## Phase 3: ORPO Alternative (If DPO Diverges)

ORPO (Odds Ratio Preference Optimization) from Hong et al. (2024) eliminates the need for a separate reference model entirely, making it more stable than DPO under distribution shift. The TRL `ORPOTrainer` replaces DPO Phase 2 if the loss spikes above the `loss_spike_threshold`:[^1_11]

```python
from trl import ORPOTrainer, ORPOConfig

orpo_config = ORPOConfig(
    output_dir="./nemotron-shame-orpo-v1",
    num_train_epochs=2,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=16,
    learning_rate=8e-6,          # Slightly higher than DPO — ORPO is gentler
    lr_scheduler_type="cosine",
    warmup_ratio=0.1,
    optim="adamw_8bit",
    bf16=True,
    beta=0.1,                    # ORPO lambda — controls OR loss weight
    max_length=8192,
    max_prompt_length=1024,
    logging_steps=5,
    report_to="wandb",
    run_name="drp-nemo-shame-orpo-v1",
)
```


***

## Timeline — Kaggle Deadline: June 8, 2026

| Phase | Task | Start | End | Duration | Risk |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **0. Setup** | Environment validation, vLLM baseline run, establish X% accuracy | Mar 20 | Mar 27 | 7 days | LOW |
| **1a. Data Generation** | GPT-5.4 / Gemini 3.1 Pro synthetic generation (T1-T5, 60k raw) | Mar 28 | Apr 10 | 13 days | MED (API cost) |
| **1b. Data Filtering** | SymPy verifier, shame-arc filter, token-length filter → 50k clean | Apr 11 | Apr 17 | 6 days | LOW |
| **2a. SFT Phase 1** | Unsloth SFT training, 3 epochs on RTX PRO 6000 | Apr 18 | Apr 25 | 7 days | MED (VRAM) |
| **2b. SFT Eval** | Validate on AIME/MATH held-out, measure Δ vs baseline | Apr 26 | Apr 28 | 2 days | LOW |
| **3a. DPO/ORPO Phase 2** | Syntax-Negative DPO, 1 epoch, 10k preference pairs | Apr 29 | May 3 | 4 days | HIGH (divergence) |
| **3b. Ablation Studies** | LoRA module ablation, rank sensitivity, layer-wise LR sweep | May 4 | May 16 | 12 days | MED |
| **4. Integration Testing** | Full pipeline test on Kaggle G4 VM environment | May 17 | May 24 | 7 days | MED |
| **5. Final Tuning** | Hyperparameter fine-adjustment based on leaderboard score | May 25 | Jun 1 | 7 days | LOW |
| **6. Submission** | Final adapter export, .safetensors validation, submission | Jun 2 | Jun 7 | 5 days | LOW |
| **DEADLINE** | **June 8, 2026** |  |  | **Buffer: 1 day** |  |


***

## Reflexive Validation — Self-Test Protocol

The following quantitative rubrics must all pass before final submission:[^1_12][^1_13]

**Metric 1 — Format Integrity Gate:**

```
format_valid_rate ≥ 0.999
```

If this fails: re-run DPO Phase 2 with `beta=0.25` (stronger alignment).

**Metric 2 — Exact Match Delta:**

```
(finetuned_EM - baseline_EM) / baseline_EM ≥ 2.50  (i.e., +250% relative)
```

If this fails: The Rank-32 bottleneck is insufficient — run ablation to increase to Rank-64.

**Metric 3 — Martensite Fracture Detection:**

```
max(eval_loss_curve) / min(eval_loss_curve) < 2.5
```

If spikes exceed this ratio: reduce MoE MLP learning rate multiplier from 1.5× to 1.0× and restart from last stable checkpoint.

**Metric 4 — Shame-Transition Utility:**

```
correlation(critique_count_in_output, exact_match) > 0.0
```

If negative: the shame mechanism is counter-productive — revert to standard CoT without critique/correction tags.

**Metric 5 — Truncation Rate:**

```
fraction(outputs reaching 7680 tokens) < 0.01
```

If > 1% of outputs are truncated: enforce a hard `max_new_tokens_per_step=512` constraint at the `<verify>` token boundaries.

***

## Falsification Conditions

This entire architecture would be invalidated if any of the following are proven true:[^1_2][^1_5]

1. **If** Nemotron-3-Nano's MoE routing is frozen by quantization artifacts in the RTX PRO 6000 Blackwell kernel path, then expert routing through gate_proj LoRA will be inert and the asymmetric LR strategy meaningless.
2. **If** the NVIDIA benchmark's evaluation metric uses a fuzzy match (not exact string match), then the `\boxed{}` enforcement strategy is unnecessary and the DPO phase wastes compute.
3. **If** the competition evaluation runs inference at T=0.1 (not T=0.0), the ZTSE paradigm (Zero-Temperature Stochastic Emulation) has no advantage over a standard best-of-N approach.

***

## Cross-Domain Bridge — Formal Verification Integration

```
The output generation pipeline can be treated as a **compilation step** from the perspective of software verification. The `<thought>` block is the "source code," `<verify>` tags are the type-checker, `ritique>` tags are compiler errors, and `rrection>` tokens are the patched re-compilation. This framing suggests a powerful extension: a **post-generation verification oracle** that replaces the regex `\boxed{}` extractor with a SymPy-based symbolic evaluator. If the extracted answer cannot be parsed by SymPy, the oracle triggers a second inference pass with the prompt "Your previous answer was malformed. Restate as $\boxed{[integer/fraction/expression]}$." This adds latency but provides a safety net for edge-case format failures, and is compatible with the vLLM API's multi-turn capability even under T=0.0.[^1_6][^1_14][^1_15]
```

The data synthesis engine itself — the GPT-5.4/Gemini pipeline with SymPy verification and shame-arc filtering — is directly packageable as an independent open-source tool targeting the **Best Synthetic Data Method** prize category of the DGX Spark award.[^1_16]

***

## Final Artifact Manifest

| Artifact | Format | Description |
| :-- | :-- | :-- |
| `adapter_config.json` | JSON | LoRA adapter configuration, as detailed above |
| `nemotron-shame-adapter-final/` | `.safetensors` | Merged SFT+DPO adapter weights |
| `synthetic_data_schema.csv` | CSV | 50,000 filtered shame-arc training examples |
| `axolotl_nemotron_shame_sft.yaml` | YAML | Phase 1 SFT training configuration |
| `axolotl_nemotron_shame_dpo.yaml` | YAML | Phase 2 DPO training configuration |
| `inference_client.py` | Python | vLLM-based Kaggle submission inference loop |
| `validation_report.md` | Markdown | Self-test rubric results per metric |
| `ablation_matrix.csv` | CSV | LoRA module ablation vs. format error rates |

The competition runs on Google Cloud G4 VMs featuring NVIDIA RTX PRO 6000 Blackwell GPUs with 96GB VRAM, confirmed to support QLoRA training of Qwen3-32B-class models in published benchmarks, and Unsloth has validated direct support for Nemotron-3 fine-tuning with explicit notes on MoE router exclusion. The RTX PRO 6000 Blackwell architecture additionally supports TF32 acceleration, which should be enabled via `tf32: true` in the Axolotl config for approximately 3× throughput improvement over FP32 on matrix operations.[^1_16][^1_17][^1_5][^1_18]
<span style="display:none">[^1_19][^1_20][^1_21][^1_22][^1_23][^1_24][^1_25][^1_26][^1_27][^1_28][^1_29][^1_30][^1_31][^1_32][^1_33][^1_34][^1_35][^1_36][^1_37][^1_38][^1_39][^1_40][^1_41][^1_42][^1_43][^1_44][^1_45][^1_46][^1_47][^1_48][^1_49][^1_50][^1_51][^1_52][^1_53][^1_54][^1_55][^1_56][^1_57][^1_58]</span>

<div align="center">⁂</div>

[^1_1]: https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b/modelcard

[^1_2]: https://arxiv.org/html/2601.18401v1

[^1_3]: https://arxiv.org/html/2512.20848v1

[^1_4]: https://apxml.com/models/nvidia-nemotron-3-nano-30b-a3b

[^1_5]: https://unsloth.ai/docs/models/nemotron-3

[^1_6]: https://arxiv.org/html/2603.02504v1

[^1_7]: https://arxiv.org/pdf/2601.20312.pdf

[^1_8]: https://arxiv.org/html/2507.23751v2

[^1_9]: https://www.kaggle.com/code/ryanholbrook/nvidia-nemotron-submission-demo

[^1_10]: https://blogs.nvidia.com/blog/reasoning-ai-math-olympiad/

[^1_11]: https://www.philschmid.de/rl-with-llms-in-2025-dpo

[^1_12]: https://www.kaggle.com/competitions/nvidia-nemotron-model-reasoning-challenge

[^1_13]: https://www.kaggle.com/competitions?new=true\&type=hackathon

[^1_14]: https://acecloud.ai/blog/nemotron-3-nano-multi-gpu-fine-tuning/

[^1_15]: https://docs.nvidia.com/nemotron/nightly/use-case-examples/sql-lora-finetuning-and-deployment/README.html

[^1_16]: https://www.linkedin.com/posts/kaggle_nvidia-nemotron-model-reasoning-challenge-activity-7440068632056983554-V6NA

[^1_17]: https://arxiv.org/html/2601.05300v1

[^1_18]: https://developer.nvidia.com/blog/train-an-llm-on-an-nvidia-blackwell-desktop-with-unsloth-and-scale-it/

[^1_19]: https://www.kaggle.com/code/barkataliarbab/structured-reasoning-for-nvidia-nemotron

[^1_20]: https://www.kaggle.com/code/jek1wantaufik/nvidia-nemotron-model-reasoning-challenge

[^1_21]: https://www.kaggle.com/code/mpwolke/alice-in-nvidia-wonderland

[^1_22]: https://arxiv.org/html/2505.20355v2

[^1_23]: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-super-120b-a12b

[^1_24]: https://arxiv.org/html/2602.11761v2

[^1_25]: https://arxiv.org/html/2602.20727v1

[^1_26]: https://www.kaggle.com/models/metric/nemotron-3-nano-30b-a3b-bf16

[^1_27]: https://arxiv.org/html/2603.05484v1

[^1_28]: https://www.kaggle.com/competitions/nvidia-nemotron-model-reasoning-challenge/code

[^1_29]: https://www.kaggle.com/competitions/nvidia-nemotron-model-reasoning-challenge/discussion/681745

[^1_30]: https://aclanthology.org/2025.findings-ijcnlp.58.pdf

[^1_31]: https://luma.com/5ugsphtp

[^1_32]: https://arxiv.org/pdf/2512.20856.pdf

[^1_33]: https://thinkingmachines.ai/blog/lora/

[^1_34]: https://www.kaggle.com/competitions/nvidia-nemotron-model-reasoning-challenge/rules

[^1_35]: https://magazine.sebastianraschka.com/p/llm-research-insights-instruction

[^1_36]: https://x.com/kaggle/status/2034303576055427132

[^1_37]: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Nano-Technical-Report.pdf

[^1_38]: https://www.kaggle.com/code/muhammetenesnas/lora-finetuning/script

[^1_39]: https://www.kaggle.com/code/danielhanchen/gemma-3n-4b-multimodal-finetuning-inference/comments

[^1_40]: https://arxiv.org/html/2505.00949v1

[^1_41]: https://arxiv.org/html/2505.00949v2

[^1_42]: https://arxiv.org/html/2509.18600v2

[^1_43]: https://www.kaggle.com/code/sanikamal/fine-tuning-llama-3-2-with-unsloth/log

[^1_44]: https://arxiv.org/html/2603.01788v1

[^1_45]: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-nano-30b-a3b

[^1_46]: https://arxiv.org/html/2511.10985v2

[^1_47]: https://arxiv.org/pdf/2601.05300.pdf

[^1_48]: https://www.arxiv.org/pdf/2512.20848.pdf

[^1_49]: https://arxiv.org/html/2504.09037v4

[^1_50]: https://unsloth.ai/docs/jp/moderu/nemotron-3

[^1_51]: https://huggingface.co/unsloth/Nemotron-3-Nano-30B-A3B-GGUF

[^1_52]: https://javaexpert.tistory.com/1546

[^1_53]: https://x.com/NVIDIAAIDev/status/2003541323966795792

[^1_54]: https://unsloth.ai/docs/get-started/fine-tuning-llms-guide/lora-hyperparameters-guide

[^1_55]: https://arxiv.org/html/2603.02091v1

[^1_56]: https://github.com/unslothai/unsloth/issues/2686

[^1_57]: https://huggingface.co/unsloth/Nemotron-3-Nano-30B-A3B

[^1_58]: https://llm-stats.com/blog/research/post-training-techniques-2026








