// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>通过分析八字命局中五行（金木水火土）的力量分布和生克制化关系，推断命主的性格倾向。AI 执行者应在需要分析命主的性格特质时调用本技能，可用于综合命局分析的补充模块。此技能仅做五行层面的性格推断，不涉及心理学术语或现代人格分类。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串格式）</li>
<li><strong>日主</strong>：日柱天干的五行属性（自动提取）</li>
<li><strong>五行力量分布</strong>：可选，未提供时本技能默认按四柱五行统计</li>
<li><strong>重点关注</strong>（可选）：指定想要了解的某方面性格特征（如&quot;勇气&quot;&quot;仁慈&quot;等）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>统计五行力量</strong></p>
<ul>
<li>统计天干的五行分布（每个天干计 1 分）</li>
<li>统计地支藏干的五行分布（每个藏干计 1 分，主气计 2 分）</li>
<li>计算月令对五行力量的加权影响（当令者乘以 1.5 倍）</li>
<li>得出五行力量排名（从最强到最弱）</li>
</ul>
</li>
<li><p><strong>分析最强五行</strong></p>
<ul>
<li>最强五行主导性格的基本方向</li>
<li>判断该五行是否过旺（显著超过其他五行）</li>
<li>过旺则取其&quot;恶&quot;的一面，适中则取其&quot;善&quot;的一面</li>
<li>依据：【原注】&quot;五行决定性情，金木水火土，各有善恶刚柔&quot;</li>
</ul>
</li>
<li><p><strong>分析最弱五行</strong></p>
<ul>
<li>最弱五行反映性格中的短板或不足</li>
<li>判断该五行是否过弱（显著弱于其他五行）</li>
<li>过弱则性格中缺乏该五行的正面特质</li>
</ul>
</li>
<li><p><strong>分析五行之间的生克关系</strong></p>
<ul>
<li>如果最强五行克另一个五行 → 性格中的压制关系</li>
<li>如果最强五行生另一个五行 → 性格中的转化关系</li>
<li>如果两个五行相冲 → 性格中的矛盾特质</li>
</ul>
</li>
<li><p><strong>综合输出</strong></p>
<ul>
<li>结合最强五行、最弱五行、生克关系，输出完整的性格描述</li>
<li>分别描述正面性格和负面倾向</li>
<li>依据：【任氏曰】&quot;从其五行，可推人之性情&quot;</li>
</ul>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface XingQingReport {
  wuXingDistribution: {
    mu: number;   // 木的力量值
    huo: number;  // 火的力量值
    tu: number;   // 土的力量值
    jin: number;  // 金的力量值
    shui: number; // 水的力量值
  };
  dominantElement: {
    name: string;     // &quot;金&quot;|&quot;木&quot;|&quot;水&quot;|&quot;火&quot;|&quot;土&quot;
    power: &quot;过旺&quot; | &quot;适中&quot; | &quot;偏弱&quot; | &quot;过弱&quot;;
    traits: string[]; // 性格特征列表
  };
  weaknesses: string[];  // 性格短板
  conflicts: string[];   // 内在矛盾描述
  personality: {
    positive: string[];  // 正面性格描述
    negative: string[];  // 负面倾向描述
  };
  note: string;   // 综合说明（提醒五行分析为人格参考，非绝对判定）
}
</code></pre>
`;
