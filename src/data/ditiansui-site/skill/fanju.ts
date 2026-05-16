// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>输入一个八字命局，识别日主是否&quot;失令受攻&quot;且&quot;反与时争&quot;——即反局的三大特征。此技能用于八字深度分析中的风险识别阶段，辅助判断命局是否存在反局倾向及其凶险程度。</p>
<h2>输入</h2>
<ul>
<li><code>year_pillar</code>：年柱干支（如 &quot;庚申&quot;）</li>
<li><code>month_pillar</code>：月柱干支（如 &quot;甲申&quot;）</li>
<li><code>day_pillar</code>：日柱干支（如 &quot;甲申&quot;）</li>
<li><code>hour_pillar</code>：时柱干支（如 &quot;庚午&quot;）</li>
<li><code>day_master</code>：日主五行（自动从日柱提取）</li>
<li><code>gender</code>：性别（可选）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>步骤一：判断日主是否失令</strong></p>
<ol>
<li>提取月令地支（月柱地支）</li>
<li>检查月令五行是否克日主（官杀当令）或耗日主（财星当令）</li>
<li>如果月令克/耗日主 → 标记为&quot;失令&quot;</li>
<li>依据：反局篇【原注】&quot;日主失令&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：判断财官是否攻身</strong></p>
<ol>
<li>统计全局财星（日主所克之五行）的力量占比</li>
<li>统计全局官杀（克日主之五行）的力量占比</li>
<li>将财官力量总和与日主+印比力量总和对比</li>
<li>如果财官力量总和 ≥ 日主印比力量总和的2倍 → 标记为&quot;财官攻身&quot;</li>
<li>依据：反局篇【原注】&quot;财官攻身&quot;</li>
</ol>
</li>
<li><p><strong>步骤三：判断是否存在&quot;争&quot;的行为</strong></p>
<ol>
<li>如果日主无根但满局印比帮扶 → 不标记为反局（这是普通弱势局）</li>
<li>如果日主无根且财官势大 → 标记为从格（不争）</li>
<li>如果日主有弱根但印比衰微 → 标记为&quot;逆势争旺&quot;候选</li>
<li>依据：反局篇【任氏曰】&quot;不能顺势而行，反与时争，此反也&quot;</li>
</ol>
</li>
<li><p><strong>步骤四：评估危险等级</strong></p>
<ol>
<li>反局三特征全部满足 → 危险等级: 高</li>
<li>满足2项 → 危险等级: 中</li>
<li>满足1项或0项 → 危险等级: 低或无风险</li>
<li>检查是否有救应（印星化杀、食伤制杀）→ 如果有，降低一个风险等级</li>
</ol>
</li>
<li><p><strong>步骤五：输出反局分析</strong></p>
<ol>
<li>输出反局三项指标的逐项判定结果</li>
<li>输出救应机制的存在与否</li>
<li>输出总体风险评估</li>
</ol>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface FanjuAnalysis {
  summary: {
    isFanJu: boolean;                     // 是否反局
    riskLevel: &quot;high&quot; | &quot;medium&quot; | &quot;low&quot;; // 风险等级
  };
  indicators: {
    shiLing: {                            // 失令判断
      isShiLing: boolean;
      reason: string;
    };
    caiGuanGongShen: {                    // 财官攻身判断
      isGongShen: boolean;
      powerRatio: number;                 // 财官力量/日主力量
      reason: string;
    };
    niShiZhengWang: {                     // 逆势争旺判断
      isZhengWang: boolean;
      reason: string;
    };
  };
  rescue: {
    hasYinHuaSha: boolean;                // 是否有印星化杀
    hasShiShenZhiSha: boolean;            // 是否有食伤制杀
    rescueDetail: string;                 // 救应机制描述
    riskAfterRescue: &quot;high&quot; | &quot;medium&quot; | &quot;low&quot;;
  };
}
</code></pre>
`;
