// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>分析八字命局中各个十神因素相对于日主是&quot;顺&quot;（有利、可用）还是&quot;逆&quot;（不利、不可用），为用神选取提供前置判断。AI 执行者应在需要判定命局中某一因素是否为用时调用本技能，尤其当用户机械地以财官为喜、不以日主衰旺为先时。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串格式，如&quot;甲子 丙寅 戊辰 壬戌&quot;）</li>
<li><strong>日主</strong>：日柱天干的五行属性</li>
<li><strong>待判断因素</strong>：需要判断顺逆的十神（可单选或全列，如&quot;财星&quot;&quot;官星&quot;&quot;印星&quot;等）</li>
<li><strong>日主衰旺判定</strong>：可选，未提供时本技能默认按月令+地支藏干先做判定</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>确定日主衰旺</strong>：根据月令、地支藏干、四柱生扶克耗关系，判定日主属于旺、相、休、囚、死中的哪一种</p>
<ul>
<li>依据：【任氏曰】&quot;不论日主之衰旺，总以财官为喜……殊不知道理乎？&quot;</li>
</ul>
</li>
<li><p><strong>列出待判断因素</strong>：罗列命局中的四柱十神，逐一标记五行属性与其相对于日主的十神关系</p>
</li>
<li><p><strong>顺逆判定</strong>（核心步骤）：</p>
<ul>
<li>若日主过弱：帮扶日主（印、比劫）的因素为&quot;顺&quot;；克耗日主（财、官、食伤）的因素为&quot;逆&quot;</li>
<li>若日主过旺：克耗日主（财、官、食伤）的因素为&quot;顺&quot;；帮扶日主（印、比劫）的因素为&quot;逆&quot;</li>
<li>若日主中和：各因素以不过度伤害或过度帮扶为判断标准，保持均衡为&quot;顺&quot;</li>
<li>依据：【任氏曰】&quot;用之财官不可伤，不可用财官尽可伤&quot;</li>
</ul>
</li>
<li><p><strong>验证自洽性</strong>：对照&quot;顺&quot;的因素是否确实对命局有益，&quot;逆&quot;的因素是否确实对命局有害，确认判断逻辑不自相矛盾</p>
</li>
<li><p><strong>输出报告</strong>：将所有因素标记为&quot;顺&quot;或&quot;逆&quot;，并附判断理由</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ShunNiReport {
  riZhu: {
    ganZhi: string;        // 日柱干支
    wuxing: string;        // 日主五行
    shuaiWang: &quot;旺&quot; | &quot;相&quot; | &quot;休&quot; | &quot;囚&quot; | &quot;死&quot;;
    basis: string;         // 衰旺判定依据
  };
  factors: Array&lt;{
    name: string;          // 十神名称，如&quot;正财&quot;&quot;七杀&quot;
    ganZhi: string;        // 对应的天干地支
    wuxing: string;        // 五行属性
    shunNi: &quot;顺&quot; | &quot;逆&quot;;
    reason: string;        // 判断理由，引用【任氏曰】依据
  }&gt;;
  conclusion: string;      // 综合分析：顺逆格局概况与用神选取建议
}
</code></pre>
<h2>使用示例</h2>
<p><strong>输入</strong>：日主甲木（衰），待判断财星</p>
<p><strong>输出片段</strong>：</p>
<pre><code>factors: [{
  name: &quot;正财&quot;,
  ganZhi: &quot;戊辰&quot;,
  wuxing: &quot;土&quot;,
  shunNi: &quot;逆&quot;,
  reason: &quot;日主甲木衰弱，财星戊辰土过旺克身，财富超出承载力，为逆&quot;
}]
</code></pre>
`;
