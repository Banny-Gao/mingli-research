// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在接收到儿童（16岁以下）八字时，优先按小儿篇的简化分析法——跳过复杂的格局拆解，聚焦于日主旺衰、印比有无两个核心维度，判断儿童的先天禀赋强弱与养育风险。此技能应在命主为儿童时自动激活，替代常规的成人论命流程。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串）</li>
<li><strong>命主年龄</strong>：数字（以判断是否适用小儿论法；通常适用于童限之前，即年满16岁前）</li>
<li><strong>性别</strong>：乾造或坤造（可选，影响大运排法）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>确认适用范围</strong>
a. 若命主年龄 &gt;= 16：提示&quot;此命主已超出小儿论命范围，建议使用成人论命方法&quot;
b. 若命主年龄 &lt; 16：继续执行小儿论法</p>
</li>
<li><p><strong>判定日主旺衰</strong>
a. 按月令判定日主是否得令
b. 统计四柱中帮扶日主的干支数量（印星、比劫）
c. 统计四柱中克耗日主的干支数量（官杀、财星、食伤）
d. <strong>依据</strong>：小儿篇【任氏曰】&quot;须观日主之强弱&quot;</p>
</li>
<li><p><strong>判定印比状态</strong>
a. 列表：所有印星（正印、偏印）的位置与力量
b. 列表：所有比劫（比肩、劫财）的位置与力量
c. <strong>依据</strong>：小儿篇【任氏曰】&quot;印比之有无也&quot;</p>
</li>
<li><p><strong>吉凶判定</strong>
a. 日主健旺 + 印比帮身 → &quot;无虞&quot;（吉）
b. 日主衰颓 + 印比无援 → &quot;有灾&quot;（凶）
c. 日主健旺 + 印比无力 → 中平（需结合具体大运）
d. 日主衰颓 + 印比存在 → 中平（有救应，需看印比力量是否足够）
e. <strong>依据</strong>：小儿篇【任氏曰】&quot;日主健旺，印比帮身，此小儿无虞也；日主衰颓，印比无援，此小儿有灾也&quot;</p>
</li>
<li><p><strong>输出评估报告</strong></p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface XiaoErReport {
  /** 适用范围确认 */
  applicable: {
    isChild: boolean;
    message: string;
  };
  /** 日主分析 */
  riZhu: {
    ganZhi: string;
    wuXing: string;
    status: &quot;健旺&quot; | &quot;衰颓&quot; | &quot;中和&quot;;
    basis: string;            // 月令等判定依据
  };
  /** 印比分析 */
  yinBi: {
    yin: Array&lt;{              // 印星列表
      ganZhi: string;
      type: &quot;正印&quot; | &quot;偏印&quot;;
      strength: &quot;强&quot; | &quot;中&quot; | &quot;弱&quot;;
    }&gt;;
    bi: Array&lt;{               // 比劫列表
      ganZhi: string;
      type: &quot;比肩&quot; | &quot;劫财&quot;;
      strength: &quot;强&quot; | &quot;中&quot; | &quot;弱&quot;;
    }&gt;;
    summary: &quot;帮身有力&quot; | &quot;帮身不足&quot; | &quot;无援&quot;;
  };
  /** 综合评估 */
  assessment: {
    level: &quot;无虞&quot; | &quot;有灾&quot; | &quot;中平&quot;;
    description: string;      // 基于小儿篇的中文评估
    recommendation: string;   // 养育建议（基于五行禀赋）
  };
}
</code></pre>
`;
