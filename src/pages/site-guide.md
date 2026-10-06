---
name: Site Guide
meta_title: Site Guide – how to grow this site
permalink: /site-guide/
no_index: true
eleventyNavigation:
  key: Site Guide
  order: 6
blocks:
  - type: hero
    content: |
      # Site Guide

      How to add and change content on wibblejellygames.com. This page is for
      you, not for visitors: search engines are told to skip it, and you can
      delete it once the site is how you want it.
  - type: markdown
    content: |
      ## Where things live

      | What | Where | Where it shows up |
      | --- | --- | --- |
      | Permanent pages | `src/pages/anything.md` | In the menu (if listed), search, sitemap |
      | News posts | `src/news/2026-09-24-slug.md` | `/news/`, the [feed](/feed.xml), sitemap |
      | Reusable blocks | `src/snippets/name.md` | Wherever a `snippet` block references them |
      | Images | `src/images/photo.jpg` | As `/images/photo.jpg` in any block |
      | PDFs and files | `src/files/doc.pdf` | As `/files/doc.pdf` in a `downloads` block |

      Every page and post is a markdown file whose frontmatter holds a list of
      blocks. Save a file and the site rebuilds; push and CI builds and
      deploys it.
  - type: code-block
    filename: a minimal page (src/pages/example.md)
    language: yaml
    code: |-
      ---
      name: Example
      permalink: /example/
      meta_title: Example – WibbleJelly Games
      meta_description: One honest sentence for search results and social shares.
      blocks:
        - type: hero
          content: |
            # Example
        - type: markdown
          content: |
            Paragraph text.
      ---
  - type: markdown
    content: |
      ## Choosing a block

      | You want | Use |
      | --- | --- |
      | An opening banner with buttons | `hero` |
      | Paragraphs and headings | `markdown` |
      | Text beside a photo | `split-image` |
      | A grid of photos with captions | `gallery` |
      | Cards linking to the games | `image-cards` |
      | Big numbers from an event | `stats` |
      | Question / answer pairs | `faqs` |
      | A note, tip, or quote | `callout` |
      | A closing button | `cta` or `link-button` |
      | A file list (info sheets, risk assessments) | `downloads` |

      Every block, with all of its fields and the exact YAML it accepts, is
      listed in the generated block reference in the repository
      (`skills/cfa-static-site-builder/references/blocks.md`). Copy an
      example from there, paste it into the `blocks:` list, change the words.
      An unknown block name or a missing required field fails the build
      loudly, so typos cannot ship silently.
  - type: markdown
    content: |
      ## News posts

      Add a file to `src/news/` named `YYYY-MM-DD-slug.md` and it appears on
      the news page at `/news/`, in the [feed](/feed.xml), and in the
      sitemap; the filename date is the published date. The three posts
      marked "Example" there are working templates to copy.

      A steady one post a month beats five in a week. Each post is a fresh
      page for search engines to rank and a reason for the feed to be read.
      The case study shape is the one to repeat: what the job was, the
      numbers, your photos, and a link to each game used.
  - type: markdown
    content: |
      ## SEO checklist

      - **One H1 per page.** The `#` heading in the hero; section headings
        start at `##`.
      - **`meta_title`.** Keep the existing pattern (`Page – WibbleJelly
        Games`) and keep it under about 60 characters.
      - **`meta_description`.** One or two honest sentences; search engines
        show this under the link. Every page and post should have one.
      - **Link between pages.** News posts link to the games they mention and
        game pages link back. Use descriptive link text, never "click here".
      - **Alt text on every photo.** Describe what the photo shows in
        context, e.g. "SPLAT! Classic on a school summer fete stall".
      - **Real photos.** Your games, your events, your customers (with
        permission). Stock images read as filler to visitors and search
        engines alike.
      - **Renamed a URL?** Add the old one under `redirect_from:` in the
        frontmatter so old links keep working.
      - **Utility pages.** Mark pages that have no search value with
        `no_index: true`, like this one.

      The titles, descriptions, dates, and images all feed the structured
      data (JSON-LD) the template generates automatically, so filling them in
      is all the SEO work there is.
  - type: callout
    variant: info
    icon: hugeicons:information-circle
    name: Editing through the CMS
    content: |
      Pages, news posts, and snippets can also be edited in the PagesCMS
      admin, which is generated from the same block schemas. The markdown
      files remain the source of truth either way.
---
