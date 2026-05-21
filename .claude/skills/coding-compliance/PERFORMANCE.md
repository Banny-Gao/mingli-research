# 性能监控检测

## 检测项清单

| 检测项          | 说明                                                          | 相关规则 |
| --------------- | ------------------------------------------------------------- | -------- |
| 内存泄漏        | 未清理的 addEventListener / setTimeout / IntersectionObserver | TM-1     |
| 频繁重渲染      | useEffect 计数警告 / React DevTools                           | H-2      |
| 长任务          | PerformanceObserver 监听 longtask > 50ms                      | L-3      |
| 卡顿帧          | requestAnimationFrame + performance.now() 计算帧率            | B-1      |
| Core Web Vitals | LCP > 2.5s / FID > 100ms / CLS > 0.1                          | B-4      |

## 检测实现

### 内存泄漏检测

```tsx
// 自动检测：useEffect 返回函数是否清理了所有副作用
const hasCleanup = effectReturn !== undefined
const hasListener = effectBody.includes('addEventListener')
const hasClear = effectBody.includes('removeEventListener')
// 若有 listener 但无 clear → Warning TM-1
```

### 长任务检测

```tsx
// 在性能监控组件中植入
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('[Performance] Long task:', entry.duration, 'ms')
    }
  }
})
observer.observe({ entryTypes: ['longtask'] })
```

### 卡顿帧检测

```tsx
let lastTime = performance.now()
let frameCount = 0

const checkFrame = (currentTime: number) => {
  if (currentTime - lastTime > 20) {
    // > 2 frames @ 60fps
    console.warn('[Performance] Frame drop:', currentTime - lastTime, 'ms')
  }
  lastTime = currentTime
  frameCount++
  requestAnimationFrame(checkFrame)
}
requestAnimationFrame(checkFrame)
```

## 报告格式

```json
{
  "performance": {
    "memory_leaks": [
      { "file": "src/components/X.tsx", "line": 42, "type": "setTimeout", "uncleared": true }
    ],
    "long_tasks": [{ "duration": 85, "threshold": 50, "file": "src/hooks/useSearch.ts" }],
    "frame_drops": [{ "drop_ms": 45, "file": "src/components/ModalReader.tsx", "line": 120 }]
  }
}
```
