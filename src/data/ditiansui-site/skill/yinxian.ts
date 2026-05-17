// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>输入八字四柱后，将命局中的所有十神按吉凶分类，标注每个十神是&quot;露&quot;（在天干）还是&quot;藏&quot;（在地支），判断是否存在&quot;吉神太露起争夺&quot;或&quot;凶物深藏养虎患&quot;的情况，根据通根当令情况评估风险等级，并提出制化方案。此技能用于深入分析格局安全性——格局不仅要有用神，还要看用神/忌神的藏露是否合理。</p>
<h2 id="输入">输入</h2><ul>
<li><code>pillars</code>：四柱八字（格式如&quot;己卯 辛未 丙子 辛卯&quot;）</li>
<li><code>shi_shen_map</code>：十神映射表（从日主推导各柱天干地支对应的十神）</li>
<li><code>day_master</code>：日主五行</li>
<li><code>gender</code>（可选）：性别</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>步骤一：十神吉凶分类</strong></p>
<ol>
<li>遍历四柱的所有天干和地支中所有藏干</li>
<li>按标准十神规则分类为吉神（正官、正印、食神、正财、偏财）和凶物（七杀、劫财、伤官、偏印/枭神）</li>
<li>标注每个十神是&quot;露于天干&quot;还是&quot;藏于地支&quot;</li>
<li><strong>依据</strong>：隐显篇开篇&quot;吉神太露，起争夺之风；凶物深藏，成养虎之患&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：力量评估（根气与月令）</strong></p>
<ol>
<li>对每个吉神：检查其在地支是否有通根（十二长生表中处于长生→帝旺区间）</li>
<li>对每个凶物：检查其在地支的通根状态以及月令旺衰（是否&quot;失时休囚&quot;）</li>
<li><strong>依据</strong>：【任氏曰】&quot;通根当令者，露亦无害；失时休囚者，藏亦无妨&quot;</li>
</ol>
</li>
<li><p><strong>步骤三：藏露风险评估</strong></p>
<ol>
<li>吉神露 + 力量弱 → 高风险（标记为&quot;吉神太露，起争夺之风&quot;）</li>
<li>吉神露 + 通根当令 → 低风险（&quot;露亦无害&quot;）</li>
<li>凶物藏 + 力量强 → 高风险（标记为&quot;凶物深藏，成养虎之患&quot;）</li>
<li>凶物藏 + 失时休囚 → 低风险（&quot;藏亦无妨&quot;）</li>
<li><strong>依据</strong>：【原注】&quot;局中所喜之神，透于天干，岁运不能不遇忌神，必至争夺&quot;</li>
</ol>
</li>
<li><p><strong>步骤四：制化策略建议</strong></p>
<ol>
<li>对&quot;露而弱&quot;的吉神：建议岁运中寻找能保护它的十神（如官星回克劫财、食伤合化忌神）</li>
<li>对&quot;藏而强&quot;的凶物：建议等待岁运引发时将凶物引出天干再制化</li>
<li><strong>依据</strong>：【任氏曰】&quot;必须天干先有丙丁官星回克，方无害&quot;</li>
</ol>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface YinXianReport {
  /** 十神藏露全景 */
  shiShenVisibility: {
    good: Array&lt;{
      name: string;         // 十神名称
      element: string;      // 五行
      position: &quot;露&quot; | &quot;藏&quot;;
      pillar: string;       // 所在柱
      rootStatus: &quot;通根&quot; | &quot;无根&quot; | &quot;弱根&quot;;
    }&gt;;
    bad: Array&lt;{
      name: string;
      element: string;
      position: &quot;露&quot; | &quot;藏&quot;;
      pillar: string;
      rootStatus: &quot;旺相&quot; | &quot;休囚&quot;;
    }&gt;;
  };
  /** 风险评估 */
  riskAssessment: {
    items: Array&lt;{
      target: string;       // 风险来源
      type: &quot;吉神太露&quot; | &quot;凶物深藏&quot; | &quot;安全&quot;;
      severity: &quot;高&quot; | &quot;中&quot; | &quot;低&quot;;
      reason: string;
    }&gt;;
    overallRisk: &quot;高&quot; | &quot;中&quot; | &quot;低&quot;;
  };
  /** 制化策略 */
  strategy: {
    protect: string[];      // 需要保护的吉神及方法
    control: string[];      // 需要控制的凶物及方法
    luckHint: string;       // 大运方位建议
  };
}
</code></pre>
`;
