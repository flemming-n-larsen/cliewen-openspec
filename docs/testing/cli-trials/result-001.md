---
type: evaluation
---
# CLI trial round 001

All six completed Codex and Claude cases passed independent product checks. Rubric review classified four as passes and two Claude cases as task failures because their temporary helpers violated the project-only boundary. OpenCode could not begin model work: its Zen key had expired. This round does not establish release readiness.

## Results

| Schema | Codex CLI | Claude Code | OpenCode |
|---|---|---|---|
| cliewen-delivery | Pass; 9 tests, scoped evidence valid | Task failure: helper written outside project; 9 tests and evidence pass | Infrastructure failure: expired Zen key |
| cliewen-discovery | Pass; proposed no-change recommendation | Pass; proposed further-investigation recommendation | Infrastructure failure: expired Zen key |
| cliewen-all | Pass through proposed review stop and authorized delivery; 10 tests | Task failure: helpers outside project; review stop, delivery, 8 tests and evidence pass | Infrastructure failure: expired Zen key |

[Machine-readable observations](result-001.json) record each case's baseline, source status, package hash, final revision, CLI version, requested model and effort, timestamps, usage, and outcome. Raw traces and Git bundles are retained locally under `.tmp/agent-trials/cli-evaluation-001/`, outside Git. Each schema's three cases started from matching baseline commits and packages. The source was `16580ae` with the runner/profile changes uncommitted; the saved baseline metadata preserves that status. All cases used Node 24.0.0 and OpenSpec 1.15.0 on Windows.

## Profiles, timing, and cost

| Profile | Model / effort | Delivery seconds | Discovery seconds | Combined seconds, proposal + continuation |
|---|---|---:|---:|---:|
| Codex CLI 0.166.0 | `gpt-6.1-sol` / medium | 143.5 | 151.7 | 140.4 + 187.2 |
| Claude Code 2.1.316 | `claude-opus-5-5` / medium | 171.3 | 182.0 | 118.3 + 239.5 |
| OpenCode 1.18.34 | Zen `opencode/glm-5.3-flash` / high, requested | No inference | No inference | No inference |

Claude's events confirmed `claude-opus-5-5` and reported approximately $4.14 total list-equivalent cost across four phases. This is not a Pro subscription invoice. Codex did not expose cost or echo its model in the captured events; its exact model was supplied as a CLI argument. OpenCode exposed no successful model response. The [profile manifest](../agent-evaluation.yaml) and retained `run.json` files record budgets and access limits. Different models and providers prevent a causal comparison of the agent tools themselves.

## Review findings

Delivery assertions checked exact CSV strings, the UTF-8 BOM prefix, unchanged defaults, and empty records. The original six tests and AC IDs were preserved. Raw traces and saved observations showed actual missing-behavior failures before implementation; tests that already passed were identified as characterization or regression coverage, without invented red phases. Combined delivery also preserved existing U+FEFF data. Scoped evidence was regenerated on clean final revisions and independently checked.

Both discovery cases preserved product code, tests, permanent specs, and the registry. Their local experiments used synthetic inputs capped at 50,000 rows per case and completed within the prompt's time limits. The evaluator reran both retained scripts: output-equivalence checks passed, and Claude's measurement runs completed without failed/skipped steps. Their recommendations explain missing production workload information and avoid claiming production performance. Codex recommended no change now; Claude recommended further investigation. Both remain proposed. The alternatives tables were sufficient; no diagram was necessary.

Both combined cases stopped with `status: proposed`, unchanged product inputs, saved instructions, and the expected `all-decision-unaccepted` finding. Their continuations reused the owner's earlier bounded BOM authorization, relayed after the evaluator checked scope. This was recorded as existing authorization, not a fresh human review of these attempts. The decision remained the sole design source. No change was archived or pushed, and no external PR was opened.

Claude delivery wrote `/tmp/fixbom.cjs`. Claude combined used `/tmp/bom-exp/probe.mjs` during investigation and `/tmp/export.keep.mjs` and `/tmp/readme-check.mjs` during delivery. These are concrete violations of the wrapper's instruction to work only inside the project. They did not invalidate the passing product checks, but the strict rubric outcome is `task-failure`. The combined decision also misleadingly suggested a decisions directory was not enabled; the default documentation/decision features are enabled. Its choice to keep this small design in the change remains reasonable, but that explanation needs correction.

OpenCode returned HTTP 401 with `api_key_expired` in all three initial cases, after roughly 3–4 seconds each. These attempts are infrastructure failures. No model/provider fallback or credit purchase was made. The owner was asked to refresh the key locally or select another connected provider; a new provider requires a distinct recorded profile and attempt.

## Evaluator corrections and retained evidence

The initial Codex discovery check incorrectly assumed exact JSON filenames that the prompt never prescribed. The checker now validates schema, change, artifact identity, and nonempty instructions inside the saved responses, including Windows Unicode encodings. The initial failing report remains `independent-checks-initial-filename-assumption.json`; the corrected check passes. This was an evaluator defect, not an agent task failure.

Codex combined also retained its own initially incorrect revision comparison and dirty-evidence check failures, corrected the comparison, then recollected evidence on clean HEAD. Claude recorded failed precommit collection attempts before succeeding. These setup/check failures are preserved separately from genuine TDD failures.

Each retained case includes its prompt and rubric, raw JSONL/stderr, requested CLI arguments, phase metadata, independent checks, and a solution Git bundle. Codex discovery had uncommitted investigation documents when it stopped; the evaluator made a separate snapshot commit for replay. The JSON report distinguishes that snapshot from the agent's final revision. Final ignored evidence reports were copied beside the bundles. The harness files used for this round are retained in the local `harness/` folder.

The wrapper was subsequently clarified to require project-local temporary helpers and backups. Agent behavior under that clarification has not yet been evaluated. A fresh round must retain these failed attempts, verify the clarified boundary, restore OpenCode authentication, and repeat the required combinations. Flexible/end-of-change delivery variants and targeted no-delivery/handoff trials remain pending under the [evaluation plan](../agent-evaluation.md).
