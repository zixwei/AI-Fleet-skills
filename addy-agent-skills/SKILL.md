---
name: addy-agent-skills
description: Use for production-readiness engineering work our other skills don't cover — security hardening of code that handles input/auth/keys, adding logging/metrics/alerts, setting up CI/CD quality gates, a pre-launch checklist, or writing a project's quality bar as a contract; pick the matching sub-skill and follow its SKILL.md.
---

# Addy Osmani agent-skills (lean bundle)

Source: https://github.com/addyosmani/agent-skills @8bfcc1f (MIT, 2026-10-31). Only 5 of 24 sub-skills are kept, unmodified, under `skills/<name>/`; shared checklists are in `references/`. The other 19 duplicate skills we already have (tdd / matt-pocock-skills / interrogate / ponytail / principle-* / impeccable / source-control / fact-check-coverage / find-skills) and were left out on purpose.

## Sub-skills
- `security-and-hardening`: harden code handling user input, auth, data storage, keys or external integrations (OWASP-style). Use for the IBKR paper auto-order project and any server plan.
- `observability-and-instrumentation`: add logging, metrics, tracing, alerts so a running job proves it works (e.g. monitoring routines, order bots).
- `ci-cd-and-automation`: set up build/test pipelines and quality gates.
- `shipping-and-launch`: pre-launch checklist, staged rollout, rollback plan.
- `constraint-driven-development`: write the quality bar (thresholds) down as a contract so agents can't quietly lower it; `scripts/quality-gate.mjs` (node, local only) checks semgrep/axe reports.

## How to use
1. Pick the sub-skill; read `skills/<name>/SKILL.md` in this skill directory and follow it, including files it references (`../../references/*.md` resolve to this bundle's `references/`).
2. Our rules win on conflict: never print secrets, never deploy/spend/create accounts or place orders without zixwei's explicit OK in chat; report times in ET.
