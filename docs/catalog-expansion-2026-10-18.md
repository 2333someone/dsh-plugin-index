# 插件扩充记录

2026-10-18，本轮新增 289 项，索引从 31 项扩充到 320 项。新增包来自 284 个公开仓库，均在 2026-09-18 UTC 之后有推送，未归档。93 个新增条目对应的仓库超过 100 star；同一仓库的多个子包共享仓库 star，不代表每个子包各自获得这些 star。

检索从 GitHub 的 dsh-plugin 主题按 star 排序的前 1,000 个仓库开始，借助 [DSH Marketplace](https://dshmarketplace.dev/api-docs) 的 npm 线索去重，得到 442 个新候选。391 个通过发布包检查，389 个通过来源核对。其中 321 个的声明范围覆盖 DSH 0.2.1-rc.2 或没有声明范围；再筛选最近 30 天活动与实际用途，正式收录 289 个。111 个新增包未声明 DSH 范围，不能据此证明运行兼容。

完整记录见[收录依据](../data/catalog-admissions-2026-10-18.json)。[sources.json](../sources.json) 是正式清单；条目跟踪 npm latest，实际构建版本、来源、完整性哈希和图标证据以发布的 status.json 为准。

本轮重点覆盖：

| 插件 | 用途 |
| --- | --- |
| @tt-a1i/archify-dsh | 交互架构图 |
| @openviking/dsh-memory-plugin | 记忆与上下文服务 |
| @nanmicoder/dsh-agent-teams | 带任务依赖和消息的 Agent 团队 |
| dsh-thoughtdag | 可编辑会话思维图 |
| @cloudbase/dsh-plugin | 数据库、存储、认证与应用部署 |
| @anionex/dsh-vision-toolkit | OCR、定位、界面还原与像素比较 |
| dsh-comfyui | 图像与视频工作流 |
| dsh-ontology | 带类型与约束的领域知识 |
| dsh-origin-plugin | OriginLab 科研绘图 |
| dsh-data-quality | 数据分析、清理与验证 |
| dsh-qa | 需求、用例、缺陷与报告 |
| dsh-permission-rules | 工具、参数、路径和网络权限规则 |

## 证据范围

- 本机发布包检查覆盖本轮 289 个新包，核对 npm 身份、SHA-512、清单、bundle 补丁及声明的主文件；不安装或执行插件。
- 284 个新增仓库中，238 个有公开 Actions 记录，225 个最近五次运行中至少一次成功。记录包含工作流名称、时间和提交，但不一定对应受检 npm 发行提交，也不等于本机插件单测。
- 项目本身的单元与浏览器检查验证索引生成、页面交互及图标资源，不代表全部插件在 DSH 内运行通过。
- 本轮未为新增插件执行独立的功能测试或真实 DSH GUI 集成测试。此前 Chat Import、Taskboard 的测试仍按原记录标注，未重复执行。

作者发布包中的图标用于 DSH 索引和网页列表；没有图标时网页显示首字。图标、名称与介绍的来源保留在逐包记录中。新增了工作流与协作、开发与运维、知识与研究分类，沿用现有列表设计。

## 后续复核

可将候选写为 npm 名称数组，或包含 packages、targetDsh、maxInactiveDays 的 JSON，再运行：

    node scripts/review-candidates.mjs candidates.json .research/candidate-report.json

报告区分发布包校验与源码活动，不自动收录候选，也不执行第三方安装脚本。支持在同一受检版本的 24 小时内使用 --resume 续跑。原始目录、下载缓存和本机交接资料均不进入仓库提交。
