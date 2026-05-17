// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>对输入的四柱八字进行假化格分析。当化格判定器输出&quot;疑似化格但不纯粹&quot;时调用此技能。重点检查化神是否得令、是否有根、是否被冲克，并分析日主原五行属性与化神属性之间的冲突程度，判定假化的类型和危险等级。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）</li>
<li><strong>大运</strong>：已排好的大运流年列表（可选，用于判断行运是否能弥补化神不足或加重冲克）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>前置检查：确认天干五合</strong>
a. 扫描四柱天干，识别是否存在五合配对：</p>
<ul>
<li>甲己合、乙庚合、丙辛合、丁壬合、戊癸合
b. 确认合的两干均已存在于命局天干中
c. <strong>判定</strong>：无五合 → 输出&quot;非化格&quot;（非假化讨论范围）
d. <strong>依据</strong>：【原注】&quot;甲己合化土，乙庚合化金...&quot;</li>
</ul>
</li>
<li><p><strong>化神状态评估</strong>
a. 根据五合类型确定化神五行
b. 检查化神是否得令（月令支持）：</p>
<ul>
<li>得令 → 化神有月令之力</li>
<li>失令 → 化神无月令支撑
c. 检查化神是否有根（地支中有化神五行的禄旺位）：</li>
<li>有根 → 化神有物质基础</li>
<li>无根 → 化神虚浮
d. <strong>依据</strong>：【原注】&quot;化神失令，不能成化&quot;</li>
</ul>
</li>
<li><p><strong>冲克检查</strong>
a. 遍历全局地支，检查是否有对冲克化神五行的存在
b. 遍历全局天干，检查是否有克害化神五行的存在
c. 评估冲克强度：</p>
<ul>
<li>强力冲克（冲克者得令有根）→ 化局被严重破坏</li>
<li>中等冲克（冲克者有力但不主导）→ 化局被削弱</li>
<li>弱度冲克（冲克者无根失令）→ 化局基本维持
d. <strong>依据</strong>：【原注】&quot;或有一神冲克，不能纯粹化之&quot;</li>
</ul>
</li>
<li><p><strong>判断假化类型</strong>
a. <strong>失令型假化</strong>：化神失令 + 无强力冲克</p>
<ul>
<li>化意萌动但月令不支持
b. <strong>受冲型假化</strong>：化神得令 + 有强力冲克</li>
<li>化神被冲克破坏，无法稳固
c. <strong>复合型假化</strong>：化神失令 + 有冲克</li>
<li>双重打击，化格几乎无法成立
d. <strong>依据</strong>：【任氏曰】&quot;假化之辨，难于真化也&quot;</li>
</ul>
</li>
<li><p><strong>分析日主属性冲突</strong>
a. 记录日主的原五行属性
b. 分析原属性与化神属性的关系（相生、相克、相同）
c. 评估属性冲突程度：</p>
<ul>
<li>原属性与化神相生 → 冲突较小（如甲木化土，木生火再生土）</li>
<li>原属性与化神相克 → 冲突较大（如丙火化水，水火相克）
d. 冲突愈大，假化愈凶</li>
</ul>
</li>
<li><p><strong>行运影响评估</strong>
a. 假化格行运能否&quot;补&quot;化神（助化神得令或有根）→ 可能转为真化
b. 假化格行运能否&quot;解&quot;冲克（化解冲克力量）→ 可能转为真化
c. 假化格行运是否&quot;加&quot;失令（进一步削弱化神）→ 化格彻底破坏
d. <strong>依据</strong>：假化的凶险在于化局进一步破坏则转为凶命</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface JiaHuaReport {
  /** 命局基础 */
  basic: {
    bazi: string;
    riZhu: string;
    gender: &quot;乾造&quot; | &quot;坤造&quot;;
  };
  /** 合化识别 */
  heIdentification: {
    heType: &quot;甲己&quot; | &quot;乙庚&quot; | &quot;丙辛&quot; | &quot;丁壬&quot; | &quot;戊癸&quot; | null;
    huaShen: &quot;土&quot; | &quot;金&quot; | &quot;水&quot; | &quot;木&quot; | &quot;火&quot; | null;
    hasHeIntent: boolean;     // 是否有化意（化神是否部分成立）
  };
  /** 假化成因 */
  jiaHuaCause: {
    primaryCause: &quot;失令&quot; | &quot;冲克&quot; | &quot;复合&quot; | null;
    deLing: &quot;得令&quot; | &quot;失令&quot;;
    deLingDetail: string;     // 月令与化神的关系说明
    chongKe: {
      hasChongKe: boolean;
      chongKeElement: string; // 冲克化神的五行
      chongKeStrength: &quot;强&quot; | &quot;中&quot; | &quot;弱&quot;;
    };
  };
  /** 日主属性冲突 */
  attributeConflict: {
    originalElement: string;  // 日主原五行
    huaShenElement: string;   // 化神五行
    conflictLevel: &quot;高&quot; | &quot;中&quot; | &quot;低&quot;;
    conflictDetail: string;   // 冲突的五行生克说明
  };
  /** 假化判定 */
  jiaHua: {
    isJiaHua: boolean;
    jiaHuaType: &quot;失令型&quot; | &quot;受冲型&quot; | &quot;复合型&quot; | null;
    severity: &quot;轻&quot; | &quot;中&quot; | &quot;重&quot;;
    description: string;      // 综合描述
  };
    /** 行运展望 */
  outlook: {
    canBecomeTrue: boolean;   // 是否有机会变为真化
    favorableLuck: string[];  // 有利大运（助化神）
    unfavorableLuck: string[]; // 不利大运（加重假化）
  };
}
</code></pre>
`;
