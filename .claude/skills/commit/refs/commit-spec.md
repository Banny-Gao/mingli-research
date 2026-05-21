# Commit 规范

## 格式

```
type(scope): description
```

## type 列表

| type     | 说明      | 示例                          |
| -------- | --------- | ----------------------------- |
| feat     | 新功能    | feat(user): 新增用户导出功能  |
| fix      | 修复 bug  | fix(user): 修复分页显示异常   |
| refactor | 重构      | refactor(order): 重构订单模块 |
| docs     | 文档      | docs: 更新 README             |
| style    | 样式      | style(ui): 调整按钮间距       |
| test     | 测试      | test(user): 新增用户测试用例  |
| chore    | 构建/依赖 | chore: 升级依赖版本           |
| perf     | 性能      | perf: 优化列表查询性能        |

## scope 规则

- 模块名（小驼峰）：user → user
- 嵌套模块：src/views/user → user
- 无模块：root

## description 规则

- 中文描述
- ≤50 字
- 简洁明确
- 无冗余

## 示例

```
✅ fix(user): 修复用户列表分页数据加载异常
✅ feat(order): 新增订单导出 Excel 功能
❌ update user list page (不要英文)
❌ 修复了一些问题 (不要模糊)
❌ fix: update xxx (不要省略 scope)
```
