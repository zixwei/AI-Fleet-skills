# capsule-cinema 对接

`remake-run` 和 `capsule-draft` 会用 **capsule-cinema 自己的 Python 环境**运行包里的 `rea_video/integrations/run_remake.py`、`to_capsule.py`（它们会 import capsule-cinema 的 `lib/` 和 `scripts/`，并读取它的 `.env`）。解释器按 `--python` > `$CAPSULE_CINEMA_PYTHON` > `<capsule-root>/.venv/bin/python` 的顺序找。rea-video 本身只依赖 numpy/opencv/pillow/pyyaml。

```bash
CC=~/code/github/capsule-cinema          # capsule-cinema 仓库

# 1) 拆解（建议开 VLM，复用 capsule-cinema 的 Gemini 配置）
rea-video --env-file $CC/.env decompose ref.mp4 -o out/ref --vlm

# 2a) 生成胶囊草稿（不改 capsule-cinema 代码；通过 tool_factory 注入 rea-video 的拆解结果）
rea-video capsule-draft out/ref/breakdown.json \
    --capsule-root $CC --capsule-name my_ref_remake            # 加 --write-capsule 才落盘到 capsules/

# 2b) 复刻：按意图和模型出方案 → 生成任务 → 调 capsule-cinema 生成 → 按原时间线拼回并出对比片
rea-video plan out/ref --model seedance-2.5               # 读 out/ref/remake/intent.yaml；最终提示词放 remake/prompts.json
rea-video remake-plan out/ref/breakdown.json --capsule-root $CC
rea-video remake-run out/ref/remake/jobs.json --dry-run   # 先看任务
rea-video remake-run out/ref/remake/jobs.json             # 真正调用（会产生费用）
rea-video assemble out/ref/breakdown.json out/ref/remake/results.json
```

- 生成的镜头：一个生成单元的每次调用一个任务，输入方式照方案（参考原片视频 / 每镜一张原片关键帧 / 首尾帧 / 纯文字），提示词用 `remake/prompts.json` 里的最终版；方案检查有错误时不出任务。
- 静态图推拉、静帧：不调模型，`assemble` 用测得的缩放/平移参数在本地重建。
- 代码渲染、录屏镜头：默认保留原片（`keep_original`），重建请按报告中的文字轨/版式用 Remotion 实现。
- 只跑一部分：`remake-run ... --only G2`（生成单元），或 `--only 2,5` / `--only shot_002`（包含这些镜头的单元）。有镜头没生成出视频时，命令以非 0 退出，失败详情在 results.json。
- capsule-cinema 不在默认路径（`~/code/github/capsule-cinema`）时，用 `rea-video prefs capsule_root <路径>` 设一次；或者每次都带 `--capsule-root`，`remake-run` 要和 `remake-plan` 一致；jobs.json 里记录的路径对不上会拒绝执行。
