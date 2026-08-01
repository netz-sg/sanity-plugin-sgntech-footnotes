/**
 * Superscript-marker glyph, drawn to match the stroke weight of `@sanity/icons`
 * (which ships no footnote icon of its own).
 */
export function FootnoteIcon(): React.JSX.Element {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 25 25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-sanity-icon="footnote"
    >
      <path d="M5 8.5h8M5 12.5h8M5 16.5h5" />
      <path d="M17.2 5.2c1.6-.7 3.3.2 3.3 1.6 0 1.5-2.1 2-3.4 3.6h3.6" strokeLinecap="round" />
    </svg>
  )
}
