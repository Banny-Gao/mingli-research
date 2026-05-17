// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字四柱、已排好的大运和指定流年之后，按&quot;命为根基、运为扶抑、岁为引动&quot;三层框架分析命局在时间维度上的变化趋势。此技能适用于八字实战分析中&quot;什么时候发生什么事&quot;的判断——所有静态分析完成后，用岁运分析来回答&quot;何时吉、何时凶&quot;的问题。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）（确定大运顺逆排列方向）</li>
<li><strong>大运列表</strong>：已排好的大运序列，格式如[&quot;甲子&quot;, &quot;乙丑&quot;, &quot;丙寅&quot;, ...]（可选，若未提供则自动推算）</li>
<li><strong>流年</strong>：待分析的年份，格式如&quot;甲子&quot;（支持单年查询或区间查询）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>命局喜忌确定</strong>
a. 分析八字四柱，确定日主旺衰
b. 确定喜神和忌神（平衡命局偏枯的关键五行）
c. <strong>依据</strong>：岁运篇【任氏曰】&quot;命为根基&quot;</p>
</li>
<li><p><strong>大运扶抑评估</strong>
a. 将大运干支五行与命局喜忌对照：</p>
<ul>
<li>大运五行扶助喜神 → 标记为&quot;吉运&quot;</li>
<li>大运五行加重忌神 → 标记为&quot;凶运&quot;</li>
<li>大运五行与喜忌无关 → 标记为&quot;平运&quot;
b. 评估大运对命局的整体影响程度（大运与命局的生克关系强弱）
c. <strong>依据</strong>：岁运篇【任氏曰】&quot;运为扶抑&quot;</li>
</ul>
</li>
<li><p><strong>流年引动分析</strong>
a. 将流年干支与大运、命局进行三合（命 + 运 + 岁）分析
b. 判断流年是否引动了命局中的喜神（吉）或忌神（凶）
c. 标记特殊情境：</p>
<ul>
<li>岁运并临（流年与大运干支相同）→ 吉凶加倍</li>
<li>流年与命局相冲 → 重要变化</li>
<li>流年与命局相合 → 事有牵扯
d. <strong>依据</strong>：岁运篇【任氏曰】&quot;岁为引动&quot;</li>
</ul>
</li>
<li><p><strong>岁运综合判断</strong>
a. 命局内因（喜忌平衡度）× 大运中因（扶抑方向）× 流年外因（引动方式）→ 综合判断
b. 输出按时间分段的结果（每个大运 + 重要流年）
c. <strong>依据</strong>：岁运篇【原注】&quot;岁运并临，吉凶立见&quot;</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface SuiYunReport {
  /** 命局喜忌 */
  baseProfile: {
    riZhu: string;            // 日干
    strength: &quot;旺&quot; | &quot;偏旺&quot; | &quot;中和&quot; | &quot;偏弱&quot; | &quot;弱&quot;;
    xiShen: string[];         // 喜神五行列表
    jiShen: string[];         // 忌神五行列表
  };

  /** 大运分析 */
  daYunAnalysis: Array&lt;{
    ganZhi: string;           // 大运干支
    ageRange: string;         // 年龄范围
    nature: &quot;吉运&quot; | &quot;凶运&quot; | &quot;平运&quot;;
    impact: &quot;强&quot; | &quot;中&quot; | &quot;弱&quot;;
    description: string;      // 大运对命局的具体影响
  }&gt;;

  /** 流年分析 */
  liuNianAnalysis: Array&lt;{
    year: string;             // 流年干支
    isBingLin: boolean;       // 是否岁运并临
    events: string[];         // 可能引动的事件
    luck: &quot;大吉&quot; | &quot;吉&quot; | &quot;平&quot; | &quot;凶&quot; | &quot;大凶&quot;;
    description: string;      // 流年吉凶解读
  }&gt;;

  /** 岁运总结 */
  summary: {
    bestPeriod: string;       // 最佳时间段
    worstPeriod: string;      // 最差时间段
    keyYears: string[];       // 关键年份
    keyInsight: string;       // 基于岁运篇义理的关键发现
  };
}
</code></pre>
`;
