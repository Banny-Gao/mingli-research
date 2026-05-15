import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const zh = {
  nav: { home: '首页', notes: '我的笔记', search: '搜索', searchPlaceholder: '搜索篇目、技能、注解内容...' },
  landing: { title: '命理学术中心', subtitle: '经典原文 · 专业注解 · 学术整理', heroBadge: '正统子平学术', metaDesc: '基于《渊海子平》《滴天髓》等正统子平经典，对经典著作进行系统性学术解读。', stats: { books: '典籍', chapters: '总篇章', done: '已解读' }, progress: '已解读 {done} 篇', percent: '{percent}% 完成', footer: 'Hermes Agent · 学术整理' },
  bookApp: { back: '返回典籍首页', heroBadge: '正统子平 · 任铁樵增注本', tabs: { read: '原文解读', skill: '技能库' }, stats: { total: '全篇章', done: '已解读', skills: '技能文件' }, notFound: '404', notFoundMsg: '未找到该典籍' },
  search: { placeholder: '搜索篇目、技能、注解内容...', noQuery: '输入关键词全文搜索篇目和技能', noResults: '未找到「{q}」相关篇目', chapter: '解读', skill: '技能' },
  modal: { interpTitle: '【{name}】原文解读', skillTitle: '【{name}】技能文件', bookmark: '收藏', bookmarked: '已收藏', annotations: '批注', print: '打印' },
  annotations: { title: '批注列表', empty: '选中文字添加批注', emphasis: '重点', question: '疑问', quote: '引用', addNote: '添加批注', editNote: '编辑批注', save: '保存', cancel: '取消' },
  related: { skills: '关联技能', chapters: '相关篇目' },
  notes: { title: '读书笔记', total: '共 {n} 条批注', export: '导出 Markdown', empty: '暂无批注', emptyHint: '在阅读篇目时选中文本添加批注', goRead: '前往阅读 →' },
  theme: { dark: '深色', light: '浅色' },
}

const en = {
  nav: { home: 'Home', notes: 'My Notes', search: 'Search', searchPlaceholder: 'Search chapters, skills...' },
  landing: { title: 'Mingli Research Center', subtitle: 'Classical Texts · Scholarly Annotations', heroBadge: 'Orthodox Ziping Academia', metaDesc: 'Systematic scholarly interpretations of classical works including Yuanhai Ziping and Di Tian Sui.', stats: { books: 'Books', chapters: 'Chapters', done: 'Interpreted' }, progress: '{done} chapters interpreted', percent: '{percent}% complete', footer: 'Hermes Agent · Academic' },
  bookApp: { back: '← Back to Library', heroBadge: 'Orthodox Ziping · Ren Tieqiao Edition', tabs: { read: 'Interpretations', skill: 'Skills' }, stats: { total: 'Total', done: 'Interpreted', skills: 'Skills' }, notFound: '404', notFoundMsg: 'Book not found' },
  search: { placeholder: 'Search...', noQuery: 'Type keywords to search', noResults: 'No results for 「{q}」', chapter: 'Chapter', skill: 'Skill' },
  modal: { interpTitle: '【{name}】Interpretation', skillTitle: '【{name}】Skill', bookmark: 'Bookmark', bookmarked: 'Bookmarked', annotations: 'Notes', print: 'Print' },
  annotations: { title: 'Annotations', empty: 'Select text to annotate', emphasis: 'Emphasis', question: 'Question', quote: 'Quote', addNote: 'Add note', editNote: 'Edit', save: 'Save', cancel: 'Cancel' },
  related: { skills: 'Related Skills', chapters: 'Related Chapters' },
  notes: { title: 'Reading Notes', total: '{n} annotations', export: 'Export Markdown', empty: 'No annotations', emptyHint: 'Select text while reading', goRead: 'Read now →' },
  theme: { dark: 'Dark', light: 'Light' },
}

i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: localStorage.getItem('mingli_lang') || 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
})

export default i18n