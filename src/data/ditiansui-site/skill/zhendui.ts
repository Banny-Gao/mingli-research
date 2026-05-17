// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>输入八字四柱后，分析命局中木（震）与金（兑）的力量对比与状态，根据木所处的季节（春初/仲春/夏令/秋令/冬令），从&quot;攻、成、润、从、暖&quot;五法中选取最匹配的调候策略，并给出行运建议。此技能适用于金木交战型命局的专项分析，可在全局格局分析之后调用。</p>
<h2 id="输入">输入</h2><ul>
<li><code>pillars</code>：四柱八字（格式如&quot;丙寅 庚寅 甲申 乙丑&quot;）</li>
<li><code>day_master</code>：日主五行</li>
<li><code>season_detail</code>：木所处的具体季节阶段（如&quot;春初&quot;、&quot;仲春&quot;、&quot;夏令&quot;、&quot;秋令&quot;、&quot;冬令&quot;），由月令地支判定</li>
<li><code>month_branch</code>：月令地支</li>
<li><code>gender</code>（可选）：性别</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>步骤一：判定金木状态</strong></p>
<ol>
<li>确定日主是否为木（甲木或乙木）——本篇以甲乙木为例</li>
<li>如日主不是木，则找出命局中所有木和金的天干地支，评估各自的力量</li>
<li>统计金的五行得分（天干庚辛金+地支申酉金+土生金的情况）</li>
<li>统计木的五行得分（天干甲乙木+地支寅卯+水生木的情况）</li>
<li>比较金与木的得分，标记为&quot;金强木弱&quot;、&quot;木强金弱&quot;或&quot;金木相敌&quot;</li>
<li><strong>依据</strong>：【任氏曰】&quot;须观其金木之竟向&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：判断木对应季节</strong></p>
<ol>
<li>根据月令地支判定木所处的季节：<ul>
<li>寅月（立春后）、卯月前期 → &quot;春初&quot;</li>
<li>卯月（春分前后）→ &quot;仲春&quot;</li>
<li>巳、午月 → &quot;夏令&quot;</li>
<li>申、酉月 → &quot;秋令&quot;</li>
<li>亥、子月 → &quot;冬令&quot;</li>
</ul>
</li>
<li>如果木不生在对应月份，按木的实际旺衰判断等效季节</li>
<li><strong>依据</strong>：【任氏曰】五法对应五季</li>
</ol>
</li>
<li><p><strong>步骤三：选取五法策略</strong></p>
<ol>
<li>春初 + 木嫩金坚 → <strong>攻法</strong>：检查是否有丙丁火（或巳午未戌）可用以克金护木</li>
<li>仲春 + 木旺金衰 → <strong>成法</strong>：检查是否有戊己土（或辰戌丑未）可用以生金成木</li>
<li>夏令 + 木泄金燥 → <strong>润法</strong>：检查是否有壬癸亥子水可用以润金木</li>
<li>秋令 + 木凋金锐 → <strong>从法</strong>：检查是否有戊己土（或辰戌丑未）可用以从金顺势</li>
<li>冬令 + 木衰金寒 → <strong>暖法</strong>：检查是否有丙丁巳午火可用以暖局解冻</li>
<li><strong>依据</strong>：【任氏曰】&quot;春初之木，木嫩金坚，火以攻之；仲春之木，木旺金衰，土以成之……&quot;</li>
</ol>
</li>
<li><p><strong>步骤四：策略可行性验证</strong></p>
<ol>
<li>攻法：火是否能真正克到金（如庚金是否有湿土保护使火克不动）</li>
<li>成法：土是燥土还是湿土——是否真的能生金</li>
<li>润法：水是否足够大，会不会被燥土吸干</li>
<li>从法：是否真的需要从金（木是否完全没有根气）</li>
<li>暖法：火是否能暖到木根（是否有寅卯木在湿寒中存活）</li>
<li><strong>依据</strong>：【任氏曰】&quot;当泄则泄，当制则制&quot;</li>
</ol>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface ZhenDuiReport {
  /** 金木基础状态 */
  woodMetalStatus: {
    woodScore: number;
    metalScore: number;
    verdict: &quot;金强木弱&quot; | &quot;木强金弱&quot; | &quot;金木相敌&quot;;
  };
  /** 季节判定 */
  seasonJudgment: {
    monthBranch: string;
    seasonLabel: &quot;春初&quot; | &quot;仲春&quot; | &quot;夏令&quot; | &quot;秋令&quot; | &quot;冬令&quot;;
    woodCondition: &quot;嫩&quot; | &quot;旺&quot; | &quot;泄&quot; | &quot;凋&quot; | &quot;衰&quot;;
    metalCondition: &quot;坚&quot; | &quot;衰&quot; | &quot;燥&quot; | &quot;锐&quot; | &quot;寒&quot;;
  };
  /** 策略选取 */
  strategy: {
    method: &quot;攻&quot; | &quot;成&quot; | &quot;润&quot; | &quot;从&quot; | &quot;暖&quot;;
    tool: string[];             // 具体手段（如[&quot;丙丁火&quot;]）
    toolPillars: string[];      // 手段出现的位置
    feasible: boolean;          // 是否可行
    reason: string;
  };
  /** 命造参照 */
  referenceCase: string;        // 匹配的任铁樵命造
  luckAdvice: {
    favorable: string[];
    unfavorable: string[];
  };
}
</code></pre>
`;
