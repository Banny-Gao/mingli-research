// Auto-generated — do not edit manually
export default `---
name: fumu
displayName: 父母运势分析器
type: analysis
input: 八字四柱
output: 父母运势分析报告
description: 基于滴天髓父母篇的印财理论，分析命局的父母星定位、印财清浊与父母吉凶
---

## 功能

当需要分析一个人的原生家庭运势（包括父母健康、父母缘分、父母对自己的影响）时使用此技能。核心方法是：印星为母、财星为父，通过印财与日主的配合判断父母吉凶。此技能应在完成基础八字排盘（日主旺衰、用神喜忌）之后调用。

## 输入

- **四柱八字**：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如"壬辰 戊申 乙未 丙子"）
- **大运流年**：当前所处的十年大运和流年（可选，用于看岁运对父母运势的引动）

## 处理逻辑

1. **确定父母星**
   a. 从八字中找出印星（正印/偏印）作为母星——生我者
   b. 从八字中找出财星（正财/偏财）作为父星——我克者
   c. 记录印星和财星的五行、位置（年/月/日/时）、透出/暗藏状态
   d. **依据**：父母篇【原注】"印星为母，财星为父"

2. **确定父母宫（年柱）**
   a. 标记年柱干支及其十神属性
   b. 判断年柱是否为喜用神
   c. 检查年柱是否受冲刑
   d. **依据**：父母篇【原注】"父母吉凶，以宫度断之"

3. **评估印财清浊**
   a. 清正条件：
      - 印星不被财星克破
      - 财星不被比劫劫夺
      - 印财两星各安其位、不相侵害
   b. 浊乱条件：
      - 财旺破印（财克印太过）
      - 比劫劫财（兄弟夺父星之气）
      - 印财混杂不清
   c. **依据**：父母篇【任氏曰】"印财清正，父母安康；印财浊乱，父母有灾"

4. **评估日主与印财的配合**
   a. 印星为日主喜用 → 母助日主，母缘深厚
   b. 财星为日主喜用 → 父助日主，父缘深厚
   c. 印财为忌仇 → 父母拖累或缘薄
   d. **依据**：父母篇【任氏曰】"须观印星财星与日主之配合"

## 输出

\`\`\`typescript
interface FuMuReport {
  /** 父母星 */
  parentStar: {
    mother: {              // 母亲（印星）
      starType: "正印" | "偏印" | "无" | "混杂";
      position: string;
      strength: "旺" | "中" | "弱";
      isXiYong: boolean;
      keyRelation: string; // 与日主的关键关系
    };
    father: {              // 父亲（财星）
      starType: "正财" | "偏财" | "无" | "混杂";
      position: string;
      strength: "旺" | "中" | "弱";
      isXiYong: boolean;
      keyRelation: string;
    };
    overall: "清正" | "浊乱" | "半清半浊";
  };
  /** 父母宫（年柱） */
  parentPalace: {
    stemBranch: string;
    tenGod: string;        // 年柱十神
    isXiYong: boolean;
    isChong: boolean;
    assessment: "吉" | "平" | "凶";
  };
  /** 父母总体结论 */
  conclusion: {
    motherGrade: "安康" | "平顺" | "有灾" | "缘薄";
    fatherGrade: "安康" | "平顺" | "有灾" | "缘薄";
    summary: string;       // 1-2句话总结父母运势
    keyFactor: string;     // 影响父母运势的关键因素
  };
}
\`\`\`
`;
