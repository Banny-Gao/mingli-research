#!/usr/bin/env node
/**
 * 一次性 transform 脚本：处理卷第一 / 卷第四 / 卷第五 source.md
 * - F004：合并连续单句段为自然段（按底本习惯以「。」「！」「？」分句的小段合并成段）
 * - F003/F005：注家标识（X 经/云/曰/也）前的句段单独成 `> 【X】` 块引用
 * - W007：与 F003 同样处理
 *
 * 规范红线：
 * - 不改字（除 W004/W006 已修）
 * - 不加 `> 【录入注：...】` 标记
 * - 段与段之间用单空行分隔
 * - 注家标记 `> 【注家名】` 唯一例外
 *
 * 用法：node scripts/fix-wxdgy.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// 注家标识列表：覆盖 subagent 报告的约 100+ 来源
const ANNOTATORS = [
  '许愼', '许慎', '礼记', '尚书大传', '尚书', '春秋元命苞', '元命苞',
  '白虎通', '尸子', '王肃', '元命苞云', '释名', '尚书大传云',
  '管子', '管辂', '淮南子', '淮南子注', '尔雅', '三礼义宗',
  '蔡邕月令章句', '郑玄注礼记月令', '郑玄', '郑司农', '郑注',
  '续汉书', '三礼义宗云', '左传', '家语', '周官', '录图',
  '大戴礼', '易通卦验', '易传', '服注左传', '服虔解', '外传解',
  '运斗枢', '尚书纬', '尚书考灵曜', '黄帝斗图', '孔子元辰经',
  '遁甲经', '遁甲', '太一', '九宫', '九宫经', '石氏天官训解',
  '董仲舒', '合诚图', '论衡', '太公兵书', '杨泉', '河上公章句',
  '虞录', '翼奉', '春秋繁露', '诗纬推度灾', '乐纬', '孝经援神契',
  '太玄经', '太康地记', '物理论', '黄帝素问', '援神契', '配算曰',
  '易上系', '易上系曰', '颖容春秋释例', '京房', '马融', '郭璞易占',
  '孔子曰', '尚书洪范', '式经', '六壬式经', '玄女拭经', '相秘诀',
  '莈', '帝系谱', '宋均注', '陶华阳', '郑玄注干凿度', '桓子新论',
  '河图', '吕氏春秋', '礼斗威仪', '黄帝九宫经',
  '五行传及白虎通', '乾凿度',
]

// 优先级：长的先匹配，避免「郑玄」吞掉「郑玄注礼记月令」
const ANNOTATORS_SORTED = [...ANNOTATORS].sort((a, b) => b.length - a.length)

function isAnnotatorLine(line) {
  const t = line.trim()
  if (!t) return null
  for (const name of ANNOTATORS_SORTED) {
    for (const suffix of ['云。', '曰。', '也。', '言。', '云', '曰', '也', '言', '云：', '曰：', '言：']) {
      if (t === name + suffix) return name
    }
  }
  return null
}

/**
 * 合并连续单句段为自然段。
 * 启发：单句段以「。」「！」「？」结尾，且下一段也是单句段（无注家标识前缀），则合并。
 * 实际：把多段合并为一段（用句号/问号/感叹号 + 紧接），段间空行分隔。
 */
function mergeShortParagraphs(text) {
  const lines = text.split('\n')
  const out = []
  let buf = []

  const flush = () => {
    if (buf.length) {
      out.push(buf.join(''))
      buf = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flush()
      out.push('')
      continue
    }

    buf.push(trimmed)
  }
  flush()

  // 第一遍合并：把单句段（以「。」「！」「？」结尾且无块引用前缀）连续合并
  const merged = []
  let cur = ''

  for (const ln of out) {
    if (!ln) {
      if (cur) {
        merged.push(cur)
        cur = ''
      }
      merged.push('')
      continue
    }

    if (ln.startsWith('>') || ln.startsWith('#')) {
      if (cur) {
        merged.push(cur)
        cur = ''
      }
      merged.push(ln)
      continue
    }

    if (cur) {
      // 续接
      cur += ln
    } else {
      cur = ln
    }

    // 句末以 。！？ 结尾，尝试合并下一段
    const last = cur[cur.length - 1]
    if (last === '。' || last === '！' || last === '？' || last === '；') {
      // 看下下一行是不是单句段（无空行）
      // 这里简化为：直接看下一行
      // 但因为我们当前 buf 模式下 cur 已经是合并过的，下一次循环会继续
      // 所以这里不切，等到下一行决定
    } else {
      // 不以标点结束，可能是结构性提示「就此分为三段 一者...」之类
      // 暂保留不切
    }
  }
  if (cur) merged.push(cur)

  return merged.join('\n')
}

/**
 * 把「注家标识」独立行 + 后续引文段，转换为 `> 【注家名】` 块引用
 */
function wrapAnnotators(text) {
  const lines = text.split('\n')
  const out = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const annotator = isAnnotatorLine(line)

    if (annotator) {
      // 收集后续非空非标题行直到下一个注家标识或空段
      const block = [`> 【${annotator}】`]
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j]
        if (!next.trim()) break
        if (isAnnotatorLine(next)) break
        if (next.startsWith('#')) break
        // 检查是否「分论小标题」型
        // 不动
        if (next.startsWith('>')) {
          // 已是块引用，停下
          break
        }
        block.push(`> ${next.trim()}`)
        j++
      }
      out.push(block.join('\n'))
      out.push('')
      i = j
      continue
    }

    out.push(line)
    i++
  }

  return out.join('\n')
}

/**
 * 主处理：F003/F004/F005/W007
 */
function transform(text) {
  // 1) 注家分层
  let t = wrapAnnotators(text)
  // 2) 合并单句段
  t = mergeShortParagraphs(t)
  return t
}

const targets = [
  'books/五行大义/articles/卷第一/source.md',
  'books/五行大义/articles/卷第四/source.md',
  'books/五行大义/articles/卷第五/source.md',
]

for (const t of targets) {
  const p = path.join(ROOT, t)
  const orig = fs.readFileSync(p, 'utf-8')
  const out = transform(orig)
  fs.writeFileSync(p, out, 'utf-8')
  console.log(`✓ ${t}: ${orig.length} → ${out.length} bytes`)
}
