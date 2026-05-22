---
name: coding-compliance
description: Code review & compliance check for frontend projects. Use when user asks to review, audit, or clean up code quality/style/规范.
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
```

**规范层级映射：**

| 文件类型   | 通用 | 前端 | React  | Vue | 样式 |
| ---------- | ---- | ---- | ------ | --- | ---- |
| .ts/.tsx   | ✅   | ✅   | 检测\* | -   | -    |
| .vue       | ✅   | ✅   | -      | ✅  | ✅   |
| .less/.css | ✅   | -    | -      | -   | ✅   |

\*由 package.json 依赖决定

## Review Levels

| Level      | 行为             |
| ---------- | ---------------- |
| Error      | 阻塞性，必须修复 |
| Warning    | 建议修复，不阻塞 |
| Suggestion | 改进提示         |

## Execution Flow

### 1. 范围确认

```
用户调用技能
    ↓
确认检查范围
    ├── 手动触发 → 用户指定文件/目录
    └── 提交前验证 → git diff 变更文件
    ↓
确认检查深度
    ├── 快速检查 → 只查 Error + Warning
    └── 全面检查 → Error + Warning + Suggestion
```

### 2. 上下文检测

1. 读取 `package.json` 检测前端框架
2. 扫描目标文件的扩展名，匹配规范层级（见映射表）
3. 读取项目配置（CLAUDE.md、eslint、prettier、tsconfig）
4. 若目标文件含 ES2022+ 特性，先确认 tsconfig target 是否支持

### 3. 分批执行

**批次限制：**

- 每次最多 **3-5 个文件** 或 **5-10 条问题**
- 同批次问题属于同一模块（安全 → 命名 → Hooks → 样式...）

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

### 4. 问题展示格式

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

### 5. 修复确认

```
每问题确认：
"是否修复？[是/否/本批次全部接受/跳过]

涉及逻辑变更？→ 必须告知用户并获得明确确认

修复后验证：
1. 对比 diff（确保只有格式/命名变更）
2. 运行功能验证（lint / build / type-check）
3. 如有测试用例，运行确认通过
```

## Repair Constraint

**铁律：修复不得改变原有功能行为。**

| 允许                    | 禁止               |
| ----------------------- | ------------------ |
| 格式化/缩进调整         | ❌ 修改业务逻辑    |
| 变量/函数重命名         | ❌ 改变返回值      |
| 常量提取（值不变）      | ❌ 修改条件判断    |
| 类型注解补充            | ❌ 删除/添加功能   |
| 注释优化                | ❌ 改变数据流      |

### Diff 验证是铁律（不可跳过）

无论多简单的修复，都必须对比 diff：

1. **确保只改了应该改的**
2. **无误伤相邻代码**
3. **留下可追溯的变更记录**

**"自信"不是跳过验证的理由。**

## Rationalization Blockers

**技能的核心流程不可跳过，即使在压力下也是如此。**

| 借口         | 现实                                           |
| ------------ | ---------------------------------------------- |
| "用户赶时间" | 时间压力是分批执行的理由，而非跳过流程的理由   |
| "用户授权了" | 授权是执行权，不是免确认；逐条确认是默认行为，用户明确要求批量时可接受批量 |
| "只改了表面" | 必须 diff 验证，确保只改了应该改的             |
| "无测试用例" | 手动验证也是验证，或运行功能检查（lint/build） |

## Exception Mechanism

注释格式（在源代码中使用，绕过规则检查）：

```tsx
// @compliance-disable F-1                     // 单条规则禁用
// @compliance-disable F-1, TM-1              // 多条规则禁用
/* @compliance-disable-all */                 // 文件级禁用
// @compliance-disable F-1 原因：计划 Q3 重构   // 必须带原因
```

设计原则：

1. 例外**必须带原因**，不允许裸 `@compliance-disable`
2. 应有时限建议（计划 Q2 / 下版本 / 技术债务）
3. 定期清理例外（建议每季度一次）
4. 文件级禁用仅用于特殊场景（第三方库封装等）

## Checklists

### 快速检查（提交前）

- [ ] 无 Error 级别问题
- [ ] ESLint 无阻塞性错误
- [ ] 提交信息格式正确（feat/fix/docs/style...）
- [ ] 无硬编码密钥
- [ ] 无敏感文件在变更中（.env, credentials.json）

### 全面检查（代码审查）

**通用层**

- [ ] 命名规范（camelCase/PascalCase/常量UPPER_SNAKE）
- [ ] 注释质量（无意义注释已清除，保留 WHY 注释）
- [ ] 格式化（单行≤120字符）
- [ ] 无安全漏洞（硬编码/注入/XSS）
- [ ] 无性能陷阱（O(n²)/未清理定时器）
- [ ] Git 提交规范

**前端通用**

- [ ] 组件单一职责
- [ ] Props 有类型定义
- [ ] 状态不可变更新
- [ ] 无硬编码路径/数值

**React 专项**（如有）

- [ ] Hooks 调用位置正确
- [ ] useEffect 依赖完整
- [ ] 无过度性能优化

**Vue 专项**（如有）

- [ ] Composables 命名正确（use开头）
- [ ] 响应式陷阱已避免
- [ ] .vue 文件结构规范

**样式层**（如有）

- [ ] CSS 变量/主题变量使用
- [ ] 无硬编码颜色
- [ ] Less 嵌套≤4层

**专家级质量**

- [ ] 无死代码（未使用 import/variable/function）
- [ ] 无重复逻辑
- [ ] 命名顾名知意
- [ ] 注释掉的代码已清除

## Expert-Level Quality

追求简洁专业，超越基础合规。

### 代码简洁

- ✅ 删除死代码
- ✅ 合并重复逻辑（提取公共函数/常量）
- ✅ 简化条件（三元/可选链优于冗余 if）
- ✅ 避免深层嵌套（提前 return / extract function）
- ⚠️ 不过度简化（可读性 > 行数）

### 命名

- ✅ 变量名顾名知意（`userList` 而非 `arr`）
- ✅ 函数名动词开头（`getUserData`）
- ✅ 布尔值 `is`/`has`/`can` 前缀
- ❌ 避免过度缩写（`usr` 而非 `user`）

### 结构

- ✅ 单一职责（每个函数做一件事）
- ✅ 关注点分离（UI/逻辑/数据 分层）
- ✅ 类型驱动（避免 any，优先精确类型）

### 注释

- ✅ WHY 注释（为什么这么做，而非做什么）
- ❌ 无意义注释（`// 获取用户数据`）
- ❌ 注释掉的代码（用 git 保存历史）

## Rule Modules

| Module   | File                          | 覆盖范围                                    |
| -------- | ----------------------------- | ------------------------------------------- |
| 通用层   | `RULES/common.md`             | 命名/安全/性能/优雅编程/TypeScript/错误处理 |
| 前端通用 | `RULES/frontend.md`           | 组件/状态管理/资源                          |
| React    | `RULES/react.md`              | Hooks/组件模式/TypeScript                   |
| Vue      | `RULES/vue.md`                | Composition API/响应式                      |
| 样式层   | `RULES/styles.md`             | CSS/Less/Tailwind/主题                      |

详细规则内容见各 RULES 文件。
