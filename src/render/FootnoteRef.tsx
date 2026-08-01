import {useEffect, useId, useState} from 'react'

import type {CollectedFootnote} from '../lib/types'
import {NoteText, noteToPlainText} from './NoteText'
import {SourceLine} from './SourceLine'
import {ensureFootnoteStyles} from './styles'

/**
 * Props for {@link FootnoteRef}.
 *
 * @public
 */
export interface FootnoteRefProps {
  entry: CollectedFootnote
  /** `_key` of this particular marked spot — several can share one footnote. */
  occurrenceKey: string
  /** Turns the marker's number into its label. Defaults to `1`, `2`, `3`, … */
  formatNumber?: (number: number) => string
  /** Show the note on hover and focus. Defaults to `false`. */
  popover?: boolean
  /** Adds the structural stylesheet to the document. Defaults to `true`. */
  injectStyles?: boolean
  formatDate?: (date: Date) => string
  labels?: {marker?: (number: number) => string}
}

/**
 * The marker in the running text: a superscript number linking to the entry in
 * the footnote list. Works without JavaScript — the popover is an extra, not a
 * replacement.
 *
 * @public
 */
export function FootnoteRef(props: FootnoteRefProps): React.JSX.Element {
  const {
    entry,
    occurrenceKey,
    formatNumber = (number: number) => String(number),
    popover = false,
    injectStyles = true,
    formatDate,
    labels,
  } = props

  const [open, setOpen] = useState(false)
  const popoverId = useId()

  useEffect(() => {
    if (injectStyles) ensureFootnoteStyles()
  }, [injectStyles])

  const occurrence =
    entry.occurrences.find((item) => item.key === occurrenceKey) ?? entry.occurrences[0]
  const label = labels?.marker?.(entry.number) ?? `Footnote ${entry.number}`
  const description = noteToPlainText(entry.value.text)

  return (
    <span
      className={`sgn-footnote-ref${popover ? ' sgn-footnote-ref--popover' : ''}`}
      onMouseEnter={popover ? () => setOpen(true) : undefined}
      onMouseLeave={popover ? () => setOpen(false) : undefined}
    >
      <a
        id={occurrence?.refId}
        className="sgn-footnote-ref__link"
        href={`#${entry.id}`}
        aria-label={label}
        aria-describedby={popover && open ? popoverId : undefined}
        title={popover ? undefined : description || undefined}
        onFocus={popover ? () => setOpen(true) : undefined}
        onBlur={popover ? () => setOpen(false) : undefined}
      >
        {formatNumber(entry.number)}
      </a>

      {popover && open && (
        <span className="sgn-footnote-ref__popover" id={popoverId} role="tooltip">
          <NoteText value={entry.value.text} />{' '}
          <SourceLine value={entry.value} formatDate={formatDate} />
        </span>
      )}
    </span>
  )
}
