# CI 集成指南

## 在 CI 中使用代码合规审查

在 CI pipeline 中通过 Claude Code CLI 执行合规审查。（当前为参考方案，需要项目已配置 Anthropic API 访问。）

```yaml
name: Code Compliance Check

on:
  pull_request:
    branches: [main]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Claude Code compliance review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "Review this PR's git diff using coding-compliance skill. \
            Focus on security, naming, React/Vue patterns, and style issues. \
            Report with severity levels (Error/Warning/Suggestion)." \
            --print
```

## 本地预提交

```bash
# 审查当前变更
claude -p "Run coding-compliance on the current git diff changes."

# 审查指定文件
claude -p "Review these files with coding-compliance" -f src/components/
```

## 审查输出要点

每次审查结果应包含：

- 问题描述与文件位置
- 严重级别（Error/Warning/Suggestion）
- 对应规则编号（如 `common.md §2.1`）
- 修复建议
- 预计修复难度
