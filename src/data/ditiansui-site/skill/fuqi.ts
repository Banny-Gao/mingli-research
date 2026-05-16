// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>当需要分析一个人的婚姻姻缘（包括配偶情况、婚姻质量、感情走势）时使用此技能。核心方法是：男命以财星为妻，女命以官星为夫，通过财官与日主的配合判断姻缘吉凶。此技能应在完成基础八字排盘（确定日主旺衰、用神喜忌）之后调用。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;甲子 丙寅 辛未 己丑&quot;）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女），必填——男命看财星、女命看官星</li>
<li><strong>大运流年</strong>：当前所处的十年大运和流年（可选，用于看岁运对婚姻的影响）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>确定夫妻星</strong>
a. 男命：找到八字中的财星（正财/偏财）作为妻星
b. 女命：找到八字中的官星（正官/七杀）作为夫星
c. 标记夫妻星的五行、位置（年/月/日/时）、透出/暗藏状态
d. <strong>依据</strong>：夫妻篇【原注】&quot;财为妻，官为夫&quot;</p>
</li>
<li><p><strong>评估夫妻星清浊</strong>
a. 清正条件检查：</p>
<ul>
<li>夫妻星是否纯一不杂（正偏不混）</li>
<li>夫妻星是否与日主相生相合</li>
<li>夫妻星是否不受冲克破坏
b. 浊乱条件检查：</li>
<li>夫妻星是否混杂（正偏交织、官杀混杂）</li>
<li>夫妻星是否与日主相克相战</li>
<li>夫妻星是否受冲克或空亡
c. 判定：满足清正条件多于浊乱 → &quot;清正&quot;；反之 → &quot;浊乱&quot;
d. <strong>依据</strong>：夫妻篇【原注】&quot;财官清正，姻缘吉美；财官浊乱，姻缘不顺&quot;</li>
</ul>
</li>
<li><p><strong>评估日主与夫妻星的配合</strong>
a. 判定夫妻星是否为日主喜用神</p>
<ul>
<li>夫妻星为喜用 → 夫妻得力、互相成就</li>
<li>夫妻星为忌神 → 夫妻拖累、互相消耗
b. 判定日主与夫妻星的力量对比</li>
<li>身旺财官清 → 能任财官，婚姻稳</li>
<li>身弱财官重 → 婚姻压力大，配偶强势
c. <strong>依据</strong>：夫妻篇【任氏曰】&quot;须观财星官星与日主之配合&quot;</li>
</ul>
</li>
<li><p><strong>岁运引动分析（如有大运流年输入）</strong>
a. 大运流年引动夫妻星 → 婚缘事件（婚期）的高发窗口
b. 大运流年冲克夫妻星 → 婚姻危机的高发窗口
c. <strong>依据</strong>：夫妻篇【任氏曰】&quot;财官浊乱，相克相战，此夫妻不和也&quot;</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface FuQiReport {
  /** 命局基础信息 */
  basic: {
    bazi: string;          // 四柱八字
    gender: &quot;乾造&quot; | &quot;坤造&quot;;
    riZhu: string;         // 日主天干
  };
  /** 夫妻星 */
  spouseStar: {
    starType: &quot;财星&quot; | &quot;官星&quot; | &quot;无&quot; | &quot;混杂&quot;;
    specific: string;      // 具体是正财/偏财/正官/七杀
    position: string;      // 年/月/日/时柱
    status: &quot;透出&quot; | &quot;暗藏&quot;;
    fiveElement: string;   // 五行
    isXiYong: boolean;     // 是否为喜用神
  };
  /** 财官清浊判定 */
  qingZhuo: {
    assessment: &quot;清正&quot; | &quot;浊乱&quot; | &quot;半清半浊&quot;;
    reasons: string[];     // 判定理由列表
    description: string;   // 对姻缘质量的中文描述
  };
  /** 日主配合 */
  peiHe: {
    riZhuStrength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
    spouseStrength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
    relation: &quot;相生&quot; | &quot;相合&quot; | &quot;相克&quot; | &quot;相战&quot; | &quot;相安&quot;;
    verdict: string;       // 配合结论
  };
  /** 婚姻总体结论 */
  conclusion: {
    grade: &quot;上吉&quot; | &quot;中吉&quot; | &quot;中平&quot; | &quot;下吉&quot; | &quot;凶&quot;;
    summary: string;       // 1-2句话总结婚姻质量
    advice: string;        // 基于夫妻篇义理的建议
  };
}
</code></pre>
`;
