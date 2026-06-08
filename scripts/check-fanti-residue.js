import fs from 'node:fs';

// 高频繁体字符清单（OpenCC t2s 中最常见 + 紫微斗数全书抽样）
// 注意：只包含"繁体形态在简体中完全不同"的字符。繁简共享字（码点相同，
// 如 答 U+7B54、黑 U+9ED1）不列入——t2s 不会也不应转换它们。
const FORBIDDEN_FANTI = [
  '數', '體', '學', '會', '經', '過', '還', '進', '與', '說',
  '請', '視', '雜', '響', '導', '記', '應', '單', '當', '條',
  '長', '聲', '實', '機', '頭', '義', '觀', '為', '處', '東',
  '難', '廣', '歷', '顯', '證', '龍', '備', '斷', '嚴', '邊',
  '屬', '陰', '陽', '問', '點', '電', '親', '萬', '頁',
  '張', '師', '飛', '紅', '細', '畫', '節', '蘭', '曆',
  '雲', '黃', '黨', '辭', '辯', '錶', '績', '饑', '驅',
  '鬥', '魚', '龜', '齊', '齒'
];

const FORBIDDEN_SET = new Set(FORBIDDEN_FANTI);

export function findFantiResidue(text) {
  const found = new Set();
  for (const ch of text) {
    if (FORBIDDEN_SET.has(ch)) {
      found.add(ch);
    }
  }
  return Array.from(found);
}

export function checkFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const residue = findFantiResidue(text);
  if (residue.length === 0) return null;
  return { file: filePath, residue };
}
