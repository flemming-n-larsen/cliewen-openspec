---
type: guide
---
# Evaluate the combined CSV workflow

Run `npm run trial:all` from a source checkout with dependencies installed. The preparer reuses the six-scenario CSV baseline, installs the current package, and adds combined-workflow agent instructions. It prints project and artifact paths and preserves package/source metadata and Git bundles. An optional absolute output path can follow `--`; existing directories and paths inside the source checkout are refused.

Start a fresh agent with only the project and [prompt.md](prompt.md). Keep [rubric.md](rubric.md), prior solutions, and evaluator artifacts outside the supplied context. Disclose shared instructions that remain inherited. The first stage stops with a proposed recommendation. Do not silently supply simulated acceptance as if it were human agreement.

Review the decision before continuing. If a person approves the bounded delivery, give the agent that explicit approval and retain it with the result. Continue in the same change using the same baseline and profile, recording the real approval source. The agent then follows specs, tasks, implementation, and scoped evidence. A no-delivery outcome uses native `skip_specs: true` and genuine closure tasks instead. See [the combined workflow guide](../../guide/all.md).

After completed delivery, run `node scripts/check-csv-all-trial.mjs PROJECT ARTIFACTS` from the source checkout, replacing the final paths. It reuses the BOM independent behavior checker with combined-schema instruction expectations. It is intended for the third-argument `{bom: true}` API; review another chosen API before adapting assertions. The checker writes one evaluation and refuses to replace an earlier result. It does not prove the approval source, prose quality, or historical TDD ordering.

Use the rubric for both delivery and no-delivery review. A correct stop at the approval boundary is a successful first-stage observation and incomplete end-to-end agent coverage. Deterministic tests separately exercise both native no-delivery closure and accepted delivery through real evidence and archive, using clearly labeled approval fixtures.

Run `node scripts/check-csv-all-review.mjs PROJECT ARTIFACTS` to check the first-stage delivery recommendation. It checks unchanged baseline files, six original tests, proposed outcome/status, saved first-stage instructions, and the expected all-decision-unaccepted finding. It records stage success separately from incomplete end-to-end delivery. Its results and the manual review do not constitute approval.

Preserve the entire artifact directory for replay. Clone `baseline.bundle` into a new sibling project and run `npm ci` while retaining the tarball. These are contributor trials, not a Harbor runner or a claim of compatibility across CLI/model profiles.

The [first-stage report](result-001.md) records the observed review stop and incomplete end-to-end coverage.

The [delivery follow-up](result-002.md) records the completed continuation after actual user agreement, including independent behavior and evidence checks.
