// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>当需要分析一个人的兄弟姐妹运势（包括兄弟数量趋势、兄弟姐妹关系、比劫对日主的助害）时使用此技能。核心方法是：比肩为兄弟、劫财为姐妹，通过比劫的旺衰与日主的配合判断兄弟吉凶。此技能应在完成基础八字排盘（日主旺衰、用神喜忌）之后调用。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;癸未 甲寅 甲申 甲子&quot;）</li>
<li><strong>大运流年</strong>：当前所处的十年大运和流年（可选，用于看岁运对兄弟姐妹运势的引动）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>确定兄弟姐妹星</strong>
a. 从八字中找出比肩（与日主同五行同阴阳）——标记为兄弟
b. 从八字中找出劫财（与日主同五行不同阴阳）——标记为姐妹
c. 记录比劫的透出/暗藏和数量
d. <strong>依据</strong>：兄弟篇【原注】&quot;比肩为兄弟，劫财为姐妹&quot;</p>
</li>
<li><p><strong>评估比劫旺衰</strong>
a. 检查比劫是否得月令（月令为比劫当令则兄弟姐妹多）
b. 检查比劫是否有根气（地支有无禄、刃、库）
c. 检查比劫是否受冲克（被官杀克制、被印星泄气）
d. 判定：</p>
<ul>
<li>满足 a+b → &quot;健旺&quot;，兄弟姐妹多</li>
<li>不满足 a 且不满足 b 或 c 满足 → &quot;衰颓&quot;，兄弟姐妹少
e. <strong>依据</strong>：兄弟篇【原注】&quot;兄弟多寡，以比劫之数目定之&quot;；【任氏曰】&quot;比劫健旺，兄弟众多；比劫衰颓，兄弟稀少&quot;</li>
</ul>
</li>
<li><p><strong>评估比劫与日主的配合</strong>
a. 日主身弱、比劫帮身为助 → 兄弟姐妹互助
b. 日主身旺、比劫争财争官 → 兄弟姐妹竞争
c. 比劫合化/被合 → 兄弟姐妹缘分被转化
d. <strong>依据</strong>：兄弟篇【任氏曰】&quot;须观比劫与日主之配合&quot;</p>
</li>
<li><p><strong>评估比劫对财星的潜在影响（关联夫妻篇）</strong>
a. 比劫旺而财星弱 → 争财夺妻之象
b. 比劫旺而有官制 → 虽有兄弟但能被管束
c. <strong>延伸依据</strong>：夫妻篇&quot;财星被劫则姻缘不顺&quot;（间接）</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface XiongDiReport {
  /** 兄弟姐妹星 */
  siblingStar: {
    biJian: {              // 比肩（兄弟）
      count: number;       // 出现数量（含透藏）
      strength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
      positions: string[]; // 出现位置列表
    };
    jieCai: {              // 劫财（姐妹）
      count: number;
      strength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
      positions: string[];
    };
    overall: &quot;健旺&quot; | &quot;衰颓&quot; | &quot;适中&quot;;
  };
  /** 比劫与日主配合 */
  peiHe: {
    riZhuStrength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
    biJieAction: &quot;帮身&quot; | &quot;争夺&quot; | &quot;破格&quot; | &quot;相安&quot;;
    assessment: string;    // 配合结论
  };
  /** 兄弟姐妹总体结论 */
  conclusion: {
    siblingCountTrend: &quot;多&quot; | &quot;中&quot; | &quot;少&quot;;
    relationship: &quot;互助&quot; | &quot;竞争&quot; | &quot;普通&quot; | &quot;缘薄&quot;;
    summary: string;       // 1-2句话总结兄弟姐妹运势
    keyFactor: string;     // 关键影响因素
  };
}
</code></pre>
`;
