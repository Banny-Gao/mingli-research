# 探查现有抓取工具（模式 D 内部）

## 目标

模式 D 进入后，主 agent **不知道也不假设**项目内有哪些抓取工具，
要在 `scripts/` 子树做一次运行时探查，找能覆盖目标站点的现成工具。

## 探查方法（运行时执行，不预设路径）

1. 用 Bash 工具扫 `scripts/` 下所有 `.js` 文件
   （如 `find scripts/ -name '*.js' -type f`）
2. 用 Read/grep 抽查每个候选文件的文件头注释，识别：
   - 文件名/注释含 `fetch/scrape/crawl/source` 关键字
   - 注释或代码含明确站点名 / extractor 列表
3. 对每个候选，查找是否声明覆盖目标站点
4. 形成候选清单：`[{name, path, covers: [站点列表], runner: 推测的 CLI 调用模板}]`（runner 从候选文件的文件头注释 / CLI 用法推断，如 `node scripts/<candidate.js> run <slug> <chapters>` 等典型模式）

## 决策路由（探查完成后）

| 探查结果 | skill 动作 |
|---|---|
| 探到 1+ 候选且覆盖目标站点 | 告知用户工具名 + runner 命令，让用户决定执行权（用户自跑 / AI 经确认后跑） |
| 探到 0 个候选 | 进入自生成临时脚本流程（见 scratch-template.md） |
| 探到但都不覆盖 | 告知用户候选清单 + 推荐用户在工具内补 extractor（**skill 不做**补 extractor） |

## 红线

- 不预设任何脚本路径
- 不修改任何已有抓取工具
- 不在探查过程中执行任何抓取
