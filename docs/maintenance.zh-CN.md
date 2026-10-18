# 维护与部署

[English](maintenance.md)

## 构建与测试

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm build
pnpm validate
pnpm exec playwright install chromium
pnpm exec playwright test
```

本机已有 Chrome 或 Chromium 时，可设置 `BROWSER_EXECUTABLE` 为浏览器路径，省去下载。浏览器测试会自动启动和关闭本地预览服务。

- `sources.json`：收录列表、中英文介绍和分类。
- `scripts/lib.mjs`：发布源和归档检查、兼容范围、索引生成。
- `scripts/site.mjs` 与 `site/`：中英文页面。
- `public/index.json`：DSH 格式 1 索引。
- `public/status.json`：生成时间和逐包检查记录。

仅修改页面时运行 `pnpm build:site`，再用 `pnpm preview` 访问 `http://127.0.0.1:4173/dsh-plugin-index/`。

仅刷新指标、市场名称和作者身份时运行 `pnpm build:metadata`。它保留已检查的包版本与原始包检查时间；收录列表或固定版本改变时会要求完整构建。`publishers.json` 记录身份依据，`public/downloads.json` 与 `public/display.json` 记录下载数据和 DSH 展示内容。指标含义与客户端限制见[市场指标与身份标签](market-display.md)。

## 更新收录

未指定 `version` 时跟踪 npm `latest`；指定后固定为该版本。生成器最多并发读取四个来源，并重试临时网络错误。下载限于公共 npm registry，不执行被收录插件的代码。全部来源与官方校验器通过后才允许发布。

目前每个插件提供一个版本。兼容范围来自 `engines.dsh`，缺失时取 DSH peer dependencies 的交集。没有约束表示作者未声明范围，不代表已验证兼容。

构建失败时查看 Actions 日志，修正来源或连接问题后重新运行。撤回或停止维护的插件通过修改收录列表移除，不会在生成过程中被悄悄跳过。

## 经核查的源码补充

发布包缺少 `repository` 时，维护者只有在确认该 npm 归档与上游发行对应后，才能添加 `repositoryReview`。条目必须固定 `version`，核查记录绑定相同版本、npm SHA-512、规范 GitHub 地址和不可变源码提交。版本或哈希变化、发布包声明的仓库冲突都会让构建失败。`status.json` 用 `repositorySource: "review"` 与 `"package"` 区分来源，并链接核查的源码清单。这类插件升级需要重新核查，不自动跟随 `latest`。

首个条目的[Taskboard 来源记录](taskboard-review.md)包含 npm 与 GitHub 发行资产的相同哈希。

## 经核查的大包预算

普通下载时限为每次 30 秒，完整 tar 解压流上限为 100 MiB。大型包只有固定版本并匹配 npm 完整性哈希，才能声明 `archiveReview`，最多使用每次 120 秒和 256 MiB。下载总共最多尝试三次。压缩下载仍限 64 MiB；包清单和单条 tar 扩展元数据均限 1 MiB；包括 PAX/GNU 扩展头在内最多 20,000 条目。解压字节预算包含头部、元数据、对齐及尾部内容。解析器只保留清单、文件名与受限显示文件，不落盘解包。`status.json` 各包的 `archive` 字段同时记录声明载荷 `unpackedBytes` 和完整解压流 `decodedBytes`。

[Univer Office 归档核查](univer-archive-review.md)记录实测大小和预算；版本或哈希变化需要重新核查。

## 插件图标与本地化

构建读取已通过 SHA-512 校验的发布包，从清单的 `icon` 或导出的 `./icon` 查找 SVG、PNG、JPEG 或 WebP，最多 256 KiB。图片保存在 `public/icons/`，以内容哈希命名；官方 `icon` 字段使用相对路径，DSH 按索引地址解析。网页使用同一图片。没有图标时显示名称首字，缺失、过大或不支持的图标记入 `status.json` 的 `display.warnings`。

作者提供的 `locale/en.json` 和同目录中文文件用于名称与介绍；`sources.json` 中的编辑文案优先。归档读取只额外保留这些受限文件，不解包、不执行插件。源图片保持原样，SVG 必须是无外部资源和主动内容的图片。

本地预览端口被占用时，可为预览和浏览器测试同时设置 `DSH_INDEX_PREVIEW_PORT`。

## GitHub star

每次构建对同一仓库只请求一次 GitHub 公开 API，并生成 `public/github.json`，记录准确的 star 数、获取时间和最近推送时间。计数同时写入官方索引的 `github-stars` 排序字段，DSH 内也可以据此排序。

GitHub Actions 使用只读 `GITHUB_TOKEN`。本地可设置 `GITHUB_TOKEN` 或 `GH_TOKEN`，未设置时使用 GitHub 的匿名限额。凭据只用于 `api.github.com` 请求，不写入快照，浏览器也不直接请求 GitHub API。

请求失败时，最多保留七天内成功获取的计数，保留原始时间并标为 `stale`；超过七天或从未获取的计数标为 `unavailable`，不显示为 0。非 GitHub 仓库不提供 GitHub star。Actions 会跨构建保存 `.cache/github.json`，仓库中的公开快照作为备用。Star 反映仓库关注度，不代表测试覆盖率或插件质量。

## GitHub Pages

1. 在 **Settings → Pages** 中选择 **GitHub Actions**。
2. 设置仓库变量 `PUBLISH_INDEX=true`。
3. 在 `main` 分支运行 **Check and publish index**。

工作流先运行单元测试、构建目录、使用 Chromium 检查中英文网站并校验官方格式，再上传 Pages 产物。部署后核对完整收录集合、逐包检查记录、两种语言页面、所有引用图标的内容哈希与项目品牌图片，全部请求禁止重定向。PR 不触发部署。

定时任务每六小时触发，GitHub 可能延迟任务或暂停不活跃仓库的计划；实际更新时间以线上 `status.json` 为准。定时任务直接部署产物，不自动提交代码；仓库内快照由维护者随改动提交。

公开索引必须直接返回 200 JSON，不能依赖重定向：

```sh
node scripts/validate.mjs https://polang233.github.io/dsh-plugin-index/index.json
pnpm check:published
```

DSH 默认缓存十分钟。未来绑定自有域名时，要同时更新网站地址、canonical 元数据、sitemap、复制按钮目标和文档，再校验最终 JSON 地址。

## 检查范围

每个版本检查 SHA-512、包名与版本、组合包补丁及声明的 `main` 文件；记录源码地址、声明的许可证和安装生命周期脚本名称。不检查所有补丁引用、不解析完整依赖、不执行安装，也不做代码审计。

官方校验器固定为 `@deepseek-ai/dsh-plugin-market-index@0.2.1-rc.2`。升级时应重新运行测试，并在目标 DSH 版本中验证接入。协议细节见[官方格式说明](https://deepseek-harness.github.io/deepseek-harness/en/guide/plugin-market)和[参考生成器](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/plugin-market-generator)。
