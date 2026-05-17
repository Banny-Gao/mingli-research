// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>对输入的四柱八字进行从格分析。先检查日主在地支中是否有根（禄、旺、余气），然后评估全局五行之势，判定日主是否&quot;不得不从&quot;。如构成从格，进一步判定从格类型（从财/从官杀/从食伤/从势）和真假（真从/假从），并给出用神建议。此技能在常规扶抑法失效（日主无根无法扶抑）时调用。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;庚戌 甲申 甲戌 乙丑&quot;）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）</li>
<li><strong>大运</strong>：已排好的大运流年列表（可选，用于判定行运是否破格）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>检查日主之根</strong>
a. 提取日柱天干（日主）
b. 遍历四柱地支（年支、月支、日支、时支）
c. 检查每个地支中是否含有日主五行的禄位、旺位或余气：</p>
<ul>
<li>禄位：如甲见寅、乙见卯、丙见巳、丁见午等</li>
<li>余气：如甲见辰（辰中乙木为余气）</li>
<li>长生位：如丙见寅（寅中丙火为长生）
d. <strong>判定</strong>：至少有一个地支含日主之根 → 不从（结束从格判定，转常规扶抑法）
e. <strong>判定</strong>：所有地支都不含日主之根 → 进入步骤2
f. <strong>依据</strong>：【原注】&quot;从象者，日主无援&quot;；【任氏曰】&quot;须观日主之根有无也&quot;</li>
</ul>
</li>
<li><p><strong>评估全局五行之势</strong>
a. 统计四柱天干地支的五行分布
b. 标记月令五行（月支的本气五行）
c. 识别强势五行（出现次数最多且月令当权者）
d. <strong>判定</strong>：全局以某一两种五行为绝对主导 → 进入步骤3
e. <strong>判定</strong>：五行力量分散、没有绝对主导 → 不从格（日主无根但无势可从，为弱极之命）
f. <strong>依据</strong>：【任氏曰】&quot;满局财官，不得不从&quot;</p>
</li>
<li><p><strong>判定从格类型</strong>
a. 强势五行为财星（日主所克） → 从财格
b. 强势五行为官杀（克日主） → 从官杀格
c. 强势五行为食伤（日主所生） → 从食伤格
d. 强势五行为两三种混杂 → 从势格
e. <strong>依据</strong>：八格篇【任氏曰】&quot;曰从财，曰从官杀，曰从食伤，曰从强，曰从弱，曰从势&quot;</p>
</li>
<li><p><strong>判定真从与假从</strong>
a. 检查所有地支是否完全不含日主五行 → 真从
b. 检查是否有少量印绶生扶日主 → 假从（有杂神干扰）
c. 检查日主是否有微根（如墓库余气） → 假从（有残根）
d. <strong>判定</strong>：所有条件满足真从 → &quot;真从者富贵&quot;
e. <strong>判定</strong>：有残根/杂神 → &quot;假从者凶夭&quot;
f. <strong>依据</strong>：【原注】&quot;从真则贵，从假则贱&quot;；【任氏曰】&quot;真从者富贵，假从者凶夭&quot;</p>
</li>
<li><p><strong>确定用神与喜忌</strong>
a. 从格之&quot;用神&quot;即&quot;从神&quot;——强势阵营的五行
b. <strong>喜</strong>：助从神之运（生扶从神或与从神同气）
c. <strong>忌</strong>：助日主之运（生扶日主、给日主加根，破坏从局）
d. <strong>依据</strong>：从格以顺强势为吉，逆强势为凶</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface CongGeReport {
  /** 命局基础 */
  basic: {
    bazi: string;       // 四柱八字
    riZhu: string;      // 日主天干
    gender: &quot;乾造&quot; | &quot;坤造&quot;;
  };
  /** 根检查 */
  rootCheck: {
    hasRoot: boolean;
    rootDetails: string;  // 如&quot;地支申、戌、丑中全无木之禄旺余气&quot;
  };
  /** 从格判定 */
  congGe: {
    isCongGe: boolean;
    congType: &quot;从财&quot; | &quot;从官杀&quot; | &quot;从食伤&quot; | &quot;从势&quot; | null;
    authenticity: &quot;真从&quot; | &quot;假从&quot; | null;
    authenticityBasis: string;  // 真/假的判定依据
  };
  /** 用神喜忌 */
    yongShen: {
    yongShen: string;       // 从神五行
    xi: string[];           // 喜神列表
    ji: string[];           // 忌神列表
    description: string;    // 综合描述
  };
  /** 行运提示 */
  luckAdvice: {
    favorable: string[];   // 有利大运
    unfavorable: string[]; // 不利大运
    breakRisk: string;     // 破格风险提示
  };
}
</code></pre>
`;
