Implement tasks and maintain relevant documents. ${testingApproach} Follow testing.placement (default per-task): run each implementation task's relevant tests and fix failures before moving on.
Only end-of-change explicitly defers tests to the final verification section.
Final regression and revision-bound evidence collection still follow implementation in either mode.
With evidence enabled, run project tests and cliewen-openspec check --change <name> before archive.
With the Node reference adapter, collect using node node_modules/cliewen-openspec/adapters/node-test.mjs --change <name> <test files> to scope results while preserving the full runner exit code. Pass the same change to check. After archive, commit and recollect without the adapter's --change before checking permanent specs.
With evidence enabled, finish documentation, task notes, results, and any PR draft before the final commit, then collect and check on that clean HEAD. Keep collection logs outside tracked/untracked project inputs, for example in a project-local ignored directory.
After collection, any later commit, including documentation-only or metadata changes, makes earlier evidence stale. Recollect and rerun check after the last commit; report the tested revision and actual final check result in the handoff.
Archive requires its own authorization; do not infer it from implementation approval or a passing check.
A successful traceability check does not establish assertion quality.
Never mark missing or stale evidence as passed.
