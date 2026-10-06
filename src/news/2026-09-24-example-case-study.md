---
name: Example case study
subtitle: A write-up of one job, with numbers and photos
meta_description: Example case study showing how to report a real job - key figures, a photo gallery, and links to the games used.
thumbnail: /images/placeholders/purple.svg
blocks:
  - type: hero
    content: |
      # Example case study
  - type: news-meta
  - type: markdown
    content: |
      A case study is a news post that reports one job: where it was, what went
      out, how it went. The numbers and quotes below are placeholders; keep
      the real ones honest and this page sells itself.
  - type: stats
    items:
      - value: "3"
        label: Games at the event
      - value: "600"
        label: Goes over the weekend
      - value: "2"
        label: Bookings taken on the day
  - type: gallery
    intro_content: |
      ## From the day

      Real photos of your games in use beat stock pictures every time. Write
      the captions too; search engines read them.
    aspect_ratio: 4/3
    items:
      - image: /images/placeholders/orange.svg
        caption: Placeholder - the set-up, before the doors open
      - image: /images/placeholders/pink.svg
        caption: Placeholder - mid-game, with the queue behind
      - image: /images/placeholders/yellow.svg
        caption: Placeholder - the prize handover
  - type: image-cards
    intro_content: |
      ## The games we took

      Link every game you mention back to its page. Internal links are the
      cheapest SEO there is.
    items:
      - image: SPLAT_Classic.png
        name: SPLAT! – Classic
        description: The main attraction all weekend.
        link: /splat-classic/
      - image: StopTheClock.png
        name: Stop The Clock
        description: Steady queues all afternoon.
        link: /stop-the-clock/
  - type: callout
    variant: info
    name: From the organiser
    content: |
      *Placeholder quote. With permission, one or two sentences from the
      organiser in their own words carry more weight than anything you write
      yourself.*
  - type: markdown
    content: |
      *How this works: same file format as any news post
      (`src/news/2026-09-24-example-case-study.md`); the `stats`, `gallery`,
      `image-cards` and `callout` blocks do the layout. See the
      [Site Guide](/site-guide/).*
---
