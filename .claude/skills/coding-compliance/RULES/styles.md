# 样式层规范

适用于 CSS/Less/Tailwind/主题样式。

## 1. CSS 基础规范

### 命名

- :white_check_mark: BEM 命名法推荐（`block__element--modifier`）
- :white_check_mark: 语义化命名（`.article-title` 而非 `.a-t`）

### !important 规则

- :x: 禁止随意使用 `!important`
- :warning: 仅在覆盖第三方库样式时使用，并添加注释说明原因

### 单位使用

- :white_check_mark: 优先相对单位：`rem`/`em` 优于 `px`
- :white_check_mark: 字体大小：`rem`
- :warning: 边框厚度：`px`（精确控制）

## 2. Less 规范

### 变量命名

- :white_check_mark: `@variable-name`（全小写+连字符）
- :white_check_mark: 语义化命名：`@color-primary` 而非 `@cp`

### 嵌套层级

- :warning: 最多 4 层嵌套
- :x: 避免过深嵌套（选择器特异性过高）

### Mixin

- :white_check_mark: 参数化 mixin 优于硬编码值
- :x: 避免无参数的 mixin（可用占位符代替）

### 示例

```less
// :white_check_mark: 推荐
@color-primary: #409eff;
.button(@color: @color-primary) {
  background: @color;
  &:hover {
    background: darken(@color, 10%);
  }
}

// :x: 不推荐
.button() {
  background: #409eff; // 硬编码
  &:hover {
    background: #337ecc;
  }
}
```

### 作用域

- :x: 避免全局污染
- :white_check_mark: 使用 scoped（Vue）或 CSS Modules

## 3. Tailwind 规范

### 工具类优先

- :white_check_mark: 能用 `p-4` 就用 `p-4`
- :x: 不轻易写自定义类覆盖工具类

### 配置优先

- :white_check_mark: 主题值（`text-sm`, `text-lg`）优先于硬编码
- :white_check_mark: 颜色使用 `bg-primary` → 在 tailwind.config.js 定义

### 组件提取

- :warning: 重复 3 次以上 → 提取为组件
- :warning: 复杂布局 → 使用 `@apply` 或组件包装

### 避免超长 class

```
// :x: 不推荐：超长 class 串
<div class="flex items-center justify-between p-4 m-4 bg-white rounded shadow">

// :white_check_mark: 推荐：提取为组件或使用工具函数
<Card> 或 <div class="container-default">
```

## 4. 主题/暗色模式

### CSS 变量

```css
/* :white_check_mark: 推荐：使用变量 */
:root {
  --color-primary: #409eff;
  --bg-surface: #ffffff;
}
.dark {
  --bg-surface: #1a1a1a;
}

/* :x: 禁止：硬编码颜色 */
.element {
  background: #fff;
}
```

### Tailwind dark: 变体

```html
<!-- :white_check_mark: 推荐 -->
<div class="bg-white dark:bg-gray-800">
  <!-- :x: 禁止 -->
  <div class="bg-white"></div>
</div>
```

## 5. 响应式设计

### 断点规范

- :white_check_mark: 统一断点（项目配置优先）
- :white_check_mark: 移动优先：`min-width` 而非 `max-width`

### 常用断点

| 名称 | 宽度   | 场景     |
| ---- | ------ | -------- |
| sm   | 640px  | 手机横屏 |
| md   | 768px  | 平板     |
| lg   | 1024px | 笔记本   |
| xl   | 1280px | 桌面     |

### 图片响应式

- :white_check_mark: 使用 `srcset` 或 `<picture>`
- :white_check_mark: 避免固定宽度图片
