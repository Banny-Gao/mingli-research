---
name: fanju
displayName: 反局判定与逆势风险分析器
type: analysis
input: 八字四柱（年柱、月柱、日柱、时柱的天干地支）
output: 反局风险报告（含日主失令判断、财官攻身评估、逆势风险等级）
description: 基于滴天髓阐微反局篇理论，判断命局是否为反局——日主失令、财官攻身、逆势争旺的凶险格局分析
---

## 功能

输入一个八字命局，识别日主是否"失令受攻"且"反与时争"——即反局的三大特征。此技能用于八字深度分析中的风险识别阶段，辅助判断命局是否存在反局倾向及其凶险程度。

## 输入

- `year_pillar`：年柱干支（如 "庚申"）
- `month_pillar`：月柱干支（如 "甲申"）
- `day_pillar`：日柱干支（如 "甲申"）
- `hour_pillar`：时柱干支（如 "庚午"）
- `day_master`：日主五行（自动从日柱提取）
- `gender`：性别（可选）

## 处理逻辑

1. **步骤一：判断日主是否失令**
   1. 提取月令地支（月柱地支）
   2. 检查月令五行是否克日主（官杀当令）或耗日主（财星当令）
   3. 如果月令克/耗日主 → 标记为"失令"
   4. 依据：反局篇【原注】"日主失令"

2. **步骤二：判断财官是否攻身**
   1. 统计全局财星（日主所克之五行）的力量占比
   2. 统计全局官杀（克日主之五行）的力量占比
   3. 将财官力量总和与日主+印比力量总和对比
   4. 如果财官力量总和 ≥ 日主印比力量总和的2倍 → 标记为"财官攻身"
   5. 依据：反局篇【原注】"财官攻身"

3. **步骤三：判断是否存在"争"的行为**
   1. 如果日主无根但满局印比帮扶 → 不标记为反局（这是普通弱势局）
   2. 如果日主无根且财官势大 → 标记为从格（不争）
   3. 如果日主有弱根但印比衰微 → 标记为"逆势争旺"候选
   4. 依据：反局篇【任氏曰】"不能顺势而行，反与时争，此反也"

4. **步骤四：评估危险等级**
   1. 反局三特征全部满足 → 危险等级: 高
   2. 满足2项 → 危险等级: 中
   3. 满足1项或0项 → 危险等级: 低或无风险
   4. 检查是否有救应（印星化杀、食伤制杀）→ 如果有，降低一个风险等级

5. **步骤五：输出反局分析**
   1. 输出反局三项指标的逐项判定结果
   2. 输出救应机制的存在与否
   3. 输出总体风险评估

## 输出

```typescript
interface FanjuAnalysis {
  summary: {
    isFanJu: boolean;                     // 是否反局
    riskLevel: "high" | "medium" | "low"; // 风险等级
  };
  indicators: {
    shiLing: {                            // 失令判断
      isShiLing: boolean;
      reason: string;
    };
    caiGuanGongShen: {                    // 财官攻身判断
      isGongShen: boolean;
      powerRatio: number;                 // 财官力量/日主力量
      reason: string;
    };
    niShiZhengWang: {                     // 逆势争旺判断
      isZhengWang: boolean;
      reason: string;
    };
  };
  rescue: {
    hasYinHuaSha: boolean;                // 是否有印星化杀
    hasShiShenZhiSha: boolean;            // 是否有食伤制杀
    rescueDetail: string;                 // 救应机制描述
    riskAfterRescue: "high" | "medium" | "low";
  };
}
```
