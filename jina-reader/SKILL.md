---
name: jina-reader
description: Read any URL as clean Markdown via Jina Reader. In the X workflow it supplements Fx/vx with images and context the embed APIs don't carry, and converts pages to Markdown.
---

# Jina Reader:任意链接转 Markdown(补图补上下文)

舰队 wrapper,无上游仓库.服务:Jina Reader(Jina AI,现属 Elastic;开源 jina-ai/reader,Apache-2.0).来源:X @Feljoy_ix 2026-11-17 帖子(https://x.com/Feljoy_ix/status/2122714053168787706).

## 分工

- Jina 补图补上下文:当 Fx/vx 读到的帖子缺图、缺上下文,或目标是帖子外的链接(文章、公告、文档)时,用 Jina 把整页转成 Markdown 再读.
- Jina 不做 X 帖子的数字核准:点赞、浏览数仍以 Fx 为准.

## 用法(已核实)

- 基本:`https://r.jina.ai/<目标 URL>`,返回 Markdown(默认附 Title、URL Source、Published Time 等头信息).
- 示例:`curl https://r.jina.ai/https://example.com`(无 key 可用,轻量使用).
- 免 key 有限流(约 20 请求/分钟);高频使用须 API key:`Authorization: Bearer <JINA_API_KEY>`,并可解锁 s.jina.ai 搜索.
- 输出可调:请求头 `x-respond-with`(markdown/text/html/screenshot 等)、`Accept: application/json`(JSON 模式);读 PDF、Office 文档亦可.
- 搜索:`https://s.jina.ai/<查询词>`(须 key),返回命中页面的全文抽取,不只是标题摘要.

## 规则(舰队铁律)

- 全程只读:不点赞、不关注、不回复、不发帖.
- 不要把 Jina 的渲染结果当成 X 帖子原文:帖子正文以 Fx 为准,Jina 只补上下文.
- key 如需使用走安全通道,不贴聊天、帖子与文件.
