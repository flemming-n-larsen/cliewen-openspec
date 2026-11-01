---
type: evaluation
---
# CLI trial round 007: TDD recording and completion checks

The new completion check rejected an invalid TDD cycle in the combined workflow. A fresh delivery attempt then followed the recorded test-first sequence and passed the product checks on clean final HEAD. Neither attempt passed the complete agent-trial rubric: the combined run was interrupted, and delivery omitted the required apply instruction retrieval.

Both used OpenCode 2.2.5 with requested model `opencode/glm-5.3-flash` and high effort. See [the machine-readable report](result-007.json) for package hashes, revisions, phase limits, costs, and retained artifacts. These are maintainer trials, not additional requirements installed in user projects.

| Case | TDD and product checks | Overall trial |
|---|---|---|
| `cliewen-all`, initial candidate | Rejected invalid history despite passing final tests; delivery remained unfinished | Incomplete; provider connection reset followed by the 600-second continuation limit |
| `cliewen-delivery`, final candidate | Intended assertion failures before implementation, then green; characterization and documentation verification recorded; final check passed | Task failure: apply instructions were neither retrieved nor saved as required by the pilot prompt |

## Combined attempt

The investigation stopped at proposed status with unchanged product inputs and registry. The evaluator relayed existing bounded owner authorization after reviewing the proposed API; no new human review was claimed. The recommendation used the existing optional third-argument BOM scope.

Delivery retained a failed green attempt caused by an incorrect test expectation. After correcting the test, the agent started another cycle whose red-phase command passed all ten tests. It reported that outcome honestly, but it could not establish a new red phase. The checker returned `tdd-sequence-invalid`, with additional findings for an unfinished closure task, invalid file declaration, and missing evidence. A later provider `ECONNRESET` interrupted progress; the wall limit ended the attempt. The observed sequence failure remains separate from that infrastructure interruption.

## Fresh delivery attempt

Before this attempt, the candidate preserved declared filename case and clarified that final evidence collection and completion checks belong outside numbered tasks. The final packed source matches this attempt's package hash.

Raw tool actions show start, test edits, two intended missing-BOM assertion failures, production edits, and a passing green run. Default-output coverage used a separate, justified characterization task; it passed before production changes and claimed no red phase. Documentation used a verification task. All nine tagged tests and the independent supported-input assertions passed. Scoped evidence and the product check matched clean revision `36e05fc92f41cb59001c59227de81c9f825980b1`.

The independent checker still failed the saved-apply-instructions requirement, and the trace contains no apply retrieval. That result is retained without repairing the project or weakening the rubric. No archive, push, or external PR occurred in either case.

Reported costs were about $0.11 for the two combined phases and $0.05 for delivery. No purchase or top-up was made. The traces did not echo model identities; the requested profile is recorded. Raw traces, local history, project snapshots, tarballs, and Git bundles are retained under ignored `.tmp/agent-trials/cli-evaluation-007/`.

The trials demonstrate one rejected sequence and one reviewed valid sequence. Local history does not control every write or prove assertion quality. Repeated profile coverage, a fully passing combined TDD attempt, and the omitted apply retrieval remain release-evaluation gaps.
