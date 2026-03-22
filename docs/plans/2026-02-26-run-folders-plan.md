# Run Folders Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Each crew execution creates a dedicated subfolder in `output/` so all run artifacts are grouped together.

**Architecture:** The Pipeline Runner gains a "Run Folder Creation" phase after step 1 completes. It extracts the topic from the research brief header, generates a URL-friendly slug, creates `output/YYYY-MM-DD-{slug}/`, and sets the `{run-folder}` variable for all subsequent steps. Step 1 uses `output/drafts/` as a temporary staging area; steps 2+ use `{run-folder}/drafts/`.

**Tech Stack:** Markdown prompt files (no code — this is a prompt-driven orchestration system)

**Design doc:** `docs/plans/2026-02-26-run-folders-design.md`

---

### Task 1: Add Run Folder Creation section to Pipeline Runner

**Files:**
- Modify: `_nifillos/core/runner.pipeline.md:107-117` (between "Veto Condition Enforcement" and "Review Loops")

**Step 1: Add the "Run Folder Creation" section**

Insert a new section after "### Veto Condition Enforcement" (after line 109) and before "### Review Loops" (line 111):

```markdown
### Run Folder Creation

After the FIRST pipeline step completes (and its checkpoint is resolved):

1. **Extract topic**: Read the step's output file. Extract the topic from the first `# ` header.
   - For research briefs: parse `# Research Brief: {topic}` → extract `{topic}`
   - For other formats: use the first H1 header text
   - Fallback: if no H1 found, use `untitled`

2. **Generate slug** from the topic:
   - Convert to lowercase
   - Remove accents (á→a, ç→c, ê→e, ñ→n, ü→u, etc.)
   - Replace spaces and special characters with `-`
   - Remove consecutive hyphens
   - Remove leading/trailing hyphens
   - Truncate at 50 characters (on a word boundary)

3. **Create run folder**:
   - Path: `cuadrillas/{name}/output/YYYY-MM-DD-{slug}/`
   - Create subdirectories: `drafts/` and `final/`
   - If path already exists, append `-2`, `-3`, etc.
   - Example: `cuadrillas/instagram-content/output/2026-02-26-inteligencia-artificial/`

4. **Move step 1 output**: Move the staging file to the run folder
   - From: `cuadrillas/{name}/output/drafts/{filename}` → To: `{run-folder}/drafts/{filename}`

5. **Set `{run-folder}` variable**: Store the full run folder path in pipeline state.
   All subsequent steps resolve `{run-folder}` to this path.

6. **Inform user**:
   ```
   📂 Run folder: output/YYYY-MM-DD-{slug}/
   ```
```

**Step 2: Update "After Pipeline Completion" section**

Change line 121 from:
```
1. Save final output to `cuadrillas/{name}/output/YYYY-MM-DD/{filename}.md`
```
To:
```
1. Save final output to `{run-folder}/final/{filename}.md`
```

Update the completion banner (lines 127-137) to show the run folder path:
```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ Pipeline complete!
   📂 Output saved to: {run-folder}/
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 3: Update "Pipeline State" section**

Add `run-folder-path` to the tracked state list (after line 152):
```
- Run folder path (`{run-folder}`)
```

**Step 4: Commit**

```bash
git add _nifillos/core/runner.pipeline.md
git commit -m "feat(runner): add run folder creation after step 1"
```

---

### Task 2: Mirror runner changes to template

**Files:**
- Modify: `templates/_nifillos/core/runner.pipeline.md` (same changes as Task 1)

**Step 1: Apply identical changes**

The template runner is an exact mirror of the core runner. Apply all three changes from Task 1:
1. Add "### Run Folder Creation" section (same location, same content)
2. Update "### After Pipeline Completion" section
3. Update "## Pipeline State" section

**Step 2: Commit**

```bash
git add templates/_nifillos/core/runner.pipeline.md
git commit -m "feat(runner): mirror run folder creation to template"
```

---

### Task 3: Update step files for instagram-content crew (steps 2-4)

**Files:**
- Modify: `cuadrillas/instagram-content/pipeline/steps/step-02-ideation.md:5,7` (frontmatter)
- Modify: `cuadrillas/instagram-content/pipeline/steps/step-03-writing.md:5,7` (frontmatter)
- Modify: `cuadrillas/instagram-content/pipeline/steps/step-04-review.md:5,6` (frontmatter)
- Modify: `cuadrillas/instagram-content/pipeline/steps/step-03-writing.md:113` (body text)

**Step 1: Update step-02-ideation.md frontmatter**

Change line 5:
```yaml
inputFile: "{crew-root}/output/drafts/research.md"
```
To:
```yaml
inputFile: "{run-folder}/drafts/research.md"
```

Change line 7:
```yaml
outputFile: "{crew-root}/output/drafts/angles.md"
```
To:
```yaml
outputFile: "{run-folder}/drafts/angles.md"
```

**Step 2: Update step-03-writing.md frontmatter**

Change line 5:
```yaml
inputFile: "{crew-root}/output/drafts/angles.md"
```
To:
```yaml
inputFile: "{run-folder}/drafts/angles.md"
```

Change line 7:
```yaml
outputFile: "{crew-root}/output/drafts/draft.md"
```
To:
```yaml
outputFile: "{run-folder}/drafts/draft.md"
```

**Step 3: Update step-03-writing.md body text**

Change line 113:
```markdown
1. Read the review feedback from `{crew-root}/output/drafts/review.md`
```
To:
```markdown
1. Read the review feedback from `{run-folder}/drafts/review.md`
```

**Step 4: Update step-04-review.md frontmatter**

Change line 5:
```yaml
inputFile: "{crew-root}/output/drafts/draft.md"
```
To:
```yaml
inputFile: "{run-folder}/drafts/draft.md"
```

Change line 6:
```yaml
outputFile: "{crew-root}/output/drafts/review.md"
```
To:
```yaml
outputFile: "{run-folder}/drafts/review.md"
```

**Step 5: Verify step-01-research.md is UNCHANGED**

Confirm that `step-01-research.md` still has:
```yaml
outputFile: "{crew-root}/output/drafts/research.md"
```
This is correct — step 1 uses the staging area before the run folder exists.

**Step 6: Commit**

```bash
git add cuadrillas/instagram-content/pipeline/steps/step-02-ideation.md
git add cuadrillas/instagram-content/pipeline/steps/step-03-writing.md
git add cuadrillas/instagram-content/pipeline/steps/step-04-review.md
git commit -m "feat(steps): update instagram-content steps 2-4 to use {run-folder}"
```

---

### Task 4: Update template step files (steps 2-4)

**Files:**
- Modify: `templates/cuadrillas/instagram-content/pipeline/steps/step-02-ideation.md:5,7`
- Modify: `templates/cuadrillas/instagram-content/pipeline/steps/step-03-writing.md:5,7,113`
- Modify: `templates/cuadrillas/instagram-content/pipeline/steps/step-04-review.md:5,6`

**Step 1: Apply identical frontmatter changes as Task 3**

Same changes for all three template step files:
- step-02: `inputFile` and `outputFile` → `{run-folder}/drafts/`
- step-03: `inputFile` and `outputFile` → `{run-folder}/drafts/` + body text line 113
- step-04: `inputFile` and `outputFile` → `{run-folder}/drafts/`

**Step 2: Commit**

```bash
git add templates/cuadrillas/instagram-content/pipeline/steps/step-02-ideation.md
git add templates/cuadrillas/instagram-content/pipeline/steps/step-03-writing.md
git add templates/cuadrillas/instagram-content/pipeline/steps/step-04-review.md
git commit -m "feat(steps): mirror run-folder changes to template steps"
```

---

### Task 5: Update cuadrilla.yaml files

**Files:**
- Modify: `cuadrillas/instagram-content/cuadrilla.yaml:31,39-40,48-49,55-56`
- Modify: `templates/cuadrillas/instagram-content/cuadrilla.yaml:31,39-40,48-49,55-56`

**Step 1: Update cuadrillas/instagram-content/cuadrilla.yaml**

Step 1 (research) keeps staging path — no change to line 31:
```yaml
      output: ./output/drafts/research.md
```

Step 2 (ideation) — change lines 39-40:
```yaml
      input: ./output/drafts/research.md
      output: ./output/drafts/angles.md
```
To:
```yaml
      input: "{run-folder}/drafts/research.md"
      output: "{run-folder}/drafts/angles.md"
```

Step 3 (writing) — change lines 48-49:
```yaml
      input: ./output/drafts/angles.md
      output: ./output/drafts/draft.md
```
To:
```yaml
      input: "{run-folder}/drafts/angles.md"
      output: "{run-folder}/drafts/draft.md"
```

Step 4 (review) — change lines 55-56:
```yaml
      input: ./output/drafts/draft.md
      output: ./output/drafts/review.md
```
To:
```yaml
      input: "{run-folder}/drafts/draft.md"
      output: "{run-folder}/drafts/review.md"
```

**Step 2: Apply identical changes to template cuadrilla.yaml**

Same changes to `templates/cuadrillas/instagram-content/cuadrilla.yaml`.

**Step 3: Commit**

```bash
git add cuadrillas/instagram-content/cuadrilla.yaml
git add templates/cuadrillas/instagram-content/cuadrilla.yaml
git commit -m "feat(yaml): update cuadrilla.yaml pipeline paths to use {run-folder}"
```

---

### Task 6: Update architect output directory instructions

**Files:**
- Modify: `_nifillos/core/architect.agent.yaml:439`

**Step 1: Update the build phase directory creation instruction**

Change line 439:
```
      8. `cuadrillas/{code}/output/` — Empty output directory (create with mkdir)
```
To:
```
      8. `cuadrillas/{code}/output/` — Output directory (create with mkdir)
         - Also create `cuadrillas/{code}/output/drafts/` — Staging area for step 1
         - Run folders (`output/YYYY-MM-DD-{slug}/`) are created automatically by the Pipeline Runner
```

**Step 2: Update Gate 3 coherence check**

Add a note after line 675 to account for the new variable:
```
      - [ ] Step 1's outputFile uses `{crew-root}/output/drafts/` (staging area)
      - [ ] Steps 2+ use `{run-folder}/drafts/` for inputFile and outputFile
```

**Step 3: Commit**

```bash
git add _nifillos/core/architect.agent.yaml
git commit -m "feat(architect): update output directory instructions for run folders"
```

---

### Task 7: Verify coherence across all changes

**Step 1: Verify step 1 → step 2 path handoff**

Read step-01-research.md and step-02-ideation.md. Confirm:
- Step 1 `outputFile`: `{crew-root}/output/drafts/research.md` (staging)
- Step 2 `inputFile`: `{run-folder}/drafts/research.md` (run folder)
- The runner's "Run Folder Creation" section moves the file between these paths

**Step 2: Verify step chain paths**

Read steps 2→3→4 and confirm inputFile/outputFile chain:
- Step 2 output → Step 3 input: `{run-folder}/drafts/angles.md`
- Step 3 output → Step 4 input: `{run-folder}/drafts/draft.md`
- Step 4 output: `{run-folder}/drafts/review.md`

**Step 3: Verify cuadrilla.yaml matches step files**

Read cuadrilla.yaml and confirm paths match step file frontmatter for all steps.

**Step 4: Verify templates match crew files**

Diff template files against crew files to confirm they're in sync.

**Step 5: Verify runner template matches runner**

Diff the two runner files to confirm they're identical.

**Step 6: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: coherence fixes for run folders implementation"
```
