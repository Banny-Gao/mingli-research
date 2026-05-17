// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字四柱后，对日主（代表命主本人的天干）进行衰旺判定。从三个维度综合评估——月令当令与否（最重）、地支得地程度、天干地支的得势程度——给出日主的衰旺等级（从极旺到极衰六级）。此技能是八字分析中最基础、最核心的步骤，所有用神选取、格局判断都以衰旺判定为前提。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;甲子 丙寅 戊午 庚申&quot;）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）（可选，影响排大运方向）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>月令当令判定（权重最高）</strong>
a. 确认日主五行与月令主气五行的关系
b. 日主五行与月令同气 → 当令（旺）
c. 日主五行受月令生扶 → 偏旺
d. 日主五行克月令（耗气）→ 偏弱
e. 日主五行生月令（泄气）→ 偏弱
f. 日主五行被月令克 → 失令（衰）
g. <strong>依据</strong>：衰旺篇【原注】&quot;当令则旺，失令则衰&quot;</p>
</li>
<li><p><strong>得地判定（权重中等）</strong>
a. 检查地支中是否有日主的长生、禄、旺位
b. 日主在地支中的根气越扎实，得地程度越高
c. 长生＞禄＞旺＝余气，逐步降级
d. <strong>依据</strong>：衰旺篇【原句】&quot;日主健旺，则能任财官&quot;——&quot;健旺&quot;包含有根之意</p>
</li>
<li><p><strong>得势判定（权重较低）</strong>
a. 统计四柱天干地支中日主同类五行的数量
b. 统计对日主有生扶作用的五行（印星）的数量
c. 同类多+生扶多 → 得势
d. 同类少+生扶少且被克 → 不得势
e. <strong>依据</strong>：衰旺篇【原句】综合推演</p>
</li>
<li><p><strong>综合评定六级衰旺</strong>
a. 根据三维评分加权，给出最终等级：</p>
<ul>
<li>极旺：当令+大得地+大得势</li>
<li>偏旺：当令+有根+有势</li>
<li>中和：三维均衡，无过不及</li>
<li>偏弱：失令+少根+少势</li>
<li>极弱：失令+无根+无势</li>
<li>战局：旺衰势均力敌
b. <strong>依据</strong>：衰旺篇【任氏曰】&quot;日主衰旺不明，则用神无从而定&quot;</li>
</ul>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface ShuaiWangReport {
  /** 日主基础 */
  dayMaster: {
    stem: string;               // 日干
    element: string;            // 日干五行
  };
  /** 三维评分 */
  dimensions: {
    monthlyOrder: {
      score: &quot;当令&quot; | &quot;得生&quot; | &quot;耗气&quot; | &quot;泄气&quot; | &quot;失令&quot;;
      weight: number;           // 权重系数
    };
    root: {
      score: &quot;大得地&quot; | &quot;有根&quot; | &quot;少根&quot; | &quot;无根&quot;;
      detail: string;           // 具体是哪个地支提供了根气
    };
    ally: {
      score: &quot;大得势&quot; | &quot;有势&quot; | &quot;少势&quot; | &quot;无势&quot;;
      count: number;            // 同类五行数量
    };
  };
  /** 综合判定 */
  overall: {
    level: &quot;极旺&quot; | &quot;偏旺&quot; | &quot;中和&quot; | &quot;偏弱&quot; | &quot;极弱&quot; | &quot;战局&quot;;
    canBearWealth: boolean;     // 是否能任财（日主健旺？）
    canBearOffice: boolean;     // 是否能任官
    description: string;        // 衰旺评估的中文描述
    keyInsight: string;         // 基于衰旺篇的关键发现
  };
}
</code></pre>
`;
