// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在完成日主衰旺判定后，评估命局是否达到&quot;中和&quot;状态——即日主与用神之间是否&quot;相停&quot;（力量平衡）。如果失衡，给出扶抑策略建议（扶弱抑旺）。此技能是对衰旺判定结果的应用和深化，为用神选取提供&quot;扶&quot;或&quot;抑&quot;的方向性指导。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;甲子 丙寅 戊午 庚申&quot;）</li>
<li><strong>日主衰旺判定结果</strong>：来自衰旺判定器的输出（日主等级：极旺/偏旺/中和/偏弱/极弱）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）（可选）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>日主状态确认</strong>
a. 接收日主衰旺判定结果
b. 确认日主在当前命局中的绝对强弱
c. <strong>依据</strong>：中和篇【任氏曰】&quot;日主中和，则无太过不及之患&quot;</p>
</li>
<li><p><strong>用神状态评估</strong>
a. 初步判断可能的用神（与日主相停之神）
b. 评估用神在命局中是否&quot;得力&quot;：</p>
<ul>
<li>用神有根吗？</li>
<li>用神被冲克吗？</li>
<li>用神被合绊吗？
c. <strong>依据</strong>：中和篇【原句】&quot;日主中和，用神得力，富贵寿考&quot;</li>
</ul>
</li>
<li><p><strong>日主与用神比例判定</strong>
a. 判断日主与用神之间是否&quot;相停&quot;（力量对等）
b. <strong>依据</strong>：中和篇【原注】&quot;日主与用神相停，无过无不及&quot;</p>
</li>
<li><p><strong>扶抑策略生成</strong>
a. 如果日主偏旺 → 用克泄（官杀制、食伤泄、财耗）
b. 如果日主偏弱 → 用生扶（印星生、比劫帮）
c. 如果日主极端（极旺/极弱）→ 判断是否适合走从格
d. 如果日主中和 → 随运而行，不需要人为强加扶抑
e. <strong>依据</strong>：中和篇【任氏曰】&quot;用神得力，则扶抑有功&quot;</p>
</li>
<li><p><strong>命格等级判定</strong>
a. 判断是否为&quot;上格&quot;（中和+用神得力）
b. <strong>依据</strong>：中和篇【原句】&quot;此命之上格也&quot;</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ZhongHeReport {
  /** 日主状态 */
  dayMaster: {
    stem: string;
    element: string;
    level: &quot;极旺&quot; | &quot;偏旺&quot; | &quot;中和&quot; | &quot;偏弱&quot; | &quot;极弱&quot;;
  };
  /** 用神状态 */
  usefulGod: {
    candidate: string[];        // 候选用神列表
    isEffective: boolean;       // 是否得力
    rootStatus: &quot;有根&quot; | &quot;少根&quot; | &quot;无根&quot;;
    conflict: string[];         // 冲克合绊等不利因素
  };
  /** 平衡状态 */
  balance: {
    isBalanced: boolean;        // 是否&quot;相停&quot;
    assessment: &quot;中和&quot; | &quot;偏颇&quot;;
    description: string;        // 对日主与用神比例的中文描述
  };
  /** 扶抑策略 */
  strategy: {
    direction: &quot;扶&quot; | &quot;抑&quot; | &quot;从&quot; | &quot;顺行&quot;;
    method: string[];           // 具体方法（如&quot;官杀制&quot;,&quot;印星生&quot;）
    target: string;             // 目标状态
  };
  /** 命格等级 */
  grade: {
    level: &quot;上格&quot; | &quot;中格&quot; | &quot;下格&quot; | &quot;特殊格局&quot;;
    isTopGrade: boolean;        // 是否为&quot;此命之上格&quot;
    keyInsight: string;         // 基于中和篇的关键发现
  };
}
</code></pre>
`;
