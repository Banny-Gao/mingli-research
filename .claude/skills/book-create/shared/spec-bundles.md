# book-create 规范包

## 必含规范

| 规范 | 路径 | 用途 |
|------|------|------|
| SPEC-catalog.md | `research-dispute/SPEC-catalog.md` | catalog.md 格式与生成规则 |
| general.md | `research-dispute/general.md` | 通用红线 + 学术语体 |

注：book-create 不需要 bazi.md（建书阶段不涉及命理解读）。

## 指纹校验

| 规范 | 指纹 | 校验时机 |
|------|------|----------|
| SPEC-catalog.md | `209:0a6ac03677557779` | Step 3 启动时 |
| general.md | `123:bbc557e8a234c874` | Step 3 启动时 |

**指纹格式：** `<行数>:<sha256_hex[:16]>`，其中 sha256 输入是"前 5 个 H2 标题拼接"。

**漂移处置：** 指纹不一致 → 警告用户，由用户决定继续还是用新规范重启。

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 book-create 不走 subagent）。
