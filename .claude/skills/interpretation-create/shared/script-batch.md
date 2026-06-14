# CLI 脚本调用约定（批量模式入口 B）

用户在终端跑 CLI 脚本，不在 Claude Code 会话内。

## 用户命令

```bash
# dry-run 预览
node scripts/generate-interpretations.js <slug> <chapter1>,<chapter2> --force --dry-run

# 实跑
node scripts/generate-interpretations.js <slug> <chapter1>,<chapter2> --force

# 整本所有未解读篇章
node scripts/generate-interpretations.js <slug> --force

# 自定义 API 配置
node --env-file=.env scripts/generate-interpretations.js <slug> --force

# 或
ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-interpretations.js <slug> --force

# CLI 覆盖
node scripts/generate-interpretations.js <slug> --force --api-key sk-ant-cli-test
```

## CLI 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `<slug>` | 是 | 书 slug |
| `<chapters>` | 否 | 逗号分隔篇章名；缺省 = 整本所有未解读篇章 |
| `--force` | 否 | 覆盖已存在 interpretation.md |
| `--dry-run` | 否 | 预览，不实跑 |
| `--api-key <key>` | 否 | CLI 覆盖 env（详见 env.js）|
| `--base-url <url>` | 否 | CLI 覆盖 env |
| `--model <id>` | 否 | CLI 覆盖 env |
| `--help` | 否 | 打印帮助 |

## 脚本动作

1. 解析 CLI 参数
2. 加载 specBundle（读 books/{slug}/catalog.md 解析术数 + 强装载 5 份规范）
3. 调 `lib/llm-batch.js` 的 `generateInterpretations({...})`
4. 输出 stdout 进度条：`████░░░░ 30% 论用神 ...`
5. 收尾报告：成功 N / 失败 M / 跳过 K / fatal 列表
6. exit code：0 成功 / 1 有失败

## 模糊篇章名匹配

`resolveChapters(slug, chapterList)` 函数：
- 篇章名精确匹配 → 用之
- 模糊匹配（如"论用神" 匹配 "论用神格"）→ 选最短前缀匹配
- 多重模糊匹配 → 报错列出候选，让用户精确化
- 0 匹配 → 报错退出

## 与 subagent 派发入口的差异

见 `subagent-batch.md` 末"与 CLI 脚本入口的差异"表。