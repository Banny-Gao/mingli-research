// Auto-generated — do not edit manually
export default `---
name: hezhi
displayName: 命理问答速断器
type: lookup
input: 八字四柱及分析需求
output: 命理问答速断结果
description: 基于滴天髓何知篇的问答体例，对命局的贵贱吉凶进行核心公式般的速断分析
---

## 功能

当需要对八字的贵贱吉凶进行快速诊断时使用此技能。何知篇以"问答"形式浓缩了最核心的命理判断法则——"官星有理则贵，财星被劫则贱"。此技能将这些问答体系化，将"何知某人贵？"、"何知某人贱？"等经典问答转化为可执行的判断逻辑。此技能应在完成基础八字排盘之后、在深入格局分析之前调用——作为一种"快速筛查"手段。

## 输入

- **四柱八字**：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如"己卯 丙寅 辛巳 戊子"）
- **分析需求**：用户希望快速诊断的方向（可选，如"看贵气""看贫富""看六亲"等）

## 处理逻辑

1. **官星有理判定——贵气诊断**
   a. 从八字中找出正官和七杀
   b. 检查官星是否"有理"：
      - 官星得位（月干/时干透出为佳）
      - 官星为喜用
      - 官星有源（有财生）
      - 官星无伤（不被伤官近克）
   c. 条件全部满足 → "官星有理" → 命主有贵气
   d. **依据**：何知篇【原注】"何知某人贵？官星有理"

2. **财星被劫判定——贫贱诊断**
   a. 从八字中找出财星（正财/偏财）
   b. 从八字中找出比劫（比肩/劫财）
   c. 检查"财星被劫"条件：
      - 比劫重重而财星一现
      - 财星弱而比劫旺
      - 无官星制劫护财
   d. 条件全部满足 → "财星被劫" → 命主有贫贱趋势
   e. **依据**：何知篇【原注】"何知某人贱？财星被劫"

3. **交叉验证**
   a. 官星有理 + 财星被劫同时存在 → 半贵半贱，需看哪个为主
   b. 官星有理但财星无源 → 虚贵不实
   c. 财星被劫但有官制 → 劫财有制则不贱
   d. **依据**：何知篇【任氏曰】"以问答明吉凶，此命学之要诀也"（强调灵活运用而非死板套用）

## 输出

\`\`\`typescript
interface HeZhiReport {
  /** 基础信息 */
  basic: {
    bazi: string;
    riZhu: string;
  };
  /** 官星有理分析 */
  guanXingAnalysis: {
    guanXingPresent: boolean;
    guanXingDetails: {
      type: "正官" | "七杀" | "官杀混杂" | "无";
      position: string;
      isXiYong: boolean;
      hasSource: boolean;  // 是否有财生
      isInjured: boolean;  // 是否被伤
    };
    isGuanXingYouLi: boolean;
    verdict: string;       // 贵气的详细论断
  };
  /** 财星被劫分析 */
  caiXingAnalysis: {
    caiXingPresent: boolean;
    biJieStrength: "旺" | "中" | "弱";
    isCaiXingBeiJie: boolean;
    hasGuanZhiJie: boolean; // 是否有官制劫护财
    verdict: string;         // 贫贱的详细论断
  };
  /** 最终速断 */
  finalVerdict: {
    grade: "贵" | "贱" | "半贵半贱" | "平常" | "待定";
    summary: string;       // 基于问答法的总结论断
    keyFormula: string;    // 对应的何知问答公式原文
  };
}
\`\`\`
`;
