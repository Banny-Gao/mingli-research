// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在完成三元拆解（天道技能）之后，对八字中五行分布的偏全情况进行定量和定性分析。此技能帮助判断命局五行的均衡性——哪些五行过旺、哪些过弱、是否缺行——并基于坤道篇&quot;五气偏全定吉凶&quot;的义理给出吉凶倾向的评估。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱（字符串）</li>
<li><strong>性别</strong>：乾造/坤造（可选）</li>
<li><strong>月令</strong>：月支对应的节令（影响五行旺衰判定）</li>
<li><strong>三元拆解结果</strong>：可选的来自天道技能（tiandao）的三元分析输出，用于加速分析</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>五行出现次数统计</strong>
a. 统计天干五行出现次数
b. 统计地支五行出现次数（包括地支本气）
c. 统计人元五行出现次数（地支所有藏干）
d. 加权汇总（天干权重 1.0，地支本气权重 0.7，人元余气权重 0.3）</p>
</li>
<li><p><strong>月令旺衰修正</strong>
a. 根据月令确定各五行当令状态（旺相休囚死）
b. 将月令权重纳入五行力度的修正
c. <strong>依据</strong>：坤道篇【原注】&quot;地有刚柔，故五行生于...与天合德&quot;——月令是&quot;神功&quot;的具体时空定位</p>
</li>
<li><p><strong>偏全判定</strong>
a. 根据公式计算偏全指数（0-100）：</p>
<ul>
<li>五行齐全且力量接近 → 偏全指数 低（0-30），标记为&quot;全&quot;</li>
<li>缺一行或力量失衡 → 偏全指数 中（30-70），标记为&quot;稍偏&quot;</li>
<li>缺两行或以上，或某行独占45%以上 → 偏全指数 高（70-100），标记为&quot;甚偏&quot;
b. <strong>依据</strong>：坤道篇【任氏曰】&quot;特异性五行之气有偏全，故万物之命有吉凶&quot;</li>
</ul>
</li>
<li><p><strong>吉凶倾向判断</strong>
a. &quot;全&quot;→ 格局根基稳，可进一步看用神喜忌
b. &quot;稍偏&quot;→ 需大运补偏救弊，标注应补的方向
c. &quot;甚偏&quot;→ 格局不稳，标注核心矛盾（过旺五行 vs 过弱五行）
d. <strong>依据</strong>：坤道篇【原注】&quot;赋于人者，有偏全之不一，故吉凶定于此&quot;</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface WuQiPianQuanReport {
  /** 五行原始统计 */
  rawCount: {
    wood: number;    // 木出现次数
    fire: number;    // 火出现次数
    earth: number;   // 土出现次数
    metal: number;   // 金出现次数
    water: number;   // 水出现次数
  };
  /** 月令修正后的五行力度（加权后归一化，各值0-100之和=100） */
  weightedStrength: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  /** 偏全评估 */
  assessment: {
    level: &quot;全&quot; | &quot;稍偏&quot; | &quot;甚偏&quot;;  // 偏全等级
    index: number;                    // 偏全指数（0-100）
    strongest: string;                // 最旺的五行
    weakest: string;                  // 最弱的五行
    missing: string[];                // 缺失的五行（如有）
    coreIssue: string;                // 核心矛盾描述
    remedyDirection: string;          // 补偏救弊的方向（大运建议）
  };
  /** 坤道理论依据 */
  references: string[];               // 引用原文依据列表
}
</code></pre>
`;
