// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>分析八字命局中食神/伤官（臣）与日主/官星（君）之间的力量对比关系，判断是否处于&quot;君臣相得&quot;的平衡状态。AI 执行者应在需要分析命局中食伤与官星的关系时调用本技能，尤其是在涉及才华与社会地位匹配、能力与体制认同等现实问题分析时。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串格式，如&quot;庚辰 癸未 乙未 癸未&quot;）</li>
<li><strong>日主</strong>：日柱天干的五行属性（自动提取）</li>
<li><strong>食伤判断</strong>：列出四柱中的食神和伤官（含地支藏干中的食伤）</li>
<li><strong>官星判断</strong>：列出四柱中的正官和七杀（含地支藏干中的官杀）</li>
<li><strong>日主衰旺判定</strong>：可选，未提供时本技能默认按月令+地支藏干先做判定</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>确定君臣对应</strong></p>
<ul>
<li>臣：食神 + 伤官（食神为臣，伤官为佐）</li>
<li>君：日主 + 官星（官星为君，日主为至尊）</li>
<li>依据：【原注】&quot;食神为臣，伤官为佐&quot;；【任氏曰】&quot;食伤为臣，官星为君&quot;</li>
</ul>
</li>
<li><p><strong>统计臣的力量</strong></p>
<ul>
<li>计算食神和伤官在天干的透出情况</li>
<li>计算食伤在地支藏干中的根气</li>
<li>评估食伤整体力量（旺/相/休/囚/死）</li>
</ul>
</li>
<li><p><strong>统计君的力量</strong></p>
<ul>
<li>计算官星（正官+七杀）在天干的透出情况</li>
<li>计算官星在地支藏干中的根气</li>
<li>计算日主的力量（旺/相/休/囚/死）</li>
<li>评估君的整体力量</li>
</ul>
</li>
<li><p><strong>君臣对比判断</strong></p>
<ul>
<li>若臣的力量 &gt; 君的力量 → <strong>臣强君弱</strong>（食伤越权，克官泄君）</li>
<li>若君的力量 &gt; 臣的力量 → <strong>臣弱君强</strong>（食伤不足，缺乏辅佐）</li>
<li>若君臣力量相当 → <strong>君臣相得</strong>（理想状态）</li>
<li>依据：【原注】&quot;臣强君弱，或臣弱君强，皆非美也&quot;</li>
</ul>
</li>
<li><p><strong>检查&quot;臣泄君气&quot;</strong></p>
<ul>
<li>判断食伤是否通过泄身（食伤泄日主）或生财（食伤生财耗身）的方式削弱君的力量</li>
<li>即使不直接克官，食伤的间接消耗也属于&quot;臣泄君气&quot;</li>
<li>依据：【任氏曰】&quot;臣泄君气，皆非美也&quot;</li>
</ul>
</li>
<li><p><strong>输出评价</strong></p>
<ul>
<li>综合君臣力量对比和泄君气程度，给出格局评价</li>
<li>指出潜在的吉凶倾向</li>
</ul>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface ChenXiangReport {
  jun: {
    riZhu: { ganZhi: string; wuxing: string; liLiang: &quot;旺&quot; | &quot;相&quot; | &quot;休&quot; | &quot;囚&quot; | &quot;死&quot; };
    guanXing: Array&lt;{ ganZhi: string; type: &quot;正官&quot; | &quot;七杀&quot;; liLiang: string }&gt;;
    totalPower: string;  // 君的整体力量
  };
  chen: {
    shiShen: Array&lt;{ ganZhi: string; type: &quot;食神&quot; | &quot;伤官&quot;; liLiang: string }&gt;;
    totalPower: string;  // 臣的整体力量
  };
  balance: &quot;臣强君弱&quot; | &quot;臣弱君强&quot; | &quot;君臣相得&quot;;
  xieQi: boolean;       // 是否存在臣泄君气
  evaluation: string;    // 综合评价与建议
}
</code></pre>
`;
