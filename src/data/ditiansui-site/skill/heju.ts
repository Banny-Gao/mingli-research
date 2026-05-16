// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>输入一个八字命局，扫描其中的所有合局关系——天干五合、地支六合、地支三合（含半合）。对每个合局，评估其吉凶属性：是否合成了有用之神（有情则吉），是否牵绊了有用之神（绊之则凶）。用于八字格局分析中的&quot;合局影响评估&quot;环节。</p>
<h2>输入</h2>
<ul>
<li><code>year_pillar</code>：年柱干支（如 &quot;癸亥&quot;）</li>
<li><code>month_pillar</code>：月柱干支（如 &quot;乙卯&quot;）</li>
<li><code>day_pillar</code>：日柱干支（如 &quot;甲午&quot;）</li>
<li><code>hour_pillar</code>：时柱干支（如 &quot;甲子&quot;）</li>
<li><code>day_master</code>：日主五行（自动提取）</li>
<li><code>gender</code>：性别（可选）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>步骤一：扫描天干五合</strong></p>
<ol>
<li>检查四天干中是否存在五合配对：<ul>
<li>甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火</li>
</ul>
</li>
<li>记录每组合：参与的天干、化神、是否紧邻</li>
<li>依据：合局篇【原注】&quot;干支相合也&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：扫描地支六合</strong></p>
<ol>
<li>检查四地支中是否存在六合配对：<ul>
<li>子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合土</li>
</ul>
</li>
<li>记录每组合局：参与的地支、化神、是否被冲</li>
<li>依据：合局篇【原注】&quot;六合三合，合而成局&quot;</li>
</ol>
</li>
<li><p><strong>步骤三：扫描地支三合</strong></p>
<ol>
<li>检查四地支中是否存在三合配对：<ul>
<li>申子辰合水、亥卯未合木、寅午戌合火、巳酉丑合金</li>
</ul>
</li>
<li>检查是否存在半合（缺一支的三合）：<ul>
<li>申子半合、子辰半合、亥卯半合、卯未半合等</li>
</ul>
</li>
<li>记录每组合局的完整度和化神</li>
</ol>
</li>
<li><p><strong>步骤四：判定合的吉凶</strong></p>
<ol>
<li>确定用神（基于全局旺衰判断）</li>
<li>对每个合局评估：<ul>
<li>合化之神是否等于用神 → 合而有情（吉）</li>
<li>合化之神是否等于忌神 → 合而绊之（凶）</li>
<li>合局是否牵制了用神（如合住了用神所在的天干）→ 合而绊之（凶）</li>
</ul>
</li>
<li>依据：合局篇【任氏曰】&quot;合而有情则吉，合而绊之则凶&quot;</li>
</ol>
</li>
<li><p><strong>步骤五：全局合局综合评估</strong></p>
<ol>
<li>汇总所有合局的吉凶判定</li>
<li>评估合局对整体格局的影响（提升/削弱/不变）</li>
<li>输出合局总体结论</li>
</ol>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface HejuAnalysis {
  summary: {
    totalHeCount: number;                 // 合局总数
    favorableCount: number;               // 有利合局数
    unfavorableCount: number;             // 不利合局数
    overall: &quot;favorable&quot; | &quot;unfavorable&quot; | &quot;neutral&quot;; // 总体评价
  };
  tianGanHe: Array&lt;{
    pair: string;                         // 配对（如 &quot;丙辛&quot;）
    huaShen: string;                      // 化神
    adjacent: boolean;                    // 是否紧邻
    effect: &quot;qing&quot; | &quot;ban&quot; | &quot;neutral&quot;;  // 有情/绊之/中性
    reason: string;
  }&gt;;
  diZhiLiuHe: Array&lt;{
    pair: string;                         // 配对（如 &quot;子丑&quot;）
    huaShen: string;
    isChong: boolean;                     // 是否被冲
    effect: &quot;qing&quot; | &quot;ban&quot; | &quot;neutral&quot;;
    reason: string;
  }&gt;;
  diZhiSanHe: Array&lt;{
    triplet: string[];                    // 三支（如 [&quot;申&quot;,&quot;子&quot;,&quot;辰&quot;]）
    completeness: &quot;full&quot; | &quot;half&quot;;        // 完整/半合
    huaShen: string;
    effect: &quot;qing&quot; | &quot;ban&quot; | &quot;neutral&quot;;
    reason: string;
  }&gt;;
  impact: {
    onPattern: string;                    // 对格局的影响描述
    onYongShen: string;                   // 对用神的影响描述
  };
}
</code></pre>
`;
