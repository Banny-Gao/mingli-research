// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>当需要分析一个人的原生家庭运势（包括父母健康、父母缘分、父母对自己的影响）时使用此技能。核心方法是：印星为母、财星为父，通过印财与日主的配合判断父母吉凶。此技能应在完成基础八字排盘（日主旺衰、用神喜忌）之后调用。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;壬辰 戊申 乙未 丙子&quot;）</li>
<li><strong>大运流年</strong>：当前所处的十年大运和流年（可选，用于看岁运对父母运势的引动）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>确定父母星</strong>
a. 从八字中找出印星（正印/偏印）作为母星——生我者
b. 从八字中找出财星（正财/偏财）作为父星——我克者
c. 记录印星和财星的五行、位置（年/月/日/时）、透出/暗藏状态
d. <strong>依据</strong>：父母篇【原注】&quot;印星为母，财星为父&quot;</p>
</li>
<li><p><strong>确定父母宫（年柱）</strong>
a. 标记年柱干支及其十神属性
b. 判断年柱是否为喜用神
c. 检查年柱是否受冲刑
d. <strong>依据</strong>：父母篇【原注】&quot;父母吉凶，以宫度断之&quot;</p>
</li>
<li><p><strong>评估印财清浊</strong>
a. 清正条件：</p>
<ul>
<li>印星不被财星克破</li>
<li>财星不被比劫劫夺</li>
<li>印财两星各安其位、不相侵害
b. 浊乱条件：</li>
<li>财旺破印（财克印太过）</li>
<li>比劫劫财（兄弟夺父星之气）</li>
<li>印财混杂不清
c. <strong>依据</strong>：父母篇【任氏曰】&quot;印财清正，父母安康；印财浊乱，父母有灾&quot;</li>
</ul>
</li>
<li><p><strong>评估日主与印财的配合</strong>
a. 印星为日主喜用 → 母助日主，母缘深厚
b. 财星为日主喜用 → 父助日主，父缘深厚
c. 印财为忌仇 → 父母拖累或缘薄
d. <strong>依据</strong>：父母篇【任氏曰】&quot;须观印星财星与日主之配合&quot;</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface FuMuReport {
  /** 父母星 */
  parentStar: {
    mother: {              // 母亲（印星）
      starType: &quot;正印&quot; | &quot;偏印&quot; | &quot;无&quot; | &quot;混杂&quot;;
      position: string;
      strength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
      isXiYong: boolean;
      keyRelation: string; // 与日主的关键关系
    };
    father: {              // 父亲（财星）
      starType: &quot;正财&quot; | &quot;偏财&quot; | &quot;无&quot; | &quot;混杂&quot;;
      position: string;
      strength: &quot;旺&quot; | &quot;中&quot; | &quot;弱&quot;;
      isXiYong: boolean;
      keyRelation: string;
    };
    overall: &quot;清正&quot; | &quot;浊乱&quot; | &quot;半清半浊&quot;;
  };
  /** 父母宫（年柱） */
  parentPalace: {
    stemBranch: string;
    tenGod: string;        // 年柱十神
    isXiYong: boolean;
    isChong: boolean;
    assessment: &quot;吉&quot; | &quot;平&quot; | &quot;凶&quot;;
  };
  /** 父母总体结论 */
  conclusion: {
    motherGrade: &quot;安康&quot; | &quot;平顺&quot; | &quot;有灾&quot; | &quot;缘薄&quot;;
    fatherGrade: &quot;安康&quot; | &quot;平顺&quot; | &quot;有灾&quot; | &quot;缘薄&quot;;
    summary: string;       // 1-2句话总结父母运势
    keyFactor: string;     // 影响父母运势的关键因素
  };
}
</code></pre>
`;
