// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字四柱后，分别对&quot;贵&quot;（官印）和&quot;富&quot;（财星）两个维度进行独立评估，输出命主的社会地位等级。此技能适用于八字分析中&quot;落脚点&quot;的评估——在格局判断之后，用以衡量命主在社会中的实际层次。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;壬申 丙午 庚午 丙子&quot;）</li>
<li><strong>日主五行</strong>：日干对应的五行（推导得出）</li>
<li><strong>格局判定</strong>：八格类型（可选，辅助地位判断）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>官印评估（贵气判断）</strong>
a. 从四柱中提取所有官星（正官、七杀）和印星（正印、偏印）
b. 评估官印的有力程度：</p>
<ul>
<li>是否在地支有根（禄位、长生、帝旺）</li>
<li>是否当令（在月令旺相）</li>
<li>是否被刑冲克破
c. 评估官印的喜忌关系：</li>
<li>官印是日主的喜神还是忌神</li>
<li>官印之间是相生（官印相生）还是相战
d. 判定贵气等级（高/中/低）
e. <strong>依据</strong>：地位篇【原注】&quot;官居几品，财富几何，皆从命局断之&quot;</li>
</ul>
</li>
<li><p><strong>财星评估（财富判断）</strong>
a. 从四柱中提取所有财星（正财、偏财）
b. 评估财星的有力程度：</p>
<ul>
<li>是否在地支有根</li>
<li>是否当令</li>
<li>是否被比劫争夺（比劫夺财）
c. 评估财星的喜忌关系：</li>
<li>财星是日主的喜神还是忌神</li>
<li>是否有食伤生财（财有源头）
d. 判定财富等级（高/中/低）
e. <strong>依据</strong>：地位篇【任氏曰】&quot;官印为贵，财星为富，此地位之要诀也&quot;</li>
</ul>
</li>
<li><p><strong>地位综合评定</strong>
a. 贵气等级 + 财富等级 → 地位综合等级
b. 分类：</p>
<ul>
<li>贵富双全（官印有力 + 财星有力，且皆为喜神）</li>
<li>贵而不富（官印有力，财星无力或为忌）</li>
<li>富而不贵（财星有力，官印无力或为忌）</li>
<li>中平（两者皆中等）</li>
<li>贫贱（两者皆无力或皆为忌）
c. <strong>依据</strong>：地位篇【任氏曰】&quot;地位之论，乃富贵贫贱之辨也&quot;</li>
</ul>
</li>
<li><p><strong>地位稳定性评估</strong>
a. 判断地位是否受大运流年影响：</p>
<ul>
<li>官印是否被运程冲克</li>
<li>财星是否在运程中被劫夺
b. <strong>依据</strong>：地位篇【原注】&quot;地位者，贵贱之等也&quot;</li>
</ul>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface DiWeiReport {
  /** 贵气判断 */
  nobility: {
    guanXing: {
      presence: string[];   // 命局中出现的官星
      strength: &quot;有力&quot; | &quot;一般&quot; | &quot;无力&quot;;
      isXiShen: boolean;
    };
    yinXing: {
      presence: string[];   // 命局中出现的印星
      strength: &quot;有力&quot; | &quot;一般&quot; | &quot;无力&quot;;
      isXiShen: boolean;
    };
    level: &quot;高&quot; | &quot;中&quot; | &quot;低&quot;;
    description: string;    // 贵气特征描述
  };

  /** 财富判断 */
  wealth: {
    caiXing: {
      presence: string[];   // 命局中出现的财星
      strength: &quot;有力&quot; | &quot;一般&quot; | &quot;无力&quot;;
      isXiShen: boolean;
      hasSource: boolean;   // 是否有食伤生财
    };
    level: &quot;高&quot; | &quot;中&quot; | &quot;低&quot;;
    description: string;    // 财富特征描述
  };

  /** 地位综合 */
  overall: {
    type: &quot;贵富双全&quot; | &quot;贵而不富&quot; | &quot;富而不贵&quot; | &quot;中平&quot; | &quot;贫贱&quot;;
    assessment: string;
    stability: &quot;稳定&quot; | &quot;波动&quot; | &quot;大起大落&quot;;
    keyInsight: string;     // 基于地位篇义理的关键发现
  };
}
</code></pre>
`;
