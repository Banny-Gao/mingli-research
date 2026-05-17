// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>对已建立用神喜忌体系的八字命局进行闲神分析。首先区分用神、喜神、忌神，然后识别出剩余的中立五行（闲神）。分析闲神是否参与了&quot;贪合不化&quot;（牵绊日主或用神），以及是否在岁运中具有&quot;逢冲得用&quot;（解除牵绊、激发活力）的潜力。此技能需在已经确定用神喜忌的基础上才能调用。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串）</li>
<li><strong>用神喜忌判定</strong>：已确定的用神、喜神、忌神（对象，含五行和位置）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）</li>
<li><strong>大运流年</strong>：可选，用于分析闲神在岁运中的作用</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>建立三神分类体系</strong>
a. 输入已知的用神、喜神、忌神（由其他技能或手工判定提供）
b. 确定仇神（生忌神之五行）：</p>
<ul>
<li>如用木有余：水为仇神（水生金——生忌神）
c. 识别闲神：命局中除去用神、喜神、忌神、仇神之外的所有五行
d. 为每个闲神标记其五行属性和所在位置（天干/地支）
e. <strong>依据</strong>：【任氏曰】&quot;自用神、喜神、忌神之外，皆闲神也&quot;</li>
</ul>
</li>
<li><p><strong>闲神类型判定</strong>
a. 根据闲神与日主的关系分类：</p>
<ul>
<li><strong>日主所克之闲神</strong>（如日主甲木，闲神戊土）→ 最中立的闲神</li>
<li><strong>生日主之闲神</strong>（如日主甲木，闲神癸水）→ 轻微帮助但不主导</li>
<li><strong>克日主之闲神</strong>（如日主甲木，闲神庚金）→ 轻微克制但不主导</li>
<li><strong>与日主同类之闲神</strong>（如日主甲木，闲神乙木）→ 轻微帮身但不主导
b. 分类的目的是判断闲神的&quot;倾向性&quot;——偏向日主还是偏向忌神
c. <strong>依据</strong>：【原注】&quot;不足以为喜，不足以为忌，皆闲神也&quot;</li>
</ul>
</li>
<li><p><strong>贪合不化分析</strong>
a. 扫描天干五合和地支六合：</p>
<ul>
<li>日主是否参与了合（日主有合）→ 可能&quot;不顾用神&quot;</li>
<li>用神是否参与了合（用神有合）→ 可能&quot;不顾日主&quot;
b. 对每个合判断是否成化：</li>
<li>合而成化 → 评估化神吉凶（化神为喜则吉，为忌则凶）</li>
<li>合而不化 → 标记为&quot;贪合不化，绊住留连&quot;
c. <strong>依据</strong>：【任氏曰】&quot;合而不化，谓绊住留连，贪彼忌此，而无大志有为也&quot;</li>
</ul>
</li>
<li><p><strong>逢冲得用分析</strong>
a. 扫描地支六冲：
b. 检查是否有用神冲掉日主的合神 → 日主解放
c. 检查是否有日主冲掉用神的合神 → 用神解放
d. 检查是否有日主主动冲克合神 → &quot;日主能冲克他神而去之&quot;
e. <strong>依据</strong>：【任氏曰】&quot;冲则动也，动则驰也&quot;
f. <strong>依据</strong>：【任氏曰】&quot;此无情而反有情&quot;</p>
</li>
<li><p><strong>闲神在岁运中的作用评估</strong>
a. 分析未来大运流年：</p>
<ul>
<li>岁运中是否有忌神发威（破格损用之象）→ 检查是否有闲神可以制化</li>
<li>岁运中是否有闲神与岁支相合化为喜用 → 闲神转为助力</li>
<li>岁运中是否有力量壮大闲神（使闲神变为忌神）→ 闲神转为隐患
b. <strong>判定</strong>：闲神在岁运中&quot;为我一家人&quot;（助力）或&quot;为贼鬼&quot;（需提防）
c. <strong>依据</strong>：【任氏曰】&quot;得闲神制化岁运之凶神忌物，匡扶格局喜用&quot;</li>
</ul>
</li>
<li><p><strong>闲神处置建议</strong>
a. 闲神不碍格局 → &quot;可不必动它&quot;，保持现状
b. 闲神可制忌 → 标记其在关键岁运中的潜在价值
c. 闲神参与贪合 → 建议在行运中寻找冲合的解救机会
d. <strong>依据</strong>：【原句】&quot;不用何妨莫动它&quot;</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface XianShenReport {
  /** 命局基础 */
  basic: {
    bazi: string;
    riZhu: string;
    gender: &quot;乾造&quot; | &quot;坤造&quot;;
  };
  /** 三神体系 */
  sanShen: {
    yongShen: string[];     // 用神
    xiShen: string[];       // 喜神
    jiShen: string[];       // 忌神
    chouShen: string[];     // 仇神
    xianShen: Array&lt;{       // 闲神列表
      element: string;      // 五行
      position: string;     // 位置（如&quot;月干戊土&quot;）
      type: &quot;日主所克&quot; | &quot;生日主&quot; | &quot;克日主&quot; | &quot;同日主&quot; | &quot;其他&quot;;
      strength: &quot;强&quot; | &quot;中&quot; | &quot;弱&quot;;
    }&gt;;
  };
  /** 合绊分析 */
  heAnalysis: {
    hasHe: boolean;
    heList: Array&lt;{
      type: &quot;天干&quot; | &quot;地支&quot;;
      involved: &quot;日主&quot; | &quot;用神&quot; | &quot;喜神&quot; | &quot;闲神&quot;;
      effect: &quot;贪合不化&quot; | &quot;合而成化&quot;;
      huaShen?: string;     // 化神（如果成化）
      assessment: string;   // 评估
    }&gt;;
  };
  /** 冲解分析 */
  chongAnalysis: {
    hasChong: boolean;
    chongList: Array&lt;{
      chongType: string;    // 如&quot;寅申冲&quot;
      effect: &quot;逢冲得用&quot; | &quot;破格&quot; | &quot;中性&quot;;
      freedParty: &quot;日主&quot; | &quot;用神&quot; | &quot;喜神&quot; | null;
      description: string;
    }&gt;;
  };
  /** 岁运作用 */
  luckEffect: {
    criticalLuck: string[];         // 关键大运
    xianShenAction: string;         // 闲神该运中的作用
    riskLevel: &quot;高&quot; | &quot;中&quot; | &quot;低&quot;;  // 岁运破坏风险
  };
  /** 综合建议 */
  advice: {
    xianShenDisposal: &quot;不动&quot; | &quot;待用&quot; | &quot;需解除&quot;;
    keyInsight: string;       // 关键发现
    warning?: string;         // 警告信息
  };
}
</code></pre>
`;
