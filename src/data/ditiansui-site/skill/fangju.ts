// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在收到八字四柱后，先检查命局中是否存在&quot;方&quot;（寅卯辰、巳午未、申酉戌、亥子丑三支相连）或&quot;局&quot;（申子辰、亥卯未、寅午戌、巳酉丑三合局、亥子丑等三会局）的五行聚合形态，然后判断方局的气势方向、用神取向和行运顺逆。此技能在格局判断阶段调用——在理解地支关系之后，在正式进入八格分析之前。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的地支（格式如&quot;子 午 卯 酉&quot;），以及对应天干</li>
<li><strong>月令</strong>：月柱地支（用于判断方局是否当令）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>方检查</strong>
a. 遍历四个地支，检查是否出现以下三支连续集合：</p>
<ul>
<li>寅卯辰 → 东方木方</li>
<li>巳午未 → 南方火方</li>
<li>申酉戌 → 西方金方</li>
<li>亥子丑 → 北方水方
b. 检查天干是否透出对应五行
c. <strong>依据</strong>：方局篇【原注】&quot;寅卯东方木，巳午南方火，申酉西方金，亥子北方水&quot;</li>
</ul>
</li>
<li><p><strong>局检查</strong>
a. 遍历四个地支，检查是否出现以下三合局：</p>
<ul>
<li>申子辰 → 合水局</li>
<li>亥卯未 → 合木局</li>
<li>寅午戌 → 合火局</li>
<li>巳酉丑 → 合金局</li>
<li>亥子丑 → 会水局（三会局）</li>
<li>寅卯辰 → 会木局（三会局）
b. 检查合化条件是否成立（月令助力、天干透出）
c. <strong>依据</strong>：方局篇【任氏曰】&quot;成局者，如亥子丑会水，则水盛而从其局&quot;</li>
</ul>
</li>
<li><p><strong>气势判定</strong>
a. 判断方局对应的五行与月令的关系（当令则势强）
b. 判断方局的完整度（三支全现为完整，二支缺一为半成）
c. 标记方局的&quot;顺&quot;与&quot;逆&quot;方向
d. <strong>依据</strong>：方局篇【任氏曰】&quot;方局既成，不可逆也&quot;</p>
</li>
<li><p><strong>用神与行运建议</strong>
a. 方局形成后，用神取向原则：</p>
<ul>
<li>木方/木局 → 宜火（食伤泄秀）或水（印星生扶），忌金（官杀破局）</li>
<li>火方/火局 → 宜土（食伤泄秀）或木（印星生扶），忌水（官杀破局）</li>
<li>金方/金局 → 宜水（食伤泄秀）或土（印星生扶），忌火（官杀破局）</li>
<li>水方/水局 → 宜木（食伤泄秀）或金（印星生扶），忌土（官杀破局）
b. <strong>依据</strong>：方局篇【任氏曰】&quot;方局既成，不可逆也&quot;——逆其势则凶</li>
</ul>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface FangJuReport {
  /** 命局基础信息 */
  basic: {
    yearBranch: string;
    monthBranch: string;
    dayBranch: string;
    hourBranch: string;
  };
  /** 方分析 */
  fangAnalysis: {
    hasFang: boolean;
    fangType: &quot;木&quot; | &quot;火&quot; | &quot;金&quot; | &quot;水&quot; | null;
    completeness: &quot;完整&quot; | &quot;缺一支&quot; | &quot;无&quot;;
    branches: string[];
    strength: &quot;极旺&quot; | &quot;旺&quot; | &quot;中&quot;;
  };
  /** 局分析 */
  juAnalysis: {
    hasJu: boolean;
    juType: &quot;水局&quot; | &quot;木局&quot; | &quot;火局&quot; | &quot;金局&quot; | &quot;会水局&quot; | &quot;会木局&quot; | &quot;会火局&quot; | &quot;会金局&quot; | null;
    completeness: &quot;完整&quot; | &quot;半合&quot; | &quot;拱合&quot; | &quot;无&quot;;
    branches: string[];
    strength: &quot;极旺&quot; | &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
  };
  /** 综合分析 */
  assessment: {
    hasStrongFangOrJu: boolean;
    direction: string;           // 气势方向 (木/火/金/水)
    harmony: &quot;顺&quot; | &quot;逆&quot; | &quot;半顺半逆&quot;;
    advice: {
      preferredElement: string;  // 喜用五行
      avoidElement: string;      // 忌用五行
      warning: string;           // 行运警示
    };
  };
}
</code></pre>
`;
