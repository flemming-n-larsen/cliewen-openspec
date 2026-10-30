---
type: decision
category: process
status: accepted
---
# Publish user documentation on GitHub Pages during development

## Context

The alpha has a Pages landing page and repository guides, but a new user still needs a connected explanation of installation, schema selection, configuration, agent actions, and verification. Leaving that work until release would delay feedback on whether the workflows are understandable.

## Decision

Expand the existing GitHub Pages site into navigable US English user documentation, starting during alpha development. The first increment documents the working delivery path and its limitations; subsequent capabilities update the site as they are implemented. Documentation is part of feature completion and release acceptance.

Keep one authoritative Markdown source for each explanation and reuse it in the site. Preserve existing document addresses. Use VitePress as the documentation foundation, following its use in the local Cliewen and Intent Engineering book projects, with local search and a light/dark appearance switch. Retain the example replay and site checks as part of the build.

## Consequences

Provide task-oriented getting-started guides, configuration and CLI references, evidence troubleshooting, tested compatibility, and release notes. Clearly distinguish implemented behavior from planned features and user workflows from contributor evaluation infrastructure. Build and validate documentation in CI and exercise documented commands against the actual packed package before release.

The current source implements the expanded site, configuration/default checks, local link and Mermaid checks, browser navigation/render checks, and a packed-installation replay of the CSV guide. Deployment follows the Pages workflow on main. Scope and acceptance criteria live in [the implementation plan](../../plan.md#user-documentation-and-github-pages).
