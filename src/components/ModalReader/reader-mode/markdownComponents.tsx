// src/components/ModalReader/reader-mode/markdownComponents.tsx
/* eslint-disable react-refresh/only-export-components */
// 文件同时导出 memo 包装的 MermaidMemo 组件和 markdownComponents 对象，
// Fast Refresh 不能同时支持——属于项目范围内 reader-mode 内部的工具组件
import { memo } from 'react'
import type { Components } from 'react-markdown'
import Mermaid from '../../Mermaid'

const MermaidMemo = memo(Mermaid)

/**
 * 共享的 ReactMarkdown components 配置。
 *
 * 关键点：code 元素如果带 language-mermaid class，渲染成 Mermaid 组件（mermaid.run 异步）。
 * 其他情况用默认 <code> 元素（保留 className 让 rehype-highlight 着色）。
 */
export const markdownComponents: Components = {
  code({ className, children, ...rest }) {
    const isMermaid = /\blanguage-mermaid\b/.test(className || '')
    if (isMermaid) {
      const codeText = String(children).replace(/\n$/, '')
      return <MermaidMemo>{codeText}</MermaidMemo>
    }
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    )
  },
}
