/**
 * scripts/fetch-source/format.js — 共享 source.md 格式化纯函数
 *
 * 零依赖,可单测。两 subcommand 共用。
 */

export function normalizeBlankLines(text) {
  return text.replace(/\n{3,}/g, '\n\n').trim()
}

export function cleanContent(text) {
  return text
    .split('\n')
    .filter(line => {
      const t = line.trim()
      return (
        !t ||
        (!/^第\s*[一二三四五六七八九十百千\d]+\s*页\s*$/.test(t) &&
          !/^《[^》]+》.*第\d+章\s*\S/.test(t))
      )
    })
    .join('\n')
}

export function renderAnnotationBlock(block) {
  const blines = block.lines.join('\n').trim()
  if (!blines) return ''
  const parts = blines
    .split('\n\n')
    .map((p, i) => {
      const t = p.trim()
      return t ? (i === 0 ? `> ${block.marker}${t}` : `>\n> ${t}`) : ''
    })
    .filter(Boolean)
  parts.push('')
  return parts.join('\n')
}

// 注家/编辑标记规范化。详见 fetch-sources.js:210-221 的注释。
const ANNOTATION_TRANSFORMS = [
  { re: /^(.{1,4}?)(曰|注|云|断曰|断|解)\s*([：:])\s*(.*)$/, label: m => `【${m[1].trim()}】 ${m[m.length - 1] || ''}` },
  { re: /^《([^》]+)》(?:引诗曰|引诗|云|註|注|歌|舊註曰|舊註)?\s*([：:])\s*(.*)$/, label: m => `【《${m[1]}》】 ${m[m.length - 1] || ''}` },
  { re: /^古歌云\s*[：:]\s*(.*)$/, label: m => `【古歌】 ${m[1] || ''}` },
  { re: /^旧注[曰云]\s*[：:]\s*(.*)$/, label: m => `【旧注】 ${m[1] || ''}` },
  { re: /^诗释\s*[：:]\s*(.*)$/, label: m => `【诗释】 ${m[1] || ''}` },
  { re: /^注释\s*[：:]\s*(.*)$/, label: m => `【原注】 ${m[1] || ''}` },
  { re: /^注解\s*[：:]\s*(.*)$/, label: m => `【原注】 ${m[1] || ''}` },
  { re: /^古赋云\s*[：:]\s*(.*)$/, label: m => `【古赋】 ${m[1] || ''}` },
  { re: /^补曰\s*[：:]\s*(.*)$/, label: m => `【补】 ${m[1] || ''}` },
  { re: /^补日\s*[：:]\s*(.*)$/, label: m => `【补】 ${m[1] || ''}` },
  { re: /^曰\s*[：:]\s*(.*)$/, label: m => `【又】 ${m[1] || ''}` },
  { re: /^又曰\s*[：:]\s*(.*)$/, label: m => `【又】 ${m[1] || ''}` },
  { re: /^眉批\s*[：:]\s*(.*)$/, label: m => `【眉批】 ${m[1] || ''}` },
  { re: /^(类象|属象|从象|化象|照象|返象|鬼象|伏象)$/, label: m => `【楠·${m[1]}】` },
  { re: /^格言\s*[：:]\s*(.*)$/, label: m => `【格言】 ${m[1] || ''}` },
]

function transformAnnotations(rawContent) {
  return rawContent
    .split('\n')
    .map(line => {
      const t = line.trim()
      if (!t) return line
      for (const { re, label } of ANNOTATION_TRANSFORMS) {
        const m = t.match(re)
        if (m) return label(m).trim()
      }
      return line
    })
    .join('\n')
}

export function formatSourceMarkdown(chapterName, rawContent) {
  const normalized = transformAnnotations(rawContent)
  const lines = normalized.split('\n').map(l => l.trim())
  const mainLines = []
  const annotationBlocks = []
  let currentBlock = null,
    inMain = true

  for (const line of lines) {
    if (!line) {
      ;(currentBlock ? currentBlock.lines : mainLines).push('')
      continue
    }

    const markerMatch = line.match(/^【(.+?)】[：:]?\s*(.*)/)
    if (markerMatch) {
      const mName = `【${markerMatch[1]}】`
      if (currentBlock && currentBlock.marker === mName) {
        if (markerMatch[2]) currentBlock.lines.push(markerMatch[2])
        continue
      }
      if (currentBlock) annotationBlocks.push({ ...currentBlock })
      inMain = false
      currentBlock = { marker: mName, lines: markerMatch[2] ? [markerMatch[2]] : [] }
      continue
    }

    const meipiMatch = line.match(/^(眉批|眉注|眉解)[：:](.*)/)
    if (meipiMatch) {
      if (currentBlock) annotationBlocks.push({ ...currentBlock })
      inMain = false
      currentBlock = { marker: `【${meipiMatch[1]}】`, lines: meipiMatch[2] ? [meipiMatch[2]] : [] }
      continue
    }

    const legacy = line.match(/^(.{1,6})(曰|注)[：:]\s*(.*)/)
    if (legacy && !/^第\s*[一二三四五六七八九十百千\d]+\s*页\s*$/.test(line)) {
      if (currentBlock) annotationBlocks.push({ ...currentBlock })
      inMain = false
      currentBlock = { marker: `【${legacy[1].trim()}】`, lines: legacy[3] ? [legacy[3]] : [] }
      continue
    }

    if (inMain) mainLines.push(line)
    else if (currentBlock) currentBlock.lines.push(line)
  }

  if (currentBlock) annotationBlocks.push({ ...currentBlock })

  const parts = [`# ${chapterName}`, '']
  const mainText = mainLines.join('\n').trim()
  if (mainText) parts.push(mainText)
  if (annotationBlocks.length > 0) {
    if (mainText) parts.push('')
    for (const block of annotationBlocks) parts.push(renderAnnotationBlock(block))
  }

  return normalizeBlankLines(parts.join('\n')) + '\n'
}