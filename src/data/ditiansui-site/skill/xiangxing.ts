// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字四柱并完成三元分析后，先判定命局的&quot;形象&quot;类别——是两气成象（两种五行均衡）、独象（一种五行独旺）、全象（三种以上五行并存），还是形全形缺（五行当令状态），然后根据形象类别输出对应的用神选取和行运建议。此技能在方局判断和八格判断之前调用，优先判定特殊形象格局。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支</li>
<li><strong>五行统计</strong>：天干五行和地支五行的分布计数</li>
<li><strong>月令</strong>：月柱地支（用于判定形全形缺）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>两气成象判定</strong>
a. 统计八字中出现的五行种类数
b. 如果只有2种五行（或某两种五行占绝对主导）：</p>
<ul>
<li>列出是哪两气（如木火、土金等）</li>
<li>判断是相生关系还是相克关系</li>
<li>检查是否有破局五行混入</li>
<li><strong>相克两气需判定是否&quot;均敌&quot;</strong>（力量均衡）
c. <strong>依据</strong>：形象篇【任氏曰】&quot;两气双清，非独木火二形也...相克务须均敌，切忌偏重偏轻&quot;</li>
</ul>
</li>
<li><p><strong>独象判定</strong>
a. 检查是否为专旺格（一种五行占绝对主导）：</p>
<ul>
<li>木 → 曲直格（方局全，不杂金）</li>
<li>火 → 炎上格（方局全，不杂水）</li>
<li>土 → 稼穑格（四库全，不杂木）</li>
<li>金 → 从革格（方局全，不杂火）</li>
<li>水 → 润下格（方局全，不杂土）
b. 检查化神（食伤）是否昌盛
c. <strong>依据</strong>：形象篇【任氏曰】&quot;权在一人，曲直炎上之类是也。化者，食伤也，局中化神昌旺&quot;</li>
</ul>
</li>
<li><p><strong>全象判定</strong>
a. 检查命局是否有3种及以上五行并存
b. 检查日主是否旺相（全象的基本条件）
c. 检查财星是否有力
d. <strong>依据</strong>：形象篇【原注】&quot;三者为一，有伤官而又有财也，主旺喜财旺&quot;</p>
</li>
<li><p><strong>形全形缺判定</strong>
a. 逐行检查是否当令（得月令生扶为形全，失月令为形缺）</p>
<ul>
<li>木生寅卯辰月为形全</li>
<li>火生巳午未月为形全</li>
<li>金生申酉戌月为形全</li>
<li>水生亥子丑月为形全</li>
<li>土生辰戌丑未月为形全
b. 基于形全形缺，决定处理方向：</li>
<li>形全 → 确定用&quot;泄&quot;还是&quot;伤&quot;（食伤泄秀或官杀克制）</li>
<li>形缺 → 确定用&quot;帮&quot;还是&quot;助&quot;（比劫帮扶或印绶生助）
c. 特殊判定：即使形全也可能不真正&quot;全&quot;，即使形缺也可能不真正&quot;缺&quot;
d. <strong>依据</strong>：形象篇【原注】&quot;如甲木生于寅、卯、辰月，丙火生于巳、午、未月，皆为形全&quot;</li>
</ul>
</li>
<li><p><strong>用神与行运建议</strong>
a. 两气成象 → 顺势引导（用神取秀气所在的五行）
b. 独象 → 以化神（食伤）为用神，忌官杀破局
c. 全象 → 以财星为用神，忌比劫夺财
d. 形全 → &quot;泄伤分用&quot;——判断用食伤泄还是用官杀克
e. 形缺 → &quot;帮助分用&quot;——判断用比劫帮还是用印绶助</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface XiangXingReport {
  /** 形象类别判定 */
  category: {
    type: &quot;两气成象&quot; | &quot;独象&quot; | &quot;全象&quot; | &quot;形全形缺&quot; | &quot;普通格局&quot;;
    name: string;                 // 如&quot;木火两气成象&quot;、&quot;曲直格&quot;
    description: string;
  };
  /** 两气成象详情 */
  liangQi?: {
    elements: [string, string];   // 两种五行
    relation: &quot;相生&quot; | &quot;相克&quot;;
    balance: &quot;均敌&quot; | &quot;偏重&quot;;
    hasPoju: boolean;             // 是否有破局五行
    pojuElements: string[];
    analysis: string;
  };
  /** 独象详情 */
  duXiang?: {
    dominantElement: string;
    zhuanWangType: &quot;曲直&quot; | &quot;炎上&quot; | &quot;稼穑&quot; | &quot;从革&quot; | &quot;润下&quot;;
    huaShen: string;              // 化神（食伤）的五行
    huaShenStrength: &quot;昌&quot; | &quot;中&quot; | &quot;弱&quot;;
    hasHuaShen: boolean;
    analysis: string;
  };
  /** 全象详情 */
  quanXiang?: {
    elements: string[];           // 所有五行
    caiXing: string;              // 财星五行
    caiStrength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
    analysis: string;
  };
  /** 形全形缺详情 */
  xingQuan?: Record&lt;string, {
    isQuan: boolean;               // 是否形全
    action: &quot;泄&quot; | &quot;伤&quot; | &quot;帮&quot; | &quot;助&quot; | &quot;无&quot;;
    actionElement: string;         // 使用的五行
    reason: string;
  }&gt;;
  /** 综合建议 */
  advice: {
    yongShenElement: string;
    preferredLuck: string[];
    avoidLuck: string[];
    warning: string;
  };
}
</code></pre>
`;
