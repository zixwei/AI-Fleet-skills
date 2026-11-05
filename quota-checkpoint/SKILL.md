---
name: quota-checkpoint
description: >-
  Use before any multi-step or long task run on a metered AI (Grok Bot, Muse,
  other AI tools), and whenever resuming a task that stopped midway, so a quota
  cut-off never forces redoing finished steps.
---
# Quota-safe checkpointing

Goal: if quota runs out mid-task, the restart continues from the last finished step instead of redoing everything.

## Before starting
1. Look for an existing progress file for this task (`<task folder>/PROGRESS.md`). If it exists, read it, skip every step marked done, and resume at `Next`.
2. Check remaining quota of the tool you plan to use (Grok Bot usage, muse2api quota/readyz, account status). If it clearly can't finish the whole task, do only the steps it can finish, or pick another tool now.
3. Split the task into small steps, each producing a file. Write them into PROGRESS.md as a checklist.

## While working
4. After each step: save its output to a file in the task folder, tick the step in PROGRESS.md, note the output path and the `Next` step. Write before moving on, never batch.
5. Cache every AI tool answer or generated asset as a file; before asking the same question again, check the cache first.
6. If a tool hits its quota or errors: switch to the next tool in the routing order (e.g. Muse acc-01, then acc-02, then the other tools in the routing table), hand it PROGRESS.md plus the needed outputs, and continue from `Next`.

## PROGRESS.md template
```
# <task> (started <date time ET>)
Tool order: <tool1> -> <tool2> -> ...
- [x] 1. <step> -> out/01-xxx.md (<tool>, <time>)
- [ ] 2. <step>
Next: 2
Notes: <blockers, quota state>
```

## Finishing
7. When all steps are done, mark the task complete in PROGRESS.md and keep the outputs until the result is delivered and accepted. Never put secrets in PROGRESS.md or cache files.
