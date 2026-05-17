// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在八字分析中，当发现两种五行形成直接相克且气路不通时，调用此技能评估是否存在通关五行以及通关条件是否具备。此技能适用于格局判断的辅助阶段——在用神初步确定后，检查用神与忌神之间是否需要以及能否通关。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串）</li>
<li><strong>相克关系标识</strong>：已识别出的相克五行对（可选，由上游分析提供）</li>
<li><strong>通关候选</strong>：用户指定的候选通关五行（可选，用于校验而非推算）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>识别相克关系</strong>
a. 分析四柱中所有天干、地支的五行分布
b. 标记所有直接相克的五行对（如金克木、木克土等）
c. <strong>依据</strong>：通关篇【原注】&quot;木土而要火，火金而要土，土水而要金，金木而要水&quot;</p>
</li>
<li><p><strong>查找通关五行</strong>
a. 对每个相克对，根据五行引化表确定需要的通关五行：</p>
<ul>
<li>木土战 → 需火通关（木生火、火生土）</li>
<li>火金战 → 需土通关（火生土、土生金）</li>
<li>土水战 → 需金通关（土生金、金生水）</li>
<li>金木战 → 需水通关（金生水、水生木）</li>
<li>水火战 → 需木通关（水生木、木生火）
b. 检查通关五行是否在原局中出现
c. <strong>依据</strong>：通关篇【原注】&quot;中间上下远隔，为物所间；前后远绝，或被刑冲，或被劫占，或隔一物，皆谓之关也&quot;</li>
</ul>
</li>
<li><p><strong>评估通关有效性</strong>
a. 检查通关五行是否被损坏（被财克、被冲坏、被合住）
b. 检查通关五行的位置是否与被通双方有实际生克途径
c. 检查通关五行的力量是否充足
d. 如通关五行被破坏，查找备选方案（冲开合神、合化解冲等）
e. <strong>依据</strong>：通关篇【任氏曰】&quot;局内有印，被财星损坏……则冲开之，或被冲坏，则合化之&quot;</p>
</li>
<li><p><strong>判断通关模式</strong>
a. 如原局通关五行具备且有效 → 原局通关
b. 如原局无通关五行或无效 → 查找岁运中是否有通关五行
c. 如原局和岁运均无 → 通关失败
d. <strong>依据</strong>：通关篇【任氏曰】&quot;倘原局无印，必须岁运逢印……此原局无可通之理，必须岁运暗冲暗会&quot;</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface TongGuanReport {
  /** 分析的相克五行对 */
  conflicts: Array&lt;{
    elementA: string;          // 五行A
    elementB: string;          // 五行B
    conflictType: &quot;克&quot; | &quot;冲&quot; | &quot;刑&quot;;
    severity: &quot;高&quot; | &quot;中&quot; | &quot;低&quot;;
  }&gt;;
  /** 通关方案 */
  solutions: Array&lt;{
    conflictPair: string;      // 相克对描述
    requiredBridge: string;    // 需要的通关五行
    bridgePresent: boolean;    // 通关五行在原局是否存在
    bridgeStatus: {
      location: string;        // 通关五行所在位置
      damaged: boolean;        // 是否被损坏
      damageCause: string;     // 损坏原因（如可确定）
      effective: boolean;      // 是否有效通关
    };
    fallbackPlan: {
      needYearLuck: boolean;   // 是否需要岁运
      targetYearLuck: string;  // 所需的岁运五行
    };
  }&gt;;
  /** 综合评估 */
  assessment: {
    overallResult: &quot;原局通关&quot; | &quot;岁运通关&quot; | &quot;通关失败&quot;;
    description: string;       // 中文描述
    recommendation: string;    // 建议
  };
}
</code></pre>
`;
