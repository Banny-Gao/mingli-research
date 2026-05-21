# 错误处理规则

## 错误分类

### E1：无暂存改动

```
❌ 未检测到已暂存的改动！
请先执行 git add <文件>。
```

### E2：提交到主分支

```
❌ 禁止直接提交到 main/master！
请切换到工作分支。
```

### E3：Commit 信息规范失败

```
❌ commit 信息不符合规范
问题：type 错误
修正：refactor(user): 更新用户列表样式
```

### E4：Lint 失败

```
❌ Lint 校验失败！
src/views/xxx:25:10 - error: xxx
已记录到 lessons.md。
```

### E5：TS 检查失败

```
❌ TypeScript 检查失败！
src/views/xxx:8:5 - error: Property 'xxx' is missing
```

### E6：Build 失败

```
❌ 构建失败！
已记录到 lessons.md。
```

### E7：commit-msg hook 失败

```
⚠️ hook 校验失败！
✖ type may not be empty
修正：git commit --amend -m "fix(user): xxx"
```
