---
type: decision
category: architecture
status: accepted
---
# Keep combined investigation and delivery behind explicit agreement

## Context

An adopting project may want to investigate a question and deliver the resulting change without duplicating proposals or changing schemas. Completing planning files cannot authorize implementation, and an investigation may legitimately end without product changes.

The owner approved recording this existing combined-workflow contract after the project decision audit. It refines [001: Share project knowledge across a small schema collection](001-shared-base-and-schemas.md) and applies [005: Let capabilities own persistent AC sequences](005-capability-owned-ac-identities.md).

## Decision

Use one `cliewen-all` change with the fixed graph proposal → investigation → decision → specs → tasks. The decision holds both the outcome and chosen design; do not add a separate `design.md` or a second proposal. Link investigation findings and any warranted durable record rather than copying explanations.

The decision declares `type: decision`, `status: proposed` or `accepted`, and `outcome: delivery`, `no-change`, or `further-investigation`. While awaiting real agreement, preserve product inputs, capability mappings, and the AC registry. Draft specs/tasks leave new IDs unassigned. An early allocation is an error to report; do not hide it by resetting counters. Record the actual agreement source before accepted status. Existing authorization may be reused when it covers the reviewed scope, with its provenance stated accurately.

For delivery, keep native `skip_specs` absent or false. After agreement, allocate IDs through the project's authority, write real behavior deltas and task-level verification, implement, and collect evidence under [008: Treat evidence as core without overstating what it proves](008-evidence-is-core-and-has-explicit-limits.md).

For no change or further investigation, set native `skip_specs: true`, retain the recommendation and reopening conditions, and use tasks only for real closure work. Do not invent product specs, acceptance IDs, implementation tasks, or product test evidence to complete the graph. Feature flags do not rewrite artifact dependencies.

Implementation agreement and a passing check do not authorize archive, push, or an external pull request. Follow the scope actually granted; archive requires its own authorization.

## Consequences and implementation status

The alpha installs this graph and checks decision metadata, outcome consistency, accepted status for delivery, and configured evidence. No-delivery checks inspect the skip marker, absence of product deltas, installation, and registry health. Instructions supply the approval boundary from the first artifact onward.

The allocator does not enforce change approval, and the checker cannot prove that a human agreed or that closure tasks and research are sound. An accepted field alone is insufficient. Adopting projects must review the actual source of agreement and relevant execution history. Optional TDD completion checks now assess captured commands and declared-file sequences under [013: Enforce TDD for behavior changes with explicit task exceptions](013-tdd-enforcement-and-task-exceptions.md); they do not authenticate human agreement or control all writes.

The [combined workflow guide](../guide/all.md) explains user commands and defaults. Maintainer agent trials assess instruction behavior; they do not approve work in an adopting project.
