# Maintenance

[简体中文](maintenance.zh-CN.md)

## Build and test

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm build
pnpm validate
pnpm exec playwright install chromium
pnpm exec playwright test
```

For local browser tests, set `BROWSER_EXECUTABLE` to an existing Chrome or Chromium executable to skip the browser download. Browser tests start and stop their own localhost preview server.

- `sources.json`: package list, translations and categories.
- `scripts/lib.mjs`: registry and archive checks, compatibility ranges, index generation.
- `scripts/site.mjs` and `site/`: English and Chinese pages.
- `public/index.json`: DSH format-1 index.
- `public/status.json`: generation time and package-check evidence.

Use `pnpm build:site` for website-only changes and `pnpm preview` to open the result at `http://127.0.0.1:4173/dsh-plugin-index/`.

## Updates

The generator follows npm `latest`, unless an entry pins `version`. It reads up to four sources concurrently and retries temporary network errors. Downloads are limited to the public npm registry; third-party package code is never executed. All sources and the official format validator must pass before the build can publish.

The build lists one version per package. DSH reads compatibility from `engines.dsh`, or from the intersection of DSH peer dependencies when that field is absent. Missing constraints mean the author supplied no range; they do not prove compatibility.

On a failure, inspect the Actions log, fix the source or connection, and rerun. Remove a withdrawn or unmaintained listing through a source-list change. No failed source is silently omitted from a successful deployment.

## GitHub stars

Each build reads the public GitHub API once per unique repository and writes `public/github.json`. It records the exact star count, fetch time and last push time. Counts also populate the official index's `github-stars` sort key, so DSH can sort by stars.

GitHub Actions supplies a read-only `GITHUB_TOKEN`. Local builds can use `GITHUB_TOKEN` or `GH_TOKEN`; without either, GitHub's anonymous rate limit applies. Tokens are used only for requests to `api.github.com` and are never written to snapshots. The browser does not request the GitHub API.

If GitHub is unavailable, a verified snapshot up to seven days old is kept with its original timestamp and marked `stale`. Older or missing counts become `unavailable`, not zero. Non-GitHub repositories have no GitHub star count. Actions preserves `.cache/github.json` between builds; the checked-in public snapshot is a fallback. Stars describe repository popularity, not test coverage or plugin quality.

## GitHub Pages

1. In **Settings → Pages**, select **GitHub Actions**.
2. Set the repository variable `PUBLISH_INDEX=true`.
3. Run **Check and publish index** on `main`.

The workflow runs unit tests, builds the catalog, checks both website languages in Chromium and validates the official format before uploading the Pages artifact. It then checks the deployed index URL. Pull requests never deploy.

Scheduled runs are set to every six hours; GitHub may delay or suspend schedules in inactive repositories. The timestamp in the live `status.json` is the source of truth. Scheduled artifacts are deployed directly and do not create repository commits; a checked-in snapshot changes only when a maintainer includes it in a commit.

The public endpoint must return 200 JSON without redirects:

```sh
node scripts/validate.mjs https://polang233.github.io/dsh-plugin-index/index.json
```

DSH caches a successful index for ten minutes. If a custom domain is added later, update the site URL, canonical metadata, sitemap, copy target and documentation together, then verify the final JSON URL.

## Package checks

Each listed release is checked for SHA-512 integrity, matching name and version, bundle patch files and any declared `main` file. The generator records the repository, declared license and installation lifecycle script names. It does not inspect all patch references, resolve all dependencies, run an installation or audit the code.

The validator is pinned to `@deepseek-ai/dsh-plugin-market-index@0.2.1-rc.2`. When updating it, rerun tests and verify the index in the target DSH release. The official [format guide](https://deepseek-harness.github.io/deepseek-harness/en/guide/plugin-market) and [reference generator](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/plugin-market-generator) describe the protocol.
