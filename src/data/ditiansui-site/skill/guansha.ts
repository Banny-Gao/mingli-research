// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在八字格局分析中，当发现正官与七杀同时出现（或单独七杀制化复杂），调用此技能进行官杀格局的专项分析。此技能输出官杀关系的判定结果（可混/不可混、格局类型定位），不重复基础格局判断。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串）</li>
<li><strong>日主强弱评估</strong>：由上游分析提供的日主旺衰判断（身旺/身弱/中和）</li>
<li><strong>官杀标记</strong>：已标记出的正官和七杀所在位置（可选）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>判定官杀性质</strong>
a. 根据日主强弱判定官杀的实际性质：</p>
<ul>
<li>日主旺 → 七杀可视为官（身旺者以杀为官）</li>
<li>日主弱 → 正官也可能构成压力（身弱者以官为杀）
b. <strong>依据</strong>：官杀篇【任氏曰】&quot;杀即官也，身旺者以杀为官；官即杀也，身弱者以官为杀&quot;</li>
</ul>
</li>
<li><p><strong>判断官杀可混性</strong>
a. 日主旺相 → 官杀可混（有可）
b. 日主休囚 → 官杀不可混（有不可）
c. 检查是否&quot;势在于官&quot;或&quot;势在于杀&quot;：</p>
<ul>
<li>势在官且官有根 → 依附之杀岁运助官为真混</li>
<li>势在杀且杀有权 → 依附之官岁运助杀为真混
d. <strong>依据</strong>：官杀篇【原注】&quot;势在于官，官有根……势在于杀，杀有权……&quot;</li>
</ul>
</li>
<li><p><strong>定位官杀格局类型</strong>
a. 扫描原局配置，按顺序匹配六种格局：</p>
<ul>
<li>制杀太过（杀弱被众多食伤克制）→ 制杀太过格</li>
<li>官杀并见且日主能担 → 官杀混杂格</li>
<li>有合官留杀或合杀留官 → 合官留杀/合杀留官格</li>
<li>有食神制杀 → 食神制杀格</li>
<li>有印化杀 → 杀重用印格</li>
<li>有财生杀，杀势不重 → 财滋弱杀格
b. <strong>依据</strong>：官杀篇【任氏曰】&quot;今将杀分六等&quot;</li>
</ul>
</li>
<li><p><strong>确定用神与喜忌</strong>
a. 根据格局类型确定用神方向：</p>
<ul>
<li>财滋弱杀 → 用财杀</li>
<li>杀重用印 → 用印星</li>
<li>食神制杀 → 用食神</li>
<li>合官留杀 → 留杀为主</li>
<li>官杀混杂 → 视身强弱定</li>
<li>制杀太过 → 扶杀
b. <strong>依据</strong>：官杀篇各格任氏曰分析</li>
</ul>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface GuanShaReport {
  /** 官杀基本信息 */
  basic: {
    officialPosition: string[];  // 正官所在位置
    killPosition: string[];      // 七杀所在位置
    dayMasterStrength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
  };
  /** 官杀关系判定 */
  relation: {
    canMix: boolean;             // 是否可混
    reason: string;              // 原因描述
    powerDirection: &quot;官&quot; | &quot;杀&quot; | &quot;均衡&quot;; // 势的方向
  };
  /** 格局定位 */
  pattern: {
    type: &quot;财滋弱杀&quot; | &quot;杀重用印&quot; | &quot;食神制杀&quot; | &quot;合官留杀&quot; | &quot;官杀混杂&quot; | &quot;制杀太过&quot;;
    description: string;         // 格局描述
    yongShen: string;            // 用神
    likes: string[];             // 喜
    dislikes: string[];          // 忌
  };
  /** 处理建议 */
  suggestion: {
    action: &quot;去官留杀&quot; | &quot;去杀留官&quot; | &quot;用印通关&quot; | &quot;食神制杀&quot; | &quot;扶抑并用&quot; | &quot;顺其势&quot;;
    detail: string;              // 详细建议
  };
}
</code></pre>
`;
