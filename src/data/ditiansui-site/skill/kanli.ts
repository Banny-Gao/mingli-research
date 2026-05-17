// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>输入八字四柱后，分析命局中水（坎）与火（离）的力量对比与配置关系，先判定是&quot;既济&quot;（和谐）、&quot;未济&quot;（不交）还是&quot;交战&quot;（冲突），再根据&quot;天干水+地支火&quot;或&quot;天干火+地支水&quot;等具体场景，从&quot;升、降、和、解、制&quot;五法中选取最匹配的调候策略。此技能适用于水火交战或水火不交型命局的专项分析。</p>
<h2 id="输入">输入</h2><ul>
<li><code>pillars</code>：四柱八字（格式如&quot;丙子 己亥 丙寅 戊子&quot;）</li>
<li><code>day_master</code>：日主五行</li>
<li><code>month_branch</code>：月令地支</li>
<li><code>gender</code>（可选）：性别</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>步骤一：判定水火配置类型</strong></p>
<ol>
<li>统计天干中水的出现次数（壬、癸）和火的出现次数（丙、丁）</li>
<li>统计地支中水的出现次数（亥、子）和火的出现次数（巳、午）</li>
<li>按以下规则判定类型：<ul>
<li>天干水 ≥ 2 + 地支火 ≥ 2 → &quot;既济/交媾&quot;（水上火下）</li>
<li>天干火 ≥ 2 + 地支水 ≥ 2 → &quot;未济/交战&quot;（火上水下）</li>
<li>天干水/火各半 → &quot;混杂&quot;，需进一步判断</li>
</ul>
</li>
<li><strong>依据</strong>：【原注】&quot;天干皆水，地支皆火，为交媾……天干皆火，地支皆水，为交战&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：评估水火力量</strong></p>
<ol>
<li>水方力量 = 天干壬癸分 + 地支亥子分 + 申酉生水加权 + 辰丑蓄水加权</li>
<li>火方力量 = 天干丙丁分 + 地支巳午分 + 寅卯生火加权 + 未戌助火加权</li>
<li>比较双方得分，标记为&quot;坎旺离衰&quot;、&quot;离旺坎衰&quot;或&quot;水火相敌&quot;</li>
<li><strong>依据</strong>：【任氏曰】&quot;坎离之作用&quot;</li>
</ol>
</li>
<li><p><strong>步骤三：选取五法策略</strong></p>
<ol>
<li>天干离衰（火弱）+ 地支坎旺（水旺）→ <strong>升法</strong>：检查地支是否有木（寅卯）以引水气上升</li>
<li>天干坎衰（水弱）+ 地支离旺（火旺）→ <strong>降法</strong>：检查天干是否有金（庚辛）以引火气下降</li>
<li>天干皆火 + 地支皆水 → <strong>和法</strong>：需要木运（寅卯运）调和</li>
<li>天干皆水 + 地支皆火 → <strong>解法</strong>：需要金运（申酉运）化解</li>
<li>水火交战（同层对冲，如子午冲/壬丙冲）→ <strong>制法</strong>：从岁运中视强者而制之</li>
<li><strong>依据</strong>：【任氏曰】&quot;相持之理有五，升、降、和、解、制也&quot;</li>
</ol>
</li>
<li><p><strong>步骤四：策略可行性与行运建议</strong></p>
<ol>
<li>升法可行条件：地支确有寅卯木，且不被金克</li>
<li>降法可行条件：天干确有庚辛金，且不被火克尽</li>
<li>和法可行条件：大运能走到木运</li>
<li>解法可行条件：大运能走到金运</li>
<li>制法可行条件：岁运中能有制强扶弱的手段</li>
<li><strong>依据</strong>：命造验证（丙子己亥丙寅戊子→升法有效；壬午壬寅壬戌庚戌→降法因运不济而失效）</li>
</ol>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface KanLiReport {
  /** 水火配置 */
  waterFireConfig: {
    heaven: { water: number; fire: number };  // 天干水火个数
    earth: { water: number; fire: number };   // 地支水火个数
    type: &quot;既济&quot; | &quot;未济&quot; | &quot;交战&quot; | &quot;交媾&quot; | &quot;混杂&quot;;
  };
  /** 力量评估 */
  powerAssessment: {
    waterScore: number;
    fireScore: number;
    verdict: &quot;坎旺离衰&quot; | &quot;离旺坎衰&quot; | &quot;水火相敌&quot;;
  };
  /** 策略 */
  strategy: {
    method: &quot;升&quot; | &quot;降&quot; | &quot;和&quot; | &quot;解&quot; | &quot;制&quot; | &quot;无需调候&quot;;
    tool: string[];               // 调候手段
    sourcePillar: string;         // 手段所在柱
    feasible: boolean;
    reason: string;
    seasonalNote: string;         // 月令对调候的影响说明
  };
  /** 命造参照 */
  referenceCase: string;
  luckAdvice: {
    favorable: string[];
    unfavorable: string[];
  };
}
</code></pre>
`;
