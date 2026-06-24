# skill-create 规范包

## 必含规范（4 份）

| # | 规范 | 路径 | 用途 |
|---|------|------|------|
| 1 | SPEC-skill.md | `research-dispute/SPEC-skill.md` | SKILL.md 格式与原则（核心规范）|
| 2 | general.md | `research-dispute/general.md` | 通用红线 + 学术语体（含 14 条红线）|
| 3 | 术数专项 | `research-dispute/{术数}.md`（如 `bazi.md`）| 领域硬约束（按 `catalog.md` 术数字段动态加载）|

**任一缺失立即终止**（套 SPEC-skill.md §九 GATE 1 失败处置）。

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
node -e "import('./scripts/lib/category-tree.js').then(m => console.log(JSON.stringify(m.CATEGORY_TREE)))"
```

输出 CATEGORY_TREE 数组，主 agent 据此生成 AskUserQuestion 选项。

**类别未注册** → 阻断，2 选项门（先注册类别 / 退出）。

## 指纹校验（动态化）

不存死值。4 份规范的指纹在每次强装载时实时取，与"上次录入时的指纹"对比。

```bash
python3 scripts/self-check-fingerprint.py | grep -E "SPEC-skill|general.md|bazi.md"
```

输出形如：

```
research-dispute/general.md 指纹: 123:5432d31f0a7024e3
research-dispute/SPEC-skill.md 指纹: 200:abc123def456
research-dispute/bazi.md 指纹: 50:789ghi012jkl
```

**漂移处置**：

- 与上轮录入的指纹对比，不一致 → 警告用户
- 用户决定：继续 / 重启流程

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，单点 interactive 模式）。
