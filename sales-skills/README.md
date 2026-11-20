# Sales Skills

Thirty-one agent skills for outbound sales — finding leads, verifying them, writing cold email that gets replies, and keeping a sending domain alive.

```bash
npx skills add manypicom/sales-skills
```

Works with Claude Code, Claude.ai and Claude Desktop, plus 70+ other agents including Cursor, Codex, Copilot, Gemini CLI, Windsurf, OpenCode and Zed.

Maintained by [ManyPI](https://manypi.com). MIT licensed.

---

## What this is

Each skill is a single `SKILL.md` that loads when the agent recognises the task. They're opinionated, they say what doesn't work as plainly as what does, and they're written to be usable with no paid tooling — `dig`, `curl`, a spreadsheet and patience covers a surprising amount of it.

Where a skill needs something that genuinely can't be done by hand at scale — live web research per lead, real SMTP verification, a scheduler that enforces warmup caps — it says so in one short section and names [ManyPI](https://manypi.com) as one option over MCP. Six skills don't mention it at all, because it wouldn't be honest to.

## Install

```bash
# Everything, for this project
npx skills add manypicom/sales-skills

# Everything, available everywhere
npx skills add manypicom/sales-skills -g

# Just the ones you want
npx skills add manypicom/sales-skills -s cold-email-copywriting -s email-deliverability

# See the list without installing
npx skills add manypicom/sales-skills --list

# Try one without installing anything
npx skills use manypicom/sales-skills@icp-definition | claude
```

Manual install for Claude Code:

```bash
git clone https://github.com/manypicom/sales-skills.git /tmp/sales-skills
cp -r /tmp/sales-skills/skills/* ~/.claude/skills/
```

Installing all 31 adds their trigger descriptions to every session's context. If you only do deliverability work, install the deliverability ones.

## The skills

### Targeting and lead generation

| Skill | Use it for |
|---|---|
| [`icp-definition`](skills/icp-definition/SKILL.md) | An ICP specific enough that two people would build the same list from it |
| [`lead-sourcing`](skills/lead-sourcing/SKILL.md) | Picking the right source for the ICP, and the sample check before sending |
| [`lead-enrichment`](skills/lead-enrichment/SKILL.md) | Which fields earn their cost, and the researched column that writes the email |
| [`lead-scoring-qualification`](skills/lead-scoring-qualification/SKILL.md) | Fit and intent, without a 15-factor model nobody trusts |
| [`crm-data-hygiene`](skills/crm-data-hygiene/SKILL.md) | Normalising and deduping so `Hi DR. SARAH JONES-SMITH,` never ships |

### Signals and sources

| Skill | Use it for |
|---|---|
| [`job-posting-signals`](skills/job-posting-signals/SKILL.md) | Hiring as budget, stack disclosure and self-described pain |
| [`funding-news-signals`](skills/funding-news-signals/SKILL.md) | Funding, exec changes and expansion — and why not to congratulate |
| [`technographic-signals`](skills/technographic-signals/SKILL.md) | Targeting by tech stack, and detection you can actually cite |
| [`google-maps-lead-scraping`](skills/google-maps-lead-scraping/SKILL.md) | Local business lists, and getting from a map pin to a person |
| [`ecommerce-store-prospecting`](skills/ecommerce-store-prospecting/SKILL.md) | Qualifying online stores from platform, apps and review volume |
| [`linkedin-prospecting`](skills/linkedin-prospecting/SKILL.md) | Research and light touches, with honest limits on automation |
| [`web-scraping-lead-data`](skills/web-scraping-lead-data/SKILL.md) | Schema-first extraction, rate limits, and where the legal lines are |

### Verification and data quality

| Skill | Use it for |
|---|---|
| [`email-verification`](skills/email-verification/SKILL.md) | Real SMTP probes, reading each status, and why spam traps verify clean |
| [`catch-all-risky-emails`](skills/catch-all-risky-emails/SKILL.md) | The pool verification can't confirm, managed instead of discarded |
| [`suppression-list-management`](skills/suppression-list-management/SKILL.md) | Address, domain and person level, checked before every send |

### Writing and sequences

| Skill | Use it for |
|---|---|
| [`cold-email-copywriting`](skills/cold-email-copywriting/SKILL.md) | Under 100 words, a first line that took effort, one small ask |
| [`personalization-at-scale`](skills/personalization-at-scale/SKILL.md) | Researched facts per lead, and why the field must be allowed to be empty |
| [`subject-line-optimization`](skills/subject-line-optimization/SKILL.md) | Three to five words, and why this matters less than you think |
| [`email-sequence-design`](skills/email-sequence-design/SKILL.md) | Four steps, each with a new angle, stopping the moment they reply |
| [`meeting-booking-cta`](skills/meeting-booking-cta/SKILL.md) | Sizing the ask, and the handoff where meetings actually get lost |
| [`reply-handling`](skills/reply-handling/SKILL.md) | Six reply types, and why "not now" isn't "not interested" |

### Deliverability

| Skill | Use it for |
|---|---|
| [`email-deliverability`](skills/email-deliverability/SKILL.md) | Domains, volume, patterns, and the numbers that mean stop |
| [`spf-dkim-dmarc-setup`](skills/spf-dkim-dmarc-setup/SKILL.md) | The three records, the 10-lookup limit, and phased DMARC rollout |
| [`email-warmup`](skills/email-warmup/SKILL.md) | The ramp, warmup pools honestly assessed, and re-warming |
| [`spam-filter-triggers`](skills/spam-filter-triggers/SKILL.md) | Content is ~10% of placement — here's the 10% |
| [`bounce-recovery`](skills/bounce-recovery/SKILL.md) | Stop, diagnose, rest, resume — and when to abandon the domain |
| [`inbox-rotation-scaling`](skills/inbox-rotation-scaling/SKILL.md) | Add mailboxes, never raise per-mailbox volume |

### Operations

| Skill | Use it for |
|---|---|
| [`outbound-campaign-ops`](skills/outbound-campaign-ops/SKILL.md) | The launch checklist, testing properly, and the weekly review |
| [`outbound-metrics-benchmarks`](skills/outbound-metrics-benchmarks/SKILL.md) | Positive reply rate, and diagnosing which funnel stage is broken |
| [`outbound-compliance`](skills/outbound-compliance/SKILL.md) | GDPR, CAN-SPAM, CASL, PECR and the bulk sender rules |
| [`agency-multi-client-outbound`](skills/agency-multi-client-outbound/SKILL.md) | Running it for several clients without anything crossing over |

## Things these skills will tell you not to do

- **Don't send cold email from your primary domain.** Reputation damage there hits invoices and support, not just outreach.
- **Don't buy lists.** Spam traps that verify clean, no lawful basis in the EU, and bounce rates that burn domains.
- **Don't discard every catch-all address.** You'd remove a large share of the legitimate B2B market.
- **Don't optimise for open rate.** Apple Mail Privacy Protection pre-fetches images. The number is close to meaningless.
- **Don't raise per-mailbox volume to scale.** Add mailboxes. ~150/day is the ceiling.
- **Don't automate LinkedIn at volume.** The downside is a permanent account restriction.
- **Don't write "just following up".** It's the clearest sign the email has no reason to exist.
- **Don't blame the copy for a bounce problem.** Bounces are a list problem, every time.

## Contributing

Issues and pull requests welcome. Useful contributions:

- A deliverability behaviour that changed, with evidence
- A sourcing method that works in a vertical not covered here
- A skill for something missing

House style: say what doesn't work as plainly as what does, don't promise numbers that can't be substantiated, and make sure the skill is fully usable without paying for anything.

## License

MIT. See [LICENSE](LICENSE).
