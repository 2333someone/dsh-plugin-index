启用 DeepSeek Harness 的「自定义插件市场」后，在 发现 左上角添加索引源 中粘贴下方地址即可使用😋

```text
https://polang233.github.io/dsh-plugin-index/index.json
```

# Open Plugin Market

<img src="site/logo-256.png" alt="Open Plugin Market" width="96" align="right">

[![Plugins](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fpolang233.github.io%2Fdsh-plugin-index%2Findex.json&query=%24.plugins.length&label=plugins&color=2563eb)](https://polang233.github.io/dsh-plugin-index/index.json)
[![Stars](https://img.shields.io/github/stars/polang233/dsh-plugin-index?style=flat&color=eab308)](https://github.com/polang233/dsh-plugin-index/stargazers)
[![Refresh](https://img.shields.io/badge/refresh-every_6h-0f766e)](.github/workflows/publish.yml)
[![Checks](https://github.com/polang233/dsh-plugin-index/actions/workflows/publish.yml/badge.svg)](https://github.com/polang233/dsh-plugin-index/actions/workflows/publish.yml)

DeepSeek Harness（DSH）的社区插件索引，在应用内搜索、筛选并安装插件。

[English](README.en.md) · [浏览目录](https://polang233.github.io/dsh-plugin-index/zh/) · [提交插件](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml)

![在 DSH 中浏览和安装插件](docs/images/market-in-dsh.png)

## 浏览与安装

- **智能推荐**兼顾近期维护、分类和开发者曝光，定期轮换；也可按 star、下载量或随机资源排序。
- 列表显示 **★ GitHub star、↓ 下载量档位、◷ 更新天数**，读取插件作者随包发布的 Logo。
- 点开条目查看版本与来源，点击安装后由 DSH 确认兼容性并执行安装。

索引每六小时更新，DSH 缓存约十分钟，可手动刷新。[指标说明](docs/market-display.md) · [包检查记录](https://polang233.github.io/dsh-plugin-index/status.json)

每次构建核对发布包完整性、包名、版本、组合包声明和入口，再通过官方索引格式校验。包检查不等同于完整运行测试，具体实测见[测试记录](docs/plugin-review-2026-10-18.md)。

## 提交插件

[提交收录申请](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml)，或修改 [sources.json](sources.json) 提交 PR。提供公开源码、可安装的发布版本和简短介绍，详见[收录要求](CONTRIBUTING.zh-CN.md)。

欢迎为插件添加独立 Logo 并随 npm 包发布。满足收录要求时，我们会优先审核和收录带 Logo 的插件；已收录插件也欢迎更新图标。

## 开发

Node.js 24+、pnpm 11.28.5。运行 `pnpm install --frozen-lockfile --ignore-scripts` 安装依赖，`pnpm test` 检查，`pnpm build` 构建，`pnpm validate` 校验。

[维护说明](docs/maintenance.zh-CN.md) · [贡献指南](CONTRIBUTING.zh-CN.md) · [MIT](LICENSE)

独立社区项目，与 DeepSeek 官方无隶属关系。插件版权及许可证归各自作者所有。
