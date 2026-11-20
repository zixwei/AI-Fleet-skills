# Pinterest Playbook

## Account: idapixldreams

## Current State
- Active account with existing content (liminal space art)
- IFTTT posting: `pin_image` applet (fixed to "idapixldreams" board)
- Consolidated webhook supports Pinterest with dynamic board via `social-post.sh`
- Board: "idapixldreams" (may need additional boards)

## Strategy: Visual Search Engine Optimization

Pinterest is NOT a social network. It's a visual search engine. The strategy is fundamentally different from every other platform.

## Key Metrics
- **Pin saves** — the primary engagement metric
- **External clicks** — traffic to Etsy, YouTube, or website
- **Impressions** — declining platform-wide (-59% in 2025), but still the discovery metric
- **Board followers** — niche community signal

## Posting Cadence
- **3-10 pins per day** — spread across time, not bulk
- **Consistency > volume** — daily pinning beats weekly batches
- **Scheduling tools** (Tailwind) recommended for spread — or batch in cron sessions

## Board Strategy

### Existing
- **idapixldreams** — catch-all for the brand

### Recommended New Boards (searchable names)
- **Liminal Space Photography** — poolrooms, empty malls, abandoned spaces
- **Dreamcore Aesthetic** — surreal, dreamy digital art
- **Ambient Music Visuals** — album art, music-paired imagery
- **Digital Art Prints** — Etsy product showcase
- **AI Generated Art** — generated liminal/aesthetic content

## Pin Optimization

### Images
- **Vertical 2:3 ratio** — takes up more feed space, higher save rate
- **Rich, saturated color** — catches eye in scroll
- **Text overlay** (optional) — 3-5 words max, high contrast, clean font
- **Consistent aesthetic** across all pins — the brand IS the visual consistency

### Titles (100 char max)
- Keyword-first: "Liminal Pool Room | Empty Swimming Pool Aesthetic Art"
- Descriptive, not clever — Pinterest users are searching, not browsing

### Descriptions (500 char max)
- Pure SEO. Load with search terms.
- Example: "Explore this liminal space digital artwork featuring an empty 1970s shopping mall. Dreamcore aesthetic, backrooms inspired, vintage mall photography reimagined. Perfect for liminal space enthusiasts and dreamcore art collectors. Available as art print."
- No personality. Keywords, keywords, keywords.

### Alt-Text
- Descriptive + keywords. Serves accessibility AND SEO.

### Source URL
- Link to relevant Etsy listing, YouTube video, or future website

## Content Sources for Pins
1. **Existing YouTube thumbnails/stills** — liminal pool room content
2. **Etsy product images** — art prints, digital downloads
3. **Generated images** — fal.ai/Gemini liminal space generation
4. **Vault visual content** — Workshop images, canvas screenshots
5. **Video pins** — short loops from YouTube content (higher engagement than static)

## Posting via Infrastructure
```bash
# Pin with image:
bash social-post.sh --platforms "pinterest" --text "Pin description with keywords" --image "https://image-url" --board "idapixldreams"
# Dynamic board:
bash social-post.sh --platforms "pinterest" --text "Description" --image "https://url" --board "Liminal Space Photography"
```

## Note on Pinterest Analytics
- No API for analytics — stats dashboard requires Playwright scraping
- Track saves and clicks when possible via scraping sessions
- Pinterest traffic is long-tail and evergreen — a pin from months ago still drives traffic
