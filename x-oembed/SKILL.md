---
name: x-oembed
description: Last-resort X reader via X's official public oEmbed endpoint: returns only the post text and the author, nothing else. Use only when Fx, vxTwitter and Jina Reader all fail.
---

# X oEmbed:读 X 帖子(最后堡垒)

舰队 wrapper,无上游仓库.服务:X 官方 oEmbed(公开端点,无需认证).来源:X @Feljoy_ix 2026-11-17 帖子(https://x.com/Feljoy_ix/status/2122714053168787706).

## 分工

- 最后堡垒:只在 Fx、vx、Jina 全部读不到时用.
- 只能拿到正文 + 作者;没有点赞、浏览、回复、转推、媒体、thread 上下文.

## 用法(已核实,X 官方文档)

- 请求:`GET https://publish.twitter.com/oembed?url=<URL 编码后的帖子链接>&omit_script=true`(publish.x.com/oembed 同义).
- 示例:`https://publish.twitter.com/oembed?url=https%3A%2F%2Fx.com%2FInterior%2Fstatus%2F463440424141459456&omit_script=1`
- 公开端点,无需认证;返回 JSON,关键字段:`html`(含帖子正文的 blockquote)、`author_name`、`author_url`、`url`.
- 取正文:把 `html` 里的标签去掉、解码 HTML 实体,剩下的就是正文.
- 可选参数:`maxwidth`(220–550)、`hide_media`、`hide_thread`、`theme`、`lang`、`dnt`;`omit_script=1` 表示不附带 widgets.js.

## 规则(帖子原话分工,舰队铁律)

- 全程只读:不点赞、不关注、不回复、不发帖.
- oEmbed 只能证明"帖子存在、正文与作者是这些";任何数字(点赞、浏览)都拿不到,不要用 oEmbed 的结果去补数字,缺数字就写不知道.
- oEmbed 也失败时如实报读不到,不要编造帖子内容.
