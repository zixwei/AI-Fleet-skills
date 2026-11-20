# Thumbnail Engine

![Thumbnail Engine](assets/thumbnail-engine.png)

A Claude Code custom skill that generates professional YouTube thumbnails using the **Higgsfield MCP** (Nano Banana Pro). Produces 4 different thumbnail variations at once, composited with your headshot, and creates a 2x2 comparison grid so you can quickly pick a direction.

## Install

```bash
mkdir my-thumbnails && cd my-thumbnails
curl -sSL https://raw.githubusercontent.com/Samin12/thumbnail-engine/main/install.sh | bash
```

Then follow the setup steps it prints (connect the Higgsfield MCP, customize CLAUDE.md, drop in your headshot).

## How it Works

The skill is a markdown file (`.claude/skills/youtube-thumbnail/SKILL.md`) that teaches Claude Code a specialized thumbnail design workflow. Image generation runs through the Higgsfield MCP server — Claude uploads your headshot and reference images, prompts Nano Banana Pro with 4 different concepts based on thumbnail psychology, and composites the results into a comparison grid with the bundled Pillow scripts.

**Soul Character support:** if you've trained a [Higgsfield Soul](https://higgsfield.ai) on your face, the skill detects it automatically and generates identity-locked portraits with it for each concept — a much stronger likeness than plain headshot photos. No Soul? It falls back to the headshots folder.

When you type `/youtube-thumbnail`, Claude reads the skill definition and follows the process step by step — gathering reference images, crafting 4 different concepts, generating them in parallel via Higgsfield, and presenting a comparison grid. Iteration is built in: pick a direction, describe changes, and the skill refines it using the previous generation as a reference.

## Requirements

- [Claude Code](https://claude.ai/claude-code) CLI
- [Higgsfield MCP](https://higgsfield.ai) server connected (primary image engine)
- Python 3.10+ (for the comparison-grid compositing scripts)
- Optional: Gemini API key ([free at Google AI Studio](https://aistudio.google.com/apikey)) — fallback engine if you don't use Higgsfield
- Optional: Scrape Creators API key — competitor thumbnail research

## Usage

Open Claude Code in your project folder and run:

```
/youtube-thumbnail
```

Give it your video topic or title. It handles the rest — concept design, reference gathering, generation, and iteration.
