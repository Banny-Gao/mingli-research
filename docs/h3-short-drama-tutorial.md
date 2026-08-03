# 用 MiniMax H3 全 AI 制作短剧:从零到出片完整教程

> 适用版本:H3 (Hailuo 3.0 / 海螺3),开源日期 2026-08-03
> 工具栈:MiniMax M3(文本)+ H3(视频/图像)+ ffmpeg(机械剪辑)+ 剪映(创意精修)
> 一句话总结:LLM 写一切文字 → H3 出一切成片 → LLM+ffmpeg 缝合,剪映做最后润色

---

## 0. 整体流程总览

```
[主题输入]
    ↓
[Step 1] LLM 生成剧本(对话式迭代)
    ↓
[Step 2] LLM 拆解为镜头表
    ↓
[Step 3] LLM 写人设/场景提示词 → H3 文生图(角色&场景资产)
    ↓
[Step 4 ★] 【角色一致性专章】角色圣经 + 3 大一致性武器
    ↓
[Step 5] 对每个镜头,LLM 写视频提示词 → H3 出片(图生视频/文生视频/V2V)
    ↓
[Step 6] LLM 生成剪辑 EDL + ffmpeg 机械拼接 / 剪映创意精修
    ↓
[Step 7] 多平台发布 + 数据复盘
```

**一集 5 分钟短剧典型产出物:**
- 1 份剧本(LLM 生成,875-1100 字)
- 1 张镜头表(约 25-30 个镜头,LLM 生成)
- 1 套角色圣经(每个主角 6-8 张参考图 + 详细人设文档)
- 1 套场景参考图(每个主场景 2-3 张)
- 25-30 条成片镜头(H3 生成,平均 10-15 秒/条)
- 1 个 EDL 剪辑决策表(LLM 生成,JSON)
- 1 条最终短剧成片(ffmpeg 自动出 + 剪映微调)

**耗时参考(单集):** 有经验的创作者 1-2 天,新手 3-5 天。
**成本参考(单集):** 约 500-1000 元(主要为 H3 视频生成 + 重做)。

---

## 1. 准备阶段:工具与账号

### 1.1 必装清单

| 工具 | 用途 | 获取 |
|------|------|------|
| MiniMax M3(或 M2.7)API | 剧本/分镜/提示词/EDL 生成 | https://platform.minimaxi.com |
| MiniMax H3 API | 视频/图像生成 | 同上(同账号) |
| ffmpeg | 机械剪辑(拼接/字幕/转码) | https://ffmpeg.org |
| 剪映专业版 | 创意精修(可选) | https://www.capcut.cn/ |
| Python 3.10+ | 自动化脚本 | https://python.org |
| 飞书/Notion | 镜头表协作 | 任选 |

### 1.2 账号与计费(以 5 分钟一集估算)

| 项目 | 单价 | 5 分钟单集用量 | 成本 |
|------|------|--------------|------|
| 文本模型(M3) | ~0.001 元/1K tokens | 200K-400K tokens | 0.2-0.4 元 |
| H3 视频 2K | 0.8 元/秒 | 300s × 4 倍重做 = 1200s | 960 元 |
| H3 图像(资产) | ~0.05 元/张 | 30-50 张 | 1.5-2.5 元 |
| H3 音频 | 含在视频里 | - | 0 |
| **合计** | | | **≈ 960-1100 元** |

**省钱技巧:**
- 提示词迭代用便宜模式(草稿/低分辨率),最终成片用 2K
- 同一角色用同一组参考图(3 张),别每次都新生成
- 批量出片前先做 1-2 个样镜测试提示词,别上来就批量烧钱
- V2V 续接比独立重做省 50% 成本
- P2 凑合镜头用低分辨率,只 P0 关键镜头用 2K

### 1.3 推荐文件夹结构

```
short-drama/
├── 01_scripts/                    # 剧本
├── 02_storyboard/                 # 镜头表 CSV
├── 03_assets/
│   ├── characters/                # 角色参考图
│   │   ├── lin_nianan/            # 每个主角一个子文件夹
│   │   │   ├── anchor_front.png   # 主锚图
│   │   │   ├── anchor_45.png      # 45度
│   │   │   ├── anchor_full.png    # 全身
│   │   │   ├── expression_*.png   # 表情集
│   │   │   └── outfit_v*.png      # 服装版本
│   │   └── ...
│   ├── scenes/                    # 场景参考图
│   └── props/                     # 道具参考图
├── 04_shots/
│   ├── ep01/                      # 每集一个子文件夹
│   │   ├── shot_01_v0.mp4         # 每镜多版本
│   │   ├── shot_01_v1.mp4
│   │   └── ...
│   └── ...
├── 05_edit/
│   ├── edl_ep01.json              # LLM 生成的剪辑决策表
│   ├── subtitles_ep01.srt         # 字幕
│   ├── bgm/                       # BGM 素材
│   └── raw_ep01.mp4               # ffmpeg 输出
├── 06_final/                      # 剪映精修后的成片
└── 07_published/                  # 各平台分发版本
```

---

## 2. Step 1:LLM 自动生成剧本

### 2.1 元提示词(Meta Prompt)

把这个喂给 M3,生成 3-5 个选题,挑一个继续:

```
你是一位爆款短剧编剧,擅长 3-6 分钟的竖屏短剧(抖音/快手/红果短剧风格)。

请基于以下输入生成 3 个剧本选题:
- 题材偏好:[如:现言甜宠 / 古装虐恋 / 都市悬疑 / 重生复仇]
- 目标受众:[如:25-35 岁女性 / 18-25 岁男性]
- 情绪钩子:[如:先婚后爱 / 身份反转 / 极限二选一]
- 集数规划:[如:10 集,每集 5 分钟]
- 单集结尾必须留强钩子(悬念/反转/情感冲击)

每个选题包含:
1. 一句话核心冲突
2. 主角设定(2 句话)
3. 5 集内的主线走向
4. 预估爆款指数(1-10)和理由
```

### 2.2 单集剧本生成

选定选题后,生成单集剧本:

```
基于选题 #X(附上选题文本),生成第 1 集剧本。

要求:
- 时长:5 分钟 ≈ 875-1100 字台词 + 场景描写
- 结构:开篇钩子(30s 内)→ 冲突建立(2min)→ 升级对抗(2min)→ 结尾钩子(30s)
- 节奏:每 15 秒一个情绪/情节转折,5 分钟内 20+ 个转折点
- 情节:必须有 2-3 个核心冲突 + 1 个大反转/钩子
- 结尾:卡在最揪心/最反转的一刻,逼用户看下一集
- 台词:口语化、短句为主,符合移动端无声播放也能看懂
- 给出 5-8 个"金句"(可截屏传播的高情绪值台词)
- 标注:哪些台词需要慢镜头/特写,适合 H3 镜头表现
- 拆分:把剧本拆为 4-5 个【场景块】,每块 1 分钟

输出格式:
【场景 1 - 开篇钩子】地点/时间/人物 (0:00-0:30)
[动作描述]
角色A:台词
角色B:台词
【情绪标记】:xxx
【镜头建议】:特写/中景/远景
【场景 2 - 冲突建立】(0:30-2:00)
...
```

### 2.3 剧本迭代(对话式)

LLM 出的初稿一定不满意,这是正常的。迭代套路:

```
你:"开场 30 秒钩子太弱,要在第 5 秒就扔出一个'炸弹信息'——比如直接
    让女主看到男主和别人亲密的照片,然后倒叙"
LLM:重写场景 1

你:"第 3 场反派出现得太早,挪到第 4 场。让男女主先有一段'似是而非'
    的甜,观众以为是 HE,反转才更扎心"
LLM:调整结构

你:"男二号的台词太工具人,给他一个'反差萌'的瞬间——比如冷酷律师突然
    露出小时候的照片,展现柔软面"
LLM:丰富配角
```

**关键原则:每轮只改一个维度(节奏/台词/人设/钩子/结构),别让 LLM 一次全改。**

---

## 3. Step 2:LLM 自动拆解为镜头表

### 3.1 镜头拆分提示词

```
你是一位资深短剧分镜师,请把以下剧本拆解成 H3 视频生成用的镜头表。

【剧本】
{paste 剧本全文}

H3 限制:
- 单次生成最长 15 秒
- 单镜头可由 1-2 次 15s 生成拼接,但同镜头内人物脸必须一致
- 5 分钟一集约 25-30 个镜头
- 9:16 竖屏

输出为 CSV,字段如下:
镜号,场景编号,场景描述,人物(参考图编号),动作,台词,镜头语言(特写/中景/远景/俯拍/跟拍),光影氛围,音视频提示(雨声/脚步声/音乐情绪),预计时长(秒),是否需要动作迁移参考(yes/no + 哪个镜号),H3 生成模式(文生视频/图生视频/V2V动作迁移),提示词(英文优先,中文也行),优先级(P0必须重做到好/P1可接受/P2凑合用)
```

### 3.2 镜头表样例(节选)

| 镜号 | 场景 | 人物 | 动作 | 台词 | 镜头 | 光影 | 音视频 | 时长 | 模式 | 提示词(节选) | 优先级 |
|------|------|------|------|------|------|------|--------|------|------|--------------|--------|
| 01 | 高级公寓夜景 | 女主 ref#1 | 坐在落地窗前,红酒杯停在嘴边 | "他说今晚会回来" | 近景特写 | 暖色室内光,窗外城市霓虹 | 寂静,空调嗡鸣,远处车流 | 8s | 图生视频 | "Close-up of young woman in silk dress, melancholic smile, city lights bokeh, cinematic" | P0 |
| 02 | 玄关 | 女主 ref#1 | 听到门响,放下酒杯转头 | (无台词) | 中景 | 顶灯+走廊灯对比 | 脚步声由远及近,门锁声 | 5s | V2V←镜01 | ... | P0 |
| 03 | 玄关 | 男主 ref#2 | 推门,西装革履,表情疲惫 | "我回来了" | 中景跟拍 | 走廊光打在侧脸 | 脚步+门响+行李箱 | 6s | 图生视频 | ... | P0 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 27 | 玄关 | 女主 ref#1 | 把一封信扔到男主脸上 | "我不欠你" | 特写慢动作 | 顶光,逆光勾边 | 纸张飘落+BGM 急停 | 4s | 图生视频 | ... | P0 |
| 28 | 玄关 | 男主 ref#2 | 看到信,愣住,信纸落地 | (无台词) | 大特写手部 | 强顶光,表情凝固 | 心跳音+BGM 突弱 | 5s | V2V←镜27 | ... | P0 |
| 29 | 玄关远景 | 双人 | 女主转身走,男主蹲下捡信 | (无台词) | 全景慢推 | 暖转冷,光影切割 | BGM 弦乐强推 | 8s | V2V←镜28 | ... | P1 |
| 30 | 黑场 | - | 字幕"未完待续" + logo | (字幕) | 黑场 | - | BGM 渐弱 | 3s | 文生视频 | "Black screen with text '未完待续', cinematic" | P2 |

### 3.3 拆镜头的几个原则(5 分钟长集版)

- **开场 30 秒 = 4-5 个镜头,每个都要爆点**:5 分钟剧用户耐心比 2 分钟剧多,但开场依然要"秒钩"
- **每 15 秒一个情绪转折**:5 分钟 = 20 个转折点,密度比 2 分钟剧略低但依然密集
- **每个镜头独立成立**:即使观众只看一个镜头也要能"看明白",用户会拉进度条
- **对话镜头交替特写**:两个人对话别用双人中景,轮流给特写才有"戏"
- **结尾 30 秒必有大动作**:特写 + 慢动作 + 强音效,5 分钟蓄力后这里要"炸"
- **结尾留"未完待续"镜**(镜 28-30 模式):这是免费剧拉付费/拉下一集的关键

### 3.4 5 分钟 vs 2 分钟的镜头数对比

| 时长 | 镜头数 | 转折点 | 单镜平均时长 | H3 生成次数(含重做) |
|------|-------|--------|------------|------------------|
| 2 分钟 | 10-12 | 8-10 | 8-12s | 40-50 |
| **5 分钟** | **25-30** | **20+** | **8-12s** | **100-120** |
| 10 分钟 | 50-60 | 40+ | 8-12s | 200-250 |

**5 分钟的成本和工时主要是 2 分钟的 2.5-3 倍,而不是 2.5 倍——因为一致性挑战、节奏难度、注意力消耗都在指数级上升。**

---

## 4. Step 3:AI 自动生成角色 & 场景资产

### 4.1 角色参考图生成

**Step A:LLM 写角色提示词(详细人设)**

```
基于剧本,请为以下 3 个角色生成 H3 文生图用的英文提示词,每个角色生成
6-8 张参考图(正面/侧面/45度/全身 + 多表情 + 多光线),要求:
- 详细描述外貌、年龄、气质、常穿服装
- 标注"标志性细节":痣/疤痕/首饰,后续所有镜头必带
- 给出统一的"基础 prompt 模板",后续所有镜头复用
- 包含:portrait, 9:16 vertical, cinematic lighting, photorealistic,
  sharp focus, 8k quality 等质量词

角色:
1. 女主 林念安,28 岁,冷艳律师,黑长直,常穿黑色职业装
   标志:左耳单只珍珠耳钉,锁骨小痣
2. 男主 顾辰,32 岁,霸总,西装革履,眼神凌厉
   标志:右眉上方 0.5cm 疤痕,无名指戴家传戒指
3. 女二 苏婉,26 岁,白莲花,长卷发,粉色系穿搭
   标志:右眼尾泪痣,常年戴粉色手链
```

**Step B:H3 文生图批量生成**

- 把提示词批量喂给 H3 文生图接口
- 每个角色挑出 1 张"主参考图"作为后续所有镜头的锚
- 多角度参考图作为"多参考锁定"用

**Step C:角色一致性检查**

- 把所有镜头里同一个角色的脸对比,确保是"同一个人"
- 如果 H3 出图脸漂了,用 V2V 动作迁移 + 多参考图组合修正

### 4.2 场景参考图生成

**LLM 写场景提示词**

```
基于剧本,提取本集出现的所有场景(约 5-8 个,5 分钟一集场景比 2 分钟多),为每个场景生成 H3 文生图提示词。
要求:
- 空镜为主,无人
- 包含时间/天气/光线
- 用于镜头生成的"起始帧"或"氛围参考"

场景:
1. 顾家大宅客厅(豪华欧式,落地窗,水晶灯)
2. 高级公寓夜景(参考镜01)
3. 律师事务所(现代化,玻璃墙)
4. 雨夜街道(车灯,雨水反光)
5. 顶楼天台(黄昏,远景城市)
6. 民政局(办公环境,排队人群)
7. 医院走廊(白色冷光,尽头亮灯)
8. 车内对话(豪华轿车内饰,夜)
```

**H3 批量生成:**
- 每个场景 2-3 张不同光线/角度
- 保存为高清原图,用于"图生视频"的起始帧

### 4.3 道具与服装

- 关键道具(项链、戒指、合同、照片)也生成参考图
- 服装变化标记到镜头表,方便切换 ref
- **5 分钟一集通常角色会换 2-3 套衣服**,每套都要有独立参考图

### 4.4 资产生成的批量化脚本

```python
# batch_generate_assets.py
# 读角色/场景清单,批量调 H3 文生图
import csv
from minimax_h3 import H3Client

h3 = H3Client(api_key=API_KEY)

# 读资产清单
with open("asset_list.csv") as f:
    for row in csv.DictReader(f):
        for i in range(int(row["count"])):
            result = h3.image.generate(
                prompt=row["prompt"],
                aspect_ratio="9:16",
                quality="2k"
            )
            # 保存到对应目录
            path = f"03_assets/{row['type']}/{row['name']}/v{i}.png"
            save(result.image, path)
            print(f"Generated: {path}")
```

---

## 5. Step 4:角色一致性专章 ★

> 这是 H3 做短剧最关键的一章。**5 分钟一集,角色会出现在 15-20 个镜头里,任何一致性崩盘整集就废。**

### 5.1 三大一致性武器

| 武器 | 用法 | 一致性效果 |
|------|------|----------|
| **多参考图(最多 3 张)** | 每镜都喂同一组参考图 | ⭐⭐⭐⭐ |
| **图生视频(起始帧)** | 精修首帧作为起点 | ⭐⭐⭐⭐⭐ |
| **V2V 动作迁移** | 上一镜成片作为下一镜 motion ref | ⭐⭐⭐⭐ |

**单独用都不够,3 个组合用才是 90% 把握。**

### 5.2 角色圣经(每个角色,30-60 分钟,只做一次)

**目标:每个主角建一份"人设合同",后续所有镜头从这里取参考。**

1. **LLM 写详细人设**(用我 M3)

```
为短剧主角「林念安」写视觉描述,要求:
- 28 岁,东亚女性,黑长直(到锁骨),鹅蛋脸
- 肤白,淡妆,薄唇,单眼皮
- 气质冷峻,眉眼带攻击性
- 常穿:黑色西装外套 + 白色衬衫 + 珍珠耳钉
- 身高 168cm,身材纤细
- 标志性细节:左耳单只珍珠耳钉,锁骨有小痣
- 输出 6 段不同角度/表情/光线的英文 prompt,用于 H3 文生图:
  - 正面中性表情 / 常服 / 暖光
  - 45 度角微笑 / 常服 / 暖光
  - 侧面沉思 / 常服 / 冷光
  - 全身站姿 / 常服 / 中性光
  - 愤怒表情 / 常服 / 侧光
  - 哭泣表情 / 常服 / 暖光
```

2. **H3 文生图生成角色板** — 6 段 prompt 各出 2-3 张,挑最好的 6 张
3. **图生图扩展为 8-10 张参考图库** — 多表情/多光线/多服装
4. **筛选 3 张"核心参考图"** — 后面每镜必带:
   - 正面中性 + 常服 + 暖光(主锚)
   - 45 度角 + 常服 + 暖光(侧脸锚)
   - 全身 + 常服 + 中性光(全身锚)
5. **生成 3-4 张"表情锚"** — 哭/笑/怒/惊(情绪镜头专用)
6. **生成 3-4 张"服装锚"** — 每套独立服装 1 张(服装变化用)

**一个完整角色圣经 = 3 张核心 + 4 张表情 + 4 张服装 = 11 张图 ≈ 5-8 元。**
一集 3 个主角 ≈ 20-25 元。这是性价比最高的投入。

### 5.3 单镜出片(每镜 5-10 分钟)

**每镜统一调用 3 个资源:**

1. **必带 3 张核心参考图** + 提示词里写明 `character_ref_01`
2. **图生视频模式 + 精修首帧** — 用 H3 图生图生成"完美的首帧",作为图生视频的 start_image。这张图就是"人脸的合同",后面按这个长。
3. **V2V 跨镜接续(关键!)** — 镜 1 出片后,镜 2 把镜 1 成片作为 motion_reference。同一场景的连续镜头必须这样串,脸的"惯性"才接得上。

**完整提示词结构:**

```
Medium close-up, character_ref_01 (Lin Nian'an, 28, long black hair,
black blazer + white shirt, pearl earring on left ear, small mole
on collarbone), turning head toward door with restrained surprise,
soft warm interior light, bokeh city lights background, she says
clearly "He's back", 9:16 vertical, 2K, 24fps, cinematic,
photorealistic
```

**标志性细节必带**(人脸最一致的锚点反而是这些小细节):
- 痣/疤痕位置
- 单只耳钉(不是一对,这种细节 AI 抓得稳)
- 戒指/手链
- 发型精确描述(到锁骨/到肩膀/盘起)

### 5.4 批量测试 + 优选(5 分钟一集必做)

| 镜头类型 | 生成版本数 | 挑选标准 |
|---------|-----------|---------|
| P0 关键特写(开场/反转/结尾) | 5-8 个 | 脸最像参考图 + 表情最准 |
| P1 普通对话 | 3 个 | 脸过得去 + 动作自然 |
| P2 远景/空镜 | 1-2 个 | 氛围对就行 |

**5 分钟一集 25 镜 × 平均 4 版 × 0.8 元/秒 × 10 秒 ≈ 800 元,其中 60% 是被丢的测试片。**

**这钱不能省——一致性是命,省这点出来一次脸崩,整集废。**

### 5.5 同框戏的坑(最容易翻车)

H3 容易把两张脸混成一张。解决方案:

1. **优先用单人镜头 + 后期 ffmpeg 拼接**(短剧本来就切得快,自动化)
2. **真要同框,先出单人,再用 V2V 把第二个人"加"进去**
3. **提示词严格区分**:
   ```
   character_A (distinct: black hair, narrow eyes, pearl earring)
   +
   character_B (distinct: brown hair, round eyes, scar on brow)
   ```
   给两人**完全不同的外貌特征**减少混淆
4. **中景双人对戏时,前景虚化一个人,只对一个人脸做清晰**
5. **如果同框戏超过 3 个镜头,考虑用 FaceFusion 后期替换兜底**

### 5.6 服装/场景变化的处理

角色换衣服怎么办?**不要在原参考图基础上"想象"换装**,直接:
1. 用 H3 图生图,把主参考图的角色"穿"上新服装
2. 生成 3-4 张新服装的参考图
3. 后续该服装的所有镜头用这组新参考图
4. 在镜头表里明确标记 `outfit_v2`
5. 服装变化前用 1 个"换装过渡镜"(开门/转身/黑场)切断,降低一致性压力

场景变化同理,新场景就重新做一组场景参考图。

### 5.7 后期人脸修复(兜底方案)

5-10% 的镜头 H3 还是会有脸漂,别重做,用**人脸替换工具**修:

| 工具 | 优势 |
|------|------|
| **FaceFusion**(开源) | 免费、质量好,首推 |
| **Reactor** | 配合 ComfyUI 工作流 |
| **Roop** | 轻量易用 |

**用法:** 拿"角色圣经"主锚图作为目标脸,替换 AI 生成镜头里漂的脸。一致性问题 100% 解决,但要选光线接近的参考图,表情过渡要自然。

**自动化:** 见附录 C 的 ffmpeg pipeline 里可以串接 FaceFusion 调用。

### 5.8 一致性自检 checklist(每镜必查)

- [ ] 脸型/五官位置和主参考图一致
- [ ] 头发长度/颜色/发型一致
- [ ] 服装和该场景设定一致
- [ ] 体型/身高比例一致
- [ ] 年龄感一致(别突然 18 变 35)
- [ ] 标志性配饰(耳钉/项链/痣)在位
- [ ] 同一集内同角色,任意两镜截屏对比,普通人能认出"是同一个人"

### 5.9 终极方案:训练专属角色 LoRA(长剧必备)

如果做 10 集以上长剧/矩阵号/追求极致一致:
1. 用 5-10 张角色参考图 + 角色名字
2. 在支持自定义训练的平台(Replicate/Fal.ai 等)上微调
3. 训出专属「林念安」模型,后续所有镜头 100% 一致

**成本:** 训练 50-200 元/角色,一次训练永久用
**适合:** 矩阵号/长剧/IP 化运营/商业化

---

## 6. Step 5:H3 批量出片

### 6.1 三种生成模式选择

| 模式 | 适用场景 | 优势 |
|------|---------|------|
| **文生视频** | 空镜、远景、抽象概念 | 灵活,但人脸不可控 |
| **图生视频** | 需要精确人脸/场景 | 角色一致性强,首选 |
| **V2V 动作迁移** | 动作连贯(打斗/走位) | 解决"镜 1 跳到镜 2 动作接不上" |

### 6.2 标准镜头提示词模板

```
[Mandatory Quality Tags] cinematic, 9:16 vertical, 2K, 24fps,
photorealistic, sharp focus, film grain, atmospheric

[Subject] Character [ref_id], [gender], [age], [appearance details],
[outfit], [signature details: mole, scar, earring]

[Action] [Specific movement/micro-expression/dialogue]

[Camera] [Shot type: ECU/CU/MS/WS/OTS], [movement: static/slow push-in/handheld],
[angle: eye level/low/high]

[Lighting] [Source], [Color], [Intensity], [Mood]

[Audio] Dialogue: "[text]" / SFX: [list] / Ambient: [list]
```

**完整示例(对话特写):**

```
Medium close-up, character_ref_01 (Lin Nian'an, 28, long black hair,
black blazer + white shirt, pearl earring on left ear, small mole on
collarbone), turning head toward door with restrained surprise,
soft warm interior light from side, city lights bokeh in background,
she whispers "He's back", 9:16 vertical, 2K, 24fps, cinematic,
photorealistic
```

### 6.3 批量出片流程(5 分钟一集)

**1. 先出"开门红"镜头**
- 镜 01(开场钩子)单独精做,生成 5-10 个版本挑最好的
- 5 分钟剧的开场比 2 分钟剧更重要——用户给的时间长了,期待也更高

**2. 按场景批量,不要按镜号乱序**
- 同一场景的所有镜头(可能 5-8 个)连续生成
- 共用场景参考图,场景内一致性最佳
- 一个场景做完,所有镜头 V2V 串成一条

**3. 用 V2V 串成长链**
- 镜 03 女主走出门 → 镜 04 镜头跟到走廊 → 镜 05 走廊尽头转身
- 把前一个成片作为下一个的 motion_ref,动作自然衔接
- 5 分钟一集要做 5-8 条 V2V 长链

**4. 拼超长镜头(15s 限制处理)**
- H3 单次 15s,5 分钟一集需要 25-30 镜 = 平均单镜 10-12s,**大部分不会超限**
- 真要更长:多个 15s 拼接 + ffmpeg 无缝转场(推荐)
- 或 V2V 续接延长动作

### 6.4 质量检查清单(每镜必查)

- [ ] 角色脸是否和参考图一致(尤其是特写)
- [ ] 台词是否清晰可听,无 AI 错字
- [ ] 动作是否自然,无"鬼畜"/变形
- [ ] 时长是否在 8-15s(留剪辑余量)
- [ ] 画面比例 9:16 竖屏
- [ ] 音画同步(对白嘴型匹配)
- [ ] 镜头语言是否符合分镜意图
- [ ] 服装和该场景设定一致(防"穿越")

### 6.5 自动化批量出片脚本(进阶)

```python
# batch_generate_shots.py
import csv, time
from minimax_h3 import H3Client

h3 = H3Client(api_key=API_KEY)

def load_character_refs(character_id):
    """加载角色的 3 张核心参考图"""
    folder = f"03_assets/characters/{character_id}"
    return [
        f"{folder}/anchor_front.png",
        f"{folder}/anchor_45.png",
        f"{folder}/anchor_full.png",
    ]

# 读镜头表
with open("02_storyboard/ep01.csv") as f:
    shots = list(csv.DictReader(f))

# 按场景分组(场景内连续生成)
from itertools import groupby
for scene, group in groupby(shots, key=lambda s: s["scene"]):
    group = list(group)
    prev_video = None
    
    for shot in group:
        retry = 8 if shot["priority"] == "P0" else 3
        refs = load_character_refs(shot["character"])
        
        for attempt in range(retry):
            if shot["mode"] == "image_to_video":
                result = h3.video.generate(
                    prompt=shot["prompt"],
                    start_image=f"03_assets/scenes/{shot['scene']}_ref.png",
                    reference_images=refs,
                    duration=int(shot["duration"]),
                    resolution="2k",
                    aspect_ratio="9:16"
                )
            elif shot["mode"] == "v2v_motion_transfer":
                result = h3.video.motion_transfer(
                    target_prompt=shot["prompt"],
                    target_start_image=f"03_assets/scenes/{shot['scene']}_ref.png",
                    motion_reference_video=prev_video,
                    duration=int(shot["duration"]),
                )
            else:  # text_to_video
                result = h3.video.generate(
                    prompt=shot["prompt"],
                    duration=int(shot["duration"]),
                    resolution="2k",
                    aspect_ratio="9:16"
                )
            
            # 保存
            path = f"04_shots/ep01/shot_{shot['id']}_v{attempt}.mp4"
            save(result.video, path)
            
            # 简单质量检查(可以接 LLM-as-judge)
            if llm_quality_check(result, refs):  # 见下
                break
        
        # V2V 链:把当前成片作为下一镜的 motion ref
        if shot.get("next_shot_uses_motion_ref") == "yes":
            prev_video = path

print("All shots generated!")
```

**LLM-as-judge 质量检查:**

```python
def llm_quality_check(video_result, character_refs):
    """用 M3 检查生成结果是否符合要求"""
    # 抽几帧
    frames = extract_keyframes(video_result.path, n=3)
    
    # 让 M3 看图对比
    response = m3.chat.completions.create(
        model="M3",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": "对比参考图和生成视频的关键帧,判断:1) 角色脸是否一致 2) 动作是否自然 3) 画面是否清晰。只回答 PASS 或 FAIL 加 1 句原因。"},
                {"type": "image_url", "image_url": character_refs[0]},
                {"type": "image_url", "image_url": frames[0]},
                {"type": "image_url", "image_url": frames[1]},
            ]
        }]
    )
    return "PASS" in response.choices[0].message.content
```

---

## 7. Step 6:LLM + ffmpeg 自动化剪辑(后期核心)

> **短剧后期 80% 是机械工作:拼接、字幕、转码、加 BGM。LLM 写 ffmpeg 命令,Python 执行,完全自动化,10-15 分钟出一集。剩下的 20% 创意(转场微调、特效、调色)进剪映。**

### 7.1 ffmpeg 能为短剧做什么

| 任务 | ffmpeg 命令模式 | 难度 |
|------|----------------|------|
| 拼接镜头 | concat demuxer | 简单 |
| 切掉废帧 | `-ss` / `-t` | 简单 |
| 加字幕(SRT 烧录) | subtitles 滤镜 | 简单 |
| 混音(BGM + 原音) | amix 滤镜 | 中等 |
| 转 9:16 竖屏 | scale + pad | 简单 |
| 转码输出多规格 | 多 profile 输出 | 简单 |
| 抽帧做封面 | `-vframes 1` | 简单 |
| 调速(快进/慢动作) | setpts 滤镜 | 中等 |
| 简单调色 | eq/curves 滤镜 | 中等 |
| 拼接多镜头成片 | concat + filter complex | 中等 |

### 7.2 LLM 生成 EDL(剪辑决策表)

**先让 LLM 把镜头表转成 EDL:**

```
你是后期剪辑师。基于以下镜头列表和剧情节奏,生成 EDL(剪辑决策表)JSON。

【镜头列表】(按分镜表顺序)
shot_01: 8s, P0, 女主特写, 台词"他说今晚会回来"
shot_02: 5s, P0, 玄关, 无台词, 听到门响
shot_03: 6s, P0, 男主推门, 台词"我回来了"
shot_04: 7s, P1, 玄关对话中景, 双方对望
shot_05: 10s, P0, 特写男主, 表情凝重
...

【节奏要求】
- 整体时长 5 分钟
- 开场 30s 快切,每个镜头不超过 5s
- 中段 2 分钟对话可以慢一点,8-12s
- 反转瞬间加 0.3s 黑场 + 心跳音
- 结尾慢镜头 + BGM 渐弱

输出 JSON:
{
  "timeline": [
    {"shot": "shot_01", "in": 0, "out": 8, "transition": "cut", "speed": 1.0, "note": "开场钩子"},
    {"shot": "shot_02", "in": 1, "out": 6, "transition": "cut", "speed": 1.0, "note": "听到门响,从 1s 开始剪掉转身前的废帧"},
    {"shot": "shot_03", "in": 0.5, "out": 6, "transition": "match_cut", "speed": 1.0, "note": "match cut 接镜 02 转头方向"},
    ...
    {"shot": "shot_15", "in": 0, "out": 4, "transition": "fade_to_black", "speed": 0.7, "note": "反转瞬间,慢动作 + 黑场"}
  ],
  "bgm": {
    "track": "tension_strings.mp3",
    "duck_under_dialogue": true,
    "base_volume": 0.25,
    "fade_in_at": 0,
    "fade_out_at": 295
  },
  "sfx": [
    {"at": 5, "track": "heartbeat.mp3", "duration": 1.5, "volume": 0.5},
    {"at": 12, "track": "door_slam.mp3", "volume": 0.7},
    ...
  ],
  "subtitles": "subs_ep01.srt",
  "color_grade": "warm_cinematic",
  "output": "ep01_final.mp4",
  "thumbnail_at": 3
}
```

### 7.3 SRT 字幕生成(LLM 自动)

```
基于剧本和镜头表,生成 SRT 格式字幕文件。
要求:
- 每句台词对应一个字幕块
- 显示时长 = 该句台词的镜头时长
- 进入时间 = 上一镜结束时间
- 关键词用 [b]粗体[/b] 标记(剪映/SRT 增强)
- 情绪词标 [i]斜体[/i]
- 文件名 subs_ep01.srt
```

输出示例:
```
1
00:00:00,000 --> 00:00:08,000
他说今晚会回来

2
00:00:13,000 --> 00:00:19,000
[b]我回来了[/b]

3
00:00:25,000 --> 00:00:32,000
[i]你不该来[/i]
```

### 7.4 ffmpeg 自动剪辑 pipeline(Python)

```python
# auto_edit.py
# 读 EDL + 镜头文件 + 字幕 + BGM → 输出成片
import json, subprocess
from pathlib import Path

def run_ffmpeg(args, log_path=None):
    """执行 ffmpeg,带日志"""
    print(f"ffmpeg {' '.join(args)}")
    result = subprocess.run(
        ["ffmpeg", "-y", *args],
        capture_output=True, text=True
    )
    if result.returncode != 0 and log_path:
        Path(log_path).write_text(result.stderr)
        raise RuntimeError(f"ffmpeg failed: {result.stderr[:500]}")
    return result

def cut_shots(edl, shots_dir):
    """按 EDL 切每个镜头"""
    cut_files = []
    for i, item in enumerate(edl["timeline"]):
        shot_path = f"{shots_dir}/{item['shot']}.mp4"
        out = f"05_edit/cut_{i:03d}.mp4"
        
        args = [
            "-i", shot_path,
            "-ss", str(item["in"]),
            "-to", str(item["out"]),
        ]
        if item.get("speed", 1.0) != 1.0:
            args += ["-filter:v", f"setpts={1/item['speed']}*PTS",
                     "-filter:a", f"atempo={item['speed']}"]
        args += ["-c", "copy", out]
        
        run_ffmpeg(args, f"05_edit/logs/cut_{i:03d}.log")
        cut_files.append(out)
    
    return cut_files

def concat_with_transitions(cut_files, edl):
    """拼接 + 转场"""
    # 用 concat demuxer 简单拼接
    with open("05_edit/concat_list.txt", "w") as f:
        for cf in cut_files:
            f.write(f"file '{cf}'\n")
    
    run_ffmpeg([
        "-f", "concat", "-safe", "0",
        "-i", "05_edit/concat_list.txt",
        "-c", "copy",
        "05_edit/concat_raw.mp4"
    ], "05_edit/logs/concat.log")
    
    # 处理转场(fade to black 之类)
    # 简化版:在需要转场的地方用 filter_complex
    return "05_edit/concat_raw.mp4"

def add_bgm(video_path, bgm_path, base_volume=0.25, fade_in=0, fade_out=5):
    """加 BGM + 混音"""
    return run_ffmpeg([
        "-i", video_path,
        "-i", bgm_path,
        "-filter_complex",
        f"[1:a]volume={base_volume},afade=t=in:st=0:d={fade_in},"
        f"afade=t=out:st={edl_duration-fade_out}:d={fade_out}[bgm];"
        f"[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=0",
        "-c:v", "copy",
        "05_edit/with_bgm.mp4"
    ], "05_edit/logs/bgm.log")

def burn_subtitles(video_path, srt_path):
    """烧录字幕"""
    return run_ffmpeg([
        "-i", video_path,
        "-vf", f"subtitles={srt_path}:force_style='FontName=PingFang SC,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Alignment=2,MarginV=80'",
        "-c:a", "copy",
        "05_edit/with_subs.mp4"
    ], "05_edit/logs/subs.log")

def export_platforms(video_path, edl):
    """导出多平台版本"""
    platforms = {
        "douyin":    {"w": 1080, "h": 1920, "br": "8M",  "max_dur": 300},
        "kuaishou":  {"w": 1080, "h": 1920, "br": "8M",  "max_dur": 300},
        "hongguo":   {"w": 720,  "h": 1280, "br": "4M",  "max_dur": 90},
        "shipinhao": {"w": 1080, "h": 1920, "br": "6M",  "max_dur": 300},
        "xiaohongshu":{"w": 1080, "h": 1440, "br": "6M",  "max_dur": 90},
    }
    
    for name, p in platforms.items():
        run_ffmpeg([
            "-i", video_path,
            "-vf", f"scale={p['w']}:{p['h']}:force_original_aspect_ratio=decrease,pad={p['w']}:{p['h']}:(ow-iw)/2:(oh-ih)/2:black",
            "-b:v", p["br"],
            "-c:a", "aac", "-b:a", "128k",
            "-t", str(p["max_dur"]),
            f"07_published/ep01_{name}.mp4"
        ], f"05_edit/logs/export_{name}.log")
        print(f"Exported: ep01_{name}.mp4")

def extract_thumbnail(video_path, at=3):
    """抽封面帧"""
    run_ffmpeg([
        "-i", video_path,
        "-ss", str(at),
        "-vframes", "1",
        "-q:v", "2",
        "07_published/ep01_thumb.jpg"
    ], "05_edit/logs/thumb.log")

# === 主流程 ===
edl = json.load(open("05_edit/edl_ep01.json"))
edl_duration = sum(item["out"] - item["in"] for item in edl["timeline"])

# 1. 切镜头
cuts = cut_shots(edl, "04_shots/ep01")

# 2. 拼接
raw = concat_with_transitions(cuts, edl)

# 3. 加 BGM
with_bgm = add_bgm(raw, f"05_edit/bgm/{edl['bgm']['track']}",
                   edl['bgm']['base_volume'])

# 4. 烧字幕
final = burn_subtitles(with_bgm, edl['subtitles'])

# 5. 多平台导出
export_platforms(final, edl)

# 6. 抽封面
extract_thumbnail(final, edl.get("thumbnail_at", 3))

print(f"✅ Episode 1 rendered: {final}")
```

### 7.5 ffmpeg 速查命令(短剧常用)

```bash
# 1. 拼接多个视频
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4

# 2. 切片段(从 5s 开始,持续 8s)
ffmpeg -i input.mp4 -ss 5 -t 8 -c copy cut.mp4

# 3. 烧录 SRT 字幕
ffmpeg -i input.mp4 -vf "subtitles=subs.srt" -c:a copy out.mp4

# 4. 视频+BGM 混音
ffmpeg -i video.mp4 -i bgm.mp3 \
  -filter_complex "[1:a]volume=0.3[bgm];[0:a][bgm]amix=inputs=2:duration=first" \
  -c:v copy out.mp4

# 5. BGM 淡入淡出
ffmpeg -i video.mp4 -i bgm.mp3 \
  -filter_complex "[1:a]volume=0.3,afade=t=in:st=0:d=3,afade=t=out:st=290:d=10[bgm];[0:a][bgm]amix=inputs=2:duration=first" \
  -c:v copy out.mp4

# 6. 慢动作(0.5x)
ffmpeg -i input.mp4 -filter:v "setpts=2*PTS" -filter:a "atempo=0.5" slow.mp4

# 7. 抽封面
ffmpeg -i input.mp4 -ss 3 -vframes 1 -q:v 2 cover.jpg

# 8. 转 9:16 竖屏(保持比例,黑边填充)
ffmpeg -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" -c:a copy v9x16.mp4

# 9. 多规格同时输出
ffmpeg -i input.mp4 \
  -vf "scale=1080:1920" -b:v 8M -c:a aac -b:a 128k douyin.mp4 \
  -vf "scale=720:1280"  -b:v 4M -c:a aac -b:a 96k hongguo.mp4

# 10. 反转瞬间黑场(0.3 秒)
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]drawbox=t=fill:enable='between(t,5,5.3)':color=black@1:t=fill[v]" \
  -map "[v]" -map 0:a out.mp4
```

### 7.6 剪映创意精修(可选,20% 收尾)

ffmpeg 处理完 80% 机械工作后,用剪映做最后润色:

- 高级转场(光效、粒子)
- 复杂特效(碎屏、慢镜缩放)
- 精细调色(LUT 加载)
- 表情贴纸/BGM 微调音量曲线
- 字幕样式个性化(品牌色)

**5 分钟一集剪映精修 30-60 分钟。**

### 7.7 平台规格适配(5 分钟版)

| 平台 | 比例 | 时长建议 | 字幕位置 | 关键 |
|------|------|----------|----------|------|
| 抖音 | 9:16 | 60-300s | 下 1/3 居中 | 前 3 秒钩子,5 分钟也可但完播率会降 |
| 快手 | 9:16 | 60-300s | 下 1/3 居中 | 接地气 |
| 红果短剧 | 9:16 | 60-180s/集 | 下 1/3 | **强反转结尾**,付费剧分集 |
| 视频号 | 9:16 | 60-300s | 居中 | 适合中年用户 |
| 小红书 | 9:16 或 1:1 | 60-180s | 居中 | 颜值/服化道重要,长剧切片 |
| B 站 | 9:16 或 16:9 | 60-600s | 居中 | 横屏接受度高 |

**5 分钟一集的策略:**
- 抖音/快手:拆成 2-3 段发,各自独立钩子
- 红果短剧:整集发(用户付费意愿高)
- B 站:整集发(横屏用户耐心强)

### 7.8 封面与标题

- 封面:选最冲击的 1 帧 + 大字标题 + 人物特写
- 标题模板:`【反转】+ 强情绪词 + 身份/关系 + 结果`
  - 例:【反转】总裁当众羞辱前妻,下一秒她掏出孕检单他当场跪了
  - 例:婚礼当天新娘跑了,3 年后我成了她老板

---

## 8. Step 7:发布与数据复盘

### 8.1 发布前 checklist

- [ ] 前 3 秒是否够"炸"(自己看一遍)
- [ ] 静音刷是否看得懂(关声音看一遍)
- [ ] 字幕是否正确无错字
- [ ] 封面图是否有冲击力
- [ ] 标题是否有钩子
- [ ] 标签是否打了:#短剧 #AI短剧 #反转 #霸总
- [ ] 多平台版本是否分别生成(比例/时长/封面)

### 8.2 多平台分发

- 不要一稿多投直接复制,稍微改下标题和封面
- 抖音首发观察 1 小时数据,好的话立刻全平台铺
- 红果短剧/快手/视频号同步发,小红书单独优化封面
- **5 分钟一集可以切片成 2-3 个短视频**,每个带独立钩子,提升总曝光

### 8.3 数据复盘指标

- **完播率**(最重要):< 20% 必改开场(5 分钟剧完播率比 2 分钟剧低是正常的)
- **点赞率**:`点赞/播放`,> 3% 算爆款苗头(5 分钟剧阈值比 2 分钟低)
- **评论率**:评论数反映钩子强度
- **转发率**:转发高说明有"社交货币"价值
- **关注转化率**:剧情吸粉能力
- **平均观看时长**:5 分钟剧这个指标比完播率更准

### 8.4 迭代方向

- 高完播 + 低点赞 → 内容有趣但没情绪点,加冲突
- 低完播 + 高点赞 → 开场不够抓人,重做镜 01
- 高转发 + 低关注 → 剧情设计成"单集爽",加连续性钩子
- 长尾流量差(7 天后无播放)→ 标题/封面没吸引力,改 SEO 关键词

---

## 9. 进阶:批量生产 & 商业化

### 9.1 工业化流程(10 集起,5 分钟/集)

```
Day 1: 选题 + 剧本 + 分镜 (LLM 一次性输出)
Day 2: 角色圣经 + 场景资产 (H3 批量,所有集共享)
Day 3-5: 镜头出片 (H3 + Python 自动化 + 人工抽检)
Day 6: 后期 (LLM 生成 EDL + ffmpeg 自动剪辑 + 剪映精修)
Day 7: 多平台发布 + 数据观察
Day 8: 复盘 + 下一季规划
```

**5 分钟 × 10 集总成本估算:8000-12000 元(主要是 H3 视频生成)**
**总耗时:8-10 天(1 人)**

### 9.2 商业化路径

- **平台分账**:红果短剧/抖音小程序/IAA 广告
- **付费解锁**:抖音/快手付费短剧,前 5 集免费后续解锁(5 分钟集单价可以更高)
- **私域转化**:加微信 → 卖课程/卖剧本/卖账号
- **矩阵号**:同一剧本改风格,10 个号同时发
- **接广告**:粉丝到 10w 后接品牌植入

### 9.3 5 分钟剧的差异化打法

| 维度 | 2 分钟剧 | 5 分钟剧 |
|------|---------|---------|
| 节奏 | 极快,3 秒一切 | 中等,15 秒一转 |
| 适合平台 | 抖音/快手切片 | B 站/红果/视频号 |
| 商业模型 | 免费+IAA 广告 | 付费解锁/分账 |
| 用户期待 | 短平快爽 | 完整故事+人物弧光 |
| 制作成本 | 低(80-150/集) | 中(500-1000/集) |
| 单集分成 | 0.5-2 元 | 5-20 元 |
| ROI 周期 | 快(3-7 天) | 中(15-30 天) |
| 适合 | 矩阵号/引流 | 精品 IP/付费剧 |

**建议:2 分钟剧做流量,5 分钟剧做品牌。两条腿走。**

### 9.4 版权与合规

- H3 生成内容商用权看平台最新条款(开源后部分条款可能调整)
- 不要使用真人明星脸作为参考
- 音乐用免版权库(剪映自带/Epidemic Sound)
- 剧本避免完全照抄爆款,改头换面 + 自己加元素

---

## 10. 常见坑 & 解决方案

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 人物脸每镜都不一样 | 没锁参考图 | 每镜都喂多参考图(最多 3 张)+ 角色圣经 |
| 5 分钟一集节奏拖沓 | 转折点不够 | 每 15 秒必有一个情绪/情节转折 |
| 中段 1-3 分钟观众流失 | 缺乏悬念 | 中段也要埋钩子,不要全靠结尾 |
| 台词嘴型对不上 | 提示词没强调 | 提示词加 "clearly saying '[台词]'" |
| 动作断断续续 | 镜头切太碎 | 用 V2V 动作迁移接续 |
| 画质不统一 | 分辨率混用 | 全部强制 2K |
| 音画不同步 | 多段拼接 | ffmpeg 里手动对齐关键帧 |
| 镜头太长/太短 | 没控制时长 | H3 设固定 8s/12s/15s 三档,ffmpeg 拼接 |
| 反转不够"炸" | 钩子设计弱 | 参照爆款短剧《XXX》第 X 集学习 |
| LLM 写的剧本太正经 | 缺短剧感 | 提示词加"参考抖音爆款短剧《XXX》风格" |
| H3 提示词不达意 | 写得太抽象 | 主体/动作/镜头/光线/音效分开写,具体化 |
| ffmpeg 烧字幕乱码 | 字体问题 | force_style 指定 FontName=PingFang SC |
| 同框两人脸混 | H3 局限 | 单人镜头 + 后期 ffmpeg 拼接 |
| 服装突然变了 | 镜头表没标 outfit | 镜头表加 outfit_v 字段,统一管理 |
| 配音/BGM 盖过台词 | 音量没控制 | amix weights 调成 1:0.3 |
| 封面没吸引力 | 抽帧不对 | 选情绪最强一帧,加文字 + 滤镜 |

---

## 11. 速查:5 分钟一集工作流 checklist

```
□ Step 1: 选题 + 剧本生成(LLM,1 小时)
□ Step 2: 镜头表(LLM,30 分钟)
□ Step 3: 角色圣经 + 场景资产(H3 文生图,2 小时)
□ Step 4: 角色一致性预演(1-2 个测试镜头,1 小时)
□ Step 5: 25-30 个镜头出片(H3 + V2V,1-2 天含重做)
□ Step 6: EDL + 字幕 + ffmpeg 剪辑(30 分钟自动化)
□ Step 7: 剪映精修(1 小时)
□ Step 8: 多平台发布 + 数据观察
---
总计:2-3 天(有经验)/ 5-7 天(新手)
成本:500-1000 元/集
```

---

## 附录 A:提示词模板合集

### A.1 镜头提示词(英文)

```
[Mandatory Quality Tags] cinematic, 9:16 vertical, 2K, 24fps, photorealistic,
sharp focus, film grain, atmospheric

[Subject] Character [ref_id], [gender], [age], [appearance details], [outfit],
[signature details: mole, scar, earring]

[Action] [Specific movement/micro-expression/dialogue]

[Camera] [Shot type: ECU/CU/MS/WS/OTS], [movement: static/slow push-in/handheld],
[angle: eye level/low/high]

[Lighting] [Source], [Color], [Intensity], [Mood]

[Audio] Dialogue: "[text]" / SFX: [list] / Ambient: [list]
```

### A.2 角色提示词(英文)

```
[Quality] 8k, highly detailed, photorealistic, cinematic lighting,
sharp focus, character sheet, multiple angles

[Character Info] [Name], [gender], [age], [ethnicity], [build],
[hair], [eyes], [facial features], [skin tone]

[Outfit] [Clothing items in detail], [accessories]

[Signature Details] [Mole/scar/jewelry location]

[Pose] [Standing/portrait], [expression], [angle]
```

### A.3 场景提示词(英文)

```
[Quality] 8k, highly detailed, photorealistic, atmospheric,
cinematic lighting, sharp focus, establishing shot

[Location] [Type], [architecture style], [key features]

[Time & Weather] [Time of day], [weather]

[Lighting] [Light sources], [color palette], [mood]

[Composition] Empty, no people, [framing]
```

### A.4 EDL 生成提示词

```
你是后期剪辑师。基于镜头列表和剧情节奏,生成 EDL JSON(见 §7.2 字段说明)。
重点:5 分钟节奏 + 反转瞬间黑场 + 慢动作 + BGM duck
```

### A.5 字幕生成提示词

```
基于剧本和镜头表,生成 SRT 格式字幕文件。
要求:进入时间 = 上镜结束,显示时长 = 镜头时长,
关键词 [b]粗体[/b],情绪词 [i]斜体[/i]
```

---

## 附录 B:H3 调用速查

```python
from minimax_h3 import H3Client

client = H3Client(api_key="...")

# 1. 文生视频
result = client.video.generate(
    prompt="cinematic close-up of a young woman...",
    duration=10,  # 秒
    resolution="2k",
    aspect_ratio="9:16",
    audio=True
)

# 2. 图生视频(图 + 提示词)
result = client.video.generate(
    prompt="she turns her head slowly and whispers",
    start_image="path/to/ref.png",
    reference_images=["path/to/ref2.png", "path/to/ref3.png"],
    duration=15,
    resolution="2k"
)

# 3. V2V 动作迁移
result = client.video.motion_transfer(
    target_prompt="woman walking in hallway",
    target_start_image="hallway_ref.png",
    motion_reference_video="path/to/prev_shot.mp4"
)

# 4. 文生图(角色/场景资产)
result = client.image.generate(
    prompt="character sheet, 28-year-old East Asian woman...",
    aspect_ratio="9:16",
    quality="2k"
)
```

---

## 附录 C:ffmpeg 短剧后期速查

(完整命令见 §7.5,这里按用途分类)

### C.1 拼接/切割
- 拼接: `-f concat -i list.txt -c copy`
- 切片段: `-ss 5 -t 8 -c copy`
- 慢动作: `-filter:v "setpts=2*PTS" -filter:a "atempo=0.5"`

### C.2 字幕/音频
- SRT 烧录: `-vf "subtitles=subs.srt:force_style='...'"`
- 视频+BGM 混音: `amix=inputs=2:duration=first`
- BGM 淡入淡出: `afade=t=in:st=0:d=3,afade=t=out:st=290:d=10`
- ducking(对话时压低 BGM): `[0:a]asplit=2[voice][voice_for_mix];[1:a]volume=0.5[bgm];[voice_for_mix][bgm]sidechaincompress=threshold=0.05:ratio=8[ducked]`

### C.3 转码/导出
- 9:16 竖屏: `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black`
- 多规格同时输出: 多 `-vf` + `-b:v` 链
- 抽封面: `-ss 3 -vframes 1 -q:v 2`

### C.4 调色
- 暖色: `-vf "eq=saturation=1.1:gamma=1.05:contrast=1.05"`
- 冷色: `-vf "eq=saturation=0.9:gamma=0.95:contrast=1.1,colorbalance=bs=0.1"`
- LUT: `-vf "lut3d=cube_file.cub"`

### C.5 平台规格预设

```bash
# 抖音/快手
ffmpeg -i in.mp4 -vf "scale=1080:1920" -b:v 8M -c:a aac -b:a 128k -movflags +faststart douyin.mp4

# 红果短剧
ffmpeg -i in.mp4 -vf "scale=720:1280" -b:v 4M -c:a aac -b:a 96k -movflags +faststart hongguo.mp4

# 视频号
ffmpeg -i in.mp4 -vf "scale=1080:1920" -b:v 6M -c:a aac -b:a 128k -movflags +faststart shipin.mp4
```

---

## 写在最后

H3 最大的价值不是"出片多漂亮",而是**它把短剧制作里最贵的两个环节(演员+场景)成本干到零**。

5 分钟一集意味着:
- 你要做"完整故事"而不是"片段爽感"
- 一致性挑战 ×3(从 2 分钟的 10 镜到 30 镜)
- 成本 ×5(从 100 到 1000)
- 价值 ×10(单集分成从 1 元到 10 元)
- IP 沉淀更强(用户更容易记住、追更)

把 LLM 用好 + 把 H3 用透 + 把 ffmpeg 玩转 = 你一个人就是一家短剧公司。

跑通第一集后,后面就是流水线。祝你爆款 🚀

---

> 文档版本:2026-08-03 v2
> 配套 H3 版本:开源自 2026-08-03
> 更新内容:v2 加入角色一致性专章(§5)、LLM+ffmpeg 自动化剪辑(§7)、5 分钟一集适配全章
> 反馈与更新:基于实操迭代,持续优化
