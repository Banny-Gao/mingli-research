// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在收到八字四柱后，首先判断月令真神是否&quot;失势&quot;（力量不足以发挥实际作用），再评估假神（失时退气之神）是否&quot;得局&quot;（在全局中占据优势地位），最终给出&quot;以假为真&quot;还是&quot;仍取真神&quot;的判定。此技能应运用于&quot;真神判定器&quot;输出结论为&quot;真神无用&quot;或&quot;真神有用待运&quot;之后的进一步分析。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;乙酉 戊寅 壬午 庚戌&quot;）</li>
<li><strong>真神判定结果</strong>：从真神判定器获得的前置分析结果（可选）</li>
<li><strong>大运</strong>：已排好的大运列表（可选，用于判断运程对真假力量的影响）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>真神状态评估</strong>
a. 确认月令真神（得时秉令之神）
b. 检查真神是否透出天干——不透出则力量不显
c. 检查真神是否被冲克（如寅被申冲）或合化为他神
d. 检查真神与日主的关系——是否对日主有利
e. <strong>依据</strong>：假神篇【任氏曰】&quot;气有真假，真神失势&quot;</p>
</li>
<li><p><strong>假神力量评估</strong>
a. 识别全局中所有失时退气之神（假神候选）
b. 逐一检查每个假神是否&quot;得局&quot;：</p>
<ul>
<li>在地支三合/三会局中（如申子辰合水）</li>
<li>在天干多透（同一五行出现在多个天干）</li>
<li>有生助之源（有干支生扶）
c. <strong>依据</strong>：假神篇【原注】&quot;真神得令，假神得局而党多&quot;；【任氏曰】&quot;假神得局，亦可取用&quot;</li>
</ul>
</li>
<li><p><strong>真假力量对比</strong>
a. 对比真神与各假神的全局力量
b. 确定日主&quot;爱假憎真&quot;还是&quot;爱真憎假&quot;</p>
<ul>
<li>日主受益于哪个神 → 日主&quot;爱&quot;之</li>
<li>日主受害于哪个神 → 日主&quot;憎&quot;之
c. <strong>依据</strong>：假神篇【任氏曰】&quot;日主爱假憎真，必须岁运扶真抑假&quot;</li>
</ul>
</li>
<li><p><strong>取用决策</strong>
a. 真神得势 + 日主受益 → 取真神（标准情况）
b. 真神失势 + 假神得局 + 日主爱假 → &quot;以假为真&quot;，取假神为用
c. 真神失势 + 假神不得局 → 真假皆虚 → &quot;真假皆无力&quot;，命局危险
d. 真神得势但日主爱假 → 特殊情况，需行运扶真抑假
e. <strong>依据</strong>：假神篇【任氏曰】&quot;法当以真为假，以假为真&quot;</p>
</li>
<li><p><strong>行运方向判断</strong>
a. 如果日主爱假憎真 → 行运&quot;扶真抑假&quot;方能发福
b. 如果日主爱真憎假 → 行运&quot;助真损假&quot;则吉
c. 注意：行运与日主偏好相反 → 凶祸立至
d. <strong>依据</strong>：假神篇【任氏曰】&quot;若岁运助真损假，凶祸立至，此谓以实投虚&quot;</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface JiaShenReport {
  /** 真神评估 */
  trueGodAssessment: {
    element: string;
    status: &quot;得势&quot; | &quot;失势&quot; | &quot;受伤&quot;;
    details: string;           // 原因说明
  };
  
  /** 假神列表及评估 */
  falseGods: Array&lt;{
    element: string;
    heavenStem: string | null;
    position: string;
    powerLevel: &quot;得局&quot; | &quot;有党&quot; | &quot;虚浮&quot; | &quot;无力&quot;;
    description: string;
  }&gt;;
  
  /** 日主偏好 */
  dailyMasterPreference: {
    loves: string;             // 日主受益于哪个神
    hates: string;             // 日主受害于哪个神
  };
  
  /** 最终取用决策 */
  decision: {
    chosenGod: string;         // 实际取用之神
    logic: &quot;取真神&quot; | &quot;以假为真&quot; | &quot;真假皆虚&quot;;
    principle: string;         // 依据的经典原文
    summary: string;
  };
  
  /** 行运建议 */
  luckAdvice: {
    supports: string[];        // 有利于命局的运势五行
    suppresses: string[];      // 不利于命局的运势五行
    warning: string | null;    // 特别注意的运程
  };
}
</code></pre>
`;
