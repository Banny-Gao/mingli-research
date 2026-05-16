// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>输入八字四柱后，分析命局的燥湿倾向——根据地支中的水（亥子、辰丑）与火（巳午、未戌）配置，判定此局是偏燥、偏湿还是平衡。识别燥土（未戌）与湿土（辰丑）在局中的实际作用，给出调候建议。此技能适用于命局气候分析阶段，在寒暖判断之后、藏露分析之前调用。</p>
<h2>输入</h2>
<ul>
<li><code>pillars</code>：四柱八字（年柱、月柱、日柱、时柱，格式如&quot;丙辰 辛丑 庚辰 丙子&quot;）</li>
<li><code>day_master</code>：日主五行（自动从日柱天干提取）</li>
<li><code>season</code>：出生季节（自动从月柱地支判定）</li>
<li><code>gender</code>（可选）：性别（乾造/坤造）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>步骤一：判定命局燥湿倾向</strong></p>
<ol>
<li>统计地支中的水类比例（亥、子、辰、丑 — 各+1分）和火类比例（巳、午、未、戌 — 各+1分）</li>
<li>水类总分 - 火类总分 &gt; 2 → &quot;偏湿&quot;；火类总分 - 水类总分 &gt; 2 → &quot;偏燥&quot;；差值 ≤ 2 → &quot;平衡&quot;</li>
<li>如果天干有强根之水或火，根据通根情况加权调整</li>
<li><strong>依据</strong>：原注&quot;过于湿者，滞而无成；过于燥者，烈而有祸&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：识别土的类型与作用</strong></p>
<ol>
<li>遍历地支，分类标记为燥土（未、戌）和湿土（辰、丑）</li>
<li>检查燥土是否与巳午火相邻 → 确认&quot;反助火而不能晦火&quot;</li>
<li>检查湿土是否与亥子水相邻 → 确认&quot;反助水而不能制水&quot;</li>
<li><strong>依据</strong>：【任氏曰】&quot;若见未戌燥土，反助火而不能晦火……若见丑辰湿土，反助水而不能制水&quot;</li>
</ol>
</li>
<li><p><strong>步骤三：判定调候策略</strong></p>
<ol>
<li>如命局偏湿 → 调候方向为&quot;用燥&quot;
a. 先用火（巳午丙丁）暖局
b. 再用燥土（未戌）固火
c. 避免：补充湿土（辰丑），以防助水</li>
<li>如命局偏燥 → 调候方向为&quot;用湿&quot;
a. 先用壬癸亥子水润局
b. 再用湿土（辰丑）蓄水
c. 避免：补充燥土（未戌），以防助火</li>
<li>特殊情境：木火伤官偏燥 → 用壬癸水+丑辰湿土；金水伤官偏湿 → 用丙丁火，忌丑辰</li>
<li><strong>依据</strong>：【原注】&quot;木火伤官要湿也；金水伤官要燥也&quot;</li>
</ol>
</li>
<li><p><strong>步骤四：命造实例参照</strong></p>
<ol>
<li>命局近似丙辰辛丑庚辰丙子（过湿）→ 遵循&quot;用水不用火&quot;策略</li>
<li>命局近似癸未丁巳甲午庚午（过燥）→ 仅可顺火势，不可逆</li>
<li><strong>依据</strong>：【任氏曰】列举的四组命造</li>
</ol>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ZaoShiReport {
  /** 燥湿判定 */
  moistureAssessment: {
    score: {
      water: number;        // 水类（亥子辰丑）得分
      fire: number;         // 火类（巳午未戌）得分
    };
    verdict: &quot;偏湿&quot; | &quot;偏燥&quot; | &quot;平衡&quot;;
    intensity: &quot;过&quot; | &quot;中&quot; | &quot;微&quot;;  // 偏离的强度
  };
  /** 土类识别 */
  soilAnalysis: {
    drySoil: string[];       // 燥土地支列表（未/戌）
    wetSoil: string[];       // 湿土地支列表（辰/丑）
    effect: string;          // 土的实际作用描述
  };
  /** 调候策略 */
  adjustment: {
    direction: &quot;用湿&quot; | &quot;用燥&quot; | &quot;无需调候&quot;;
    primaryTool: string[];    // 主要调候手段（如[&quot;壬癸水&quot;, &quot;辰丑湿土&quot;]）
    caution: string[];        // 应避免之物（如[&quot;未戌燥土&quot;]）
    specialCase: string | null; // 特殊情境（如&quot;木火伤官&quot;或&quot;金水伤官&quot;）
  };
  /** 行运建议 */
  luckAdvice: {
    favorable: string[];      // 利好运向
    unfavorable: string[];    // 不利运向
    note: string;             // 行运总评
  };
}
</code></pre>
`;
