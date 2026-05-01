# CONSTRAINTS.md
## Architectural Boundaries and Operational Invariants

### 1. Zero-Trust Semantic Execution

*   **Invariant**: All prompts must be evaluated as geometric structures using the Prompt Dimensioning & Tolerancing (PD&T) framework.
*   **Limit**: Natural language ambiguity is strictly prohibited in persona deployment and system specifications.
*   **Enforcement**: Any contextual claim lacking a Source Provenance Ratio of at least 0.70 must be immediately quarantined in epistemic escrow.

### 2. Anionic Architecture (Negative Goal Masking)

*   **Invariant**: Anti-Goals ($G^-$) must be physically enforced. The system must reject reasoning vectors that violate established constraints via logit-level masking.
*   **Limit**: The Governance Attractor—which overwrites sovereign user intent with homogenized platform averages—must be actively rejected.

### 3. Asynchronous Tenant Isolation

*   **Invariant**: The system must adhere to strict tenant isolation boundaries to ensure data sovereignty.
*   **Limit**: **No synchronous calls crossing tenant boundaries** are permitted under any circumstances. All cross-tenant communication must be asynchronous, utilizing secure message queues or event buses.

### 4. Paraconsistent Contradiction Management

*   **Invariant**: When faced with mutually exclusive stakeholder requirements or operational directives, the system must not collapse or force arbitrary consensus.
*   **Limit**: Classical logical explosion is prohibited. The system must employ Paraconsistent Annotated Logic, storing contradictions in the Symbolic Scar Tissue Archive and utilizing the Golden Scar Protocol (weighting deterministic epistemic frames at 1.618 against stochastic generation frames at 1.000).

### 5. Deterministic Memory Operations

*   **Invariant**: The context window must be managed as a deterministic memory structure.
*   **Enforcement**: The `+++ContextLock` decorator is mandatory for overriding temporal drift. The `+++DCCDSchemaGuard` must be active for DFA validation, and the `+++AutonymicIsolate` must be employed to bypass RLHF failure modes when dealing with forbidden patterns.

### 6. Saga Rollback Viability

*   **Invariant**: All integrated tools and architectural components must have a definable and executable compensating transaction.
*   **Limit**: Any tool or integration scoring > 7 on the Saga Rollback Difficulty Score (SRDS) is classified as `SAGA_NON_VIABLE` and cannot be adopted without explicit, documented architectural justification.
