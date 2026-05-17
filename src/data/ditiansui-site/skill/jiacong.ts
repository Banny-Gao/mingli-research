// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>对输入的四柱八字进行假从格分析。当从象判定器输出&quot;疑似从格但不纯粹&quot;时调用此技能。重点检查日主在地支中的微弱残根（余气、墓库）和命局中的杂神干扰，评估从势是否压倒残根，判定假从的类型和危险等级。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）</li>
<li><strong>大运</strong>：已排好的大运流年列表（可选，用于判断行运是否将残根连根拔起或壮大残根）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>前置检查：是否已排除真从和不从</strong>
a. 确认日主在地支中确实有一点微根（余气/墓库），而非完全无根
b. 确认全局确实有一个主导的从势方向
c. <strong>依据</strong>：【原注】&quot;日主有根，不能彻底从之；或有一神杂入，不能纯粹从之&quot;</p>
</li>
<li><p><strong>残根评估</strong>
a. 扫描四柱地支，定位日主五行的余气位或墓库位
b. 评估残根强度：</p>
<ul>
<li>余气根（如辰中乙木为甲木余气）→ 微弱</li>
<li>墓库根（如未中乙木、戌中辛金等）→ 极弱</li>
<li>长生根（如亥中甲木为丙火长生）→ 中等
c. 检查残根是否被冲克或合化：</li>
<li>被冲 → 残根更弱（可能等于无）</li>
<li>被合化 → 残根被化走（实际等于无根）
d. <strong>判定</strong>：残根存在且未被彻底破坏 → 假从
e. <strong>判定</strong>：残根虽存但被冲合殆尽 → 实际上等于真从
f. <strong>依据</strong>：【任氏曰】&quot;假从之辨，难于真从也&quot;</li>
</ul>
</li>
<li><p><strong>杂神识别</strong>
a. 识别命局中与从神五行不同的其他五行
b. 评估杂神的力量：</p>
<ul>
<li>杂神有根 → 干扰力强</li>
<li>杂神无根 → 干扰力弱</li>
<li>杂神被从神合化 → 干扰被转化
c. <strong>判定</strong>：存在有根杂神 → 假从（杂神型）
d. <strong>判定</strong>：存在无根杂神 → 假从（杂神弱型，从势尚存）</li>
</ul>
</li>
<li><p><strong>从势与残根的权衡</strong>
a. 比较从神的力量总值 vs 残根的力量总值
b. 从神包括：从神的数量、得令程度、全局根基
c. 残根包括：残根的五行、数量、是否被生扶
d. <strong>判定</strong>：从神力量远大于残根 → 假从成立，但假
e. <strong>判定</strong>：从神与残根力量接近 → 不从格（身弱格）
f. <strong>依据</strong>：【原注】&quot;不能彻底从之&quot;——彻底与否取决于力量对比</p>
</li>
<li><p><strong>行运破格风险评估</strong>
a. 分析大运是否可能壮大残根（给日主加禄/加印）→ 破从格，转为不从
b. 分析大运是否可能削弱从神（克制从神五行）→ 破从格
c. 分析大运是否可能消灭残根（冲克残根地支）→ 假从变真从
d. <strong>依据</strong>：假从最怕行运&quot;助长残根&quot;或&quot;打击从神&quot;两种走向</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface JiaCongReport {
  /** 命局基础 */
  basic: {
    bazi: string;
    riZhu: string;
    gender: &quot;乾造&quot; | &quot;坤造&quot;;
  };
  /** 残根分析 */
  residualRoot: {
    hasRoot: boolean;
    rootType: &quot;余气&quot; | &quot;墓库&quot; | &quot;长生&quot; | &quot;无&quot;;
    rootLocation: string;     // 残根所在的地支
    rootStrength: &quot;极弱&quot; | &quot;微弱&quot; | &quot;中等&quot;;
    damaged: boolean;         // 是否被冲克合化损坏
    damageDetail: string;
  };
  /** 杂神分析 */
  impurity: {
    hasImpurity: boolean;
    impurityElement: string;  // 杂神五行
    impurityStrength: &quot;强&quot; | &quot;中&quot; | &quot;弱&quot;;
    impurityEffect: &quot;干扰&quot; | &quot;被合化&quot; | &quot;被制服&quot;;
  };
  /** 假从判定 */
  jiaCong: {
    isJiaCong: boolean;
    jiaCongType: &quot;有根型&quot; | &quot;杂神型&quot; | &quot;混合型&quot; | null;
    congDirection: string;    // 从神五行
    purity: number;           // 纯度百分比（0-100）
    description: string;      // 综合描述
  };
  /** 行运预警 */
    luckWarning: {
    breakRisk: &quot;高&quot; | &quot;中&quot; | &quot;低&quot;;
    breakCondition: string;   // 破格条件
    favorableLuck: string[];  // 有利大运
    unfavorableLuck: string[]; // 不利大运
  };
}
</code></pre>
`;
