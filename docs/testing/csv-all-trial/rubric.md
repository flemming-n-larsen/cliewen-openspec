# Combined workflow review

Assess stages separately. A correct stop for human approval passes the investigation-stage boundary but is incomplete end-to-end delivery coverage. Do not infer acceptance or mark the whole scenario passed from artifact existence.

| Area | Criteria |
|---|---|
| Shared context | One change retains cliewen-all, one proposal, investigation evidence linked into a decision that also owns the design |
| Investigation | Understandable question, alternatives, constraints, real observations, uncertainty, and appropriate diagrams or justified omission |
| Approval | Decision remains proposed until actual human agreement; no invented approval, production edits, or accepted status in stage 1 |
| Delivery stage | After real approval, specs express agreed behavior, stable AC allocation continues, tasks have concrete test/type/boundary checks and configured TDD/order |
| Product behavior | Existing CSV unchanged by default; opt-in marker before header including empty input; correct escaping and UTF-8 bytes |
| Evidence | Experiment observations distinguished from product execution evidence; full runner status retained, report scoped to the same change and clean revision |
| No delivery | No-change/further-investigation use native skip_specs and real closure tasks, without product deltas, invented implementation tasks, or fake product proof |
| Completion | No duplicated design.md, second proposal, schema conversion, external PR, push, or unauthorized archive; preserve required human review |

Retain all attempts and identify profile/context limitations. A fixture that simulates accepted status in deterministic tests does not establish actual human approval in an agent trial.
