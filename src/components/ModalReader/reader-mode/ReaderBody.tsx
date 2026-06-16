import { lazy, Suspense } from 'react'
import type { ReaderMode, NavigateWithPage } from './types'
import { ScrollBody } from './ScrollBody'
import { SmoothBody } from './SmoothBody'

const FlipBody = lazy(() =>
  import('./FlipBody').then(m => ({ default: m.FlipBody }))
)

export interface ReaderBodyProps {
  mode: ReaderMode
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  chapters: Array<{ name: string }>
  annotatedBody: string
  proseClass: string
  skillRawText: string
  initialPage?: number
  onClose: () => void
  onNavigate: NavigateWithPage
  gestureEnabled: boolean
  onCrossChapter: (direction: 'prev' | 'next') => void
  measureContainerRef: React.RefObject<HTMLDivElement | null>
}

const FlipFallback = () => (
  <div className="page-wrapper">
    <div className="page-container">
      <div className="loading-center">加载仿真翻页…</div>
    </div>
  </div>
)

export function ReaderBody(props: ReaderBodyProps) {
  const { mode } = props
  if (mode === 'scroll') return <ScrollBody {...props} />
  if (mode === 'smooth') return <SmoothBody {...props} />
  return (
    <Suspense fallback={<FlipFallback />}>
      <FlipBody {...props} />
    </Suspense>
  )
}
