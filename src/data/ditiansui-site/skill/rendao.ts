// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在完成三元拆解（天道技能）和五行偏全评估（坤道技能）之后，对八字中天干地支之间的&quot;顺&quot;与&quot;悖&quot;关系进行逐个柱位与全局的分析。此技能的核心产出是：判断各柱之间的生克关系是有情（顺吉）还是无情（悖凶），并识别命局中是否存在&quot;层层递减&quot;式的救应路径。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱（字符串）</li>
<li><strong>三元分析结果</strong>（可选）：来自天道技能（tiandao）的三元分析输出</li>
<li><strong>五行偏全评估</strong>（可选）：来自坤道技能（kundao）的五气偏全分析输出</li>
<li><strong>大运流年</strong>（可选）：用于判断岁运引发的顺悖变化</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>单柱顺悖判定</strong>（对每一柱执行）
a. 判断天干与同柱地支之间的关系：</p>
<ul>
<li>天干生于地支 / 地支生于天干 / 天干同地支 / 天干克地支 / 地支克天干
b. 判定标尺：</li>
<li>天干弱 + 地支生天干 → 顺（有情），标注为&quot;+&quot;</li>
<li>地支弱 + 天干生地支 → 顺（有情），标注为&quot;++&quot;</li>
<li>天干弱 + 地支克天干 → 悖（无情），标注为&quot;--&quot;</li>
<li>地支弱 + 天干克地支 → 悖（无情），标注为&quot;-&quot;
c. <strong>依据</strong>：人道篇【任氏曰】&quot;如天干气弱，地支生之……皆为有情而顺则吉；如天干气衰，地支抑之……皆为无情而悖则凶&quot;</li>
</ul>
</li>
<li><p><strong>全局顺悖扫描</strong>
a. 统计各柱的顺悖得分（顺 +1，悖 -1，中性 0）
b. 识别直接的生克冲突（如甲木坐申金）
c. 识别间接生克链条（如甲己合土→土生金→金克木的间接克）
d. <strong>依据</strong>：人道篇【任氏曰】&quot;若天干无庚辛，而反遇之以甲己……皦助甲己之金，母子无生意&quot;</p>
</li>
<li><p><strong>救应路径筛查</strong>
a. 对标记为&quot;悖&quot;的柱位，按&quot;层层递减法&quot;四层筛查：</p>
<ul>
<li>第1层：是否有第三方五行化解（如金克木时，有水转化）</li>
<li>第2层：是否有印绶通变（如正偏印提供生扶）</li>
<li>第3层：是否有通根支撑（如地支有日主根基）</li>
<li>第4层：无救应 → 直接判定为凶
b. <strong>依据</strong>：人道篇【任氏曰】&quot;假使干是木，畏金之克，地支有亥子水生之；支无亥子，无印绶化之；干无印绶，地支有淫箔以通根……余可类推&quot;</li>
</ul>
</li>
<li><p><strong>综合顺悖评分</strong>
a. 计算全局顺悖指数 = (顺的柱数 - 悖的柱数) / 总柱数 × 100</p>
<ul>
<li>指数 &gt; 50 → 整体偏顺（吉）</li>
<li>指数 -50 ~ 50 → 顺悖平衡（需结合大运）</li>
<li>指数 &lt; -50 → 整体偏悖（凶）
b. <strong>依据</strong>：人道篇【原句】&quot;顺则吉兮悖则凶&quot;</li>
</ul>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ShunBeiReport {
  /** 各柱顺悖判定 */
  pillarAnalysis: {
    year: { stem: string; branch: string; verdict: &quot;顺&quot; | &quot;悖&quot; | &quot;中性&quot;; score: number; detail: string };
    month: { stem: string; branch: string; verdict: &quot;顺&quot; | &quot;悖&quot; | &quot;中性&quot;; score: number; detail: string };
    day: { stem: string; branch: string; verdict: &quot;顺&quot; | &quot;悖&quot; | &quot;中性&quot;; score: number; detail: string };
    hour: { stem: string; branch: string; verdict: &quot;顺&quot; | &quot;悖&quot; | &quot;中性&quot;; score: number; detail: string };
  };
  /** 间接克识别 */
  indirectKe: Array&lt;{
    chain: string[];       // 生克链条：如 [&quot;甲木&quot;, &quot;己土&quot;, &quot;庚金&quot;]
    description: string;   // 间接克的中文描述
    severity: &quot;轻微&quot; | &quot;中等&quot; | &quot;严重&quot;;
  }&gt;;
  /** 救应路径（仅对悖的柱位） */
  remedyPath: Array&lt;{
    target: string;         // 受克的柱位
    level1: boolean;        // 是否有化解五行
    level2: boolean;        // 是否有印绶
    level3: boolean;        // 是否有通根
    level4: boolean;        // 是否直接受克无救
    mostLikelyRemedy: string; // 最可能的救应路径
  }&gt;;
  /** 全局顺悖评估 */
  overall: {
    index: number;           // 顺悖指数（-100 ~ 100）
    verdict: &quot;偏顺（吉）&quot; | &quot;顺悖平衡&quot; | &quot;偏悖（凶）&quot;;
    keyConclusion: string;   // 关键结论
  };
}
</code></pre>
`;
