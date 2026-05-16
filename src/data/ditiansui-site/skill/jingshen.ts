// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在收到八字四柱后，先定义命局中的&quot;精&quot;（生我的印星）、&quot;神&quot;（克我的官杀或我生的食伤）、&quot;气&quot;（日主的本气是否贯足），然后评估三者之间的流通平衡状态，最后判断是否存在五行偏枯（水泛木浮、木多火炽等）以及给出损益调节建议。此技能在体用分析之后、源流判断之前调用。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支</li>
<li><strong>用神与喜忌</strong>：已确定的用神和喜忌判断（可选，来自体用分析）</li>
<li><strong>大运</strong>：已排好的大运列表（可选，用于评估大运对精神气的影响）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>精的定位与评估</strong>
a. 检查四柱中的正印和偏印（生扶日主的五行）
b. 评估印星的力量：</p>
<ul>
<li>数量（透出几个印星）</li>
<li>根气（印星是否通根于地支）</li>
<li>是否为用神
c. <strong>依据</strong>：精神篇【任氏曰】&quot;精者，生我之神也&quot;</li>
</ul>
</li>
<li><p><strong>气的定位与评估</strong>
a. 评估日主的&quot;本气贯足&quot;程度：</p>
<ul>
<li>日主是否通根于地支</li>
<li>日主在月令中的旺相休囚死状态</li>
<li>日主的帮扶力量（比劫）
b. 判断气是否&quot;贯足&quot;
c. <strong>依据</strong>：精神篇【任氏曰】&quot;气者，本气贯足也&quot;</li>
</ul>
</li>
<li><p><strong>神的定位与评估</strong>
a. 检查四柱中的正官七杀（克我的五行）和食神伤官（我生的五行）
b. 识别主要的&quot;神&quot;（以官杀为内核的制约力量）
c. 评估神的力量和状态
d. <strong>依据</strong>：精神篇【任氏曰】&quot;神者，克我之物也&quot;</p>
</li>
<li><p><strong>精→气→神连锁分析</strong>
a. 检查精是否能够生助气（印星生扶日主）
b. 检查气是否贯足（日主自身有力）
c. 检查神是否有用（官杀制约或食伤泄秀）
d. 综合评估链条完整性
e. <strong>依据</strong>：精神篇【任氏曰】&quot;精足则气旺，气旺则神旺&quot;</p>
</li>
<li><p><strong>五行偏枯检测</strong>
a. 检查水泛木浮（水过旺、木被浮）
b. 检查木多火炽（木过旺、火被塞）
c. 检查火炎金无（火过旺、金被熔）
d. 检查金多水弱（金过旺、水被泄）
e. <strong>依据</strong>：精神篇【任氏曰】&quot;水泛木浮，木无精神；木多火炽，火无精神...&quot;</p>
</li>
<li><p><strong>损益建议</strong>
a. 精太足 → 建议益气（加强食伤泄秀）
b. 气太旺 → 建议助神（加强官杀制约）
c. 神太泄 → 建议滋精（加强印星生扶）
d. <strong>依据</strong>：精神篇【任氏曰】&quot;精太足宜益其气，气太旺宜助其神，神太泄宜滋其精&quot;</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface JingShenReport {
  /** 精（印星）评估 */
  jing: {
    yinStars: string[];           // 正印偏印列表
    strength: &quot;足&quot; | &quot;中&quot; | &quot;缺&quot; | &quot;枯&quot;;
    analysis: string;
  };
  /** 气（日主本气）评估 */
  qi: {
    dayMaster: string;            // 日干
    strength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
    isGuanZu: boolean;            // 是否贯足
    rootBranches: string[];       // 通根地支
    analysis: string;
  };
  /** 神（官杀/食伤）评估 */
  shen: {
    guanSha: string[];            // 正官七杀列表
    shiShang: string[];           // 食神伤官列表
    strength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
    analysis: string;
  };
  /** 连锁分析 */
  chain: {
    complete: boolean;            // 精→气→神链条是否完整
    blockage: string | null;      // 堵点描述
    assessment: string;
  };
  /** 偏枯检测 */
  pianKu: {
    hasPianKu: boolean;
    type: &quot;水泛木浮&quot; | &quot;木多火炽&quot; | &quot;火炎金无&quot; | &quot;金多水弱&quot; | null;
    description: string;
  };
  /** 损益建议 */
  advice: {
    action: &quot;益精&quot; | &quot;益气&quot; | &quot;助神&quot; | &quot;泄精&quot; | &quot;抑气&quot; | &quot;滋神&quot; | &quot;平衡&quot;;
    reason: string;
    preferredLuck: string[];       // 推荐行运方向
  };
}
</code></pre>
`;
