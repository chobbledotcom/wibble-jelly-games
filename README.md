# WibbleJelly Games

Static site for **WibbleJelly Games** — <https://wibblejellygames.com> — a
manufacturer of hands-on games and activities for the activities hire
industry. Built on [Eleventy](https://www.11ty.dev/) as a fork of
[CfA Static](https://github.com/codeforamerica/cfa-static), rebuilt
page-for-page from a capture of the previous WordPress site.

The capture that is this site's content source of truth lives outside the
repo at `../capture/` (snapshot taken 2026-10-05: raw HTML per page, DOM-order
inventories, link audits, assets, palette/typography). Re-capture the live
site before making content edits that must match it; later edits to the live
WordPress site are out of scope until someone re-captures.

## Provenance

Forked from CfA Static. Template updates arrive only through a reviewed
`upstream` merge — do not expect or pull automatic updates.

## What this fork changes from the template

- **Collections/CMS**: `pages`, `snippets`, `news` only; the guide collections
  and their demo content, listing page, and nav entries are deleted. CMS
  features: `permalinks` and `redirects` enabled; `faqs`, `galleries`,
  `external_navigation_urls`, `no_index` disabled (no source feature needs
  them). Set via `npm run customise-cms`.
- **Identity**: `src/_data/site.json` — WibbleJelly Games, canonical URL
  `https://wibblejellygames.com`, tagline description. No logo (the source
  header is a text site title; its tagline is `display:none` in the source
  theme, so none is rendered). No footer socials (the source footer has
  none).
- **Theme**: `src/css/theme.scss` sets tokens mapped from the captured
  Radiate theme — `#632e9b` links/buttons/accent, `#444444` body text,
  `#999999` muted, `#eaeaea` 1px borders, white background, 1218px content
  width, Roboto everywhere — plus a deliberate pro polish on top of the
  capture: 6px radii, brand-tinted hover background, a darker link hover
  (the source kept link colour unchanged on hover), and a soft shadow.
  `src/css/_fonts.scss` self-hosts
  Roboto 400 (latin + latin-ext) from `src/assets/fonts/`. The source also
  loads Merriweather from Google Fonts but uses it only for textarea styles,
  which a static site without forms has no equivalent of, so it is omitted.
- **Header**: `src/_includes/navigation-start.html` is overridden to render
  the site name as text (`site.json` has no logo). This is the template's
  documented override slot.
- **Search**: client-side search over `pages` and `news`
  (`config.search_collections`); the search page is kept at `/search/` and
  adds the search field to the menu. The source's search was server-side
  WordPress search; index coverage (pages + news) matches its scope.
- **Breadcrumbs off** (`show_breadcrumbs: false`) — the source shows no
  breadcrumb trail.
- **Redirects**: the home page carries `redirect_from: /wordpress/` (the
  old front-page path). The bare root and `/wordpress/index.php` chains
  from the capture are covered by the new root permalink; the old
  `?page_id=N` / `?p=N` query-string URLs cannot be represented as static
  redirect pages and are a known cutover limitation (see `../capture/README.md`
  for the full URL map).

### Deliberate content differences from the source

- **No meta descriptions** on any page — the source publishes none; only
  `site.json` `description` (the tagline) exists for feeds/schema.
- The two Everest Forms contact forms (`/contact/`,
  `/contact-form-games-sales/`) are not reproduced: a static site cannot
  process forms. Each page keeps its verbatim contact/company text and adds
  an info callout pointing at the real routes (email, phone, contact page).
- The three href-less placeholder buttons on Stop The Clock ("Product Info
  Sheet", "Manual", "Risk Assessment") are rendered as plain text — the
  source renders them as buttons with no destination.
- The source footer's theme credit ("Theme: Radiate … Powered by
  WordPress") and the Cookie Notice banner are dropped: the first is old
  platform attribution, the second exists only because WordPress set
  cookies.
- **Product page layout**: the captured copy is re-presented with the
  template's block layout — a split-image lead carrying the contact button,
  the dimension and power tables as a split-full two-panel section, and a
  closing call-to-action banner — instead of the source's single text block.
  All wording is preserved verbatim.
- Source typos and stale claims are preserved verbatim (e.g. "colourfull",
  "SPLAT! Classis", "I have know this to fail"); do not fix them silently.

## Working on it

- Engineering policy and workflow: `CLAUDE.md`.
- Site Builder Reference (generated): `docs/developer-reference.md`.
- Content model (generated from the block schemas — the authority on block
  fields): `skills/cfa-static-site-builder/references/blocks.md`; schema
  modules live in `src/_lib/utils/block-schema/`.
- Site data: `src/_data/` (`site.json`, `config.json`, `meta.json`,
  `strings.json`). Pages live in `src/pages/` as block-only frontmatter;
  the one news post is in `src/news/`; footer copy is
  `src/snippets/footer-content.md`.
- Downloadable files (product PDFs) live in `src/files/` (passthrough) and
  are referenced by `downloads` blocks as `/files/<name>`; images live in
  `src/images/`.
- The CfA Static site-builder skill (`skills/cfa-static-site-builder/`)
  documents the general workflow, including site mirroring.

## Checks

- `npm run build` — Eleventy build plus the internal-link check; fails on
  unknown block types/keys, schema violations, missing snippets, and
  missing `downloads` files.
- `npm run check:a11y`
- `npm run lint:scss`
- `npm run test`

Known-fail: none. The template's demo-content expectations are exercised by
`npm run test:fork` in CI; this fork's content lives in the repo and
`npm run build` validates it directly.

## Deployment

The site publishes to GitHub Pages on every push to `main` via
`.github/workflows/pages.yml`; Pages must be enabled with Source: GitHub
Actions under Settings → Pages (a one-time repository setting). The build
produces a static `_site/` directory — there is no application server.
`SITE_URL` is provided by `site.json` (`https://wibblejellygames.com`) and can
be overridden per environment; a Pages project subpath would additionally need
`PATH_PREFIX`.

## License

[MIT](LICENSE).
