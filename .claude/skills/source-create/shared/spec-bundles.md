# source-create 规范包

## 必含规范

| 规范 | 路径 | 用途 |
|------|------|------|
| SPEC-source.md | `research-dispute/SPEC-source.md` | 原文录入格式与原则 |
| general.md | `research-dispute/general.md` | 通用红线 + 学术语体 |

注：source-create 不需要 bazi.md（原文录入阶段不涉及命理解读）。

## 指纹校验（动态化）

**不存死值。** source-create 与 self-check 共享同一份规范文件，规范本体的任何修改都会让死值漂移。本节改用实时校验：主 agent 在 Step 4 启动时跑 `scripts/self-check-fingerprint.py`，**只取 2 个相关规范**的指纹与"上次录入时的指纹"做对比。

| 规范 | 校验方式 |
|------|---------|
| `SPEC-source.md` | 跑脚本取 `research-dispute/SPEC-source.md` 当前指纹（行数 + sha256[:16]）|
| `general.md` | 跑脚本取 `research-dispute/general.md` 当前指纹 |

**用法：**

```bash
python3 scripts/self-check-fingerprint.py | grep -E "SPEC-source|general.md"
```

输出形如：

```
research-dispute/general.md 指纹: 123:5432d31f0a7024e3
research-dispute/SPEC-source.md 指纹: 169:c2c4f5a8627bbbad
```

**漂移处置：**
- 与上轮录入的指纹对比，不一致 → 警告用户（"规范有更新，是否继续用旧规范录入？"）
- 用户决定：继续 / 重启流程
- 不再在本文件维护指纹值（与 `.claude/skills/self-check/shared/spec-bundles.md` §指纹列表 统一）

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 source-create v1 不走 subagent）。
