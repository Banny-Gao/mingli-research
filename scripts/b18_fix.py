import os, re, sys

fixes = {
    'books/滴天髓阐微/articles/假神/interpretation.md': [
        ('【命造一（任氏注）】', '【命造一（原注附例）】'),
        ('【命造二（任氏注）】', '【命造二（原注附例）】'),
        ('【命造三（任氏注）】', '【命造三（原注附例）】'),
    ],
    'books/渊海子平/articles/正官论/interpretation.md': [
        # line 59 《四言独步》引用 → 笼统
        ('"八月官星、大忌卯丁"——八月酉金是正官，卯木冲酉、丁火克金，是官星两大克物',
         '"八月官星、大忌卯丁"——八月酉金是正官，卯木冲酉、丁火克金，是官星两大克物（与卷五同类诗诀互参）'),
        # line 69 4 个同书具体篇名 → 笼统
        ('与同卷《论偏官即七杀》《论官星太过》《论印绶》《论正财》等篇目互为经纬',
         '与同卷其他十神专论（如偏官、官星太过、印绶、正财等篇目）互为经纬'),
        # 元自我断言 "真官无印" 这种元分析措辞
    ],
}

for fp, replacements in fixes.items():
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
    if content != orig:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        name = fp.split('/')[-2]
        sys.stdout.write(f'✓ {name} 修复完成\n')

# 验证
sys.stdout.write('\n=== 验证 ===\n')
for fp in fixes:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    name = fp.split('/')[-2]
    remaining = []
    for old, _ in fixes[fp]:
        if old in content:
            remaining.append(old[:30])
    sys.stdout.write(f'  {name}: 残留 {len(remaining)} 处\n')
    for r in remaining:
        sys.stdout.write(f'    {r}\n')
