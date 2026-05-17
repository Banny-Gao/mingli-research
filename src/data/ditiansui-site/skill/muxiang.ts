// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>分析八字命局中印星（母）与日主（子）之间的生扶与平衡关系，判断印星是否清正得力、是否存在&quot;母旺子衰&quot;或&quot;印星浊乱&quot;的失衡状态。AI 执行者应在需要分析命局中印星的质量和影响时调用本技能，尤其涉及长辈关系、学业运势、文化修养等方面的分析。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串格式）</li>
<li><strong>日主</strong>：日柱天干的五行属性（自动提取）</li>
<li><strong>印星判断</strong>：列出四柱中的正印和偏印（含地支藏干中的印星）</li>
<li><strong>官星判断</strong>：列出四柱中的正官和七杀（用于判断印星是否泄官）</li>
<li><strong>可选</strong>：长辈关系背景信息（用于辅助判断印星是否&quot;清正&quot;）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>定位母子角色</strong></p>
<ul>
<li>母：正印 + 偏印（印星为母，生身之功）</li>
<li>子：日主（日主为子，受印星生扶）</li>
<li>依据：【正文】&quot;母象者，印星为母，生身之功也&quot;</li>
</ul>
</li>
<li><p><strong>判断印星清浊</strong></p>
<ul>
<li><strong>清正</strong>特征：印星力量适中，不被混杂（正偏印不同现多现），不受冲克</li>
<li><strong>浊乱</strong>特征：印星过旺或过弱，正偏印混杂，或印星受伤被冲被克</li>
<li>依据：【原注】&quot;印星清正，母有慈德；印星浊乱，母有凶灾&quot;</li>
</ul>
</li>
<li><p><strong>评估印星与日主配合</strong></p>
<ul>
<li>印星力量是否与日主力量匹配</li>
<li>印星生扶日主的方式（温和还是过度）</li>
<li>日主是否有独立能力，还是过度依赖印星</li>
<li>依据：【任氏曰】&quot;须观印星与日主之配合也&quot;</li>
</ul>
</li>
<li><p><strong>检查母旺子衰</strong></p>
<ul>
<li>若印星过旺而日主依赖性强 → 母旺子衰</li>
<li>若印星过旺则检查是否泄官星之气 → &quot;泄气为灾&quot;</li>
<li>依据：【正文】&quot;母旺子衰，泄气为灾&quot;</li>
</ul>
</li>
<li><p><strong>综合评价</strong></p>
<ul>
<li>综合印星清浊、旺衰、配合程度，给出吉凶评价</li>
<li>印星清正+配合得当 → 母象之吉：长辈支持得力，学业有成</li>
<li>印星浊乱+配合不当 → 母象之凶：长辈关系紧张，或依赖过度</li>
</ul>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface MuXiangReport {
  yinXing: {
    zhengYin: string[];    // 正印列表（干支）
    pianYin: string[];     // 偏印列表（干支）
    qingZhuo: &quot;清正&quot; | &quot;浊乱&quot; | &quot;中平&quot;;
    totalPower: &quot;过旺&quot; | &quot;适中&quot; | &quot;过弱&quot;;
    reason: string;        // 清浊判定依据
  };
  riZhu: {
    ganZhi: string;
    wuxing: string;
    yiLai: &quot;过度依赖&quot; | &quot;适度依赖&quot; | &quot;独立自主&quot;;
  };
  balance: &quot;母旺子衰&quot; | &quot;母慈子孝&quot; | &quot;母弱子强&quot;;
  xieQi: {
    exists: boolean;       // 是否泄官星之气
    guanXingImpact: string;
  };
  evaluation: string;      // 母象吉凶综合评价
}
</code></pre>
`;
