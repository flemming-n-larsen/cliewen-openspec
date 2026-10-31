---
type: guide
---
# Existing projects and agents

Review the alpha's generated files in a branch or separate pilot before using it in a working project. `init --dry-run` previews changes. Omit `--default` to preserve your existing default schema, and select `cliewen-delivery` explicitly for a trial change.

## Keep existing decisions and IDs

Preserve existing document paths, titles, links, and lifecycle meanings. A project may use files such as `ADR-059-storage.md` and `PDR-074-review-process.md`. Do not rename those files to match the new-project `001-title.md` convention. Existing external links may depend on the exact paths.

If an existing tool owns ID allocation, keep using it. The alpha's native registry is not an adapter for another ledger, and it must not become a second authority for the same IDs. Full ledger, naming, and lifecycle adapters remain planned. You can reference existing decisions while evaluating the delivery instructions in a separate pilot.

Existing documents do not need an immediate frontmatter migration. Use type metadata for newly authored durable documents and preserve the existing project's status vocabulary. Cliewen's proposed/accepted guidance does not automatically translate another method's inferred/verified statuses.

## Coding agents

OpenSpec installs agent integrations. Cliewen installs schemas that those integrations can read. Initialize OpenSpec for your chosen agent and then install Cliewen:

```sh
npx --no-install openspec init
npx --no-install cliewen-openspec init --default
```

Use OpenSpec's setup selection for the agent you run. The reproducible guide uses `--tools none` so it can run without an interactive agent. In the local pilot, `openspec init --tools codex --no-animation` created Codex skills under `.agents/skills/`.

Claude Code, Codex CLI, and OpenCode are the target evaluation profiles. The project has not completed automated trials across all three, their models, and effort settings. The tested package workflow uses OpenSpec 1.15.0 and Node 22/24 on Windows/Linux CI; this does not establish compatibility with every agent configuration.

The schema tells the agent to read `.cliewen-openspec/config.yaml`. Check the generated plan against your settings before implementation. Changing config does not rewrite an already authored tasks file. After changing the npm package, use [update](updating.md) to refresh owned schemas from a supported manifest while preserving project configuration and authored files.
