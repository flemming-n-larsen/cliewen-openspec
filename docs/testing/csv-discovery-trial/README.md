---
type: guide
---
# Run a CSV streaming discovery trial

This contributor trial asks whether CSV export needs streaming. It tests the discovery workflow's investigation and recommendation, not implementation. No production workload or performance requirement is supplied, and a reasoned no-change or further-investigation outcome is valid.

From a source checkout with dependencies installed, run:

```sh
npm run trial:discovery
```

The command reuses the [CSV baseline preparer](../csv-bom-trial/README.md), then commits discovery-specific agent instructions. It installs the current packed Cliewen package and OpenSpec 1.15.0, preserves six existing tests and EXP-001–006, and records the source revision/status, package hash, setup commands, and baseline revision. It does not copy an earlier solution or create the investigation artifacts.

To choose a location, use `npm run trial:discovery -- ABSOLUTE_NEW_DIRECTORY`, replacing the final argument with an absolute path outside this checkout. The directory must not exist. Defaults create a new temporary directory. Keep the entire trial directory so the local tarball dependency remains available.

## Run and assess

Give a fresh agent only the printed `root` directory and [prompt.md](prompt.md). Keep the sibling artifact directory, [rubric.md](rubric.md), and previous results outside the supplied context. This separates task context; it is not a filesystem security boundary. Record any global or inherited instructions that remain active.

The prompt permits local inspection and small experiments, with at most 50,000 synthetic rows, 20 seconds per experiment, and 60 seconds total experiment runtime. It prohibits product changes, dependency installation, network services, purchases, acceptance, and archive. These are instructions to the agent, not resource limits enforced by the preparer.

After completion, run:

```sh
node scripts/check-csv-discovery-trial.mjs PROJECT ARTIFACTS
```

Replace the final arguments with the printed paths. The checker verifies preserved baseline inputs, tests, installed schema, artifact status, saved instructions, proposed decision status, and Cliewen health. It writes `independent-checks.json` and refuses to replace an earlier evaluation. A pass does not grade the reasoning, source quality, measurement interpretation, prose, or historical tool behavior. Use the rubric to review those and rerun an experiment when practical.

For an exact-baseline repeat, clone `baseline.bundle` into a new sibling project and run `npm ci`, retaining the artifact directory and tarball. `preparation-baseline.bundle` records the initial shared fixture before the discovery-specific instruction commit. Creating a new starter instead uses the current source and freshly resolved dependencies.

Record agent/runner/model/settings, permissions, runtime and cost where available, actual commands/results, review findings, and limitations. Keep raw traces when the runner exposes them. Do not label a collaboration sub-agent run as a CLI or Harbor evaluation, and do not infer missing usage metrics. Product evidence checks do not prove an investigation's recommendation.

See [trial 001](result-001.md) for the first reviewed result and its limitations.
