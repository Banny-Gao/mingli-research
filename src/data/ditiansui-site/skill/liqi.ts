// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>分析八字命局中每个五行的旺相休囚状态，判断其在当前季节中是&quot;相&quot;（将进）、&quot;旺&quot;（当令）、&quot;休&quot;（方退）还是&quot;囚&quot;（退尽），并据此评估各五行的发展潜力与真实力量。AI 执行者应在需要评估日主或十神的真实力量而非只看表面出现次数时调用本技能。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串）</li>
<li><strong>日主</strong>：日柱天干的五行属性</li>
<li><strong>月令</strong>：月柱的地支（决定当前季节）</li>
<li><strong>目标五行列表</strong>：需要分析进退状态的具体五行（默认全部分析）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>确定当前季节</strong>：根据月令地支确定四季归属</p>
<ul>
<li>寅卯辰 → 春（木旺）</li>
<li>巳午未 → 夏（火旺）</li>
<li>申酉戌 → 秋（金旺）</li>
<li>亥子丑 → 冬（水旺）</li>
</ul>
</li>
<li><p><strong>按四时定旺相休囚</strong>：按&quot;按四时而定之&quot;原则（【任氏曰】），对每一个五行分别判定</p>
<ul>
<li><strong>旺</strong>：当令的五行为旺（如春木）</li>
<li><strong>相</strong>：旺所生的五行为相（如春木生火，火相）</li>
<li><strong>休</strong>：生旺的五行为休（如水生春木，水休）</li>
<li><strong>囚</strong>：克旺的五行为囚（如金克春木，金囚）</li>
</ul>
</li>
<li><p><strong>评估进退潜力</strong>（精微判断）：</p>
<ul>
<li>相 &gt; 旺：相为&quot;方长之气，其进无疆&quot;；旺为&quot;极盛之物，其退反速&quot;</li>
<li>休 &lt; 囚：休为&quot;方退之气，未能骤复&quot;；囚为&quot;既极之势，必将渐生&quot;</li>
<li>依据：【任氏曰】&quot;相妙于旺，旺则极盛之物，其退反速&quot;&quot;休甚于囚，囚则既极之势，必将渐生&quot;</li>
</ul>
</li>
<li><p><strong>综合报告</strong>：输出每个五行的旺相休囚状态、进退方向和发展潜力评级</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface LiQiReport {
  month: string;                 // 月柱干支
  season: &quot;春&quot; | &quot;夏&quot; | &quot;秋&quot; | &quot;冬&quot;;
  wuxingStates: Array&lt;{
    wuxing: &quot;木&quot; | &quot;火&quot; | &quot;土&quot; | &quot;金&quot; | &quot;水&quot;;
    state: &quot;旺&quot; | &quot;相&quot; | &quot;休&quot; | &quot;囚&quot;;
    direction: &quot;进&quot; | &quot;退&quot; | &quot;极进&quot; | &quot;极退&quot;;
    potential: number;            // 发展潜力评分 1-5
    note: string;                 // 说明，引用【任氏曰】依据
  }&gt;;
  recommendation: string;        // 基于进退之机的综合分析建议
}
</code></pre>
<h2 id="使用示例">使用示例</h2><p><strong>输入</strong>：寅月（春季），分析木的进退状态</p>
<p><strong>输出片段</strong>：</p>
<pre><code>wuxingStates: [{
  wuxing: &quot;木&quot;,
  state: &quot;旺&quot;,
  direction: &quot;极进&quot;,
  potential: 3,
  note: &quot;木当令为旺，但&#39;旺则极盛之物，其退反速&#39;，虽当前最强但衰退在即&quot;
}]
</code></pre>
`;
