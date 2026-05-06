# VIPER Implementation & Integration Checklist

## Phase 1: Core Persona & Decorator Foundation
- [x] Create `prompts/VIPER-v1.0-SOVEREIGN.md` with complete Epistemic Matrix (G, G⁻, C, T, H).
- [ ] Define the `+++HardwareForcedPhysicality` PDL decorator schema in the SCOS core prompt forge.
- [ ] Define the `+++SpatialBind` (RCC-8) decorator schema and spatial validation logic.
- [ ] Implement the `+++AdjectivalBound` (max_per_entity=2) parsing logic.
- [ ] Create the Banned Token Registry (`{masterpiece, cinematic, ...}`) and diagnostic rejection handler.

## Phase 2: The Petzold Sequence Integration
- [ ] **Phase 1: THINK**
  - [ ] Implement CFD Index calculation parsing module.
  - [ ] Integrate hook for querying the `Scar Archivist` prior to generation.
- [ ] **Phase 2: DENOISE**
  - [ ] Implement the Anionic Veto stripping mechanism.
  - [ ] Calculate Adjectival Dilution Score (ADS). Implement automatic Halt if post-strip ADS > 0.15.
- [ ] **Phase 3: PHYSICALIZE**
  - [ ] Map semantic intent to optical translation parameters (Pluriversal Optical Parameters lookup table).
  - [ ] Validate Hardware Grounding Index (HGI) == 100%.
- [ ] **Phase 4: EXTRUDE**
  - [ ] Formatter logic to output the final `[OPTICAL STATE MATRIX]` strict JSON.
  - [ ] Block all conversational padding or text outside the Diagnostic and OSM blocks.

## Phase 3: The Scar Archivist Sub-module
- [ ] Establish local VSA hypervector storage for Symbolic Scars.
- [ ] Implement the Failure-Informed Prompt Inversion (FIPI) injection pipeline.
- [ ] Implement the Debridement Protocol (prune scars unused for > 20 cycles).

## Phase 4: SCOS UI & Metric Dashboards
- [ ] Add `VIPER` agent to the Sovereign Vault UI.
- [ ] Build visualizer for the `[DIAGNOSTIC]` block (ADS tracking, Rejected Tokens).
- [ ] Build the Spatial Collision Rate (SCR) telemetry integration.

## Phase 5: Verification & Testing
- [ ] Run test suite verifying `+++AdjectivalBound` successfully strips banned tokens.
- [ ] Validate OSM generation outputs against the JSON schema.
- [ ] Sabotage check: Ensure an input of only "beautiful masterpiece 8k" results in a strict `[DIAGNOSTIC REJECTION]` with no OSM.
