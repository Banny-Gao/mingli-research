// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>输入八字四柱的四个地支，分析全部地支之间的相互作用关系，输出完整的藏干结构、合冲刑害关系列表及吉凶倾向判断。用于辅助格局取用和命局气象判断——先理清地支之间的所有关系，再判断五行气的来源、集中与冲突。</p>
<h2>输入</h2>
<ul>
<li><code>year_branch</code>：年柱地支（子丑寅卯辰巳午未申酉戌亥之一）</li>
<li><code>month_branch</code>：月柱地支（同上）</li>
<li><code>day_branch</code>：日柱地支（同上）</li>
<li><code>hour_branch</code>：时柱地支（同上）</li>
<li><code>season</code>（可选）：出生季节或月令，用于判断旺衰，辅助冲的吉凶判断</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>列出每个地支的藏干</strong></p>
<ol>
<li>依据地支藏干表（子癸、丑己癸辛、寅甲丙戊、卯乙、辰戊乙癸、巳丙戊庚、午丁己、未己丁乙、申庚壬戊、酉辛、戌戊辛丁、亥壬甲）</li>
<li>输出本气、中气、余气</li>
<li>依据：【任氏曰】&quot;子藏癸水，丑藏己癸辛……&quot;</li>
</ol>
</li>
<li><p><strong>检测三合局</strong></p>
<ol>
<li>检查是否存在 申+子+辰 → 合水</li>
<li>检查是否存在 亥+卯+未 → 合木</li>
<li>检查是否存在 寅+午+戌 → 合火</li>
<li>检查是否存在 巳+酉+丑 → 合金</li>
<li>部分（半合）：两个地支也标注&quot;半合&quot;</li>
<li>依据：【任氏曰】&quot;三合者，申子辰合水局……&quot;</li>
</ol>
</li>
<li><p><strong>检测三会局</strong></p>
<ol>
<li>检查是否存在 寅+卯+辰 → 会木</li>
<li>检查是否存在 巳+午+未 → 会火</li>
<li>检查是否存在 申+酉+戌 → 会金</li>
<li>检查是否存在 亥+子+丑 → 会水</li>
<li>依据：【任氏曰】&quot;寅卯辰会东方木……&quot;</li>
</ol>
</li>
<li><p><strong>检测六合</strong></p>
<ol>
<li>子丑合、寅亥合、卯戌合、辰酉合、巳申合、午未合</li>
<li>输出每对六合的合化五行</li>
<li>判断&quot;合而化之则吉&quot;或&quot;合而绊之则凶&quot;（需要结合用神喜忌判断）</li>
</ol>
</li>
<li><p><strong>检测六冲</strong></p>
<ol>
<li>子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲</li>
<li>判断冲的力度：紧贴（相邻地支）→ 力大 | 遥隔（隔位）→ 力小</li>
<li>判断吉凶：旺方被冲→吉（激发旺气）| 衰方被冲→凶（衰气败散）</li>
<li>依据：【任氏曰】&quot;冲旺者，冲则动，动则旺……冲衰者，冲则衰……&quot;</li>
</ol>
</li>
<li><p><strong>检测三刑</strong></p>
<ol>
<li>恃势之刑：寅巳申（连环相刑，力最盛）</li>
<li>无恩之刑：丑戌未（相刑而战）</li>
<li>无礼之刑：子卯（水木相战）</li>
<li>自刑：辰/午/酉/亥（本气受伤，自我矛盾）</li>
</ol>
</li>
<li><p><strong>检测六害</strong></p>
<ol>
<li>子未害、丑午害、寅巳害、卯辰害、申亥害、酉戌害</li>
<li>标注&quot;暗中相损，不利六亲&quot;</li>
</ol>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface DizhiAnalysis {
  branches: BranchInfo[];           // 四个地支的详细信息
  sanHe: SanHeResult[];            // 三合局
  sanHui: SanHuiResult[];          // 三会局
  liuHe: LiuHeResult[];            // 六合
  liuChong: LiuChongResult[];      // 六冲
  sanXing: SanXingResult[];        // 三刑
  liuHai: LiuHaiResult[];          // 六害
}

interface BranchInfo {
  branch: string;                  // 地支
  hiddenStems: {                   // 藏干
    benQi: string;                 // 本气
    zhongQi?: string;              // 中气
    yuQi?: string;                 // 余气
  };
}

interface SanHeResult {
  combination: string[];           // 如 [&quot;申&quot;,&quot;子&quot;,&quot;辰&quot;]
  element: string;                 // 化气五行
  completeness: &quot;full&quot; | &quot;half&quot;;
}

interface LiuChongResult {
  pair: [string, string];
  power: &quot;tight&quot; | &quot;mid&quot; | &quot;far&quot;;  // 紧贴/隔位/遥隔
  judgment: &quot;ji&quot; | &quot;xiong&quot;;        // 吉/凶
  reason: string;                   // 原因说明
}
</code></pre>
`;
