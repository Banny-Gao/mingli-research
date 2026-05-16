---
name: zhanju
displayName: 战局分析与制化判定器
type: analysis
input: 八字四柱（年柱、月柱、日柱、时柱的天干地支）
output: 战局分析报告（含对抗识别、力量对比、制化评估、吉凶结论）
description: 基于滴天髓阐微战局篇理论，识别命局中的两神交战形态，评估制化条件并判断战局吉凶
---

## 功能

输入一个八字命局，识别是否存在"两神交战"（官杀相战、财印相战等对抗性五行关系），然后评估制化条件——"制"（以强克弱）和"化"（引入第三方疏导）是否得宜。用于八字格局深度分析中，评估命局内部对抗性力量的平衡状态。

## 输入

- `year_pillar`：年柱干支（如 "壬申"）
- `month_pillar`：月柱干支（如 "戊申"）
- `day_pillar`：日柱干支（如 "甲申"）
- `hour_pillar`：时柱干支（如 "丙寅"）
- `day_master`：日主五行（自动提取）
- `gender`：性别（可选）

## 处理逻辑

1. **步骤一：识别对抗性关系**
   1. 扫描全局五行力量分布，找出两种最强的五行
   2. 检查这两种五行是否相克（相克才构成"战局"）
   3. 识别战局类型：
      - 金木相战 → 标记为"官杀相战"（如果涉及克日主）
      - 土水相战 → 标记为"财印相战"（财克印方向）
      - 其他五行相克 → 标记为"五行相战"并注明具体关系
   4. 依据：战局篇【原注】"官杀相攻，财印相战"

2. **步骤二：评估双方力量对比**
   1. 计算战局双方各自的总力量（天干+地支+藏干加权）
   2. 评估哪方得月令（得令者强）
   3. 评估哪方得地（通根多者强）
   4. 输出力量对比：均势 / A方占优 / B方占优
   5. 依据：战局篇【任氏曰】"须观其胜负之势"

3. **步骤三：检查制化条件**
   1. 检查"制"的条件：
      - 是否存在可克制冲突一方且本身力量足够的第三方五行
      - 例如：官杀相战时，是否有食伤（火制金、土制水等）
   2. 检查"化"的条件：
      - 是否存在可疏导双方冲突的第三方五行
      - 例如：财印相战时，是否有比劫（比劫克财护印）或官杀（泄财生印）
   3. 依据：战局篇【原注】"制化得宜，则战局成和；制化失宜，则战局成凶"

4. **步骤四：定吉凶结论**
   1. 制化条件充足 + 制化力量够强 → 战局成和（吉）
   2. 制化条件缺失或力量不足 → 战局成凶（凶）
   3. 制化条件部分存在 → 战局待时（需岁运辅助）

## 输出

```typescript
interface ZhanjuAnalysis {
  summary: {
    hasBattle: boolean;                   // 是否存在战局
    battleType: "guansha" | "caiyin" | "other" | null; // 战局类型
    verdict: "he" | "xiong" | "pending";  // 结论：和/凶/待时
  };
  forces: {
    sideA: {
      element: string;                    // 五行A
      strength: number;                   // 力量值
      advantage: boolean;                 // 是否有优势
    };
    sideB: {
      element: string;                    // 五行B
      strength: number;
      advantage: boolean;
    };
    powerRatio: string;                   // 力量对比描述
  };
  control: {
    zhiCondition: {                       // 制条件
      exists: boolean;
      elements: string[];                 // 可克制的一方
      sufficient: boolean;                // 力量是否足够
    };
    huaCondition: {                       // 化条件
      exists: boolean;
      mediator: string;                   // 调停五行
      sufficient: boolean;
    };
  };
  advice: string;                         // 行运建议
}
```
