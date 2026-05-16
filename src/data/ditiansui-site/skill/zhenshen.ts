// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在收到八字四柱后，以月令提纲为出发点，识别&quot;得时秉令&quot;的当月当令之神（真神），判断其是否透出天干形成&quot;聚得真&quot;，再评估假神（失时退气之神）对真神的干扰程度，从而给出真神是否&quot;得用&quot;的结论。此技能应在格局判断之后、运程分析之前调用。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;甲子 丙寅 己丑 甲子&quot;）</li>
<li><strong>大运</strong>：已排好的大运列表（可选，用于&quot;行运看解神&quot;判断）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>月令当令之神判定</strong>
a. 根据月令地支确定当令五行
b. 判定依据：春季寅卯月为木令，夏季巳午月为火令，秋季申酉月为金令，冬季亥子月为水令，辰戌丑未月为土令（各月库气另计）
c. <strong>依据</strong>：真神篇【原注】&quot;如木火透者，生寅月，聚得真&quot;；【任氏曰】&quot;真者，得时秉令之神也&quot;</p>
</li>
<li><p><strong>真神透出判定</strong>
a. 检查当令之神是否在天干中出现（&quot;透&quot;）
b. 当令之神透干 → 标记为&quot;聚得真&quot;
c. 当令之神不透 → 标记为&quot;真神未透&quot;，力量不显
d. <strong>依据</strong>：真神篇【任氏曰】&quot;在提纲司令，又透出天干，谓聚得真&quot;</p>
</li>
<li><p><strong>假神识别与分类</strong>
a. 识别所有失时退气的五行之神为假神
b. 依次检查每个假神与真神的位置关系
c. <strong>依据</strong>：真神篇【任氏曰】&quot;假者，失时退气之神也&quot;</p>
</li>
<li><p><strong>假神干扰程度评估</strong>
a. 假神与真神紧贴相克 → 标记为&quot;紧贴克真&quot;（最凶）
b. 假神与真神相冲 → 标记为&quot;相冲动真&quot;（次凶）
c. 假神合住真神 → 标记为&quot;合真化忌&quot;（凶）
d. 假神被合住或遥隔 → 标记为&quot;无害&quot;
e. <strong>依据</strong>：真神篇【任氏曰】&quot;倘与真神紧贴，或相克相冲，或合真神，暗化忌神，终为碌碌庸人矣&quot;；&quot;纵有假神，安顿得好，不与真神紧贴，或被闲神合住，或遥隔无力，亦无害也&quot;</p>
</li>
<li><p><strong>真神得用综合判定</strong>
a. 真神透干 + 无假神干扰 (或干扰无害) → &quot;真神得用&quot; → 命主富贵
b. 真神透干 + 有假神干扰但可解 → &quot;真神有用待运&quot; → 运至则发
c. 真神不透 + 或有假神干扰不可解 → &quot;真神无用&quot; → 需考虑以假为用
d. <strong>依据</strong>：真神篇【原诗】&quot;真神得用生平贵，用若无为碌碌人&quot;</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ZhenShenReport {
  /** 月令信息 */
  monthBranch: string;          // 月令地支
  commandingElement: string;    // 当令五行 (木火土金水)
  
  /** 真神信息 */
  trueGod: {
    element: string;            // 真神五行
    appearsInHeaven: boolean;   // 是否透出天干
    heavenStem: string | null;  // 对应的天干 (如甲、丙等)
    condition: &quot;聚得真&quot; | &quot;真神未透&quot;;
  };
  
  /** 假神信息 */
  falseGods: Array&lt;{
    element: string;            // 假神五行
    position: string;           // 所在柱
    proximityToTrueGod: &quot;紧贴&quot; | &quot;隔位&quot; | &quot;遥隔&quot;;
    threatType: &quot;相克&quot; | &quot;相冲&quot; | &quot;合真&quot; | &quot;无直接威胁&quot; | &quot;被合住&quot;;
    threatLevel: &quot;致命&quot; | &quot;严重&quot; | &quot;中度&quot; | &quot;无害&quot;;
  }&gt;;
  
  /** 真神得用评估 */
  assessment: {
    status: &quot;真神得用&quot; | &quot;真神有用待运&quot; | &quot;真神无用&quot;;
    summary: string;            // 综合判断描述
    keyInsight: string;         // 基于真神篇义理的关键发现
    remedyInLuck: string | null; // 行运中的解神（如有）
  };
}
</code></pre>
`;
