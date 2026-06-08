import { useEffect, useState } from 'react'

/**
 * 响应式媒体查询。返回 boolean，初始值用传入函数首屏同步计算，
 * 之后监听 matchMedia 在断点跨越时即时更新。
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = () =>
    typeof window !== 'undefined' && window.matchMedia(query).matches

  const [matches, setMatches] = useState<boolean>(getMatch)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const update = () => setMatches(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [query])

  return matches
}
