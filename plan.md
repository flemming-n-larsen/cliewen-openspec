# Cliewen for OpenSpec — implementation plan

Status: under development. This replaces the earlier configuration-only design.

Implemented alpha: delivery and discovery bundles, `init`, capability-owned AC allocation and prefix changes, `check`, transaction recovery, configurable per-task testing with optional TDD, and the Node test reference adapter. The packed-installation test exercises a real OpenSpec 1.15.0 change through archive, including evidence failure cases. The local CSV pilot also exercised five observed red-to-green cycles and an already-passing boundary case; automated multi-agent evaluation remains planned. See [current evidence contract and limits](docs/testing/evidence.md). The combined all workflow, updates/removal, additional integrations, and structural project-document validators remain future work. The source now includes a navigable documentation site and a deterministic replay of its CSV guide; the Pages workflow builds and checks that site before deploying pushed main commits.

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

Mermaid is the default diagram format when a diagram clarifies the explanation, embedded beside explanatory prose. Prefer ASCII or plain text for file and directory trees and simple sketches, and allow it where Mermaid rendering is unavailable. Maintain one authoritative diagram representation with a short explanation. Validate syntax with a pinned parser and render-test shipped examples; consumer-project diagram validation remains planned. See [the diagram decision](docs/decisions/011-mermaid-and-plain-text-diagrams.md).

Plans are optional. Ticket systems may own priorities, milestones and status. Each fact has one authoritative home. Repo plans add independent content and links, not duplicate task backlogs.

Proposal identifies documentation impact; design considers current decisions; tasks include documentation updates; apply maintains explanations; archive confirms durable records are current. These instructions are advisory, not deterministic enforcement.

## Configuration and evidence

`.cliewen-openspec/config.yaml` exposes boolean features `documentation`, `decisions`, `mermaid`, `planning`, `review`, and `evidence`, all enabled by default. Activation makes facilities available without requiring every document or review on every change. Disable matching guidance/checks without deleting documents. Changes take effect on the next operation. Unknown settings and invalid values fail validation. Installation health always remains checked. Flags do not rewrite the schema artifact graph.

Evidence is central from the first implementation slice. Distinguish linkage, execution results, revision freshness and reviewed sufficiency. Preserve test types and declared positive/negative/boundary coverage. Tags, counts and passing tests cannot prove assertion quality.

Accepted test-type design: default to Unit, Integration, and E2E; project-defined `testing.types` replaces the default set. Preserve existing terminology and require consistency between scenario requirements, task boundaries, and exported evidence rather than assuming one type substitutes for another. Configuration, Node adapter export, and exact scenario/evidence consistency checks are implemented; task boundaries remain subject to review; see [the decision](docs/decisions/003-project-defined-test-types.md). Other accepted choices are indexed in [decisions](docs/decisions/README.md).

Use stable bracketed scenario IDs such as `[EXPORT-003]`. Allocate from persistent high-water marks including retired numbers, never from only surviving scenarios. Reuse an existing project registry through an adapter instead of maintaining a second authority. Detect collisions from parallel allocations. Semantic changes require review, not a purported deterministic semantic checker.

Repository adapters export framework-neutral JSON containing scenario/test identities, execution outcomes and tested revision. Generate mappings from existing test metadata where available; include a reference adapter. Report missing mappings, unknown references, pending scenarios with reasons, failures, skips, manual results, stale results and dirty-worktree evidence separately. Missing setup is not configured, never passed. Pending scenarios support `--fail-on-pending`.

Collect execution evidence during apply and check it before archive. Post-implementation evidence cannot be an existence prerequisite for starting implementation. Discovery findings do not prove unimplemented product behavior. Optional independent review uses fresh context and records findings; no mandatory agent platform or automatic merge policy.

The Node adapter supports `--change NAME`: run all supplied tests, retain only the selected delta's scenario results, and preserve the full runner exit code. Reports declare the selected change; check rejects mismatched scope. Collection without the flag retains all mapped results for compatibility. Scoped reports require a runner exit code. See [the collection contract](docs/testing/evidence.md#collect-evidence-for-one-change).

## Installer and distribution

Implement a TypeScript npm package with `init`, `update`, `check`, `uninstall`, dry-run support and readable/JSON diagnostics. Require initialized OpenSpec; do not install or upgrade it automatically. Use public CLI/configuration, never internal imports. Validate released-version compatibility before claiming support; original research used 1.14.1.

Use the YAML Document API to preserve unrelated settings and comments. Support repository-local Codex, Claude Code, Copilot and Cursor integrations, selected explicitly or detected from OpenSpec skill directories.

Record owned files and exact configuration entries with hashes in `.cliewen-openspec/manifest.json`. Delimit owned context and agent instructions. Check every conflict before writing. Journal originals and new paths; roll back write failures. Subsequent writing commands recover interrupted transactions. Read-only `check` reports leftover journals without modifying files.

Updates replace only unmodified owned content; local modifications conflict unless already identical to the update. Uninstall preserves authored documents. Shipped templates/skills are owned; documents written from templates belong to the project. Never overwrite OpenSpec-generated skills, specs or custom schemas. Normal package operations never commit, push or change repository protections.

## Delivery milestones

1. Establish the public repository, plan, mapping, README, MIT license, and Pages landing page. Initial bootstrap complete.
2. Exercise installation → delivery change → AC identity → test reference → execution evidence → review → archive. The deterministic workflow test is implemented and the local CSV/TDD pilot has run; automated agent-profile regressions remain pending.
3. Publish and maintain the user documentation site alongside alpha development. The initial guide, configuration/CLI references, CSV replay, and site checks are implemented in source; deployment follows a push to main. Do not wait for discovery/all or an npm release. A real fresh-user walkthrough remains useful alongside deterministic and browser checks.
4. Complete the combined all schema, installer safety, optional planning/review, reusable CI, and agent evaluation. Extend and verify the user guides with each shipped capability.
5. Publish npm through a separate release action after a tarball passes installation tests and a fresh user can complete the documented quick start against that exact package.

Project CI supplies test outcomes. Reusable checks validate OpenSpec and evidence against the same clean candidate revision. Required CI checks are explicit opt-in.

## User documentation and GitHub Pages

Publish the user documentation on the existing GitHub Pages site using VitePress with local search and light/dark appearance. Documentation is a product deliverable maintained during implementation, not a final release task. Repository Markdown remains the authoritative content source; render or reuse it rather than maintaining separate copies of the same guidance. Keep existing document paths and published page URLs stable. See [the documentation decision](docs/decisions/010-publish-user-documentation-early.md).

The first site increment must provide clear navigation and a working alpha path covering prerequisites, local tarball installation, OpenSpec initialization, what `init --default` changes, starting a change, and a small CSV example. Explain which actions the CLI performs and which artifacts the coding agent authors. Include the reference prompt, review boundaries, commands, expected outcomes, and what to do when a step fails.

Grow the site to cover:

- Concepts and schema selection: the shared base, delivery, discovery, all, and the single-schema-per-change model.
- Configuration reference: defaults, allowed values, examples, feature opt-outs, capability prefixes, padding, test placement, and TDD. Mark unimplemented settings explicitly as planned.
- End-to-end guides: specs and AC IDs, task-level verification, assertion review, evidence collection, revision freshness, and archive followed by regenerated evidence.
- Durable documentation: Decision Records, frontmatter, embedded Mermaid, optional plans, external tickets, and existing-project conventions and authorities.
- Coding-agent setup and tested compatibility for Claude Code, Codex CLI, and OpenCode. Distinguish intended support from verified integrations and list the tested package/tool versions.
- CLI reference, report formats, troubleshooting, known limitations, upgrade guidance when implemented, and release notes.
- Keep contributor material for deterministic tests, agent evaluation profiles, Harbor trials, costs, and result interpretation in the repository, outside the public site's page set and search index. Decisions and release notes also remain repository documents.

All content uses US English and shows implemented, experimental, and planned functionality accurately. Navigation must work on mobile and with a keyboard. Provide readable code blocks, copyable commands, and a path to configuration, troubleshooting, and release notes from the getting-started guide. Add search when the content volume warrants it. Mermaid rendering and accessible explanatory text are part of the documentation build requirement.

Build and check the site in pull-request CI before deployment, including local links and anchors and supported Mermaid examples. Exercise documented commands against the packed alpha in a clean fixture, including the current lack of an npm release, and check the published site's paths after deployment. A fresh user must be able to complete the quick start without reading this conversation. An implementation is not complete until affected instructions, configuration reference, examples, and limitations are updated.

## Acceptance

The [CSV BOM trial starter](docs/testing/csv-bom-trial/README.md) prepares an isolated baseline, records package/source inputs, and supplies a prompt and review criteria. It supports manual fresh-context trials and replay from a Git bundle. Provider runners, automatic trace capture, repeated profile comparisons, and Harbor integration remain planned.

Add reproducible agent trials alongside deterministic package tests. Use fixed representative profiles for Claude Code, Codex CLI, and OpenCode, and isolated CSV scenario variants for flexible per-task testing, TDD, and end-of-change testing. Trial Harbor with OpenCode Zen/pay-as-you-go before committing to the runner or a subscription. Record model/provider/settings, outcomes, execution traces, cost, and duration; distinguish planning quality from implementation behavior. This suite is planned; see [the evaluation decision](docs/decisions/009-agent-evaluation-profiles-and-initial-provider.md).

Test Windows/Linux installation, repeat init, dry runs, existing config/custom schemas, conflicts, rollback, interrupted transactions, update ordering and uninstall preservation. Install packed tarballs in separate repos.

Validate all schemas and shared-template consistency. Exercise small fixes without new DRs, behavior/architecture changes, rejected/superseded decisions, retirement, discovery-only work, combined delivery and ticket-owned milestones. Verify a fresh agent can find current decisions after archive.

Test toggles without reinstall, legacy docs without frontmatter, invalid metadata, broken links and Mermaid syntax. Verify identity through sync/archive and all evidence states. Keep semantic review findings separate from deterministic results.

Defaults: English content, MIT, no Cliewen runtime, global artifact graph or automatic corpus migration. See [practice mapping](docs/cliewen-mapping.md).
