// src/components/ReadingTools/extractTOC.ts
function mdId(text: string): string {
  return text
    .replace(/[^\w一-鿿\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

export function extractTOC(text: string): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = []
  const htmlRegex = /<h([23])[^>]+id="([^"]+)"[^>]*>([^<]+)<\/h[23]>/gi
  let match
  while ((match = htmlRegex.exec(text)) !== null) {
    toc.push({ id: match[2], text: match[3].trim(), level: parseInt(match[1]) })
  }
  if (toc.length > 0) return toc
  for (const line of text.split('\n')) {
    const m = line.match(/^(#{2,3})\s+(.+)$/)
    if (m) {
      const level = m[1].length
      const headingText = m[2].trim()
      toc.push({ id: mdId(headingText), text: headingText, level })
    }
  }
  return toc
}
