import {useEffect} from 'react'

import {collectFootnotes} from '../lib/collect'
import type {CollectedFootnote, CollectOptions} from '../lib/types'
import {NoteText} from './NoteText'
import {SourceLine} from './SourceLine'
import {ensureFootnoteStyles} from './styles'

/**
 * Props for {@link Footnotes}.
 *
 * @public
 */
export interface FootnotesProps extends CollectOptions {
  /**
   * The Portable Text the footnotes were collected from — the same value you
   * pass to your renderer. Alternatively hand over ready-made `items`.
   */
  value?: unknown
  /** Pre-collected footnotes, e.g. from `createFootnotes`. */
  items?: CollectedFootnote[]
  /** Heading above the list. Pass `null` to render none. */
  heading?: React.ReactNode
  /** Heading level. Defaults to `h2`. */
  headingLevel?: 'h2' | 'h3' | 'h4' | 'p'
  className?: string
  /** Adds the structural stylesheet to the document. Defaults to `true`. */
  injectStyles?: boolean
  formatDate?: (date: Date) => string
  /** Renders the note text. Defaults to the built-in renderer. */
  renderText?: (text: unknown) => React.ReactNode
  labels?: {backToText?: (number: number) => string}
}

const DEFAULT_BACK_LABEL = (number: number) => `Back to reference ${number} in the text`

/**
 * The footnote list, meant to sit at the end of an article. Every entry links
 * back to the spot in the text it belongs to; footnotes merged from several
 * spots get one backlink each, marked a, b, c.
 *
 * @public
 */
export function Footnotes(props: FootnotesProps): React.JSX.Element | null {
  const {
    value,
    items: providedItems,
    heading,
    headingLevel: Heading = 'h2',
    className,
    injectStyles = true,
    formatDate,
    renderText,
    labels,
    ...collectOptions
  } = props

  useEffect(() => {
    if (injectStyles) ensureFootnoteStyles()
  }, [injectStyles])

  const items = providedItems ?? collectFootnotes(value, collectOptions).items
  if (items.length === 0) return null

  const backLabel = labels?.backToText ?? DEFAULT_BACK_LABEL

  return (
    <section className={className ? `sgn-footnotes ${className}` : 'sgn-footnotes'}>
      {heading ? <Heading className="sgn-footnotes__heading">{heading}</Heading> : null}

      <ol className="sgn-footnotes__list">
        {items.map((entry) => (
          <li className="sgn-footnotes__item" id={entry.id} key={entry.key} value={entry.number}>
            {renderText ? renderText(entry.value.text) : <NoteText value={entry.value.text} />}{' '}
            <SourceLine value={entry.value} formatDate={formatDate} />
            {entry.occurrences.map((occurrence, index) => (
              <a
                key={occurrence.key}
                className="sgn-footnotes__backlink"
                href={`#${occurrence.refId}`}
                aria-label={backLabel(entry.number)}
              >
                <span aria-hidden="true">
                  ↩{entry.occurrences.length > 1 ? String.fromCharCode(97 + index) : ''}
                </span>
              </a>
            ))}
          </li>
        ))}
      </ol>
    </section>
  )
}
