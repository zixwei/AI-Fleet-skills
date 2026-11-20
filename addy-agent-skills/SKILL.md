---
name: addy-agent-skills
description: Use for production-readiness engineering work our other skills don't cover — security hardening of code that handles input/auth/keys, adding logging/metrics/alerts, setting up CI/CD quality gates, a pre-launch checklist, writing a project's quality bar as a contract, or accessibility auditing, API design, browser testing, context setup, deprecation/migration, ADRs, idea refinement, incremental delivery, intent interviews, performance work, spec writing; pick the matching sub-skill and follow its SKILL.md.
---

# Addy Osmani agent-skills (lean bundle)

Source: https://github.com/addyosmani/agent-skills @8c99fa3 (MIT, 119,213 stars, 2026-11-19). 17 of 26 sub-skills are kept, unmodified, under `skills/<name>/`; shared checklists are in `references/`; the a11y audit persona is in `agents/`. First install (2026-10-31, @8bfcc1f) kept 5 of 24; this update (2026-11-19) re-checked all 26 against the current library and added 12 genuinely missing ones. The 9 still left out duplicate skills we already have: code-review-and-quality (matt-pocock-skills, code-reviewer), code-simplification (ponytail), debugging-and-error-recovery (matt-pocock-skills), doubt-driven-development (interrogate), frontend-ui-engineering (ui-ux-pro-max, frontend-design), git-workflow-and-versioning (source-control), planning-and-task-breakdown (matt-pocock-skills 规格拆票), source-driven-development (fact-check-coverage), test-driven-development (tdd, matt-pocock-skills). Note: upstream has no standalone accessibility-audit / accessibility-testing skills; audit is the `agents/accessibility-auditor.md` persona and testing is part of accessibility-engineering.

## Sub-skills
- `security-and-hardening`: harden code handling user input, auth, data storage, keys or external integrations (OWASP-style). Use for the IBKR paper auto-order project and any server plan.
- `observability-and-instrumentation`: add logging, metrics, tracing, alerts so a running job proves it works (e.g. monitoring routines, order bots).
- `ci-cd-and-automation`: set up build/test pipelines and quality gates.
- `shipping-and-launch`: pre-launch checklist, staged rollout, rollback plan.
- `constraint-driven-development`: write the quality bar (thresholds) down as a contract so agents can't quietly lower it; `scripts/quality-gate.mjs` (node, local only) checks semgrep/axe reports.
- `accessibility-engineering`: audit a page or component for WCAG 2.2 AA conformance (axe-core, pa11y, keyboard/screen-reader checks), triage violations by real user impact, remediate; `scripts/audit-a11y.sh` runs the automated pass; `agents/accessibility-auditor.md` is the dedicated audit persona for deep reviews.
- `api-and-interface-design`: design stable APIs and interfaces (REST/GraphQL endpoints, module boundaries, type contracts) before implementation.
- `browser-testing-with-devtools`: test in real browsers via Chrome DevTools MCP (inspect DOM, console errors, network, profiling). Prerequisite: Chrome DevTools MCP available; without it this skill cannot run.
- `context-engineering`: curate what the agent sees (rules files → specs → source files → error output) when starting a session, switching tasks, or output quality degrades.
- `deprecation-and-migration`: remove old systems, APIs or features safely; migrate users and production DB schemas (expand/contract) without downtime; decide maintain vs sunset.
- `documentation-and-adrs`: record architecture decisions (ADRs) and detect when documentation has drifted from the code it describes.
- `idea-refine`: refine a vague idea into a sharp, actionable concept (divergent then convergent, stress-test assumptions, one-pager out). Use before interview-me/spec-driven-development when the idea itself is still fuzzy.
- `incremental-implementation`: deliver multi-file changes in thin, verifiable vertical slices (implement → test → verify → commit), behind feature flags where it fits; never write a whole feature in one pass.
- `interview-me`: extract what the user actually wants (not what they think they should want) with a one-question-at-a-time interview until ~95% confidence, before any plan, spec or code. Needs a live, responsive user; do not invoke in non-interactive runs.
- `performance-optimization`: measure first, then fix the real bottleneck (frontend, backend, queries, DB; Core Web Vitals targets, N+1 queries); never optimize on a hunch.
- `spec-driven-development`: write the spec before coding (SPECIFY → PLAN → TASKS → IMPLEMENT, human gate at each phase); also for V1/V2 scoping and follow-up specs.
- `using-agent-skills`: meta-skill — discover and invoke the right agent skill for the work at hand; governs how all other skills are used in a session.

## How to use
1. Pick the sub-skill; read `skills/<name>/SKILL.md` in this skill directory and follow it, including files it references (`../../references/*.md` resolve to this bundle's `references/`).
2. Our rules win on conflict: never print secrets, never deploy/spend/create accounts or place orders without zixwei's explicit OK in chat; report times in ET.
