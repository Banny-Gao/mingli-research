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

  export class PageFlip {
    constructor(parent: HTMLElement, settings: PageFlipSettings)
    loadFromHTML(items: NodeListOf<Element> | HTMLElement[]): void
    updateFromHTML(items: NodeListOf<Element> | HTMLElement[]): void
    flipNext(): void
    flipPrev(): void
    turnToPage(pageNum: number): void
    getCurrentPageIndex(): number
    on(event: string, callback: (e: any) => void): void
    destroy(): void
  }
}
