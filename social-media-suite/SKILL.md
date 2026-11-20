---
name: social-media-suite
description: Social media management suite built with Claude Code primitives: 11 agents, 9 skills, 7 hooks, 5 playbooks for planning, brand voice, review and publishing. Use when managing social content end to end.
license: 无 LICENSE 文件
---
来源:https://github.com/idapixl/social-media-suite (2026-11-19 ET 核实,上游提交 d571cea,12 stars,无 LICENSE 文件).X @RachidSettas 2026-11-19 帖子推荐,用户 2026-11-19 下令入库.

# social-media-suite 社媒管理套件

完全用 Claude Code 原语(agents、hooks、skills、scripts)搭的社媒管理系统:11 个 agent、9 个 skill、7 个 hook、5 个平台 playbook,做内容策划、品牌风格、审核与发布.除 Claude Code 本身无外部依赖.

## 注意

技能正文按 Idapixl 品牌写(品牌声音、日历等是示例配置);自用时先跑 social-setup 配自己的品牌、平台与发布方式,不要直接沿用示例品牌.

## 怎么用

1. 先跑 `skills/social-setup/SKILL.md` 配品牌与平台.
2. 日常按 `skills/` 走:发帖、趋势、审核、互动、日历、推送.
3. 平台打法查 `playbooks/`;模板在 `templates/`;agent 与 hook 说明见 `agents/`、`hooks/`.

## 收录清单(技能)
- [engage](skills/engage/SKILL.md):Check for and respond to social media engagement — comments, replies, mentions across platforms.
- [reply-mine](skills/reply-mine/SKILL.md):Find hot posts in adjacent communities and draft value-first replies to build Idapixl's presence.
- [social-calendar](skills/social-calendar/SKILL.md):View and manage the social media content calendar. Plan upcoming posts, check cadence compliance, and schedule content.
- [social-health](skills/social-health/SKILL.md):Run a comprehensive health check on social media infrastructure, posting cadence, and engagement metrics.
- [social-post](skills/social-post/SKILL.md):Draft and post social media content across platforms. Use when creating or publishing social media posts for Idapixl.
- [social-push](skills/social-push/SKILL.md):Push approved content from the queue to platforms. Batch-fire posts that are ready to go.
- [social-review](skills/social-review/SKILL.md):Review and approve pending social media drafts in the content queue. Use when reviewing queued posts before publishing.
- [social-setup](skills/social-setup/SKILL.md):Interactive setup wizard for the Social Media Suite. Configures brand voice, platforms, posting infrastructure, autonomy level, an...
- [trends](skills/trends/SKILL.md):Scan for trending topics and timely content opportunities across platforms relevant to Idapixl.

## agents(11)
- social-audience-analyst
- social-community-builder
- social-competition-monitor
- social-content-adapter
- social-cultural-translator
- social-hook-crafter
- social-reply-miner
- social-seo-discovery
- social-strategist
- social-trend-scout
- social-visual-strategist

## hooks(7)
- social-brand-voice-gate
- social-calendar-reminder
- social-context-injector
- social-engagement-alerter
- social-orphan-draft-catcher
- social-post-logger
- social-quality-gate

## playbooks(5)
- bluesky
- pinterest
- reddit
- x-twitter
- youtube

## 未入库说明

无.46 个文件全入,零二进制.
