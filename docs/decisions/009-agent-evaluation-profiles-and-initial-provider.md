---
type: decision
category: process
status: accepted
---
# Evaluate fixed agent profiles and start with OpenCode pay-as-you-go

## Context

Schema instructions must work across coding agents, models, and reasoning settings. A manually exercised pilot provides useful feedback but is not a reproducible regression suite. Exhaustively testing every combination would make routine development expensive and slow.

## Decision

Keep deterministic package tests separate from agent evaluations. Maintain shared scenarios, initial repositories, prompts, and outcome criteria. Each agent trial starts in an isolated clean environment and records the exact package, agent version, model, provider, reasoning settings, effective instructions, permissions, and execution budget.

Use a small set of representative profiles for Claude Code, Codex CLI, and OpenCode rather than a full Cartesian product. Run focused evaluations during development and broaden coverage for schema changes and releases. Repeat release trials and report the full outcomes rather than selecting only a successful attempt. Technical failures and task failures remain distinct. Compare model or effort changes against an existing baseline while holding other dimensions fixed.

Give a changed CLI version, model, provider, or effort a distinct profile identity and retain earlier attempts. State whether each budget is a hard limit or a local stop based on delayed usage reports; a local reported-cost stop is not a provider spending guarantee.

Evaluate planning artifacts and implementation separately. Check artifact properties rather than exact prose. Use independent acceptance tests for the resulting implementation. TDD evaluation requires observed test executions and relevant file changes, not only the agent's completion narrative or a final green report.

Try Harbor as the first runner candidate because it has integrations for the three agents. Start the provider trial with OpenCode Zen/pay-as-you-go, a named model, fixed settings, and a low explicit spending limit. Measure actual cost and duration per scenario before considering an OpenCode Go subscription. Add OpenRouter if broader model selection or provider controls become necessary; a regression profile using it must constrain provider routing and disable fallbacks.

## Consequences

Harbor is evaluation infrastructure for maintainers, not a dependency for schema users. Its adoption remains conditional on a practical trial of the environment, authentication, supported settings, and available execution traces. The first scenario family is CSV export with per-task/flexible, per-task/TDD, and end-of-change/flexible configurations.

The native CLI harness now prepares fresh CSV baseline projects, pins profiles, captures raw traces and exposed usage, and supports an explicit agreement stage for the combined workflow. It has run Codex CLI, Claude Code, and OpenCode trials with independent checks and reviewed findings, including pay-as-you-go OpenCode calls. Current CLI profiles do not provide operating-system isolation; their inherited context and access limits are recorded explicitly. These tools test Cliewen's guidance for maintainers; adopting projects do not need the harness, its agent accounts, or Harbor to use the schemas.

The [schema-wide evaluation plan](../testing/agent-evaluation.md) and [profile manifest](../testing/agent-evaluation.yaml) are authoritative for current versions, models, budgets, coverage, and reports. Repeated release coverage remains incomplete, including the combined TDD-order finding. The [latest combined trial](../testing/cli-trials/result-006.md) records that limit. A Harbor-backed runner and automatic multi-provider execution remain unimplemented; the practical Harbor trial is still pending.

Trials used existing account access; no account purchase or credit top-up is recorded. Credentials belong outside fixtures and committed results. Prices and model catalogs remain external operational details rather than fixed methodology requirements. Reported or list-equivalent costs must not be presented as subscription invoices.

## References

- [Harbor agent integrations](https://docs.harborframework.com/agents/pre-integrated-agents) support selecting agents and models separately; profile details still need verification in our environment.
- [OpenCode Zen](https://opencode.ai/da/zen) describes pay-as-you-go billing and spending limits.
- [OpenRouter provider routing](https://openrouter.ai/docs/guides/routing/provider-selection) documents provider restrictions and fallback controls.
- [Anthropic's agent evaluation guidance](https://www.anthropic.com/research/demystifying-evals-for-ai-agents) discusses isolated trials and grading actual behavior.
