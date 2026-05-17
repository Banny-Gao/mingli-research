// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在八字格局分析中，当发现伤官与官星同时出现（或伤官单独构成格局），调用此技能进行伤官格局的专项分析。此技能判断&quot;伤官见官&quot;是否成立、伤官的格局类型（五格）、以及对应的用神与喜忌。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串）</li>
<li><strong>日主强弱评估</strong>：由上游分析提供的日主旺衰判断（身旺/身弱/中和）</li>
<li><strong>官星标记</strong>：已标记出的正官和七杀所在位置（可选）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>判断伤官见官是否可&quot;见&quot;</strong>
a. 检查原局是否有财星：</p>
<ul>
<li>有财 → 基本可见官（财能泄伤生官）</li>
<li>无财 → 基本不可见官
b. 检查日主强弱与伤官轻重组合：</li>
<li>身弱伤旺有印 → 可见官</li>
<li>身旺伤旺 → 见财而不见官</li>
<li>伤旺无财 → 遇官有祸
c. <strong>依据</strong>：伤官篇【原注】&quot;大率伤官有财，皆可见官；伤官无财，皆不可见官&quot;</li>
</ul>
</li>
<li><p><strong>定位伤官格局</strong>
a. 扫描配置，匹配五种格局：</p>
<ul>
<li>日主弱、伤官旺、有印 → 伤官用印</li>
<li>日主旺、伤官旺 → 伤官用财</li>
<li>日主弱、伤官旺、无印 → 伤官用劫</li>
<li>日主旺、无财官、有伤 → 伤官用伤</li>
<li>日主旺、比劫多、财衰伤轻 → 伤官用官
b. <strong>依据</strong>：伤官篇【任氏曰】&quot;有伤官用印，伤官用财，伤官用劫，伤官用伤，伤官用官&quot;</li>
</ul>
</li>
<li><p><strong>解析&quot;为祸百端&quot;适用性</strong>
a. 检查是否满足&quot;身弱用比劫帮身&quot;
b. 如是 → 伤官见官真为祸
c. 如有印 → 伤官见官反为福
d. <strong>依据</strong>：伤官篇【任氏曰】&quot;所谓伤官见官为祸百端者，皆日主衰弱……若局中有印，见官不但无祸，而且有福也&quot;</p>
</li>
<li><p><strong>确定用神与喜忌</strong>
a. 根据格局类型确定：</p>
<ul>
<li>用印格：喜印旺身旺，忌财旺伤旺</li>
<li>用财格：喜财旺伤旺，忌印旺劫旺</li>
<li>用劫格：喜印旺，忌财官</li>
<li>用伤格：喜财伤，忌官印</li>
<li>用官格：喜财官，忌伤印
b. <strong>依据</strong>：伤官篇【任氏曰】各格喜忌论述</li>
</ul>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface ShangGuanReport {
  /** 伤官基本信息 */
  basic: {
    shangGuanPosition: string[]; // 伤官所在位置
    guanPosition: string[];      // 官星所在位置
    hasMoney: boolean;           // 是否有财星
    hasSeal: boolean;            // 是否有印星
  };
  /** 伤官见官判断 */
  meetingJudgment: {
    canMeet: &quot;可见&quot; | &quot;不可见&quot; | &quot;有条件可见&quot;;
    condition: string;           // 条件描述
    reason: string;              // 原文依据
  };
  /** 格局定位 */
  pattern: {
    type: &quot;伤官用印&quot; | &quot;伤官用财&quot; | &quot;伤官用劫&quot; | &quot;伤官用伤&quot; | &quot;伤官用官&quot;;
    description: string;
    yongShen: string;
    likes: string[];
    dislikes: string[];
  };
  /** 祸福评估 */
  assessment: {
    wuBaiTheory: &quot;适用&quot; | &quot;不适用&quot;;
    explanation: string;         // 传统口诀的适用性解释
  };
}
</code></pre>
`;
