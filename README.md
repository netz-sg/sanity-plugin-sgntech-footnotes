<!-- Social preview / OpenGraph image -->
<p align="center">
  <img src="https://raw.githubusercontent.com/netz-sg/sanity-plugin-sgntech-footnotes/main/assets/og-image.png" alt="sanity-plugin-sgntech-footnotes — footnotes and sources for Sanity Studio" width="640" />
</p>

<h1 align="center">sanity-plugin-sgntech-footnotes</h1>

<p align="center">
  Footnotes and sources for Sanity Studio — mark a passage, write the note. Numbering is derived from the text, so it can never drift.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/sanity-plugin-sgntech-footnotes"><img alt="npm version" src="https://img.shields.io/npm/v/sanity-plugin-sgntech-footnotes.svg?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/npm/l/sanity-plugin-sgntech-footnotes.svg?style=flat-square" /></a>
</p>

---

## What you get

- A `footnote` annotation for Portable Text — select a passage, write the note, done.
- **Numbers are never stored.** They are counted from the position in the text at render time. Move a paragraph, delete a note, insert one in the middle: markers and list always agree, with no migration and no sync logic.
- **The live number shows up in the editor**, on the annotated text, so writers see what a passage will be numbered while they work.
- A note is a small Portable Text field (bold, italic, links) plus optional structured source fields: title, URL, publisher, date.
- `sanity-plugin-sgntech-footnotes/render` — marker component and footnote list for the frontend, with backlinks from every entry to the spot in the text. That entry point does **not** import `sanity`, so your app bundle stays clean.
- Anchor ids are built from the annotation's `_key`, so a shared link to a footnote survives reordering — even when its number changes.
- Optional: merge repeated sources into one entry (`↩ᵃ ↩ᵇ`), and a popover on the marker.
- **Design-agnostic.** The stylesheet only handles structure — no colours, no fonts. Everything inherits from your page.

## Installation

```sh
npm install sanity-plugin-sgntech-footnotes
```

Requires Sanity Studio v5 or v6 and React 18 or 19. No runtime dependencies.

📦 On npm: [sanity-plugin-sgntech-footnotes](https://www.npmjs.com/package/sanity-plugin-sgntech-footnotes)

## Usage in the Studio

Add the plugin, then register the annotation in the block type it should be available in:

```ts
// sanity.config.ts
import {defineArrayMember, defineConfig, defineField} from 'sanity'
import {footnotes} from 'sanity-plugin-sgntech-footnotes'

export default defineConfig({
  // ...
  plugins: [footnotes()],

  schema: {
    types: [
      {
        type: 'document',
        name: 'article',
        fields: [
          defineField({
            type: 'array',
            name: 'body',
            of: [
              defineArrayMember({
                type: 'block',
                marks: {
                  annotations: [
                    {type: 'footnote'}, // ← the footnote
                  ],
                },
              }),
            ],
          }),
        ],
      },
    ],
  },
})
```

Writers select a passage, pick **Footnote** from the annotation menu and fill in the note, the
source, or both. An empty footnote fails validation.

### Options

```ts
footnotes({
  name: 'footnote', // schema type name
  title: 'Footnote', // label in the annotation menu
  sourceFields: true, // offer title / URL / publisher / date
  showNumberInEditor: true, // live number on the annotated text
})
```

### Stored value

Footnotes live in the block's `markDefs`, like any other annotation. No number is stored:

```json
{
  "_type": "footnote",
  "_key": "a1b2",
  "text": [{"_type": "block", "children": [{"_type": "span", "text": "See the booklet, p. 4."}]}],
  "sourceTitle": "Tour announced",
  "sourceUrl": "https://example.com/tour",
  "publisher": "Rolling Stone",
  "date": "2026-07-14"
}
```

## Rendering in your frontend

Number once, render twice — the marker in the text and the list at the end come from the same pass,
which is why they can never disagree:

```tsx
import {PortableText} from '@portabletext/react'
import {createFootnotes} from 'sanity-plugin-sgntech-footnotes/render'

export function Article({body}) {
  const footnotes = createFootnotes(body)

  return (
    <article>
      <PortableText value={body} components={{marks: footnotes.marks}} />
      <footnotes.List heading="Sources" />
    </article>
  )
}
```

Merge it with your own mark components when you have more annotations:

```tsx
const components = {
  marks: {
    ...footnotes.marks,
    link: MyLink,
  },
}
```

### Options

```tsx
const footnotes = createFootnotes(body, {
  typeName: 'footnote', // must match the schema type name
  mergeDuplicates: 'url', // 'none' (default) or 'url'
  idPrefix: 'article-42', // keeps anchors unique when a page shows several articles
  formatNumber: (n) => String(n), // e.g. (n) => '[' + n + ']'
  popover: false, // show the note on hover and focus
  formatDate: (date) => date.toLocaleDateString('en-GB'),
  injectStyles: true,
})
```

### The list

```tsx
<footnotes.List
  heading="Sources"
  headingLevel="h2"
  labels={{backToText: (n) => `Back to reference ${n}`}}
  formatDate={(date) => date.toLocaleDateString('en-GB')}
  renderText={(text) => <PortableText value={text} />} // optional: render notes yourself
/>
```

Rendering the list somewhere else entirely — a sidebar, a print stylesheet, a second column — works
too, since `<Footnotes value={body} />` can collect on its own.

### Helpers

```ts
import {collectFootnotes, sourceOf} from 'sanity-plugin-sgntech-footnotes/render'

const {items, numberOf} = collectFootnotes(body, {mergeDuplicates: 'url'})
items[0].number // 1
numberOf('a1b2') // number of a given annotation key
```

`collectFootnotes` also accepts several Portable Text arrays at once, for articles whose text is
split across fields:

```ts
collectFootnotes([article.intro, article.body])
```

## Styling

Structural CSS only, injected once, overridable through custom properties:

```css
.sgn-footnote-ref {
  --sgn-footnote-marker-size: 0.75em;
  --sgn-footnote-marker-gap: 0.1em;
}

.sgn-footnotes {
  --sgn-footnotes-gap: 0.5rem;
  --sgn-footnotes-size: 0.875em;
  --sgn-footnotes-marker-gap: 0.75rem;
  --sgn-footnotes-target-highlight: color-mix(in srgb, currentColor 12%, transparent);
  --sgn-footnotes-scroll-margin: 2rem;
}
```

Class names: `sgn-footnote-ref`, `__link`, `__popover`, `sgn-footnotes`, `__heading`, `__list`,
`__item`, `__source`, `__backlink`. The entry you jumped to is matched by `:target`.

Pass `injectStyles={false}` to ship the CSS yourself; `footnoteStyles` exports the default as a
string.

## Accessibility

- The marker is a plain link and works without JavaScript. The popover is an addition, never a
  replacement.
- Markers carry a label (`Footnote 3`), backlinks explain where they lead — both overridable through
  `labels` for any language.
- The list is an ordered list, so screen readers announce the numbering.
- Jumping to a footnote highlights it via `:target`; `scroll-margin` keeps it clear of sticky headers.

## Develop

```sh
npm install
npm test            # unit tests for numbering, merging and source formatting
npm run lint
npm run build
npm run link-watch  # build + publish to a local yalc repo for Studio testing
```

Built with [@sanity/plugin-kit](https://github.com/sanity-io/plugins/tree/main/packages/@sanity/plugin-kit).

## License

[MIT](LICENSE) © SGNTech
