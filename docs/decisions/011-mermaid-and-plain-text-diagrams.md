---
type: decision
category: documentation
status: accepted
---
# Prefer Mermaid for diagrams and plain text for file trees

## Context

Diagrams can explain relationships and flows more clearly than long descriptions. Mermaid keeps diagram source embedded in Markdown, supports review in Git, and renders in GitHub, GitLab, and our documentation site. Plain text is often easier to read for file and directory trees, including in terminals and editors without diagram rendering.

## Decision

Use embedded Mermaid as the default diagram format when a diagram makes an explanation easier to understand. Suitable uses include sequences, state transitions, dependencies, and workflows. Keep a short explanation of the diagram's main point beside it and update both when behavior changes. Do not require a diagram when prose or a table explains the subject clearly.

Use ASCII or plain-text diagrams in fenced `text` blocks when they suit the content better, especially for file and directory trees and small linear sketches. Plain text is also an option when Mermaid rendering is unavailable; it is not restricted to fallback use. Unicode tree characters are allowed where the reading environment supports them.

Maintain one authoritative representation of each diagram. Do not routinely duplicate it in Mermaid and ASCII. Preserve existing project conventions and diagrams when they already communicate the subject well.

## Consequences

Keep `features.mermaid: true` as the default. Disabling it removes Mermaid-specific guidance; plain-text examples remain available without an additional setting or renderer.

The shared guidance reaches delivery, discovery, and combined workflows. It is advisory: the alpha does not validate diagrams in an adopting project's documents. Our own documentation build parses shipped Mermaid examples and browser checks verify rendering; those checks are maintainer tooling, not a validator installed in user projects.

## Related records

This refines the diagram guidance in [durable documentation](007-durable-documents-and-general-decision-records.md) and follows the documentation approach in [the user documentation decision](010-publish-user-documentation-early.md).
