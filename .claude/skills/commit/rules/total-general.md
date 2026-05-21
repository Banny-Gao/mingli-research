# 规则总览

## 规则索引

| ID   | 规则名称     | 文件                                            |
| ---- | ------------ | ----------------------------------------------- |
| R-01 | 禁止擅自提交 | [user-confirm.md](../steps/user-confirm.md)     |
| R-02 | 验证前置     | [full-verify.md](../steps/full-verify.md)       |
| R-03 | 规范强制     | [msg-generate.md](../steps/msg-generate.md)     |
| R-04 | 暂存保护     | [auto-format.md](../steps/auto-format.md)       |
| R-05 | 分支保护     | [pre-check.md](../steps/pre-check.md)           |
| R-06 | 记录强制     | [commit-execute.md](../steps/commit-execute.md) |

## 核心规范

- 禁止擅自提交（必须用户确认）
- lint/ts/build 未通过禁止提交
- type(scope): description 格式
- 禁止 main/master 直接提交
