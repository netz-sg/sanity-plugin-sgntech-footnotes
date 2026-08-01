import {collectFootnotes} from '../lib/collect'
import {keyOf} from '../lib/keys'
import type {CollectedFootnote, CollectOptions, FootnoteCollection} from '../lib/types'
import {FootnoteRef} from './FootnoteRef'
import {Footnotes, type FootnotesProps} from './Footnotes'

/**
 * Options for {@link createFootnotes}.
 *
 * @public
 */
export interface CreateFootnotesOptions extends CollectOptions {
  /** Turns a number into the marker's label. Defaults to `1`, `2`, `3`, … */
  formatNumber?: (number: number) => string
  /** Show the note on hover and focus. Defaults to `false`. */
  popover?: boolean
  /** Adds the structural stylesheet to the document. Defaults to `true`. */
  injectStyles?: boolean
  formatDate?: (date: Date) => string
  labels?: {marker?: (number: number) => string}
}

/**
 * What {@link createFootnotes} hands back.
 *
 * @public
 */
export interface FootnotesRenderKit {
  /** Footnotes in the order they appear, already numbered. */
  items: CollectedFootnote[]
  /** The raw collection, for lookups by annotation key. */
  collection: FootnoteCollection
  /** Drop into the `marks` of your Portable Text renderer. */
  marks: Record<
    string,
    (props: {value?: unknown; markKey?: string; children?: React.ReactNode}) => React.JSX.Element
  >
  /** The list, already bound to these footnotes. */
  List: (props: Omit<FootnotesProps, 'value' | 'items'>) => React.JSX.Element | null
}

/**
 * Numbers the footnotes of a document once and returns everything needed to
 * render them: the mark component for the running text and the list for the end
 * of the article.
 *
 * Numbering happens here, in one pass over the text, which is why the marker and
 * the list can never disagree.
 *
 * @example
 * ```tsx
 * const footnotes = createFootnotes(article.body)
 *
 * <PortableText value={article.body} components={{marks: footnotes.marks}} />
 * <footnotes.List heading="Sources" />
 * ```
 *
 * @public
 */
export function createFootnotes(
  value: unknown,
  options: CreateFootnotesOptions = {},
): FootnotesRenderKit {
  const {
    typeName = 'footnote',
    mergeDuplicates,
    idPrefix,
    formatNumber,
    popover,
    injectStyles,
    formatDate,
    labels,
  } = options

  const collection = collectFootnotes(value, {typeName, mergeDuplicates, idPrefix})

  function FootnoteMark(props: {
    value?: unknown
    markKey?: string
    children?: React.ReactNode
  }): React.JSX.Element {
    const key = props.markKey || keyOf(props.value)
    const entry = key ? collection.entryOf(key) : undefined

    if (!entry) return <>{props.children}</>

    return (
      <>
        {props.children}
        <FootnoteRef
          entry={entry}
          occurrenceKey={key}
          formatNumber={formatNumber}
          popover={popover}
          injectStyles={injectStyles}
          formatDate={formatDate}
          labels={labels}
        />
      </>
    )
  }

  function List(listProps: Omit<FootnotesProps, 'value' | 'items'>) {
    return (
      <Footnotes
        {...listProps}
        items={collection.items}
        formatDate={listProps.formatDate ?? formatDate}
        injectStyles={listProps.injectStyles ?? injectStyles}
      />
    )
  }

  return {
    items: collection.items,
    collection,
    marks: {[typeName]: FootnoteMark},
    List,
  }
}
