import type { Plugin } from 'vite'

/**
 * 移动端 rem 适配插件
 *
 * 用法约定：
 * - 在 .css / .less 里无脑写 px（布局尺寸、字号、间距等），插件自动把布局类 px 转成 rem
 *   （1rem = 16px 基准，PC 端 1rem 固定 = 16px，视觉等价；移动端随 html font-size 等比缩放）
 * - 边框 1px、阴影、text-shadow、letter-spacing、transform、@media 断点、背景定位等
 *   装饰/固定值的 px 会保留不转
 * - Tailwind 类名（p-4 / text-lg 等）本身输出 rem，自动走同一套缩放逻辑，无需改
 * - ⚠️ JSX 内联 style={{ }} 是运行时样式，不经过 PostCSS，不会被转换；
 *   请优先用 Tailwind 类，确需内联时自行用 rem 或百分比
 *
 * 两个能力：
 * 1. 在 HTML head 注入一段 CSS：移动端（≤768px）将 html font-size 设为视口宽度函数，
 *    使所有 rem 单位（Tailwind 间距/字号 + 被 PostCSS 转成 rem 的布局尺寸）随屏幕等比缩放。
 *    PC 端（>768px）保持浏览器默认 16px。
 * 2. PostCSS px→rem 转换：把 CSS 里的布局尺寸 px 自动转 rem，非布局装饰性 px 保留。
 */

const BASE_FONT_SIZE = 16 // 1rem = 16px

// 不转 rem 的属性：
// - border/border-width/border-<side>/outline/outline-width：1px 等 hairline 边框宽度
// - box-shadow/text-shadow：装饰性阴影
// - letter-spacing/word-spacing：字距微调
// - transform/filter/backdrop-filter：位移/模糊等装饰
// - background-position/background-size：背景定位
// - stroke/stroke-width：SVG 描边
// - grid-template-columns/rows/columns：网格定义里的 px 通常是固定列宽
// 注意：border-radius 是布局圆角，应该转 rem；所以不能写 ^border，要精确匹配
// 判断一个 CSS 属性是否应该保留 px 不转 rem
function shouldKeepPx(prop: string): boolean {
  const p = prop.toLowerCase()
  // border-radius / border-spacing 是布局尺寸，应该转 rem
  if (p.startsWith('border-radius') || p.startsWith('border-spacing')) return false
  // 其他 border* / outline*（border、border-top、border-width、outline 等）保留 px（hairline 边框）
  if (p.startsWith('border') || p.startsWith('outline')) return true
  return (
    p === 'box-shadow' ||
    p === 'text-shadow' ||
    p === 'letter-spacing' ||
    p === 'word-spacing' ||
    p.startsWith('transform') || // transform 及其子属性（translate/rotate 等值保留 px 装饰效果）
    p === 'filter' ||
    p === 'backdrop-filter' ||
    p === 'background-position' ||
    p === 'background-size' ||
    p === 'grid-template-columns' ||
    p === 'grid-template-rows' ||
    p === 'columns' ||
    p === 'stroke' ||
    p === 'stroke-width'
  )
}

const PX_VALUE_REGEX = /(-?\d*\.?\d+)px/g

const MOBILE_CSS = `
/* === Mobile Rem Adapter === */
@media (max-width: 768px) {
  html {
    /* 以 375px 设计稿为基准：375→16px、414→~17.7px、320→~13.7px；clamp 防极端 */
    font-size: clamp(12px, calc(100vw / 375 * 16), 22px);
  }
}
`

export function remAdapter(): Plugin {
  return {
    name: 'vite-plugin-rem-adapter',
    transformIndexHtml: {
      order: 'pre' as const,
      handler() {
        return [
          {
            tag: 'style',
            attrs: { 'data-rem-adapter': '' },
            children: MOBILE_CSS,
            injectTo: 'head',
          },
        ]
      },
    },
    // PostCSS 插件：在 CSS 被编译（含 minify）前做 px→rem 转换
    config: () => ({
      css: {
        postcss: {
          plugins: [
            {
              postcssPlugin: 'postcss-px-to-rem',
              Once(root) {
                root.walkDecls(decl => {
                  if (!decl.value.includes('px')) return
                  if (shouldKeepPx(decl.prop)) return
                  decl.value = decl.value.replace(PX_VALUE_REGEX, (__, numStr: string) => {
                    const n = parseFloat(numStr)
                    if (n === 0) return '0'
                    const rem = n / BASE_FONT_SIZE
                    return `${Number(rem.toFixed(4))}rem`
                  })
                })
              },
            },
          ],
        },
      },
    }),
  }
}
