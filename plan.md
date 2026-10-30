# Cliewen for OpenSpec — implementation plan

Status: under development. This replaces the earlier configuration-only design.

Implemented alpha: delivery bundle, `init`, persistent AC allocation, `check`, transaction recovery and the Node test reference adapter. The packed-installation test exercises a real OpenSpec 1.15.0 change through archive, including evidence failure cases. See [current evidence contract and limits](docs/testing/evidence.md). Discovery/all, updates/removal, additional integrations and structural document validators remain future work.

## Product and schemas

Deliver a small OpenSpec schema collection with a shared base, compatible with Intent Engineering. All facilities ship in the first release; implementation stages are internal milestones.

| Schema | Purpose |
|---|---|
| cliewen-delivery | Recommended workflow for an understood change, implementation and evidence |
| cliewen-discovery | Investigation, alternatives, experiments and decision handoff; may end without production implementation |
| cliewen-all | Discovery followed by delivery, consolidating overlapping steps |

Build standalone schema bundles from shared definitions and templates. OpenSpec does not compose schemas at runtime. Version and test the base and schemas together. Preserve existing schema selection unless explicitly changed. OpenSpec continues to own behavioral specs, implementation tasks, synchronization and archive.

## Shared base

Name the internal shared foundation `cliewen-base`. It supplies common definitions, templates, documentation conventions, decisions, AC identities, evidence, and configuration to the standalone bundles. It is not a user-selectable schema or a replacement name for `cliewen-discovery`. See [the naming decision](docs/decisions/002-base-and-workflow-names.md).

Default documentation root: `docs/`, configurable as a whole. Fixed internal locations: `README.md`, optional `vision.md`, `goals.md`, `constraints.md`, and `architecture/`, `design/`, `decisions/`, `testing/`, `plans/`. Create documents only when needed. Installation never invents project intent or moves existing documents.

New durable documents carry YAML frontmatter with nonempty `type`; custom types are allowed. Existing documents adopt metadata gradually. OpenSpec artifacts retain native formatting.

Decision Records use `type: decision`, optional `category` and required `status`: proposed, accepted, rejected or superseded. Categories include architecture, product, process and operations. Acceptance requires human agreement. Preserve accepted reasoning; replacements link both ways and update the earlier status. Agent-inferred intent remains unconfirmed.

For new projects, name new decision files `NNN-short-title.md`, starting with `001`. Use at least three digits and let the sequence grow without truncation. Existing projects retain their naming conventions and ID authority. Never rename, move, or renumber existing document files to normalize names, titles, categories, or padding: external links may depend on their exact paths. Update content and metadata in place.

Mermaid is the default diagram format, embedded beside explanatory prose. Maintain diagrams with text; validate syntax with a pinned parser and render-test shipped examples. Other formats remain available where appropriate.

Plans are optional. Ticket systems may own priorities, milestones and status. Each fact has one authoritative home. Repo plans add independent content and links, not duplicate task backlogs.

Proposal identifies documentation impact; design considers current decisions; tasks include documentation updates; apply maintains explanations; archive confirms durable records are current. These instructions are advisory, not deterministic enforcement.

## Configuration and evidence

`.cliewen-openspec/config.yaml` exposes boolean features `documentation`, `decisions`, `mermaid`, `planning`, `review`, and `evidence`, all enabled by default. Activation makes facilities available without requiring every document or review on every change. Disable matching guidance/checks without deleting documents. Changes take effect on the next operation. Unknown settings and invalid values fail validation. Installation health always remains checked. Flags do not rewrite the schema artifact graph.

Evidence is central from the first implementation slice. Distinguish linkage, execution results, revision freshness and reviewed sufficiency. Preserve test types and declared positive/negative/boundary coverage. Tags, counts and passing tests cannot prove assertion quality.

Accepted test-type design: default to Unit, Integration, and E2E; project-defined `testing.types` replaces the default set. Preserve existing terminology and require consistency between scenario requirements, task boundaries, and exported evidence rather than assuming one type substitutes for another. Configuration and validation for this remain planned; see [the decision](docs/decisions/003-project-defined-test-types.md). Other accepted choices are indexed in [decisions](docs/decisions/README.md).

Use stable bracketed scenario IDs such as `[EXPORT-003]`. Allocate from persistent high-water marks including retired numbers, never from only surviving scenarios. Reuse an existing project registry through an adapter instead of maintaining a second authority. Detect collisions from parallel allocations. Semantic changes require review, not a purported deterministic semantic checker.

Repository adapters export framework-neutral JSON containing scenario/test identities, execution outcomes and tested revision. Generate mappings from existing test metadata where available; include a reference adapter. Report missing mappings, unknown references, pending scenarios with reasons, failures, skips, manual results, stale results and dirty-worktree evidence separately. Missing setup is not configured, never passed. Pending scenarios support `--fail-on-pending`.

Collect execution evidence during apply and check it before archive. Post-implementation evidence cannot be an existence prerequisite for starting implementation. Discovery findings do not prove unimplemented product behavior. Optional independent review uses fresh context and records findings; no mandatory agent platform or automatic merge policy.

## Installer and distribution

Implement a TypeScript npm package with `init`, `update`, `check`, `uninstall`, dry-run support and readable/JSON diagnostics. Require initialized OpenSpec; do not install or upgrade it automatically. Use public CLI/configuration, never internal imports. Validate released-version compatibility before claiming support; original research used 1.14.1.

Use the YAML Document API to preserve unrelated settings and comments. Support repository-local Codex, Claude Code, Copilot and Cursor integrations, selected explicitly or detected from OpenSpec skill directories.

Record owned files and exact configuration entries with hashes in `.cliewen-openspec/manifest.json`. Delimit owned context and agent instructions. Check every conflict before writing. Journal originals and new paths; roll back write failures. Subsequent writing commands recover interrupted transactions. Read-only `check` reports leftover journals without modifying files.

Updates replace only unmodified owned content; local modifications conflict unless already identical to the update. Uninstall preserves authored documents. Shipped templates/skills are owned; documents written from templates belong to the project. Never overwrite OpenSpec-generated skills, specs or custom schemas. Normal package operations never commit, push or change repository protections.

## Delivery milestones

1. Publish this plan, mapping, README, MIT license and development-status Pages site at `flemming-n-larsen/cliewen-openspec`.
2. Exercise installation → delivery change → AC identity → test reference → execution evidence → review → archive. Integrate docs and DR maintenance early.
3. Complete shared definitions, discovery/all schemas, installer safety, optional planning/review and reusable CI before the first complete release.
4. Publish npm through a separate release action after a tarball passes installation tests.

Project CI supplies test outcomes. Reusable checks validate OpenSpec and evidence against the same clean candidate revision. Required CI checks are explicit opt-in.

## Acceptance

Test Windows/Linux installation, repeat init, dry runs, existing config/custom schemas, conflicts, rollback, interrupted transactions, update ordering and uninstall preservation. Install packed tarballs in separate repos.

Validate all schemas and shared-template consistency. Exercise small fixes without new DRs, behavior/architecture changes, rejected/superseded decisions, retirement, discovery-only work, combined delivery and ticket-owned milestones. Verify a fresh agent can find current decisions after archive.

Test toggles without reinstall, legacy docs without frontmatter, invalid metadata, broken links and Mermaid syntax. Verify identity through sync/archive and all evidence states. Keep semantic review findings separate from deterministic results.

Defaults: English content, MIT, no Cliewen runtime, global artifact graph or automatic corpus migration. See [practice mapping](docs/cliewen-mapping.md).
