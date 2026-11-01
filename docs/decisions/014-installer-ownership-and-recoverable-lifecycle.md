---
type: decision
category: architecture
status: accepted
---
# Own generated resources and recover failed installation changes

## Context

Projects that install Cliewen must be able to update or remove it without losing their configuration, decisions, specs, or AC identities. File replacement based only on a path or matching package version cannot distinguish generated resources from project-owned work.

The owner approved recording this existing installation contract after the project decision audit. It refines [006: Preserve existing project authorities and document addresses](006-preserve-existing-project-authorities-and-paths.md).

## Decision

Record installer-owned schemas and templates with content hashes in `.cliewen-openspec/manifest.json`. Project configuration, AC registry, authored documents, and active/archived changes remain the adopting project's property. Require an initialized OpenSpec project and use public schema/configuration interfaces; dependency upgrades remain deliberate user actions.

Preflight ownership, path safety, and conflicts before applying resource changes. Update replaces unchanged owned resources and can recognize content already identical to the new package. It never silently adopts unowned files or forces an overwrite of conflicting local edits. Tolerate LF/CRLF conversion when comparing content. Remove retired resources only when ownership and unchanged content are established.

Journal original content before mutations, restore it on failure, and recover an interrupted transaction before a subsequent writing operation. Publish or remove the ownership manifest last. Dry runs and `check` remain read-only and do not perform recovery.

Preserve the selected OpenSpec default unless the user explicitly changes it. Uninstall blocks active changes that use a removed schema and requires an explicit replacement validated through OpenSpec's public CLI when removing the selected default. It does not migrate changes automatically. Remove only unchanged owned resources and their manifest; retain project data and leave npm package removal as a separate operation.

## Consequences and implementation status

The alpha implements ownership/conflict checks, update, uninstall, rollback, and interrupted-transaction recovery. General manifest-version and project-config migrations remain planned. This contract protects adopting projects; it grants no permission to normalize authored document paths or reset identity ledgers.

Detailed commands, conflict cases, and current format limits live in [updating an installation](../guide/updating.md) and [removing installed resources](../guide/uninstalling.md). Maintainer package tests exercise these behaviors in fixtures; project-specific customizations and migration decisions still need review.
