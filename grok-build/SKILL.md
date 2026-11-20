---
name: grok-build
description: Use Grok to FIND X content (keyword, semantic, user and thread search). Grok finds; Fx verifies the numbers. Read-only, low frequency, login only with the owner's approval.
---

# Grok:找 X 内容(只找不读数)

舰队 wrapper,无上游仓库.服务:Grok(xAI,grok.com 与 Grok 应用).来源:X @Feljoy_ix 2026-11-17 帖子(https://x.com/Feljoy_ix/status/2122714053168787706).

## 分工(帖子原话)

- 找 = Grok:搜关键词、语义、指定用户、整串 thread.
- 读 = Fx:帖子全文与数字一律回 Fx(fxtwitter)核准,Grok 转述的数字不算核实过.
- Grok 吃订阅额度,须低频使用;不要拿 Grok 当循环爬虫.

## 能力(已核实)

- Grok 可实时搜索公开 X 帖子与公开网页(消费者端 grok.com 与 Grok 应用均有实时 web + X 搜索;API 侧为 `x_search`,支持关键词、语义、用户、thread 搜索,返回答案与引用).
- 内置访问是只读的,不以你的身份登录;不发帖、不点赞、不发私信;私信、书签、主页时间线须另外连接 X 插件并登录.
- API 调用(`api.x.ai`)须 key 与 credits,与 grok.com 的订阅额度是分开计费的;未设 key 前只用消费者端 Grok.

## 规则(帖子原话,舰队铁律)

- 设备码登录(device-code 登录)须本人批准,未经主人明确批准不得登录.
- 凭证文件永不让 AI 读:不要打开、不要复制、不要把凭证内容贴进任何对话、帖子或文件.
- 全程只读:不点赞、不关注、不回复、不发帖、不转推.
- 低频:能一次找齐就不要分多次问;找完立刻回 Fx 核数字,不要在 Grok 里反复追问同一帖子.
- 引用 Grok 找出的帖子时贴原链接,数字以 Fx 重读结果为准.

## 不知道

- 消费者端 Grok 各套餐的具体搜索限额未核实,以 x.ai/pricing 为准;不要编造限额数字.
