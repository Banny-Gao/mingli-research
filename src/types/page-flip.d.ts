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
    updateFromHTML(items: NodeListOf<Element> | HTMLElement[]): void
    flipNext(): void
    flipPrev(): void
    turnToPage(pageNum: number): void
    getCurrentPageIndex(): number
    on(event: 'flip', callback: (e: FlipEventData) => void): void
    on(event: string, callback: (e: unknown) => void): void
    destroy(): void
  }
}