---
name: Example October news post
subtitle: A post that opens with a full-width photo
meta_description: Example news post with a full-width photo header, an upcoming dates list, and a button.
thumbnail: /images/placeholders/orange.svg
blocks:
  - type: image-background
    image: /images/placeholders/yellow.svg
    image_alt: Placeholder image - replace with a photo from the event
    tint: true
    parallax: true
    content: |
      # Example October news post
  - type: news-meta
  - type: markdown
    content: |
      The header above is one `image-background` block: any photo from
      `src/images/`, with a tint so the title stays readable and an optional
      parallax drift as you scroll.

      A list is an easy post when there is not much to say:

      - Where we will be next weekend
      - Which games are coming with us
      - How to have a go
  - type: link-button
    text: See all the games
    href: /games-sales/
  - type: markdown
    content: |
      *How this works: this post is
      `src/news/2026-10-02-example-october-news-post.md`. The header is the
      `image-background` block, the button is a `link-button`. See the
      [Site Guide](/site-guide/).*
---
