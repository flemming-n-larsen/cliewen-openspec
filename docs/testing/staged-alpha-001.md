---
type: testing
---
# Staged alpha package review

## Candidate

Reviewed on November 1, 2026, on Windows with Node v24.0.0. The package was downloaded from npm staging, not rebuilt for the two installation checks.

| Field | Value |
|---|---|
| Package | `cliewen-openspec@0.1.0-alpha.1` |
| Stage ID | `ee7913e2-cc8c-4fcd-a299-c7b4488c86a1` |
| Distribution tag | `alpha` |
| npm status at review completion | `staged` |
| Tarball SHA-1 | `c188d77e8d2a88abbbc2d30a3b7ce830919aa620` |
| Contents | 56 files, 44,035 compressed bytes |

The downloaded tarball's SHA-1 matched npm's stage metadata. Its files matched the local checkout after line-ending normalization. Archive inspection found no absolute paths, parent traversal, or symbolic/hard links. The package contains the compiled CLI, schema sources, Node adapter, selected documentation, license, and package metadata; no 0.2 runtime functionality was added.

## Results

| Check | Observed result |
|---|---|
| Documented CSV walkthrough using the staged tarball | Passed installation, six tagged tests, change-scoped evidence, archive, stale-evidence detection, and refreshed evidence |
| Packed workflow using the staged tarball | Passed installation, repeat init, update, OpenSpec validation, real test collection, evidence failure cases, and archive |
| Full local regression suite | `npm test`: 57 passed, zero failed or skipped |

For the staged checks, copies of `test/docs.test.mjs` and `test/workflow.test.mjs` replaced only the package-building step with a copy of the downloaded tarball and resolved source helpers against this checkout. Their assertions remained unchanged. Both ran in isolated temporary projects with OpenSpec 1.15.0. The documentation walkthrough used repository example files; they are not shipped inside the npm package.

Local artifacts are under ignored `.tmp/staged-alpha-review/`: the downloaded tarball, adapted test files, `candidate.json`, and `regression.log`. Run the adapted tests with Node's test runner and `npm_execpath` set to the installed npm CLI path. The full regression suite builds and tests the local checkout; only the two staged installation checks directly identify the reviewed tarball as their input.

## Conclusion and limits

After this review, the owner approved publication on November 1, 2026. The public `cliewen-openspec@0.1.0-alpha.1` has the same SHA-1 as the reviewed artifact and is available through the `alpha` tag. The `latest` tag still points to `0.0.0-stage`; use the explicit alpha version or `@alpha` when installing.

After approval, the CSV walkthrough also passed using `cliewen-openspec@0.1.0-alpha.1` installed directly from the public npm registry. The check confirmed the installed version and registry download URL, then completed testing, evidence collection, archive, and refreshed evidence. The adapted test is saved locally as `.tmp/staged-alpha-review/published.test.mjs`. The updated documentation build passed with 12 pages, 404 local links, three diagrams, and configuration-default checks.

The review supported alpha publication, which the owner subsequently approved. Existing [evidence limits](evidence.md) and pending [release agent evaluations](agent-evaluation.md) still apply. This Windows check does not replace fresh Linux testing, a walkthrough by a new human user, or the remaining coding-agent trials required for release acceptance.

The README, changelog, and installation guide now describe the published npm version. Preserve this record as evidence for the exact staged artifact; a replacement tarball needs a new review.
