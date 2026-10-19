# Catalog expansion · 2026-10-19

The catalog adds 191 plugins, bringing the explicit allowlist from 579 to 770. Each addition has an npm DSH bundle, public source, a declared package license, a project logo and publication or real source-commit activity within the review window of 2026-10-05 13:44 UTC to 2026-10-19 13:44 UTC.

本轮从201个候选中保留191个，正式收录由579项增至770项。中英文名称与用途逐项整理，使用现有11类。源码与测试采用静态抽样，未执行第三方插件、插件测试或宿主安装。

另一轮海外作者及知名项目搜索整理了 [39 个新候选](international-candidates-2026-10-19.md)，单列来源和待补证项，供后续逐个审核。

35 个条目使用经核查的源码图标，固定 npm 版本与完整性哈希，并绑定同一发布仓库的不可变提交、图片路径和原图 SHA-256。其余图标直接来自经校验的 npm 发布包。dsh-suggest-actions 的预览图仅移除不符合 XML 语法的注释，保留原图哈希。升级这些固定版本需重新核查，见[维护说明](../maintenance.zh-CN.md#插件图标与本地化)。

默认顺序、智能推荐、star 和随机排序由现有生成器统一计算，新条目使用相同的 Logo、下载量、更新、验证与作者分散规则。未为本轮条目设置特殊加权。Star 属于仓库，同仓子包共用；npm 下载次数不等于独立用户或 DSH 安装数。

最终下载快照中，492 项取得当日可用的逐日数据，278 项因 npm HTTP 429 保留近期真实月下载缓存，并明确标记为 `stale`。没有周数据的条目不生成周增长信号；191 个新增条目均有实测 Star 和月下载数据。GitHub 快照中 728 个仓库读取成功，6 个旧条目的仓库暂不可用，未填造零值。

验证通过：官方校验器检查全部 770 项，90 项本地单元测试及 10 项桌面/移动浏览器测试通过。新增条目的图标内容哈希、分类与双语文案逐项匹配；智能与随机排序各为完整且不重复的 1–770。独立子代理另复核了图标读取边界与限流缓存路径。

## 本轮未收录的10个候选

以下取舍针对当前这批候选的独立用途、功能重叠和维护成本，不是对项目整体质量的排名。

- `@linxin666/dsh-client-ui-web-ui-settings`：主要承载 dsh-web 同系列插件的设置分组、命名空间桥接与旧配置迁移，独立安装的直接用途较弱。保留实际工坊和预设管理器即可，配套设置可由其依赖关系处理。 [源码证据](https://github.com/zhu1090093659/dsh-web/blob/1acaf870ab554a5edd67a20d60e00c07da943f3d/packages/dsh-web-settings/src/index.ts) 保留项：`@linxin666/dsh-client-ui-market`、`@linxin666/dsh-client-ui-preset-center`。
- `dsh-reference-render`：入口主要导出引用 chip、hover 与 integration 组件库，需要其他插件提供领域数据和接入；相比可直接划选引用的成品，独立用户价值较低。 [源码证据](https://github.com/popingalex/dsh-reference-render/blob/8275cf445e92103ad2dbe04dd6e2ec25c1ee5bf1/src/index.ts) 保留项：`dsh-client-ui-quote`、`dsh-select-quote`。
- `dsh-model-show`：核心改动只是把模型触发器标签改为供应商/模型，却通过 vendor-from-asar 重发整套模型选择界面；收益很窄，需持续跟随上游界面。 [源码证据](https://github.com/ken95573/dsh-model-show/blob/d2578a382cfa3eb9b31ea49758429df23e4e14db/lib/client.js) 保留项：`dsh-model-kit`、`better-model-provider`。
- `dsh-plugin-session-cost-pill`：确有按调用时间计算峰谷费用的逻辑和测试，但最终只提供当前会话费用胶囊，功能已被本轮多个完整用量面板覆盖。 [源码证据](https://github.com/vegerot/deepseek-harness-session-cost-pill/blob/484ac2ee1dc2a1e796257fcee4ec1224b1819967/client.js) 保留项：`dsh-credits`、`dsh-liao-usage`。
- `dsh-notification-bridge`：需要本地 Swift helper 与 macOS 构建签名流程，只负责原生通知桥；测试有效，但相较同批通知工具，安装负担较高且覆盖平台与功能较窄。 [源码证据](https://github.com/fegnze/dsh-notification-bridge/blob/28a7bb22f59061f9deb63d47bb92caea78fab022/src/client.js) 保留项：`dsh-pharos`、`dsh-notification-hook`。
- `dsh-bird-bike`：实际实现是 shell.bottom 内的 Canvas 像素骑行场景、昼夜与碰撞动画；这轮优先工具、集成和工作流，它的装饰用途优先级最低，源码抽样也未提供行为测试。 [源码证据](https://github.com/blackstar-baba/dsh-bird-bike/blob/c6467d5f36ad62a1ab1f415bc5b3dc4c1e080e0c/index.js) 保留项：`beauticode-dsh`、`@smalltailqwq/dsh-client-ui-skin-orca-link`。
- `dsh-sidebar-delete`：直接删除会话文件和投影缓存、级联子会话，并附可选自动清理。实现和测试完整，但与同批多种删除工具高度重叠，缺少回收恢复这一更普遍的需求。 [源码证据](https://github.com/xqh-jason/dsh-sidebar-delete/blob/1ab4ab4860125f97e6f8b06a6e0fa6911e89ac9b/src/auto-purge.mjs) 保留项：`dsh-conversation-recycle-bin`、`@liuyu-f/dsh-plugin-session-cascade-delete`。
- `@xrn1997/dsh-session-delete`：回收站、批量删除与恢复有实现和测试；本轮与 dsh-conversation-recycle-bin 的功能重复，后者还提供关联记忆预览、审计和回滚，因此只保留一套更完整的入口。 [源码证据](https://github.com/xrn1997/dsh-session-delete/blob/42cf760f09bdf4a879430b87473641956facde1f/src/index.ts) 保留项：`dsh-conversation-recycle-bin`。
- `dsh-dialogue-cleanup`：永久删除与清理 live store 的用途已由保留项覆盖；service.js 还明确用默认 1 秒运行状态快照换性能，中途才启动的会话可能未被挡住。相较可恢复方案，这轮优先级较低。 [源码证据](https://github.com/Winnie-0721/dsh-dialogue-cleanup/blob/1a8920aa44f96a69a85b2dd074d0cae58d38748c/lib/service.js) 保留项：`dsh-conversation-recycle-bin`、`@liuyu-f/dsh-plugin-session-cascade-delete`。
- `dsh-session-titler`：只在既有会话上调用模型生成标题、弹窗确认并重命名；与本轮 dsh-auto-rename 的自动首轮命名及弹窗建议重合，独立增量较小。 [源码证据](https://github.com/ZilongYang/dsh-session-titler/blob/6e606cebce3ceb009d517f7e55e5485ef1cd2698/index.js) 保留项：`dsh-auto-rename`。

## 新增分类分布

| 分类 | 新增数 |
| --- | ---: |
| appearance | 8 |
| development | 30 |
| integrations | 21 |
| interface | 23 |
| knowledge | 7 |
| memory | 9 |
| providers | 19 |
| skills | 5 |
| tools | 29 |
| usage | 14 |
| workflow | 26 |
