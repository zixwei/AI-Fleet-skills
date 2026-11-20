---
name: ecommerce-skills
description: 电商视觉生产技能集 (26 技能):商品拍摄、模特上身、详情页、主图视频、平台合规检查,底层可换多家图像/视频模型. Use when producing e-commerce visuals without a studio or models.
license: MIT
---
来源:https://github.com/dlazy-ai/ecommerce-skills (2026-11-19 ET 核实,上游提交 a938b76,81 stars,许可证 MIT).X @RachidSettas 2026-11-19 帖子推荐,用户 2026-11-19 下令入库.

# ecommerce-skills 电商视觉生产技能集 (26 技能)

把「拍商品图」拆成 26 个可组合技能:每个技能一份可直接执行的 SKILL.md + 可执行脚本.链路:平铺图 → 模特上身图 → 裂变套图 → 详情页 → 主图视频 → 投前质检 → 平台合规校验,整条链不用摄影棚、不约模特.

## 特点

- 不锁后端:dLazy 默认,也能用 OpenAI / Gemini / fal / Replicate / 火山方舟,自带 key 即可;没 key 也能 `--dry-run` 空跑看清要发什么.
- 确定性动作交给脚本:批量、重试、断点续跑、成本熔断、合规校验、闭环重跑都是脚本,不靠模型每次现编.
- 能验收:上架前的平台规格是机检的,不是「看着差不多」.

## 文件名说明

上游技能文件名为小写 `skill.md`,入库时统一改名为 `SKILL.md`(内容不变),索引与清单均指改名后的路径.

## 怎么用

按任务读 `skills/<名字>/SKILL.md`;共享规范见 `shared/references/`(品牌、平台规格、模型后端、视频后端);不知道用哪个先读 README 的链路图.

## 收录清单
- [batch-image](skills/batch-image/SKILL.md):多商品批量生图流水线。商品清单 CSV → 整批统一视觉的商拍图，带并发、重试、断点续跑、成本熔断与挑图联系表。当用户说「批量生图」「一批商品」「跑整个 SKU 表」「几百个商品出图」时使用。
- [brand-kit](skills/brand-kit/SKILL.md):店铺品牌视觉锁定。一份 brand.yaml 定义模特、色温、构图、留白与文案语气，所有生图技能读它，保证跨 SKU 视觉统一。当用户说「统一风格」「同一个模特」「店铺调性」「品牌规范」「几百个 SKU 看起来像一家店」时使用。
- [clothing-detail](skills/clothing-detail/SKILL.md):服装工艺细节放大图。服装图 → 面料纹理、走线、织法的微距特写。当用户说「细节图」「特写」「面料放大」「工艺展示」「近景细节」时使用。
- [clothing-extraction](skills/clothing-extraction/SKILL.md):从任意图提取干净商品平铺图。真人图 / 街拍图 → 白底平铺商品图。当用户说「提取衣服」「扒图」「转平铺」「抠成商品图」「从买家秀提取」时使用。
- [clothing-grass-planting](skills/clothing-grass-planting/SKILL.md):同款穿搭换模特换场景做种草图。穿搭图 → 社交平台风格的种草图。当用户说「种草图」「小红书风格」「换场景发帖」「达人图」时使用。
- [creative-scene](skills/creative-scene/SKILL.md):从零创意生图，也可定向改模特、姿势、搭配。一句描述（可选参考图）→ 图。当用户说「创意生图」「生成一张」「改个姿势」「换模板」「随便来张图」时使用。
- [cross-border-localize](skills/cross-border-localize/SKILL.md):跨境一套素材多区域本地化。一套素材 → 多语言文案、尺码换算表、区域合规标识。当用户说「跨境本地化」「多语言」「翻译上架」「海外版本」「英文版主图」时使用。
- [detect-task](skills/detect-task/SKILL.md):投前 AI 图真实性质检。待检图 → 风险等级 + 8 项逐条判定 + 可直接追加到 prompt 的修正句，可自动重跑直到达标。当用户说「投前检测」「图片质检」「检查有没有崩」「上架前把关」「这图能不能用」时使用。
- [fabric-on-body](skills/fabric-on-body/SKILL.md):一键替换服装面料。版式图 + 面料图 → 换上新面料的样衣图，垂坠与光泽随材质变。当用户说「换面料」「换材质」「试布料」「面料上身」「同款不同料」时使用。
- [fission-pattern](skills/fission-pattern/SKILL.md):一张商品图裂变成整套素材。商品图 + 卖点 → 多角度多场景成套图，够铺满一屏。当用户说「裂变套图」「一张变一屏」「凑够详情页」「出一套图」时使用。
- [flat-lay](skills/flat-lay/SKILL.md):服装平铺图一键上身试穿。服装平铺图 + 姿势参考图 → 模特上身商拍图，款式、颜色、织法、版型保持不变。当用户说「平铺图转模特图」「衣服上身」「虚拟试穿」「AI 试衣」「让模特穿上」时使用。
- [image-fusion](skills/image-fusion/SKILL.md):多单品融合成一整套 Look。最多 8 张单品图 → 同一模特身上的完整搭配商拍图，每件单品保真。当用户说「多件搭配」「融图」「组一套 look」「搭配图」「几件衣服合成一张」时使用。
- [item-change-background](skills/item-change-background/SKILL.md):商品换背景。白底商品图 → 逼真场景图，光影与投影匹配新环境。当用户说「换背景」「加场景」「白底转场景」「放到桌面上」时使用。
- [item-detail](skills/item-detail/SKILL.md):生成带中文排版的详情页模块。商品图 + 卖点 → 可直接上架的详情页图文模块。当用户说「详情页」「做详情图」「商品描述图」「详情页模块」时使用。
- [item-repair](skills/item-repair/SKILL.md):商品精修、去褶皱。随手拍的商品图 → 可直接上架的精修图。当用户说「精修」「去褶皱」「修图」「拍得不好看」「整理一下」时使用。
- [item-selling-point](skills/item-selling-point/SKILL.md):商品图生成带文案排版的转化主图。商品图 + 卖点 → 带中文文案的电商主图。当用户说「主图」「加卖点文案」「转化图」「促销图」「主图文案」时使用。
- [listing-optimizer](skills/listing-optimizer/SKILL.md):主图 A/B 组与转化复盘。商品图 + 卖点 → 多组对照主图 + 每组的差异假设 + 复盘模板。当用户说「A/B 测试」「主图优化」「提点击率」「哪版更好」「换个版本试试」时使用。
- [main-image-video](skills/main-image-video/SKILL.md):静态主图转主图视频。一张商品图 → 3–5 秒可上架的主图短视频。当用户说「主图视频」「图转视频」「让图动起来」「加个视频」时使用。
- [material-enhancement](skills/material-enhancement/SKILL.md):材质质感增强与纹理重建。糊掉的图 + 高清商品图 → 纹理清晰可信的图。当用户说「增强质感」「图糊了」「补纹理」「提清晰度」时使用。
- [one-shot](skills/one-shot/SKILL.md):已有模特图换模特、换背景。一张模特图 → 多人群多场景版本，商品本身不变。当用户说「换模特」「换背景」「换人种」「一图多版」「同一件衣服换个人」时使用。
- [platform-compliance](skills/platform-compliance/SKILL.md):上架前平台合规校验与自动修复。待上架图 → Amazon / TikTok Shop / Temu / Shopee / 淘宝 各平台的通过或驳回风险报告，可一键修成合规图。当用户说「会不会被驳回」「合规检查」「白底不达标」「主图规格」「传上去被拒」时使用。
- [product-video-ad](skills/product-video-ad/SKILL.md):商品短视频广告。卖点 → 分镜脚本 → 分段生成 → 拼接加字幕成片。当用户说「做条广告」「短视频」「投流素材」「分镜脚本」「带货视频」时使用。
- [remove-watermark](skills/remove-watermark/SKILL.md):去水印去文字。带水印 / 文字 / logo 的图 → 干净图，背景纹理自然补全。当用户说「去水印」「去文字」「擦掉 logo」「把字去了」时使用。
- [to-3d](skills/to-3d/SKILL.md):平铺图转隐形模特立体图。平铺图 → 有体积感与版型的立体展示图。当用户说「转 3D」「立体图」「隐形模特」「把衣服撑起来」时使用。
- [ugc-testimonial](skills/ugc-testimonial/SKILL.md):UGC 口播种草视频。商品 + 人设 → 口播脚本与成片，达人自拍质感。当用户说「口播视频」「种草视频」「达人风格」「UGC」「真人推荐」时使用。
- [wear-everything](skills/wear-everything/SKILL.md):鞋包配饰真人穿戴图。商品图 + 模特参考图 → 真人佩戴图，落位、透视与阴影自然。当用户说「鞋包上脚」「配饰上身」「墨镜戴上」「首饰佩戴图」「包包上身」时使用。

## 未入库说明

- `docs/` 下 47 张示例图(输入素材与生成效果示例,约 10.2MB)未入;看效果示例去上游 README 或 `docs/`;技能正文与脚本、共享规范全入.
