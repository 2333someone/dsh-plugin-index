# 首发插件目录研究

核查日期：2026-10-18（Asia/Taipei）；最终静态校验时间：2026-10-17T17:58:21.659Z。目标宿主与官方格式校验器版本均为 **0.2.1-rc.2**。

[候选清单](../data/candidates.json)收录 **26 个真实 npm 发行包**，覆盖 8 类功能，均提供英中文标题和一句话说明，并保留发布清单声明的仓库与许可证。共定向检查 39 个包：36 个通过归档及格式检查，其中 26 个进入清单、10 个暂缓；另 3 个未通过检查。此样本不表示生态规模或排名。

## 发现与检查方法

- 从 npm registry 的 [keywords:dsh-plugin 搜索](https://registry.npmjs.org/-/v1/search?text=keywords%3Adsh-plugin&size=250)出发，补充 `dsh plugin`、`keywords:deepseek-harness` 和 `dsh-plugin` 定向查询，另核对已登记来源。搜索结果是线索，不直接成为收录依据；未导入其他市场的完整目录。
- 读取公开 npm 元数据与 README 核对功能。npm README 缺失或只有跳转说明时，读取该版本归档内的 README。下表功能链接指向已读取的 registry 文档或确切归档。
- 用项目[收集器](../scripts/lib.mjs)下载确切版本，核对发布记录、SHA-512、归档内包名及版本、`dsh.bundle.patch` 和声明的 `main` 文件；把双语信息与类别合成完整 `format: 1` 索引，再通过 [@deepseek-ai/dsh-plugin-market-index@0.2.1-rc.2](https://registry.npmjs.org/%40deepseek-ai%2Fdsh-plugin-market-index/0.2.1-rc.2) 校验。网络请求最多 4 个并发。
- DSH 版本约束优先使用 `engines.dsh`，其次使用 DSH peerDependencies 的交集，计算包含预发布版本；规则参考[官方生成器](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/plugin-market-generator)。**20 项声明范围匹配 0.2.1-rc.2，6 项未设置有效限制。**“未约束”意味着运行兼容性仍未知；范围匹配也不等于安装或功能测试通过。
- 未安装、导入或执行第三方插件代码及生命周期脚本；未验证补丁内引用、传递依赖、外部服务、源码与发布包的一致性，也未做代码审计。26 个候选的发布清单均未声明 preinstall/install/postinstall 脚本；这不代表依赖没有安装行为。

类别分布：interface 3、tools 4、skills 4、memory 3、providers 3、usage 3、integrations 3、appearance 3。类别依据用户可见的主要功能；有明确依据的条目才归类。

## 已验证候选与功能依据

包名链接是本次检查的确切版本元数据，包含 tarball 地址和公开完整性值。表中“范围匹配”仅指声明允许目标宿主；所有项目均未进行运行安装测试。

| npm 包及检查版本 | 类别 | README 功能依据 | DSH 0.2.1-rc.2 声明 |
| --- | --- | --- | --- |
| [@michengai/dsh-skills-manager@1.2.5](https://registry.npmjs.org/%40michengai%2Fdsh-skills-manager/1.2.5) | skills | [管理本机与项目技能、仓库安装与更新预览](https://registry.npmjs.org/%40michengai%2Fdsh-skills-manager) | 范围匹配 |
| [dsh-any-background@0.3.8](https://registry.npmjs.org/dsh-any-background/0.3.8) | appearance | [主题色、图片及视频壁纸、分区透明度与模糊度](https://registry.npmjs.org/dsh-any-background) | 范围匹配 |
| [dsh-auto-title@1.7.0](https://registry.npmjs.org/dsh-auto-title/1.7.0) | interface | [最近用户消息生成标题，并保留手动命名](https://registry.npmjs.org/dsh-auto-title) | 未约束 |
| [dsh-bottom-info-bar@1.21.8](https://registry.npmjs.org/dsh-bottom-info-bar/1.21.8) | usage | [输入框底栏显示模型、账户读数与费用账本](https://registry.npmjs.org/dsh-bottom-info-bar) | 未约束 |
| [dsh-cad@0.13.2](https://registry.npmjs.org/dsh-cad/0.13.2) | tools | [二维及三维 CAD 查看、参数化建模、导出](https://registry.npmjs.org/dsh-cad) | 范围匹配 |
| [dsh-calendar@0.11.0](https://registry.npmjs.org/dsh-calendar/0.11.0) | integrations | [CalDAV 日历、日程编辑及 ICS 导入](https://registry.npmjs.org/dsh-calendar) | 未约束 |
| [dsh-cert-mcp@0.2.6](https://registry.npmjs.org/dsh-cert-mcp/0.2.6) | tools | [原生 DSH 与 MCP 只读工具查询社区评估记录](https://registry.npmjs.org/dsh-cert-mcp) | 范围匹配 |
| [dsh-codex-subscription@3.0.0](https://registry.npmjs.org/dsh-codex-subscription/3.0.0) | providers | [ChatGPT/Codex OAuth 接入、模型与额度](https://registry.npmjs.org/dsh-codex-subscription) | 范围匹配 |
| [dsh-cost-meter@1.8.36](https://registry.npmjs.org/dsh-cost-meter/1.8.36) | usage | [会话及每日费用、余额、预算和套餐用量](https://registry.npmjs.org/dsh-cost-meter) | 范围匹配 |
| [dsh-dhe-lore@0.5.1](https://registry.npmjs.org/dsh-dhe-lore/0.5.1) | memory | [项目内 Markdown 记忆供多个会话共享](https://registry.npmjs.org/dsh-dhe-lore) | 范围匹配 |
| [dsh-email@0.17.0](https://registry.npmjs.org/dsh-email/0.17.0) | integrations | [IMAP/SMTP 多邮箱、附件、草稿及发信审批](https://registry.npmjs.org/dsh-email) | 未约束 |
| [dsh-fonttune@0.6.2](https://registry.npmjs.org/dsh-fonttune/0.6.2) | appearance | [对话、界面与代码排版以及预设导入导出](https://registry.npmjs.org/dsh-fonttune) | 范围匹配 |
| [dsh-image-viewer@0.1.15](https://registry.npmjs.org/dsh-image-viewer/0.1.15) | interface | [图片缩放、图库、下载及区域备注（包内 README）](https://registry.npmjs.org/dsh-image-viewer/-/dsh-image-viewer-0.1.15.tgz) | 范围匹配 |
| [dsh-kimi-subscription@1.3.10](https://registry.npmjs.org/dsh-kimi-subscription/1.3.10) | providers | [Kimi Code 密钥或设备登录、模型、搜索及额度](https://registry.npmjs.org/dsh-kimi-subscription) | 范围匹配 |
| [dsh-memento@0.5.25](https://registry.npmjs.org/dsh-memento/0.5.25) | memory | [本地 SQLite 分层记忆、写入审批与提示词快照](https://registry.npmjs.org/dsh-memento) | 范围匹配 |
| [dsh-office-tools@1.0.6](https://registry.npmjs.org/dsh-office-tools/1.0.6) | tools | [文档和表格创建/读取/更新、演示文稿创建/读取](https://registry.npmjs.org/dsh-office-tools) | 范围匹配 |
| [dsh-opencode-go@0.1.24](https://registry.npmjs.org/dsh-opencode-go/0.1.24) | providers | [独立模型提供方、多账号管理与订阅用量](https://registry.npmjs.org/dsh-opencode-go) | 范围匹配 |
| [dsh-quick-toc@0.9.5](https://registry.npmjs.org/dsh-quick-toc/0.9.5) | interface | [按回合组织 Markdown 大纲、搜索与跳转](https://registry.npmjs.org/dsh-quick-toc) | 范围匹配 |
| [dsh-skill-hub@0.3.23](https://registry.npmjs.org/dsh-skill-hub/0.3.23) | skills | [技能浏览、开关、格式诊断、仓库导入与更新](https://registry.npmjs.org/dsh-skill-hub) | 范围匹配 |
| [dsh-skills-anywhere@0.19.0](https://registry.npmjs.org/dsh-skills-anywhere/0.19.0) | skills | [本地及 Git 技能发现、DSH/MCP 按需加载](https://registry.npmjs.org/dsh-skills-anywhere) | 范围匹配 |
| [dsh-smooth-cursor@0.1.9](https://registry.npmjs.org/dsh-smooth-cursor/0.1.9) | appearance | [聊天输入框彗星光标及可配置拖尾、颜色、粗细](https://registry.npmjs.org/dsh-smooth-cursor) | 未约束 |
| [dsh-superpowers@0.1.0](https://registry.npmjs.org/dsh-superpowers/0.1.0) | skills | [Superpowers 技能注册与会话引导](https://registry.npmjs.org/dsh-superpowers) | 未约束 |
| [dsh-tinyfish@0.13.0](https://registry.npmjs.org/dsh-tinyfish/0.13.0) | tools | [TinyFish 为原生搜索和抓取提供直连及 Monid 通道](https://registry.npmjs.org/dsh-tinyfish) | 范围匹配 |
| [dsh-usage-state@0.4.8](https://registry.npmjs.org/dsh-usage-state/0.4.8) | usage | [当前供应商余额、套餐额度与重置时间](https://registry.npmjs.org/dsh-usage-state) | 范围匹配 |
| [dsh-zotero@0.12.1](https://registry.npmjs.org/dsh-zotero/0.12.1) | integrations | [本地文献检索、笔记/标注、证据提取及引用（包内 README）](https://registry.npmjs.org/dsh-zotero/-/dsh-zotero-0.12.1.tgz) | 范围匹配 |
| [sage-mem@1.0.2](https://registry.npmjs.org/sage-mem/1.0.2) | memory | [Markdown 跨会话记忆、检索与自动注入](https://registry.npmjs.org/sage-mem) | 范围匹配 |

## 未通过或暂缓的包

以下结论只适用于列出的版本，不能推广为永久否定。

| npm 包及检查版本 | 原因 |
| --- | --- |
| [dsh-fireworks@0.0.1](https://registry.npmjs.org/dsh-fireworks/0.0.1) | 归档没有 dsh.bundle.patch，收集器报“Bundle patch must name a file”；README 明确说明仅预留名称，首版尚在开发。 |
| [dsh-plugin-shop-catalog@2026.1017.0](https://registry.npmjs.org/dsh-plugin-shop-catalog/2026.1017.0) | 目录数据包，没有 dsh.bundle.patch，收集器报“Bundle patch must name a file”；README 说明其用途是分发目录数据，未将其目录内容用作候选来源。 |
| [dsh-siyuan@0.2.0](https://registry.npmjs.org/dsh-siyuan/0.2.0) | DSH peers 同时要求 dsh-tools =0.1.0-rc.6 与 dsh-settings ^0.1.0-rc.7，交集为空；收集器报“DSH peer compatibility ranges have no intersection”。 |
| [@w2112515/dsh-plugin-marketplace@0.2.4](https://registry.npmjs.org/%40w2112515%2Fdsh-plugin-marketplace/0.2.4) | 归档与格式通过，但 DSH peers 为 ^0.1.0-rc.6，不包含 0.2.1-rc.2。 |
| [dsh-archived-chats@1.5.2](https://registry.npmjs.org/dsh-archived-chats/1.5.2) | 归档与格式通过，但 dsh-session peer 的并集只覆盖较早版本和明确列出的 0.2.0-rc.2，不包含目标版本。 |
| [dsh-client-ui-aqua@1.3.1](https://registry.npmjs.org/dsh-client-ui-aqua/1.3.1) | 归档与格式通过，但 DSH peers 为 ^0.1.0-rc.5，不包含目标版本。 |
| [dsh-dead-links@0.1.1](https://registry.npmjs.org/dsh-dead-links/0.1.1) | 归档与格式通过，但 DSH peers 为 ^0.1.0-rc.6，不包含目标版本。 |
| [dsh-fmt@0.1.0](https://registry.npmjs.org/dsh-fmt/0.1.0) | 归档与格式通过，但 DSH peers 为 ^0.1.0-rc.6，不包含目标版本。 |
| [dsh-github-copilot@0.4.1](https://registry.npmjs.org/dsh-github-copilot/0.4.1) | 归档与格式通过，但 engines.dsh 精确限定为 0.2.0-rc.2。 |
| [dsh-notifier@0.13.1](https://registry.npmjs.org/dsh-notifier/0.13.1) | 归档与格式通过，但 DSH peer 只列出 0.1.7-alpha.1/alpha.2/rc.1/rc.2。 |
| [dsh-browser-control@0.1.0](https://registry.npmjs.org/dsh-browser-control/0.1.0) | 归档与格式通过，但发布清单没有 repository；README 给出的 GitHub 安装地址尚未完成与 npm 发布来源的核对，暂缓至源码来源明确。 |
| [dsh-llm-fallbacks@0.6.6](https://registry.npmjs.org/dsh-llm-fallbacks/0.6.6) | 归档与格式通过且范围匹配目标版本，但发布清单缺少 license；README 的 MIT 徽章不足以补齐发布包的许可核查，暂缓。 |
| [start-dsh-plugin@0.1.0](https://registry.npmjs.org/start-dsh-plugin/0.1.0) | 归档与格式通过，但公开描述仅为“start dsh plugin”，npm 未提供 README，现有资料不足以确认实用功能并编写有依据的目录说明。 |

## 使用这些结果时的边界

版本号与检查结果对应本次 npm 快照；后续 latest 变化必须重新检查。仓库与许可证取自发布包声明，不代表仓库归属、许可证合规或代码内容经过独立审计。只有研究清单中的 26 项属于本次首发候选，暂缓条目不进入该清单。

部分候选需要额外配置：日历和邮件需要相应账户；Codex、Kimi 与 OpenCode Go 需要有调用资格的账户或订阅；TinyFish 需要通道凭据；Zotero 需要本机服务。dsh-cert-mcp 提供第三方社区评估记录查询，其评分不作为本目录的质量结论。对未约束版本的 6 项，应在目标宿主上另行进行安装及功能验收。
