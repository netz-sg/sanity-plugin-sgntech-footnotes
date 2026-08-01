/**
 * The value stored by this plugin's `footnote` annotation.
 *
 * @public
 */
export interface FootnoteValue {
  _type?: string
  _key?: string
  /** The note itself, as Portable Text. */
  text?: unknown[]
  /** Title of the cited work or article. */
  sourceTitle?: string
  /** Link to the source. */
  sourceUrl?: string
  /** Publisher, outlet or author. */
  publisher?: string
  /** Publication date, `YYYY-MM-DD`. */
  date?: string
}

/**
 * One place in the text where a footnote is marked.
 *
 * @public
 */
export interface FootnoteOccurrence {
  /** `_key` of the annotation as stored in `markDefs`. */
  key: string
  /** `id` of the marker element, used as the backlink target. */
  refId: string
}

/**
 * A footnote after numbering, ready to be rendered in the list.
 *
 * @public
 */
export interface CollectedFootnote {
  /** `_key` of the first occurrence — stable across reordering. */
  key: string
  /** 1-based position in the text. */
  number: number
  /** `id` of the list item, the marker's link target. */
  id: string
  value: FootnoteValue
  /** Every marked spot pointing at this footnote. More than one when merging. */
  occurrences: FootnoteOccurrence[]
}

/**
 * Result of {@link collectFootnotes}.
 *
 * @public
 */
export interface FootnoteCollection {
  /** Footnotes in the order they appear in the text. */
  items: CollectedFootnote[]
  /** Number for a given annotation `_key`. */
  numberOf: (key: string) => number | undefined
  /** The footnote a given annotation `_key` belongs to. */
  entryOf: (key: string) => CollectedFootnote | undefined
}

/**
 * How duplicate footnotes are treated.
 *
 * - `none` — every marked spot gets its own number.
 * - `url` — spots sharing a source URL share one number and one list entry.
 *
 * @public
 */
export type MergeStrategy = 'none' | 'url'

/**
 * Options for {@link collectFootnotes}.
 *
 * @public
 */
export interface CollectOptions {
  /** Schema type name of the annotation. Defaults to `footnote`. */
  typeName?: string
  /** Merge behaviour for repeated sources. Defaults to `none`. */
  mergeDuplicates?: MergeStrategy
  /**
   * Prefix for the generated element ids, so several articles can share a page
   * without their anchors colliding.
   */
  idPrefix?: string
}
