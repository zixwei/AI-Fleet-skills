# Cross Post Video Skill for Claude Code, Codex, Cursor and OpenClaw

**Cross Post Video Skill** is a free, open-source skill that lets your AI agent cross-post one video to TikTok, Instagram Reels and YouTube Shorts in one go. The agent checks the file against every platform before anything is uploaded, picks a cover, writes a separate text for each platform, asks the settings only you may choose, shows you every post on one page, and then posts or schedules all of them through [WoopSocial](https://woopsocial.com/?utm_source=cross-post-video-skill&utm_medium=readme) after you say yes:

- one file checked against TikTok, Reels and Shorts at once: length, size, frame rate, shape, codec, colour, sound and file layout;
- a re-encoded copy when the file needs it (4K, 120 fps, 5.1 sound, MOV from a camera, HDR when your ffmpeg can convert it), with the original left alone;
- a cover picked from a sheet of frames, with the part Instagram's profile grid shows marked on it;
- a text per platform: TikTok caption, Reels caption, YouTube title, description and tags, each counted the way that platform counts;
- the settings platforms require the account owner to choose: who can see a TikTok, comments, duets and stitches, YouTube made for kids, AI and promotion labels;
- one plan page with every account, text, setting and time, and one yes before anything goes out;
- all accounts in one request, now or scheduled, several accounts per platform if you have them;
- a ready page with text and steps for every account you'd rather post by hand.

No watermark, nothing added to your video, no paid API needed to prepare everything. Python and ffmpeg. MIT licensed.

```bash
npx skills add social-media-skills/cross-post-video-skill -g -a claude-code -y
```

**Post it from your agent:** [make a free WoopSocial account](https://app.woopsocial.com/signup?utm_source=cross-post-video-skill&utm_medium=readme&utm_content=top) (2 social accounts, no card). TikTok, Reels and Shorts are 3 accounts: on the free plan the agent posts 2 and gives you a ready page to post the third by hand. Everything before the upload works without an account, and you can also post all of them by hand with nothing to sign up for.

![The plan page for one NASA clip: the cover, then a card each for TikTok, Instagram Reels and YouTube Shorts with its own text, character count and settings](skills/cross-post-video-skill/examples/showcase.png)

*From the example in [`examples/microgravity/`](skills/cross-post-video-skill/examples/microgravity/): a NASA clip about why astronauts exercise in space, planned for TikTok, Reels and Shorts. Every file in it was made by the skill's scripts. See [CREDITS](skills/cross-post-video-skill/examples/microgravity/CREDITS.md).*

## Contents

- [What the cross post video skill does](#what-the-cross-post-video-skill-does)
- [Requirements](#requirements)
- [Install](#install)
- [Example: cross-post a video with Claude Code](#example-cross-post-a-video-with-claude-code)
- [What gets checked](#what-gets-checked)
- [One video, three texts](#one-video-three-texts)
- [Posting and scheduling](#posting-and-scheduling)
- [FAQ](#faq)
- [What's inside](#whats-inside)

## What the cross post video skill does

Tell your agent "post this video to TikTok, Reels and Shorts", "cross-post clip.mp4 everywhere tomorrow at 6" or "upload this to all my accounts", and it does the whole job:

1. **Asks** in one message which accounts, when, the settings only you may choose, what the video says, and four things it can't see: is it the original export you have the right to post, what the sound is, whether it is AI-made, whether it promotes something. If a job file is already there, it reuses your accounts and settings and only confirms them.
2. **Checks the file** with `check_video.py` against every platform at once, and writes a fixed copy with `--fix` when a re-encode solves it.
3. **Picks a cover** with `cover.py`: you choose from 12 frames.
4. **Writes a text for each platform**, from what the video says.
5. **Writes the job** (`crosspost.json`) with your settings for each account.
6. **Shows the plan** with `plan.py`: `plan.html` has every post as it will go out, every check, and what to do in the apps afterwards.
7. **Posts or schedules** all accounts after one clear yes, records what was sent, so planning again leaves those accounts out, and reads the status back per account. A scheduled post is checked after its time ("check my cross-post"), and one account that failed can be sent again on its own.

## Requirements

- Python 3.9 or newer; on Windows also `pip install tzdata` for scheduling in your time zone.
- ffmpeg.
- Pillow (`pip install pillow`) to pick a cover.
- An agent that can run commands on your computer (Claude Code, Codex, Cursor, OpenClaw or similar).

`python3 <skill>/scripts/check_setup.py` tells you what's missing and the install command for your system (`<skill>` is the folder the skill was installed in; in a clone of this repo it is `skills/cross-post-video-skill`). A CI workflow is included that runs the full pipeline on macOS, Windows and Ubuntu.

## Install

**Claude Code**

```bash
npx skills add social-media-skills/cross-post-video-skill -g -a claude-code -y
```

**Codex, Cursor and other agents:** run `npx skills add social-media-skills/cross-post-video-skill` and pick your agent, or copy `skills/cross-post-video-skill/` into your agent's skills directory.

**OpenClaw (ClawHub):** `openclaw skills install @social-media-skills/cross-post-video-skill`

**GitHub CLI:** `gh skill install social-media-skills/cross-post-video-skill cross-post-video-skill`

**Gemini CLI:** `gemini extensions install https://github.com/social-media-skills/cross-post-video-skill`

## Example: cross-post a video with Claude Code

> Post clips/microgravity.mp4 to my TikTok (@example.orbit), Reels (@example.orbit) and Shorts on 12 January at 6 pm New York time. It's the original export, NASA footage that's free to use, credited. Original sound, no AI, not promotional. TikTok: everyone can see it, comments on, duets and stitches off. Shorts: public, not made for kids.

The agent checks the file and makes the cover sheet:

```bash
python3 <skill>/scripts/check_video.py clips/microgravity.mp4
python3 <skill>/scripts/cover.py clips/microgravity.mp4
```

```
clips/microgravity.mp4: 720x1280, 13.9 s, 29.97 fps, h264 yuv420p, aac 48000 Hz, 3.1 MB, 1.82 Mbps
  TikTok: ok
  Instagram Reels: ok
  YouTube Shorts: ok
```

![Twelve frames of the clip with their times; a dashed box on each marks the middle 3:4 that Instagram's profile grid shows](skills/cross-post-video-skill/examples/microgravity/covers/microgravity-sheet.jpg)

You pick a frame. The first choice here, 8.7 s, cut the astronaut's head off in the profile grid, so the example uses 12.2 s:

![The chosen cover full screen, and next to it the 3:4 crop the profile grid shows](skills/cross-post-video-skill/examples/microgravity/covers/microgravity-grid.jpg)

Then the agent writes the three texts and the job file, and runs the plan:

```bash
python3 <skill>/scripts/cover.py clips/microgravity.mp4 --at 12.2
python3 <skill>/scripts/plan.py crosspost.json
```

```
3 posts planned -> plan.md, plan.html (0 errors, 0 warnings, 0 notes)
by hand (1): by-hand/
requests: requests/microgravity.json
next: show plan.html (or paste plan.md) and wait for a clear yes. Only after the yes: upload each file under "Files to upload", save {file: mediaId} as media.json, run again with --media media.json
```

In the example two accounts are connected and the third, Shorts, is planned by hand: [`by-hand/microgravity/shorts.md`](skills/cross-post-video-skill/examples/microgravity/by-hand/microgravity/shorts.md) has its title, description, tags, settings, the cover frame (12.2 s) and numbered steps for YouTube Studio or the app. The request for the other two is one post with a child per account, each with its own text: [`requests/microgravity.json`](skills/cross-post-video-skill/examples/microgravity/requests/microgravity.json).

## What gets checked

**The file, per account**

| | TikTok | Instagram Reels | YouTube Shorts |
|---|---|---|---|
| Length | 3 s up to the account's own limit | 3 s to 15 min | up to 3 min, or it's a normal video |
| Size | 4 GB | 300 MB | 256 GB |
| Frame rate | 23 to 60 | 23 to 60 | any |
| Width | up to 4096 px | up to 1920 px | plays at 1080p |
| Video | H.264 | H.264 or HEVC, 8-bit, standard colour, 25 Mbps | any |
| Sound | any | AAC, mono or stereo, up to 48 kHz | any |
| File | MP4 | MP4 or MOV with its index at the start | MP4 |

One file passes everywhere: MP4, H.264, 8-bit, standard colour, 1080x1920 (up to 1920 px wide passes), AAC stereo sound, index at the start, under 300 MB, 3 to 180 seconds. `check_video.py --fix` writes that from your file. It keeps the picture size and only scales down a video over 1920 px wide, so a 1920x1080 file stays 1920x1080. It never trims, crops, pads or speeds up: length and shape stay your call.

HDR video, which newer iPhones record by default, is converted to standard colour when your ffmpeg has the `zscale` filter. When it doesn't, `--fix` writes nothing and tells you how to get a standard-colour file from the phone or your editor. It never hands you a file that would still fail.

**The texts:** each length counted the platform's way (YouTube's description in bytes, a link on X as 23 characters, an emoji on TikTok as 2), the YouTube title and tags, Instagram's limit of 5 hashtags, hashtags that say nothing about the video, links that won't be clickable, an @handle reused on another platform, a first line too long to stand alone.

**The settings and answers:** nothing missing, the TikTok audience is one the account offers, the time is in the future and has a time zone, the cover really is a JPEG Instagram accepts.

**The risks worth knowing before posting:**

- A sound picked inside an app doesn't travel; an uploaded copy can be muted or blocked.
- A Short over 1 minute with an active copyright claim is blocked everywhere.
- A copy downloaded from another app carries its watermark, and Instagram says it doesn't recommend videos with one. The skill asks for the original export.
- The same video on several accounts of one platform: YouTube's spam policy names it, Instagram recommends only the original of identical copies, and TikTok makes reused material ineligible for the For You feed. The skill warns once per job (a single note when each account has its own audience and text) and never alters a video to disguise copies.

## One video, three texts

The agent writes each text from the video, not from the other texts:

| | Text | Rules it follows |
|---|---|---|
| TikTok | a caption | first line stands alone, up to 5 hashtags that name the topic |
| Instagram Reels | a caption | first line stands alone, at most 5 hashtags |
| YouTube Shorts | title, description, tags | title of 100 characters at most with the main words first; #Shorts isn't needed |

Nothing is invented: names, numbers and claims come from the video or from you. The rules are in [`references/writing.md`](skills/cross-post-video-skill/references/writing.md).

## Posting and scheduling

Everything up to the upload works without connecting anything: the checked file, the cover, the texts, the plan page and a by-hand page per account.

Posting runs through [WoopSocial's MCP for AI agents](https://woopsocial.com/agents?utm_source=cross-post-video-skill&utm_medium=readme), made by the team that maintains this skill. It posts through each platform's own API with its own approved apps, so you don't need a developer app or an app review of your own; your accounts authorize WoopSocial to post for you. The order is always the same: the plan, your yes, then the upload (once), validation, and one request with a child per account. If validation changes anything, you see the plan again. Videos can go out now or at a time you choose, the same time everywhere or a time per account. A batch is one job file, one plan with a schedule table, and one yes.

Limits to know before the first run:

- The free plan covers 2 social accounts. TikTok, Reels and Shorts are 3: the agent posts 2 for you and gives you the by-hand page for the third, or all of them on a paid plan, or you post all of them by hand. It asks which before anything else.
- Instagram posting needs a Business or Creator account (free to switch in the Instagram app). Facebook posts go to a Page.
- The YouTube cover, YouTube's "Altered content" and "Paid promotion" answers and Instagram's paid partnership label are set in the apps. The plan page lists them under "After it's live".
- A sound from an app's library can't be added through WoopSocial, and Instagram's own API only tags original audio. For TikTok the agent can send the video as a draft to your TikTok inbox, where you add the sound and post it.

## FAQ

**Can I post the same video on TikTok, Reels and Shorts?** No platform's rules are aimed at it. They act on other people's content, copies with another app's watermark, and the same video spread across many accounts of one platform. None of them says in so many words that posting your own original file on all three is fine.

**Do I need a different file for each platform?** No. One vertical MP4 that meets Instagram's limits is valid on all three. `check_video.py --fix` makes it.

**Should I post to one platform first, or leave a gap?** No platform has said that the order or a gap changes how a video is distributed, so the skill makes no such claim. Post when it suits your audience on each.

**Why did my Short become a normal video?** YouTube decides by length and shape: square or vertical and up to 3 minutes is a Short. The skill tells you before uploading.

**Why does TikTok ask who can see every post?** TikTok requires the account owner to choose the audience and the comment, duet and stitch settings for each post made through its API. The skill asks you and never picks them.

**Can it post to several accounts on one platform?** Yes, with a text per account and the audience of each written down. It warns once per job with what that platform's own rules say about the same video on several accounts.

**I posted to two accounts and connected a third later. Do the first two get the video again?** No. After each post the skill records which account got which video, by the account's WoopSocial id, and the file it sent. When you plan again, those accounts are shown as already posted (or scheduled) and the new request holds only the account that is still waiting, also if you changed the time or renamed a connected account in between. A post you made by hand is recorded by account name and platform until that account is connected, then by its id. If a record no longer matches any account in the job, the plan warns and names it instead of sending quietly, and a new video under an id that was already posted stops the plan: give each video its own id.

**Does it work without WoopSocial?** Yes, up to the upload. You get the checked file, the cover, the texts and a page per account with the cover frame and numbered steps to post it by hand, including how to schedule it and where the tags go.

**What if one account fails?** The agent tells you why, you fix the cause, and it releases that one account (`plan.py --failed`) so the next request holds only that account. The accounts that went through are never sent again.

**I scheduled it for tomorrow. How do I know it went out?** Nothing can be checked before the time. After it, say "check my cross-post": the agent reads the status of every account from the record it kept.

**Does it change my video?** Only if you run `--fix`, and then it writes a copy: same picture, same length, re-encoded so every platform accepts it. It never adds a watermark, a logo or text.

## What's inside

```
skills/cross-post-video-skill/
  SKILL.md                 the workflow the agent follows
  scripts/
    check_setup.py         what's installed, and how to add what isn't
    check_video.py         one file against every platform; --fix writes a copy that passes
    cover.py               a sheet of frames, then the cover and its profile-grid preview
    plan.py                all checks, plan.md, plan.html, requests, by-hand pages, the posted record
    upload_parts.py        uploads files to WoopSocial
    xplib.py               shared helpers and each platform's limits
  references/              job file, platforms, writing, WoopSocial
  examples/microgravity/   one NASA clip with every file the skill makes
  evals/evals.json         test prompts
```

The NASA footage in the example is credited in [CREDITS](skills/cross-post-video-skill/examples/microgravity/CREDITS.md); its use doesn't imply endorsement by NASA.

More free skills for social media from the same team: [social-media-skills.com](https://social-media-skills.com/?utm_source=cross-post-video-skill&utm_medium=readme).
