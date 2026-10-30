---
type: decision
category: process
status: accepted
---
# Apply clear writing and diagram guidance across agent-authored text

## Context

Agent-authored text often becomes long, overly technical, or dependent on unexplained references. Readers need to understand a change without reading the conversation that produced it. This applies to proposals and pull-request descriptions as well as documentation files.

## Decision

Apply the same writing and diagram guidance to all text an agent creates or edits: plain-text files, Markdown, proposals, specs, tasks, code comments, docstrings, commit messages, pull-request descriptions, user-facing messages, and conversational replies. The rules apply throughout the workflow, beyond the documentation directory or a particular artifact.

Lead change descriptions with the problem, resulting behavior, and practical impact. Use plain language and concrete examples. Explain unfamiliar terms and include technical details where they help explain behavior, constraints, risks, or tradeoffs. Give references descriptive link labels, such as "ADR-025: Keep exports synchronous", and explain their relevance when needed.

Keep the main explanation brief, state each fact once, and link to supporting detail. Remove filler and repetition while preserving requirements, acceptance criteria, important exceptions, and required artifact sections. Preserve machine-readable syntax and exact identifiers. Include relevant validation and limitations in pull-request descriptions. Review clarity and brevity before finishing; do not impose fixed word limits.

Apply [011: Prefer Mermaid for diagrams and plain text for file trees](011-mermaid-and-plain-text-diagrams.md) across the same scope, including pull-request descriptions. Use diagrams when they improve understanding and plain text where it suits the content or rendering environment better.

## Consequences

Adapt the rules to the reader and format. Code comments explain intent, constraints, or surprising behavior instead of restating the code. Commit messages summarize the concrete change, with rationale or consequences in the body when useful. Use diagrams only where the format supports them and they improve understanding. Preserve code behavior, structured data, required syntax, and exact identifiers.

Repository agent instructions and every delivery artifact instruction share this guidance, including the implementation stage. The workflow guide explains it to users. Humanizer remains required for this repository's user guides; consumers do not need that skill to receive the schema's writing guidance.

Schema instructions guide agents while they use the workflow. They do not enforce writing quality or automatically govern unrelated agent sessions or external PR tools. Disabling a documentation facility does not disable the general writing rules; Mermaid-specific guidance still respects its feature flag.
