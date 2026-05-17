// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字四柱后，先以月令为纲进行初步格局分析：判定月令的当令五行、人元司令（区分日期的用事之神），以及天干（门）与地支司令（地）的配合关系。此技能适用于八字分析的初步阶段——在全面展开用神和格局分析之前，先完成月令维度的核心判断。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;甲子 丙寅 戊午 庚申&quot;）</li>
<li><strong>出生日期</strong>：年月日（可选，用于精确判断月令人元司令的用事日期区间）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）（可选，用于大运排盘）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>确定月令本气</strong>
a. 根据月柱地支确定月令本气五行（寅卯木、巳午火、申酉金、亥子水、辰戌丑未土）
b. <strong>依据</strong>：月令篇【原注】&quot;令星乃三命之至要，气象得令者吉&quot;</p>
</li>
<li><p><strong>判定人元司令</strong>
a. 根据出生在月中的具体日期，确定人元司令（用事之神）
b. 以寅月为例的三段划分：</p>
<ul>
<li>立春后1-7日 → 戊土用事</li>
<li>立春后8-14日 → 丙火用事</li>
<li>立春后15日以后 → 甲木用事
c. 其他月份依此类推（参照辰戌丑未月的本气/中气/余气规律）
d. <strong>依据</strong>：月令篇【原注】&quot;如寅月生人，立春后七日前，皆值戊土用事...&quot;</li>
</ul>
</li>
<li><p><strong>门地关系判断</strong>
a. &quot;门&quot; = 天干四字的五行分布
b. &quot;地&quot; = 地支司令（人元用事之神）的五行
c. 判断门与地的五行关系：</p>
<ul>
<li>门生/助地 or 地被门引助 → 门地两旺（吉）</li>
<li>门克/泄地 → 地衰门旺（吉凶参半）</li>
<li>地被助而门被克 → 门旺地衰（吉凶参半）</li>
<li>门地互克/互耗 → 门地同来衰（凶）
d. <strong>依据</strong>：月令篇【任氏曰】&quot;天地相应为妙...地支人元必得天干引助，天干为用，必要地支司令&quot;</li>
</ul>
</li>
<li><p><strong>格局初判</strong>
a. 根据月令本气（或人元用事）初判格局类型（正官、七杀、正印、偏印、正财、偏财、食神、伤官）
b. <strong>依据</strong>：月令篇【原注】&quot;知此则可以取格，可以取用矣&quot;</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface YueLingReport {
  /** 月令基础信息 */
  monthlyOrder: {
    earthlyBranch: string;       // 月柱地支
    mainQi: string;              // 本气五行
    season: string;              // 所处季节
  };
  /** 人元司令判定 */
  rulingSpirit: {
    rulingTenGod: string;        // 用事之神的天干
    rulingElement: string;       // 用事之神的五行
    period: string;              // 用事时段描述
    isMainQi: boolean;           // 是否为本气当令
  };
  /** 门地关系评估 */
  gateLand: {
    gateElements: Record&lt;string, number&gt;;   // 天干（门）五行分布
    landElement: string;                    // 地（司令）五行
    relationship: &quot;门地两旺&quot; | &quot;地衰门旺&quot; | &quot;门旺地衰&quot; | &quot;门地同来衰&quot;;
    description: string;                    // 对门地关系的中文评估
  };
  /** 格局初判 */
  pattern: {
    primary: string;             // 主格（如&quot;正官格&quot;）
    description: string;         // 格局说明
    keyInsight: string;          // 基于月令篇的关键发现
  };
}
</code></pre>
`;
