// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>输入八字四柱后，将命局中的十神按&quot;日主阵营&quot;和&quot;敌方阵营&quot;（或按四柱全局主流势力）分为两方，评估各方的力量强弱，判定是&quot;强众敌寡&quot;还是&quot;强寡敌众&quot;局面，给出正确的扶抑策略和行运方向。此技能用于辅助格局对抗性分析——在格局判断基础上进一步分析对抗双方的强弱关系。</p>
<h2 id="输入">输入</h2><ul>
<li><code>pillars</code>：四柱八字（格式如&quot;戊辰 乙丑 戊戌 辛酉&quot;）</li>
<li><code>day_master</code>：日主五行</li>
<li><code>shi_shen_map</code>：十神映射表</li>
<li><code>analysis_mode</code>（可选）：&quot;日主中心&quot;或&quot;全局中心&quot;，默认&quot;全局中心&quot;</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>步骤一：划分阵营</strong></p>
<ol>
<li>若以日主为中心：日主及其生扶者（印、比劫）为一方的&quot;众&quot;，克制日主者（官杀）及生扶官杀者（财）为另一方的&quot;寡&quot;</li>
<li>若以全局为中心：找出四柱中的主流五行势力（出现次数最多或当令最旺的五行）为&quot;众&quot;，与之对立或被克制的另一势力为&quot;寡&quot;</li>
<li><strong>依据</strong>：【任氏曰】&quot;须分日主四柱两端而论也&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：强弱判定</strong></p>
<ol>
<li>统计各阵营的天干出现次数（透干各+1分）</li>
<li>统计各阵营的地支本气得分（地支本气五行符合该阵营则+2分）</li>
<li>统计各阵营的月令加分（月令地支属于该阵营则+3分）</li>
<li>检查是否存在合局、会局带来的额外加权（如寅午戌合火局+3分）</li>
<li>总分高且无根气受损 → 标记为&quot;强&quot;；总分低或根气被克 → 标记为&quot;弱&quot;</li>
<li><strong>依据</strong>：【原注】&quot;强寡而敌众者，喜强而助强者吉；强众而敌寡者，恶敌而敌众者滞&quot;</li>
</ol>
</li>
<li><p><strong>步骤三：局面判定</strong></p>
<ol>
<li>强者人数多 + 弱者人数少 → &quot;强众敌寡&quot; → 策略：去寡（扶众抑寡）</li>
<li>强者人数少 + 弱者人数多 → &quot;强寡敌众&quot; → 策略：成众（扶寡抑众，成全强者的格局目标）</li>
<li>特别处理：检查&quot;强寡&quot;是否得到了财星或其他力量的扶助→&quot;此官星虽寡，得财星扶则强&quot;</li>
<li><strong>依据</strong>：【原句】&quot;强众而敌寡者，势在去其寡；强寡而敌众者，势在成乎众&quot;</li>
</ol>
</li>
<li><p><strong>步骤四：日主符合检查</strong></p>
<ol>
<li>在以全局为中心的分析中，检查日主五行是否与强势方一致（相生或相同）</li>
<li>日主与强方一致 → &quot;符合&quot;，吉（格局清）</li>
<li>日主与强方不一致 → &quot;背离&quot;，凶（格局浊）</li>
<li><strong>依据</strong>：【任氏曰】&quot;又要与日主符合，弗反背为妙&quot;</li>
</ol>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface ZhongGuaReport {
  /** 阵营划分 */
  factions: {
    strong: {
      name: string;             // 强方名称（如&quot;日主方&quot;或&quot;官星方&quot;）
      members: string[];        // 成员列表
      score: number;            // 力量评分
      label: &quot;强众&quot; | &quot;强寡&quot;;
    };
    weak: {
      name: string;
      members: string[];
      score: number;
    };
  };
  /** 局面类型 */
  situation: &quot;强众敌寡&quot; | &quot;强寡敌众&quot;;
  /** 正确策略 */
  strategy: {
    direction: &quot;扶众抑寡&quot; | &quot;扶寡抑众&quot; | &quot;成众&quot;;
    description: string;
    favorableLuck: string[];    // 利好运向
    unfavorableLuck: string[];  // 不利运向
  };
  /** 日主符合检查 */
  alignment: {
    status: &quot;符合&quot; | &quot;背离&quot;;
    reason: string;
  };
}
</code></pre>
`;
