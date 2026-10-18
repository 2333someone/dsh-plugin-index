<p align="center">
  <img src="site/logo.png" alt="DSH Plugin Index 项目 Logo" width="160" height="160">
</p>

# DSH Plugin Index

DeepSeek Harness 的社区插件索引。添加一个地址，即可在 DSH 内浏览和安装插件。

[浏览插件](https://polang233.github.io/dsh-plugin-index/zh/) · [English](README.md) · [提交插件](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml)

## 添加到 DSH

```text
https://polang233.github.io/dsh-plugin-index/index.json
```

1. 在 DSH 中打开 **插件 → 发现 → 添加索引源**。
2. 粘贴上面的地址并保存。
3. 选择插件，确认版本和来源后安装。

没有「发现」入口时，先启用 DSH 自带的「自定义插件市场」组合包。DSH 会检查版本兼容性；不支持当前版本的插件可能无法安装。

## 收录内容

涵盖界面工具、技能、记忆、模型供应商、用量统计、外部服务和主题。每个条目提供中英文介绍、源码链接和明确的 npm 版本。

目录显示 GitHub star，点击可查看仓库关注者；DSH 内也支持按 star 排序。数据随构建更新，请求失败时保留带日期的近期缓存，无法获取时不显示为 0。

每次构建都会检查发布包的完整性、包名与版本、组合包补丁及声明的入口文件，再使用 DSH 官方校验器验证索引格式。这些检查不等同于安装测试或代码审计。[查看检查记录和更新时间](https://polang233.github.io/dsh-plugin-index/status.json)。

每六小时更新一次。构建失败时保留已发布的索引。DSH 默认缓存十分钟，也可手动刷新。

[近期插件测试记录](docs/plugin-review-2026-10-18.md) · [目录发现与核查](docs/directory-discovery-2026-10-18.md)

## 参与维护

可以[提交插件](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml)、报告失效条目，或直接修改 [sources.json](sources.json) 提交 PR。收录要求见[贡献指南](CONTRIBUTING.zh-CN.md)。

## 本地开发

需要 Node.js 24+ 和 pnpm 11.28.5：

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm build
pnpm validate
pnpm preview
```

`pnpm build` 获取插件并在 `public/` 生成索引与中英文页面。只修改网站时，可用 `pnpm build:site` 基于现有快照生成页面，无需重新下载插件。

[维护与部署](docs/maintenance.zh-CN.md) · [Maintenance](docs/maintenance.md)

## 许可证

项目采用 [MIT](LICENSE) 许可证，收录插件保留各自的许可证。

独立社区项目，与 DeepSeek 官方无隶属关系。
