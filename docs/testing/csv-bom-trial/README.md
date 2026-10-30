---
type: guide
---
# Run a CSV BOM trial with a fresh agent

This trial checks whether an agent can extend an existing capability using the installed schema, without the project conversation. It is contributor evaluation tooling, separate from the public user guide and deterministic package tests.

## Prepare the baseline

From a checkout with dependencies installed, run:

```sh
npm run trial:prepare
```

The command builds and packs the current Cliewen source, installs it with OpenSpec 1.15.0 in a new temporary project, and creates a baseline Git commit. The project contains the CSV formatter, six passing Unit tests, permanent specs, and the native AC registry at EXP-006. Configuration selects per-task testing and TDD. No BOM implementation, proposal, or previous trial observations are included.

The output shows `root` for the agent's project and `artifacts` for the evaluator's files. To choose a location, use `npm run trial:prepare -- ABSOLUTE_NEW_DIRECTORY`, replacing the final argument with an absolute path. The target must not exist and must be outside this checkout. The command refuses to overwrite an earlier run. A failed setup leaves its command log for inspection; use a new directory for a retry.

The artifact directory contains the packed package, its SHA-256 hash, source revision and working-tree status, dependency installation log, baseline revision, `baseline.bundle`, prompt, and review criteria. Keep the entire directory: the baseline's package dependency points to that local tarball. An uncommitted source checkout is allowed and recorded, so the tarball hash identifies the actual input more precisely than the source commit alone.

## Start a fresh session

Start a new agent session in `root`. Give it only [prompt.md](prompt.md) and the project location. Do not resume an old conversation or expose earlier solutions, reports, or [rubric.md](rubric.md). The evaluator keeps the sibling artifact directory outside the supplied project context. This is context separation, not a filesystem security boundary.

Use one representative agent profile initially. Record the agent/version, model, provider, effort, instructions, permissions, elapsed time, and available cost/token information. Mark unavailable fields explicitly. Save raw agent events when the runner exposes them. Record personal or global instructions that remain active; a fresh session can still load those instructions.

The prompt permits local commits for evidence collection and stops before archive or push. It asks the agent to save each artifact's OpenSpec instruction response and its actual test observations.

## Repeat and review

For a comparison from the exact same baseline, clone `baseline.bundle` into a new project and run `npm ci` there while retaining the original artifact directory. Do not point another agent at a completed trial. A new `trial:prepare` run uses the current source and resolves dependencies again; it is a new input, not necessarily the same baseline.

Use the review criteria after the agent finishes. Inspect the diff, commands, original tests, scenario IDs, type declarations, evidence revision, README, and PR draft. Run independent checks for the chosen API. Distinguish a provider or tool failure from an incorrect implementation and record incomplete observations as such. A passing self-authored test suite alone does not establish correct behavior or TDD ordering.

For the third-argument `{bom: true}` API used in the first run, execute `node scripts/check-csv-bom-trial.mjs PROJECT ARTIFACTS` from this checkout, replacing both paths. The checker reruns tests, strict validation, evidence checking, and independent behavior assertions. It also checks preservation of baseline tests/specs and the saved instruction files. It writes `independent-checks.json` and refuses to replace an earlier result. Review another API before adapting these assertions; the prompt does not require this exact signature. The checker does not automatically grade prose or historical TDD ordering.

The [first fresh-context result](result-001.md) records the profile, review, and limitations.

The first pilot run with conversation context is documented in [the earlier trial report](../csv-bom-agent-trial.md). Keep fresh-context results separate so the comparison remains clear. These scripts prepare an evaluation; they do not implement a Harbor runner or automatically score prose quality.
