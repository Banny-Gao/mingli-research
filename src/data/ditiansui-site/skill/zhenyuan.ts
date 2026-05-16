// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在收到八字四柱和大运流年信息后，识别命局中五行极旺/极衰状态，判断是否处于&quot;贞下起元&quot;的转换节点，输出命局在时间轴上的循环周期分析。此技能适用于八字分析中对&quot;趋势转换&quot;的预判——用于回答&quot;好运会持续多久？坏运何时转好？&quot;这类循环性问题。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串）</li>
<li><strong>大运列表</strong>：已排好的大运序列（格式如[&quot;甲子&quot;, &quot;乙丑&quot;, ...]）</li>
<li><strong>流年</strong>：待分析的年份（可选，用于精确定位转换节点）</li>
<li><strong>当前大运</strong>：当前所处的大运干支（可选，用于判断当前处于循环的哪个阶段）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>命局底层五行状态评估</strong>
a. 分析四柱中每个五行的旺衰状态（按照月令、地支根气、透干情况综合判断）
b. 标记过旺的五行（旺至极点，即将走向反面）
c. 标记过弱的五行（衰至极点，可能绝处逢生）
d. <strong>依据</strong>：贞元篇【原注】&quot;周而复始，此始终之理也&quot;</p>
</li>
<li><p><strong>大运在循环中的定位</strong>
a. 按照大运顺序标记每运在循环中的阶段：</p>
<ul>
<li>元：大运刚开始，力量尚未完全发挥</li>
<li>亨：大运正当时，力量最强</li>
<li>利：大运收获期，虽亨已过但仍有余力</li>
<li>贞：大运末期，力量消退，准备转换
b. <strong>依据</strong>：贞元篇【任氏曰】&quot;运有元亨&quot;</li>
</ul>
</li>
<li><p><strong>贞元交替节点识别</strong>
a. 识别五行从极旺转衰的节点——看大运是否改变了旺相的根基（如旺木逢金运）
b. 识别五行从极衰转旺的节点——看大运是否扶助了衰弱的五行（如弱水逢金水运）
c. 标记岁运并临、冲合并见的特殊年份 → 可能为贞元转换的关键时刻
d. <strong>依据</strong>：贞元篇【任氏曰】&quot;贞下起元，此命学之要论也&quot;</p>
</li>
<li><p><strong>循环综合分析</strong>
a. 按时间顺序输出每个大运在循环中的角色（贞或元）
b. 预判未来的转换节点
c. 提供针对当前循环阶段的行为建议（蓄力/进取/收束/准备转换）
d. <strong>依据</strong>：贞元篇【任氏曰】&quot;命有始终，运有元亨，贞下起元&quot;</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ZhenYuanReport {
  /** 命局五行极值 */
  extremeElements: {
    element: string;          // 五行
    state: &quot;极旺&quot; | &quot;极衰&quot; | &quot;正常&quot;;
    description: string;      // 当前状态描述
    triggerCondition: string; // 触发转换的条件
  }[];

  /** 大运循环分析 */
  cycleAnalysis: Array&lt;{
    daYun: string;            // 大运干支
    ageRange: string;         // 年龄范围
    cyclePhase: &quot;元&quot; | &quot;亨&quot; | &quot;利&quot; | &quot;贞&quot;;
    description: string;      // 该运在循环中的作用
    isTransition: boolean;    // 是否为转换节点
  }&gt;;

  /** 贞元交替节点 */
  transitionPoints: Array&lt;{
    year: string;             // 年份干支
    type: &quot;极旺转衰&quot; | &quot;极衰转旺&quot; | &quot;格局转换&quot; | &quot;循环切换&quot;;
    description: string;      // 转换的具体表现
  }&gt;;

  /** 循环总结 */
  summary: {
    currentPhase: &quot;元&quot; | &quot;亨&quot; | &quot;利&quot; | &quot;贞&quot;;
    currentPhaseDescription: string;  // 当前所处阶段解读
    nextTransition: {                  // 下一个转换节点
      daYun: string;
      year: string;
      direction: &quot;好转&quot; | &quot;转差&quot; | &quot;格局调整&quot;;
    } | null;
    keyInsight: string;               // 基于贞元篇义理的关键发现
    advice: string;                   // 针对当前阶段的行动建议
  };
}
</code></pre>
`;
