// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>通过分析八字命局中五行力量的偏枯（过旺或过弱）情况，推断命主容易出现的健康问题倾向和对应的身体脏腑部位。AI 执行者应在需要分析命局的健康倾向时调用本技能。注意：此技能提供的是命理层面的健康预警，不能替代医学诊断。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串格式）</li>
<li><strong>日主</strong>：日柱天干的五行属性（自动提取）</li>
<li><strong>五行力量分布</strong>：可选，未提供时本技能默认按四柱五行统计</li>
<li><strong>当前大运</strong>（可选）：用于判断大运是否引动了偏枯的五行</li>
<li><strong>关注部位</strong>（可选）：如&quot;肝胆&quot;&quot;脾胃&quot;等特定关注部位</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>统计五行力量</strong></p>
<ul>
<li>统计四柱天干和地支藏干的五行出现频次</li>
<li>按月令加权计算五行力量</li>
<li>得出五行力量排名，识别最强和最弱的五行</li>
<li>依据：【正文】&quot;五行偏枯，疾病随之&quot;</li>
</ul>
</li>
<li><p><strong>过旺五行分析</strong></p>
<ul>
<li>找出过旺的五行（显著高于均值）</li>
<li>判断该五行所克的五行对应的脏腑</li>
<li>木旺 → 克土 → 脾胃易出问题</li>
<li>火旺 → 克金 → 肺、皮肤易出问题</li>
<li>土旺 → 克水 → 肾、泌尿系统易出问题</li>
<li>金旺 → 克木 → 肝、胆、筋骨易出问题</li>
<li>水旺 → 克火 → 心脏、循环系统易出问题</li>
</ul>
</li>
<li><p><strong>过弱五行分析</strong></p>
<ul>
<li>找出过弱的五行（显著低于均值）</li>
<li>过弱五行本身对应的脏腑功能偏弱</li>
<li>木弱 → 肝胆功能不足</li>
<li>火弱 → 心脏功能偏弱</li>
<li>土弱 → 脾胃消化弱</li>
<li>金弱 → 肺气弱、免疫力低</li>
<li>水弱 → 肾功能偏弱</li>
<li>依据：【任氏曰】&quot;五行各有偏枯，疾病随之&quot;</li>
</ul>
</li>
<li><p><strong>大运引动检查</strong></p>
<ul>
<li>若有当前大运信息，检查大运是否引动了偏枯的五行</li>
<li>大运助旺过旺五行 → 加剧失衡，发病风险增加</li>
<li>大运补足过弱五行 → 缓解失衡，健康改善</li>
</ul>
</li>
<li><p><strong>输出报告</strong></p>
<ul>
<li>列出各五行偏枯类型（过旺/过弱）</li>
<li>列出对应的可能健康问题</li>
<li>标注严重程度（高/中/低）</li>
<li>给出大运引动的评估</li>
</ul>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface JiBingReport {
  wuXingBalance: {
    mu: &quot;过旺&quot; | &quot;偏旺&quot; | &quot;适中&quot; | &quot;偏弱&quot; | &quot;过弱&quot;;
    huo: &quot;过旺&quot; | &quot;偏旺&quot; | &quot;适中&quot; | &quot;偏弱&quot; | &quot;过弱&quot;;
    tu: &quot;过旺&quot; | &quot;偏旺&quot; | &quot;适中&quot; | &quot;偏弱&quot; | &quot;过弱&quot;;
    jin: &quot;过旺&quot; | &quot;偏旺&quot; | &quot;适中&quot; | &quot;偏弱&quot; | &quot;过弱&quot;;
    shui: &quot;过旺&quot; | &quot;偏旺&quot; | &quot;适中&quot; | &quot;偏弱&quot; | &quot;过弱&quot;;
  };
  risks: Array&lt;{
    organ: string;           // 脏腑名称（如&quot;脾胃&quot;）
    cause: string;           // 原因（如&quot;木旺克土&quot;）
    severity: &quot;高&quot; | &quot;中&quot; | &quot;低&quot;;
    description: string;     // 详细描述
  }&gt;;
  congenitalWeaknesses: Array&lt;{
    element: string;         // 过弱的五行
    organ: string;           // 对应脏腑
    description: string;
  }&gt;;
  luckTrigger: {
    hasTrigger: boolean;     // 大运是否引动偏枯
    description: string;     // 引动说明
  };
  warning: string;           // 免责声明：命理分析不能替代医学诊断
}
</code></pre>
`;
