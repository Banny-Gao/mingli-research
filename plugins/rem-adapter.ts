import type { Plugin } from 'vite'

/**
 * 移动端 rem 适配插件
 *
 * 原理：在移动端（≤768px）通过 CSS 将 html 的 font-size 设为视口宽度的函数，
 * 使所有 rem 单位（Tailwind 的间距、尺寸等）随屏幕宽度等比缩放。
 * PC 端保持默认 16px，不受影响。
 */
export function remAdapter(): Plugin {
  const VIRTUAL_ID = '\0virtual:rem-adapter'
  const css = `
/* === Mobile Rem Adapter === */
/* 仅在移动端生效，PC 端（>768px）保持浏览器默认 16px */
@media (max-width: 768px) {
  html {
    /*
     * 以 375px 设计稿为基准：
     *   375px → 1rem = 16px（与默认一致）
     *   414px → 1rem ≈ 17.66px（等比放大 ~10%）
     *   320px → 1rem ≈ 13.65px（等比缩小 ~15%）
     *
     * clamp 防止极端尺寸下的字体过小或过大
     */
    font-size: clamp(12px, calc(100vw / 375 * 16), 22px);
  }
}
`

  return {
    name: 'vite-plugin-rem-adapter',
    resolveId(source) {
      if (source === VIRTUAL_ID) return source
    },
    load(source) {
      if (source === VIRTUAL_ID) return css
    },
    transformIndexHtml: {
      order: 'pre' as const,
      handler() {
        return [
          {
            tag: 'style',
            attrs: { 'data-rem-adapter': '' },
            children: css,
            injectTo: 'head',
          },
        ]
      },
    },
  }
}
