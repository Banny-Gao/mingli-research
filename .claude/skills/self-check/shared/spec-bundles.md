# 4 类自检的"规范包"内容定义

每类自检派发 subagent 时，必须把对应规范**完整文本内联**到 subagent prompt。本文件定义 4 类自检各自需要哪些规范。

## 4 类规范包

| 类型 | 必含 SPEC | 必含 SKILL | 必含工具/文件 |
|------|-----------|------------|--------------|
| catalog | SPEC-catalog.md | general.md | books/{slug}/catalog.html（若存在） |
| source | SPEC-source.md | general.md | books/{slug}/articles/{篇名}/source.md |
| interpretation | SPEC-interpretation.md | general.md + bazi.md | books/{slug}/articles/{篇名}/interpretation.md |
| skill | SPEC-skill.md | general.md + bazi.md | books/{slug}/articles/{篇名}/skill.md |

## bazi.md 条件追加

`bazi.md` 是否必含，由书的"术数"字段动态判断：

- 子 SKILL.md 拿到书后先 Read `catalog.md` blockquote 的 `> 术数：命` 行
- 若 `术数=命` → 规范包追加 `bazi.md` 全文
- 未来扩展其他术数（紫微、六爻等）时，按相同逻辑追加对应专项文件
- 这步必须在主 agent 派发前完成，**不**在 subagent 内动态判断

## 注入策略 — 完整文本内联

- subagent prompt **内联** 完整规范文本（不是文件路径）
- 代价：单次 5-8k tokens
- 收益：subagent 真正"通读"，不会被跳过；与 SPEC-interpretation §五 Step 1.2 "完整通读 general.md 全文"硬约束保持一致
- 替代方案（路径 + 强制 Read / 摘要 + 路径）均因"依赖 subagent 守纪"或"摘要漂移"风险被排除

## 规范包漂移防护 — 指纹

**指纹格式：** `<行数>:<sha256_hex[:16]>`，其中 sha256 输入是"前 5 个 H2 标题拼接"。

启动时校验：

```bash
python3 scripts/self-check-fingerprint.py
```

输出形如：

```
general.md 指纹: 197:9a7b2c1e4f8d3a6b  ✓
SPEC-catalog.md 指纹: 204:c8d1e5f2a3b6c9d2  ✓
SPEC-source.md 指纹: 159:1a2b3c4d5e6f7a8b  ✓
SPEC-interpretation.md 指纹: 348:e5f6a7b8c9d0e1f2  ✓
SPEC-skill.md 指纹: 212:3c4d5e6f7a8b9c0d  ✓
bazi.md 指纹: 71:7a8b9c0d1e2f3a4b  ✓
```

指纹不一致时，警告用户并询问"继续使用旧规范 / 用新规范重启"。

## 指纹列表（运行 `python3 scripts/self-check-fingerprint.py` 实时生成）

本文件不存具体指纹值——指纹每次执行时计算并由脚本输出。如需在文档中记录当前指纹值，运行脚本后追加在本节末：

```
<!-- 运行 python3 scripts/self-check-fingerprint.py >> spec-bundles.md 自动追加 -->
```
