// Auto-generated — do not edit manually
export default `<h2>功能</h2>
<p>对输入的四柱八字进行化格分析。先扫描天干中是否存在五合（甲己、乙庚、丙辛、丁壬、戊癸），然后评估化神（合化后的新五行）是否得月令之气且有力，判定化之真假，并给出用神建议。此技能在天干出现五合时调用，用于判断合而化之还是合而不化。</p>
<h2>输入</h2>
<ul>
<li><strong>四柱八字</strong>：年柱、月柱、日柱、时柱对应的天干地支（字符串，格式如&quot;己巳 甲戌 己未 戊辰&quot;）</li>
<li><strong>性别</strong>：乾造（男）或坤造（女）</li>
<li><strong>大运</strong>：已排好的大运流年列表（可选，用于判定化神在岁运中的变化）</li>
</ul>
<h2>处理逻辑</h2>
<ol>
<li><p><strong>识别天干五合</strong>
a. 从四柱中提取所有天干（年干、月干、日干、时干）
b. 检查是否存在五合配对：</p>
<ul>
<li>甲 + 己（不论位置顺序）→ 标记为&quot;甲己合&quot;</li>
<li>乙 + 庚 → &quot;乙庚合&quot;</li>
<li>丙 + 辛 → &quot;丙辛合&quot;</li>
<li>丁 + 壬 → &quot;丁壬合&quot;</li>
<li>戊 + 癸 → &quot;戊癸合&quot;
c. <strong>判定</strong>：存在五合 → 进入步骤2
d. <strong>判定</strong>：不存在五合 → 输出&quot;非化格&quot;
e. <strong>依据</strong>：【原注】&quot;甲己合化土，乙庚合化金，丙辛合化水，丁壬合化木，戊癸合化火&quot;</li>
</ul>
</li>
<li><p><strong>识别化神</strong>
a. 根据五合配对确定化神五行：</p>
<ul>
<li>甲己合 → 化神为土</li>
<li>乙庚合 → 化神为金</li>
<li>丙辛合 → 化神为水</li>
<li>丁壬合 → 化神为木</li>
<li>戊癸合 → 化神为火
b. 记录化神五行属性</li>
</ul>
</li>
<li><p><strong>评估化神得令</strong>
a. 获取月支（月柱的地支）
b. 检查化神五行在月令的状态：</p>
<ul>
<li>化神在月令为旺相 → 得令</li>
<li>化神在月令为休囚死绝 → 失令
c. <strong>细化判定：</strong></li>
<li>得令且为月令本气 → &quot;化神得令有力&quot;</li>
<li>得令但为月令余气 → &quot;化神得令但力弱&quot;</li>
<li>失令 → &quot;化神失令无力&quot;
d. <strong>依据</strong>：【任氏曰】&quot;化神得令有力，则化真；化神失令无力，则化假&quot;</li>
</ul>
</li>
<li><p><strong>评估化神全局根基</strong>
a. 遍历四柱地支，检查是否存在化神五行的禄旺之位
b. 检查是否被对冲或被克：</p>
<ul>
<li>化神被冲 → 削弱化力</li>
<li>化神被克 → 破坏化局
c. <strong>判定</strong>：化神有根 + 无冲克 → &quot;化神根基稳固&quot;
d. <strong>判定</strong>：化神无根或有冲克 → &quot;化神根基虚浮&quot;</li>
</ul>
</li>
<li><p><strong>判定化之真假</strong>
a. <strong>真化条件</strong>：</p>
<ul>
<li>化神得令有力（月令旺相）</li>
<li>化神有根（地支中有禄旺）</li>
<li>无强力冲克
b. <strong>假化条件</strong>：</li>
<li>化神得令但根基虚浮</li>
<li>或化神有根但失令</li>
<li>或有冲克但化局尚存
c. <strong>不化条件</strong>：</li>
<li>化神失令且无根</li>
<li>或被严重冲克
d. <strong>依据</strong>：【任氏曰】&quot;真化者富贵，假化者凶夭&quot;</li>
</ul>
</li>
<li><p><strong>确定用神与喜忌</strong>
a. 真化 → 以化神为用神
b. 假化 → 以扶助化神之五行为用神，同时考虑原日主的需求
c. <strong>喜</strong>：助化神之运（生扶化神、与化神同气）
d. <strong>忌</strong>：破化之运（克制化神、给原日主加根导致不化）</p>
</li>
</ol>
<h2>输出</h2>
<pre><code class="language-typescript">interface HuaGeReport {
  /** 命局基础 */
  basic: {
    bazi: string;
    riZhu: string;
    gender: &quot;乾造&quot; | &quot;坤造&quot;;
  };
  /** 天干五合识别 */
    heIdentification: {
    hasHe: boolean;
    heType: &quot;甲己&quot; | &quot;乙庚&quot; | &quot;丙辛&quot; | &quot;丁壬&quot; | &quot;戊癸&quot; | null;
    huaShen: &quot;土&quot; | &quot;金&quot; | &quot;水&quot; | &quot;木&quot; | &quot;火&quot; | null;
  };
  /** 化神评估 */
    huaShenAssessment: {
    deLing: &quot;得令有力&quot; | &quot;得令力弱&quot; | &quot;失令无力&quot;;
    hasRoot: boolean;
    rootDetails: string;    // 化神在地支中的根基情况
    isChongKe: boolean;     // 是否被冲克
    strength: &quot;强&quot; | &quot;中&quot; | &quot;弱&quot;;
  };
  /** 化格判定 */
  huaGe: {
    isHuaGe: &quot;真化&quot; | &quot;假化&quot; | &quot;不化&quot;;
    basis: string;          // 判定依据
  };
  /** 用神喜忌 */
  yongShen: {
    yongShen: string;
    xi: string[];
    ji: string[];
    description: string;
  };
}
</code></pre>
`;
