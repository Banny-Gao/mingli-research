---
name: zinv
displayName: 子女运势分析器
type: analysis
input: 八字四柱
output: 子女运势分析报告
description: 基于滴天髓子女篇的食伤理论，分析命局的子女星定位、食伤旺衰与子息吉凶
---

## 功能

当需要分析一个人的子女运势（包括子女数量趋势、子女成就、亲子关系）时使用此技能。核心方法是：食神为子、伤官为女，通过食伤的旺衰与日主的配合判断子息吉凶。此技能应在完成基础八字排盘（日主旺衰、用神喜忌）之后调用。

## 输入

- **四柱八字**：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如"甲子 丙寅 甲申 丙寅"）
- **大运流年**：当前所处的十年大运和流年（可选，用于看岁运对子女运势的引动）

## 处理逻辑

1. **确定子女星**
   a. 从八字中找出食神（日主所生且阴阳相异）和伤官（日主所生且阴阳相同）
   b. 食神标记为子星，伤官标记为女星
   c. 记录食伤的天干透出和地支暗藏情况
   d. **依据**：子女篇【原注】"食神为子，伤官为女"

2. **评估食伤旺衰**
   a. 检查食伤是否得月令（月令为食伤当令则旺）
   b. 检查食伤是否有根（地支有无长生、禄、库）
   c. 检查食伤是否受冲克（被印星克制、被官杀盗气）
   d. 判定：
   - 满足 a+b → "健旺"
   - 不满足 a 且不满足 b 或 c 满足 → "衰颓"
     e. **依据**：子女篇【原注】"子息吉凶，以食伤之强弱定之"

3. **评估子女宫（时柱）**
   a. 检查时柱的干支是否为喜用
   b. 检查时柱是否受冲刑
   c. 检查时柱的十神配置
   d. 宫星配合：时柱为子女宫，宫吉星旺则子女有成
   e. **依据**：子女篇【开篇】"子息吉凶，以宫度断"

4. **评估日主与食伤的配合**
   a. 日主身旺、食伤有情 → 子女得力
   b. 日主身弱、食伤泄身过重 → 子女成为负担
   c. **依据**：子女篇【任氏曰】"须观食神伤官与日主之配合"

## 输出

```typescript
interface ZiNvReport {
  /** 子女星 */
  childrenStar: {
    shiShen: {
      // 食神（子星）详情
      present: boolean
      count: number // 透出数量
      strength: '旺' | '中' | '弱'
      position: string // 出现在哪个柱
    }
    shangGuan: {
      // 伤官（女星）详情
      present: boolean
      count: number
      strength: '旺' | '中' | '弱'
      position: string
    }
    overall: '健旺' | '衰颓' | '适中'
  }
  /** 子女宫（时柱） */
  childPalace: {
    stem: string
    branch: string
    isXiYong: boolean // 时柱是否为喜用
    isChong: boolean // 时柱是否受冲
    assessment: '吉' | '平' | '凶'
  }
  /** 日主配合 */
  peiHe: {
    riZhuStrength: string
    canSustain: boolean // 日主是否能承受食伤之泄
    assessment: string // 配合描述
  }
  /** 子女总体结论 */
  conclusion: {
    grade: '上吉' | '中吉' | '中平' | '下吉' | '凶'
    summary: string // 1-2句话总结子女运势
    keyFactor: string // 影响子女运势的关键因素
  }
}
```
