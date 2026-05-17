// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>接收到坤造（女命）八字后，先判定命局的用神与喜神，再将用神映射为夫星、喜神映射为子星，完成女命特有的夫子星判定。此技能应替代通用用神分析，专用于女命情境——因为在女命中，用神的选择受到夫星/子星的约束，并非完全自由的选神。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱（字符串，如&quot;戊申 甲寅 壬寅 丁未&quot;）</li>
<li><strong>性别</strong>：必须为坤造（女命）</li>
<li><strong>大运</strong>：已排大运（可选，影响夫星子星的岁运应期判定）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>判定日主旺衰</strong>
a. 按月令、地支藏干、四柱生扶克耗，判定日主旺衰
b. 标记比劫（同类）、印绶（生我）、官杀（克我）、财星（我克）、食伤（我生）的数量与强弱
c. <strong>依据</strong>：女命篇【任氏曰】&quot;先观夫星之盛衰&quot;</p>
</li>
<li><p><strong>判定用神（夫星）</strong>
a. 若官星明顺、不过旺不过弱 → 以官星为夫（用神）
b. 若官星太旺 → 以伤官为夫（以克官者代夫）
c. 若官星太微 → 以财星为夫（以生官者代夫）
d. 若比肩旺而无官 → 以伤官为夫（以日主所泄者代夫）
e. 若伤官旺而无财官 → 以印为夫（以制伤者代夫）
f. 若满局印绶泄官星之气 → 以财为夫（以破印者代夫）
g. <strong>依据</strong>：女命篇【原注】&quot;若官星太旺，以伤官为夫&quot;至&quot;喜财而身不克失也&quot;</p>
</li>
<li><p><strong>判定喜神（子星）</strong>
a. 若伤官清显得宜 → 以伤官为子
b. 若伤官太旺 → 以印为子
c. 若伤官太微 → 以比肩为子
d. 若印绶旺而无伤官 → 以财为子
e. 若财星旺而泄食伤 → 以比肩为子
f. <strong>依据</strong>：女命篇【原注】&quot;若伤官太旺，以印为子&quot;至&quot;以比肩为子也&quot;</p>
</li>
<li><p><strong>判定品格倾向（贞洁/淫贱）</strong>
a. 检查是否有有效的制约关系：</p>
<ul>
<li>伤官重而有印制 → 贞洁聪明</li>
<li>身旺而有财耗 → 贞洁美貌
b. 检查是否有放纵倾向的标志：</li>
<li>日主旺而官星弱无财星 → 轻佻难束</li>
<li>伤官重而无印绶 → 轻佻多淫</li>
<li>满局比劫无食伤、满局印绶无财 → 性情偏执
c. <strong>依据</strong>：女命篇【任氏曰】&quot;伤官不宜重，重必轻佻美貌而多淫也；伤官身弱有印，身旺有财者，必聪明美貌而贞洁也&quot;</li>
</ul>
</li>
<li><p><strong>输出报告</strong>
a. 汇总日主、夫星、子星、品格倾向四项判定
b. 每条判定附原文依据</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface NvMingReport {
  /** 基础信息 */
  basic: {
    bazi: string;           // 八字字符串
    gender: &quot;坤造&quot;;
    riZhu: string;          // 日柱干支
    riZhuWuXing: string;    // 日主五行
    shuaiWang: string;      // 旺相休囚死
  };
  /** 夫星（用神）判定 */
  fuXing: {
    name: string;           // 夫星名称（正官/七杀/伤官/财星/印星）
    ganZhi: string;         // 对应的天干地支
    basis: string;          // 判定依据
    strength: &quot;强&quot; | &quot;中&quot; | &quot;弱&quot;;
    husbandStatus: &quot;夫贵&quot; | &quot;夫贱&quot; | &quot;克夫&quot; | &quot;无夫&quot;;
  };
  /** 子星（喜神）判定 */
  ziXing: {
    name: string;           // 子星名称
    ganZhi: string;
    basis: string;
    childStatus: &quot;子多且贵&quot; | &quot;子多而强&quot; | &quot;子少&quot; | &quot;无子&quot; | &quot;子克夫&quot;;
  };
  /** 品格倾向评估 */
  character: {
    type: &quot;贞洁&quot; | &quot;淫贱&quot; | &quot;中正&quot;;
    basis: string[];
    caution: string;        // &quot;不可轻断淫邪，以渎神怒&quot; 伦理提醒
  };
  conclusion: string;
}
</code></pre>
`;
