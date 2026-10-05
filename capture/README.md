# Capture — wibblejellygames.com

Local mirror of https://wibblejellygames.com captured **2026-10-05** as read-only
ground truth for a page-for-page rebuild on CfA Static (fork lives in
`../cfa-static/`). Nothing here is meant to be committed, pushed, or shipped.

- Method: Bun + linkedom crawler (`tools/crawl.ts`), sequential with 250 ms
  delay, UA `wibble-jelly-games-mirror/1.0 (local site capture; CfA Static
  rebuild groundwork)`.
- No `robots.txt` (404). No sitemap: probed `/sitemap.xml`,
  `/wordpress/wp-sitemap.xml`, `/wordpress/sitemap.xml` — all 404. Crawl roots:
  bare root, `/wordpress/`, `/wordpress/index.php`, both RSS feeds; all other
  URLs discovered from page links and feed items.

## Layout

| Path | Contents |
| --- | --- |
| `raw/` | Raw HTML per page, canonical bytes; RSS feeds as `.xml` |
| `inventory/` | DOM-order content inventory per page (inline links/bold preserved; images with dimensions/srcset; forms, buttons, landmarks) |
| `audit/` | Per-page authoritative link table (every `<a>` with text, raw href, resolved URL, kind) + `extractor-check.json` |
| `assets/` | Same-host assets under original filenames, origin path preserved |
| `assets.json` | Asset manifest (url, saved path, bytes, content-type) + third-party references |
| `palette-typography.md` | Colors / font families / sizes / weights by declaration frequency |
| `manifest.json` | Per-URL capture record (final URL, redirects, title, meta description, timestamps), feeds, redirect map |
| `tools/` | `crawl.ts`, `inventory.ts`, `assets.ts`, `palette.ts` — re-runnable |

## Page index (19 pages, single language: en-GB, no page pairs)

| File | Final URL (`https://wibblejellygames.com/wordpress/…`) | Title | Note |
| --- | --- | --- | --- |
| index.html | `/` | WibbleJelly Games – Hands on games and activities for all ages | Static front page (page_id 71); featured-page teasers |
| page-76.html | `?page_id=76` | Games Sales | Product grid; parent menu item |
| page-52.html | `?page_id=52` | SPLAT! – Classic | YouTube embed |
| page-365.html | `?page_id=365` | SPLAT! – Mono | YouTube embed |
| page-9.html | `?page_id=9` | Spot On! | |
| page-774.html | `?page_id=774` | Spot On! – Challenge | Not in primary menu |
| page-743.html | `?page_id=743` | Stop The Clock | YouTube embed; 3 dead buttons |
| page-386.html | `?page_id=386` | Frustration | |
| page-840.html | `?page_id=840` | Whack It! | |
| page-714.html | `?page_id=714` | Hole In One | |
| page-400.html | `?page_id=400` | Crack The Code | |
| page-847.html | `?page_id=847` | Kaboom – Space! | Not in primary menu |
| page-27.html | `?page_id=27` | Terms & Conditions – Games Sales | Parent of FAQ + Privacy in menu |
| page-583.html | `?page_id=583` | Frequently Asked Questions | |
| page-120.html | `?page_id=120` | Privacy Policy & Cookies | |
| page-31.html | `?page_id=31` | About Us | |
| page-35.html | `?page_id=35` | Contact | mailto + phone; separate from sales form |
| page-448.html | `?page_id=448` | Contact Form – Games Sales | Everest Forms (server-side) |
| post-567.html | `?p=567` | Everyone Hates Queuing When They Are Having Fun | Only post; 2020-05-19 |

## Redirect map (verified)

| From | Chain |
| --- | --- |
| `https://wibblejellygames.com/` | 301 → `/wordpress/index.php` → 301 → `/wordpress/` → 200 |
| `https://wibblejellygames.com/wordpress/index.php` | 301 → `/wordpress/` → 200 |
| `http://wibblejellygames.com/…` | 301 → https, then as above |
| `https://www.wibblejellygames.com/` | connection failed (www does not resolve) |

## Structure and chrome

- WordPress 7.1.2, Radiate theme (ThemeGrill). All URLs are query-string form
  (`?page_id=N`, `?p=N`); no pretty permalinks.
- Header: site title (H1 link) + tagline "Hands on games and activities for all
  ages", header search form, primary menu with two nested groups: Games Sales →
  8 game pages; Terms & Conditions – Games Sales → FAQ, itself (self-link, as
  built), Privacy Policy & Cookies.
- Footer: "Copyright © 2026 WibbleJelly Games. All rights reserved. Theme:
  Radiate by ThemeGrill. Powered by WordPress." + scroll-up link.
- Cookie notice banner (Cookie Notice plugin): "We use cookies…" with Ok /
  Privacy policy buttons.
- Sidebar: search widget (front page area).

## Oddities and placeholders (report, do not silently fix)

- **No meta descriptions on any page** (title only).
- **Dead href-less buttons** on Stop The Clock: "Product Info Sheet", "Manual",
  "Risk Assessment" — `<a class="wp-block-button__link">` with no `href`.
- Server-side features that a static rebuild must replace or drop: Everest
  Forms contact form (page-448), site search (header + widget), comment form
  scaffolding on the post page.
- Third-party embeds (recorded, not downloaded): 3 YouTube oEmbed iframes, 2
  distinct videos — `lnbYtU7vJVo` on both SPLAT! pages (page-365, page-52),
  `nEjpdMJ1kvI` on Stop The Clock (page-743); Google Fonts CSS for Roboto +
  Merriweather (300/400); `gmpg.org` profile link in every head.
- PDFs (downloaded, first-party): 8 product documents under
  `/wordpress/wp-content/uploads/docs/` (ProductInfo/Manual/RA for SPLAT!,
  Crack The Code, Spot On!, Frustration) + `OOPs_UnderConstruction.pdf` in the
  uploads root.
- Site dormant since 2020-05-19 (only post); feed `lastBuildDate` 2020-05-20.
  Footer year renders 2026 (dynamic).
- Asset sizes: 82 same-host assets, ~16.8 MiB (40 PNG, 9 PDF, 13 JS, 6 CSS,
  fonts eot/ttf/woff, 4 SVG).

## Extractor audit

19/19 pages: parsed `<a href>` count equals raw href-bearing `<a>` tag count
(see `audit/extractor-check.json` for per-page counts and link kinds). The
initial mismatch (+9 per page) was the WordPress `<head>` `<link rel=…>`
boilerplate (feeds, oEmbed, canonical, shortlink, api.w.org, RSD, wlwmanifest),
not dropped content links.
