import { describe, it, expect } from 'vitest'
import { stripTailSelfEval, postProcessOutput } from '../post-process.js'

describe('stripTailSelfEval', () => {
  it('strips trailing 内部自评 block', () => {
    const input = [
      '## 主标题',
      '',
      '> 【原文】某某原文。',
      '',
      '这是正文。',
      '',
      '---',
      '',
      '**内部自评（不写入文件）**：',
      '',
      '- 致命错误：0 项',
      '- 格式错误：0 项',
      '- **合规分：5 分**，通过。',
    ].join('\n')
    const out = stripTailSelfEval(input)
    expect(out).not.toContain('内部自评')
    expect(out).not.toContain('合规分')
    expect(out).not.toContain('致命错误')
    expect(out).toContain('这是正文。')
    expect(out.endsWith('\n')).toBe(true)
  })

  it('strips trailing block starting with 合规分', () => {
    const input = '前面正文部分。\n\n合规分：5 分，通过。'
    const out = stripTailSelfEval(input)
    expect(out).toContain('前面正文部分。')
    expect(out).not.toContain('合规分')
  })

  it('strips trailing block starting with 致命错误 N 项', () => {
    const input = '前面正文。\n\n致命错误（0 项）、格式错误（0 项）。'
    const out = stripTailSelfEval(input)
    expect(out).toContain('前面正文。')
    expect(out).not.toContain('致命错误')
  })

  it('does NOT strip when trigger phrase is in the middle of doc (not tail)', () => {
    // 段起首在文件前 1/3 内 → 不切（保留正文里偶发的自指叙述）
    const input = '前半段讲致命错误 0 项合规情况。' + 'a'.repeat(200) + '\n\n正文部分讲完。'
    const out = stripTailSelfEval(input)
    expect(out).toBe(input)
  })

  it('returns input unchanged when no trigger phrase present', () => {
    const input = '## 标题\n\n这是正常的正文，没有自评尾巴。'
    const out = stripTailSelfEval(input)
    expect(out).toBe(input)
  })

  it('handles empty input', () => {
    expect(stripTailSelfEval('')).toBe('')
  })
})

describe('postProcessOutput', () => {
  it('strips head fence + tail self-eval in one pass', () => {
    const input = [
      '```markdown',
      '## 主标题',
      '',
      '正文内容。',
      '',
      '**内部自评**：',
      '- 致命错误：0 项',
      '- 合规分：5 分',
    ].join('\n')
    const out = postProcessOutput(input)
    expect(out.startsWith('```')).toBe(false)
    expect(out).not.toContain('内部自评')
    expect(out).not.toContain('合规分')
    expect(out).toContain('## 主标题')
    expect(out).toContain('正文内容。')
  })

  it('strips tail fence', () => {
    const input = '## 标题\n\n正文。\n```'
    const out = postProcessOutput(input)
    expect(out).not.toMatch(/\n```\s*$/)
    expect(out).toContain('正文。')
  })
})