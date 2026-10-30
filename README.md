# Cliewen for OpenSpec

Durable decisions, living documentation, and evidence for OpenSpec.

**Alpha implementation.** Installs `cliewen-delivery` and `cliewen-discovery`, allocates acceptance IDs, and checks real delivery test evidence through OpenSpec archiving. Discovery supports investigation and recommendation without required production implementation. No npm release is published yet.

## Schema collection

- **cliewen-delivery** — recommended workflow for understood changes.
- **cliewen-discovery** — investigation, alternatives and decision handoff.
- **cliewen-all** — planned combined discovery and delivery.

`cliewen-base` names the internal shared foundation used to build these bundles. It is not a separately selectable schema. Discovery remains the workflow for investigation and decision-making.

The shared design covers documentation, Decision Records, Mermaid, optional plans and evidence. Evidence is enabled by default. See the [discovery guide](docs/guide/discovery.md) for investigation, a no-change outcome, and delivery handoff. This alpha supplies documentation/DR guidance; structural metadata and Mermaid validators remain planned.

## Try the alpha locally

Requires Node.js 20.19 or newer and Git. The integration test uses OpenSpec 1.15.0. Windows and Linux CI exercise Node 22 and 24.

In this repository:

```sh
npm ci
npm test
npm pack
```

In a separate project, initialize OpenSpec and install the resulting tarball:

```sh
npm install --save-dev @fission-ai/openspec@1.15.0
npx --no-install openspec init
npm install --save-dev /path/to/cliewen-openspec-0.1.0-alpha.1.tgz
npx --no-install cliewen-openspec init --default
npx --no-install openspec new change add-export --schema cliewen-delivery
```

Register the capability in `.cliewen-openspec/config.yaml`:

```yaml
ac:
  padding: 3
  capabilities:
    export: EXPORT
```

Then allocate its first ID:

```sh
npx --no-install cliewen-openspec ac next --capability export
```

`--default` explicitly selects delivery for future changes. Omit it to preserve the existing schema. `init --dry-run` previews writes. Use the generated ID in scenario headings and test titles; commit the ID registry along with specs.

Configure capability-specific AC prefixes and number padding, and choose test placement in `.cliewen-openspec/config.yaml`. Testing each implementation task before moving on is the default. Use `ac rename-prefix` to change an established prefix without resetting its sequence. See [project configuration](docs/configuration.md) for examples and prefix selection.

Optionally set `testing.approach: tdd` with `testing.placement: per-task` to plan red-green-refactor within every implementation task. The default `flexible` approach allows tests before or after code within the selected placement.

After implementation, commit the project inputs and collect evidence from Node tests:

```sh
node node_modules/cliewen-openspec/adapters/node-test.mjs test/export.test.mjs
npx --no-install cliewen-openspec check --change add-export --json
```

After reviewing the assertions and evidence, archive with OpenSpec. Commit the archived state, regenerate evidence and check permanent specs. See [the evidence guide](docs/testing/evidence.md) for outcomes, pending/manual verification and current limitations.

`npm test` includes an end-to-end example which installs the packed tarball in a temporary repository, creates a real OpenSpec change, runs tagged tests, verifies failure cases, archives the change and checks that the AC ID survives. It cleans up its temporary repository afterward.

## Project documents

- [User guide source](docs/guide/index.md) and [published documentation](https://flemming-n-larsen.github.io/cliewen-openspec/)
- [Decisions](docs/decisions/README.md)
- [Changelog](CHANGELOG.md)
- [Project configuration](docs/configuration.md)
- [Pilot reference prompt](docs/testing/pilot-prompt.md)
- [Implementation plan](plan.md)
- [Practice mapping](docs/cliewen-mapping.md)
- [Alpha architecture](docs/architecture/README.md)
- [Website](https://flemming-n-larsen.github.io/cliewen-openspec/)
- [Credits](CREDITS.md)

Implemented commands: `init`, `ac next`, `ac rename-prefix`, `check` and `recover`. `update` and `uninstall` remain planned; use this alpha only in a repository where you can review the installed files. Tests never establish assertion quality automatically.

## Development checks

`npm test` builds TypeScript and runs unit and packed-installation integration tests. GitHub Actions runs the same suite on Windows and Linux with Node 22 and 24. These checks cover the alpha implementation; documentation semantic accuracy and assertion sufficiency still require review.

Build the documentation with `npm run docs:build` and preview it with `npm run docs:serve`. For browser checks, install Chromium with `npx playwright install chromium`, then run `npm run docs:check`. Documentation tooling uses Node 22.12+ (Node 22 or 24 recommended). See [documentation development](docs/guide/development.md).

## License

[MIT](LICENSE).
