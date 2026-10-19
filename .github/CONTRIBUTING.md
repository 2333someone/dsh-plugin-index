# 贡献指南

## 推荐插件

提交[插件收录申请](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml)，提供 npm 包名或源码仓库地址，以及一句功能介绍，中文或英文均可。作者也可以通过同一表单申请更正或移除。

目前收录的插件需要：

- 有公开 npm 版本和发布时间。
- 声明 `dsh.bundle.patch`，引用的补丁文件已包含在发布包中。
- 有公开源码仓库和明确的许可证。
- 用途清楚。收录时由维护者补齐简短的中英文介绍。

请勿提交密钥、私有仓库、跟踪链接或无依据的安全承诺。发布包检查不代表代码审计或安装测试。

## 提交 PR

在 `data/sources.json` 中添加条目，使用已有分类：

```json
{
  "name": "@owner/plugin",
  "title": { "en": "Plugin name", "zh": "插件名称" },
  "description": { "en": "What the plugin does.", "zh": "插件的具体用途。" },
  "category": "tools"
}
```

默认跟踪 npm 的 `latest` 标签；填写 `version` 可以固定版本，之后需手动修改。运行兼容范围来自实际发布包，不使用提交说明中的声明。

源码字段缺失或归档超出默认预算时，需要先按[维护规则](../docs/maintenance.zh-CN.md#经核查的源码补充)核查准确版本。此类条目保持固定版本，升级需重新核查。

运行 `pnpm test`、`pnpm build` 和 `pnpm validate`。修改网站时，还需运行[维护说明](../docs/maintenance.zh-CN.md)中的浏览器测试。请一并提交 `public/` 中的生成文件，便于离线审阅。

收录调整与无关的网站修改请分开提交。维护者合并前会核对包的归属、用途、发布记录和介绍。
