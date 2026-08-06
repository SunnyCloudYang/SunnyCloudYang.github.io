# 相册 (Gallery) 功能文档

> 一份给后续迭代用的完整说明：架构、文件分布、数据模型、每个功能的实现位置与可调参数。
> 最后更新：2026-08-07。对应代码状态：相册改为页面包 + Hugo Pipes 自动生成（缩略图/LQIP/EXIF/拍摄日期全自动）；顶部菜单链接仍注释隐藏，页面本身保留。

---

## 1. 概览

相册是一个 Hugo 原生 section（`gallery`），复用站点的 PaperMod chrome（页头/页脚/深色模式/面包屑/分页/CSS 管线/i18n）。

**一个页面，两种视图**——`/gallery/` 列表页顶部有一个右上角的胶囊式分段开关：

- **相册**（默认）：分组堆叠卡片，hover 时展开成扇形。
- **全部图片**：平铺瀑布流（masonry），跨所有相册的图片。

切换是纯客户端（JS），选择记在 `localStorage`（key `gallery-view`），下次进入记住上次视图。`全部图片`视图默认隐藏（`display:none`），其图片懒加载，切到该视图才下载。

独立的 `/gallery/all/` 页已删除（合并进列表页）。

**自动生成**：把带 EXIF 的 JPEG 丢进相册页面包，Hugo 在构建期自动生成缩略图、32px 模糊预览（LQIP）、读 EXIF、取拍摄日期。无需手填 `photos` 数组或手做缩略图/LQIP。

---

## 2. 文件分布

### 内容
| 文件 | 作用 |
|---|---|
| `content/gallery/_index.md`(+`.en.md`) | 相册 section 首页，`title: 相册`，用 `list.html`。 |
| `content/gallery/<album>/index.md`(+`.en.md`) | 单个相册**页面包**，front matter 只写 `title`/`date`/`description` + `photos: true` 标记。示例：`demo-trip/`。 |
| `content/gallery/<album>/*.jpg` | 相册图片（页面包资源，JPEG/PNG/WebP，带 EXIF）。丢图即自动生成缩略图/LQIP/EXIF/日期。 |
| `content/gallery/<album>/meta.yaml` | （可选）按文件名给个别图覆盖 `title`/`caption`/`tags`。 |
| ~~`content/gallery/all.md`~~ | 已删除（合并进列表页）。 |

### 布局
| 文件 | 作用 |
|---|---|
| `layouts/gallery/list.html` | **列表页**：页头 + 视图开关 + 相册视图（堆叠卡 + 分页）+ 全部图片视图（平铺网格）+ `#gallery-i18n` span。无相册时显示空状态。 |
| `layouts/gallery/single.html` | **相册详情页**：页头 + `.tag-bar` + `.photo-grid` + 页脚（标签/上下篇/评论）+ `#gallery-i18n` span。无照片时显示空状态。 |
| `layouts/partials/gallery/photos.html` | **共享 partial**：枚举页面包图片，自动 `.Resize` 缩略图(800x q80)+LQIP(32x q20)、读 `.Exif.Tags`、合并 `meta.yaml`。返回 photo dict 列表，被 single + list 复用。 |
| ~~`layouts/gallery/gallery-all.html`~~ | 已删除。 |

### 资源
| 文件 | 作用 |
|---|---|
| `assets/css/extended/gallery.css` | 全部相册样式，随站点 `css/extended/*.css` 自动打包压缩。全用站点 CSS 变量。 |
| `static/js/gallery.js` | IIFE，classic 脚本，经 `defer` 加载。含：视图开关、渐进加载、标签筛选、灯箱、3D 悬浮。无外部依赖（除 GLightbox）。 |
| ~~`static/images/gallery/<album>/*.jpg`~~ | 图片已移入页面包 `content/gallery/<album>/`（Hugo 才能处理/读 EXIF）。 |
| ~~`static/images/gallery/<album>/*-blur.*`~~ | LQIP 现由 Hugo `.Resize` 自动生成，无需手做。 |

### i18n / 配置
| 文件 | 作用 |
|---|---|
| `i18n/zh.yaml`、`i18n/en.yaml` | 项目级 i18n（与主题 `i18n/` 合并，项目覆盖）。所有 `gallery_*` key。 |
| `layouts/partials/extend_head.html` | 增了 `gallery` 分支：当 `.Section == "gallery"` 或 `.Params.gallery` 时，`defer` 加载 GLightbox CSS/JS（jsdelivr CDN）+ `/js/gallery.js`。 |
| `config.yml` | 顶部菜单相册项（**当前注释隐藏**）、首页 `profileMode.buttons`（相册按钮已删）、`security.allowContent: ['.*']`。 |

---

## 3. 照片数据模型（页面包 + 自动生成）

每个相册是一个**页面包**：`content/gallery/<album>/index.md` + 图片文件 + 可选 `meta.yaml`。front matter 只写相册级元数据，照片不再手填：

```yaml
---
title: "海边漫游"
date: 2024-08-15
description: "盛夏的北戴河，日出与栈桥。"
ShowBreadCrumbs: true
photos: true          # 标记此页是相册（list.html 用它筛选/分页）
---
拍了一百多张，挑了五张能看的。   # 可选导言，single.html 的 .Content 渲染。
```

图片直接丢在页面包里（`01.jpg`、`02.jpg`…），按文件名排序。`layouts/partials/gallery/photos.html` 在构建期对每张图：

- **缩略图**：`.Resize "800x q80"` → 瀑布流/堆叠卡用。
- **LQIP 模糊预览**：`.Resize "32x q20"` → ~600 字节微型图，blur-up 用。
- **EXIF**：`.Exif.Tags` 读 `Model`(camera)/`LensModel`(lens)/`FNumber`(aperture)/`ExposureTime`(shutter)/`ISO`/`FocalLength`(focal)。
- **拍摄日期**：`DateTimeOriginal`（`2024:08:15 05:42:00` 串 → 清理成 `2006-01-02`）。
- **标题**：`meta.yaml` 覆盖 → EXIF `ImageDescription` → 文件名。
- **caption/tags**：仅 `meta.yaml`（可选）。

EXIF 有理数字段（如光圈 f/5.6 存成 `28/5`）在 partial 里转成浮点再格式化，避免出现 `f/28/5`。字段缺失（如某图无 `LensModel`）则对应项留空，JS 灯箱里不显示。

`meta.yaml`（可选，按文件名即 resource `.Name` 查表）：
```yaml
"01.jpg":
  title: "日出"
  caption: "凌晨四点爬起来等的光"
  tags: ["日出", "海"]
"03.jpg":
  title: "海浪"
  tags: ["海"]
```
所有 `meta.yaml` 字段可选；不写 `meta.yaml` 也行，标题回退到 EXIF `ImageDescription`/文件名，EXIF/日期仍自动来自图片。加图后想批量补空条目脚手架，跑 `scripts/gallery_meta.py`（见 §7）——只追加新图的空条目，已填的不动。

无图片（页面包无图资源）时显示空状态文案 `gallery_empty`。

---

## 4. 功能清单与实现位置

### 4.1 视图开关（相册 / 全部图片）
- 标记：`layouts/gallery/list.html` 的 `.gallery-view-toggle`（两个 `.view-btn`，`data-view="albums"` / `"all"`）+ 两个 `<section class="gallery-view" data-view=...>`。
- 行为：`static/js/gallery.js` 的 `initViewToggle()`——点按钮切 `.is-active` + `aria-selected`/`aria-hidden`，写 `localStorage['gallery-view']`。
- 样式：`gallery.css` `.gallery-view-toggle`（`justify-content:flex-end` 右对齐、胶囊圆角、激活项 `--primary` 填充）、`.gallery-view{display:none}` / `.is-active{display:block}`。

### 4.2 相册堆叠卡 + hover 展开
- 标记：`list.html` 相册视图的 `.album-stack > .stack > .stack-img`（取该相册前 4 张自动生成的缩略图）。
- 默认堆叠：`.stack-img:nth-child(N)` 用 `translate()+rotate()` 摆成一摞。
- hover 展开：`.album-stack:hover .stack-img:nth-child(N)` 扇形摊开（**调参见 §6**）。
- 样式：`gallery.css`。`prefers-reduced-motion` 下展开禁用。

### 4.3 瀑布流（masonry）
- `.photo-grid { columns: 3; column-gap: var(--gap); }`，响应式 2 列（≤1024px）/ 1 列（≤600px）。`.photo { break-inside: avoid; }`。

### 4.4 渐进加载 + 模糊预览（blur-up / LQIP）
- 标记：`.photo-card` 内两层——`.photo-blur`（32px LQIP，in-flow，撑起卡片高度 + 放大模糊）+ `.photo-img`（800px 缩略图，绝对定位覆盖）。两者都由 partial 自动 `.Resize` 生成。
- 关键设计：`.photo-img` **默认可见**（不靠 JS 才显示），`<img>` 未加载完不绘制内容，底层 `.photo-blur` 透出来 = “未加载时显示”；加载完清晰图盖住模糊层，JS 加 `.loaded` 把模糊层淡出（清理）。无 JS 也不会卡在透明。
- JS：`initProgressiveImages()`——缓存图（`complete && naturalWidth>0`）立即 reveal，否则绑 `load` 事件；`error` 时保留模糊层。
- 样式：`gallery.css` `.photo-blur`（`filter:blur(18px) scale(1.12)`）、`.photo-img`、`.photo.loaded .photo-blur{opacity:0}`。

### 4.5 GLightbox 灯箱
- 加载：`extend_head.html` 的 gallery 分支，`defer` 引入 jsdelivr 的 GLightbox CSS/JS（在 CSP 白名单内）。
- 初始化：`initLightbox()`——按 `data-gallery` 分组，每组一个 GLightbox 实例，`elements` 用 `data-src`/`data-title`，`description` 由 `buildDescription()` 拼 HTML（caption + 日期 + 来源相册 + EXIF）。点 `.photo` 调 `openAt(i)`。键盘 ←/→/Esc。
- 灯箱大图用**原图**（`data-src` = 原图 `.Permalink`），缩略图用 800px 缩略图。

### 4.6 标签筛选
- `initTagFilter()`——从所有 `.photo` 的 `data-tags` 汇总，渲染 `.tag-bar` 的 chips（含“全部”）。点 chip 给不匹配的 `.photo` 加 `.is-hidden`。无标签时隐藏 `.tag-bar`。

### 4.7 3D 悬浮（纯 CSS+JS，无依赖）
- 样式：`.photo-card` 的 `transform: perspective(700px) rotateX(var(--rx)) rotateY(var(--ry)) translateZ(var(--tz)) scale(var(--sc))`。
- JS：`initTilt()`——`pointermove` 按指针相对中心算 `--rx`（纵向，给 rotateX）、`--ry`（横向，给 rotateY），限幅 `MAX`（**§6**）。`pointerleave` 清零。
- hover：CSS 设 `--tz`（Z 轴推出，看着更近/更大）+ `--sc`（再放大）。
- `prefers-reduced-motion`：`transform:none`，仅保留 `translateY(-2px)`。

### 4.8 拍摄日期角标
- `.date-badge`，绝对右上角，`--theme-transparent` 底 + `backdrop-filter:blur`。日期来自 EXIF `DateTimeOriginal`，partial 已清理成 `2006-01-02`。

### 4.9 i18n
- `i18n/zh.yaml`+`en.yaml` 的 `gallery_*` key。模板用 `{{ i18n "..." }}`。JS 经隐藏的 `<span id="gallery-i18n" hidden data-...>` 注入（用 `dataset` 读，避开 Hugo `jsonify` 双重编码）。

### 4.10 深色模式
- 全用站点 CSS 变量（`--primary`/`--secondary`/`--tertiary`/`--entry`/`--border`/`--theme`/`--code-bg`/`--radius`/`--gap`/`--theme-transparent`），`.dark` 自动覆盖。

### 4.11 空状态
- `.gallery-empty` + `gallery_empty` 文案。列表页无相册时、详情页无照片时显示。

### 4.12 EXIF 信息
- 灯箱 description 里的 `.gl-exif`，字段标签走 i18n。`data-exif` 存 JSON，JS `JSON.parse`。EXIF 由 partial 从图片自动读取，映射见 §3。

---

## 5. i18n key 参考

| key | zh | en |
|---|---|---|
| `gallery_all_photos` | 全部图片 | All Photos |
| `gallery_view` | 视图 | View |
| `gallery_view_albums` | 相册 | Albums |
| `gallery_filter` | 筛选 | Filter |
| `gallery_all_tags` | 全部 | All |
| `gallery_photos_count` | `{{ . }} 张` | `{{ . }} photos` |
| `gallery_album` | 来自相册 | Album |
| `gallery_exif_camera` | 相机 | Camera |
| `gallery_exif_lens` | 镜头 | Lens |
| `gallery_exif_aperture` | 光圈 | Aperture |
| `gallery_exif_shutter` | 快门 | Shutter |
| `gallery_exif_iso` | ISO | ISO |
| `gallery_exif_focal` | 焦距 | Focal Length |
| `gallery_empty` | 还没有照片，敬请期待。 | No photos yet — check back soon. |

---

## 6. 可调参数（迭代时改这里）

| 想调 | 改哪里 | 现值 |
|---|---|---|
| 3D 倾角上限 | `static/js/gallery.js` `var MAX = 14;` | 14° |
| hover Z 轴推出/放大 | `gallery.css` `.photo:hover .photo-card { --tz: 28px; --sc: 1.06; }` | 28px / 1.06 |
| 堆叠 hover 展开范围 | `gallery.css` `.album-stack:hover .stack-img:nth-child(N)` 的 translate/rotate | 两侧 ±88px/13°，顶上 -44px |
| 瀑布流列数 | `gallery.css` `.photo-grid { columns: 3; }` + 媒体查询 | 3/2/1 |
| 模糊预览模糊量 | `gallery.css` `.photo-blur { filter: blur(18px) ...; transform: scale(1.12); }` | 18px / 1.12 |
| 淡入时长 | `gallery.css` `.photo-blur`/相关 `transition: opacity .45s ease` | .45s |
| 视图开关默认 | `gallery.js` `initViewToggle` 的 `initial`（`albums` 默认） | albums |
| 每相册堆叠取几张 | `list.html` `range first 4 $photos` | 4 |
| 缩略图宽度 | `layouts/partials/gallery/photos.html` `.Resize "800x q80"` | 800px / q80 |
| LQIP 宽度 | `layouts/partials/gallery/photos.html` `.Resize "32x q20"` | 32px / q20 |

---

## 7. 怎么加一个新相册

1. 建目录 `content/gallery/<album>/`。
2. 把图片（JPEG/PNG/WebP，**带 EXIF** 更好）丢进去，文件名前缀控序（`01.jpg`、`02.jpg`…）。
3. 建 `content/gallery/<album>/index.md`（中文）+ `index.en.md`（英文），只写相册级 front matter：
   ```yaml
   ---
   title: "新相册名"
   date: 2025-01-01
   description: "一句话描述"
   ShowBreadCrumbs: true
   photos: true
   ---
   可选导言正文。
   ```
4. （可选）`meta.yaml` 给个别图加 `title`/`caption`/`tags`。手写或用脚本脚手架：
   ```bash
   python3 scripts/gallery_meta.py content/gallery/<album>   # 单个相册
   python3 scripts/gallery_meta.py                            # 所有相册
   ```
   脚本给每张图补一个**空**条目（空=回退到 EXIF `ImageDescription`/文件名，caption/tags 省略）；你只填想覆盖的那几行。**已填的条目永不改动**，只追加新图的空条目；删图后旧条目保留并提示 stale（不自动删，防丢数据）。幂等，可重复跑。详见 §3。
5. `hugo server` 看效果。缩略图/LQIP/EXIF/日期全自动；相册自动出现在 `/gallery/` 的两个视图里。

> 不写 `meta.yaml` 也行：标题回退到 EXIF `ImageDescription`/文件名，EXIF 与日期仍自动来自图片。
> 真 JPEG 替换 demo：删 `content/gallery/demo-trip/` 里的 `.jpg` 即可，相册页退化为空状态（不会报错）。
> 图片务必在页面包内（`content/gallery/<album>/`），**不能**放 `static/`——Hugo 不处理 `static/` 图，无法生成缩略图/读 EXIF。

---

## 8. 构建 / CI 注意

- **`security.allowContent: ['.*']`**（`config.yml`）：Hugo 0.162+ 默认拒绝 `text/html` 内容文件（会挡 `content/WoodBlock/WoodBlock.html`，连带整个构建失败）。这项是官方放行写法，保持 CI 用 `hugo-version: latest` 不用钉版本。
- **CI 用 `extended: true`**（`.github/workflows/minify_and_deploy.yml:44`，`peaceiris/actions-hugo@v2`）——图像处理（`.Resize`/`.Exif`）只在 extended 版可用，生产部署无阻塞。
- GLightbox 走 jsdelivr CDN，已在 CSP `cdn.jsdelivr.net` 白名单；`markup.goldmark.renderer.unsafe: true`。
- `gallery.js` 经 `defer` 在 GLightbox 之后执行（document order）。
- Hugo 按内容哈希缓存 `.Resize` 结果，多视图（single + list 两个视图）复用同一图不重复处理；首构建略重，增量快。

---

## 9. 已知限制 / 可迭代方向

- **`meta.yaml` 单语言**：per-photo 的 `caption`/`tags`/`title` 覆盖不分语言（中英站点共用一个 `meta.yaml`）。要 per-language 可改成 `meta.zh.yaml`/`meta.en.yaml` 在 partial 里按语言查找。
- **灯箱用原图**：`data-src` 指向全尺寸原图，大图流量高。可加一个 1600px “大图”变体（`.Resize "1600x q85"`）给灯箱用。
- **图排序按文件名**（01,02…），非 EXIF 日期。以后可在 partial 里按 `DateTimeOriginal` 排序。
- **不支持外部/CDN 图**：自动路径只处理页面包内图（本地）。要外链图相册，可给 `gallery/photos` partial 加 fallback 分支，读回旧式 `photos:` 数组（图存 `static/` 或 CDN，无自动缩略/EXIF）。
- **全部图片视图不分页**：图多时一次性渲染。可加分页或虚拟滚动。
- **堆叠缩略图未上 blur-up/3D**：相册卡的 `.stack-img` 只有 `loading=lazy`，没套渐进加载（量少、是导航场景）。要的话可按 `.photo-card` 同款结构套一层。
- **视图切换瞬态**：若 localStorage 记的是 `all`，首屏极短“相册”闪现再切到 `all`（JS 在 DOMContentLoaded 切换）。可接受；要消除可用内联早切脚本。
