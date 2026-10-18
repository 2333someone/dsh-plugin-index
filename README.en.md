Enable DSH’s **Custom plugin markets**, then paste the address below into **Plugins → Discover → Add index source**. Use the copy button at the top right of the code block.

```text
https://polang233.github.io/dsh-plugin-index/index.json
```

# Open Plugin Market

<img src="site/logo-256.png" alt="Open Plugin Market" width="96" align="right">

[![Plugins](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fpolang233.github.io%2Fdsh-plugin-index%2Findex.json&query=%24.plugins.length&label=plugins&color=2563eb)](https://polang233.github.io/dsh-plugin-index/index.json)
[![Stars](https://img.shields.io/github/stars/polang233/dsh-plugin-index?style=flat&color=eab308)](https://github.com/polang233/dsh-plugin-index/stargazers)
[![Refresh](https://img.shields.io/badge/refresh-every_6h-0f766e)](.github/workflows/publish.yml)
[![Checks](https://github.com/polang233/dsh-plugin-index/actions/workflows/publish.yml/badge.svg)](https://github.com/polang233/dsh-plugin-index/actions/workflows/publish.yml)

A community plugin index for DeepSeek Harness (DSH). Search, filter and install plugins inside the app.

[简体中文](README.md) · [Browse plugins](https://polang233.github.io/dsh-plugin-index/) · [Suggest a plugin](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml)

![Browse and install plugins in DSH](docs/images/market-in-dsh.png)

## Browse and install

- **Smart recommendations** balance recent maintenance, categories and developer exposure, with periodic rotation. You can also sort by stars, downloads or random resources.
- Entries show **★ GitHub stars, ↓ download buckets and ◷ release age**, with logos from the published plugin packages.
- Open an entry for its versions and source. DSH checks compatibility and asks for confirmation before installing.

The index refreshes every six hours. DSH caches it for about ten minutes; use Refresh for a fresh copy. [Metric sources](docs/market-display.md) · [Package checks](https://polang233.github.io/dsh-plugin-index/status.json)

Each build checks package integrity, identity, versions, bundle declarations and entry files, then validates the official index format. Package checks do not establish full runtime compatibility. See the [test records](docs/plugin-review-2026-10-18.md) for individual runtime evidence.

## Submit a plugin

[Suggest a plugin](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml), or edit [sources.json](sources.json) and open a PR. Include public source code, an installable release and a short description. See the [listing requirements](CONTRIBUTING.md).

Include your own logo in the published npm package. Among plugins that meet the listing requirements, we prioritize reviewing and listing those with logos. Existing entries are welcome to update their icons too.

## Development

Node.js 24+ and pnpm 11.28.5. Install with `pnpm install --frozen-lockfile --ignore-scripts`, check with `pnpm test`, build with `pnpm build`, and validate with `pnpm validate`.

[Maintenance](docs/maintenance.md) · [Contributing](CONTRIBUTING.md) · [MIT](LICENSE)

Independent community project, not affiliated with DeepSeek. Plugins retain their authors’ copyrights and licenses.
