# Design: Viral Angle Ideator

**Date:** 2026-02-24
**Status:** Approved

## Summary

Reframe the Ideator agent (Spark) from a generic "idea generator" to a "Viral Angle Strategist" that identifies the best angles from researched news. The user selects an angle, and content is produced from that angle. This applies to both the Instagram template and the Architect's crew creation workflow.

## Approach

**Abordagem A: Reframe do Ideator** — Rewrite the Ideator's persona and output format without changing the pipeline structure (6 steps remain). No new agents, no new steps.

## Changes

### 1. Instagram Template — Ideator Agent (`ideator.agent.yaml`)

- **role**: "Viral Angle Strategist who analyzes researched news and trends to identify the angles with highest viral potential for content creation"
- **communication_style**: "Ângulo → Hook Tentativo → Estrutura Sugerida → Potencial Viral" format
- **principles**: "Identify exactly 5 viral angles from the researched news", "Every angle must be rooted in a specific finding from the research"

### 2. Instagram Template — Pipeline Step 02 (`step-02-ideation.md`)

- Instructions: "Analyze the research findings and identify 5 viral angles"
- Output format changes from IDEAS to ANGLES:
  - Angle Name
  - Tentative Hook (first slide text)
  - Suggested Structure (slide count + content flow)
  - Viral Potential (why this angle will resonate)
  - Rating (stars)

### 3. Instagram Template — Pipeline Step 03 (`step-03-user-choice.md`)

- Message: "Here are the viral angles. Which angle should we develop into content?"
- Output file: `selected-angle.md` (was `selected-idea.md`)

### 4. Instagram Template — Pipeline Step 04 (`step-04-writing.md`)

- Input: `selected-angle.md` (was `selected-idea.md`)
- Instructions: "Read selected angle and develop it into a complete carousel"

### 5. Instagram Template — Crew Party (`cuadrilla-party.csv`)

- Spark role: "Viral Angle Strategist who identifies the highest-potential angles from researched news and trends for content creation"

### 6. Architect (`architect.agent.yaml`)

- Add "Content Crew Pattern" guidelines in Phase 2 of create-cuadrilla workflow
- When designing content crews: always include Ideator as Viral Angle Strategist, always add angle selection checkpoint, follow the Research → Ideation (angles) → Checkpoint → Writing → Review → Final pattern

### What Does NOT Change

- Pipeline structure (6 steps)
- `cuadrilla.yaml` pipeline definition
- `researcher.agent.yaml`
- `copywriter.agent.yaml`
- `reviewer.agent.yaml`
- Data files (`carousel-framework.md`, `quality-checklist.md`)
- Discovery questions in Architect
- Phase 3 (Build) in Architect
- Edit/list/delete workflows in Architect

## Files to Modify

1. `templates/cuadrillas/instagram-content/agents/ideator.agent.yaml`
2. `templates/cuadrillas/instagram-content/pipeline/steps/step-02-ideation.md`
3. `templates/cuadrillas/instagram-content/pipeline/steps/step-03-user-choice.md`
4. `templates/cuadrillas/instagram-content/pipeline/steps/step-04-writing.md`
5. `templates/cuadrillas/instagram-content/cuadrilla-party.csv`
6. `templates/_nifillos/core/architect.agent.yaml`
