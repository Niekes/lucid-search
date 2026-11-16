---
layout: home
hero:
    name: lucid-search
    tagline: Find matches in text and highlight them safely. Zero dependencies, about 1 kB.
    actions:
        - theme: brand
          text: Get started
          link: /guide/getting-started
        - theme: alt
          text: Playground
          link: /playground
features:
    - title: Positions, not HTML
      details: findRanges and toSegments return plain data, so React and other frameworks render matches without dangerouslySetInnerHTML.
    - title: Accent-insensitive
      details: '"cafe" matches "Café", "lodz" matches "Łódź" and "strasse" matches "Straße".'
    - title: Ranked results
      details: score() ranks a haystack by how long its matches are and how early they appear.
---
