# Market metrics / 市场指标

The index appears in DSH as **Open Plugin Market / 开放插件市场**. Its URL stays the same.

直接添加默认索引时，DSH 在插件名称旁显示下载量与更新天数的原生描边标签，例如 `↓ 2.3k+`、`◷ 18 天前更新`。介绍行显示 `★ 1,138 │ 插件介绍`，无需加载增强插件。版本、作者和完整日期沿用 DSH 自带的下方信息行。网页仍将精确指标放在介绍下方，版本收进「详情」。

下载量按档位向上取整，例如 `525 → 600+`、`1569 → 1.6k+`、`107548 → 110k+`。低于一千保留一位有效数字，一千及以上保留两位，使用 `k`、`m`、`b` 缩写，真实零值仍为 `0`。这里的 `+` 标记近似档位，精确值保存在 `downloads.json` 并用于排序。相近下载量共用标签，star 不进入标签筛选菜单。

Download tags use upward-rounded buckets, with one significant digit below 1,000 and two above, for example `525 → 600+`, `1,569 → 1.6k+`, and `107,548 → 110k+`. Zero stays zero. The `+` marks an approximate bucket; exact readings remain in the download snapshot, website and sort keys. Stars precede descriptions and create no filter tags.

| 指标 / Metric | 来源与含义 / Source and meaning |
| --- | --- |
| ★ star | GitHub 仓库的 star 数。同一仓库的多个插件共享这个数值。 / Repository stars; plugins in a monorepo share the count. |
| ↓ 下载量 / Downloads | [npm 官方下载 API](https://github.com/npm/registry/blob/main/docs/download-counts.md) `last-month`，最近 30 个可用统计日的包下载次数。覆盖该包全部版本。 / Downloads across all versions during the last 30 available days. |
| N 天前更新 / Updated N days ago | 索引所收录版本的 `publishTimestamp` 至指标生成时间的完整天数。 / Whole days since the listed version was published. |

npm 下载次数包含自动化请求，不能作为 DSH 安装人数。

Downloads include automated requests and do not measure DSH users.

`github.json` 和 `downloads.json` 保存原始数值、获取时间和统计区间；`display.json` 保存原始介绍与指标文本。暂时失败时，可沿用七天内的缓存并显示原获取日期。npm 成功数据可复用四小时，获取日期不变。缺失数据省略，真实的 0 保留。指标与天数随索引构建刷新。

Snapshots record source values and dates. A failed request can use a cache up to seven days old, visibly marked with its original date. Successful npm readings may be reused for four hours without changing their fetch date. Missing readings are omitted; measured zero remains zero. Metrics and release ages refresh when the index is built.

## DSH 展示约定 / DSH display contract

依据 [DSH 官方列表组件](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-plugin-market/src/client/DiscoverSection.tsx)：列表会渲染 `description`、声明过的 `metadata.labels`，索引菜单读取 `title`。下载档位与更新天数使用原生标签。相同档位与状态共用声明，每次构建移除过期声明。只要有标签，DSH 就显示「标签」筛选按钮，索引不能单独隐藏该按钮。标签按当前语言的标题排序，下载标签位于更新标签前；位置和描边样式由客户端固定。

The official Discover component renders the description and declared labels, and resolves the index title for its source menu. Download buckets and release ages use native outline tags beside titles. All tags also appear in the label filter menu, sorted by localized title, with download tags before release ages. The index cannot hide that menu while retaining labels. Identical buckets share declarations, and old readings are removed on rebuild.

普通索引无法隐藏 DSH 自带的列表版本与日历日期，也无法指定标签颜色或把标签固定移到介绍下方。HTML 与 Markdown 不会在介绍行渲染，换行不能突破客户端的单行限制。

DSH formats the calendar date beneath each row itself. The index adds relative days and preserves the actual publication timestamp.

2026-10-18 原生标签验证：62 项单元测试和 14 项浏览器回归通过。未加载增强插件的隔离 DSH 0.2.1-rc.2 实例显示首批 50 条原生列表，指标在名称旁、介绍保持纯文本，详情保留版本和日期，安装确认使用精确 npm 版本与 registry，检查后取消安装。该次快照共 518 个筛选标签；后续数值变化会改变去重后的标签数量。这是完整 DSH 隔离实例检查，不是用户桌面窗口验收。

同日下载档位调整：64 项单元测试和 14 项浏览器回归通过。隔离 DSH 实例确认下载标签在更新标签前，star 在介绍前且以 `│` 分隔；该次快照的筛选标签减少为 179 个。选择 `↓ 11k+` 能筛出对应的 8 个插件，清除筛选后恢复列表。详情与安装确认再次通过，未实际安装第三方插件。精确下载数和排序值保持原始读数。

## 独立显示增强包 / Separate display enhancement

当前默认索引使用原生标签。增强包 0.1.1 识别的是此前的描述指标前缀，不会改写当前原生标签布局。以下安装入口保留供该前缀格式使用。

Version 0.1.1 recognizes the earlier description-prefix format. The current native-tag index works independently and retains its native layout.

增强包索引入口：

```text
https://polang233.github.io/dsh-plugin-index/enhancements.json
```

使用描述前缀格式的索引时，可选择「开放插件市场 · 显示增强」，安装「市场列表彩色指标」，再切回该索引。启用后，指标在描述下方同一行显示：蓝色 star、绿色下载、灰紫色 `◷` 更新天数。列表版本和日历日期收起，作者保留；点击条目详情仍有版本与完整日期。停用插件恢复原始显示。

For an index using description prefixes, add the source above, install “Market listing metric tags”, then return to that market. The plugin moves blue star, green download and muted purple update tags below descriptions. Versions and full dates remain in details. Disabling the plugin restores the original row.

插件通过 DSH 客户端生命周期监听「发现」列表 DOM，仅处理明确的指标前缀，不请求额外网络。保留原生节点及安装按钮；筛选、分页、语言切换后自动重绘。它适配 0.2.1-rc.2 的列表结构，未来客户端结构变化时会保留原生显示。[源码](../packages/market-listing-ui/src/client.mjs)。

验证包含官方组件产生的 DOM、浏览器中的重绘与停用恢复、旧版前缀兼容和官方 Git 安装参数解析。2026-10-18 已通过官方 CLI 安装到本机 desktop 配置，用户截图确认彩色标签已生效；Windows 自动化助手启动失败，因此交互检查使用另外运行的隔离 DSH 0.2.1-rc.2 实例：默认 index 加载 50 条列表、150 个指标标签，详情保留版本及日期，安装确认正确显示精确 npm 版本和 registry。检查后取消第三方插件安装。

增强插件 0.1.1 使用 `engines.dsh` 声明兼容范围，安装时无需额外拉取 DSH 作为 peer 依赖。Git 子目录源已通过原生进程参数安装验证；Windows `.cmd` 包装器可能截断未保留引号的 `&`，命令行安装应使用原生参数数组或由 DSH 的安装界面发起。

## 验证记录 / Validation

当前条目数、指标标签和数据状态以线上快照为准。

本轮复用已有发布包检查记录，只刷新指标与展示，没有重新执行插件安装测试。新增测试覆盖未知值、真实零值、缓存日期、身份与仓库绑定、官方索引解析及发布后可见指标的一致性。

另用真实 React 18.3.1 静态渲染官方发布的 `@deepseek-ai/dsh-client-ui-plugin-market@0.2.1-rc.2` 中 `EntryCard`，确认中英文指标和公司标签可见，并检查 `indexLabel` 解析的新名称。测试使用隔离条目数据，复用官方 Button、Tag 实现，样式宿主与类名连接为测试夹具。发布包 `lib/client.js` SHA-256：`e961988dd984dc527b0bfeed37f6ae45b4a72392a2eb21676350359d8a127a60`。这是组件静态渲染检查，未作为 DSH 桌面端实机验收。

Package checks from the previous build were reused for this metadata refresh; no additional plugin installation tests were performed. An isolated static React render of the published official EntryCard verified both languages and the company label, while `indexLabel` resolved the new name. This is a component check, not a desktop integration test.
