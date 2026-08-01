/**
 * Structural CSS for the footnote marker and the list.
 *
 * No colours, no fonts, no borders that would clash with a design — everything
 * inherits from the page, and every value worth changing is a custom property.
 * All selectors are single classes, so your own stylesheet overrides them
 * without `!important`.
 *
 * @public
 */
export const footnoteStyles = `
.sgn-footnote-ref {
  --sgn-footnote-marker-size: 0.75em;
  --sgn-footnote-marker-gap: 0.1em;

  font-size: var(--sgn-footnote-marker-size);
  line-height: 0;
  vertical-align: super;
  margin-inline-start: var(--sgn-footnote-marker-gap);
  white-space: nowrap;
}

.sgn-footnote-ref__link {
  color: inherit;
  text-decoration: none;
  font-variant-numeric: tabular-nums;
}

.sgn-footnote-ref__link:hover,
.sgn-footnote-ref__link:focus-visible {
  text-decoration: underline;
}

.sgn-footnote-ref--popover {
  position: relative;
  display: inline-block;
}

.sgn-footnote-ref__popover {
  --sgn-footnote-popover-width: 22rem;

  position: absolute;
  bottom: calc(100% + 0.5em);
  inset-inline-start: 0;
  z-index: 10;
  width: max-content;
  max-width: min(var(--sgn-footnote-popover-width), 80vw);
  padding: 0.75em 0.9em;
  font-size: calc(1em / var(--sgn-footnote-marker-size));
  line-height: 1.45;
  vertical-align: baseline;
  text-align: start;
  white-space: normal;
  background: var(--sgn-footnote-popover-bg, Canvas);
  color: var(--sgn-footnote-popover-color, CanvasText);
  border: 1px solid var(--sgn-footnote-popover-border, currentColor);
  border-radius: var(--sgn-footnote-popover-radius, 0.25rem);
  box-shadow: var(--sgn-footnote-popover-shadow, 0 4px 16px rgba(0, 0, 0, 0.15));
}

.sgn-footnotes {
  --sgn-footnotes-gap: 0.5rem;
  --sgn-footnotes-size: 0.875em;
  --sgn-footnotes-marker-gap: 0.75rem;
  --sgn-footnotes-target-highlight: color-mix(in srgb, currentColor 12%, transparent);

  font-size: var(--sgn-footnotes-size);
  line-height: 1.5;
  color: inherit;
}

.sgn-footnotes__heading {
  font-size: 1em;
  margin: 0 0 var(--sgn-footnotes-gap);
}

.sgn-footnotes__list {
  margin: 0;
  padding-inline-start: 1.6em;
  display: flex;
  flex-direction: column;
  gap: var(--sgn-footnotes-gap);
}

.sgn-footnotes__item {
  padding-inline-start: var(--sgn-footnotes-marker-gap);
  scroll-margin-top: var(--sgn-footnotes-scroll-margin, 2rem);
}

/* Highlights the entry you just jumped to, then leaves it alone. */
.sgn-footnotes__item:target {
  background: var(--sgn-footnotes-target-highlight);
  border-radius: 0.2em;
}

.sgn-footnotes__source {
  opacity: 0.85;
}

.sgn-footnotes__backlink {
  margin-inline-start: 0.4em;
  color: inherit;
  text-decoration: none;
}

.sgn-footnotes__backlink:hover,
.sgn-footnotes__backlink:focus-visible {
  text-decoration: underline;
}
`

const STYLE_ELEMENT_ID = 'sgn-footnotes-styles'

/**
 * Adds {@link footnoteStyles} to the document once. Called automatically unless
 * you pass `injectStyles={false}` and ship the CSS yourself.
 *
 * @public
 */
export function ensureFootnoteStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ELEMENT_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ELEMENT_ID
  style.textContent = footnoteStyles
  document.head.appendChild(style)
}
