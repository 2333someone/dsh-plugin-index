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

## 更新收录

未指定 `version` 时跟踪 npm `latest`；指定后固定为该版本。生成器最多并发读取四个来源，并重试临时网络错误。下载限于公共 npm registry，不执行被收录插件的代码。全部来源与官方校验器通过后才允许发布。

目前每个插件提供一个版本。兼容范围来自 `engines.dsh`，缺失时取 DSH peer dependencies 的交集。没有约束表示作者未声明范围，不代表已验证兼容。

构建失败时查看 Actions 日志，修正来源或连接问题后重新运行。撤回或停止维护的插件通过修改收录列表移除，不会在生成过程中被悄悄跳过。

## GitHub Pages

1. 在 **Settings → Pages** 中选择 **GitHub Actions**。
2. 设置仓库变量 `PUBLISH_INDEX=true`。
3. 在 `main` 分支运行 **Check and publish index**。

工作流先运行单元测试、构建目录、使用 Chromium 检查中英文网站并校验官方格式，再上传 Pages 产物。部署后会检查线上索引地址。PR 不触发部署。

定时任务每六小时触发，GitHub 可能延迟任务或暂停不活跃仓库的计划；实际更新时间以线上 `status.json` 为准。定时任务直接部署产物，不自动提交代码；仓库内快照由维护者随改动提交。

公开索引必须直接返回 200 JSON，不能依赖重定向：

```sh
node scripts/validate.mjs https://polang233.github.io/dsh-plugin-index/index.json
```

DSH 默认缓存十分钟。未来绑定自有域名时，要同时更新网站地址、canonical 元数据、sitemap、复制按钮目标和文档，再校验最终 JSON 地址。

## 检查范围

每个版本检查 SHA-512、包名与版本、组合包补丁及声明的 `main` 文件；记录源码地址、声明的许可证和安装生命周期脚本名称。不检查所有补丁引用、不解析完整依赖、不执行安装，也不做代码审计。

官方校验器固定为 `@deepseek-ai/dsh-plugin-market-index@0.2.1-rc.2`。升级时应重新运行测试，并在目标 DSH 版本中验证接入。协议细节见[官方格式说明](https://deepseek-harness.github.io/deepseek-harness/en/guide/plugin-market)和[参考生成器](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/plugin-market-generator)。
