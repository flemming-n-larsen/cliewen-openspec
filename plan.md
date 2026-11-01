# Cliewen for OpenSpec: product and implementation plan

Status: alpha under development. The priority order below is approved; feature designs and proposed configuration remain unimplemented unless explicitly described otherwise. Existing accepted decisions remain authoritative until explicitly superseded.

## Product direction

Cliewen for OpenSpec is an ongoing effort to improve spec-driven development using OpenSpec as its engine. It adds practices the author needs in daily work: durable decisions, maintained documentation, and evidence that implementation satisfies acceptance criteria. Custom schemas carry the workflows, with a supporting CLI for installation, identities, and checks.

Keep adoption proportional to the change. Projects should be able to enable stronger checks independently and retain their existing conventions. Evaluate additions by whether they catch real mistakes, reduce repeated work, and help developers understand the result. More artifacts and more tests are not success measures on their own.

## Next priorities

| Order | Increment | Completion evidence |
|---|---|---|
| 1 | Scope an OpenSpec change for test quality and lifecycle | A reviewed proposal distinguishes coverage, assertion effectiveness, and test maintenance, and defines configuration, defaults, exceptions, and acceptance criteria |
| 2 | Trial the design, then implement the smallest useful solution | Cases cover a missing negative test, ineffective assertions, changed behavior, and a retired criterion; findings establish which checks can be automated and which require review |
| 3 | Observe a fresh user completing the guide | A new user completes installation, a delivery change, evidence collection, and archive using the exact documented package; observed obstacles lead to clearer explanations, diagrams, and troubleshooting |
| 4 | Complete release validation | Outstanding required agent trials and compatibility checks pass for a bounded first release; limitations are documented |
| 5 | Add optional project learnings and Humanizer detection | Agents retrieve relevant lessons and retire stale guidance; Humanizer can be detected and installation suggested, with baseline writing guidance available when absent or disabled |
| 6 | Prepare the Cliewen transition and OpenSpec introduction | A capability and migration review identifies what existing users would lose; a verified release, guide, and reproducible example support outreach |

Deliver these as separate changes with explicit acceptance criteria. The first release has a bounded, verified scope; unresolved roadmap items remain labeled as planned. General migrations and additional integrations keep their existing acceptance requirements below.

The immediate next task is the proposal in priority 1. Use the trials in priority 2 to refine its design before implementation. Maintain affected guides with every increment; priority 3 adds observed user testing. Optional learnings and Humanizer detection do not block the first release.

Priority 1 is in progress: the [test quality and lifecycle proposal](openspec/changes/test-quality-and-lifecycle/proposal.md) includes draft requirements, design, and tasks. [Decision 017: Separate test coverage, effectiveness, and lifecycle review](docs/decisions/017-test-quality-and-lifecycle.md) is accepted. Trial execution, detailed design acceptance, and runtime implementation are outstanding.

Bug and idea forms and reporting links are already published. Maintain the feedback path alongside this work; documenting maintainer triage remains outstanding.

The [staged alpha package review](docs/testing/staged-alpha-001.md) records two passing installation workflows against the downloaded `0.1.0-alpha.1` tarball and 57 passing local regression tests. The owner approved publication on November 1, 2026; the public alpha matches the reviewed checksum. Remaining release evaluations are still outstanding.

### Test quality and lifecycle

The alpha links scenarios to execution evidence and supplies assertion-review guidance. The next increment adds independently configurable coverage policy and lifecycle review. Neither OpenSpec artifact validation nor a passing evidence report establishes that assertions test the intended behavior.

Coverage policy should require positive and negative cases where meaningful, plus relevant boundaries. Permit multiple distinct cases for each scenario and coverage category. Let projects configure minimum case counts and justified exceptions; settle exact keys and defaults in the implementation proposal. Counts must use distinct cases, not repeated runs, retries, or duplicate report entries. For example, a CSV scenario might cover ordinary and quoted values, invalid input, and empty input. Review must establish which cases actually belong to that criterion.

Test effectiveness needs observable evidence: demonstrate that a relevant faulty implementation makes the test fail, using a controlled fault, a suitable mutation tool, or a reviewed TDD failure. A syntax error or missing dependency is not evidence that an assertion detects a behavior defect. Record the method and limits; do not require a mutation framework for every project or treat TDD history as proof of assertion quality.

Lifecycle review follows the affected acceptance criteria through code changes. Preserve valid behavior assertions during refactoring, update tests when accepted behavior changes, and remove obsolete assertions when their criterion is explicitly retired. Preserve tests that still protect another active requirement; split or remap them where necessary. A missing ID is a finding to investigate, never authorization to delete a test. Keep retirement reasons and reserved IDs, and preserve historical evidence without treating it as current coverage.

Before shipping, exercise positive/negative coverage, multiple distinct cases, justified exceptions, both policies disabled independently, vacuous assertions, behavior changes, refactoring, partial retirement of a shared test, and full criterion retirement. Combine deterministic validation of records with reviewed agent trials of test meaning.

### Project learnings

Propose an optional `learnings/` directory under the configured documentation root, normally `docs/learnings/`. Create it only when enabled and a useful lesson exists. Reuse an existing project knowledge location where possible.

Keep each lesson short: the situation, observed mistake, evidence or source change, corrective action, scope, and last verification. Distinguish tentative observations from verified guidance. An index should help agents retrieve relevant lessons before planning or changing affected code without loading the entire collection. Review new lessons at change closure, merge duplicates, and retire outdated guidance. Disabling the facility stops its workflow guidance and preserves authored files.

Lessons must not become a second requirements or decision authority. Link to specs and decisions; promote a recurring lesson into the appropriate test, rule, or durable document when useful. Verify retrieval in a fresh agent session and check that an obsolete lesson does not override a current accepted decision.

### Optional Humanizer integration

Propose consumer-project modes for using [Humanizer](https://github.com/blader/humanizer): disabled, automatic, and enabled. Recommend automatic as the default: the agent checks the host's available skills and uses Humanizer when available. Enabled explicitly requests its use; disabled skips detection and installation suggestions. Exact configuration keys remain planned.

If Humanizer is missing in automatic or enabled mode, suggest installation with a link to its source and verified instructions for the current agent host. Make the suggestion once per session, respect a refusal, and continue with the shared writing guidance. Do not install it automatically or block documentation work. If the host cannot expose installed skills, report that detection is unavailable rather than claiming the skill is absent. Verify discovery and invocation separately for each supported host before claiming support.

Apply the skill to prose in everything the agent writes or edits, including OpenSpec proposals, specs, designs, tasks, guides, code comments, docstrings, commit messages, PR descriptions, user-facing messages, and conversational replies. Preserve requirements, code behavior, commands, identifiers, examples, links, and structured data. Verify technical claims after editing. Keep the baseline writing guidance available in every mode. This repository's existing requirement to use Humanizer for user guides remains in effect; see [012: Apply clear writing and diagram guidance across agent-authored text](docs/decisions/012-clear-writing-across-agent-output.md).

All agent-authored text should use natural language and the fewest words that preserve its meaning and required detail, whether Humanizer is available or not. Readers should understand a reference without remembering its ID: write [Decision 002: Distinguish the shared base from selectable workflows](docs/decisions/002-base-and-workflow-names.md), not a standalone "002" or "Decision 002". Preserve exact IDs in machine-readable fields.

Prefer an informative illustration or diagram when it replaces a longer explanation. Add a short caption or accessible text describing the main point; avoid repeating every detail in prose. Use the existing Mermaid and plain-text guidance, and choose a short paragraph or table when clearer. Validate these rules with documentation review, including absent-skill and disabled-skill cases.

### Configuration contract for new facilities

Coverage policy, test lifecycle review, learnings, and external writing skills need separate controls. Their exact keys, defaults, exception format, and interaction with existing evidence and documentation flags remain design work. Document which checks are deterministic and which request agent or human review. Test opt-outs without reinstalling and preserve user-authored files. Do not add speculative settings to the executable [configuration reference](docs/configuration.md); the current parser rejects unknown keys.

### Feedback and community

Provide GitHub Issue Forms for [bug reports](.github/ISSUE_TEMPLATE/bug_report.yml) and [ideas](.github/ISSUE_TEMPLATE/idea.yml), with a blank-issue fallback. Bugs need reproduction steps, expected and actual behavior, and relevant versions; ideas need the user's problem and desired outcome, with a proposed solution optional. Accept documentation problems through the same bug form. Keep required fields few, and avoid requiring a patch or a complete design to participate.

Add direct reporting links to the README and guide. Later, consider page-specific feedback links and reuse the form pattern in other explicitly selected repositories. Triage should distinguish defects, documentation gaps, and proposals; record reproduction or missing information, then link accepted work to its OpenSpec change. Do not promise response times or implementation dates before there is capacity to meet them.

### Cliewen transition and OpenSpec outreach

Recommend concentrating new development on cliewen-openspec while preparing an orderly retirement of cliewen.dev in its current form. Reusing OpenSpec's lifecycle lets this project focus on its added practices, but also makes compatibility and upstream changes an ongoing maintenance responsibility. Greater adoption potential is a hypothesis to test through user trials and feedback.

Before retiring the existing offering, inventory its useful capabilities, users, and inbound links; document what transfers, what remains unavailable, and how existing users can migrate. Keep historical material accessible and preserve URLs or provide specific redirects. Switch the public entry point after the replacement guide and release path are verified. Domain changes, archival, and publication are separate execution tasks.

OpenSpec already lists community schemas in its [customization catalog](https://github.com/Fission-AI/OpenSpec/blob/main/docs/customization.md#community-schemas). Its documented submission route is an issue containing a repository link and a one-line description. Its [schema documentation](https://github.com/Fission-AI/OpenSpec/blob/main/docs-lab/customize/schemas.md#sharing-schemas) describes installation by copying bundles and a registry as future work; recheck this before outreach. These sources were reviewed on November 1, 2026.

Once release acceptance passes, prepare a brief introduction with the three schema purposes, a reproducible example, tested OpenSpec versions, installation instructions, and evidence limits. Ask maintainers about catalog inclusion and the preferred distribution path. Present the project as an independent extension and use feedback to refine it. Contact remains a later task.

## Current implementation

Implemented alpha: delivery, discovery, and combined bundles, `init`, `update` and `uninstall` for supported alpha manifests, capability-owned AC allocation and prefix changes, `check`, transaction recovery, configurable per-task testing with optional TDD recording/completion checks, and the Node test reference adapter. The packed-installation test exercises a real OpenSpec 1.15.0 change through archive, including evidence failure cases. CSV pilots and native CLI trials provide reviewed observations; repeated release coverage remains pending under [the evaluation plan](docs/testing/agent-evaluation.md). [013: Enforce TDD for behavior changes with explicit task exceptions](docs/decisions/013-tdd-enforcement-and-task-exceptions.md) now has a local command/file-history completion check; write blocking remains planned. See [current evidence contract and limits](docs/testing/evidence.md). General version/config migrations, additional integrations, and structural project-document validators remain future work. The source now includes a navigable documentation site and a deterministic replay of its CSV guide; the Pages workflow builds and checks that site before deploying pushed main commits.

## Product and schemas

Deliver a small OpenSpec schema collection with a shared base, compatible with Intent Engineering. Release scope follows the priorities and acceptance evidence in this plan.

| Schema | Purpose |
|---|---|
| cliewen-delivery | Recommended workflow for an understood change, implementation and evidence |
| cliewen-discovery | Investigation, alternatives, experiments and decision handoff; may end without production implementation |
| cliewen-all | Discovery followed by delivery, consolidating overlapping steps |

Build standalone schema bundles from shared definitions and templates. OpenSpec does not compose schemas at runtime. Version and test the base and schemas together. Preserve existing schema selection unless explicitly changed. OpenSpec continues to own behavioral specs, implementation tasks, synchronization and archive.

The combined bundle uses proposal → investigation → decision → specs → tasks. Decision also owns the chosen design. Its frontmatter declares delivery, no-change, or further-investigation and proposed/accepted status. Delivery requires human agreement before implementation; the checker validates accepted status but cannot prove who approved it. No-delivery outcomes require native skip_specs: true and no Markdown product deltas, with tasks limited to real closure work. This preserves a fixed graph without artificial product requirements.

The durable contract is [015: Keep combined investigation and delivery behind explicit agreement](docs/decisions/015-combined-workflow-and-approval-boundaries.md), including unassigned draft IDs and the separate archive authorization.

## Shared base

Name the internal shared foundation `cliewen-base`. It supplies common definitions, templates, documentation conventions, decisions, AC identities, evidence, and configuration to the standalone bundles. It is not a user-selectable schema or a replacement name for `cliewen-discovery`. See [the naming decision](docs/decisions/002-base-and-workflow-names.md).

Default documentation root: `docs/`, configurable as a whole. Fixed internal locations: `README.md`, optional `vision.md`, `goals.md`, `constraints.md`, and `architecture/`, `design/`, `decisions/`, `testing/`, `plans/`. Optional learnings are proposed above. Create documents only when needed. Installation never invents project intent or moves existing documents.

New durable documents carry YAML frontmatter with nonempty `type`; custom types are allowed. Existing documents adopt metadata gradually. OpenSpec artifacts retain native formatting.

Decision Records use `type: decision`, optional `category` and required `status`: proposed, accepted, rejected or superseded. Categories include architecture, product, process and operations. Acceptance requires human agreement. Preserve accepted reasoning; replacements link both ways and update the earlier status. Agent-inferred intent remains unconfirmed.

For new projects, name new decision files `NNN-short-title.md`, starting with `001`. Use at least three digits and let the sequence grow without truncation. Existing projects retain their naming conventions and ID authority. Never rename, move, or renumber existing document files to normalize names, titles, categories, or padding: external links may depend on their exact paths. Update content and metadata in place.

Mermaid is the default diagram format when a diagram clarifies the explanation, embedded beside explanatory prose. Prefer ASCII or plain text for file and directory trees and simple sketches, and allow it where Mermaid rendering is unavailable. Maintain one authoritative diagram representation with a short explanation. Validate syntax with a pinned parser and render-test shipped examples; consumer-project diagram validation remains planned. See [the diagram decision](docs/decisions/011-mermaid-and-plain-text-diagrams.md).

Plans are optional. Ticket systems may own priorities, milestones and status. Each fact has one authoritative home. Repo plans add independent content and links, not duplicate task backlogs.

Proposal identifies documentation impact; design considers current decisions; tasks include documentation updates; apply maintains explanations; archive confirms durable records are current. These instructions are advisory, not deterministic enforcement.

## Configuration and evidence

`.cliewen-openspec/config.yaml` exposes boolean features `documentation`, `decisions`, `mermaid`, `planning`, `review`, and `evidence`, all enabled by default. Activation makes facilities available without requiring every document or review on every change. Disable matching guidance/checks without deleting documents. Changes take effect on the next operation. Unknown settings and invalid values fail validation. Installation health always remains checked. Flags do not rewrite the schema artifact graph.

Evidence is central from the first implementation slice. Distinguish linkage, execution results, revision freshness and reviewed sufficiency. Preserve test types and declared positive/negative/boundary coverage. Tags, counts and passing tests cannot prove assertion quality.

With `testing.approach: tdd`, each delivery task declares its verification method, exact command, and explicit file boundary in tasks.md. `tdd start` and `tdd run` capture local command outcomes and file snapshots; `check --change` blocks incomplete, missing, stale, or inconsistent history even when product evidence is disabled. Alternative methods need reviewed reasons. Flexible remains the default. The recorder does not control all writes, authenticate history, or decide assertion quality; see [the user-project format and limits](docs/configuration.md#test-driven-development).

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

[014: Own generated resources and recover failed installation changes](docs/decisions/014-installer-ownership-and-recoverable-lifecycle.md) records the ownership, recovery, and default-preservation contract for adopting projects.

## Delivery milestones

1. Establish the public repository, plan, mapping, README, MIT license, and Pages landing page. Initial bootstrap complete.
2. Exercise installation → delivery change → AC identity → test reference → execution evidence → review → archive. Deterministic workflow tests, local CSV pilots, and native CLI trials are implemented; repeated release-profile coverage remains incomplete.
3. Publish and maintain the user documentation site alongside alpha development. The initial guide, configuration/CLI references, CSV replay, and site checks are implemented in source; deployment follows a push to main. Do not wait for discovery/all or an npm release. A real fresh-user walkthrough remains useful alongside deterministic and browser checks.
4. Complete future version/config migrations, optional planning/review, reusable CI, and agent evaluation. Extend and verify the user guides with each shipped capability.
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

Make the guide useful at two depths: a short route to the first verified change and linked explanations for readers customizing the workflow. Show expected output and recovery beside commands. Explain what each command changes, which defaults apply, and which actions need review. Include worked examples of a missing negative case, an ineffective assertion, changed behavior, and a retired criterion as those facilities ship. Use Humanizer for guide prose and verify commands after editing. Observe a fresh developer using the guide and record where they get stuck; visual polish alone does not establish usability.

Build and check the site in pull-request CI before deployment, including local links and anchors and supported Mermaid examples. Exercise documented commands against the packed alpha in a clean fixture and verify installation of the explicit published npm version. Check the published site's paths after deployment. A fresh user must be able to complete the quick start without reading this conversation. An implementation is not complete until affected instructions, configuration reference, examples, and limitations are updated.

## Acceptance

The [schema-wide agent evaluation plan](docs/testing/agent-evaluation.md) and [coverage manifest](docs/testing/agent-evaluation.yaml) define development scenarios, release profiles, variants, and review gates for every schema. CI checks that installed schemas have ready development scenarios and valid source references. The three CLI profiles are pinned; additional release variants and repeated coverage remain pending. Plan validation does not execute or certify agent evaluations.

OpenCode V2 uses its own 2.2.5 profile and native standalone/policy adapter; historical V1 profiles remain retained. Instruction regressions cover early allocation, documentation claims, measurement validity, and final-revision evidence. The [TDD completion-check trials](docs/testing/cli-trials/result-007.md) reject an invalid combined sequence and record a valid delivery sequence with clean final evidence. The combined attempt was interrupted by a provider error and time limit; delivery still failed the pilot's apply-instruction retrieval requirement. Neither is an overall passing release trial. Repeat those cases and the remaining required coverage before release acceptance. These semantic/process reviews remain separate from deterministic CLI checks.

The [CSV BOM trial starter](docs/testing/csv-bom-trial/README.md) prepares an isolated baseline, records package/source inputs, and supplies a prompt and review criteria. The [CLI trial runner](docs/testing/cli-evaluation.md) prepares matching copies across three profiles and captures raw events, arguments, timing, and exposed usage. Independent checkers and rubric review assess the results. Repeated release comparisons and Harbor integration remain planned.

The [CSV discovery trial starter](docs/testing/csv-discovery-trial/README.md) reuses that baseline for a streaming investigation without product changes. Its prompt defines local experiment limits and requires a proposed recommendation; its checker verifies baseline preservation, artifact status, saved instructions, and discovery health. Evidence quality and recommendation sufficiency remain manual review tasks.

Use reproducible agent trials alongside deterministic package tests. The CLI runner covers the primary scenarios for Claude Code, Codex CLI, and OpenCode; CSV variants for flexible per-task testing and end-of-change testing remain planned. Trial Harbor with OpenCode Zen/pay-as-you-go before adopting Harbor or buying a subscription. Record model/provider/settings, outcomes, execution traces, cost, and duration; distinguish planning quality from implementation behavior. See [the evaluation decision](docs/decisions/009-agent-evaluation-profiles-and-initial-provider.md).

Test Windows/Linux installation, repeat init, dry runs, existing config/custom schemas, conflicts, rollback, interrupted transactions, update ordering and uninstall preservation. Install packed tarballs in separate repos.

Validate all schemas and shared-template consistency. Exercise small fixes without new DRs, behavior/architecture changes, rejected/superseded decisions, retirement, discovery-only work, combined delivery and ticket-owned milestones. Verify a fresh agent can find current decisions after archive.

Test toggles without reinstall, legacy docs without frontmatter, invalid metadata, broken links and Mermaid syntax. Verify identity through sync/archive and all evidence states. Keep semantic review findings separate from deterministic results.

Defaults: English content, MIT, no Cliewen runtime, global artifact graph or automatic corpus migration. See [practice mapping](docs/cliewen-mapping.md).
