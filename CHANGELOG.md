# Changelog

Notable changes to Cliewen for OpenSpec are documented here. Version 0.1 is under development; the current package version is `0.1.0-alpha.1` and has not been published to npm.

## 0.1 — Unreleased

### Added

- A schema-wide agent evaluation plan and coverage manifest, distinguishing observed collaboration trials from unconfigured CLI release profiles. `npm run eval:check` and CI check coverage of installed schemas without starting agents or claiming release readiness.

- A CSV streaming discovery trial starter, bounded investigation prompt, review criteria, and independent checks for unchanged product inputs and proposed recommendations. Run `npm run trial:discovery` to prepare a fresh baseline.

- The `cliewen-discovery` schema with proposal, investigation, and decision artifacts. It supports no-change outcomes and separate delivery handoff, shares writing/diagram guidance, and keeps investigation findings distinct from product evidence. Init installs both schemas while preserving the default unless delivery is explicitly selected.

- `--change NAME` on the Node test adapter scopes evidence results while running all supplied tests and preserving failures across the full run. Reports declare the change scope; `check` rejects mismatched scope and requires a runner exit code for scoped reports. Collection without the flag remains supported.

- A fresh-context CSV BOM trial starter with an isolated six-scenario baseline, packed-package hash, Git bundle, reference prompt, and review criteria. Run `npm run trial:prepare` from a source checkout to prepare a trial.

- Configurable test types with Unit, Integration, and E2E defaults. The Node adapter exports explicit test-type tags, and evidence checks reject missing, unknown, or mismatched scenario/result types. Existing reports without types must be regenerated from explicitly tagged tests.

- A VitePress user guide on GitHub Pages with local search, a light/dark appearance switch, and embedded Mermaid. It covers the first delivery change, defaults, supported configuration fields, CLI commands, evidence troubleshooting, and existing-project conventions. The build checks local links, anchors, configuration defaults, and Mermaid syntax; browser checks cover search, appearance, rendering, and navigation. A packed-installation test replays the guide's CSV consumer commands through archive and refreshed evidence.
- Optional TDD guidance in task planning and implementation through `testing.approach: tdd`. The default is `flexible`; TDD requires per-task testing and instructs agents to observe the expected test failure before implementation, reach green, and refactor.
- The `cliewen-delivery` schema with proposal, specs, design, and tasks artifacts.
- Shared guidance for living documentation, Decision Records, embedded Mermaid diagrams, optional planning, review, and behavioral evidence.
- Project configuration with feature flags, a configurable documentation root, and evidence report location.
- The `init` command with dry-run previews, explicit default-schema selection, installation hashes, conflict detection, and recoverable file writes.
- Capability-specific AC prefixes and configurable number padding, backed by a committed allocation registry.
- The `ac next --capability NAME` and `ac rename-prefix CAPABILITY PREFIX` commands. Prefix changes preserve the capability's numeric sequence, existing IDs, and reserved historical prefixes.
- Validation of AC registry/config mismatches and migration of legacy alpha prefix counters without discarding reserved numbers.
- Configurable test placement, defaulting to testing and fixing each implementation task before continuing. Final regression testing and evidence collection remain part of the workflow.
- A reference Node test adapter that records tagged test results, runner exit status, and the tested Git revision.
- Evidence checks for scenario linkage, missing and duplicate references, failed or skipped tests, pending/manual results, stale revisions, and dirty working trees.
- Windows and Linux CI, a packed-installation workflow test through OpenSpec archiving, configuration documentation, and a CSV pilot reference prompt.
- A public documentation site on GitHub Pages and an MIT license.

### Fixed

- Repository path validation now rejects Windows drive-relative paths that could escape the project root.
- Installation comparisons and hashes tolerate Git converting LF line endings to CRLF during checkout.

### Current limitations

- `cliewen-all`, `update`, and `uninstall` remain planned.
- Documentation metadata and Mermaid validators are not implemented. Test placement is agent guidance rather than CLI-enforced execution ordering.
- AC allocation supports sequential work; parallel branches require collision resolution.
- Evidence linkage and execution results do not establish assertion quality. Reviewed sufficiency still requires human judgment.
