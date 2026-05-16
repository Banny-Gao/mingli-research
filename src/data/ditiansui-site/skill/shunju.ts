// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>输入一个八字命局，输出该命局的顺局判定结果。此技能在执行全局五行力量评估后，识别日主是否健旺、印比是否成势、是否满足&quot;顺势而行&quot;的条件。用于八字格局分析中&quot;极旺格局&quot;的判断场景。</p>
<h2>输入</h2>
<ul>
<li><code>year_pillar</code>：年柱干支（如 &quot;癸卯&quot;）</li>
<li><code>month_pillar</code>：月柱干支（如 &quot;甲寅&quot;）</li>
<li><code>day_pillar</code>：日柱干支（如 &quot;甲寅&quot;）</li>
<li><code>hour_pillar</code>：时柱干支（如 &quot;乙亥&quot;）</li>
<li><code>day_master</code>：日主五行（自动从日柱提取，如 &quot;甲木&quot;）</li>
<li><code>gender</code>：性别（可选，用于排大运方向）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>步骤一：评估日主强弱</strong></p>
<ol>
<li>统计全局五行力量分布（天干+地支+藏干）</li>
<li>检查日主是否有强根（地支本气是否与日主同五行）</li>
<li>检查日主是否得月令（月支本气是否与日主同五行或生日主）</li>
<li>依据：顺局篇【原注】&quot;日主健旺&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：检查印比趋势</strong></p>
<ol>
<li>统计印星（生我者）和比劫（同我者）的数量与力量</li>
<li>判断印比是否占全局主导（印比力量 &gt; 全局其他力量总和）</li>
<li>依据：顺局篇【原注】&quot;印比帮身&quot;</li>
</ol>
</li>
<li><p><strong>步骤三：区分顺局与从旺</strong></p>
<ol>
<li>如果日主无根（地支无本气、中气、余气同五行）→ 判定为从旺，不适用顺局</li>
<li>如果日主有根且印比成势 → 判定为顺局候选</li>
<li>依据：顺局篇【任氏曰】&quot;从旺者日主无根，不得不从；顺局者日主健旺，有力自主&quot;</li>
</ol>
</li>
<li><p><strong>步骤四：判断顺势方向</strong></p>
<ol>
<li>识别全局中最旺的五行（印星所属五行或比劫所属五行）</li>
<li>顺着旺势方向定用神取向</li>
<li>标记逆势方向（旺势所克的五行）为最忌</li>
<li>依据：顺局篇【任氏曰】&quot;顺势而行，不与时争，此顺也&quot;</li>
</ol>
</li>
<li><p><strong>步骤五：输出岁运建议</strong></p>
<ol>
<li>喜：与旺势方向一致的岁运（扶旺势）</li>
<li>忌：逆旺势方向的岁运（克旺势或反其道而行之）</li>
</ol>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ShunjuAnalysis {
  summary: {
    dayMaster: string;                    // 日主
    isShunJu: boolean;                    // 是否顺局
    confidence: &quot;high&quot; | &quot;medium&quot; | &quot;low&quot;; // 判定置信度
  };
  strength: {
    hasRoot: boolean;                     // 是否有强根
    inSeason: boolean;                    // 是否得令
    yinBiRatio: number;                   // 印比占比（0~1）
  };
  distinction: {
    type: &quot;shunju&quot; | &quot;congwang&quot; | &quot;normal&quot;;
    reason: string;                       // 判定理由
  };
  trendDirection: {
    strongestElement: string;             // 最旺五行
    shunDirection: string;               // 顺势方向
    avoidDirection: string;               // 应避免方向
  };
  yongShen: {
    yong: string[];                       // 用神（围绕旺势的扶助神）
    xi: string[];                         // 喜神
    ji: string[];                         // 忌神
  };
  luckAdvice: {
    favorable: string[];                  // 有利岁运
    unfavorable: string[];                // 不利岁运
  };
}
</code></pre>
`;
