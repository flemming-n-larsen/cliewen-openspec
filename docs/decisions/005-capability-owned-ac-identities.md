---
type: decision
category: architecture
status: accepted
---
# Let capabilities own persistent AC sequences

## Context

A global AC prefix cannot distinguish multiple capabilities. Prefix-local counters alone also make a prefix change appear to create a new sequence, risking reused identities and broken references.

## Decision

Map OpenSpec capability names to unique prefixes through `ac.capabilities`. A capability owns its numeric sequence; its current prefix is a configurable presentation choice. Use a recognizable prefix chosen for the capability rather than deriving one silently from a change title. Number padding defaults to three digits and is configurable.

Allocate through the persistent registry and never reclaim allocated numbers. Use `ac rename-prefix CAPABILITY PREFIX` to update config and registry in one recoverable transaction. After `EXP-017`, changing the current prefix to `EXPORT` yields `EXPORT-018`. Existing scenarios and tests retain their exact IDs. Current and historical prefixes remain reserved to their original capability, including after its config mapping is removed. Retired prefixes cannot allocate new IDs.

## Consequences

Config/registry mismatches block allocation and are reported by `check`. Legacy counters must not be discarded. Commit the registry with the project. The current source implements these rules for its native allocator, but parallel branches still require collision resolution.

An existing project's ID authority takes precedence; adapters must avoid a competing registry, as described in [preserving existing project conventions](006-preserve-existing-project-authorities-and-paths.md). Existing-registry adapters remain planned. See [configuration](../configuration.md#acceptance-criterion-ids) for the alpha's actual supported commands and migration limits.
