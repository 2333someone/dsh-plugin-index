# 指标、标签与推荐 / Metrics, labels and recommendations

## 列表里显示什么

每行介绍前显示 GitHub star：`★ 1,138 │ 插件介绍`。名称旁是 DSH 原生标签，全部来自下表这一组固定 id，筛选菜单不会随下载量变化而膨胀：

| 标签 id | 中文 / English | 条件 |
| --- | --- | --- |
| `verified` | ✅ 经过验证 / Verified | 被其他市场的人工或源码级验证收录，见下文 |
| `trending` | 🔥 增长快 / Rising | 近 7 天下载 ≥ 30 且达到此前周均值的 1.5 倍；或近 7 天新增 star ≥ 5 且增幅 ≥ 10% |
| `active` | ⚡ 更新勤 / Frequent updates | 近 30 天发版 ≥ 15 次（约前 20%） |
| `updated-recent` / `-week` / `-month` / `-quarter` | ◷ 最近 / 本周 / 本月 / 三个月内更新 | 收录版本发布于 3 / 7 / 30 / 90 天内 |
| `downloads-100k` … `downloads-100` | ↓ 10万+ / 5万+ / 1万+ / 5000+ / 1000+ / 500+ / 100+ | npm 近 30 天下载量档位 |
| `publisher-*` | 官方身份 | 经核查的发布者，见 `data/publishers.json` |

精确数值保存在 `downloads.json`、`github.json` 和 `display.json`（含每个插件的 `signals`），并写入排序键。数据暂时取不到时沿用最近一次读数，标签里不出现缓存日期。

## 排序

DSH 的排序菜单固定包含「默认排序」和「发布时间」，索引无法去掉；索引声明的排序项按标题的字母或拼音顺序排在后面。

- **默认排序**（DSH 打开时的顺序，即索引顺序）：偏重热度和可信度。下载量 32%、star 28%、有 Logo 15%、经过验证 10%（只被大列表收录记 5%）、近期维护 10%、每周轮换 5%。同一开发者连续出现会降权。
- **✨ 智能推荐**：以增长和活跃为主。近期维护 25%、下载增长 12%、star 增长 10%、发版频率 8%、新上架 7%、最近发布 7%、经过验证 8%、下载量 10%、star 8%、每周轮换 5%。同一开发者、同一分类连续出现会降权。标题带 ✨，排在自定义排序项的第一位。
- **近 7 天新增 star**：需要至少 6 天的 star 历史。
- **GitHub 星标数**。
- **随机资源**：每次构建（约 6 小时）重新打乱一次。索引是静态文件，DSH 按其中的数值排序，所以做不到每次切换都换一批。
- 归档的仓库在所有排序里都沉底。

## 验证来源

| 来源 | 作用 | 匹配方式 |
| --- | --- | --- |
| [awesome-deepseek-harness-plugins](https://github.com/walkinglabs/awesome-deepseek-harness-plugins) | 「经过验证」标签 | 源码级 DSH 插件验证加静态安全检查后才收录；按 GitHub 仓库匹配 |
| [dsh-plugin-shop](https://github.com/LivXue/dsh-plugin-shop) `registry/verified.yml` | 「经过验证」标签 | 人工审核；绑定仓库或精确的 npm 版本 |
| [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) | 只影响排序 | 审核后收录，但覆盖了本索引六成以上的插件，单独作为标签区分度不够 |

快照保存在 `endorsements.json`，读取失败时沿用 14 天内的上一次结果。被收录只说明对方做过审核，不代表本索引做了代码审计。

## 来源

| 指标 | 来源 |
| --- | --- |
| ★ star、最近推送、star 增长 | GitHub 公开 API，同一仓库的多个包共享；每天记录一次 star，保留 35 天 |
| ↓ 下载量、增长 | [npm downloads range API](https://github.com/npm/registry/blob/main/docs/download-counts.md) `last-month` 的逐日数据 |
| 发版频率、首次发布 | npm registry 的 `time` 字段 |

npm 下载量包含 CI 和镜像等自动请求，只能反映趋势，不等于 DSH 用户数。

---

**English.** Rows show `★ stars │ description` plus a fixed set of native labels: Verified, Rising (downloads or stars), Frequent updates, four update-age buckets, seven download tiers, and verified publishers. The *Default* (index) order favors downloads, stars, a logo and verification. *✨ Smart picks* weights momentum (maintenance, download and star growth, releases, newness) most, then verification by other markets, downloads and stars, and spreads exposure across developers and categories. Exact readings live in `downloads.json`, `github.json` and `display.json`. Fallback readings never add cache dates to labels.
