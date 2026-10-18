# Contributing

[简体中文](CONTRIBUTING.zh-CN.md)

## Suggest a plugin

Open a [plugin submission](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml) with its npm package, source repository and one sentence about what it does. Maintainers can also request a correction or removal through the same form.

For now, listings must have:

- A public npm release with an exact version and publication date.
- A `dsh.bundle.patch` declaration and the referenced files in the published package.
- A public source repository and an identifiable license.
- A concrete purpose, with a short English and Chinese description.

Do not include credentials, private repositories, tracking links or unsupported security claims. Package verification is not a claim that a plugin has passed a code audit or an installation test.

## Submit a pull request

Add an entry to `sources.json`, using an existing category:

```json
{
  "name": "@owner/plugin",
  "title": { "en": "Plugin name", "zh": "插件名称" },
  "description": { "en": "What the plugin does.", "zh": "插件的具体用途。" },
  "category": "tools"
}
```

The index follows npm `latest` unless `version` is set. A pinned version stays pinned until someone changes it. Runtime compatibility comes from the published package, not the submission text.

Missing repository metadata or oversized archives require a version-bound review before listing. See the [review rules](docs/maintenance.md#reviewed-repository-metadata); these entries remain pinned until reviewed again.

Run `pnpm test`, `pnpm build` and `pnpm validate`. If you change the site, also run the browser tests described in the [maintenance guide](docs/maintenance.md). Keep generated files in `public/` with the change so it can be reviewed without a network build.

Submit source-list changes separately from unrelated website changes. Maintainers review package ownership, purpose, release metadata and descriptions before merging.
