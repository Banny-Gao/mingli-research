---
name: shunju
displayName: 顺局判定与顺势分析器
type: analysis
input: 八字四柱（年柱、月柱、日柱、时柱的天干地支）
output: 顺局判定报告（含顺局/从旺区分、旺势方向、用神喜忌、岁运建议）
description: 基于滴天髓阐微顺局篇理论，判断命局是否为顺局——日主健旺、印比成势时的顺势分析与时运建议
---

## 功能

输入一个八字命局，输出该命局的顺局判定结果。此技能在执行全局五行力量评估后，识别日主是否健旺、印比是否成势、是否满足"顺势而行"的条件。用于八字格局分析中"极旺格局"的判断场景。

## 输入

- `year_pillar`：年柱干支（如 "癸卯"）
- `month_pillar`：月柱干支（如 "甲寅"）
- `day_pillar`：日柱干支（如 "甲寅"）
- `hour_pillar`：时柱干支（如 "乙亥"）
- `day_master`：日主五行（自动从日柱提取，如 "甲木"）
- `gender`：性别（可选，用于排大运方向）

## 处理逻辑

1. **步骤一：评估日主强弱**
   1. 统计全局五行力量分布（天干+地支+藏干）
   2. 检查日主是否有强根（地支本气是否与日主同五行）
   3. 检查日主是否得月令（月支本气是否与日主同五行或生日主）
   4. 依据：顺局篇【原注】"日主健旺"

2. **步骤二：检查印比趋势**
   1. 统计印星（生我者）和比劫（同我者）的数量与力量
   2. 判断印比是否占全局主导（印比力量 > 全局其他力量总和）
   3. 依据：顺局篇【原注】"印比帮身"

3. **步骤三：区分顺局与从旺**
   1. 如果日主无根（地支无本气、中气、余气同五行）→ 判定为从旺，不适用顺局
   2. 如果日主有根且印比成势 → 判定为顺局候选
   3. 依据：顺局篇【任氏曰】"从旺者日主无根，不得不从；顺局者日主健旺，有力自主"

4. **步骤四：判断顺势方向**
   1. 识别全局中最旺的五行（印星所属五行或比劫所属五行）
   2. 顺着旺势方向定用神取向
   3. 标记逆势方向（旺势所克的五行）为最忌
   4. 依据：顺局篇【任氏曰】"顺势而行，不与时争，此顺也"

5. **步骤五：输出岁运建议**
   1. 喜：与旺势方向一致的岁运（扶旺势）
   2. 忌：逆旺势方向的岁运（克旺势或反其道而行之）

## 输出

```typescript
interface ShunjuAnalysis {
  summary: {
    dayMaster: string;                    // 日主
    isShunJu: boolean;                    // 是否顺局
    confidence: "high" | "medium" | "low"; // 判定置信度
  };
  strength: {
    hasRoot: boolean;                     // 是否有强根
    inSeason: boolean;                    // 是否得令
    yinBiRatio: number;                   // 印比占比（0~1）
  };
  distinction: {
    type: "shunju" | "congwang" | "normal";
    reason: string;                       // 判定理由
  };
  trendDirection: {
    strongestElement: string;             // 最旺五行
    shunDirection: string;               // 顺势方向
    avoidDirection: string;               // 应避免方向
  };
  yongShen: {
    yong: string[];                       // 用神（围绕旺势的扶助神）
    xi: string[];                         // 喜神
    ji: string[];                         // 忌神
  };
  luckAdvice: {
    favorable: string[];                  // 有利岁运
    unfavorable: string[];                // 不利岁运
  };
}
```
