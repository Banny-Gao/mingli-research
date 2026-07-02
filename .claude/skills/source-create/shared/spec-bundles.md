# source-create 规范包

> 副本路径相对 skill 目录自身。**真源路径与录入机制见 `shared/sources/manifest.json`**（由 `ingest-skill-sources` 录入）。

## 必含规范（2 份）

| # | 规范 | 副本路径 | 真源 | 用途 |
|---|------|----------|------|------|
| 1 | SPEC-source.md | `shared/sources/SPEC-source.md` | `research-dispute/SPEC-source.md` | 原文录入格式与原则 |
| 2 | general.md | `shared/sources/general.md` | `research-dispute/general.md` | 通用红线 + 学术语体 |

注：source-create 不需要 bazi.md（原文录入阶段不涉及命理解读）。

**任一副本缺失立即终止**。恢复方式：跑 `ingest-skill-sources --target source-create` 重新录入。

## 指纹校验（动态化）

**不存死值。** source-create 与 self-check 共享同一份规范文件，规范本体的任何修改都会让死值漂移。本节改用实时校验：主 agent 在 Step 4 启动时跑 `shared/sources/scripts/self-check-fingerprint.py --project-root shared/sources --source-prefix ""`，**只取 2 个相关副本**的指纹与"上次录入时的指纹"做对比。

| 规范 | 校验方式 |
|------|---------|
| `SPEC-source.md` | 跑脚本取 `shared/sources/SPEC-source.md` 当前指纹（行数 + sha256[:16]）|
| `general.md` | 跑脚本取 `shared/sources/general.md` 当前指纹 |

**用法：**

```bash
python3 shared/sources/scripts/self-check-fingerprint.py --project-root shared/sources --source-prefix "" 2>&1 | grep -E "SPEC-source|general.md"
```

输出形如：

```
<hash>  shared/sources/SPEC-source.md
<hash>  shared/sources/general.md
```

**漂移处置：**
- 与上轮录入的指纹对比，不一致 → 警告用户（"规范有更新，是否继续用旧规范录入？"）
- 用户决定：继续 / 重启流程
- 不再在本文件维护指纹值

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 source-create v1 不走 subagent）。
