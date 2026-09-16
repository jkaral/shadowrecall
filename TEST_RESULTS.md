# ShadowRecall Evaluation Results

This document records the evaluation process used to test whether ShadowRecall correctly determines when stored memory should influence a planned action.

The goal is not to claim universal model accuracy. These tests evaluate a deterministic memory-relevance pipeline across controlled scenarios involving scheduling, messaging, and task planning.

## Test files

The evaluation suite currently consists of three dedicated evaluation files:

- [`tests/evaluation.test.ts`](tests/evaluation.test.ts) — initial six-scenario sanity evaluation
- [`tests/evaluation2.test.ts`](tests/evaluation2.test.ts) — 40-scenario robustness benchmark focused on paraphrases and context mismatch
- [`tests/eval3.test.ts`](tests/eval3.test.ts) — 40-scenario diagnostic benchmark covering semantic paraphrases, scoped irrelevance, multiple memories, and negation/contrast

These sit alongside the project’s ordinary unit tests for the demo, planner, and structured diff engine.

## Metrics

The evaluation files report several related metrics:

- **Decision-change rate** — how often the remembering plan differs from the amnesiac control.
- **Relevant-memory detection** — how often a memory that should influence the action actually changes the plan.
- **Irrelevant-memory rejection** — how often an irrelevant memory is correctly prevented from changing the plan.
- **False positives** — cases where memory changed the action even though it should not have.
- **False negatives** — cases where memory should have changed the action but did not.
- **Scenario correctness** — the proportion of scenarios in which the observed influence matched the expected influence.

A passing Vitest file means the evaluation completed successfully. The scenario-level percentages printed by the evaluation are the actual performance measurements.

## 1. Initial sanity evaluation

File: [`tests/evaluation.test.ts`](tests/evaluation.test.ts)

The first evaluation contains six paired scenarios. Each instruction is run once with memory and once without memory. The cases cover scheduling, messaging, task priority, and irrelevant memories.

Observed results:

| Metric | Result |
|---|---:|
| Total scenarios | 6 |
| Decision-change rate | 50.0% |
| Relevant-memory detection | 100.0% |
| Irrelevant-memory rejection | 100.0% |
| Average changed fields | 1.33 |

This test is best treated as a functional sanity check rather than a robustness benchmark because the scenarios closely match behavior explicitly supported by the original planner.

## 2. Robustness benchmark

File: [`tests/evaluation2.test.ts`](tests/evaluation2.test.ts)

The second evaluation expands the benchmark to 40 scenarios:

- 20 paraphrased relevant memories
- 20 context-mismatch memories

The scenarios are balanced across four behavior types:

- morning scheduling preference
- email communication preference
- task urgency
- remote-meeting preference

### Original planner baseline

The first run exposed severe brittleness in the original keyword-oriented planner:

| Metric | Result |
|---|---:|
| Correct scenarios | 1 / 40 |
| Overall correctness | 2.5% |
| Paraphrase handling | 0.0% |
| Context-mismatch rejection | 5.0% |
| False positives | 19 |
| False negatives | 20 |

The failure pattern showed two separate problems:

1. semantically equivalent wording was often missed;
2. memories were sometimes applied outside the context in which they were relevant.

### First relevance redesign

The planner was then redesigned around structured memory constraints and contextual scope checking rather than applying memory directly from raw keyword presence.

On the same development benchmark, the redesigned planner reached:

| Metric | Result |
|---|---:|
| Correct scenarios | 39 / 40 |
| Overall correctness | 97.5% |
| Paraphrase handling | 95.0% |
| Context-mismatch rejection | 100.0% |
| False positives | 0 |
| False negatives | 1 |

Because `evaluation2.test.ts` directly informed this redesign, this 97.5% result is treated as a **development-set result**, not as an unbiased held-out estimate.

### Current regression result

After a later redesign added broader semantic normalization and explicit polarity handling, the same benchmark produced:

| Metric | Result |
|---|---:|
| Correct scenarios | 38 / 40 |
| Overall correctness | 95.0% |
| Paraphrase handling | 90.0% |
| Context-mismatch rejection | 100.0% |
| False positives | 0 |
| False negatives | 2 |

Current subcategory results:

| Subcategory | Result |
|---|---:|
| Morning | 10 / 10 — 100.0% |
| Email | 9 / 10 — 90.0% |
| Urgency | 10 / 10 — 100.0% |
| Remote | 9 / 10 — 90.0% |

The important regression property is that irrelevant-memory rejection remained perfect on this benchmark, while the broader semantic redesign introduced two missed relevant-memory cases.

## 3. Broader diagnostic evaluation

File: [`tests/eval3.test.ts`](tests/eval3.test.ts)

The third evaluation was created after the first redesign and contains 40 new scenarios across four categories:

- **Semantic paraphrase** — new phrasings for relevant preferences
- **Scoped irrelevance** — real preferences that apply to a different person, activity, or context
- **Multi-memory** — relevant memories mixed with distracting or irrelevant memories
- **Negation / contrast** — statements where surface keywords appear but the meaning is reversed or qualified

### First held-out run

Before these failures were used to modify the implementation, the first run produced:

| Metric | Result |
|---|---:|
| Correct scenarios | 20 / 40 |
| Overall correctness | 50.0% |
| Relevant-memory detection | 25.0% |
| Irrelevant-memory rejection | 75.0% |
| False positives | 5 |
| False negatives | 15 |

Category breakdown:

| Category | Result |
|---|---:|
| Semantic paraphrase | 0 / 10 — 0.0% |
| Scoped irrelevance | 10 / 10 — 100.0% |
| Multi-memory | 10 / 10 — 100.0% |
| Negation / contrast | 0 / 10 — 0.0% |

This result showed that the first redesign generalized well to contextual scope and multiple-memory noise, but still failed on broader semantic equivalence and polarity-sensitive language.

Those failures motivated a second redesign introducing broader semantic normalization and explicit positive/negative polarity handling.

Because `eval3.test.ts` was then used to diagnose those weaknesses, any subsequent run on the same file should be treated as a **regression result**, not a fresh held-out result.

## Development progression

The evaluation history can be summarized as:

```text
Original keyword-oriented planner
        |
        v
40-case robustness benchmark
1/40 correct (2.5%)
        |
        v
Diagnosed paraphrase + scope failures
        |
        v
Structured memory constraints + scope filtering
        |
        v
39/40 on development benchmark (97.5%)
        |
        v
40-case broader diagnostic evaluation
20/40 correct (50.0%)
        |
        +--> scoped irrelevance: 10/10
        +--> multi-memory: 10/10
        +--> semantic paraphrase: 0/10
        +--> negation/contrast: 0/10
        |
        v
Semantic normalization + polarity handling
        |
        v
Current regression suite remains green
```

The purpose of this progression is not to optimize a single percentage. Each benchmark was used to expose a distinct failure mode and guide a corresponding architectural change.

## Current automated test status

The current test suite contains six Vitest files and 12 automated tests. The latest full run completed with:

```text
Test Files  6 passed (6)
Tests       12 passed (12)
```

The dedicated evaluation files are:

```text
tests/evaluation.test.ts
tests/evaluation2.test.ts
tests/eval3.test.ts
```

## Interpretation

These results support several narrower claims about the current project:

- ShadowRecall can compare memory-conditioned and amnesiac action plans using controlled paired scenarios.
- Context-aware filtering substantially reduced inappropriate memory application on the 40-case robustness benchmark.
- The system can distinguish relevant memories from unrelated memories even when several memories are supplied together.
- Broader semantic paraphrases and negation required additional handling beyond simple scope filtering.
- The evaluation process identified concrete failure modes that directly informed redesigns of the memory-relevance pipeline.

They do **not** establish that ShadowRecall is universally 95% or 97.5% accurate. The tests are hand-authored, the planner is deterministic, and the evaluated action space is intentionally limited.

## Limitations

- The benchmarks are hand-authored rather than sampled from a production distribution.
- The planner currently operates over a restricted set of calendar, messaging, and task actions.
- The evaluation measures whether memory changes the structured action as expected, not whether the underlying memory itself is factually correct.
- Development benchmarks should not be interpreted as held-out estimates once their failures have informed implementation changes.
- A larger independently generated benchmark would be needed for a stronger generalization claim.

## Running the evaluations

Run the full suite:

```bash
npm test
```

Run the evaluation files individually:

```bash
npx vitest run tests/evaluation.test.ts
npx vitest run tests/evaluation2.test.ts
npx vitest run tests/eval3.test.ts
```
