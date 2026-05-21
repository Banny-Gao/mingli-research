# CI 集成

## GitHub Actions 示例

```yaml
name: Code Compliance Check

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run compliance check
        run: |
          npx --yes @claude/code check /coding-compliance --ci --output sarif --files .

      - name: Upload SARIF results
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: compliance-results.sarif

      - name: Fail on errors
        run: |
          if grep -q '"severity":"error"' compliance-results.json; then
            exit 1
          fi
```

## CI 模式行为

| 行为     | 说明                                           |
| -------- | ---------------------------------------------- |
| 触发方式 | `/coding-compliance --ci` 或环境变量 `CI=true` |
| 检查范围 | git diff（仅检查变更文件）                     |
| 输出格式 | `--output json`（默认）/ `sarif` / `junit`     |
| 交互模式 | 无用户提示，检测到问题直接退出非零             |
| 输出文件 | `compliance-results.<format>`                  |

## 输出格式

### JSON（默认）

```json
{
  "results": [
    {
      "rule": "F-1",
      "severity": "warning",
      "file": "src/components/ModalReader.tsx",
      "line": 42,
      "message": "重复 JSX 建议提取为配置数组",
      "fixable": true
    }
  ],
  "summary": {
    "total": 5,
    "error": 0,
    "warning": 4,
    "suggestion": 1
  },
  "tsconfig": {
    "target": "ES2020",
    "supported": ["ES2020", "ES2021", "ES2022"]
  }
}
```

### SARIF

符合 GitHub Code Scanning 格式，可直接上传到 Security tab。

### JUnit XML

CI 系统（如 Jenkins）兼容性格式。
