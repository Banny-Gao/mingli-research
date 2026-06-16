declare module 'page-flip' {
  export interface PageFlipOptions {
    width?: number
    height?: number
    size?: 'fixed' | 'stretch'
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    drawShadow?: boolean
    flippingTime?: number
    usePortrait?: boolean
    startZIndex?: number
    autoSize?: boolean
    maxShadowOpacity?: number
    showCover?: boolean
    mobileScrollSupport?: boolean
    clickEventForward?: boolean
    useMouseEvents?: boolean
    swipeDistance?: number
    showPageCorners?: boolean
    disableFlipByClick?: boolean
    [key: string]: any
  }

  export interface FlipEvent {
    data: number
  }

  export class PageFlip {
    constructor(element: HTMLElement, options?: PageFlipOptions)
    loadFromHTML(elements: NodeListOf<HTMLElement> | HTMLElement[]): void
    turnToPage(page: number): void
    turnToNextPage(): void
    turnToPrevPage(): void
    destroy(): void
    update(): void
    on(event: 'flip', callback: (e: FlipEvent) => void): void
    on(event: string, callback: (...args: any[]) => void): void
    getCurrentPageIndex(): number
    getPageCount(): number
  }
}
