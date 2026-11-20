---
name: ecommerce-video-skills
description: Video skills from xianyu110/ecommerce-video-skills (封面与发布), 13 skill(s) kept from the 2026-11-19 X video-skills roundup by @Tynric_carter.
---

# ecommerce-video-skills

Source: https://github.com/xianyu110/ecommerce-video-skills @96c49b3 (MIT, 150 stars, verified 2026-11-20). Video skills from the X video-skills roundup (2026-11-19, @Tynric_carter).

## Sub-skills

- `ai-voiceover-edge-tts`: "AI 口播配音：用免费的 edge-tts（微软 Edge 在线语音）为带货短视频逐句生成配音，自动去首尾静音、统计每句时长、缓存复用，可选音色/语速/音调，并给出口播稿改写规则。Use when the user needs a voice-over, 配音, 口播, 旁白, TTS, text-to-speech See `skills/ai-voiceover-edge-tts/SKILL.md`.
- `cover-title-ab`: "封面与标题 A/B：为带货短视频生成多套封面（自动挑选清晰帧或用干净素材图 + 不同标题与版式）和多组标题/文案，导出 3:4 / 9:16 封面文件和对比图，并给出 A/B 测试方法与记录表。Use when the user wants a video cover, 封面, 首图, thumbnail, 标题, See `skills/cover-title-ab/SKILL.md`.
- `ffmpeg-auto-assemble`: "ffmpeg 自动拼接成片：一条命令把 storyboard.json（商品图/视频片段 + 口播稿）渲染成带配音、字幕花字、转场、BGM 自动闪避、响度标准化的 9:16 MP4，纯本地运行。Use when the user wants to assemble/edit/render a product vide See `skills/ffmpeg-auto-assemble/SKILL.md`.
- `hook-3s-script`: "3 秒钩子脚本：为电商短视频写前 3 秒开场（台词 + 画面 + 花字），按痛点/反差/结果先行/提问/数字/场景代入等钩子类型一次给出多版，并做合规自检。Use when the user asks for a hook, 开头, 黄金 3 秒, 前三秒, opening line, scroll-stopper, See `skills/hook-3s-script/SKILL.md`.
- `image-to-video-shots`: "主图转视频：把一张或几张商品主图/白底图/场景图，写成可直接喂给图生视频模型的镜头提示词（运镜、主体动作、光线、时长、负面约束），并保证商品不变形。Use when the user has product images and wants a product video, 主图视频, 图生视频, image-to- See `skills/image-to-video-shots/SKILL.md`.
- `live-stream-clips`: "直播切片：从电商直播录屏中找出高光片段（按时间戳 / 按字幕关键词 / 按停顿自动提议），批量导出 9:16 竖屏切片，自动模糊填充横屏画面、烧录标题与字幕、响度标准化，并给切片写标题与开头钩子。Use when the user has a livestream recording and wants 直播切片, See `skills/live-stream-clips/SKILL.md`.
- `multi-model-shot-prompts`: "多模型镜头提示词适配：把一份分镜表改写成适合不同视频生成模型的提示词（中/英、首帧/首尾帧/纯文生视频、运镜词表、负面约束），模型中立、不编造价格或参数。Use when the user wants the same shot list adapted for Seedance, 可灵 Kling, Veo, Ru See `skills/multi-model-shot-prompts/SKILL.md`.
- `multilingual-dubbing`: "多语言本地化配音：把中文带货视频本地化为英语、日语、韩语、东南亚语（印尼/泰/越/马来/菲律宾）、西语等版本——本地化改写口播（不是直译）、选对 edge-tts 音色、生成对应字幕与花字，并用同一份 storyboard 一键渲染多语言成片。Use when the user wants dubbing, 多语言, See `skills/multilingual-dubbing/SKILL.md`.
- `platform-spec-export`: "TikTok Shop / 抖音 / 视频号 / 小红书 / 淘宝主图视频 / Amazon 规格导出：把一条母版视频一键转成各平台推荐画幅与编码（9:16、3:4、1:1、16:9，模糊填充或智能裁切），输出规格报告，并可叠加 UI 安全区预览。Use when the user asks for export s See `skills/platform-spec-export/SKILL.md`.
- `selling-point-storyboard`: "卖点分镜表：把商品卖点拆成 15–60 秒带货短视频的逐镜分镜表（时间码、画面、台词、字幕、花字、素材来源、运镜），并直接输出可渲染的 storyboard.json。Use when the user wants a storyboard, 分镜, 分镜脚本, shot list, 带货视频脚本, video sc See `skills/selling-point-storyboard/SKILL.md`.
- `subtitles-and-text-effects`: "字幕与花字：为带货短视频生成 ASS/SRT 字幕与花字（大标题弹出、关键词高亮、贴纸标签、行动号召按钮），自动避开平台底部/右侧 UI 安全区，并用 ffmpeg/libass 烧录。Use when the user wants subtitles, captions, 字幕, 花字, 大字报, keyword See `skills/subtitles-and-text-effects/SKILL.md`.
- `unboxing-comparison-review`: "开箱 / 对比评测模板：生成电商开箱视频与 A/B 对比评测的结构、口播稿、拍摄清单与分镜（含公平对比规则、测试设计、缺点与适合人群），可直接转成 storyboard.json 渲染。Use when the user wants an unboxing video, 开箱, 测评, 评测, 横评, 对比, rev See `skills/unboxing-comparison-review/SKILL.md`.
- `viral-remake`: "爆款拆解复刻：把抖音/TikTok 爆款带货视频（链接、转写或口述结构）拆成 8 维结构与 5-beat 节拍，再映射到你的商品，输出拆解表 + 3 个复刻角度 + 可渲染 storyboard.json。Use when the user says 爆款, 拆解, 复刻, 对标, 仿拍, viral remake, See `skills/viral-remake/SKILL.md`.

## How to use
1. Pick the sub-skill; read its `SKILL.md` in this skill directory and follow it, including files it references.
