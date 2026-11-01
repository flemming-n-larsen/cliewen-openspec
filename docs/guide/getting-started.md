---
type: guide
---
# Your first change

This guide takes a small CSV exporter from a new project to archived OpenSpec specs. Use a separate repository so you can review everything the alpha installs. You need Git, npm, and Node.js 20.19 or newer. Node 22 or 24 matches the versions used in package CI. Configure a Git name and email before the commit steps.

## 1. Build the alpha package

The alpha is available on npm: existing projects can install it with `npm install --save-dev cliewen-openspec@0.1.0-alpha.1`. Use this explicit version or `@alpha`, because npm's `latest` tag currently points to a staging placeholder. This worked example builds the development source, currently `0.2.0-alpha.1`, and uses its prepared CSV files. That development version is not published.

Clone the source repository, then run these commands inside it:

```sh
git clone https://github.com/flemming-n-larsen/cliewen-openspec.git
cd cliewen-openspec
npm ci
npm test
npm pack
```

The result is `cliewen-openspec-0.2.0-alpha.1.tgz`. The commands below assume that the clone and pilot are sibling directories. To use the published package instead, replace the tarball argument in the install command with `cliewen-openspec@0.1.0-alpha.1`; keep the checkout for the example helper and files.

## 2. Create the pilot

From the source repository, move up one directory and create the pilot:

```sh
cd ..
mkdir cliewen-pilot
cd cliewen-pilot
git init -b main
npm init -y
npm install --save-dev @fission-ai/openspec@1.15.0
npm install --save-dev ../cliewen-openspec/cliewen-openspec-0.2.0-alpha.1.tgz
```

Create `.gitignore` containing `node_modules/` before committing. Initialize OpenSpec without agent integrations for the reproducible example:

```sh
npx --no-install openspec init --tools none --no-animation
npx --no-install cliewen-openspec init --dry-run
npx --no-install cliewen-openspec init --default
```

`npx --no-install` runs the locally installed command. OpenSpec creates the change/spec structure. Cliewen's dry run lists proposed writes. Its `init` installs the delivery, discovery, and combined schemas, the DR template, project configuration, a documentation entry point, and an ownership manifest. `--default` sets `schema: cliewen-delivery` in `openspec/config.yaml`; omit it to preserve your current default.

For agent-authored work, select your agent during OpenSpec initialization instead of `--tools none`. See [agent setup](existing-projects.md#coding-agents).

## 3. Configure acceptance IDs

Add these settings to `.cliewen-openspec/config.yaml`. Keep the other generated settings:

{{include:docs/examples/csv/config.yaml}}

`csv-export` is the capability name and will also be its specs directory name. `EXP` is a prefix chosen for that capability. The settings explicitly show the default test placement and approach; you can omit them to keep those defaults.

Start the change and allocate its six scenario IDs:

```sh
npx --no-install openspec new change add-csv-export --schema cliewen-delivery
npx --no-install cliewen-openspec ac next --capability csv-export
```

The first allocation prints `EXP-001`. Run the allocation command five more times for `EXP-002` through `EXP-006`. It updates `.cliewen-openspec/ac-registry.json`. Commit that registry with your specs. Do not reset it or reclaim unused numbers.

## 4. Write and review the proposal

Give your coding agent the [reference prompt](../testing/pilot-prompt.md#prompt), then review its proposal, specs, design, and tasks. Each scenario heading should carry its allocated ID and have one `Test-type` line below it. Each implementation task should name its concrete tests, type, boundary, and completion check. The default types are Unit, Integration, and E2E; [configure your own types](../configuration.md#test-types) to preserve project terminology. For the Node adapter, tag each mapped test title with its AC ID and `[Test-type: Unit]`, or the matching configured type.

For a repeatable walkthrough without an agent, copy the prepared artifacts from the source clone:

```sh
node ../cliewen-openspec/scripts/copy-csv-example.mjs plan
npx --no-install openspec validate add-csv-export --type change --strict
```

The helper copies the example proposal, design, tasks, and delta spec into the existing change. It refuses to overwrite a file. The example uses string-valued fields, explicit column names, and CRLF row separators. Review those choices before implementation. If you have already allocated these IDs in another exercise, use a fresh pilot or update every scenario/test reference to your actual allocated IDs.

## 5. Implement and test

After approving the plan, ask your agent to implement the tasks and run each task's tests before proceeding. To use the finished reference implementation instead:

```sh
node ../cliewen-openspec/scripts/copy-csv-example.mjs implementation
node --test test/export.test.mjs
```

The six tagged tests cover headers, explicit column order, commas, quotation marks, line breaks, and an empty record list. Inspect the [CSV code and tests](csv-example.md) to see exactly what they assert. Copying finished files does not exercise an agent or demonstrate TDD.

Once the tests pass and you have reviewed the code and assertions, mark the implementation tasks complete. With the prepared example, the last helper mode checks the expected files and marks its task list complete:

```sh
node ../cliewen-openspec/scripts/copy-csv-example.mjs complete
git add .
git commit -m "Implement CSV export"
```

The helper is for this known reference example, not a general task validator. It checks file contents, not test execution; run the tests yourself first.

## 6. Collect evidence

```sh
node node_modules/cliewen-openspec/adapters/node-test.mjs --change add-csv-export test/export.test.mjs
npx --no-install cliewen-openspec check --change add-csv-export --json
```

The adapter runs every test in the file again and writes an ignored report for the current Git revision, scoped to `add-csv-export`. Failures outside the selected change still block verification. The check should return `"ok": true` and an informational `sufficiency-not-assessed` finding. That finding is expected: you review the assertions; the CLI checks execution and references. If the check fails, use [evidence troubleshooting](../testing/evidence.md#troubleshooting).

The unchanged reference example demonstrates execution evidence. Development source for 0.2 also warns about its missing case tags and quality review records. Those warnings do not block the default review mode. Follow [test quality and lifecycle](../testing/test-quality.md) to add the assessments or disable the individual policies for this exercise. The published 0.1 alpha does not produce these new findings.

## 7. Archive and refresh evidence

After reviewing the change and evidence:

```sh
npx --no-install openspec archive add-csv-export --yes
git add .
git commit -m "Archive CSV export"
node node_modules/cliewen-openspec/adapters/node-test.mjs test/export.test.mjs
npx --no-install cliewen-openspec check --json
```

OpenSpec merges the delta into `openspec/specs/csv-export/spec.md` and moves the change into its archive. Its scenario IDs survive. Archive changes the Git revision, so the previous report becomes stale. The last two commands regenerate evidence and check the permanent specs.

You now have the implementation, tests, permanent behavior specs, and a fresh evidence report. For the next change, allocate new IDs for new scenarios and preserve IDs for existing behavior.
