# book-create 规范包

## 必含规范

| 规范 | 路径 | 用途 |
|------|------|------|
| SPEC-catalog.md | `research-dispute/SPEC-catalog.md` | catalog.md 格式与生成规则 |
| general.md | `research-dispute/general.md` | 通用红线 + 学术语体 |

注：book-create 不需要 bazi.md（建书阶段不涉及命理解读）。

## 指纹校验（动态化）

**不存死值。** book-create 与 self-check 共享同一份规范文件，规范本体的任何修改都会让死值漂移。本节改用实时校验：主 agent 在 Step 3 启动时跑 `scripts/self-check-fingerprint.py`，**只取 2 个相关规范**的指纹。

| 规范 | 校验方式 |
|------|---------|
| `SPEC-catalog.md` | 跑脚本取 `research-dispute/SPEC-catalog.md` 当前指纹（行数 + sha256[:16]）|
| `general.md` | 跑脚本取 `research-dispute/general.md` 当前指纹 |

**用法：**

```bash
python3 scripts/self-check-fingerprint.py | grep -E "SPEC-catalog|general.md"
```

输出形如：

```
research-dispute/general.md 指纹: 123:5432d31f0a7024e3
research-dispute/SPEC-catalog.md 指纹: 208:22425693274f1bdc
```

**漂移处置：**
- 与上轮录入的指纹对比，不一致 → 警告用户（"规范有更新，是否继续用旧规范建书？"）
- 用户决定：继续 / 重启流程
- 不再在本文件维护指纹值（与 `.claude/skills/self-check/shared/spec-bundles.md` §指纹列表 统一，与 `.claude/skills/source-create/shared/spec-bundles.md` 同步）

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 book-create 不走 subagent）。
