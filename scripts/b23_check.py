import os, re, sys

files = [
    'books/滴天髓阐微/articles/从象/interpretation.md',
    'books/渊海子平/articles/食神诗诀/interpretation.md',
    'books/渊海子平/articles/时上一位贵格/interpretation.md',
]

authoritative_books = {'子平真诠', '三命通会', '穷通宝鉴', '滴天髓阐微', '神峰通考', '千里命稿', '八字提要', '命理探源', '子平概要'}
classical = {'渊海子平', '渊海', '滴天髓', '滴天髓阐微', '周易', '易经', '诗经', '论语', '孟子', '尚书', '左传', '中庸', '大学',
             '老子', '道德经', '金刚经', '礼记', '荀子', '旧唐书', '说文解字', '说文',
             '洛书', '河图', '黄帝', '大挠'}

def is_specific_chapter(name):
    if len(name) < 2 or len(name) > 12: return False
    if not any(name.endswith(s) for s in ['格', '诗诀', '诗', '论', '赋', '说', '诀', '法']):
        return False
    skip = ['不宜', '相', '类', '神', '本篇', '阳', '阴', '十', '百', '诗', '说', '赋',
            '论', '诀', '法', '格', '印', '食神', '伤官', '七杀', '正官', '偏官', '正财',
            '偏财', '比肩', '劫财', '羊刃', '命造', '格局', '乾', '坤', '人道', '上位',
            '下位', '财星', '官星', '印绶', '阳刚', '阴柔', '坐禄', '建禄', '归禄',
            '禄位', '病', '药', '喜', '忌', '弱格', '坐支', '行运', '元神', '日时',
            '六亲', '六亲进阶', '从格', '从财', '从杀', '从旺', '从儿', '从财格',
            '时上一位', '时上偏官', '时上偏财', '时正财', '时正官', '偏财', '正财',
            '正官', '七杀', '伤官', '印绶', '劫财', '比劫', '食神', '格局十神',
            '清纯', '中和', '贪合', '贪合忘官', '贪财坏印', '兄弟', '比劫分财',
            '暗合', '暗邀', '合官', '合杀', '日主', '印绶', '枭神', '三元', '四生', '四库',
            '专气', '中气', '相持', '上篇', '下篇', '天根', '月窟', '真阳', '未济',
            '既济', '交媾', '交战', '升降', '解', '制', '中男', '中女', '坎', '离',
            '真神', '假神', '真情', '假情', '岁运', '身旺', '身弱', '时支', '时柱',
            '墓', '库', '墓库', '财官', '时墓', '戊', '癸', '庚', '乙', '甲', '丙',
            '辛', '壬', '己', '丁', '藏干', '暗化', '三合', '六合', '三会', '地气',
            '天气', '命理', '命学', '子平', '至和', '至善', '正官格', '七杀格',
            '正财格', '偏财格', '正印格', '偏印格', '食神格', '伤官格', '比肩格',
            '劫财格', '合禄格', '合禄', '禄', '时支',
            '十干', '十天', '十天干', '六甲', '空亡', '天中杀', '旬', '孤虚', '空', '亡',
            '六亲', '六甲旬', '纳音', '海中金', '年柱', '日柱', '时柱', '丙申', '寿元',
            '寿星', '偏印', '枭神', '倒食', '妻妾', '子女', '兄弟', '父母', '六亲',
            '刹', '杀', '孤', '虚', '对宫', '阳支', '阴支', '阳空', '阴空',
            '日主', '时支', '时柱', '六十甲子', '旬', '六甲', '六旬', '八字', '纳音',
            '十干', '十二支', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
            '七', '八', '九', '十', '子', '丑', '寅', '卯', '辰', '巳', '午', '未',
            '申', '酉', '戌', '亥', '羊刃', '天厨', '寿元']
    return not any(sw in name for sw in skip)

for fp in files:
    name = fp.split('/')[-2]
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()

    sys.stdout.write(f'=== {name} ({len(content.splitlines())} 行) ===\n')

    ai = sum(content.count(p) for p in ['本解读', 'SPEC', 'mode_of', '按用户口径'])
    if ai: sys.stdout.write(f'  AI 痕迹 {ai} 处\n')

    minge1 = len(re.findall(r'【命造[一二三四五六七八九十]+\（任氏注）】', content))
    minge2 = len(re.findall(r'\*\*【命造[一二三四五六七八九十]+\（任氏注）】', content))
    minge3 = len(re.findall(r'【命造（原注）】', content))
    minge4 = re.findall(r'【命造[一二三四五六七八九十]+（[^】]+）】', content)
    minge_total = minge1 + minge2 + minge3 + len(minge4)
    if minge_total: sys.stdout.write(f'  命造【任氏注/格式】{minge_total} 处\n')
    for m in minge4[:3]:
        sys.stdout.write(f'      [minge] {m}\n')

    bad_tags = len(re.findall(r'【原文此处[^】]+】', content))
    if bad_tags: sys.stdout.write(f'  元自我标签 {bad_tags} 处\n')

    cross_book = re.findall(r'《([^》]{2,15})》', content)
    seen_book = set()
    for ref in cross_book:
        if ref in classical or ref in authoritative_books:
            continue
        if ref in name or ref in seen_book:
            continue
        for i, line in enumerate(content.splitlines(), 1):
            if f'《{ref}》' in line:
                sys.stdout.write(f'  跨书非经典 line {i}: 《{ref}》: {line[:80]}\n')
                seen_book.add(ref)
                break

    title_refs = re.findall(r'「([^」]{2,30})」', content)
    seen = set()
    for ref in title_refs:
        if ref in seen or not is_specific_chapter(ref):
            continue
        if ref in name or name in ref:
            continue
        for i, line in enumerate(content.splitlines(), 1):
            if f'「{ref}」' in line:
                sys.stdout.write(f'  同书具体跨篇 line {i}: 「{ref}」: {line[:80]}\n')
                seen.add(ref)
                break

    lixi = re.findall(r'(.{8,30})\1{2,}', content)
    if lixi:
        real_lixi = [x for x in lixi if '|' not in x[0]]
        if real_lixi:
            sys.stdout.write(f'  LLM 输出失控 {len(real_lixi)} 处\n')

    cazi = len(re.findall(r'⚠️', content))
    sys.stdout.write(f'  时代局限批注: {cazi}\n')

    full_match = sum(content.count(p) for p in ['完全一致', '完全相同', '皆不出', '皆同此', '最早定型', '最早期的精炼', '定型表述', '最早期的'])
    if full_match: sys.stdout.write(f'  元自我断言 {full_match} 处\n')

    meta_pattern = re.findall(r'>\s*\*\*(?:本篇模式|模式判定|体量定位|底本|体裁|写作模式|本篇性质|典籍定位|写作原则|原文出处|所属典籍|原文体例|原文体量|定位|本题位置|位置|分类定位|卷一·|卷二·|卷三·|卷四·|卷五·|卷六·)\*\*', content)
    if meta_pattern: sys.stdout.write(f'  元数据块【】{len(meta_pattern)} 处: {meta_pattern[0][:60]}\n')
    meta_simple = re.findall(r'^>\s*\*?\*?\s*(?:底本|体裁|写作模式|本篇性质|典籍定位|写作原则|原文出处|所属典籍|原文体例|原文体量|定位|本题位置|位置|分类定位)(?!.*\*\*)', content, re.MULTILINE)
    if meta_simple:
        sys.stdout.write(f'  元数据块 plain {len(meta_simple)} 处\n')
        for m in meta_simple[:3]:
            sys.stdout.write(f'      [meta] {m[:80]}\n')

    sys.stdout.write('\n')
