# Open Plugin Market

A community plugin market for DeepSeek Harness (DSH). It focuses on data and recommendations and keeps the interface simple.

**Not a star contest.** The default order leads with plugins that are **growing fast, updated often or newly published**, also weighs verification, downloads and stars, and keeps any single developer from dominating it. New work from small developers can reach the first screen.

[Browse plugins](https://polang233.github.io/dsh-plugin-index/) · [简体中文](README.md) · [Suggest a plugin](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml)

## Use it

Turn on **Custom plugin markets** under **Plugins → Experimental plugins**, then either:

- **Install the plugin (recommended).** Install `dsh-open-market` from GitHub with `dsh plugin --profile desktop add "git+https://github.com/polang233/dsh-plugin-index.git#main&path:/packages/dsh-open-market"`. It adds the index to your Discover sources once. If you remove the source later, the plugin respects that.
- **Add the source by hand.** Paste `https://polang233.github.io/dsh-plugin-index/index.json` into **Discover → Add index source**.

## Labels and sorting

✓ Verified elsewhere · 🔥 Rising · ⚡ Frequent updates · ✦ New · ◷ four update-age buckets · ↓ seven download tiers. Sort by Smart recommendations, download growth (7 days), new stars (7 days), downloads, stars or random. Smart recommendations lead with growth and activity and also weigh verification by other markets, downloads and stars. The index refreshes every six hours. See [metrics](docs/market-display.md) for the formula and data sources.

## Submit a plugin

[Open a request](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml), or add an entry to [`data/sources.json`](data/sources.json) and open a PR. Plugins need public source code, an installable npm release and a declared license. Plugins that ship their own logo are reviewed first.

## Development

Node.js 24+ and pnpm 11: `pnpm install --frozen-lockfile --ignore-scripts`, then `pnpm test`, `pnpm build` and `pnpm validate`. See [maintenance](docs/maintenance.md).

Independent community project, not affiliated with DeepSeek. Plugins retain their authors' copyrights and licenses.
