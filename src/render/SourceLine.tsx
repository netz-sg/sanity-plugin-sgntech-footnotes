import {sourceOf} from '../lib/source'
import type {FootnoteValue} from '../lib/types'

/**
 * Renders the source of a footnote: the linked title, then publisher and date.
 * Renders nothing when the footnote is a plain note.
 *
 * @public
 */
export function SourceLine(props: {
  value: FootnoteValue
  formatDate?: (date: Date) => string
}): React.JSX.Element | null {
  const source = sourceOf(props.value, props.formatDate)
  if (!source) return null

  const meta = [source.publisher, source.date].filter(Boolean).join(', ')

  return (
    <span className="sgn-footnotes__source">
      {source.label &&
        (source.url ? (
          <a href={source.url} rel="noreferrer noopener" target="_blank">
            {source.label}
          </a>
        ) : (
          source.label
        ))}
      {source.label && meta ? ', ' : null}
      {meta}
      {'.'}
    </span>
  )
}
