// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>输入一个八字四柱的天干部分，逐干分析其阴阳五行属性，判断每个天干的&quot;从气&quot;或&quot;从势&quot;倾向，输出各天干的性情特征与在命局中的表现。此技能用于辅助整体命局分析的第一步——先认清天干的&quot;本色&quot;，再结合地支和格局做综合判断。</p>
<h2>输入</h2>
<ul>
<li><code>year_stem</code>：年柱天干（十干之一：甲/乙/丙/丁/戊/己/庚/辛/壬/癸）</li>
<li><code>month_stem</code>：月柱天干（同上）</li>
<li><code>day_stem</code>：日柱天干（同上）——日干为日主，是分析核心</li>
<li><code>hour_stem</code>：时柱天干（同上）</li>
<li><code>month_branch</code>：月柱地支（用于判断旺衰季节）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>分类：按阴阳五行</strong></p>
<ol>
<li>甲乙→木，丙丁→火，戊己→土，庚辛→金，壬癸→水</li>
<li>甲丙戊庚壬→阳干，乙丁己辛癸→阴干</li>
<li>依据：天干篇&quot;五行分类&quot;（甲乙一木也，丙丁一火也...）</li>
</ol>
</li>
<li><p><strong>识别阳中之最 / 阴中之最</strong></p>
<ol>
<li>若天干为丙 → 标记为&quot;阳中之最（五阳皆阳丙为最）&quot;</li>
<li>若天干为癸 → 标记为&quot;阴中之最（五阴皆阴癸为至）&quot;</li>
<li>依据：【原注】&quot;独丙火精纯阳之精，而为阳中之阳&quot;；&quot;独癸水纯阴之精，而为阴中之阴&quot;</li>
</ol>
</li>
<li><p><strong>判断从气从势倾向</strong></p>
<ol>
<li>若天干为阳干（甲丙戊庚壬）→ 标注&quot;从气不从势&quot;<ul>
<li>依据：【原注】&quot;五阳得阳之气，即能成乎阳刚之义，固不纵财杀之势而失其义&quot;</li>
</ul>
</li>
<li>若天干为阴干（乙丁己辛癸）→ 标注&quot;从势无情义&quot;<ul>
<li>依据：【原注】&quot;五阴得阴之气，即能成乎阴顺之义，故木盛则从木...&quot;</li>
</ul>
</li>
</ol>
</li>
<li><p><strong>逐干输出核心性情</strong></p>
<ol>
<li>甲木：&quot;参天、脱胎要火&quot;——依赖火来发荣，春不容金，秋不容土</li>
<li>乙木：&quot;敏感、受甲木&quot;——柔顺依附，有火不怕金，水泛无火则浮</li>
<li>丙火：&quot;猛烈、欺霜侮雪&quot;——纯阳之火，合辛化水，壬水可制</li>
<li>丁火：&quot;柔中、抱乙孝合壬忠&quot;——阴火文明，合壬化木，崇甲乙生扶</li>
<li>戊土：&quot;固重、中正&quot;——居中承载，喜水润不喜火炎</li>
<li>己土：&quot;卑湿、蓄藏&quot;——不仇木盛不畏水狂，宜金泄秀</li>
<li>庚金：&quot;带杀、刚健&quot;——喜水得清、喜火得锐，乙合化金</li>
<li>辛金：&quot;柔软、清润&quot;——热喜己母、寒喜丁火</li>
<li>壬水：&quot;通河、刚中&quot;——源远流长，合丁化木，易进难退</li>
<li>癸水：&quot;至弱、逢龙即化&quot;——润土养金，得辰为龙则化，畏丙丁</li>
</ol>
</li>
<li><p><strong>附加判断：是否存在拟物化误用风险</strong></p>
<ol>
<li>检查是否将天干直接对应为具体事物（如&quot;甲为梁栋、乙为花果&quot;）</li>
<li>若有此类表述，标注&quot;比拟失伦&quot;警告</li>
<li>依据：【任氏曰】&quot;奇俷命家作歌为赋，比拟失伦&quot;</li>
</ol>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface TianganAnalysis {
  summary: {
    dayStem: string;           // 日干
    stemAttribute: string;     // 阳干/阴干
    extremeMark: string;       // 是否为丙（阳最）/癸（阴最）
    congQiOrShi: string;       // &quot;从气&quot;或&quot;从势&quot;
  };
  annualStem: StemInfo;
  monthlyStem: StemInfo;
  dailyStem: StemInfo;         // 日干为核心，额外包含日主判断
  hourlyStem: StemInfo;
}

interface StemInfo {
  stem: string;                // 天干字符
  element: string;             // 五行属性
  yinYang: string;             // 阴阳
  coreTrait: string;           // 核心性情（如&quot;猛烈&quot;&quot;柔中&quot;）
  dependency: string;          // 依赖/忌讳
  warning?: string;            // 拟物化误用警告
}
</code></pre>
`;
