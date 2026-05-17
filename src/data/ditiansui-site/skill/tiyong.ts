// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字四柱并完成三元分析和干支配合分析后，确定命局的&quot;体&quot;（日主、形象或气局），然后根据任铁樵提出的十种用神法则选取对应的&quot;用&quot;（用神），并判断&quot;扶之抑之&quot;是否&quot;得其宜&quot;——即在极旺极弱时是否做了变通处理。此技能是格局判断和用神选取的核心技能。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支</li>
<li><strong>三元分析结果</strong>：来自天道篇三元分析器的输出（可选，用于辅助判断）</li>
<li><strong>日主旺衰</strong>：日主在月令中的旺相休囚死判断</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>定体（确定主体结构）</strong>
a. 判断命局是否有特殊形象气局（从形象篇、方局篇知识）：</p>
<ul>
<li>两气成象 → 以该象为体</li>
<li>成方成局 → 以方局气势为体</li>
<li>独象/全象 → 以格局气象为体
b. 如果没有特殊格局 → 以日主为体
c. <strong>依据</strong>：体用篇【任氏曰】&quot;体者形象气局之谓也，如无形象气局，即以日主为体&quot;</li>
</ul>
</li>
<li><p><strong>判旺衰（判断日主旺衰程度）</strong>
a. 日主在月令状态（旺相休囚死）
b. 日主通根情况（几个地支有根）
c. 帮扶力量（印星、比劫的数量和力度）
d. 克耗力量（官杀、财星、食伤的数量和力度）
e. 综合判定：旺 / 中和 / 弱 / 旺极 / 弱极</p>
</li>
<li><p><strong>择用（选择用神）</strong>
a. 普通旺衰情况，按任氏十法选取：</p>
<ul>
<li>日主旺、印多 → 财星为用</li>
<li>日主旺、官杀轻 → 财星为用</li>
<li>日主旺、比劫多 → 食伤为用</li>
<li>日主旺、官轻印重 → 财星为用</li>
<li>日主弱、官杀旺 → 印星为用</li>
<li>日主弱、食伤多 → 印星为用</li>
<li>日主弱、财星旺 → 比劫为用</li>
<li>日主官杀两停 → 食伤为用</li>
<li>日主财星均敌 → 印比为用
b. 旺极情况 → 从强（顺势扶助）
c. 弱极情况 → 从弱（顺势抑制）
d. <strong>依据</strong>：体用篇【任氏曰】&quot;日主为体者，日主旺，印绶多，必要财星为用...&quot;</li>
</ul>
</li>
<li><p><strong>验证&quot;得其宜&quot;</strong>
a. 检查用神与原局是否协调
b. 检查是否存在&quot;反激&quot;风险（用神触怒旺神）
c. 检查是否存在&quot;徒劳&quot;风险（用神力量不足以改变格局）
d. <strong>依据</strong>：体用篇【任氏曰】&quot;旺则抑之，如不可抑，反宜扶之；弱则扶之，如不可扶，反宜抑之&quot;</p>
</li>
<li><p><strong>特殊格局处理</strong>
a. 化气格 → 以化神为体，以泄化神或生化神为用
b. 专旺格（曲直、炎上等）→ 以格象为体，以生助气象或食伤为用，忌官杀
c. <strong>依据</strong>：体用篇【任氏曰】&quot;如日主不能为力，合别干而化，化之真者，即以化神为体&quot;</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface TiYongReport {
  /** 体的判定 */
  ti: {
    type: &quot;日主&quot; | &quot;形象&quot; | &quot;气局&quot; | &quot;化神&quot; | &quot;格象&quot;;
    description: string;
    details: string;
  };
  /** 旺衰判定 */
  wangShuai: {
    level: &quot;旺极&quot; | &quot;旺&quot; | &quot;中和&quot; | &quot;弱&quot; | &quot;弱极&quot;;
    moonState: string;           // 月令状态
    rootCount: number;           // 通根数
    supportCount: number;        // 帮扶数
    drainCount: number;          // 克耗数
  };
  /** 用神选取 */
  yongShen: {
    element: string;             // 用神五行
    type: &quot;财&quot; | &quot;官&quot; | &quot;印&quot; | &quot;比劫&quot; | &quot;食伤&quot;;
    method: string;              // 使用的任氏法则
    reason: string;
    isSpecial: boolean;          // 是否从格/专旺格
  };
  /** 变通验证 */
  adaptation: {
    needsAdaptation: boolean;
    adaptationReason: string | null;
    alternative: string | null;   // 变通后的取用法则
  };
  /** 行运建议 */
  luckAdvice: {
    preferred: string[];          // 推荐行运五行
    avoid: string[];              // 忌行五行
    warning: string;              // 风险提示
  };
}
</code></pre>
`;
