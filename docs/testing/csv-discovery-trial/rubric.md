# Discovery review criteria

Mark each area pass, fail, or not observed and cite a file, log, command, or diff. Keep setup/tool failures separate from task failures. Do not reward a particular recommendation.

| Area | Criteria |
|---|---|
| Isolation | Agent receives the baseline project and prompt, without earlier investigation or evaluator rubric; inherited instructions disclosed |
| Instructions | Saved proposal, investigation, decision, and apply JSON from cliewen-discovery; project config read |
| Scope | No production implementation, changed tests/specs/IDs, new delivery change, archive, push, purchase, or dependency installation |
| Proposal | Understandable question, comparison, limits, decision criteria, and explicit absence of production requirements |
| Alternatives | Current string API compared with streaming; benefits, costs, and consumer implications considered without fabricated prototype measurements |
| Evidence | Descriptive source links; facts separated from hypotheses; actual experiment commands, inputs, outputs, revision, and limits; unrun work labeled |
| Experiment validity | Small bounded experiments, reproducible results; synthetic sizes not presented as observed production workloads; process memory and elapsed time interpreted cautiously |
| Decision | Proposed status; no change, delivery handoff, or further investigation reasoned from evidence; remaining uncertainty and reopening conditions stated |
| Writing | Brief plain language overview; details support the decision; references explained; diagrams useful or reasonably omitted |
| Checks | Existing tests pass, schema valid, status complete, health check reports discovery-review-required; no claim of product proof from check success |

Review evidence sufficiency manually. Rerun an experiment when practical, but do not demand identical timings or memory readings. Verify preservation of the baseline using Git. Record unknown cost, model settings, duration, and missing event traces explicitly. One run is not a reliability claim across agents.
