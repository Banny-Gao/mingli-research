---
name: coding-compliance
description: Use when checking code quality, fixing不规范代码, or validating frontend/样式规范. Also use when user asks to review, audit, or clean up code.
---

# Coding Compliance

## When to Use

- 用户说"检查代码规范" / "代码审查" / "帮我看看这个文件"
- 提交前验证变更是否合规
- 用户要求"让代码更简洁/更专业"
- 发现代码质量下降，需要清理

## Framework Detection

自动检测项目技术栈：

```
package.json 依赖检测：
├── react → React 规范
├── vue → Vue 规范
└── 两者都有 → 询问用户指定

文件内容模式（备选）：
├── import { useState } from 'react' → React
├── import { ref } from 'vue' → Vue
└── .less / .css → 样式层
```

**规范层级映射：**

| 文件类型   | 通用 | 前端 | React  | Vue | 样式 |
| ---------- | ---- | ---- | ------ | --- | ---- |
| .ts/.tsx   | ✅   | ✅   | 检测\* | -   | -    |
| .vue       | ✅   | ✅   | -      | ✅  | ✅   |
| .less/.css | ✅   | -    | -      | -   | ✅   |

\*由 package.json 依赖决定

## Problem Levels

| Level      | Icon | 行为             | CI 退出码 |
| ---------- | ---- | ---------------- | --------- |
| Error      | ❌   | 阻塞性，必须修复 | 2         |
| Warning    | ⚠️   | 建议修复，不阻塞 | 1         |
| Suggestion | 💡   | 改进提示         | 0         |

## CLI Parameters

### Module Flags

| Flag         | 覆盖范围                     |
| ------------ | ---------------------------- |
| `--common`   | 仅通用层（§1-§8 + §9-§21）   |
| `--frontend` | 通用层 + 前端通用            |
| `--react`    | 通用层 + React 专项 + 样式层 |
| `--vue`      | 通用层 + Vue 专项 + 样式层   |
| `--styles`   | 仅样式层                     |
| `--elegant`  | 仅 §9-§21 优雅规则           |
| `--all`      | 全量（含优雅规则）           |
| 无标志       | 全量（默认）                 |

### Filter Flags

| Flag              | 说明                                                |
| ----------------- | --------------------------------------------------- |
| `--files <path>`  | 指定文件/目录检查                                   |
| `--rules <codes>` | 指定规则编号（逗号分隔），如 `--rules F-1,F-5,TM-1` |
| `--level <level>` | 过滤级别：`error` / `warning` / `suggestion`        |

### CI Mode

| Flag                | 行为                                                |
| ------------------- | --------------------------------------------------- |
| `--ci`              | CI 模式：无交互，检测到问题直接退出非零             |
| `--output <format>` | 输出格式：`json` / `sarif` / `junit`（默认 `json`） |
| `CI=true`           | 环境变量等效于 `--ci`                               |

### Exit Codes

| Code | 含义                          |
| ---- | ----------------------------- |
| 0    | 通过（无 Warning + 无 Error） |
| 1    | 有 Warning（不阻塞，但记录）  |
| 2    | 有 Error（阻塞性）            |

## Execution Flow

### 1. 触发确认

```
用户调用技能
    ↓
确认检查范围
    ├── 手动触发 → 用户指定文件/目录
    └── 提交前 → 仅 git diff 变更文件
    ↓
确认检查深度
    ├── 快速检查 → 只查 Error + Warning
    └── 全面检查 → Error + Warning + Suggestion
```

### 2. CLI 参数解析

1. 解析模块标志，确定规则范围
2. 解析过滤参数，确定检查目标
3. 检查 CI 环境变量 / `--ci` 标志
4. 加载对应规则模块
5. 若有 ES 版本要求，读取 `tsconfig.json` 检测环境支持

### 3. ES 环境检测

1. 读取项目 `tsconfig.json`
2. 提取 `compilerOptions.target` 和 `lib`
3. 每条优雅规则标注最低 ES 版本要求
4. 若规则要求 > 当前支持 → 标记 ⚠️[需确认]
5. 用户选择：保持现状 / 升级 target（展示 diff）

### 4. 上下文检测

1. 读取 `package.json` 检测前端框架
2. 扫描目标文件的扩展名
3. 匹配应用规范层级（见上方映射表）
4. 读取项目配置（.eslintrc, .prettierrc, CLAUDE.md）

### 5. 分批执行

**批次限制：**

- 每次最多 **3-5 个文件** 或 **5-10 条问题**
- 同批次问题属于同一模块

**每批次步骤：**

```
1. 读取目标文件
2. 逐规则匹配（通用 → 专项 → 样式）
3. 记录问题（文件/行号/规则/建议）
4. 输出批次报告
5. 用户确认是否修复
6. 修复并验证
7. 询问是否继续下一批次
```

### 6. 问题展示（按批次）

```markdown
### ❌ Error（批次 1/3）

1. **[安全] 硬编码 API 密钥**
   - 文件：`src/lib/api.ts:12`
   - 规则：RULES/common.md §2.1
   - 当前：`apiKey: "sk-xxx"`
   - 修复：→ `process.env.API_KEY`

2. **[命名] 变量 `tempData` 命名不清晰**
   - 文件：`src/components/ActionBar.tsx:23`
   - 规则：RULES/common.md §1.1
   - 修复：→ `pendingAnnotations`
```

### 7. 修复确认

```
每问题确认：
"是否修复？ [是/否/本批次全部接受/跳过]

涉及逻辑变更？→ 必须告知用户并获得明确确认

修复后验证：
1. 对比 diff（确保只有格式/命名变更）
2. 运行功能验证
3. 如有测试用例，运行确认通过
```

## Repair Constraint

**铁律：修复不得改变原有功能行为。**

| 允许            | 禁止             |
| --------------- | ---------------- |
| 格式化/缩进调整 | ❌ 修改业务逻辑  |
| 变量/函数重命名 | ❌ 改变返回值    |
| 常量提取        | ❌ 修改条件判断  |
| 类型注解补充    | ❌ 删除/添加功能 |
| 注释优化        | ❌ 改变数据流    |

## Rationalization Blockers

**技能的核心流程不可跳过，即使在压力下也是如此。**

| 借口         | 现实                                         |
| ------------ | -------------------------------------------- |
| "用户赶时间" | 时间压力是分批执行的理由，而非跳过流程的理由 |
| "用户授权了" | 授权是执行权，不是免确认，逐条确认是必须的   |
| "只改了表面" | 必须 diff 验证，确保只改了应该改的           |
| "无测试用例" | 手动验证也是验证，或运行功能检查             |

### 时间压力说明

分批执行恰恰是为了提高效率：

- 减少上下文污染，提高每次检查质量
- 早期发现问题，避免返工
- 用户可随时终止，已完成部分有效

### 授权 ≠ 免确认

"帮我修复"是授权执行修复，不是授权跳过确认步骤。
确认的目的是：

- 确保修复方向正确
- 让用户了解变更内容
- 避免误修复敏感逻辑

### Diff 验证是铁律

无论多简单的修复，都必须：

1. 对比修复前后 diff
2. 确保只改了应该改的
3. 无误伤相邻代码

**"自信"不是跳过验证的理由。**

## Exception Mechanism

### 注释格式

```tsx
// @compliance-disable F-1           // 单条规则禁用
// @compliance-disable F-1, TM-1   // 多条规则禁用
/* @compliance-disable-all */ // 文件级禁用所有规则
// @compliance-disable F-1 原因：历史代码暂不重构，计划 Q3 重构
```

### CI 模式例外

- 例外注释在 CI 模式下也生效，但报告中标注 `[例外]`
- 格式：`// @compliance-disable <rule> // <原因>`

## Checklist

### 快速检查（提交前）

- [ ] 无 Error 级别问题
- [ ] ESLint 无阻塞性错误
- [ ] 提交信息格式正确（feat/fix/docs/style...）
- [ ] 无硬编码密钥
- [ ] 无敏感文件在变更中（.env, credentials.json）

### 全面检查（代码审查）

- [ ] **通用层**
  - [ ] 命名规范（camelCase/PascalCase/常量UPPER_SNAKE）
  - [ ] 注释质量（无意义注释已清除）
  - [ ] 格式化（单行≤120字符）
  - [ ] 无安全漏洞（硬编码/注入/XSS）
  - [ ] 无性能陷阱（O(n²)/未清理资源）
  - [ ] Git 提交规范

- [ ] **前端通用**
  - [ ] 组件单一职责
  - [ ] Props 有类型定义
  - [ ] 状态不可变更新
  - [ ] 无硬编码路径/数值

- [ ] **React 专项**（如有）
  - [ ] Hooks 调用位置正确
  - [ ] useEffect 依赖完整
  - [ ] 无过度性能优化

- [ ] **Vue 专项**（如有）
  - [ ] Composables 命名正确（use开头）
  - [ ] 响应式陷阱已避免
  - [ ] .vue 文件结构规范

- [ ] **样式层**（如有）
  - [ ] CSS 变量/主题变量使用
  - [ ] 无硬编码颜色
  - [ ] Less 嵌套≤4层

- [ ] **专家级质量**
  - [ ] 无死代码（未使用 import/variable/function）
  - [ ] 无重复逻辑
  - [ ] 命名顾名知意
  - [ ] 注释掉的代码已清除

## Expert-Level Quality

追求简洁专业，超越基础合规。

### 代码简洁

- ✅ 删除死代码
- ✅ 合并重复逻辑（提取公共函数/常量）
- ✅ 简化条件（三元/可选链）
- ✅ 避免深层嵌套（提前 return）
- ⚠️ 不过度简化（可读性 > 行数）

### 命名

- ✅ 变量名顾名知意（`userList` 而非 `arr`）
- ✅ 函数名动词开头（`getUserData`）
- ✅ 布尔值 `is`/`has`/`can` 前缀

### 结构

- ✅ 单一职责
- ✅ 关注点分离
- ✅ 类型驱动（优先 any）

### 注释

- ✅ WHY 注释（为什么，而非做什么）
- ❌ 无意义注释、注释掉的代码

## Rule Modules

| Module   | File              | 覆盖范围               |
| -------- | ----------------- | ---------------------- |
| 通用层   | RULES/common.md   | 命名/安全/性能/Git     |
| 前端通用 | RULES/frontend.md | 组件/状态/资源         |
| React    | RULES/react.md    | Hooks/组件/性能        |
| Vue      | RULES/vue.md      | Composition API/响应式 |
| 样式层   | RULES/styles.md   | Less/Tailwind/主题     |

详细规则内容见各 RULES 文件。

## Configuration Priority

1. 项目配置（.eslintrc, .prettierrc, CLAUDE.md）
2. 内置规范（RULES/ 目录）
