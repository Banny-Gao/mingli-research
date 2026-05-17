// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字命局和大运列表后，先评估命局本身的阳明/阴晦倾向（用神是否得力、天地是否交泰），再结合大运判断运途是否能&quot;辅格助用&quot;——即阴晦之命能否被运途转化为舒畅，阳明之命会否被运途拉入困郁。此技能适用于人生趋势咨询、岁运规划等场景。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串）</li>
<li><strong>大运列表</strong>：根据命主性别和出生年排好的大运（每运10年），包含运干运支</li>
<li><strong>当前年龄</strong>：可选，用于定位当前所处的大运</li>
<li><strong>性别</strong>：乾造/坤造，用于排大运方向验证</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>判定命局基调（阳明/阴晦）</strong>
a. 确定用神：按通常的用神选取法（平衡日主、调候、通关等）
b. 判断用神是否得力：</p>
<ul>
<li>用神在月令是否得气</li>
<li>用神是否有根（在地支有藏干或得长生/禄/旺）</li>
<li>用神是否被合化克冲
c. 判断天地是否交泰：</li>
<li>天干与地支之间是否有良性生克（如天干喜金而坐丑酉）</li>
<li>天干与地支之间是否有恶性冲克（如天干喜木而坐申酉）
d. 综合判断命局基调：</li>
<li>用神得力 + 天地交泰 → 阳明（奋发倾向）</li>
<li>用神失力 + 天地不交 → 阴晦（抑郁倾向）</li>
<li>混合情况 → 中平（需看运途决定）
e. <strong>依据</strong>：奋郁篇【原注】&quot;阳明用事，用神得力，天地交泰……必多奋发&quot;</li>
</ul>
</li>
<li><p><strong>闲神评估（辅助判断）</strong>
a. 标记命局中的闲神（非喜非忌的干支）
b. 判断闲神倾向：闲神是偏向喜神还是偏向忌神？
c. 若闲神不党忌物而反有益于喜用 → 奋发加分
d. 若闲神劫占、喜神反党助忌神 → 抑郁加分
e. <strong>依据</strong>：奋郁篇【任氏曰】&quot;闲神不党忌物，反有益于喜用……闲神劫占，喜神反党助忌神&quot;</p>
</li>
<li><p><strong>大运配合评估</strong>
a. 逐运评估是否辅格助用：</p>
<ul>
<li>大运的干支是否生助用神</li>
<li>大运的干支是否克制忌神
b. 若命局偏阴晦 + 大运偏阳明 → 标记为&quot;运途转化，可舒畅&quot;
c. 若命局偏阳明 + 大运偏阴晦 → 标记为&quot;运途拖累，亦困郁&quot;
d. <strong>依据</strong>：奋郁篇【任氏曰】&quot;然局虽阴晦，而运途配合阳明，亦能舒畅；象虽阳明，而运途配其阴晦，亦主困郁&quot;</li>
</ul>
</li>
<li><p><strong>藏神运程配合（针对地支藏干为用神的情况）</strong>
a. 若用神为地支藏干（如亥中甲木、午中己土）
b. 检视天干中有无克制藏神的五行
c. 按任铁樵的藏神运程配合表推荐适宜运程：</p>
<ul>
<li>天干有壬癸 → 宜戊寅己卯（土制水）</li>
<li>天干有庚辛 → 宜丙寅丁卯（火克金）等
d. <strong>依据</strong>：奋郁篇【任氏曰】&quot;如用亥中甲木，天干有壬癸，则运宜戊寅己卯……&quot;</li>
</ul>
</li>
<li><p><strong>输出报告</strong></p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface FenYuReport {
  /** 命局基调 */
  baseTone: {
    assessment: &quot;阳明&quot; | &quot;阴晦&quot; | &quot;中平&quot;;
    basis: {
      yongShenDeLi: boolean;     // 用神是否得力
      tianDiJiaoTai: boolean;    // 天地是否交泰
      xianShenTendency: string;  // 闲神倾向
    };
    description: string;         // 命局基调的中文描述
  };
  /** 大运配合评估（逐运） */
  daYunAnalysis: Array&lt;{
    decade: string;              // 运程年代范围
    ganZhi: string;             // 运干运支
    effect: &quot;辅格助用&quot; | &quot;破格害用&quot; | &quot;中性&quot;;
    description: string;
  }&gt;;
  /** 关键转折点 */
  turningPoints: Array&lt;{
    year: string;                // 关键年份
    event: &quot;阴转阳明&quot; | &quot;阳转阴晦&quot; | &quot;阳明持续&quot; | &quot;阴晦持续&quot;;
    reason: string;
  }&gt;;
  /** 综合结论 */
  conclusion: {
    lifeTrend: &quot;奋发&quot; | &quot;抑郁&quot; | &quot;先奋后郁&quot; | &quot;先郁后奋&quot; | &quot;中平&quot;;
    keyAdvice: string;           // 基于藏神理论的运程建议
  };
}
</code></pre>
`;
