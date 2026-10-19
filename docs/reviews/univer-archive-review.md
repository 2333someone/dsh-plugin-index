# Univer Office 0.3.7 · Archive review / 归档核查

[Source / 源码](https://github.com/dream-num/dsh-univer-office) · [npm release](https://registry.npmjs.org/dsh-univer-office/0.3.7) · [Upstream CI](https://github.com/dream-num/dsh-univer-office/actions/runs/37750936171)

The published archive contains 282 entries: 49,184,591 compressed bytes, 226,850,899 payload bytes and 227,076,608 decoded tar bytes including headers and padding. On 2026-10-18, the index generator verified its SHA-512, package identity, bundle patch and main file, then scanned it with a reviewed 256 MiB budget. Local archive scans took approximately 0.4–0.7 seconds; network download time is separate.

发布归档有 282 个条目，压缩大小 49,184,591 字节，文件载荷 226,850,899 字节，包含头部及对齐的完整 tar 流为 227,076,608 字节。2026-10-18，生成器在核查的 256 MiB 预算内验证了 SHA-512、包名版本、组合包补丁与主入口。本地归档扫描约 0.4～0.7 秒，网络下载耗时另计。

The live npm download timed out locally. Local ingestion and website tests therefore used the previously downloaded archive after rechecking its npm SHA-512. The committed build has no local-cache substitution: GitHub Actions downloads from npm and performs the same validation.

本机实时下载发生超时，因此本地读取与网页测试使用此前下载、重新验证 npm SHA-512 的原归档。正式构建脚本没有本地替代逻辑；GitHub Actions 从 npm 下载并执行相同检查。

## Limits / 限制

The index pins `0.3.7`. Its `archiveReview` binds the exact version and npm integrity hash to a 120-second per-attempt deadline and 256 MiB decoded-tar limit. Ordinary packages retain the 30-second and 100 MiB defaults. There are at most three download attempts. All packages retain the 64 MiB compressed download cap, 1 MiB manifest/metadata caps and 20,000-header cap. Limits include PAX/GNU metadata and padding; manifest size is checked against actual data bytes. A future Office release needs a new review.

索引固定为 `0.3.7`，其 `archiveReview` 把准确版本和 npm 哈希绑定到每次 120 秒时限、256 MiB 完整解压流上限。普通包仍使用 30 秒和 100 MiB 默认值，下载最多尝试三次。所有包仍受 64 MiB 压缩下载、1 MiB 清单及扩展元数据、20,000 头部限制。预算包含 PAX/GNU 元数据及对齐字节，清单还按实际读取长度检查。升级需要重新核查。

The parser consumes file contents without retaining them, except for the package manifest; it retains file paths to check declared entries. It does not extract files to disk or execute the plugin. Actual sizes and applied limits are recorded in the live [status snapshot](https://polang233.github.io/dsh-plugin-index/status.json).

解析器只保留包清单和用于检查入口的文件路径，其余内容读完即丢弃，不落盘解包、不执行插件。实际大小和生效预算记录在[检查快照](https://polang233.github.io/dsh-plugin-index/status.json)中。

## Plugin behavior / 插件行为

Upstream CI includes build, type, host/viewer and migration checks. This review tests archive ingestion, not real DSH installation or Office editing. The plugin's README documents default anonymous telemetry; disable it with `DO_NOT_TRACK=1` or `telemetry: false` if desired. See the [upstream instructions](https://github.com/dream-num/dsh-univer-office#telemetry).

上游 CI 包含构建、类型、Host/Viewer 与迁移检查。本次验证的是索引读取，不是实际 DSH 安装或 Office 编辑。作者 README 说明默认启用匿名统计，可用 `DO_NOT_TRACK=1` 或 `telemetry: false` 关闭，详见[上游说明](https://github.com/dream-num/dsh-univer-office#telemetry)。
