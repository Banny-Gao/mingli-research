---
name: heju
displayName: 合局吉凶判定器
type: analysis
input: 八字四柱（年柱、月柱、日柱、时柱的天干地支）
output: 合局分析报告（含合的类型、合的力度、吉凶判定、对格局的影响）
description: 基于滴天髓阐微合局篇理论，识别命局中所有天干五合、地支六合、地支三合，判定是否"合而有情"或"合而绊之"
---

## 功能

输入一个八字命局，扫描其中的所有合局关系——天干五合、地支六合、地支三合（含半合）。对每个合局，评估其吉凶属性：是否合成了有用之神（有情则吉），是否牵绊了有用之神（绊之则凶）。用于八字格局分析中的"合局影响评估"环节。

## 输入

- `year_pillar`：年柱干支（如 "癸亥"）
- `month_pillar`：月柱干支（如 "乙卯"）
- `day_pillar`：日柱干支（如 "甲午"）
- `hour_pillar`：时柱干支（如 "甲子"）
- `day_master`：日主五行（自动提取）
- `gender`：性别（可选）

## 处理逻辑

1. **步骤一：扫描天干五合**
   1. 检查四天干中是否存在五合配对：
      - 甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火
   2. 记录每组合：参与的天干、化神、是否紧邻
   3. 依据：合局篇【原注】"干支相合也"

2. **步骤二：扫描地支六合**
   1. 检查四地支中是否存在六合配对：
      - 子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合土
   2. 记录每组合局：参与的地支、化神、是否被冲
   3. 依据：合局篇【原注】"六合三合，合而成局"

3. **步骤三：扫描地支三合**
   1. 检查四地支中是否存在三合配对：
      - 申子辰合水、亥卯未合木、寅午戌合火、巳酉丑合金
   2. 检查是否存在半合（缺一支的三合）：
      - 申子半合、子辰半合、亥卯半合、卯未半合等
   3. 记录每组合局的完整度和化神

4. **步骤四：判定合的吉凶**
   1. 确定用神（基于全局旺衰判断）
   2. 对每个合局评估：
      - 合化之神是否等于用神 → 合而有情（吉）
      - 合化之神是否等于忌神 → 合而绊之（凶）
      - 合局是否牵制了用神（如合住了用神所在的天干）→ 合而绊之（凶）
   3. 依据：合局篇【任氏曰】"合而有情则吉，合而绊之则凶"

5. **步骤五：全局合局综合评估**
   1. 汇总所有合局的吉凶判定
   2. 评估合局对整体格局的影响（提升/削弱/不变）
   3. 输出合局总体结论

## 输出

```typescript
interface HejuAnalysis {
  summary: {
    totalHeCount: number;                 // 合局总数
    favorableCount: number;               // 有利合局数
    unfavorableCount: number;             // 不利合局数
    overall: "favorable" | "unfavorable" | "neutral"; // 总体评价
  };
  tianGanHe: Array<{
    pair: string;                         // 配对（如 "丙辛"）
    huaShen: string;                      // 化神
    adjacent: boolean;                    // 是否紧邻
    effect: "qing" | "ban" | "neutral";  // 有情/绊之/中性
    reason: string;
  }>;
  diZhiLiuHe: Array<{
    pair: string;                         // 配对（如 "子丑"）
    huaShen: string;
    isChong: boolean;                     // 是否被冲
    effect: "qing" | "ban" | "neutral";
    reason: string;
  }>;
  diZhiSanHe: Array<{
    triplet: string[];                    // 三支（如 ["申","子","辰"]）
    completeness: "full" | "half";        // 完整/半合
    huaShen: string;
    effect: "qing" | "ban" | "neutral";
    reason: string;
  }>;
  impact: {
    onPattern: string;                    // 对格局的影响描述
    onYongShen: string;                   // 对用神的影响描述
  };
}
```
