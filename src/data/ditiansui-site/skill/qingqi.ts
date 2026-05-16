// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在八字格局分析完成后，调用此技能评估格局的清浊程度。此技能不替代格局判断，而是在已确定用神、喜忌的基础上，评估各神的排布是否&quot;循序得所&quot;、是否有&quot;精神&quot;、是否存在可清除的浊气。此技能应配合浊气评估器（zhuoqi）使用，两篇合读才能全面判断格局优劣。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串）</li>
<li><strong>格局分析结果</strong>：已确定的格局类型、用神、喜忌（对象）</li>
<li><strong>十神位置</strong>：各十神在四柱中的分布位置（可选，用于替代计算）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>评估清气的基本状态</strong>
a. 检查格局中各神是否&quot;循序得所&quot;——生克链条是否通顺
b. 检查是否有&quot;闲神&quot;——不参与核心生克的五行是否破局
c. 检查喜神与日主的距离——喜神是否紧贴、忌神是否远隔
d. <strong>依据</strong>：清气篇【原注】&quot;皆循序得所，有安顿，或作闲神，不来破局&quot;</p>
</li>
<li><p><strong>判断&quot;精神&quot;状态</strong>
a. 检查各&quot;喜神&quot;是否得地逢生（有根气、有生源）
b. 检查精神传递链是否完整：源头神→用神→日主，每个环节是否紧贴
c. 如链条断裂或环节远隔 → 精神枯槁
d. 如链条完整且各环节紧贴 → 精神贯足
e. <strong>依据</strong>：清气篇【任氏曰】&quot;清而有气，则精神贯足；清而无气，则精神枯槁&quot;</p>
</li>
<li><p><strong>评估澄浊求清可能性</strong>
a. 如果原局有浊气（杂神破坏、喜神被合、闲神劫占等），检查：</p>
<ul>
<li>是否有一神&quot;有力&quot;能扫除浊气</li>
<li>如需岁运清除浊气：岁运是否具备清除条件（冲合、克制等）
b. <strong>依据</strong>：清气篇【原注】&quot;或得一神有力，或行运得所，以扫其浊气&quot;</li>
</ul>
</li>
<li><p><strong>综合评估</strong>
a. 汇总清气状态、精神状态、澄浊可行性
b. 得出最终结论：清而精神/清而枯/浊可清/浊难清</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface QingQiReport {
  /** 清气评估 */
  qingAssessment: {
    status: &quot;清而有精神&quot; | &quot;清而无气&quot; | &quot;半清半浊&quot; | &quot;浊可求清&quot; | &quot;浊难清除&quot;;
    description: string;
    orderStatus: &quot;循序得所&quot; | &quot;部分有序&quot; | &quot;杂乱无章&quot;;
  };
  /** 精神评估 */
  spiritAssessment: {
    status: &quot;贯足&quot; | &quot;枯槁&quot;;
    chain: Array&lt;{
      from: string;        // 源头
      to: string;          // 流向
      isTight: boolean;    // 是否紧贴
      blocked: boolean;    // 是否受阻
    }&gt;;
  };
  /** 澄浊求清 */
  clarification: {
    possible: boolean;
    method: &quot;原局一神&quot; | &quot;岁运清除&quot; | &quot;无法清除&quot;;
    detail: string;
  };
  /** 与浊气篇的对比参考 */
  comparisonNote: string;
}
</code></pre>
`;
