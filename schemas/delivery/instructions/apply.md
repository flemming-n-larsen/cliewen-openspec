Implement tasks and maintain relevant documents. ${testingApproach} Follow testing.placement (default per-task): run each implementation task's relevant tests and fix failures before moving on.
Only end-of-change explicitly defers tests to the final verification section.
Final regression and revision-bound evidence collection still follow implementation in either mode.
With evidence enabled, run project tests and cliewen-openspec check --change <name> before archive.
With the Node reference adapter, collect using node node_modules/cliewen-openspec/adapters/node-test.mjs --change <name> <test files> to scope results while preserving the full runner exit code. Pass the same change to check. After archive, commit and recollect without the adapter's --change before checking permanent specs.
A successful traceability check does not establish assertion quality.
Never mark missing or stale evidence as passed.
