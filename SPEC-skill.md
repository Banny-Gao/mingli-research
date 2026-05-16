# 滴天髓阐微 · AI 执行技能规范

> **用途：** 规范 `books/**/skills/{skill_name}/SKILL.md` 的产出格式
> **前置依赖：** 读取 `SPEC-source.md`（原文）+ `SPEC-interpretation.md`（人类解读）后方可产出
> **面向受众：** AI 执行者（Hermes Agent / Claude Code / 其他 LLM Agent）

---

## 一、文件命名与目录规范

```
skills/{skill_name}/SKILL.md
```

- `skill_name`：全小写，英文标识，与篇名对应（如 `tiandao`、`kundao`、`bage`）
- 一个 skill_name 对应一个篇章
- 目录下**仅允许存在 SKILL.md 一个文件**，不得拆分多个文件

---
