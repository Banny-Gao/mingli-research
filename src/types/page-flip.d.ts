// src/types/page-flip.d.ts
declare module 'page-flip' {
  interface PageFlipSettings {
    width: number
    height: number
    size?: 'fixed' | 'stretch'
    drawShadow?: boolean
    flippingTime?: number
    usePortrait?: boolean
    startPage?: number
    maxShadowOpacity?: number
    showCover?: boolean
    mobileScrollSupport?: boolean
    swipeDistance?: number
    useMouseEvents?: boolean
    disableFlipByClick?: boolean
  }

  /** page-flip flip 事件 payload */
  export interface FlipEventData {
    /** 翻页后的目标 page 索引 */
    data: number
  }

  export class PageFlip {
    constructor(parent: HTMLElement, settings: PageFlipSettings)
    loadFromHTML(items: NodeListOf<Element> | HTMLElement[]): void
    // 库 2.0.7 实际方法名为 updateFromHtml（小写 h），不是 updateFromHTML。
    // 见 pageFlipApiContract.test.ts。
    updateFromHtml(items: NodeListOf<Element> | HTMLElement[]): void
    flipNext(): void
    flipPrev(): void
    turnToNextPage(): void
    turnToPrevPage(): void
    turnToPage(pageNum: number): void
    getCurrentPageIndex(): number
    on(event: 'flip', callback: (e: FlipEventData) => void): void
    on(event: string, callback: (e: unknown) => void): void
    /**
     * 将 .flip-book-page 元素从 page-flip 内部 distElement 移回父容器，
     * 再销毁 page collection。应在 destroy() 前调用，避免 destroy()
     * 把 React 渲染的页面元素一并 remove。
     */
    clear(): void
    destroy(): void
  }
}
