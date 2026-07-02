# 4 类自检的"规范包"内容定义

> 副本路径相对 skill 目录自身。**真源路径与录入机制见 `shared/sources/manifest.json`**（由 ingest-skill-sources 录入）。
>
> `manifest.json` 的 `_root` 字段控制脚本解析 `from` 路径的根：默认 `null` 走 `process.cwd()`；非 null 时相对 manifest 自身目录解析。在子目录跑 `ingest` 时请显式传 `--project-root` 避免误解析。

每类自检派发 subagent 时，必须把对应规范**完整文本内联**到 subagent prompt。本文件定义 4 类自检各自需要哪些规范。

## 4 类规范包

| 类型 | 必含 SPEC（副本） | 必含 SKILL（副本） | 必含工具/文件 |
|------|------------------|--------------------|--------------|
| catalog | `shared/sources/SPEC-catalog.md` | `shared/sources/general.md` | books/{slug}/catalog.html（若存在） |
| source | `shared/sources/SPEC-source.md` | `shared/sources/general.md` | books/{slug}/articles/{篇名}/source.md |
| interpretation | `shared/sources/SPEC-interpretation.md` | `shared/sources/general.md` + （术数=命时）`shared/sources/bazi.md` | books/{slug}/articles/{篇名}/interpretation.md |
| skill | `shared/sources/SPEC-skill.md` | `shared/sources/general.md` + （术数=命时）`shared/sources/bazi.md` | books/{slug}/articles/{篇名}/skill.md |

**真源路径**（仅作 manifest 登记参考，不直接引用）：

- 4 份 SPEC：`research-dispute/SPEC-{catalog,source,interpretation,skill}.md`
- general.md：`research-dispute/general.md`
- bazi.md：`research-dispute/bazi.md`

**任一副本缺失立即终止**。恢复方式：跑 ingest-skill-sources --target self-check 重新录入。

## bazi.md 条件追加

`bazi.md` 是否必含，由书的"术数"字段动态判断：

- 子 SKILL.md 拿到书后先 Read `catalog.md` blockquote 的 `> 术数：命` 行
- 若 `术数=命` → 规范包追加 `shared/sources/bazi.md` 全文
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
python3 shared/sources/scripts/self-check-fingerprint.py --project-root shared/sources --source-prefix "" 2>&1 | grep -E "SPEC-catalog|SPEC-source|SPEC-interpretation|SPEC-skill|general.md|bazi.md"
```

输出形如：

```
<hash>  shared/sources/SPEC-catalog.md
<hash>  shared/sources/SPEC-source.md
<hash>  shared/sources/SPEC-interpretation.md
<hash>  shared/sources/SPEC-skill.md
<hash>  shared/sources/general.md
<hash>  shared/sources/bazi.md
```

指纹不一致时，警告用户并询问"继续使用旧规范 / 用新规范重启"。

## 指纹列表（运行指纹脚本实时生成）

本文件不存具体指纹值——指纹每次执行时计算并由脚本输出。如需在文档中记录当前指纹值，运行脚本后追加在本节末：

```
<!-- 运行 python3 shared/sources/scripts/self-check-fingerprint.py --project-root shared/sources --source-prefix "" >> spec-bundles.md 自动追加 -->
```
