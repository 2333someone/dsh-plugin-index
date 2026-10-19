# Open Plugin Market

<img src="site/logo-256.png" alt="Open Plugin Market" width="96" align="right">

In DeepSeek Harness, switch on **Plugins → Experimental plugins → Custom plugin markets**, then go to **Discover → Add index source** and paste:

```text
https://dshopen.org/index.json
```

[![Plugins](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdshopen.org%2Findex.json&query=%24.plugins.length&label=plugins&color=2563eb)](https://dshopen.org/)
[![Index reads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdshopen.org%2Fstats.json&query=%24.total&label=index%20reads&color=16a34a)](https://dshopen.org/stats.json)
[![Reads today](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdshopen.org%2Fstats.json&query=%24.today.reads&label=reads%20today&color=0d9488)](https://dshopen.org/stats.json)
[![Stars](https://img.shields.io/github/stars/polang233/dsh-plugin-index?label=stars&color=eab308)](https://github.com/polang233/dsh-plugin-index/stargazers)

A community plugin market for DeepSeek Harness (DSH): driven by data and recommendations, with nothing extra in the way.

**Stars aren't everything.** The default picks refresh every day and put fast-growing, actively shipped, genuinely good plugins first, with verification, downloads and stars as supporting signals. No single author can flood the list, so a newcomer's plugin can make the first screen and find its audience.

[Browse plugins](https://dshopen.org/) · [简体中文](README.md) · [Suggest a plugin](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml)

![Open Plugin Market in the DSH Discover tab](docs/images/dsh-discover-en.webp)

[![The Open Plugin Market website](docs/images/home-en.webp)](https://dshopen.org/)

## Use it

Switch on **Custom plugin markets** under **Plugins → Experimental plugins**, then pick one:

- **Add the source by hand.** Paste `https://dshopen.org/index.json` into **Discover → Add index source**. The earlier `https://polang233.github.io/dsh-plugin-index/index.json` still works.
- **Install the plugin.** `dsh plugin --profile desktop add "git+https://github.com/polang233/dsh-plugin-index.git#main&path:/packages/dsh-open-market"` installs `dsh-open-market`, which adds the source for you once. Remove it later and it stays removed.

<img src="docs/images/add-index.webp" alt="Adding the dshopen.org index URL under Discover → Index sources" width="560">

## Labels and sorting

✅ Verified · 🔥 Rising · ⚡ Frequent updates · ◷ four update-age buckets · ↓ seven download tiers. *Default* order favors downloads, stars, plugins with a logo and verified plugins; *✨ Smart picks* lead with recent growth and activity. You can also sort by new stars (7 days), GitHub stars or at random. The index rebuilds every six hours. See [metrics](docs/market-display.md) for the formulas and data sources.

## Spare a star ⭐

A star is the simplest thank-you a developer gets, and it feeds the recommendations here too. If a plugin earns a place in your setup, star its repo. The next star could be someone starring yours.

## Usage stats

*Index reads* counts every time DSH loads this market from dshopen.org, which happens when Discover opens or refreshes (DSH caches it for about ten minutes). *Reads today* is today's share. Readers are deduplicated per day with a salted hash of IP and user agent; IPs are never stored. Details live in [stats.json](https://dshopen.org/stats.json).

## Submit a plugin

[Open a request](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml), or add an entry to [`data/sources.json`](data/sources.json) and open a PR. Plugins need public source code, an installable npm release and a declared license. Plugins that ship their own logo are reviewed first.

## Development

Node.js 24+ and pnpm 11: `pnpm install --frozen-lockfile --ignore-scripts`, then `pnpm test`, `pnpm build` and `pnpm validate`. See [maintenance](docs/maintenance.md). Licensed under [GPL-3.0](LICENSE).

Independent community project, not affiliated with DeepSeek. Plugins retain their authors' copyrights and licenses.
