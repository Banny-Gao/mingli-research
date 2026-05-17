// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字四柱后，先分析天干之间的相合关系（甲己合土、乙庚合金等五种合化），再分析地支之间的六合关系（子丑合、寅亥合等六种），然后判断天干是否通根于地支、干支配合是否得当，最后以日主为中心评估命局的整体协调性。此技能在完成了天道篇三元分析之后、进入八格判断之前使用。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干和地支（字符串，如&quot;甲子 己巳 甲午 甲子&quot;）</li>
<li><strong>月令</strong>：出生月份地支（用于判断合化条件的成败）</li>
<li><strong>性别</strong>：乾造或坤造（可选）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>天干相合分析</strong>
a. 检测四柱中是否存在以下对子：</p>
<ul>
<li>甲 + 己 → 合土</li>
<li>乙 + 庚 → 合金</li>
<li>丙 + 辛 → 合水</li>
<li>丁 + 壬 → 合木</li>
<li>戊 + 癸 → 合火
b. 判断合化是否成功：</li>
<li>月令支持化出五行 → 标记为&quot;化&quot;</li>
<li>月令不支持 → 标记为&quot;绊&quot;
c. <strong>依据</strong>：干支总论篇【原句】&quot;甲己合土，中正之合；乙庚合金，仁义之合...&quot;</li>
</ul>
</li>
<li><p><strong>地支六合分析</strong>
a. 检测四柱中是否存在以下对子：</p>
<ul>
<li>子 + 丑 → 合土</li>
<li>寅 + 亥 → 合木</li>
<li>卯 + 戌 → 合火</li>
<li>辰 + 酉 → 合金</li>
<li>巳 + 申 → 合水</li>
<li>午 + 未 → 合火
b. 判断合化还是绊住
c. <strong>依据</strong>：干支总论篇【原句】&quot;子丑合土，寅亥合木，卯戌合火，辰酉合金，巳申合水，午未合火&quot;</li>
</ul>
</li>
<li><p><strong>干支通根分析</strong>
a. 对每个天干，检查其在四个地支中是否有通根：</p>
<ul>
<li>甲 → 寅（禄）、卯（旺）、辰（余气）</li>
<li>乙 → 卯（禄）、寅（旺）、辰（余气）</li>
<li>丙/丁 → 巳午未</li>
<li>戊/己 → 辰戌丑未</li>
<li>庚/辛 → 申酉戌</li>
<li>壬/癸 → 亥子丑
b. <strong>依据</strong>：干支总论篇【原注】&quot;天干地支，相为表里&quot;</li>
</ul>
</li>
<li><p><strong>日主强势分析</strong>
a. 定位日柱天干（日主）
b. 判断日主是否通根于地支
c. 判断日主在月令中的旺相休囚死状态
d. 评估日主总体强弱
e. <strong>依据</strong>：干支总论篇【原句】&quot;日干为身，身旺则可以任财，身弱则不能敌官&quot;</p>
</li>
<li><p><strong>配合评估</strong>
a. 检查干支之间是否存在相克关系（如甲申——甲木坐申金被克）
b. 检查天干与地支的五行趋势是否一致
c. <strong>依据</strong>：干支总论篇【原句】&quot;干支配合，最宜辨其喜忌&quot;</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface GanZhiReport {
  /** 天干相合分析 */
  tianGanHe: {
    pairs: Array&lt;{
      gan1: string;
      gan2: string;
      heType: string;         // 合土/合金/合水/合木/合火
      status: &quot;化&quot; | &quot;绊&quot;;
      heName: string;         // 如&quot;中正之合&quot;
    }&gt;;
  };
  /** 地支六合分析 */
  diZhiHe: {
    pairs: Array&lt;{
      zhi1: string;
      zhi2: string;
      heType: string;
      status: &quot;化&quot; | &quot;绊&quot;;
    }&gt;;
  };
  /** 干支通根 */
  tongGen: {
    hasRoot: boolean;
    rootBranches: Record&lt;string, string[]&gt;;  // 每个天干通根的地支
    rootQuality: &quot;强根&quot; | &quot;中根&quot; | &quot;弱根&quot; | &quot;无根&quot;;
  };
  /** 日主分析 */
  riZhu: {
    stem: string;
    strength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
    analysis: string;
  };
  /** 总体评估 */
  assessment: string;
}
</code></pre>
`;
