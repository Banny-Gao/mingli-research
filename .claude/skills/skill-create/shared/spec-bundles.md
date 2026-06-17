# skill-create 规范包

## 必含规范（4 份）

| # | 规范 | 路径 | 用途 |
|---|------|------|------|
| 1 | SPEC-skill.md | `research-dispute/SPEC-skill.md` | skill.md 格式与原则（核心规范） |
| 2 | general.md | `research-dispute/general.md` | 通用红线 + 学术语体（含 14 条红线） |
| 3 | 术数专项 | `research-dispute/{术数}.md`（如 `bazi.md`）| 领域硬约束（按 `catalog.md` 术数字段动态加载）|
| 4 | source.md | `books/{slug}/articles/{篇名}/source.md` | 待沉淀的原文 |
| 5 | interpretation.md | `books/{slug}/articles/{篇名}/interpretation.md` | 上游解读 |

**任一缺失立即终止**（套 SPEC §五 Step 1.1）。

## 指纹校验（动态化）

不存死值。4 份规范的指纹在每次强装载时实时取，与"上次录入时的指纹"对比。

```bash
python3 scripts/self-check-fingerprint.py | grep -E "SPEC-skill|general.md|bazi.md"
```

输出形如：
```
research-dispute/general.md 指纹: 123:5432d31f0a7024e3
research-dispute/SPEC-skill.md 指纹: 200:abc123def456
research-dispute/bazi.md 指纹: 50:789ghi012jkl
```

**漂移处置：**
- 与上轮录入的指纹对比，不一致 → 警告用户
- 用户决定：继续 / 重启流程

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 v1 不走 subagent）。
