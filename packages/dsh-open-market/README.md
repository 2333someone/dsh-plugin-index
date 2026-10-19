# dsh-open-market

Brings [Open Plugin Market](https://dshopen.org/) into DeepSeek Harness. This community plugin index puts fast-growing, actively maintained and newly published plugins first, so small developers get seen.

把开放插件市场加入 DeepSeek Harness 的「发现」。推荐偏向近期增长快、更新勤、刚上架的插件，让小开发者也能被看到。

## Install / 安装

1. In DSH, open **Plugins → Experimental plugins** and turn on **Custom plugin markets**.
   在 DSH **插件 → 实验性插件** 中打开 **自定义插件市场**。
2. Install the plugin from GitHub / 从 GitHub 安装插件:

```bash
dsh plugin --profile desktop add "git+https://github.com/polang233/dsh-plugin-index.git#main&path:/packages/dsh-open-market"
```

On the next start, `https://dshopen.org/index.json` appears in **Discover**.
重启后，「发现」的索引源里会出现开放插件市场。

## Behavior / 行为

- Adds the index once per profile, after your existing sources. It never duplicates a source.
- If you remove the source later, it stays removed. The plugin keeps a small marker file, `.dsh-open-market.json`, in the profile directory.
- It waits for the Custom plugin markets service and does nothing while that bundle is off.
- It sends no network requests of its own. DSH fetches the index.

- 每个 profile 只添加一次，追加在已有索引源之后，不会重复。
- 之后删掉索引源不会被加回来。插件会在 profile 目录中记录 `.dsh-open-market.json`。
- 依赖「自定义插件市场」，关闭时插件不做任何事。
- 插件本身不发网络请求，索引由 DSH 读取。

To use a mirror, override the row in your profile's `cordis.patch.yml`:

```yaml
- id: dsh-open-market
  name: dsh-open-market
  config:
    indexUrl: https://example.com/index.json
```

GPL-3.0
