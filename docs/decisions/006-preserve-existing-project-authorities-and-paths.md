---
type: decision
category: architecture
status: accepted
---
# Preserve existing project authorities and document addresses

## Context

Existing projects may already use typed decision series, ID ledgers, approval lifecycles, and external links to document paths. Normalizing their filenames or creating another allocator can break references or change accepted meaning.

## Decision

Preserve existing document filenames, paths, IDs, and lifecycle semantics. Never rename, move, or renumber existing documents merely to normalize titles, categories, prefixes, or padding. Change content and metadata in place. New-project defaults do not authorize migration of an existing corpus.

Read the project's naming and allocation rules before creating records. Preserve series such as ADR, PDR, and IDR and determine whether counters are separate or shared. Use an existing ledger or allocation tool as the authority rather than creating a competing counter. Do not automatically reinterpret existing statuses such as `inferred` and `verified` as `proposed` and `accepted`.

## Consequences

Brownfield support needs explicit adapters or reference-only use where a separate method owns decisions and identities. Full naming, lifecycle, and ledger adaptation remain planned; the alpha supplies preservation guidance rather than claiming those integrations exist.

The owner explicitly authorized changing this repository's first two decision filenames to three digits. That local exception grants no general permission to rename existing documents. See [new-project defaults](007-durable-documents-and-general-decision-records.md).

[014: Own generated resources and recover failed installation changes](014-installer-ownership-and-recoverable-lifecycle.md) defines the installer's limited ownership of generated resources and its preservation of authored project data during updates and removal.
