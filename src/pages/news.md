---
name: News
meta_title: News – WibbleJelly Games
permalink: /news/
eleventyNavigation:
  key: News
  order: 3
blocks:
  - type: hero
    content: |
      # News

      Recent posts. The three marked "Example" are placeholders showing what a
      post can look like; write-ups of real jobs replace them.
  - type: items
    collection: news
    masonry: true
  - type: callout
    variant: info
    icon: hugeicons:information-circle
    name: How this page works
    content: |
      Every file in `src/news/` named `YYYY-MM-DD-slug.md` is listed here
      automatically, newest first. The filename date is the published date. See
      the [Site Guide](/site-guide/) for the full recipe.
---
