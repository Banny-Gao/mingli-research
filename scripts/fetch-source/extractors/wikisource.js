/**
 * wikisource 提取器 + 预处理
 *
 * parseFullView: 全览页 HTML → {volume, name, content} 数组
 * preprocessWikisourceContent: wikisource 原文里的"希夷先生曰/答曰:"统一为"【XX】"标记
 *   (原 fetch-wikisource.js:285-303 的 namedComment/answerMatch 规则)
 */

export function parseFullView(html) {
  let body = ''
  const parserMatch = html.match(/<div[^>]*class="[^"]*mw-parser-output[^"]*"[^>]*>([\s\S]+)$/i)
  if (parserMatch) {
    body = parserMatch[1]
    const trimRe =
      /<div[^>]*(?:id="(?:catlinks|mw-data-after-content|license)"|class="[^"]*printfooter)/i
    const trimMatch = body.match(trimRe)
    if (trimMatch) body = body.slice(0, trimMatch.index)
  }
  if (!body) {
    const altMatch = html.match(/<div[^>]*id="bodyContent"[^>]*>([\s\S]+)$/i)
    if (!altMatch) return null
    body = altMatch[1]
  }
  if (!body) return null

  const stripHtmlTags = h => h.replace(/<[^>]+>/g, '')
  const chapters = []
  let currentVolume = ''
  let currentChapter = null

  const sections = body.split(/(?=<div\s+class="mw-heading\s+mw-heading[234])/i)

  for (const section of sections) {
    const h2Match = section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
    const h3Match = section.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)
    const h4Match = section.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i)

    if (h2Match) {
      currentVolume = stripHtmlTags(h2Match[1]).replace(/\[编辑\]/g, '').trim()
      continue
    }

    const heading = h3Match || h4Match
    if (heading) {
      if (currentChapter && currentChapter.content.trim()) {
        chapters.push(currentChapter)
      }
      currentChapter = {
        volume: currentVolume,
        name: stripHtmlTags(heading[1]).replace(/\[编辑\]/g, '').trim(),
        content: '',
      }
    }

    if (currentChapter) {
      const pMatches = section.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)
      if (pMatches) {
        for (const p of pMatches) {
          let text = stripHtmlTags(p).trim()
          text = text.replace(/\[编辑\]/g, '').trim()
          if (text) currentChapter.content += text + '\n\n'
        }
      }
      const poemMatches = section.match(/<div\s+class="poem">([\s\S]*?)<\/div>/gi)
      if (poemMatches) {
        for (const poem of poemMatches) {
          const poemText = stripHtmlTags(poem).trim()
          if (poemText) currentChapter.content += poemText + '\n\n'
        }
      }
    }
  }

  if (currentChapter && currentChapter.content.trim()) {
    chapters.push(currentChapter)
  }
  return chapters
}

export function preprocessWikisourceContent(text) {
  // 把 wikisource 原文里"某某先生曰:" / "答曰:"统一成"【XX】"标记
  // 由共用 format.js 的 markerMatch 进一步接管并加 "> " 与空行
  return text
    .split('\n')
    .map(line => {
      const t = line.trim()
      if (!t) return line
      const namedComment = t.match(/^(.{2,8}(?:先生|真人|道人|曰))[：:]\s*(.*)/)
      if (namedComment && !/^(歌曰|例曰|眉批)/.test(namedComment[1])) {
        return `【${namedComment[1]}】 ${namedComment[2] || ''}`.trim()
      }
      const answerMatch = t.match(/^答曰[：:]\s*(.*)/)
      if (answerMatch) {
        return `【答曰】 ${answerMatch[1] || ''}`.trim()
      }
      return line
    })
    .join('\n')
}
