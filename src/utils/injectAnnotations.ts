export interface AnnotationData {
  selectedText: string
  matchIndex?: number
  rangeStart: number
  type: string
  id: string
}

/**
 * 注入批注高亮到 HTML 字符串
 * @param html - 原始 HTML 字符串
 * @param annotations - 批注数组
 * @returns 注入高亮标记后的 HTML
 */
export function injectAnnotations(html: string, annotations: AnnotationData[]): string {
  if (annotations.length === 0 || typeof document === 'undefined') return html
  const div = document.createElement('div')
  div.innerHTML = html

  for (const ann of annotations) {
    // Determine which occurrence of the text to mark.
    // Use matchIndex if available (new data), otherwise derive from rangeStart (legacy).
    let targetOccurrence = 0
    if (ann.matchIndex !== undefined) {
      targetOccurrence = ann.matchIndex
    } else {
      const plainText = div.textContent || ''
      let searchPos = 0
      while (true) {
        const idx = plainText.indexOf(ann.selectedText, searchPos)
        if (idx === -1 || idx >= ann.rangeStart) break
        targetOccurrence++
        searchPos = idx + 1
      }
    }

    // Walk DOM to find the target occurrence
    let currentOccurrence = 0
    const walk = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeText = node.textContent || ''
        let localSearchStart = 0
        while (true) {
          const foundIdx = nodeText.indexOf(ann.selectedText, localSearchStart)
          if (foundIdx === -1) break

          if (currentOccurrence === targetOccurrence) {
            const before = nodeText.slice(0, foundIdx)
            const marked = nodeText.slice(foundIdx, foundIdx + ann.selectedText.length)
            const after = nodeText.slice(foundIdx + ann.selectedText.length)
            const mark = document.createElement('mark')
            mark.className = `ann-${ann.type}`
            mark.dataset.annId = ann.id
            mark.textContent = marked
            const frag = document.createDocumentFragment()
            frag.appendChild(document.createTextNode(before))
            frag.appendChild(mark)
            frag.appendChild(document.createTextNode(after))
            node.parentNode?.replaceChild(frag, node)
            return true
          }

          currentOccurrence++
          localSearchStart = foundIdx + 1
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (walk(node.childNodes[i])) return true
        }
      }
      return false
    }
    walk(div)
  }
  return div.innerHTML
}