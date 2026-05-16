// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在收到八字四柱后，分别统计天干中的阳干（刚）与阴干（柔）数量，结合日主阴阳属性，评估命局是&quot;刚柔相济&quot;、&quot;偏刚&quot;还是&quot;偏柔&quot;，并给出是否需要&quot;以柔济刚&quot;或&quot;以刚济柔&quot;的调济建议。此技能应在用神分析之后、性格判断阶段调用。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;甲子 丙寅 己丑 甲子&quot;）</li>
<li><strong>用神分析结果</strong>：已确定的用神、喜神、忌神信息（可选）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>天干刚柔分类</strong>
a. 提取四柱的四个天干
b. 每个天干标记为&quot;刚&quot;（阳干：甲丙戊庚壬）或&quot;柔&quot;（阴干：乙丁己辛癸）
c. 统计刚干数量 vs 柔干数量
d. <strong>依据</strong>：刚柔篇【原注】&quot;甲丙戊庚壬为阳，刚也；乙丁己辛癸为阴，柔也&quot;</p>
</li>
<li><p><strong>地支藏干刚柔分析</strong>
a. 提取四柱地支所藏天干
b. 统计藏干中的阳干与阴干
c. 计算总刚柔比例（天干 + 藏干）</p>
</li>
<li><p><strong>日主刚柔判定</strong>
a. 判定日主是阳干（刚）还是阴干（柔）
b. <strong>依据</strong>：刚柔篇【任氏曰】&quot;刚柔之论，乃阴阳之辨也&quot;</p>
</li>
<li><p><strong>刚柔状态评估</strong>
a. 日主为刚（阳）：</p>
<ul>
<li>全局刚&gt;柔 且 柔数≥2 → &quot;刚柔相济&quot;（刚得柔济，平衡）</li>
<li>全局刚&gt;柔 且 柔数&lt;2 → &quot;偏刚&quot;（过刚，需要补柔）</li>
<li>全局柔&gt;刚 → &quot;柔胜刚&quot;（日主虽刚但被柔所困）
b. 日主为柔（阴）：</li>
<li>全局柔&gt;刚 且 刚数≥2 → &quot;刚柔相济&quot;（柔得刚济，平衡）</li>
<li>全局柔&gt;刚 且 刚数&lt;2 → &quot;偏柔&quot;（过柔，需要补刚）</li>
<li>全局刚&gt;柔 → &quot;刚胜柔&quot;（日主虽柔但被刚所制）
c. <strong>依据</strong>：刚柔篇【任氏曰】&quot;刚者宜柔济之，柔者宜刚济之，此相济之道也&quot;</li>
</ul>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface GangRouReport {
  /** 天干刚柔统计 */
  heavenStems: {
    stems: string[];           // [年干, 月干, 日干, 时干]
    gang: string[];            // 阳干列表
    rou: string[];             // 阴干列表
    gangCount: number;
    rouCount: number;
  };
  
  /** 日主信息 */
  dailyMaster: {
    stem: string;
    nature: &quot;刚&quot; | &quot;柔&quot;;
  };
  
  /** 综合评估 */
  assessment: {
    state: &quot;刚柔相济&quot; | &quot;偏刚&quot; | &quot;偏柔&quot; | &quot;刚胜柔&quot; | &quot;柔胜刚&quot;;
    balanceScore: number;      // 0-10, 10为最平衡
    description: string;
    recommendation: string;    // 调济建议
  };
  
  /** 性格倾向推断 */
  personality: {
    strengths: string[];       // 性格优势
    weaknesses: string[];      // 性格短板
    advice: string;            // 调柔/调刚建议
  };
}
</code></pre>
`;
