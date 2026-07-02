# interpretation-create 规范包

## 必含规范（5 份）

| # | 规范 | 路径 | 用途 |
|---|------|------|------|
| 1 | SPEC-interpretation.md | `shared/sources/SPEC-interpretation.md` | 解读格式与原则（337 行） |
| 2 | general.md | `shared/sources/general.md` | 通用红线 + 学术语体（含 14 条红线） |
| 3 | 术数专项 | `shared/sources/{术数}.md`（如 `bazi.md`）| 领域硬约束（按 `catalog.md` 术数字段动态加载）|
| 4 | catalog.md | `books/{slug}/catalog.md` | 元信息（术数 / 类别 / 篇章表）|
| 5 | source.md | `books/{slug}/articles/{篇名}/source.md` | 待解读的原文 |

**任一缺失立即终止**（套 SPEC §五 Step 1.1）。

## 指纹校验（动态化）

不存死值。5 份规范的指纹在每次强装载时实时取，与"上次录入时的指纹"对比。

```bash
python3 shared/sources/scripts/self-check-fingerprint.py | grep -E "SPEC-interpretation|general.md|bazi.md"
```

输出形如：
```
shared/sources/general.md 指纹: 123:5432d31f0a7024e3
shared/sources/SPEC-interpretation.md 指纹: 337:abc123def456
shared/sources/bazi.md 指纹: 50:789ghi012jkl
```

**漂移处置：**
- 与上轮录入的指纹对比，不一致 → 警告用户
- 用户决定：继续 / 重启流程

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 v1 不走 subagent 跑 9 步）。
