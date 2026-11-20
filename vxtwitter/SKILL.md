---
name: vxtwitter
description: Backup X reader via vxTwitter (BetterTwitFix): full text, media direct links, likes/replies/retweets. It has NO view counts and its metrics use a different counting basis — never mix vx numbers with Fx numbers.
---

# vxTwitter:读 X 帖子(备用)

舰队 wrapper,无上游仓库.服务:BetterTwitFix(vxTwitter/fixvx,开源 dylanpdx/BetterTwitFix,WTFPL).来源:X @Feljoy_ix 2026-11-17 帖子(https://x.com/Feljoy_ix/status/2122714053168787706).

## 分工

- vx 是备用:只在 Fx 读不到时用.
- vx 没有浏览数,且口径与 Fx 不同,不可混比——同一帖子不要把 Fx 的数和 vx 的数放进同一组比较.

## 用法(已核实)

- 改链接前缀即可读:
  - `twitter.com/用户/status/帖子 id` → `vxtwitter.com/用户/status/帖子 id`
  - `x.com/用户/status/帖子 id` → `fixvx.com/用户/status/帖子 id`
- 公共 API:`https://api.vxtwitter.com/<用户>/status/<帖子 id>`,返回 JSON,含 `text`(全文)、`likes`、`replies`、`retweets`、`mediaURLs` 与 `media_extended`(媒体直链、尺寸、alt 文本),无浏览数(view/impression)字段.
- 服务端不记录处理的帖子(隐私向);自托管见上游文档.

## 规则(帖子原话分工,舰队铁律)

- 全程只读:不点赞、不关注、不回复、不发帖、不转推.
- 数字口径:vx 的数只作备用参考;需要浏览数或要和别处数字比较时,必须回 Fx 重读.
- vx 读不到时走降级链:Jina Reader(jina-reader)→ 官方 oEmbed(x-oembed).
