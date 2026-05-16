// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>分析八字命局中是否存在&quot;子众母衰&quot;的失衡——即比劫过旺（子众）而印星衰微（母衰）的状态，并给出最佳行运方向建议（&quot;带水之金运&quot;或类似调整方案）。AI 执行者应在分析比劫过旺、印星偏弱的命局时调用本技能。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串格式）</li>
<li><strong>日主</strong>：日柱天干的五行属性（自动提取）</li>
<li><strong>比劫判断</strong>：列出四柱中的比肩和劫财（含地支藏干）</li>
<li><strong>印星判断</strong>：列出四柱中的正印和偏印（含地支藏干）</li>
<li><strong>财星判断</strong>（可选）：列出四柱中的正财和偏财（用于检测&quot;见土/子恋妇&quot;）</li>
<li><strong>官杀判断</strong>（可选）：列出四柱中的正官和七杀（用于检测&quot;见金/母不容子&quot;）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>判断子众母衰</strong></p>
<ul>
<li>统计比劫的力量和数量（子众程度）</li>
<li>统计印星的力量和数量（母衰程度）</li>
<li>若比劫力量远大于印星力量 → 子众母衰</li>
<li>依据：【原注】&quot;如甲乙满局皆是木，中有一二水气，谓子众母衰&quot;</li>
</ul>
</li>
<li><p><strong>检测&quot;见土&quot;（财星出现）</strong></p>
<ul>
<li>检查命局中是否有财星（土对木日主而言）</li>
<li>有财星 → &quot;子恋妇而不顾母&quot;（凶兆）</li>
<li>无财星 → 安全，继续检测</li>
<li>依据：【任氏曰】&quot;一不可见土，见土则子恋妇而不顾母，母不安矣&quot;</li>
</ul>
</li>
<li><p><strong>检测&quot;见金&quot;（官杀出现）</strong></p>
<ul>
<li>检查命局中是否有官杀且力量是否过重</li>
<li>官杀出现且力量重 → &quot;母势强而不容子，子必逆矣&quot;（凶兆）</li>
<li>官杀轻或无 → 安全</li>
<li>依据：【任氏曰】&quot;二不可见金，见金母势强而不容子，子必逆矣&quot;</li>
</ul>
</li>
<li><p><strong>评估行运方向</strong></p>
<ul>
<li>最佳：行&quot;带水之金运&quot;——金生水安母，金中带水不逆子</li>
<li>最差：行&quot;带土之金运&quot;——土克水、金克木，母子皆不安</li>
<li>一般：行单纯水运或单纯木运——效果有限</li>
<li>依据：【任氏曰】&quot;惟行带水之金运，使金不克木而生水……若行带土之金运，妇性必悍&quot;</li>
</ul>
</li>
<li><p><strong>输出评估</strong></p>
<ul>
<li>综合命局状态和行运建议，输出子象分析报告</li>
<li>注意原文虽以木为例，但可用于五行类推</li>
</ul>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ZiXiangReport {
  biJie: {
    count: number;        // 比劫数量
    power: &quot;极旺&quot; | &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
  };
  yinXing: {
    count: number;        // 印星数量
    power: &quot;极衰&quot; | &quot;衰&quot; | &quot;中&quot; | &quot;旺&quot;;
  };
  pattern: &quot;子众母衰&quot; | &quot;正常&quot; | &quot;母旺子弱&quot;;
  warnings: {
    jianTu: boolean;      // 见土（财星）
    jianJin: &quot;无&quot; | &quot;轻&quot; | &quot;重&quot;;  // 见金（官杀）
    explanation: string;
  };
  luckAdvice: {
    bestLuckType: string;    // 最佳运类型
    worstLuckType: string;   // 最差运类型
    favorable: string[];     // 有利大运方向
    unfavorable: string[];   // 不利大运方向
  };
}
</code></pre>
`;
