// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在完成衰旺判定和月令分析后，对命局的五行之气进行更深层的&quot;源流&quot;分析。检查日主（或命局中心五行）的长生之位是否完整、根基是否稳固，判断命局的源深源浅，以及空亡对五行根基的影响。此技能揭示的不是&quot;日主强不强&quot;（衰旺层面），而是&quot;根基深不深&quot;（源流层面），适用于八字分析的进阶阶段。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;甲子 丙寅 戊午 庚申&quot;）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）（可选）</li>
<li><strong>前期分析结果</strong>（可选）：日主衰旺判定、月令分析等前期分析结果</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>长生之位定位</strong>
a. 确认日主五行对应长生之位：</p>
<ul>
<li>木日主 → 长生在亥</li>
<li>火日主 → 长生在寅</li>
<li>金日主 → 长生在巳</li>
<li>水/土日主 → 长生在申
b. <strong>依据</strong>：源流篇【任氏曰】&quot;生方即长生之方，如木生亥，火生寅，金生巳，水土生申是也&quot;</li>
</ul>
</li>
<li><p><strong>长生之位完整性判定</strong>
a. 检查四柱中是否出现了日主的长生地支
b. 如果出现，检查该地支是否被冲（如亥见巳冲、寅见申冲）
c. 如果被冲 → &quot;居影堂空&quot;，根基受损
d. 如果未出现被冲且地支完好 → 根基完整
e. <strong>依据</strong>：源流篇【任氏曰】&quot;居于影堂空者，如木之根在亥，而亥被冲破；火之根在寅，而寅被申冲是也&quot;</p>
</li>
<li><p><strong>源深源浅判定</strong>
a. 长生之位完整且无冲克 + 日主有根 + 生扶得力 → 源深
b. 长生之位缺失或被冲克 + 日主无根或少根 → 源浅
c. <strong>依据</strong>：源流篇【总结句】&quot;源深则流长，源浅则流短&quot;</p>
</li>
<li><p><strong>根气状态判定</strong>
a. 检查日主的根气（禄位、旺位、余气位）状态
b. 根被冲克或被合化 → 根枯气泄
c. 根完好且得生扶 → 根盛气足
d. <strong>依据</strong>：源流篇【原注】&quot;气泄根枯者，元神已败也&quot;；【总结句】&quot;根枯则气泄，根盛则气足&quot;</p>
</li>
<li><p><strong>空亡判定</strong>
a. 根据日柱天干所在旬，确定空亡地支
b. 检查日主对应的根基地支是否逢空亡
c. 如果逢空 → &quot;空则不实，亡则无根&quot;
d. <strong>依据</strong>：源流篇【任氏曰】&quot;十干不到之方，谓之空亡。空则不实，亡则无根。如甲以子为根，子空则甲无所托；乙以丑为根，丑空则乙无所凭&quot;</p>
</li>
<li><p><strong>综合评级</strong>
a. 综合长生、根气、空亡三项，给出源流评级（源深流长 / 源浅流短 / 根枯气泄 / 根盛气足）
b. <strong>依据</strong>：源流篇【总结句】&quot;当先明五行之源流，辨其衰旺生死，而后方可言用神也&quot;</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface YuanLiuReport {
  /** 日主基础 */
  dayMaster: {
    stem: string;
    element: string;
    changSheng: string;         // 长生之位的地支
  };
  /** 长生之位状态 */
  changShengStatus: {
    present: boolean;           // 长生之位是否在四柱中出现
    location: string;           // 出现在哪一柱（年/月/日/时）
    isChonged: boolean;         // 是否被冲
    is完整: boolean;            // 是否完整无损
    description: string;
  };
  /** 源深源浅判定 */
  depth: {
    level: &quot;源深&quot; | &quot;源浅&quot; | &quot;中平&quot;;
    assessment: &quot;流长&quot; | &quot;流短&quot; | &quot;中平&quot;;
    description: string;
  };
  /** 根气状态 */
  rootQi: {
    status: &quot;根盛气足&quot; | &quot;根枯气泄&quot; | &quot;中平&quot;;
    rootBranches: string[];     // 提供根气的地支列表
    damagedRoots: string[];     // 受损的根气
    description: string;
  };
  /** 空亡判定 */
  emptiness: {
    emptyBranches: string[];    // 空亡地支
    affectedStems: string[];    // 受空亡影响的天干
    isCritical: boolean;        // 是否涉及根基性空亡
    description: string;
  };
  /** 综合评级 */
  overall: {
    rating: &quot;源深流长&quot; | &quot;源浅流短&quot; | &quot;根枯气泄&quot; | &quot;根盛气足&quot; | &quot;中平&quot;;
    keyInsight: string;         // 基于源流篇的关键发现
    usabilityNote: string;      // 对用神选取的影响说明
  };
}
</code></pre>
`;
