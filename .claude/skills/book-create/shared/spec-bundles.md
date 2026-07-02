# book-create 规范包

> 副本路径相对 skill 目录自身。**真源路径与录入机制见 `shared/sources/manifest.json`**（由 ingest-skill-sources 录入）。

## 必含规范（2 份）

| # | 规范 | 副本路径 | 真源 | 用途 |
|---|------|----------|------|------|
| 1 | SPEC-catalog.md | `shared/sources/SPEC-catalog.md` | `research-dispute/SPEC-catalog.md` | catalog.md 格式与生成规则 |
| 2 | general.md | `shared/sources/general.md` | `research-dispute/general.md` | 通用红线 + 学术语体 |

注：book-create 不需要 bazi.md（建书阶段不涉及命理解读）。

**任一副本缺失立即终止**。恢复方式：跑 ingest-skill-sources --target book-create 重新录入。

## 指纹校验（动态化）

**不存死值。** book-create 与 self-check 共享同一份规范文件，规范本体的任何修改都会让死值漂移。本节改用实时校验：主 agent 在 Step 3 启动时跑 `shared/sources/scripts/self-check-fingerprint.py --project-root shared/sources --source-prefix ""`，**只取 2 个相关副本**的指纹。

| 规范 | 校验方式 |
|------|---------|
| `SPEC-catalog.md` | 跑脚本取 `shared/sources/SPEC-catalog.md` 当前指纹（行数 + sha256[:16]）|
| `general.md` | 跑脚本取 `shared/sources/general.md` 当前指纹 |

**用法：**

```bash
python3 shared/sources/scripts/self-check-fingerprint.py --project-root shared/sources --source-prefix "" 2>&1 | grep -E "SPEC-catalog|general.md"
```

输出形如：

```
<hash>  shared/sources/SPEC-catalog.md
<hash>  shared/sources/general.md
```

**漂移处置：**
- 与上轮录入的指纹对比，不一致 → 警告用户（"规范有更新，是否继续用旧规范建书？"）
- 用户决定：继续 / 重启流程

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 book-create 不走 subagent）。
