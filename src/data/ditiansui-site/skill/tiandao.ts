// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字四柱后，先进行三元层级的分解分析，将命局拆解为天元（天干四字）、地元（地支四字）、人元（地支所藏天干）三个层次，分别评估各层次的五行力量与相互关系。此技能适用于八字分析的初始阶段——在任何用神选取、格局判断之前，先完成三元框架的建立。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;甲子 丙寅 戊午 庚申&quot;）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）（可选，影响排大运方向）</li>
<li><strong>大运</strong>：已排好的大运流年列表（可选，影响人元透出的岁运判定）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>天元拆解</strong>
a. 从四柱中提取四个天干
b. 统计天干五行分布（金木水火土各出现几次）
c. 标记天干之间的生克合化关系（相生、相克、相合、相冲）
d. <strong>依据</strong>：天道篇【任氏曰】&quot;干为天元&quot;</p>
</li>
<li><p><strong>地元拆解</strong>
a. 从四柱中提取四个地支
b. 统计地支五行分布
c. 标记地支之间的刑冲合害关系
d. <strong>依据</strong>：天道篇【任氏曰】&quot;支为地元&quot;</p>
</li>
<li><p><strong>人元拆解</strong>
a. 取出每个地支中所藏天干（本气、中气、余气）
b. 列出全部透藏天干及对应地支
c. 标记人元与天元之间的呼应关系（透出与否）
d. <strong>依据</strong>：天道篇【任氏曰】&quot;支中所藏为人元&quot;</p>
</li>
<li><p><strong>三元关系判定</strong>
a. 对比天元与地元的五行关系——是相生、相同还是相克
b. 对比天元与人元的五行关系——人元是否被天元透出
c. 评估三元之间是&quot;合一贯&quot;还是&quot;交战&quot;:</p>
<ul>
<li>三元相生或相同 → 标记为&quot;贯通&quot;（顺）</li>
<li>三元相克 → 标记为&quot;交战&quot;（悖）
d. <strong>依据</strong>：天道篇【原注】&quot;命于天地人三元之理，悉本于此&quot;；【任氏曰】&quot;人之禀命，万有不齐，总不越三元之理&quot;</li>
</ul>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface SanYuanReport {
  /** 命局基础信息 */
  basic: {
    year: string;    // 年柱干支
    month: string;   // 月柱干支
    day: string;     // 日柱干支
    hour: string;    // 时柱干支
    gender: &quot;乾造&quot; | &quot;坤造&quot;;
  };
  /** 三元拆解 */
  sanYuan: {
    tianYuan: {
      stems: string[];           // [年干, 月干, 日干, 时干]
      fiveElementCount: Record&lt;string, number&gt;; // 五行计数
      relationship: string;      // 天元内部的生克合化描述
    };
    diYuan: {
      branches: string[];        // [年支, 月支, 日支, 时支]
      fiveElementCount: Record&lt;string, number&gt;;
      relationship: string;      // 地支之间的刑冲合害描述
    };
    renYuan: {
      hiddenStems: Record&lt;string, string[]&gt;; // 各支所藏天干
      revealed: string[];        // 人元中透出于天元的部分
      hidden: string[];          // 人元中未透出的部分
    };
  };
  /** 三元关系评估 */
  assessment: {
    harmony: &quot;贯通&quot; | &quot;交战&quot; | &quot;半通半战&quot;;
    description: string;         // 对三元关系的中文描述
    keyInsight: string;          // 基于天道篇义理的关键发现
  };
}
</code></pre>
`;
