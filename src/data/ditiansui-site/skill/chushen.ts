// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>在收到八字四柱后，以年柱为核心进行分析，判断命主的先天出身条件——包括祖业丰薄、家风特征、根基深浅。此技能适用于八字分析中对&quot;起点&quot;的评估，在格局分析之前或之后均可调用，帮助理解命主的人生起点和先天资源。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;庚申 戊子 甲午 丙寅&quot;）</li>
<li><strong>日主五行</strong>：日干对应的五行（推导得出）</li>
<li><strong>大运</strong>：已排好的大运流年列表（可选，用于判断年柱喜忌在运程中的体现）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>年柱信息提取</strong>
a. 提取年干、年支、年支藏干
b. 确定年干的十神属性（正官、七杀、正印、偏印、正财、偏财、比肩、劫财、食神、伤官）
c. 确定年支的五行旺衰（根据月令季节）
d. <strong>依据</strong>：出身篇【原注】&quot;年柱为根基，祖业家风，皆从年柱断之&quot;</p>
</li>
<li><p><strong>年柱喜忌判断</strong>
a. 评估年柱干支与日主的关系——是生扶日主（喜神）还是克制日主（忌神）
b. 评估年柱与月令的关系——年支是否当令、是否被月令刑冲
c. 标记年支是否空亡或被严重刑冲
d. <strong>依据</strong>：出身篇【原注】&quot;出身者，先天之命也&quot;</p>
</li>
<li><p><strong>祖业判断</strong>
a. 年支旺衰 + 喜忌 → 祖业厚薄（旺相为喜则厚，衰弱为忌则薄）
b. 年支若被刑冲 → 祖业有损或变动
c. <strong>依据</strong>：出身篇【原注】&quot;祖业家风，皆从年柱断之&quot;</p>
</li>
<li><p><strong>家风判断</strong>
a. 年干十神 → 家风类型：</p>
<ul>
<li>正官/正印 → 严谨端正</li>
<li>偏印/七杀 → 严格或有家学</li>
<li>食神/伤官 → 开放自由</li>
<li>正财/偏财 → 务实重利</li>
<li>比肩/劫财 → 团结或竞争
b. <strong>依据</strong>：出身篇【任氏曰】&quot;观其祖业父母，方知出身贵贱也&quot;</li>
</ul>
</li>
<li><p><strong>出身综合评估</strong>
a. 综合祖业 + 家风 + 年柱喜忌 → 出身等级（上/中/下）
b. 标记出身对命局的整体影响（助力/中性/阻力）
c. <strong>依据</strong>：出身篇【任氏曰】&quot;出身之论，乃六亲时命之辨也&quot;</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface ChuShenReport {
  /** 年柱基础信息 */
  yearPillar: {
    stem: string;          // 年干
    branch: string;        // 年支
    hiddenStems: string[]; // 年支藏干
    stemTenGod: string;    // 年干十神
    branchFiveElement: string; // 年支五行
    branchSeasonalStrength: &quot;旺&quot; | &quot;相&quot; | &quot;休&quot; | &quot;囚&quot; | &quot;死&quot;;
  };

  /** 年柱喜忌 */
  preference: {
    isXiShen: boolean;     // 是否为喜神
    isJuShen: boolean;     // 是否为忌神
    isEmptyWang: boolean;  // 是否空亡
    isPunished: boolean;   // 是否被刑冲
  };

  /** 祖业评估 */
  ancestral: {
    level: &quot;丰厚&quot; | &quot;中等&quot; | &quot;凋零&quot;;
    description: string;
  };

  /** 家风评估 */
  familyStyle: {
    type: string;          // 家风类型
    description: string;
  };

  /** 出身等级 */
  overall: {
    level: &quot;上&quot; | &quot;中上&quot; | &quot;中&quot; | &quot;中下&quot; | &quot;下&quot;;
    assessment: string;     // 综合评价
    keyInsight: string;     // 基于出身篇义理的关键发现
  };
}
</code></pre>
`;
