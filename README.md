<p align="center">
  <img src="site/logo.png" alt="DSH Plugin Index logo" width="160" height="160">
</p>

# DSH Plugin Index

A community plugin index for DeepSeek Harness. Add one URL in DSH to browse and install plugins.

[Browse plugins](https://polang233.github.io/dsh-plugin-index/) · [简体中文](README.zh-CN.md) · [Suggest a plugin](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml)

## Add to DSH

```text
https://polang233.github.io/dsh-plugin-index/index.json
```

1. Open **Plugins → Discover → Add index source** in DSH.
2. Paste the URL above and save.
3. Choose a plugin and review its version and source before installing.

If Discover is missing, enable DSH's **Custom plugin markets** bundle first. DSH checks version compatibility and may disable installation for a plugin that does not support your version.

## What's included

The directory covers interface tools, skills, memory, providers, usage tracking, integrations and themes. Entries link to their source and exact npm versions, with author icons and localized names and descriptions when available.

GitHub stars appear beside each entry and link to the repository's stargazers. DSH can also sort by stars. Counts refresh during builds; a failed request keeps a dated recent snapshot or shows the count as unavailable, never as a fabricated zero.

Every build checks published package integrity, package identity, bundle patch files and declared main files, then validates the index with DSH's official format validator. These are package checks, not an installation test or a code audit. [Check details and update time](https://polang233.github.io/dsh-plugin-index/status.json).

Updates run every six hours. A failed build leaves the published index in place. DSH may cache the index for ten minutes; use Refresh to fetch it again.

[Recent plugin checks](docs/plugin-review-2026-10-18.md) · [Directory discoveries](docs/directory-discovery-2026-10-18.md)

## Contribute

[Suggest a plugin](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml), report a broken entry, or submit a change to [sources.json](sources.json). See [Contributing](CONTRIBUTING.md) for the listing rules.

## Development

Node.js 24+ and pnpm 11.28.5:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm build
pnpm validate
pnpm preview
```

`pnpm build` fetches the listed packages and generates the index and both website languages in `public/`. `pnpm build:site` rebuilds the website from the existing snapshot without fetching packages.

[Maintenance and deployment](docs/maintenance.md) · [中文维护说明](docs/maintenance.zh-CN.md)

## License

[MIT](LICENSE). Listed plugins keep their own licenses.

Independent community project. Not affiliated with DeepSeek.
