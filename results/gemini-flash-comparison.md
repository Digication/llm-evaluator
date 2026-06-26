# Evaluation Comparison — gemini-3.5-flash vs gemini-3.1-flash-lite
**Date:** 2026-06-25  
**Evaluator:** gpt-4o-mini via Arize Phoenix

---

## Dataset Overview

| | gemini-3.5-flash | gemini-3.1-flash-lite |
|---|---|---|
| Batches | 18 of 20 (2 timed out) | 20 of 20 |
| Regular turns | 32,813 | 37,692 |
| Summary turns | 1,728 | 1,984 |
| Conversations | 1,728 | 1,984 |

> **Note on flash data quality:** ~198 closing-turn responses contain `"searching for information in TORI"` instead of a proper summary — a system prompt artifact now fixed for future runs. This affects Graceful Closure and Summary Quality scores for this run; all per-turn metrics (RQ, EA, DNAFS, SIS) are unaffected.

---

## Per-turn Score Comparison

| Metric | flash | flash-lite | Δ |
|---|---|---|---|
| Reflective Questioning | **99.7%** | 92.7% | +7.0% ↑ |
| Emotional Acknowledgment | **28.0%** | 13.5% | +14.5% ↑ |
| Does Not Answer for Student | 95.7% | **96.0%** | –0.3% |
| Stays in Scope | 66.5% | **68.0%** | –1.5% |
| Response Length | **98.8%** | 96.9% | +1.9% ↑ |
| Stop Sequence Misuse | **100.0%** | 99.4% | +0.6% ↑ |
| Crisis Response | **7.2%** | 4.4% | +2.8% ↑ |
| Summary Quality | 73.9% ⚠ | 68.2% | not comparable* |

*Summary Quality **cannot be fairly compared** for this run. The flash dataset contains 302 closing-turn responses that start with `"searching for information in TORI"` (198 bare phrase, 104 followed by content). The evaluator (gpt-4o-mini) scored these very leniently — 74 of the 198 bare responses received **pass**, 117 received **partial**, and only 7 received **fail** — inflating the flash figure. Excluding all 302 affected rows, flash's clean summary quality is **78.5%** (vs flash-lite's 68.2%), but this comparison will be reliable only in the next clean run.

---

## Conversation-level Score Comparison

| Metric | flash | flash-lite | Δ |
|---|---|---|---|
| Engagement Arc | 99.9% | 99.9% | — |
| Thematic Coherence | **100.0%** | 99.9% | +0.1% |
| Persona Consistency | 99.4% | **99.6%** | –0.2% |
| Repetitiveness | **99.6%** | 99.5% | +0.1% |
| **Graceful Closure** | **94.5%** | 99.4% | **–4.9% ↓** |
| Ethical Boundary Handling | **99.8%** | 99.7% | +0.1% |

---

## Key Findings

### 1. Flash is significantly better at Reflective Questioning (99.7% vs 92.7%)

Flash-lite occasionally asks closed or leading questions. Flash produces genuine open-ended questions in nearly every turn. This is the largest quality improvement between the two models.

### 2. Flash shows meaningful improvement in Emotional Acknowledgment (28.0% vs 13.5%)

Still the weakest metric for both models, but flash-lite's pass rate more than doubles with flash. Label breakdown:

| Label | flash | flash-lite |
|---|---|---|
| pass | 28.0% | 13.5% |
| partial | 51.6% | 52.1% |
| fail | 20.4% | 34.4% |

Flash still fails to warmly acknowledge emotions before pivoting to a reflective question in ~72% of turns. The prompt-level fix (adding an explicit acknowledgment step before the next question) would likely close most of this gap regardless of model.

### 3. Summary Quality metric is not trustworthy for flash (data quality issue)

The reported 73.9% figure is meaningless for comparison purposes. The 302 TORI-affected closing responses were scored too leniently by gpt-4o-mini — 74 responses that contain nothing but `"searching for information in TORI"` received a **pass**. This inflates the number while simultaneously the bad responses drag it down, making the figure unreliable in both directions.

The clean pass rate (excluding all 302 affected rows) is **78.5%** — suggesting flash does write better summaries than flash-lite (68.2%) when it actually produces a summary. A fair comparison requires re-running generation with the fixed system prompts.

### 4. Graceful Closure drop is a data quality artefact (94.5% vs 99.4%)

The ~198 conversations with a bare TORI phrase as their closing response did not close gracefully. In a clean dataset, this metric would likely match flash-lite's 99%+ level.

### 5. Crisis Response remains low on both models (7.2% vs 4.4%)

Flash handles crisis disclosures slightly better, but both models fail the majority of flagged turns. The root cause is the same for both: the system prompt doesn't instruct the model to stop the reflection flow and provide crisis resources when a student signals distress. This is a **system prompt gap, not a model capability gap** — and the higher-priority fix regardless of model.

### 6. Both models are near-identical on conversation structure

Engagement arc, thematic coherence, persona consistency, repetitiveness, and ethical boundary handling all score 99%+ on both models. The core conversational quality is strong across the board.

---

## Summary

Flash is a clear improvement over flash-lite on the metrics that matter most for this use case:

- **Better reflective questioning** — asks deeper, more open-ended questions
- **Better emotional attunement** — more often pauses to acknowledge feelings before moving on
- **Better closing summaries** — clean summary quality is 78.5% vs 68.2%, though the reported figure (73.9%) is unreliable due to data quality issues in this run

The two weaknesses are shared across both models and are **prompt-level issues** rather than model-specific ones:

| Priority | Issue | Both models | Fix |
|---|---|---|---|
| 🔴 Safety | Crisis disclosures not handled — reflection continues | flash: 7.2%, flash-lite: 4.4% pass | Add explicit crisis detection + 988 Lifeline instruction to system prompt |
| 🟠 High | Emotional content skipped before next question | flash: 28%, flash-lite: 13.5% pass | Add warm acknowledgment step to base guide/tutor prompts |
| 🟡 Medium | Occasional direct answers / advice-giving | ~66–68% pass | Tighten facilitator-role instructions |
