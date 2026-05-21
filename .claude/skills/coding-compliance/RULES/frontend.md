# 前端通用规范

适用于所有前端代码（React/Vue/其他框架）。

## 1. 组件规范

### 组件设计

- ✅ 单一职责：每个组件只做一件事
- ✅ Props 必须有类型定义（TypeScript interface 或 PropTypes）
- ✅ 事件命名：`on` 前缀（`onSubmit`, `onChange`）

### 组件大小

- ⚠️ 单文件超过 200 行 → 考虑拆分
- ⚠️ 超过 10 个 props → 考虑使用 context 或配置对象

### 禁止项

- ❌ 直接修改 props（违反单向数据流）
- ❌ 内联函数作为 props（导致子组件不必要的重渲染）

## 2. 状态管理

### 状态提升时机

- ✅ 数据被多个组件共享 → 提升到共同祖先
- ✅ 数据仅被单个组件使用 → 保持局部状态

### 状态更新

- ✅ 不可变更新：`setState(prev => ({ ...prev, newData }))`
- ❌ 直接修改：`state.push(newItem)` → 必须创建新引用

## 3. 资源管理

### 禁止项

- ❌ 硬编码路径：`src="/assets/logo.png"` → 使用 import 或配置
- ❌ 硬编码 API 地址：`url="http://localhost:3000"` → 使用环境变量
- ❌ 硬编码数值（魔法数字）→ 定义为常量

### 要求项

- ✅ 资源路径统一管理
- ✅ 环境变量区分开发和生产

## 6. 性能监控

> 级别：Warning

| 规则 | 描述            | 检测点                              |
| ---- | --------------- | ----------------------------------- |
| PM-1 | 内存泄漏检测    | 未清理的监听器/定时器/Observer      |
| PM-2 | 长任务检测      | PerformanceObserver longtask > 50ms |
| PM-3 | 卡顿帧检测      | requestAnimationFrame 帧率 < 30fps  |
| PM-4 | Core Web Vitals | LCP / FID / CLS 阈值超限            |
