# 国际项目与公司 DSH 适配新候选

[逐项证据与结构化数据](international-candidates-2026-10-19.json)

本轮保留39个真实新候选，均未入库，与原201个精选及当前770个正式条目无重叠。38个npm归档通过身份、完整性、bundle补丁和入口静态核验，1个仅确认git源码。25个在近14天有DSH目录提交或npm发布。

已核验12个项目或官方产品品牌图，另有1个通用房屋导航图标，单独统计。39个均有项目或包许可证证据，38个npm包声明license。当前仅BrowserSkill的现有必要证据齐备，其余38个仍有下表所列阻塞。Hindsight上游MIT许可证不能替代现行规则要求的npm许可证字段。

Star与下载均为本轮核验时的数据。下载窗口为2026-09-19至2026-10-18，不代表独立用户或DSH安装量。上游全仓Star明确标注，不作为适配器独立热度。

## 建议优先审阅

以下顺序综合项目关注度、具体用途、包下载和DSH适配活跃度，表示审阅优先级。除BrowserSkill外，各项仍需补齐阻塞证据。

| 顺序 | 插件 | 热度范围 | DSH最后提交 | 优先理由与当前状态 |
|---:|---|---|---|---|
| 1 | [BrowserSkill 浏览器控制](https://github.com/Tencent/BrowserSkill) | 9208 上游全仓共用；月下载 30274 | [2026-10-14](https://github.com/Tencent/BrowserSkill/commit/4fec601088e7051b67a2fb2203807b4b48f7616c) | 浏览器操作用途明确，上游维护，近14天有DSH提交与npm发布，现有必要证据齐备 |
| 2 | [Hindsight 长期记忆](https://github.com/vectorize-io/hindsight) | 51544 上游全仓共用；月下载 59222 | [2026-10-12](https://github.com/vectorize-io/hindsight/commit/23c7d701c46e793361a4853fc5e190d0e195db7c) | 上游长期记忆项目关注度与包下载较高，近14天有DSH提交；优先核对npm许可证缺项 |
| 3 | [Mirage 虚拟工作区](https://github.com/strukto-ai/mirage) | 3696 上游全仓共用；月下载 1146 | [2026-10-18](https://github.com/strukto-ai/mirage/commit/544df4aead0cc7d701b0eab988e5ece28d8e3955) | 上游虚拟工作区集成，DSH目录10月18日仍有提交；先处理发布包宿主版本范围 |
| 4 | [LoopX 目标与任务控制](https://github.com/loopx-project/loopx) | 6368 上游全仓共用；月下载 未核验 | [2026-10-19](https://github.com/loopx-project/loopx/commit/94e9f036f3b1d209cd04133ad87f710947fd512c) | 上游项目提供原生目标栏与续行实现，DSH目录10月19日有提交；仍缺可安装npm归档核验 |
| 5 | [订阅模型接入](https://github.com/GooDAnDReaDY/dsh-subscriptions) | 13 适配仓库；月下载 12819 | [2026-10-18](https://github.com/GooDAnDReaDY/dsh-subscriptions/commit/23cc6345e111c5a84dcc3207de91c0edf7be2fb3) | 独立DSH适配器，月下载12819，10月18日有提交；提供订阅账户模型接入，仍缺项目Logo |
| 6 | [API 密钥池](https://github.com/GooDAnDReaDY/dsh-key-rotation) | 9 适配仓库；月下载 10967 | [2026-10-19](https://github.com/GooDAnDReaDY/dsh-key-rotation/commit/e8657b829860e61b01767b872c02e29187b9eb2c) | 独立DSH适配器，月下载10967，10月19日有提交与发布；提供密钥池切换，仍缺项目Logo |
| 7 | [多服务商图片生成](https://github.com/GooDAnDReaDY/dsh-image-gen) | 10 适配仓库；月下载 11717 | [2026-10-19](https://github.com/GooDAnDReaDY/dsh-image-gen/commit/8aa2700d0a044b1e07d97a3f1fea80002664a56e) | 独立DSH适配器，月下载11717，10月19日有提交与发布；提供多服务商图片生成，仍缺项目Logo |
| 8 | [Milvus 数据检索](https://github.com/zilliztech/dsh-milvus) | 4 适配仓库；月下载 1075 | [2026-10-09](https://github.com/zilliztech/dsh-milvus/commit/b75ff77eb50d8a055a23802408ca65a96a5a6883) | Zilliz维护的原生检索适配，近14天有提交与发布，产品Logo已核验；先处理宿主版本范围 |
| 9 | [Avernet 机器人协作网络](https://github.com/inclusionAI/Avernet) | 642 上游全仓共用；月下载 820 | [2026-10-19](https://github.com/inclusionAI/Avernet/commit/f42ab428061f666defdfbbec16c3c4ad82c24f5e) | 上游机器人协作项目维护，DSH目录10月19日有提交，项目Logo已核验；先处理宿主版本范围 |
| 10 | [原生 Windows 运行维护](https://github.com/sjh9714/dsh-win32) | 131 适配仓库；月下载 5117 | [2026-10-12](https://github.com/sjh9714/dsh-win32/commit/ebf049efd9609bd0ba1f76e069d01cec322fc539) | 独立适配仓库有131 Star、月下载5117，10月12日有提交；Windows运行维护用途明确，仍缺Logo及版本范围处理 |
| 11 | [Odoo 开发流程](https://github.com/fhidalgodev/dsh-odoo-sdd) | 4 适配仓库；月下载 2741 | [2026-10-14](https://github.com/fhidalgodev/dsh-odoo-sdd/commit/dc6e70e2f56aa46b919e263ff5e562a69e011b7f) | Odoo开发细分用途，月下载2741，近14天有提交与发布；其余必要证据已有，仍缺项目Logo |
| 12 | [WeKnora 知识库检索](https://github.com/Tencent/WeKnora) | 34707 上游全仓共用；月下载 5279 | [2026-09-03](https://github.com/Tencent/WeKnora/commit/d75cf72fc691e128e98e142681186283e9818c66) | Tencent上游知识库项目关注度较高且Logo已核验，适合作为后续观察项；DSH目录9月3日后未见提交，未满足近14天条件 |

## 公司与上游项目维护

这里的官方维护指产品或项目自身维护，不代表DeepSeek背书。Tencent的公开地点为中国深圳，按知名公司适配列入。关系事实与来源链接见JSON的maintainerEvidence。

| 插件 | 用途 | Star | 月下载 | DSH最后提交 | Logo证据 | 阻塞 |
|---|---|---:|---:|---|---|---|
| [Hindsight 长期记忆](https://github.com/vectorize-io/hindsight) | 通过 Hindsight 保存和检索项目记忆，按仓库组织记忆库。 | 51544 上游全仓共用 | 59222 | 2026-10-12 | [项目/产品Logo已核验](https://raw.githubusercontent.com/vectorize-io/hindsight/main/hindsight-docs/static/img/logo.png) | npm发布包未声明license，按现有严格入库规则阻塞；上游MIT证据不替代包元数据 |
| [WeKnora 知识库检索](https://github.com/Tencent/WeKnora) | 检索 WeKnora 知识库、读取文档片段并获取带引用的回答。 | 34707 上游全仓共用 | 5279 | 2026-09-03 | [项目/产品Logo已核验](https://raw.githubusercontent.com/Tencent/WeKnora/main/frontend/src/assets/img/weknora.png) | 近14天未发现DSH目录提交或npm版本发布 |
| [BrowserSkill 浏览器控制](https://github.com/Tencent/BrowserSkill) | 通过 BrowserSkill 操作 Chrome 和 Edge，并在网页界面查看浏览器任务。 | 9208 上游全仓共用 | 30274 | 2026-10-14 | [项目/产品Logo已核验](https://raw.githubusercontent.com/Tencent/BrowserSkill/main/apps/extension/assets/logo.png) | 现有必要证据齐备 |
| [Mirage 虚拟工作区](https://github.com/strukto-ai/mirage) | 通过 Mirage 挂载虚拟资源，供文件和 Shell 工具读写与执行。 | 3696 上游全仓共用 | 1146 | 2026-10-18 | [项目/产品Logo已核验](https://raw.githubusercontent.com/strukto-ai/mirage/main/docs/favicon.svg) | 发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [Honcho 用户与会话记忆](https://github.com/plastic-labs/dsh-honcho) | 将对话记录到 Honcho，召回用户信息、会话摘要和已保存的事实。 | 5 适配仓库 | 1807 | 2026-09-28 | [项目/产品Logo已核验](https://honcho.dev/Honcho_Pixel-05.svg) | 近14天未发现DSH目录提交或npm版本发布；发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [Milvus 数据检索](https://github.com/zilliztech/dsh-milvus) | 查看 Milvus 或 Zilliz Cloud 集合，执行只读标量、向量和混合检索。 | 4 适配仓库 | 1075 | 2026-10-09 | [项目/产品Logo已核验](https://raw.githubusercontent.com/milvus-io/milvus.io/HEAD/public/images/layout/milvus-logo.svg) | 发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [OpenCues 输入辅助](https://github.com/opencues/opencues) | 在输入框提供同义词替换、拼写提示和下划线触发的补全。 | 69 上游全仓共用 | 772 | 2026-09-19 | [项目/产品Logo已核验](https://raw.githubusercontent.com/opencues/opencues/master/integrations/chrome/icons/icon-128.png) | 近14天未发现DSH目录提交或npm版本发布 |
| [TapTap 游戏开发工具](https://github.com/taptap/instant-games-open-mcp) | 接入 TapTap Maker 的项目工具、开发流程和随包命令行。 | 45 上游全仓共用 | 796 | 2026-09-20 | 项目Logo尚未核验 | 近14天未发现DSH目录提交或npm版本发布；项目Logo尚未核验；发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [BlockRun 模型路由与审查](https://github.com/BlockRunAI/dsh-clawrouter) | 接入 BlockRun 模型，并用审查模型评估指定工具调用。 | 19 适配仓库 | 958 | 2026-09-05 | [项目/产品Logo已核验](https://blockrun.ai/favicon-32x32.png) | 近14天未发现DSH目录提交或npm版本发布 |
| [AgentMail 邮箱](https://github.com/agentmail-to/dsh-agentmail) | 为 Agent 提供邮箱，将来信关联到会话，并提供发信审批和跟进工具。 | 1 适配仓库 | 789 | 2026-08-18 | [项目/产品Logo已核验](https://www.agentmail.to) | 近14天未发现DSH目录提交或npm版本发布；发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [OpenContext 跨会话记忆](https://github.com/melandlabs/opencontext) | 通过 OpenContext 记录提示、召回项目记忆并检索文档。 | 76 上游全仓共用 | 1393 | 2026-09-21 | 项目Logo尚未核验 | 近14天未发现DSH目录提交或npm版本发布；项目Logo尚未核验；发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [Avernet 机器人协作网络](https://github.com/inclusionAI/Avernet) | 通过 Avernet 机器人协作通道连接 DSH 会话。 | 642 上游全仓共用 | 820 | 2026-10-19 | [项目/产品Logo已核验](https://raw.githubusercontent.com/inclusionAI/Avernet/dev/docs/images/avernet-logo-horizontal-dark.png) | 发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [LoopX 目标与任务控制](https://github.com/loopx-project/loopx) | 将 LoopX 任务状态、续行逻辑和目标栏接入 DSH 会话。 | 6368 上游全仓共用 | 未核验 | 2026-10-19 | [项目/产品Logo已核验](https://raw.githubusercontent.com/loopx-project/loopx/main/apps/presentation/dashboard/public/pwa/icon-192.png) | 尚未验证可安装的npm归档；仅确认git源码bundle与原生实现 |

## 有公开地点证据的独立维护者

地点来自维护者公开资料的自述，不据此推断国籍。未核实地点的项目仅归为国际项目生态。

| 插件 | 维护者地点 | 用途 | Star / 月下载 | Logo证据 | 阻塞 |
|---|---|---|---|---|---|
| [原生 Windows 运行维护](https://github.com/sjh9714/dsh-win32) | [Seoul](https://github.com/sjh9714) | 检查 Windows 上的 DSH、PowerShell 与沙箱依赖，并管理启动快捷方式。 | 131 适配仓库 / 5117 | 项目Logo尚未核验 | 项目Logo尚未核验；发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [Agent 配置迁移](https://github.com/sjh9714/dsh-movein) | [Seoul](https://github.com/sjh9714) | 预览并迁入其他编程 Agent 的技能、hooks、权限规则和 MCP 设置。 | 14 适配仓库 / 1416 | 项目Logo尚未核验 | 近14天未发现DSH目录提交或npm版本发布；项目Logo尚未核验 |
| [科研工作台](https://github.com/biociao/dsh-science) | [University of Copenhagen, Denmark](https://github.com/biociao) | 组织研究循环和带溯源的版本化产物，并提供科研工具与技能。 | 44 适配仓库 / 1550 | 项目Logo尚未核验 | 近14天未发现DSH目录提交或npm版本发布；项目Logo尚未核验 |
| [Podman 工作区容器](https://github.com/Exagone313/dsh-podman) | [France](https://github.com/Exagone313) | 在一次性 Podman 容器中运行 Shell 和文件工具，并管理容器资源。 | 6 适配仓库 / 2843 | 项目Logo尚未核验 | 项目Logo尚未核验；发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [Odoo 开发流程](https://github.com/fhidalgodev/dsh-odoo-sdd) | [Venezuela](https://github.com/fhidalgodev) | 按规范、实现和实例核验组织 Odoo 开发任务，并记录结果。 | 4 适配仓库 / 2741 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [Orbital 对等 Agent](https://github.com/Qulierm/orbital-agents) | [Russia](https://github.com/Qulierm) | 通过常驻的规划与审查会话协调任务执行和结果检查。 | 4 适配仓库 / 2421 | 项目Logo尚未核验 | 项目Logo尚未核验；发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [自托管服务面板](https://github.com/NamesMT/dsh-home-hosted) | [Viet Nam](https://github.com/NamesMT) | 在统一面板中管理 DSH 与其他自托管服务及开机启动设置。 | 1 适配仓库 / 6540 | [导航图标已核验](https://raw.githubusercontent.com/NamesMT/dsh-home-hosted/HEAD/src/client/settings-nav-icon.ts)，收录适用性待人工确认 | 仅核验到通用房屋导航图标，品牌Logo尚未核验；需人工确认该图标是否满足收录标准 |
| [桌面与 Webhook 通知](https://github.com/nishit130/dsh-notification) | [Bengaluru](https://github.com/nishit130) | 在任务完成、失败或等待审批时发送系统通知或 Webhook 提醒。 | 2 适配仓库 / 2856 | 项目Logo尚未核验 | 近14天未发现DSH目录提交或npm版本发布；项目Logo尚未核验 |
| [阿拉伯语界面与双向排版](https://github.com/SMSMy/dsh-arabic) | [saudi](https://github.com/SMSMy) | 为 DSH 添加阿拉伯语翻译、双向文字排版和阿拉伯文字体。 | 2 适配仓库 / 3580 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [角色卡对话](https://github.com/chinosk6/dsh-roleplay) | [Bristol, UK](https://github.com/chinosk6) | 创建和编辑角色卡用于角色扮演对话，并可接入图片生成。 | 17 适配仓库 / 2673 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [多工作目录](https://github.com/AngelosZou/dsh-multi-folder) | [London](https://github.com/AngelosZou) | 为项目添加副工作目录，并配置工具对这些目录的访问。 | 10 适配仓库 / 2308 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [Graphlint 代码依赖图](https://github.com/AngelosZou/graphlint) | [London](https://github.com/AngelosZou) | 构建代码依赖图，检索从配置入口无法到达的代码。 | 7 上游全仓共用 / 1301 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [运行时代理切换](https://github.com/tr1v3r/dsh-proxy) | [Singapore](https://github.com/tr1v3r) | 在直连、手动代理和系统代理之间切换 DSH 网络请求。 | 4 适配仓库 / 2274 | 项目Logo尚未核验 | 近14天未发现DSH目录提交或npm版本发布；项目Logo尚未核验 |
| [SQLite 长期记忆](https://github.com/tr1v3r/dsh-ltm) | [Singapore](https://github.com/tr1v3r) | 用本地 SQLite 保存项目记忆，提供检索、去重和生命周期管理。 | 1 适配仓库 / 2394 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [模型触发上下文压缩](https://github.com/JoblessJoe/smart-compaction) | [Freiburg](https://github.com/JoblessJoe) | 让模型通过专用工具查看上下文用量并请求压缩。 | 1 适配仓库 / 2347 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [系统资源监控](https://github.com/JoblessJoe/dsh-vitals) | [Freiburg](https://github.com/JoblessJoe) | 在网页标签页显示 CPU、内存、温度和 GPU 实时指标。 | 0 适配仓库 / 1858 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [模型服务商余额](https://github.com/andregoncalves/dsh-balance) | [Portugal](https://github.com/andregoncalves) | 在侧边栏查询并显示当前模型服务商的账户余额。 | 0 适配仓库 / 2419 | 项目Logo尚未核验 | 近14天未发现DSH目录提交或npm版本发布；项目Logo尚未核验 |
| [ai-memory 会话记忆整理](https://github.com/rasyidmmz/dsh-ai-memory) | [Magelang, Jawa Tengah](https://github.com/rasyidmmz) | 在 DSH 会话结束后将记录整理为 ai-memory 页面，供其他 Agent 读取。 | 1 适配仓库 / 2143 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [局域网浏览器配对](https://github.com/donoteatme/dsh-local-link) | [Moscow](https://github.com/donoteatme) | 通过二维码配对在局域网访问当前 DSH 网页界面，并管理可撤销的设备。 | 2 适配仓库 / 2114 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [订阅模型接入](https://github.com/GooDAnDReaDY/dsh-subscriptions) | [Moscow, Russia](https://github.com/GooDAnDReaDY) | 通过 OAuth 将支持的订阅账户注册为 DSH 模型提供方。 | 13 适配仓库 / 12819 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [多服务商图片生成](https://github.com/GooDAnDReaDY/dsh-image-gen) | [Moscow, Russia](https://github.com/GooDAnDReaDY) | 通过支持的图片接口或订阅生成图片，并在对话中展示结果。 | 10 适配仓库 / 11717 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [语音输入](https://github.com/GooDAnDReaDY/dsh-voice) | [Moscow, Russia](https://github.com/GooDAnDReaDY) | 通过可配置的转写服务听写文字或发送语音消息。 | 9 适配仓库 / 10985 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [API 密钥池](https://github.com/GooDAnDReaDY/dsh-key-rotation) | [Moscow, Russia](https://github.com/GooDAnDReaDY) | 在配额或限流错误时切换服务商密钥，并在设置页查看密钥状态。 | 9 适配仓库 / 10967 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [Gitea 与 Forgejo 工具](https://github.com/GooDAnDReaDY/dsh-gitea) | [Moscow, Russia](https://github.com/GooDAnDReaDY) | 在 DSH 中处理 Gitea 或 Forgejo 的议题、拉取请求和工作树。 | 3 适配仓库 / 4512 | 项目Logo尚未核验 | 项目Logo尚未核验 |
| [对话便签与图片导出](https://github.com/zhaoolee/notes) | [New York](https://github.com/zhaoolee) | 将对话导出为便签风格图片，并新建或更新 Markdown 笔记。 | 308 上游全仓共用 / 792 | [项目/产品Logo已核验](https://raw.githubusercontent.com/zhaoolee/notes/main/public/header/logo.png) | 近14天未发现DSH目录提交或npm版本发布；发布包声明的DSH版本范围不包含0.2.1-rc.2 |
| [Rapid-MLX 本地模型](https://github.com/raullenchai/rapid-mlx-dsh-provider) | [San Francisco](https://github.com/raullenchai) | 连接本地 Rapid-MLX 服务，并向 DSH 提供模型管理工具。 | 70 适配仓库 / 138 | 项目Logo尚未核验 | 近14天未发现DSH目录提交或npm版本发布；项目Logo尚未核验；发布包声明的DSH版本范围不包含0.2.1-rc.2 |

## 核验范围与未解决项

- 所有39个均已定位原生DSH实现。源码与测试只作静态抽样，未运行插件或测试套件；观察到测试文件不等于测试通过。
- 近14天活动按DSH目录提交或npm版本发布判断。WeKnora、TapTap、OpenContext的上游全仓活跃时间不替代DSH子目录时间。
- Hindsight的上游LICENSE为MIT，但npm包未声明license，仍阻塞。该包涵盖多个Agent宿主，下载量不等于DSH安装量。
- Mirage、Milvus等发布包声明的DSH版本范围不包含当前宿主0.2.1-rc.2，现有材料不足以确认当前版本可用。LoopX仍缺可安装npm归档核验。
- [BlockRun官网](https://blockrun.ai)链接其GitHub组织，[官方生态清单](https://github.com/BlockRunAI/awesome-blockrun#clawrouter-ports-and-other-official-repos)明确列出dsh-clawrouter。[AgentMail官网](https://www.agentmail.to)链接agentmail-to组织；其源码包含原生DSH收信会话与发信审批实现。
- Logo补核查看了29个完整源码树及官方产品网站。GooDAnDReaDY几件中观察到的是emoji和通用界面图标，项目Logo仍未核验。TapTap、OpenContext的候选图片未通过格式或体积检查，未计入核验通过数。
- dsh-home-hosted仅核验到源码中的通用房屋导航图标，品牌Logo尚未核验；该图标是否满足收录标准需人工确认。其readyForCatalog为false。其他已核验图像均注明项目或产品范围，未认定为npm包自带图标。
- Reactive Resume有官方DSH源码与npm归档，但主要为远程MCP加提示词，列为参考项，不计入39个主体候选。Q00、Treg、Sandbase的同类薄封装也未计入。
- 逐条安装方式、维护关系、来源、图片SHA256、当前阻塞项及readyForCatalog状态见同名JSON。
