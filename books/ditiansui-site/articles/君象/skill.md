---
name: junxiang
displayName: 君象判定与官印配合分析器
type: analysis
input: 八字四柱（年柱、月柱、日柱、时柱的天干地支）
output: 君象分析报告（含官星清浊、印星纯杂、君臣相得/失道判定）
description: 基于滴天髓阐微君象篇理论，分析命局中官星（君）与印星（权）的配合质量，判定是否满足"君象"贵格条件
---

## 功能

输入一个八字命局，分析其官星和印星的配合状态——判定"官星清而印星纯"的君臣相得格局，或"官杀混杂印星破损"的君臣失道格局。此技能用于八字格局分析中"官印体系"的专项评估，尤其适用于判断命局的贵气层次。

## 输入

- `year_pillar`：年柱干支（如 "甲子"）
- `month_pillar`：月柱干支（如 "丙寅"）
- `day_pillar`：日柱干支（如 "辛巳"）
- `hour_pillar`：时柱干支（如 "戊子"）
- `day_master`：日主五行（自动提取）
- `gender`：性别（可选）

## 处理逻辑

1. **步骤一：识别官星（君）**
   1. 扫描全局天干地支中的正官和七杀
   2. 区分正官（克日主且阴阳异）和七杀（克日主且阴阳同）
   3. 统计正官和七杀各自的数量和力量
   4. 依据：君象篇【原注】"官星为君"

2. **步骤二：识别印星（权）**
   1. 扫描全局天干地支中的正印和偏印
   2. 统计印星数量和力量
   3. 检查印星是否被财星克制（财克印）
   4. 依据：君象篇【原注】"印星为权"

3. **步骤三：判定"官星清或浊"**
   1. 如果只有正官无七杀 → 官星清
   2. 如果只有七杀无正官 → 官星清（单杀为清）
   3. 如果正官和七杀同时出现 → 官杀混杂（官星浊）
   4. 依据：君象篇【任氏曰】"官星清而印星纯，此君臣相得也"

4. **步骤四：判定"印星纯或杂"**
   1. 如果印星未被财星克 → 印星纯
   2. 如果财星克印星（财星与印星天干相邻或地支相克）→ 印星破损
   3. 如果印星被刑冲 → 印星亦为破损
   4. 依据：君象篇【任氏曰】"官杀混杂，印星破损，此君臣失道也"

5. **步骤五：输出君象整体评估**
   1. 官清印纯 → 君臣相得（贵格）
   2. 官清印破 → 有官无实权（半贵）
   3. 官混印纯 → 小有权势但不安（半凶）
   4. 官混印破 → 君臣失道（凶）

## 输出

```typescript
interface JunxiangAnalysis {
  summary: {
    isJunxiang: boolean // 是否满足君象条件
    quality: 'xiangde' | 'shidao' | 'partial' // 相得/失道/部分
    nobility: 'high' | 'medium' | 'low' // 贵气等级
  }
  official: {
    zhengGuan: number // 正官数量
    qiSha: number // 七杀数量
    isQing: boolean // 是否清（无混杂）
    detail: string
  }
  seal: {
    zhengYin: number // 正印数量
    pianYin: number // 偏印数量
    isChun: boolean // 是否纯（无破损）
    damagedBy: string[] // 破损原因列表
    detail: string
  }
  verdict: {
    status: 'xiangde' | 'shidao' | 'qingguan_po_yin' | 'hun_guan_chun_yin'
    description: string // 命理解读描述
    advice: string // 行运方向建议
  }
}
```
