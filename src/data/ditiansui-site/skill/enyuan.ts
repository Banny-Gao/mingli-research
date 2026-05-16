// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在收到八字命局后，以&quot;恩（喜神）&quot;和&quot;怨（忌神）&quot;的视角重新审视命局中的五行关系，重点分析喜神与日主之间的连接状态。不同于通用的用神分析（只判断用什么），本技能判断&quot;用神能发挥多大作用&quot;——即喜神是否被有效连接（有媒）、是否被隔断（离间）、以及是否有意外或暗中的喜神获取方式（邂逅/牵合）。此技能应在完成基础用神判定之后调用，作为更深入的喜忌关系分析。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串）</li>
<li><strong>用神判定结果</strong>：来自通用用神分析或知命篇顺逆之机分析的输出（可选，未提供时本技能先自行判定）</li>
<li><strong>喜神/忌神清单</strong>：可选，未提供时本技能用神力顺应判定</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>确定喜神与忌神</strong>
a. 先判定日主旺衰，确定用神
b. 用神力顺应（生扶用神者为喜神、克耗用神者为忌神）列出完整的喜神和忌神清单
c. <strong>依据</strong>：恩怨篇【任氏曰】&quot;恩怨者，喜忌也&quot;</p>
</li>
<li><p><strong>距离分析</strong>
a. 标记每个喜神与日主之间的柱位距离（年柱最远、月柱中等、时柱较近、日支最近）
b. 标记每个忌神与日主的距离
c. 应用原则：&quot;可憎之神，远之为妙；可爱之神，近之尤切&quot;
d. 若喜神近而忌神远 → 恩大于怨（吉）
e. 若忌神近而喜神远 → 怨大于恩（凶）
f. <strong>依据</strong>：恩怨篇【原注】&quot;可憎之神，远之为妙；可爱之神，近之尤切&quot;</p>
</li>
<li><p><strong>媒的判断（喜神连接通路分析）</strong>
a. 对于每个远距离的喜神，检查有无&quot;媒&quot;（中介干支）与喜神相连：</p>
<ul>
<li>是否存在三合、六合、相生关系的干支连接喜神与日主</li>
<li>是否存在可以合化忌神从而解放喜神的干支
b. 若存在媒 → 标记为&quot;有媒连接，远喜实近&quot;
c. 若不存在媒 → 标记为&quot;无媒连接，远喜难用&quot;
d. <strong>依据</strong>：恩怨篇【原注】&quot;喜神合神，两情相通，又有人引用生化，如有媒矣&quot;</li>
</ul>
</li>
<li><p><strong>离间风险分析</strong>
a. 检查日主与喜神之间是否有忌神或闲神的阻断
b. 检查喜神是否被合化为忌神
c. 检查喜神是否与闲神联合助长了忌神
d. 若存在离间 → 标记&quot;被离间：恩化为怨&quot;，说明具体离间方式
e. <strong>依据</strong>：恩怨篇【原注】&quot;合神喜神虽有情，而忌神离间，求合不得&quot;</p>
</li>
<li><p><strong>特殊喜神连接方式检测</strong>
a. 邂逅相逢检测：</p>
<ul>
<li>命局中是否原本无喜神（全是闲神/忌神）</li>
<li>是否有合化关系意外产生喜神
b. 私情牵合检测：</li>
<li>喜神是否存在但被隔离</li>
<li>是否有地支会合将喜神暗中连接
c. <strong>依据</strong>：恩怨篇【任氏曰】&quot;只有闲神忌神而无喜神，得闲神忌神合化喜神，所谓邂逅相逢也&quot;</li>
</ul>
</li>
<li><p><strong>输出报告</strong></p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface EnYuanReport {
  /** 喜神与忌神清单 */
  likesAndDislikes: {
    xiShen: Array&lt;{ ganZhi: string; element: string; role: string; distance: &quot;近距离&quot; | &quot;中距离&quot; | &quot;远距离&quot; }&gt;;
    jiShen: Array&lt;{ ganZhi: string; element: string; role: string; distance: string }&gt;;
  };
  /** 媒的连接分析 */
  meiAnalysis: Array&lt;{
    xiShen: string;               // 被连接的喜神
    meiGanZhi: string;            // 充当媒的干支
    connectionType: &quot;三合&quot; | &quot;六合&quot; | &quot;相生&quot; | &quot;合化忌神&quot;;
    status: &quot;有媒&quot; | &quot;无媒&quot;;
    description: string;
  }&gt;;
  /** 离间分析 */
  liJianAnalysis: Array&lt;{
    affectedXiShen: string;       // 被离间的喜神
    liJianGanZhi: string;         // 离间者
    liJianType: &quot;隔绝&quot; | &quot;合化&quot; | &quot;助纣&quot;;
    status: &quot;被离间&quot; | &quot;未被离间&quot;;
    description: string;
  }&gt;;
  /** 特殊连接方式 */
  specialConnections: Array&lt;{
    type: &quot;邂逅相逢&quot; | &quot;私情牵合&quot;;
    originalState: string;        // 初始状态
    transformedState: string;     // 转化后的状态
    mechanism: string;            // 转化机制
  }&gt;;
  /** 综合评估 */
  conclusion: {
    enYuanRatio: string;          // 恩大于怨/怨大于恩/恩怨相当
    keyInsight: string;           // 关键发现
    suggestion: string;           // 基于恩怨分析的命理建议
  };
}
</code></pre>
`;
