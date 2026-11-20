---
name: fxtwitter
description: Read an X post in full via FxTwitter (FxEmbed): full text, direct image/video links, likes and view counts. This is the fleet's primary X reader — numbers used in research must come from Fx, never from a paraphrase.
---

# FxTwitter:读 X 帖子(主力)

舰队 wrapper,无上游仓库.服务:FxEmbed/FxTwitter(开源,FxEmbed/FxEmbed,MIT).来源:X @Feljoy_ix 2026-11-17 帖子(https://x.com/Feljoy_ix/status/2122714053168787706).

## 分工

- Fx 是主力读帖工具:读全文、图片直链、点赞数、浏览数.
- 研究、核对数字一律以 Fx 返回为准;Grok 只负责找,不负责给数字(见 grok-build).
- Fx 读不到时依次降级:vxTwitter(vxtwitter)→ Jina Reader(jina-reader)→ 官方 oEmbed(x-oembed).

## 用法(已核实)

- 改链接前缀即可读:
  - `twitter.com/用户/status/帖子 id` → `fxtwitter.com/用户/status/帖子 id`
  - `x.com/用户/status/帖子 id` → `fixupx.com/用户/status/帖子 id`
- 公共 API:`api.fxtwitter.com`(文档见 docs.fxembed.com),返回帖子 JSON,含全文、媒体直链与互动数;字段以实际返回为准,不要凭记忆编字段名.
- 也支持 Bluesky:`bsky.app` 前加 `fx`(fxbsky.app),本技能只用于 X.
- 翻译:链接后加语言代码可取译文(按需用,一般直接读原文).

## 规则(帖子原话分工,舰队铁律)

- 全程只读:不点赞、不关注、不回复、不发帖、不转推.
- 数字口径:Fx 的点赞、浏览数是核准口径;不要拿 Grok 转述的数字当核实过的数字,拿不准就重读 Fx.
- 帖子 id 与作者以链接为准,不要凭记忆补.

## 不知道

- Fx 后端抓取失败率与缓存时效未核实;读不到先重试一次,再走降级链,不要反复刷.
