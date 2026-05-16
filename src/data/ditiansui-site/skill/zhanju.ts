// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>输入一个八字命局，识别是否存在&quot;两神交战&quot;（官杀相战、财印相战等对抗性五行关系），然后评估制化条件——&quot;制&quot;（以强克弱）和&quot;化&quot;（引入第三方疏导）是否得宜。用于八字格局深度分析中，评估命局内部对抗性力量的平衡状态。</p>
<h2>输入</h2>
<ul>
<li><code>year_pillar</code>：年柱干支（如 &quot;壬申&quot;）</li>
<li><code>month_pillar</code>：月柱干支（如 &quot;戊申&quot;）</li>
<li><code>day_pillar</code>：日柱干支（如 &quot;甲申&quot;）</li>
<li><code>hour_pillar</code>：时柱干支（如 &quot;丙寅&quot;）</li>
<li><code>day_master</code>：日主五行（自动提取）</li>
<li><code>gender</code>：性别（可选）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>步骤一：识别对抗性关系</strong></p>
<ol>
<li>扫描全局五行力量分布，找出两种最强的五行</li>
<li>检查这两种五行是否相克（相克才构成&quot;战局&quot;）</li>
<li>识别战局类型：<ul>
<li>金木相战 → 标记为&quot;官杀相战&quot;（如果涉及克日主）</li>
<li>土水相战 → 标记为&quot;财印相战&quot;（财克印方向）</li>
<li>其他五行相克 → 标记为&quot;五行相战&quot;并注明具体关系</li>
</ul>
</li>
<li>依据：战局篇【原注】&quot;官杀相攻，财印相战&quot;</li>
</ol>
</li>
<li><p><strong>步骤二：评估双方力量对比</strong></p>
<ol>
<li>计算战局双方各自的总力量（天干+地支+藏干加权）</li>
<li>评估哪方得月令（得令者强）</li>
<li>评估哪方得地（通根多者强）</li>
<li>输出力量对比：均势 / A方占优 / B方占优</li>
<li>依据：战局篇【任氏曰】&quot;须观其胜负之势&quot;</li>
</ol>
</li>
<li><p><strong>步骤三：检查制化条件</strong></p>
<ol>
<li>检查&quot;制&quot;的条件：<ul>
<li>是否存在可克制冲突一方且本身力量足够的第三方五行</li>
<li>例如：官杀相战时，是否有食伤（火制金、土制水等）</li>
</ul>
</li>
<li>检查&quot;化&quot;的条件：<ul>
<li>是否存在可疏导双方冲突的第三方五行</li>
<li>例如：财印相战时，是否有比劫（比劫克财护印）或官杀（泄财生印）</li>
</ul>
</li>
<li>依据：战局篇【原注】&quot;制化得宜，则战局成和；制化失宜，则战局成凶&quot;</li>
</ol>
</li>
<li><p><strong>步骤四：定吉凶结论</strong></p>
<ol>
<li>制化条件充足 + 制化力量够强 → 战局成和（吉）</li>
<li>制化条件缺失或力量不足 → 战局成凶（凶）</li>
<li>制化条件部分存在 → 战局待时（需岁运辅助）</li>
</ol>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ZhanjuAnalysis {
  summary: {
    hasBattle: boolean;                   // 是否存在战局
    battleType: &quot;guansha&quot; | &quot;caiyin&quot; | &quot;other&quot; | null; // 战局类型
    verdict: &quot;he&quot; | &quot;xiong&quot; | &quot;pending&quot;;  // 结论：和/凶/待时
  };
  forces: {
    sideA: {
      element: string;                    // 五行A
      strength: number;                   // 力量值
      advantage: boolean;                 // 是否有优势
    };
    sideB: {
      element: string;                    // 五行B
      strength: number;
      advantage: boolean;
    };
    powerRatio: string;                   // 力量对比描述
  };
  control: {
    zhiCondition: {                       // 制条件
      exists: boolean;
      elements: string[];                 // 可克制的一方
      sufficient: boolean;                // 力量是否足够
    };
    huaCondition: {                       // 化条件
      exists: boolean;
      mediator: string;                   // 调停五行
      sufficient: boolean;
    };
  };
  advice: string;                         // 行运建议
}
</code></pre>
`;
