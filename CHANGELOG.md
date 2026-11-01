# Changelog

Changes that matter to projects using Cliewen for OpenSpec.

## 0.1.0-alpha.1 (2026-11-01)

The first public alpha is available on npm as `cliewen-openspec@0.1.0-alpha.1`, with the `alpha` tag. The full 0.1 release is still under development. Follow the [installation guide](docs/guide/getting-started.md) to try it.

### OpenSpec workflows

Choose from three schemas, which define the documents and instructions for a change:

- `cliewen-delivery` takes an understood change through a proposal, behavior specifications, design, implementation tasks, and verification.
- `cliewen-discovery` helps investigate a question and recommend what to do next. The recommendation can be to make no change.
- `cliewen-all` combines investigation and delivery. It calls for human agreement before implementation and also supports ending an investigation without changing the product.

All three include guidance for maintaining documentation, recording durable decisions, writing clearly, and using diagrams where helpful. OpenSpec manages the change files and incorporates completed changes into the project's specifications when they are archived.

### Installation and project settings

- `init` installs the schemas and supporting resources. Preview changes before writing files, and keep your existing default schema unless you explicitly select a replacement.
- `update` refreshes resources installed by Cliewen. It preserves project settings and authored documents, and stops if local edits conflict with the update. Updates support recognized alpha installations; general version migrations are not available yet.
- `uninstall` removes unchanged resources installed by Cliewen while preserving project documents and data. Resolve active changes using those schemas first, and select a replacement if removing the default schema. Removing the npm package is a separate step.
- Installation commands support previews and recovery after interrupted writes. Path checks keep managed files inside the project, and file comparisons tolerate Windows line-ending conversion.
- Project settings let you choose the documentation directory, test workflow, and evidence report location. You can turn individual facilities on or off without deleting authored documents.

See the [configuration reference](docs/configuration.md) and [CLI guide](docs/guide/cli.md) for defaults and commands.

### Acceptance criteria and tests

- Give behavior scenarios stable acceptance criterion IDs so specifications, tests, and results can refer to the same requirement. Choose a prefix for each capability, such as `EXP-001` for an export feature. Allocate IDs and rename prefixes without reusing reserved numbers or losing historical references.
- Use the default Unit, Integration, and E2E test types, or define your own. Checks require the type declared by a scenario to match its test results.
- Test each implementation task as you go, or configure testing at the end of a change. The default allows tests before or after code.
- Optionally select test-driven development (TDD). The `tdd start` and `tdd run` commands record test commands, outcomes, and snapshots of declared files. Completion checks reject missing, stale, or inconsistent records. Tasks using another verification method need a reason.

### Test results before archive

The Node test adapter runs tagged tests and records which scenarios they cover, whether they passed, and the Git revision tested. You can collect results for one change while retaining the exit status of the entire test run, so failures elsewhere in that run remain visible.

Before archive, `check` reports missing or duplicate references, mismatched test types, failed or skipped tests, pending work, and manual verification. It also checks that results belong to the current committed revision and that the working tree is clean. A later commit requires fresh results, including when only documentation changed.

See the [evidence guide](docs/testing/evidence.md) for collection commands and help resolving findings.

### Guide and examples

The [user guide](docs/guide/index.md) covers installation, schema selection, existing projects, configuration, and troubleshooting. A worked CSV example takes a change through implementation, test results, and archive. The documentation site includes search, light and dark appearance, and diagrams.

### Current limitations

- Passing checks establish test execution, references, and revision freshness. You still need to review whether the assertions prove the intended behavior. Configurable case coverage and test lifecycle checks are not implemented.
- TDD records check the declared command and file history. They cannot prove why a test failed, prevent every code write, or authenticate the recorded history. Ordinary task-by-task testing remains agent guidance.
- Discovery findings and combined-workflow approval fields require review. A recorded status cannot prove that a person approved the change.
- Documentation and diagram guidance does not validate your project's document metadata or diagram syntax.
- Acceptance ID allocation supports sequential work. Parallel branches may allocate the same number and need conflict resolution.
- Release validation across the supported coding agents is still incomplete. Treat the package as an alpha; review its output before relying on it.
