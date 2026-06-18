// src/components/ModalReader/reader-mode/markdownPlugins.ts
import type { PluggableList } from 'unified'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

/**
 * 共享的 ReactMarkdown 插件配置。
 *
 * 关键点：
 * - mermaid code block 由 markdownComponents 异步渲染（mermaid.run）
 * - rehypePlugins 包含 [Plugin, Options] 元组，与 react-markdown 的 PluggableList
 *   类型签名不完全兼容（[Plugin, Options] 不会被自动展开为 Pluggable 元素），
 *   在模块顶层用 as unknown as 收敛到 PluggableList，消费方直接用。
 */

export const remarkPlugins: PluggableList = [remarkGfm]

export const rehypePlugins: PluggableList = [
  rehypeRaw,
  rehypeSlug,
  [rehypeHighlight, { ignoreMissing: true, plainText: ['mermaid'] }],
  rehypeAutolinkHeadings,
] as unknown as PluggableList
