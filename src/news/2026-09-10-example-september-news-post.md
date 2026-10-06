---
name: Example September news post
subtitle: The standard post layout
meta_description: Example news post showing the standard layout - heading, date, short text, a photo, and a closing button.
thumbnail: /images/placeholders/blue.svg
blocks:
  - type: hero
    content: |
      # Example September news post
  - type: news-meta
  - type: markdown
    content: |
      This paragraph is placeholder copy. A real post is two or three short
      paragraphs: what the event was, which games went out, and one detail
      people remembered. Write it the way you would tell it to a customer on
      the phone; no more polish than that.
  - type: split-image
    figure_src: /images/placeholders/green.svg
    figure_alt: Placeholder image - replace with a photo of the game in use
    figure_caption: Placeholder - swap this file for a photo in src/images/
    content: |
      ## Text beside a photo

      A `split-image` block puts text next to a picture. Point `figure_src` at
      any file in `src/images/`.
  - type: cta
    content: |
      Close with one clear next step.
    button:
      text: Contact Us
      href: /contact/
      variant: primary
  - type: markdown
    content: |
      *How this works: this post is
      `src/news/2026-09-10-example-september-news-post.md`. Copy it, rename it
      with a new date, edit the blocks; it then appears on
      [the news page](/news/) and in the [feed](/feed.xml). More detail in the
      [Site Guide](/site-guide/).*
---
