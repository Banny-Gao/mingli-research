// src/components/ModalReader/reader-mode/ReaderSettingsDrawer.tsx
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import type { ReaderMode } from './types'

interface ReaderSettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  readerMode: ReaderMode
  onModeChange: (m: ReaderMode) => void
}

const MODES: { value: ReaderMode; label: string; desc: string }[] = [
  { value: 'scroll', label: '滚动', desc: '纵向连续滚动' },
  { value: 'smooth', label: '平滑翻页', desc: '横向滑动翻页' },
  { value: 'flip', label: '仿真翻页', desc: '3D 卷页效果' },
]

export function ReaderSettingsDrawer({
  open,
  onOpenChange,
  readerMode,
  onModeChange,
}: ReaderSettingsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>阅读设置</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-5">
          {/* 翻页模式 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">翻页模式</p>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map(m => (
                <Button
                  key={m.value}
                  variant={readerMode === m.value ? 'default' : 'outline'}
                  size="sm"
                  className="h-auto flex-col gap-0.5 py-3"
                  onClick={() => onModeChange(m.value)}
                  data-testid={`reader-mode-${m.value}`}
                >
                  <span className="text-sm font-medium">{m.label}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">{m.desc}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* 预留：字体大小 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              字体大小 <span className="text-xs text-muted-foreground/60 ml-1">即将上线</span>
            </p>
            <div className="h-2 rounded-full bg-muted/50" />
          </div>

          {/* 预留：行间距 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              行间距 <span className="text-xs text-muted-foreground/60 ml-1">即将上线</span>
            </p>
            <div className="h-2 rounded-full bg-muted/50" />
          </div>

          {/* 预留：阅读主题 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              阅读主题 <span className="text-xs text-muted-foreground/60 ml-1">即将上线</span>
            </p>
            <div className="flex gap-2">
              {['#fff', '#f5f0e8', '#1a1a2e'].map((color, i) => (
                <div
                  key={i}
                  className="size-6 rounded-full border opacity-30"
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
