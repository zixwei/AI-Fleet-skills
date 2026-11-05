---
name: matt-pocock-skills
description: Use for Matt Pocock style engineering workflows (TDD, code review, diagnosing bugs, domain modeling, specs to tickets, PRs, prototyping, triage, handoffs, grilling a plan, writing for agents); pick the matching sub-skill and follow its SKILL.md.
---

# Matt Pocock Skills (bundle)

Source: https://github.com/mattpocock/skills (engineering + productivity groups). Each sub-skill is kept unmodified under `skills/<name>/`.

## How to use
1. Pick the sub-skill below that matches the task.
2. Read `skills/<name>/SKILL.md` from this skill directory and follow it, including any files it references beside it.

## Sub-skills

- `ask-matt`: Ask which skill or flow fits your situation. A router over the skills in this repo.
- `code-review`: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating iss
- `codebase-design`: Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when an
- `diagnosing-bugs`: Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow.
- `domain-modeling`: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a GLOSSARY.md, or recording or editing an ADR.
- `grill-me`: A relentless interview to sharpen a plan or design.
- `grill-with-docs`: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
- `grilling`: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
- `handoff`: Compact the current conversation into a handoff document for another agent to pick up.
- `implement`: Implement a piece of work based on a spec or set of tickets.
- `implement-spec`: Implement the result of /to-spec and /to-tickets in code.
- `improve-codebase-architecture`: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- `pr`: Use when writing a PR body.
- `prototype`: Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a UI should look like.
- `research`: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a
- `retro`: Conduct a retrospective on a coding session.
- `setup-matt-pocock-skills`: Configure this repo for the engineering skills: set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills.
- `tdd`: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
- `teach`: Teach the user a new skill or concept, within this workspace.
- `to-questionnaire`: Turn a decision you can't fully answer into a questionnaire for someone else to fill in.
- `to-spec`: Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.
- `to-tickets`: Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker (edges as text in one file per ticket locally, or native blockin
- `triage`: Move issues and external PRs through a state machine of triage roles, categorise, verify, grill if needed, and write agent-ready briefs.
- `wait-what`: Stop. That last message did not land: re-pitch it.
- `wayfinder`: Plan a huge chunk of work (more than one agent session can hold) as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear.
- `wizard`: Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or runn
- `writing-for-agents`: Writing documents for agents. Use when creating or editing skills, or modifying AGENTS.md or CLAUDE.md.
