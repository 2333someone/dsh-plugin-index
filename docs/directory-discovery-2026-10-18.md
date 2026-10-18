# Directory discoveries / 目录核查 · 2026-10-18

Candidates were found through [DSH Marketplace](https://dshmarketplace.dev/) and [dsh-plugin.org](https://dsh-plugin.org/plugins), then checked against GitHub and npm. Counts below are GitHub observations around 05:30 UTC, not the directories' cached counts.

候选来自两个社区目录，再回到 GitHub 和 npm 核对。下列 star 为当日约 05:30 UTC 的 GitHub 数据，不沿用目录缓存值。

## ModSearch · 739 stars

[Source / 源码](https://github.com/liustack/modsearch) · [Directory / 目录](https://dsh-plugin.org/plugins/liustack/modsearch) · [Marketplace](https://dshmarketplace.dev/plugins/liustack-modsearch)

Web and X search, page extraction and fallback between search engines. The October 15 [code update](https://github.com/liustack/modsearch/commit/57a267cfe7c436b04e880f40c5337acddcda38a2) added keyless Keenable search.

提供网页与 X 搜索、正文抓取及引擎故障切换；10 月 15 日新增免密钥搜索引擎。

[Author CI passed](https://github.com/liustack/modsearch/actions/runs/38788002199): type checks, tests and build on Node 22/24 across Linux, macOS and Windows. Package `@liustack/modsearch@5.10.7` passed archive checks. No DSH version range is declared; no local live-service test was run.

作者 CI 通过，发布包静态检查通过。未声明 DSH 版本范围，未做本地真实服务测试。

## Univer Office · 558 stars

[Source / 源码](https://github.com/dream-num/dsh-univer-office) · [Directory / 目录](https://dsh-plugin.org/plugins/dream-num/dsh-univer-office) · [Marketplace query](https://dshmarketplace.dev/api/v1/plugins?q=dsh-univer-office&limit=100)

Create, edit and review spreadsheets, documents and slides. The October 8 [code fix](https://github.com/dream-num/dsh-univer-office/commit/e8fae6cfae23814defd49a11b1ebcd4fe2b4d8ca) addressed desktop and web rendering support.

在会话中编辑、预览和审阅 Office 内容；10 月 8 日修复桌面与 Web 渲染支持。

[Author CI passed](https://github.com/dream-num/dsh-univer-office/actions/runs/37750936171), including build, type checks and host/viewer/migration integration tests. Package `dsh-univer-office@0.3.7` has a roughly 49 MB compressed archive. Its README documents optional configuration to disable default anonymous telemetry.

作者 CI 通过，压缩发布包约 49 MB。项目 README 说明默认匿名统计可通过配置关闭。当前 DSH 0.2.1-rc.2 未做本地加载验证。

## Taskboard · 336 stars

[Source / 源码](https://github.com/shengsheng90/DSH-taskboard) · [Directory / 目录](https://dsh-plugin.org/plugins/shengsheng90/dsh-taskboard) · [Marketplace query](https://dshmarketplace.dev/api/v1/plugins?q=DSH-taskboard&limit=100)

A local SQLite task board with agent assignments, execution tracking and human review. The October 13 [code fix](https://github.com/shengsheng90/DSH-taskboard/commit/c500d924e00ab0ea24f984194dd288f1a660125a) keeps controls clear of the desktop title bar.

本地 SQLite 任务看板，支持 Agent 领取、执行跟踪和人工验收；10 月 13 日修复桌面标题栏遮挡。

[Author CI passed](https://github.com/shengsheng90/DSH-taskboard/actions/runs/38363287181), including package installation/loading across DSH 0.1.7-rc.1/rc.2 and 0.2.0-rc.1/rc.2 with Node 22/24. Package `@shengsheng/dsh-taskboard@0.1.9` passed archive checks. That matrix does not test DSH 0.2.1-rc.2 or real GUI interactions.

作者 CI 含多版本安装与加载测试，但未覆盖当前 0.2.1-rc.2 或真实 GUI 操作，不能标为本地测试通过。

## Listing outcome / 收录结果

ModSearch and Taskboard are included. Taskboard 0.1.9 is pinned with a [repository provenance review](taskboard-review.md): the npm archive matches the GitHub release asset digest, despite the package's missing repository field. Univer Office remains deferred pending bounded large-archive support; its unpacked archive is 226,850,899 bytes.

ModSearch 与 Taskboard 已收录。Taskboard 0.1.9 的 npm 归档与 GitHub 发行资产哈希一致，已通过[源码对应核查](taskboard-review.md)，以固定版本收录。Univer Office 解压后为 226,850,899 字节，等待受限的大包读取支持。

## Deferred / 暂缓

- [Skill/MCP Panel](https://github.com/Fishquito7/dsh-skill-mcp-panel), 207 stars: has test scripts but no public Actions result was found. / 有测试源码，未找到公开执行结果。
- [Auto Titles](https://github.com/WhatCannotBeSaid/dsh-auto-title): the previously listed source returns 404. Neither directory provided a verified migration. Removed from the current list until a public source can be checked. / 原源码返回 404，未查到可核实的迁移信息，暂时撤下。

## Evidence / 证据

[Structured observations](../data/directory-candidates.json) record exact commit IDs, public API URLs, CI runs and package checks. Package validation verifies published bytes and declared files; it is not a code audit or an independent installation test.

[结构化记录](../data/directory-candidates.json)保留提交、公开接口、CI 和发布包检查结果。发布包静态检查不代表代码审计或独立安装测试。
