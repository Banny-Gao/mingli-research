// Auto-generated — do not edit manually
export default `<h2 id="功能">功能</h2><p>综合知命篇的顺逆之机判定和理气篇的进退状态分析，对命局中各十神进行&quot;去留舒配&quot;——决定哪些因素该保留、去除、舒展、搭配，最终确定用神并给出完整的配合方案。AI 执行者应在完成顺逆判定和进退分析后，需要最终确定用神和整体配合方案时调用本技能。</p>
<h2 id="输入">输入</h2><ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱的天干地支（字符串）</li>
<li><strong>日主</strong>：日柱天干及其五行属性</li>
<li><strong>顺逆判定结果</strong>：各十神相对于日主的顺逆标记（来自 zhiming 技能输出，可选）</li>
<li><strong>进退状态</strong>：各五行的旺相休囚状态（来自 liqi 技能输出，可选）</li>
<li><strong>目标</strong>：用户的具体需求（如判断用神、分析配合是否恰当、评估大运对配合的影响）</li>
</ul>
<h2 id="处理逻辑">处理逻辑</h2><ol>
<li><p><strong>审查日主衰旺</strong>：综合月令、地支藏干、四柱生扶克耗关系，确定日主的整体强度</p>
<ul>
<li>依据：【任氏曰】&quot;果能审日主之衰旺&quot;</li>
</ul>
</li>
<li><p><strong>确定用神喜忌</strong>：根据日主衰旺确定用神方向</p>
<ul>
<li>日主过旺 → 用神取克、泄、耗（官、食伤、财）</li>
<li>日主过弱 → 用神取生、扶、帮（印、比劫）</li>
<li>日主中和 → 用神取调候、通关</li>
<li>依据：【任氏曰】&quot;当抑则抑，当扶则扶&quot;</li>
</ul>
</li>
<li><p><strong>去留舒配</strong>（核心步骤）：</p>
<ul>
<li><strong>去</strong>：标记命局中对抗用神、破坏平衡的因素，建议通过大运排除或压制</li>
<li><strong>留</strong>：标记命局中支持用神、维护平衡的因素，建议保护和强化</li>
<li><strong>舒</strong>：标记不通畅的生克路径，建议通关引化</li>
<li><strong>配</strong>：综合配合各因素，确认配合方案是否自洽</li>
<li>依据：【任氏曰】&quot;去留舒配，取裁确当&quot;</li>
</ul>
</li>
<li><p><strong>十神范围检查</strong>：确认用神选择不局限于财官，验证是否有其他更优选择</p>
<ul>
<li>依据：【任氏曰】&quot;不拘财、官、印绶、比劫、伤官、六亲，皆可为用&quot;</li>
</ul>
</li>
<li><p><strong>输出报告</strong>：给出用神建议、配合方案及推理解释</p>
</li>
</ol>
<h2 id="输出">输出</h2><pre><code class="language-typescript">interface PeiHeReport {
  riZhu: {
    ganZhi: string;
    wuxing: string;
    qiangRuo: &quot;过旺&quot; | &quot;偏旺&quot; | &quot;中和&quot; | &quot;偏弱&quot; | &quot;过弱&quot;;
  };
  yongShen: {
    shiShen: string;         // 用神的十神名称
    ganZhi: string;          // 对应的干支
    reason: string;          // 选择理由，需引用【任氏曰】依据
  };
  quLiuShuPei: {
    qu: string[];            // 需要去除的因素列表
    liu: string[];           // 需要保留的因素列表
    shu: string[];           // 需要舒通的阻塞点
    pei: string[];           // 需要搭配的补充因素
  };
  xiShenJiShen: {
    xiShen: string[];        // 喜神（辅佐用神）
    jiShen: string[];        // 忌神（对抗用神）
  };
  conclusion: string;        // 综合配合评价
}
</code></pre>
<h2 id="使用示例">使用示例</h2><p><strong>输入</strong>：日主甲木（过旺），顺逆判定：财星为顺、官星为顺、印比为逆</p>
<p><strong>输出片段</strong>：</p>
<pre><code>yongShen: {
  shiShen: &quot;正官&quot;,
  ganZhi: &quot;辛酉&quot;,
  reason: &quot;日主甲木过旺，需要官星制约。正官辛酉有力，为当抑则抑之选&quot;
}
quLiuShuPei: {
  qu: [&quot;癸水印星（生旺日主）&quot;],
  liu: [&quot;辛金正官（制约日主）&quot;, &quot;戊土财星（耗日主之气）&quot;],
  shu: [],
  pei: []
}
</code></pre>
`;
