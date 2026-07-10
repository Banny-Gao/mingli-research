# 字体资产管理（Git LFS）

本仓库 `public/assets/fonts/` 下的中文字体文件使用 **Git LFS**（Large File Storage）管理。本文档说明：

- 为什么用 LFS
- 有什么影响
- 如何新增 / 更新 / 移除字体
- 常见问题

---

## 1. 背景

字体文件总量约 **469 MB**，单文件最大 101 MB（`Kaiti.ttc`），已超过 GitHub 的 100 MB 单文件硬限制。早期直接将二进制字体 commit 进 main 分支，导致：

- `git push` 经常失败 / 报 100MB 警告
- 仓库 `.git` 目录膨胀，clone 极慢
- 无法用 GitHub Web UI 审查历史

2026-07-09 改用 Git LFS（commit 历史已重写，详见 §3）。

---

## 2. 当前 LFS 追踪范围

`.gitattributes` 中声明：

```gitattributes
public/assets/fonts/*.ttc filter=lfs diff=lfs merge=lfs -text
public/assets/fonts/*.ttf filter=lfs diff=lfs merge=lfs -text
public/assets/fonts/*.otf filter=lfs diff=lfs merge=lfs -text
```

被追踪的 12 个文件（约 469 MB）：

| 文件 | 体积 | 用途 |
|------|------|------|
| `Kaiti.ttc` | 101 MB | 楷体 |
| `Xingkai.ttc` | 85 MB | 行楷/毛笔 |
| `PingFang.ttc` | 75 MB | 苹方/默认 |
| `STHeiti Medium.ttc` | 53 MB | 黑体 |
| `STHeiti Light.ttc` | 53 MB | 细黑体 |
| `Libian.ttc` | 34 MB | 隶书 |
| `msyh.ttc` | 19 MB | 微软雅黑 |
| `simsun.ttc` | 17 MB | 宋体 |
| `simkai.ttf` | 11 MB | 楷体 |
| `simfang.ttf` | 10 MB | 仿宋 |
| `simhei.ttf` | 9.3 MB | 黑体 |
| `MFLingLong_Noncommercial-Regular.otf` | 1.3 MB | 玲珑体（古风标题） |

配置文件 `fonts.json` 与说明文件 `README.md` **不入 LFS**（合计 < 10KB，可直接跟踪 diff）。

---

## 3. 历史改写的影响

2026-07-09 执行了一次 `git lfs migrate import --everything`，**所有 418 个相关 commit 的 SHA 全部改变**。对协作者与 CI 的影响：

### 已发生 / 需要立即处理

- ✅ 远端使用 `git push --force-with-lease` 覆盖（见 PR 描述）
- ✅ 仓库 `main` 分支顶端 SHA 变化（旧的 commit 仍可按原 SHA 在 reflog 中找回，但会随时间过期）

### 对协作者

每个已经 clone 过本仓库的人（包括你自己在其它机器上的副本）必须执行：

```bash
# 备份当前未推送的工作（如果有）
git stash
git fetch origin
git reset --hard origin/main   # 切到新的远端 main
git lfs pull                    # 拉取真实字体文件（如果之前是 LFS 指针）
git stash pop                   # 恢复未推送的工作（如果有冲突就手动解决）
```

> ⚠️ 本地任何基于「旧 SHA」开出的 feature branch 会失效，需要重新基于新 `main` 重建。

### 对 CI

- **GitHub Actions**：默认 Runner 已预装 `git-lfs`，但需要在 checkout 步骤显式启用：

  ```yaml
  - uses: actions/checkout@v4
    with:
      lfs: true   # 关键：拉取真实字体文件
  ```

  漏掉 `lfs: true` 会导致 working tree 里只有 133 字节的指针文件，t2i/i2i 渲染时找不到字体而失败。

- **其它 CI（Vercel / Netlify / 自建 runner）**：自行确认是否安装 `git-lfs` ≥ 1.0 并在 build 前执行 `git lfs pull`。

- **Docker 镜像**：在 Dockerfile 中安装 `git-lfs`（apt 例：`apt-get install -y git-lfs && git lfs install`），否则 clone 时不会拉取真实文件。

---

## 4. 配额监控

| 资源 | 免费额度 | 本项目当前用量 |
|------|---------|---------------|
| LFS 存储 | 1 GB | ~470 MB / 1 GB（**47%**） |
| LFS 带宽 | 1 GB / 月 | 视团队 clone 频率而定 |

- 配额查看：https://github.com/settings/billing → "Git LFS Data"
- 超出后 GitHub 会**拒绝 push**（不会自动转普通 git）
- 如果未来接近上限，考虑：① 子集化（subset）压体积；② 改为 CDN / OSS 托管（参见 `docs/IMAGE_GEN_ARCHITECTURE.md` 中的字体兜底链）

---

## 5. 日常维护流程

### 5.1 从系统添加一个新字体

适合场景：macOS 上装了某个字体，希望它能在 t2i/i2i 中使用，并随仓库发布给所有协作者。

**前置确认**：先在 `public/assets/fonts/fonts.json` 的 `system_fallbacks.<platform>` 里查一下——如果已有该字体的 `path` 条目，font-installer 会自动从系统复制（**这是最常用的入口**）；如果没条目，需要先手动加（见 §5.1.b）。

#### 5.1.a 标准流程（系统已有预设路径）

```bash
# 1. 编辑 fonts.json，在 bundled[] 中加一条声明
#    （必须！否则 t2i 渲染器找不到该字体）
{
  "family": "Xingkai SC Bold",        # 系统中显示的 family 名（PostScript name）
  "file": "Xingkai.ttc",              # basename 必须与系统路径最后一段一致
  "purpose": "行楷/毛笔",
  "source": "auto",
  "auto_added": true
}

# 2. 跑 font-installer：自动从系统路径复制到 fonts 目录
node scripts/lib/shared/font-installer.js --force

# 输出示例：
#   📦 [A7/12] Xingkai.ttc ← Xingkai SC Bold ... ✅
#   📦 字体补全: bundled 补全 1 | 已存在 11

# 3. 关键安全检查：确认复制成功 + LFS 会正常追踪
ls -lh public/assets/fonts/Xingkai.ttc          # 必须看到真实体积（如 85M），不是 133B
git lfs ls-files | grep Xingkai.ttc              # 必须在 LFS 列表里
git lfs status                                   # 不应有 "object not found"

# 4. 入库
git add public/assets/fonts/Xingkai.ttc public/assets/fonts/fonts.json
git commit -m "feat(fonts): add Xingkai SC Bold via system fallback"
git push
```

#### 5.1.b 系统未预设路径（首次发现某个 macOS 字体）

如果 `system_fallbacks.macos` 里没有该字体的 `path` 条目，需要手工查 + 加：

```bash
# 1. 用 mdfind / 系统工具找到字体真实路径
mdfind -name "xxx.ttf" 2>/dev/null

# 2. 把路径写到 fonts.json 的 system_fallbacks.macos
{
  "name": "Family Name",                       # 系统显示名
  "path": "/path/to/xxx.ttf",                  # 上面查到的路径（可用 glob 通配符 *）
  "purpose": "用途描述"
}

# 3. 然后按 §5.1.a 步骤 2~4 继续
```

#### 5.1.c 系统未安装（如玲珑体这种第三方字体）

```bash
# 1. 手动复制到 fonts 目录
cp /path/to/MFLingLong_Noncommercial-Regular.otf public/assets/fonts/

# 2. fonts.json 的 bundled[] 里加声明（同 §5.1.a 步骤 1）

# 3. 跑 font-installer 确认能识别
node scripts/lib/shared/font-installer.js --force
# 输出: 已存在 12 ✓

# 4. 入库
git add public/assets/fonts/MFLingLong_Noncommercial-Regular.otf public/assets/fonts/fonts.json
git commit -m "feat(fonts): add MFLingLong (third-party, not on system)"
git push
```

#### 5.1.d 仅本机使用（不入库）

只想在当前机器用、不入库分发：

```bash
# 编辑 system_fallbacks.macos 加条目后跑 font-installer
# font-installer 会自动把 system-only 字体追加到 bundled[]
#   输出: 📦 [B] Xingkai.ttc ← Xingkai SC Bold ... ✅
node scripts/lib/shared/font-installer.js --force

# ⚠️ 不要 commit fonts.json —— 跑完字体已复制到 fonts 目录，但 git 索引未变
# 如果误 commit 了，回滚：
git restore --staged public/assets/fonts/fonts.json
git checkout -- public/assets/fonts/fonts.json
```

---

### 5.2 替换一个已有字体

```bash
# 直接覆盖（文件名不变，git diff 不会显示内容变化但 LFS 会重新上传）
cp /path/to/new-version.ttc public/assets/fonts/simhei.ttf
git add public/assets/fonts/simhei.ttf
git commit -m "fix(fonts): update simhei to v1.2 (xxx bug)"
git push
```

> LFS 用文件内容 hash 寻址，替换内容会产生新的 OID，旧版本通过 reflog 仍可找回一段时间。

### 5.3 移除一个字体

```bash
git rm public/assets/fonts/simfang.ttf
# 同时清理 fonts.json.bundled 中的对应条目
git add public/assets/fonts/fonts.json
git commit -m "chore(fonts): remove simfang (unused since v2)"
git push

# 回收配额（可选，会删除远端 LFS 对象且不可恢复）：
# git lfs prune --remote
```

> ⚠️ `git rm` 只会删除 git 索引和本地文件，**不会自动回收 LFS 存储配额**。需要回收时手动 `git lfs prune --remote`，但之后无法从 GitHub 找回旧文件。

### 5.4 新增其它扩展名（如 .woff2）

编辑 `.gitattributes` 添加一行（顺序无关）：

```gitattributes
public/assets/fonts/*.woff2 filter=lfs diff=lfs merge=lfs -text
```

新扩展名只对**新增 commit** 生效；**已经在 git 历史里的 .woff2 文件不会被自动转换**。如需迁移旧文件：

```bash
git lfs migrate import --include="public/assets/fonts/*.woff2" --everything
# 同样需要 --force-with-lease 推送到远端
```

---

## 6. 故障排查

### 6.1 字体文件只有 133 字节（指针）

```bash
$ ls -lh public/assets/fonts/simhei.ttf
-rw-r--r--  1 user  staff   133B  simhei.ttf   # 异常！正常应 9.3M
```

指针文件长这样：

```
version https://git-lfs.github.com/spec/v1
oid sha256:xxxxxxxxxxxx
size 9300000
```

**原因**：`.gitattributes` 没追踪 / LFS 没装 / `git lfs pull` 没执行。修复：

```bash
git lfs install            # 用户级 hook 安装
git lfs pull               # 拉取真实文件
git lfs checkout            # 也可，针对单个文件
```

### 6.2 push 报 "GH001: Large files detected"

说明有 LFS 未追踪的大文件（>50MB 警告，>100MB 拒绝）。两种可能：

1. **新文件扩展名没在 `.gitattributes` 里** — 参考 §5.4
2. **`.gitattributes` 写错路径** — 注意 `public/assets/fonts/` 前缀必须与文件实际路径一致

### 6.3 "this exceeds GitHub's file size limit of 100.00 MB"

**根本原因**：LFS 没装 / 路径不匹配 / `.gitattributes` 漏写。检查顺序：

```bash
git lfs version                                    # 是否已装
git lfs track                                       # 列出当前所有 track 规则
git check-attr filter -- public/assets/fonts/xxx   # 查看该文件实际命中的 filter
```

输出 `filter: lfs` 才算正确。

### 6.4 协作者报错 "Object not found" / "Smudge error"

通常是 `git lfs pull` 没执行。也可加进 `.gitconfig` 强制自动拉取：

```ini
[lfs]
    fetchexclude = ""
    smudge = smudge -- %f
    process = process -- %f
```

### 6.5 想完全卸载 LFS

**不推荐**，但如果必须：

```bash
git lfs migrate export --include="public/assets/fonts/*" --everything
# 然后从 .gitattributes 删除所有 lfs 相关行
git rm .gitattributes
# 重新 commit + force push
```

> 这会重新把 469MB 写进 git history，仓库会变回大体积。仅作应急记录，请先评估。

---

## 7. 最佳实践

1. **不把字体文件复制到项目里再传** —— 直接 `cp` 真实路径下的字体到 `public/assets/fonts/`，避免引入 macOS 资源叉（`@` 符号、`xattr`）导致上传后哈希异常。
2. **大文件优先用 CDN / OSS** —— 单文件 > 50MB 或总占用 > 1GB 时，LFS 不再是最优解。
3. **子集化（subset）** —— 中文字体可只保留 GB2312 3500 常用字 + 标点，体积可压缩 70-90%。可用工具：`fonttools`（Python）、`fontmin`（Node）、`cloud-subset`（各 CDN 服务商）。
4. **CI 缓存 LFS** —— 如果 CI 不修改字体，可在 cache 步骤缓存 `~/.git/lfs`，节省带宽。
5. **监控 LFS 带宽** —— 每次 CI / 协作者 clone 都会消耗 1GB/月免费额度。大型 CI 推荐先 `git lfs fetch --include="public/assets/fonts/*"` 一次，后续任务复用缓存。

---

## 8. 参考链接

- Git LFS 官方文档：https://git-lfs.github.com/
- GitHub LFS 配额说明：https://docs.github.com/en/billing/managing-billing-for-git-large-file-storage
- 项目字体配置：`public/assets/fonts/fonts.json`（含 system_fallbacks 兜底链）
- t2i 渲染器：见仓库内 `docs/IMAGE_GEN_ARCHITECTURE.md`
