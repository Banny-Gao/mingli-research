# 补充问题一：SEO 缺失

> 生成时间：2026-05-17
> 优先级：🔴 高
> 关联：抖音流量留存

---

## 现状

当前为纯静态 React 站，无 SSR/SSG，搜索引擎直接抓取 JS 渲染结果效果差。

具体缺失项：

| 维度 | 现状 |
|------|------|
| sitemap.xml | 无 |
| canonical URL | 无 |
| structured data（JSON-LD） | 无 |
| open graph | 无（微信/公众号分享无卡片） |
| meta 标签 | 依赖 react-helmet-async，但无统一规范 |

---

## 影响

抖音视频评论区用户搜索时，无法通过搜索引擎发现站点。

流量入口全部依赖抖音一个渠道，抗风险能力为零。

---

## 建议方案

**短期（本周）：**
- 生成 `public/sitemap.xml`，包含所有 slug 路由
- 统一配置每个页面的 og:title / og:description / og:image
- 添加 robots.txt 允许爬取
- 提交 Google Search Console / 百度搜索资源平台

**中期：**
- 引入 SSR/SSG（Vite + @vitejs/plugin-ssr 或 Nuxt），解决 JS 渲染问题
- 添加 JSON-LD structured data（Book / Article 类型）
- 为每篇解读生成独立的 meta description

---

## 待确认

- [ ] 是否接受 SSR 改造（增加部署复杂度）
- [ ] 目标搜索引擎：Google / 百度 / 两者兼顾？