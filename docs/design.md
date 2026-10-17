# DSH Plugin Index design contract

## Job

Connect a public plugin index to DeepSeek Harness and inspect its contents. The primary action is **Copy index URL**. English is the root page; Chinese lives at `/zh/`. Always copy `https://polang233.github.io/dsh-plugin-index/index.json`.

## Direction

A compact software directory with an address-first opening. A large plain headline and one long address field ending in a blue copy button are the main visual moment. The plugin directory uses rows with real names, descriptions, source links and versions. A concise footer states the scope of published-package checks.

Palette: paper `#ffffff`, mist `#eef3f8`, ink `#18334d`, slate `#526779`, index blue `#2458c6`, divider `#cbd7e2`.

Type: Segoe UI Variable / Segoe UI / system sans-serif, with PingFang SC / Microsoft YaHei for Chinese. Monospace only for literal package identifiers and the URL. Strong headlines, compact labels and paragraph measures below roughly 65 characters.

Left-aligned layout:

```text
[index mark] DSH Plugin Index       Plugins  Docs  GitHub  EN / 中文

Add one URL to DSH.                 Short explanation
[ canonical index URL                              Copy URL ]

1 Open Plugins      2 Add an index source      3 Paste and browse

Plugin directory                   Search [          ]
Categories [        ]              Name / summary / source     version
                                   Name / summary / source     version

Submit a plugin       Read the docs       Repository
Independent community index. Updated date / verification scope.
```

On mobile the headline and explanation stack; the copy button sits below a selectable URL; steps become a vertical ordered list; filters stack; source and version details wrap. No horizontal page scrolling.

## Product choices

The literal address is the memorable object. Three numbered steps encode the connection sequence. Categories come from the index. Roomy list rows support both small and large directories. The original index mark uses three horizontal entries inside an open directory bracket. A single blue action color ties the mark, primary control, links and keyboard focus together.

## Interaction contract

Both languages are pre-rendered and retain all directory content without JavaScript. Search and category selection progressively enhance the existing list and announce result counts. Empty results include a clear-filters action. Copy success is announced; failure selects the read-only URL and explains how to copy manually. All controls have visible focus, semantic labels and adequate touch targets. Assets use relative URLs so both pages open from file or a static host. Plugin text is escaped; links accept only HTTP(S). SEO includes canonical and alternate languages, Open Graph and an original SVG illustration with a PNG export for sharing previews.

## Verification

Inspect both generated HTML files and local asset paths. Exercise search/category/reset, copy failure, keyboard navigation, 390px mobile and 1440px desktop. Check the full published directory with real long names and Chinese descriptions. The footer explains that package checks are not runtime installation tests or security audits.
