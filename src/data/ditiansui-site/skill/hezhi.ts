// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>当需要对八字的贵贱吉凶进行快速诊断时使用此技能。何知篇以&quot;问答&quot;形式浓缩了最核心的命理判断法则——&quot;官星有理则贵，财星被劫则贱&quot;。此技能将这些问答体系化，将&quot;何知某人贵？&quot;、&quot;何知某人贱？&quot;等经典问答转化为可执行的判断逻辑。此技能应在完成基础八字排盘之后、在深入格局分析之前调用——作为一种&quot;快速筛查&quot;手段。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;己卯 丙寅 辛巳 戊子&quot;）</li>
<li><strong>分析需求</strong>：用户希望快速诊断的方向（可选，如&quot;看贵气&quot;&quot;看贫富&quot;&quot;看六亲&quot;等）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>官星有理判定——贵气诊断</strong>
a. 从八字中找出正官和七杀
b. 检查官星是否&quot;有理&quot;：</p>
<ul>
<li>官星得位（月干/时干透出为佳）</li>
<li>官星为喜用</li>
<li>官星有源（有财生）</li>
<li>官星无伤（不被伤官近克）
c. 条件全部满足 → &quot;官星有理&quot; → 命主有贵气
d. <strong>依据</strong>：何知篇【原注】&quot;何知某人贵？官星有理&quot;</li>
</ul>
</li>
<li><p><strong>财星被劫判定——贫贱诊断</strong>
a. 从八字中找出财星（正财/偏财）
b. 从八字中找出比劫（比肩/劫财）
c. 检查&quot;财星被劫&quot;条件：</p>
<ul>
<li>比劫重重而财星一现</li>
<li>财星弱而比劫旺</li>
<li>无官星制劫护财
d. 条件全部满足 → &quot;财星被劫&quot; → 命主有贫贱趋势
e. <strong>依据</strong>：何知篇【原注】&quot;何知某人贱？财星被劫&quot;</li>
</ul>
</li>
<li><p><strong>交叉验证</strong>
a. 官星有理 + 财星被劫同时存在 → 半贵半贱，需看哪个为主
b. 官星有理但财星无源 → 虚贵不实
c. 财星被劫但有官制 → 劫财有制则不贱
d. <strong>依据</strong>：何知篇【任氏曰】&quot;以问答明吉凶，此命学之要诀也&quot;（强调灵活运用而非死板套用）</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface HeZhiReport {
  /** 基础信息 */
  basic: {
    bazi: string;
    riZhu: string;
  };
  /** 官星有理分析 */
  guanXingAnalysis: {
    guanXingPresent: boolean;
    guanXingDetails: {
      type: &quot;正官&quot; | &quot;七杀&quot; | &quot;官杀混杂&quot; | &quot;无&quot;;
      position: string;
      isXiYong: boolean;
      hasSource: boolean;  // 是否有财生
      isInjured: boolean;  // 是否被伤
    };
    isGuanXingYouLi: boolean;
    verdict: string;       // 贵气的详细论断
  };
  /** 财星被劫分析 */
  caiXingAnalysis: {
    caiXingPresent: boolean;
    biJieStrength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
    isCaiXingBeiJie: boolean;
    hasGuanZhiJie: boolean; // 是否有官制劫护财
    verdict: string;         // 贫贱的详细论断
  };
  /** 最终速断 */
  finalVerdict: {
    grade: &quot;贵&quot; | &quot;贱&quot; | &quot;半贵半贱&quot; | &quot;平常&quot; | &quot;待定&quot;;
    summary: string;       // 基于问答法的总结论断
    keyFormula: string;    // 对应的何知问答公式原文
  };
}
</code></pre>
`;
