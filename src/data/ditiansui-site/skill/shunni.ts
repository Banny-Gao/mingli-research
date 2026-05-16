// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在收到八字四柱后，根据月令的当令五行，判断日主在月令所处的旺相休囚死状态，从而确定日主是&quot;得令顺势&quot;还是&quot;失令逆势&quot;，并据此给出用神选取方向和运势趋势建议。此技能应在用神分析之前调用，用于建立命局的时令大环境判断。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;癸卯 乙卯 甲寅 乙亥&quot;）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）（可选，影响大运方向对顺逆的影响）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>月令当令五行判定</strong>
a. 根据月支确定当令五行：</p>
<ul>
<li>寅卯月 → 木令</li>
<li>巳午月 → 火令</li>
<li>申酉月 → 金令</li>
<li>亥子月 → 水令</li>
<li>辰戌丑未月 → 土令
b. <strong>依据</strong>：顺逆篇【原注】&quot;得时令者为顺，失时令者为逆&quot;</li>
</ul>
</li>
<li><p><strong>日主旺相休囚死状态判断</strong>
a. 将日主五行与月令进行比较：</p>
<ul>
<li>日主五行 == 月令五行 → &quot;旺&quot;（得令，最顺）</li>
<li>日主生月令 → &quot;休&quot;（失令，退气）</li>
<li>月令生日主 → &quot;相&quot;（得令，次顺）</li>
<li>月令克日主 → &quot;囚&quot;（失令，被困）</li>
<li>日主克月令 → &quot;死&quot;（失令，最逆）
b. <strong>依据</strong>：顺逆篇【任氏曰】&quot;日主得令，顺时令之势，此顺势也；日主失令，逆时令之势，此逆势也&quot;</li>
</ul>
</li>
<li><p><strong>顺逆状态判定</strong>
a. 日主旺或相 → &quot;顺势&quot;（得令）
b. 日主休、囚或死 → &quot;逆势&quot;（失令）</p>
</li>
<li><p><strong>用神方向建议</strong>
a. 顺势格局 → 用神宜顺月令之势（生助当令之气）
b. 逆势格局 → 用神宜逆月令之势（调补助弱者）
c. <strong>依据</strong>：顺逆篇【原注】&quot;顺势者吉，逆势者凶&quot;</p>
</li>
<li><p><strong>综合评估</strong>
a. 结合用神在月令中的顺逆状态给出最终评判
b. 用神得令 → 格局得力
c. 用神失令但有制化 → 险中求胜</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ShunNiReport {
  /** 月令基础信息 */
  month: {
    branch: string;
    season: string;            // 春/夏/秋/冬/四季末
    commandingElement: string; // 当令五行
  };
  
  /** 日主状态 */
  dailyMaster: {
    stem: string;
    element: string;
    monthState: &quot;旺&quot; | &quot;相&quot; | &quot;休&quot; | &quot;囚&quot; | &quot;死&quot;;
    shunni: &quot;顺势&quot; | &quot;逆势&quot;;
  };
  
  /** 共性与个性 */
  generalTrend: {
    nature: &quot;顺势者吉&quot; | &quot;逆势者凶&quot; | &quot;逆势有救&quot;;
    description: string;
  };
  
  /** 用神建议 */
  advice: {
    direction: &quot;顺月令之势&quot; | &quot;逆月令之势&quot; | &quot;综合权衡&quot;;
    preferredElements: string[];
    cautionElements: string[];
  };
  
  /** 运程倾向 */
  luckTrend: {
    favorableLuck: string[];   // 有利的运势五行
    unfavorableLuck: string[]; // 不利的运势五行
    turningPoints: string[];   // 转折点描述
  };
}
</code></pre>
`;
