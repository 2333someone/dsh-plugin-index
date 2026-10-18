# Market metrics and publisher labels / 市场指标与身份标签

The index appears in DSH as **Open Plugin Market / 开放插件市场**. Its URL stays the same.

DSH 列表的描述行以指标开头，例如：`★ 1,138 · ↓ 2,231/30天 · 18 天前更新 — 插件介绍`。网页将这些数据放在条目侧边，保留完整介绍。

| 指标 / Metric | 来源与含义 / Source and meaning |
| --- | --- |
| ★ star | GitHub 仓库的 star 数。同一仓库的多个插件共享这个数值。 / Repository stars; plugins in a monorepo share the count. |
| ↓ /30天 /30d | [npm 官方下载 API](https://github.com/npm/registry/blob/main/docs/download-counts.md) `last-month`，最近 30 个可用统计日的包下载次数。覆盖该包全部版本。 / Downloads across all versions during the last 30 available days. |
| N 天前更新 / Updated N days ago | 索引所收录版本的 `publishTimestamp` 至指标生成时间的完整天数。 / Whole days since the listed version was published. |
| 身份标签 / Identity label | [publishers.json](../publishers.json) 中逐项核查的包名、仓库与公开来源。 / Reviewed exact package and repository bindings with public evidence. |

npm 下载次数包含自动化请求，不能作为 DSH 安装人数。公司标签注明公司名称，开发者标签注明其代表项目。第三方适配不会仅因名称中出现某家公司就获得官方标签。

Downloads include automated requests and do not measure DSH users. A company label names the company; a developer label names a reviewed representative project. A third-party integration does not inherit an official label from its name.

`github.json` 和 `downloads.json` 保存原始数值、获取时间和统计区间；`display.json` 保存原始介绍与 DSH 描述前缀。暂时失败时，可沿用七天内的缓存并显示原获取日期。npm 成功数据可复用四小时，获取日期不变。缺失数据省略，真实的 0 保留。指标与天数随索引构建刷新。

Snapshots record source values and dates. A failed request can use a cache up to seven days old, visibly marked with its original date. Successful npm readings may be reused for four hours without changing their fetch date. Missing readings are omitted; measured zero remains zero. Metrics and release ages refresh when the index is built.

## DSH 展示约定 / DSH display contract

依据 [DSH 官方列表组件](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-plugin-market/src/client/DiscoverSection.tsx)：列表会渲染 `description`、声明过的 `metadata.labels`，索引菜单读取 `title`。数值指标因此使用描述前缀；身份使用标签。筛选菜单只含少量身份标签。

The official Discover component renders the description and declared labels, and resolves the index title for its source menu. Metrics use a description prefix; identities use labels. This keeps numeric readings out of the label filter menu.

客户端版本与作者下方的日历日期由 DSH 固定格式化，索引无法替换；因此另外显示相对天数，并保留真实的发布时间。

DSH formats the calendar date beneath each row itself. The index adds relative days and preserves the actual publication timestamp.

## 验证记录 / Validation

2026-10-18：320 个条目的下载数均成功获取；5 个身份标签，包括腾讯云开发、火山引擎、腾讯 QQ、NanmiCoder 和 Archify 作者。当前条目数和数据状态以线上快照为准。

本轮复用已有发布包检查记录，只刷新指标与展示，没有重新执行插件安装测试。新增测试覆盖未知值、真实零值、缓存日期、身份与仓库绑定、官方索引解析及发布后可见指标的一致性。

另用真实 React 18.3.1 静态渲染官方发布的 `@deepseek-ai/dsh-client-ui-plugin-market@0.2.1-rc.2` 中 `EntryCard`，确认中英文指标和公司标签可见，并检查 `indexLabel` 解析的新名称。测试使用隔离条目数据，复用官方 Button、Tag 实现，样式宿主与类名连接为测试夹具。发布包 `lib/client.js` SHA-256：`e961988dd984dc527b0bfeed37f6ae45b4a72392a2eb21676350359d8a127a60`。这是组件静态渲染检查，未作为 DSH 桌面端实机验收。

Package checks from the previous build were reused for this metadata refresh; no additional plugin installation tests were performed. An isolated static React render of the published official EntryCard verified both languages and the company label, while `indexLabel` resolved the new name. This is a component check, not a desktop integration test.
