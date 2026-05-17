// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>在收到八字命局后，通过分析阴阳的天地分布和合化的正邪方向，判断命主的内在品格倾向。此技能适用于人事评估类的命理咨询场景——如合作对象品行判断、用人选才参考、自我修养评估等。但输出仅为命理角度的格局分析，不应作为实际道德评判的唯一依据。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串）</li>
<li><strong>性别</strong>：可选，不影响品格分析</li>
<li><strong>大运</strong>: 可选，岁运变化可能改变合化方向，进而影响判定</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>阴阳分布分析</strong>
a. 标记四天干的阴阳属性（甲丙戊庚壬为阳，乙丁己辛癸为阴）
b. 标记四地支的阴阳属性（子寅辰午申戌为阳，丑卯巳未酉亥为阴）
c. 统计天干中阳/阴的数量比例
d. 统计地支中阳/阴的数量比例
e. 判定阴阳分布类型：</p>
<ul>
<li>地支阳多 + 天干阴多 → &quot;阳在内，阴在外&quot; → 倾向德胜才</li>
<li>天干阳多 + 地支阴多 → &quot;阳在外，阴在内&quot; → 倾向才胜德
f. <strong>依据</strong>：才德篇【原注】&quot;大率阳在内，阴在外……为德胜才；阳在外，阴在内……为才胜德&quot;</li>
</ul>
</li>
<li><p><strong>格局清浊判断</strong>
a. 检查是否&quot;主辅得宜&quot;（日主与用神配合良好）
b. 检查是否&quot;和平纯粹、格正局清&quot;（无冲战、无混浊）
c. 若格局清正 → 强化&quot;德胜才&quot;判断
d. 若格局混浊杂乱 → 强化&quot;才胜德&quot;判断
e. <strong>依据</strong>：才德篇【原注】&quot;清和平顺，主辅得宜，所合者皆正神&quot;→ 君子之风；&quot;混浊被害，主弱辅强&quot;→ 多能之象</p>
</li>
<li><p><strong>合化方向分析</strong>
a. 扫描命局中的天干五合、地支三合六合
b. 判断合化结果：合掉的五行是正气还是偏气？化出的是正神还是邪神？
c. 若合去偏气、化出正神 → 君子之风
d. 若合去正气、化出邪神 → 多能之象
e. <strong>依据</strong>：才德篇【任氏曰】&quot;合去者皆偏气，化出者皆正神&quot;→ 君子；&quot;合去者皆正气，化出者皆邪神&quot;→ 多能</p>
</li>
<li><p><strong>综合判定</strong>
a. 综合三项分析结果，输出品格倾向
b. 添加限定说明：才德分析为命理趋势，不应作为绝对化的道德定论
c. 若有&quot;气势和平&quot;的调和特征，柔性判断</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface CaiDeReport {
  /** 阴阳分布分析 */
  yinYang: {
    tianGan: { yang: number; yin: number; detail: string[] };
    diZhi: { yang: number; yin: number; detail: string[] };
    distribution: &quot;阳在内阴在外&quot; | &quot;阳在外阴在内&quot; | &quot;混合不定&quot;;
    tendency: &quot;倾向德胜才&quot; | &quot;倾向才胜德&quot; | &quot;无明显倾向&quot;;
  };
  /** 格局清浊 */
  geJu: {
    clarity: &quot;清正&quot; | &quot;混浊&quot; | &quot;中平&quot;;
    basis: string[];
  };
  /** 合化方向 */
  heHua: {
    positiveHe: string[];     // 合去偏气、化出正神的组合
    negativeHe: string[];     // 合去正气、化出邪神的组合
    direction: &quot;正向&quot; | &quot;负向&quot; | &quot;中性&quot;;
  };
  /** 综合判定 */
  conclusion: {
    type: &quot;德胜才&quot; | &quot;才胜德&quot; | &quot;德才兼备&quot; | &quot;难以判定&quot;;
    description: string;
    caution: string;          // 命理分析不能替代实际观察的警示
  };
}
</code></pre>
`;
