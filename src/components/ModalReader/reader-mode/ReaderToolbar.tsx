import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { useReaderMode } from '@/hooks/useReaderMode'

interface ReaderToolbarProps {
  progress: { current: number; total: number }
  visible: boolean
}

const MODES: { value: ReturnType<typeof useReaderMode>[0]; label: string }[] = [
  { value: 'scroll', label: '滚动' },
  { value: 'smooth', label: '平滑' },
  { value: 'flip', label: '仿真' },
]

export function ReaderToolbar({ progress, visible }: ReaderToolbarProps) {
  const [mode, setMode] = useReaderMode()
  if (!visible) return null
  return (
    <div className="reader-mode-toolbar" data-testid="reader-mode-toolbar">
      <ButtonGroup>
        {MODES.map(m => (
          <Button
            key={m.value}
            variant={mode === m.value ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setMode(m.value)}
            data-testid={`reader-mode-${m.value}`}
            aria-pressed={mode === m.value}
          >
            {m.label}
          </Button>
        ))}
        <ButtonGroupText>
          {progress.current}/{progress.total}
        </ButtonGroupText>
      </ButtonGroup>
    </div>
  )
}
