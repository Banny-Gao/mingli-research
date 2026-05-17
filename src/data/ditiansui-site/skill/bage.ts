// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>输入一个完整的八字四柱，输出该命局的格局判定结果。此技能执行任铁樵&quot;先观月令所得何支，次看天干透出何神，再究司令以定真假，然后取用，以分清浊&quot;的完整流程，并根据&quot;病药说&quot;给出行运建议。用于辅助八字深度分析。</p>
<h2 id="输入">输入</h2><ul>
<li><code>year_pillar</code>：年柱（天干+地支），如 &quot;庚辰&quot;</li>
<li><code>month_pillar</code>：月柱（天干+地支），如 &quot;癸未&quot;</li>
<li><code>day_pillar</code>：日柱（天干+地支），如 &quot;乙未&quot;</li>
<li><code>hour_pillar</code>：时柱（天干+地支），如 &quot;癸未&quot;</li>
<li><code>day_master</code>：日主（自动从日柱提取）</li>
<li><code>gender</code>（可选）：性别（男/女），用于排大运顺逆</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>步骤一：确定月令地支</strong></p>
<ol>
<li>提取月柱的地支（即月令提纲）</li>
<li>确定月支的五行和藏干</li>
<li>依据：【任氏曰】&quot;先观月令所得何支&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：检查透干</strong></p>
<ol>
<li>列出月支的所有藏干（依地支藏干表）</li>
<li>检查这些藏干是否有在天干出现（四柱天干中寻找）</li>
<li>如果有透出 → 按透出之神定格局名</li>
<li>如果无透出 → 标记为&quot;藏而不透，格局未显&quot;，按本气大致定方向</li>
<li>依据：【任氏曰】&quot;次看天干透出何神&quot;</li>
</ol>
</li>
<li><p><strong>步骤三：定格局名称</strong></p>
<ol>
<li>使用对照表匹配格局名称：</li>
</ol>
<table>
<thead>
<tr>
<th>透干</th>
<th>日主关系</th>
<th>格局名称</th>
</tr>
</thead>
<tbody><tr>
<td>正官</td>
<td>克日主（阴阳异）</td>
<td>正官格</td>
</tr>
<tr>
<td>七杀</td>
<td>克日主（阴阳同）</td>
<td>七杀格</td>
</tr>
<tr>
<td>正印</td>
<td>生日主（阴阳异）</td>
<td>正印格</td>
</tr>
<tr>
<td>偏印</td>
<td>生日主（阴阳同）</td>
<td>偏印格</td>
</tr>
<tr>
<td>正财</td>
<td>日主克（阴阳异）</td>
<td>正财格</td>
</tr>
<tr>
<td>偏财</td>
<td>日主克（阴阳同）</td>
<td>偏财格</td>
</tr>
<tr>
<td>食神</td>
<td>日主生（阴阳同）</td>
<td>食神格</td>
</tr>
<tr>
<td>伤官</td>
<td>日主生（阴阳异）</td>
<td>伤官格</td>
</tr>
</tbody></table>
</li>
<li><p><strong>步骤四：判断格局清浊</strong></p>
<ol>
<li>检查是否有混杂（如正官格中是否混入七杀）</li>
<li>检查是否有破坏因素（如六冲、三刑伤及用神）</li>
<li>输出：格局清（纯正）/ 格局浊（混杂）/ 格破（受损）</li>
</ol>
</li>
<li><p><strong>步骤五：病药分析</strong></p>
<ol>
<li>找出格局中的&quot;病&quot;——对格局不利的因素（破损之物）<ul>
<li>如印格中财星耗印为病</li>
<li>如官格中伤官克官为病</li>
</ul>
</li>
<li>找出格局中的&quot;药&quot;——能去除或化解病态的因素<ul>
<li>如官格中有伤官，看是否有印星制伤官</li>
</ul>
</li>
<li>依据：【任氏曰】&quot;格破用损，谓之有病……行运得所，去其破损之物，扶其喜用之神&quot;</li>
<li>如果病药皆无 → 输出&quot;格局受损较深，需大运补救&quot;</li>
</ol>
</li>
<li><p><strong>步骤六：用神喜忌判定</strong></p>
<ol>
<li>判定日主强弱（看是否得令、得地、得生、得助）</li>
<li>结合格局类型确定用神</li>
<li>结合病药分析确定喜忌</li>
<li>输出喜用神和忌神</li>
</ol>
</li>
<li><p><strong>步骤七：行运建议</strong></p>
<ol>
<li>根据喜忌和大运方向，判断行运的顺逆</li>
<li>指出哪些大运有利于格局（扶喜用之神）</li>
<li>指出哪些大运有害于格局（助破损之物）</li>
<li>依据：【任氏曰】&quot;倘行运得所，去其破损之物，扶其喜用之神，譬如人染沉疴，得良剂以生也&quot;</li>
</ol>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface BageAnalysis {
  summary: {
    dayMaster: string;                  // 日主
    monthBranch: string;                // 月令地支
    patternName: string;                // 格局名称（如&quot;正印格&quot;）
    patternType: &quot;zheng&quot; | &quot;bian&quot;;      // 正格/变格
  };
  determination: {
    monthBranch: string;                // 月令地支
    stemExposed: string | null;          // 透干
    stemRelation: string;               // 与日主关系（正官/七杀/正印等）
    purity: &quot;clean&quot; | &quot;mixed&quot; | &quot;broken&quot;; // 清/浊/破
  };
  bingYao: {
    bing: string[];                      // 病（损害格局的因素列表）
    yao: string[];                       // 药（有利格局的因素列表）
    actionable: boolean;                 // 是否可行运补救
  };
  yongShen: {
    yong: string[];                      // 用神
    xi: string[];                        // 喜神
    ji: string[];                        // 忌神
  };
  luckAdvice: {
    favorable: string[];                 // 好大运方向
    unfavorable: string[];               // 不好大运方向
    note: string;                        // 行运总评
  };
}
</code></pre>
`;
