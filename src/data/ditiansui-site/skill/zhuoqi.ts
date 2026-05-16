// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在八字格局分析完成且已评估清气状态后，调用此技能进行浊气专项评估。此技能识别命局中存在的浊气类型（六类之一或多类复合），评估浊气的严重程度，判断是否有扫除浊气的可能性。应与清气评估器（qingqi）配合使用：先用清气评估器判断全局清浊状态，再用浊气评估器识别具体的浊气类型和处理方案。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串）</li>
<li><strong>格局分析结果</strong>：已确定的格局类型、用神、喜忌（对象）</li>
<li><strong>清气评估结果</strong>：由清气评估器输出的清浊状态（可选，用于对比分析）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>识别的浊气类型</strong>
a. 逐项检查六种浊气是否存在：</p>
<ul>
<li><strong>气之浊</strong>：检查正神（用神、喜神）是否失势，邪神（忌神）是否乘权</li>
<li><strong>格之浊</strong>：检查月令是否被刑冲破害，格局基础是否动摇</li>
<li><strong>财之浊</strong>：检查是否有财星破坏印星（官衰喜印却被财坏）</li>
<li><strong>比劫之浊</strong>：检查是否有比劫争夺财星（官衰喜财却被比劫争夺）</li>
<li><strong>官之浊</strong>：检查是否有官星克制比劫（财旺喜劫却被官制）</li>
<li><strong>食伤之浊</strong>：检查是否有食伤过重泄身（身强杀浅却食伤得势）
b. <strong>依据</strong>：浊气篇【任氏曰】&quot;或正神失势，邪气乘权……或提纲破损……&quot;
c. 可同时存在多种浊气类型（复合浊）</li>
</ul>
</li>
<li><p><strong>评估浊气严重程度</strong>
a. 检查浊气是否被&quot;安顿&quot;——是否有闲神化解或制衡
b. 检查浊气与日主的距离——是否贴身还是远隔
c. 检查浊气是否&quot;一神有力&quot;可扫除</p>
</li>
<li><p><strong>判断浊vs枯</strong>
a. 检查日主是否有根（地支是否有本气根）
b. 检查用神是否有气（用神是否得地逢生）
c. 如日主无根或用神无气 → 标记为&quot;枯&quot;
d. <strong>依据</strong>：浊气篇【任氏曰】&quot;枯者，无根而朽也……凡命之日主枯者，非贫即夭；用神枯者，非贫即孤&quot;</p>
</li>
<li><p><strong>预测浊命转机</strong>
a. 如为&quot;浊&quot;（有根有气但有矛盾）→ 判断所需扫除浊气的岁运五行
b. 如为&quot;枯&quot;（无根无气）→ 判断为无法通过岁运转机
c. <strong>依据</strong>：浊气篇【任氏曰】&quot;倘遇行运得所，扫除浊气，亦有起发之机&quot;</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ZhuoQiReport {
  /** 浊气类型 */
  types: Array&lt;{
    type: &quot;气之浊&quot; | &quot;格之浊&quot; | &quot;财之浊&quot; | &quot;比劫之浊&quot; | &quot;官之浊&quot; | &quot;食伤之浊&quot;;
    present: boolean;
    description: string;
    conflictingElements: string[];  // 冲突双方
  }&gt;;
  /** 浊气严重程度 */
  severity: {
    level: &quot;轻&quot; | &quot;中&quot; | &quot;重&quot;;
    rootCause: string;
    isSettled: boolean;             // 是否有安顿
  };
  /** 枯vs浊判定 */
  constitution: {
    type: &quot;浊&quot; | &quot;枯&quot; | &quot;半浊半枯&quot;;
    reason: string;
    dayMasterRooted: boolean;       // 日主是否有根
    yongShenVital: boolean;         // 用神是否有气
  };
  /** 转机预测 */
  turnaround: {
    possible: boolean;
    requiredLuck: string;           // 所需岁运五行
    method: &quot;扫除浊气&quot; | &quot;扶起用神&quot; | &quot;冲开合神&quot; | &quot;不可转机&quot;;
    detail: string;
  };
  /** 与清气篇的对比参考 */
  comparisonNote: string;
}
</code></pre>
`;
