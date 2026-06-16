import type { CrossChapterInput, CrossChapterDecision } from './types'

export function decideCrossChapter(input: CrossChapterInput): CrossChapterDecision {
  const { currentPage, totalPages, direction, hasNext, hasPrev, isPrevRead, prevLastPage = 0 } = input

  if (direction === 'next') {
    if (currentPage >= totalPages - 1 && hasNext) {
      return { action: 'navigate', targetPage: 0 }
    }
  } else {
    if (currentPage <= 0 && hasPrev) {
      return { action: 'navigate', targetPage: isPrevRead ? prevLastPage : 0 }
    }
  }
  return { action: 'stay' }
}
