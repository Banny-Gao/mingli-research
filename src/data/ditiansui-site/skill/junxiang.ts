// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>输入一个八字命局，分析其官星和印星的配合状态——判定&quot;官星清而印星纯&quot;的君臣相得格局，或&quot;官杀混杂印星破损&quot;的君臣失道格局。此技能用于八字格局分析中&quot;官印体系&quot;的专项评估，尤其适用于判断命局的贵气层次。</p>
<h2>输入</h2>
<ul>
<li><code>year_pillar</code>：年柱干支（如 &quot;甲子&quot;）</li>
<li><code>month_pillar</code>：月柱干支（如 &quot;丙寅&quot;）</li>
<li><code>day_pillar</code>：日柱干支（如 &quot;辛巳&quot;）</li>
<li><code>hour_pillar</code>：时柱干支（如 &quot;戊子&quot;）</li>
<li><code>day_master</code>：日主五行（自动提取）</li>
<li><code>gender</code>：性别（可选）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>步骤一：识别官星（君）</strong></p>
<ol>
<li>扫描全局天干地支中的正官和七杀</li>
<li>区分正官（克日主且阴阳异）和七杀（克日主且阴阳同）</li>
<li>统计正官和七杀各自的数量和力量</li>
<li>依据：君象篇【原注】&quot;官星为君&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：识别印星（权）</strong></p>
<ol>
<li>扫描全局天干地支中的正印和偏印</li>
<li>统计印星数量和力量</li>
<li>检查印星是否被财星克制（财克印）</li>
<li>依据：君象篇【原注】&quot;印星为权&quot;</li>
</ol>
</li>
<li><p><strong>步骤三：判定&quot;官星清或浊&quot;</strong></p>
<ol>
<li>如果只有正官无七杀 → 官星清</li>
<li>如果只有七杀无正官 → 官星清（单杀为清）</li>
<li>如果正官和七杀同时出现 → 官杀混杂（官星浊）</li>
<li>依据：君象篇【任氏曰】&quot;官星清而印星纯，此君臣相得也&quot;</li>
</ol>
</li>
<li><p><strong>步骤四：判定&quot;印星纯或杂&quot;</strong></p>
<ol>
<li>如果印星未被财星克 → 印星纯</li>
<li>如果财星克印星（财星与印星天干相邻或地支相克）→ 印星破损</li>
<li>如果印星被刑冲 → 印星亦为破损</li>
<li>依据：君象篇【任氏曰】&quot;官杀混杂，印星破损，此君臣失道也&quot;</li>
</ol>
</li>
<li><p><strong>步骤五：输出君象整体评估</strong></p>
<ol>
<li>官清印纯 → 君臣相得（贵格）</li>
<li>官清印破 → 有官无实权（半贵）</li>
<li>官混印纯 → 小有权势但不安（半凶）</li>
<li>官混印破 → 君臣失道（凶）</li>
</ol>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface JunxiangAnalysis {
  summary: {
    isJunxiang: boolean;                  // 是否满足君象条件
    quality: &quot;xiangde&quot; | &quot;shidao&quot; | &quot;partial&quot;; // 相得/失道/部分
    nobility: &quot;high&quot; | &quot;medium&quot; | &quot;low&quot;;  // 贵气等级
  };
  official: {
    zhengGuan: number;                    // 正官数量
    qiSha: number;                        // 七杀数量
    isQing: boolean;                      // 是否清（无混杂）
    detail: string;
  };
  seal: {
    zhengYin: number;                     // 正印数量
    pianYin: number;                      // 偏印数量
    isChun: boolean;                      // 是否纯（无破损）
    damagedBy: string[];                  // 破损原因列表
    detail: string;
  };
  verdict: {
    status: &quot;xiangde&quot; | &quot;shidao&quot; | &quot;qingguan_po_yin&quot; | &quot;hun_guan_chun_yin&quot;;
    description: string;                  // 命理解读描述
    advice: string;                       // 行运方向建议
  };
}
</code></pre>
`;
