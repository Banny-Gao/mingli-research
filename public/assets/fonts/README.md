# t2i 字体目录

`scripts/lib/t2i/fonts.js` 从此目录加载字体。

## 跨团队协同

字体随仓库提交（建议用 git LFS），`git clone` 后即用，无需本地安装系统字体。

## 目录约定

- `NotoSerifSC-Regular.otf` — 思源宋体（宋体/正文）— 必装
- `NotoSansSC-Regular.otf` — 思源黑体（黑体/现代）— 必装

## 未随仓字体（依赖系统字体）

以下字体在 `presets/fonts.json` 中仅有**系统 fallback**，未随仓库分发：

- **楷体 / 行楷 / 毛笔行书** — macOS 自带 Xingkai/STKaiti，Windows 自带 KaiTi/STKaiti/STXingkai；Linux 需自行安装（推荐 `apt install fonts-noto-cjk-extra` 或霞鹜文楷）
- **隶书** — macOS 自带 Libian SC；Windows 需手动下载；Linux 需自行安装
- **娃娃体 / 雅痞 / 圆体** — macOS 专属字体，其他系统无对应

跨团队场景下，若团队成员为 Windows + 缺楷体脚本会回退到 SimSun（宋体），效果可接受但不如楷体。若需精准出图，请按 [scripts/lib/t2i/presets/fonts.json](../scripts/lib/t2i/presets/fonts.json) 的 `download` 字段补充字体后放入本目录。

## 字体缺失时

`scripts/t2i.js` 启动会检测关键字体，缺失时打印下载链接。也可手动按 [scripts/lib/t2i/presets/fonts.json](../scripts/lib/t2i/presets/fonts.json) 的 `download` 字段下载。

## 系统字体 fallback

若项目内字体未装全，`fonts.js` 也会按平台查找系统字体（macOS / Windows / Linux 预置清单）作 fallback，详见 `fonts.json` 的 `system_fallbacks`。

## 推荐扩展字体（可选）

- 思源楷体 SC（Noto Serif CJK SC 已有变体也可）
- 思源隶书 SC
- 霞鹜文楷（更接近传统楷书，免费 OFL）
- 演示夏行楷 /演示佛系体（毛笔/书法类）

下载后放入本目录，并在 `scripts/lib/t2i/presets/fonts.json` 的 `bundled` 数组登记一行即可被自动识别。
