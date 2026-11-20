# Third-party notices

gaming-clip is licensed under the [AGPL-3.0](LICENSE). It uses the components below, each under its own
licence. gaming-clip does not modify them and does not ship their binaries in this repository: `bun run setup`
downloads the tools and models from their publishers, and `bun install` fetches the npm packages.

## Tools run as separate programs

| Component                                              | Licence                                     | Used for                             | Source                                                                                                                                                                                                                                                        |
| ------------------------------------------------------ | ------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | MIT                                         | Speech to text (`whisper-cli`)       | Homebrew `whisper-cpp` on macOS; the project's release binary on Windows                                                                                                                                                                                      |
| [FFmpeg](https://ffmpeg.org)                           | LGPL-2.1+ or GPL-2+, depending on the build | Decoding, encoding, audio extraction | Homebrew `ffmpeg` on macOS (GPL build, includes libx264); [dfloresc/ffmpeg-macos-builds](https://github.com/dfloresc/ffmpeg-macos-builds) (LGPL) when Homebrew is absent; [BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds) `win64-lgpl` on Windows |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp)             | Unlicense                                   | Downloading videos                   | Homebrew `yt-dlp` on macOS; the project's release binary elsewhere                                                                                                                                                                                            |

The LGPL FFmpeg builds have no libx264, so gaming-clip encodes with the platform H.264 encoder instead
(VideoToolbox on macOS, OpenH264 or Media Foundation on Windows). You can point `FFMPEG_BIN` at any other build.

## Models downloaded at setup

| Component                                                                                                | Licence | Used for                    | Source                                                                                |
| -------------------------------------------------------------------------------------------------------- | ------- | --------------------------- | ------------------------------------------------------------------------------------- |
| [Whisper](https://github.com/openai/whisper) model weights, ggml format                                  | MIT     | Transcription               | [ggerganov/whisper.cpp on Hugging Face](https://huggingface.co/ggerganov/whisper.cpp) |
| [YuNet](https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet) face detector (ONNX) | MIT     | Locating the webcam overlay | [OpenCV Zoo](https://github.com/opencv/opencv_zoo)                                    |

## Fonts (bundled in `assets/fonts`)

All three are licensed under the [SIL Open Font License 1.1](https://openfontlicense.org). The licence texts sit next to the font files.

| Font                                              | Copyright                        | Licence text                   |
| ------------------------------------------------- | -------------------------------- | ------------------------------ |
| [Anton](https://github.com/googlefonts/AntonFont) | 2020 The Anton Project Authors   | `assets/fonts/OFL-Anton.txt`   |
| [Bangers](https://github.com/googlefonts/bangers) | 2010 The Bangers Project Authors | `assets/fonts/OFL-Bangers.txt` |
| [Poppins](https://github.com/itfoundry/Poppins)   | 2020 The Poppins Project Authors | `assets/fonts/OFL-Poppins.txt` |

## npm dependencies

Installed by `bun install`; versions are pinned in `bun.lock`.

| Package                                                                         | Licence    |
| ------------------------------------------------------------------------------- | ---------- |
| [Bun](https://bun.sh) (runtime, bundler, test runner)                           | MIT        |
| [Anvia](https://anvia.dev) (`@anvia/core`, `@anvia/openai`, `@anvia/anthropic`) | MIT        |
| [`@anthropic-ai/sdk`](https://github.com/anthropics/anthropic-sdk-typescript)   | Apache-2.0 |
| [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas)                     | MIT        |
| [`onnxruntime-node`](https://github.com/microsoft/onnxruntime)                  | MIT        |
| [React](https://react.dev) (`react`, `react-dom`)                               | MIT        |
| [Tailwind CSS](https://tailwindcss.com)                                         | MIT        |
| [lucide-react](https://lucide.dev)                                              | ISC        |

Development tools (TypeScript, oxlint, oxfmt, `bun-plugin-tailwind`, the `@types/*` packages) are not part of what runs.
Each package's licence text ships inside its folder in `node_modules/` after `bun install`.

## Content you clip

gaming-clip hosts no media. Videos you download or open stay on your computer and remain subject to their creators'
rights and the terms of the site they came from.
