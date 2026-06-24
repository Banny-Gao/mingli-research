# skill-create 规范包

## 必含规范（5 份）

副本路径均相对 skill 目录自身。**真源路径与录入机制见 `shared/sources/manifest.json`**（由 `scripts/ingest-skill-sources.js` 录入）。

| # | 规范 | 副本路径 | 真源 | 用途 |
|---|------|----------|------|------|
| 1 | SPEC-skill.md | `shared/sources/SPEC-skill.md` | `research-dispute/SPEC-skill.md` | SKILL.md 格式与原则（核心规范，含 rules/ 块引用格式引用 SPEC-interpretation §2.1）|
| 2 | general.md | `shared/sources/general.md` | `research-dispute/general.md` | 通用红线 + 学术语体（含 14 条红线）|
| 3 | 术数专项 | `shared/sources/{术数}.md`（如 `bazi.md`）| `research-dispute/{术数}.md` | 领域硬约束（按 `catalog.md` 术数字段动态加载）|
| 4 | CATEGORY_TREE | `shared/sources/category-tree.json` | `scripts/lib/category-tree.js` | 类别路径注册表（一级+二级）|
| 5 | 指纹脚本 | `shared/sources/scripts/self-check-fingerprint.py` | `scripts/self-check-fingerprint.py` | GATE 1 强装载命令依赖（带 `--source-prefix ""` 走副本）|

**注**：SPEC-interpretation.md 未单独录入——其 §2.1 块引用格式通过 SPEC-skill.md 副本内的引用传递（搜"继承自 SPEC-interpretation §2.1"那条）。

**任一副本缺失立即终止**（套 SPEC-skill.md §九 GATE 1 失败处置）。恢复方式：跑 `node scripts/ingest-skill-sources.js` 重新录入。

## 上游输入（产物来源，2 份）

skill-create 不直接处理 source.md / interpretation.md 内容，但要求**每本源书的篇目都有这两份**：

| # | 上游 | 路径 | 校验时机 |
|---|------|------|----------|
| 1 | source.md | `books/{slug}/articles/{篇名}/source.md` | GATE 2 原文体检 |
| 2 | interpretation.md | `books/{slug}/articles/{篇名}/interpretation.md` | GATE 2 原文体检 |

**任一缺失** → 阻断，3 选项门（调上游 skill / 取消 / 退出）。

## CATEGORY_TREE 校验

skill-create 在 Step 1a 选类别路径时，**必须**校验该路径在 CATEGORY_TREE 注册：

```bash
# 读副本 JSON（推荐）
node -e "import('./shared/sources/category-tree.json', { with: { type: 'json' } }).then(m => console.log(JSON.stringify(m.default.CATEGORY_TREE)))"
```

输出 CATEGORY_TREE 数组，主 agent 据此生成 AskUserQuestion 选项。

**类别未注册** → 阻断，2 选项门（先注册类别 / 退出）。

## 指纹校验（动态化）

不存死值。**先**用 `scripts/ingest-skill-sources.js` 录入后，副本的指纹可由本目录内任何方式生成（如 `sha256sum`）。与"上次录入时的指纹"对比由调用方负责。

```bash
# 录入后对副本生成指纹
sha256sum shared/sources/SPEC-skill.md shared/sources/general.md shared/sources/bazi.md
# 或用自带的指纹脚本
python3 shared/sources/scripts/self-check-fingerprint.py --project-root shared/sources --source-prefix ""
```

输出形如：

```
<hash>  shared/sources/SPEC-skill.md
<hash>  shared/sources/general.md
<hash>  shared/sources/bazi.md
```

**漂移处置**：

- 与上轮录入的指纹对比，不一致 → 警告用户
- 用户决定：继续 / 重启流程 / 重新跑录入脚本

## 注入策略

主 agent 直读副本文件（不内联到 subagent prompt，单点 interactive 模式）。
