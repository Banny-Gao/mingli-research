// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字四柱后，根据出生月份和全局五行组合，评估命局的整体寒暖状态（极寒、偏寒、适中、偏暖、极热），判断是否需要调候，以及调候用神是否有力。此技能应在格局分析和用神判断之前调用——调候需求会直接影响用神的选取。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;丙子 己亥 辛酉 己亥&quot;）</li>
<li><strong>出生季节</strong>：月令地支（已包含在四柱中）</li>
<li><strong>用神分析结果</strong>：已确定的格局用神（可选，用于调候与格局的冲突判断）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>月令气候判定</strong>
a. 根据月支确定出生季节的基本气候：</p>
<ul>
<li>亥子丑月 → 冬（寒）</li>
<li>寅卯辰月 → 春（寒暖过渡）</li>
<li>巳午未月 → 夏（热）</li>
<li>申酉戌月 → 秋（凉燥过渡）
b. <strong>依据</strong>：寒暖篇【原注】&quot;冬令水冷，须火调之；夏令火炎，须水润之&quot;</li>
</ul>
</li>
<li><p><strong>全局寒暖综合评估</strong>
a. 统计全局五行中&quot;暖&quot;的要素：</p>
<ul>
<li>火的数量和力量（丙丁巳午）</li>
<li>木能生火（木多间接增暖）
b. 统计全局五行中&quot;寒&quot;的要素：</li>
<li>水的数量和力量（壬癸亥子）</li>
<li>金能生水（金多间接增寒）
c. 结合月令和全局五行，综合评分命局寒暖（-10极寒到+10极热）
d. <strong>依据</strong>：寒暖篇【任氏曰】&quot;寒暖之论，乃气候之辨也&quot;</li>
</ul>
</li>
<li><p><strong>调候需求判定</strong>
a. 综合评分 ≤ -6 → &quot;极寒&quot;，急需火调候
b. 综合评分 -5 ~ -3 → &quot;偏寒&quot;，建议火调候
c. 综合评分 -2 ~ +2 → &quot;寒暖适中&quot;，无需专门调候
d. 综合评分 +3 ~ +5 → &quot;偏暖&quot;，建议水调候
e. 综合评分 ≥ +6 → &quot;极热&quot;，急需水调候
f. <strong>依据</strong>：寒暖篇【原注】&quot;调候为急，不可不知也&quot;</p>
</li>
<li><p><strong>调候用神有效性检查</strong>
a. 需火调候 → 检查丙丁巳午是否出现且有力
b. 需水调候 → 检查壬癸亥子是否出现且有力
c. 调候之神无根或受克 → &quot;调候无力&quot;，命局危险
d. <strong>依据</strong>：寒暖篇【任氏曰】&quot;寒命宜暖，暖命宜寒，此调候之道也&quot;</p>
</li>
<li><p><strong>调候与格局整合</strong>
a. 调候用神 == 格局用神 → &quot;调候与格局一致&quot;（最佳）
b. 调候用神 ≠ 格局用神 → &quot;调候与格局冲突&quot;（优先调候，行运再补格局）
c. 无需调候 → &quot;仅以格局为准&quot;</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface HanNuanReport {
  /** 命局气候基础 */
  climate: {
    birthSeason: &quot;春&quot; | &quot;夏&quot; | &quot;秋&quot; | &quot;冬&quot;;
    coldWarmScore: number;           // -10 ~ +10
    condition: &quot;极寒&quot; | &quot;偏寒&quot; | &quot;适中&quot; | &quot;偏暖&quot; | &quot;极热&quot;;
  };
  
  /** 寒暖要素统计 */
  elements: {
    warmFactors: {
      fireCount: number;             // 火的数量
      woodCount: number;             // 木的数量（生火）
      description: string;
    };
    coldFactors: {
      waterCount: number;            // 水的数量
      metalCount: number;            // 金的数量（生水）
      description: string;
    };
  };
  
  /** 调候需求 */
  adjustmentNeeded: {
    needsAdjustment: boolean;
    priority: &quot;极高（急需）&quot; | &quot;中度（需要）&quot; | &quot;无（适中）&quot;;
    recommendedElement: string | null;  // &quot;火&quot; 或 &quot;水&quot; 或 null
  };
  
  /** 调候用神检查 */
  adjustmentCandidate: {
    element: string | null;
    strength: &quot;有力&quot; | &quot;有根但弱&quot; | &quot;无根或受克&quot; | &quot;不存在&quot;;
    details: string;
  };
  
  /** 调候与格局整合 */
  integration: {
    relation: &quot;调候与格局一致&quot; | &quot;调候与格局冲突&quot; | &quot;无需调候&quot;;
    advice: string;
    finalDecision: string;           // 最终取用建议
  };
}
</code></pre>
`;
