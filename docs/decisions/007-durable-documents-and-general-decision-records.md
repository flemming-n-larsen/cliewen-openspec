---
type: decision
category: architecture
status: accepted
---
# Keep durable knowledge in lightweight Markdown records

## Context

Teams and solo developers need durable explanations after a change is archived, without recreating a large artifact graph or requiring a document for every routine task. Decisions can concern product, process, and operations as well as architecture.

## Decision

Use Decision Record (DR) as the general term. For new projects, use `type: decision`, an optional category, and the statuses `proposed`, `accepted`, `rejected`, and `superseded`. Human agreement is required for acceptance. Preserve accepted reasoning and maintain links in both directions when one decision supersedes another.

New-project decision filenames use a sequential number with at least three digits, such as `001-short-title.md`. Do not renumber existing records as the sequence grows. Existing conventions take precedence under [the preservation decision](006-preserve-existing-project-authorities-and-paths.md).

Default the durable documentation root to `docs/`, configurable as a whole. Use stable internal locations for architecture, design, decisions, testing, and optional plans; create documents only when useful. Newly authored durable Markdown carries frontmatter identifying its type. Adopt metadata gradually for existing documents and preserve native OpenSpec artifact formats.

Use embedded Mermaid diagrams when they clarify the explanation. Maintain diagrams beside their prose. Keep plans and milestones optional: a ticket system can own priorities and status. Give each fact one authoritative home and link to it rather than copying a backlog into repository plans.

## Consequences

Frontmatter and common locations support discovery without requiring every facility on every change. Feature flags control availability and guidance; they do not delete project content or redefine the selected schema graph. This extends [the shared-base decision](001-shared-base-and-schemas.md).

The alpha includes documentation guidance, a DR template, configurable docs root, and feature flags. Structural metadata checks, Mermaid parsing/render checks, and generalized decision allocation remain planned. The naming convention is guidance, not an implemented allocator.
