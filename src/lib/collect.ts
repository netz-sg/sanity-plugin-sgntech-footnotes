import type {CollectedFootnote, CollectOptions, FootnoteCollection, FootnoteValue} from './types'

interface PortableTextSpan {
  _type?: string
  _key?: string
  marks?: string[]
}

interface PortableTextBlock {
  _type?: string
  _key?: string
  children?: PortableTextSpan[]
  markDefs?: FootnoteValue[]
}

function isBlock(value: unknown): value is PortableTextBlock {
  return typeof value === 'object' && value !== null
}

/**
 * Builds the element id of a list entry.
 *
 * @public
 */
export function footnoteId(key: string, idPrefix?: string): string {
  return idPrefix ? `${idPrefix}-fn-${key}` : `fn-${key}`
}

/**
 * Builds the element id of a marker in the text — the backlink target.
 *
 * @public
 */
export function footnoteRefId(key: string, idPrefix?: string): string {
  return idPrefix ? `${idPrefix}-fnref-${key}` : `fnref-${key}`
}

function mergeKeyOf(value: FootnoteValue, strategy: string): string | undefined {
  if (strategy !== 'url') return undefined
  const url = (value.sourceUrl ?? '').trim().toLowerCase()
  return url || undefined
}

/**
 * Walks Portable Text and numbers every footnote in the order it appears in the
 * text — not in the order the annotations happen to sit in `markDefs`. Nothing
 * is read from the document itself, so moving paragraphs around renumbers the
 * footnotes on the next render.
 *
 * Accepts a single Portable Text array or several of them, for articles whose
 * text is split across fields.
 *
 * @public
 */
export function collectFootnotes(input: unknown, options: CollectOptions = {}): FootnoteCollection {
  const {typeName = 'footnote', mergeDuplicates = 'none', idPrefix} = options

  const arrays: unknown[][] = Array.isArray(input)
    ? input.every((entry) => Array.isArray(entry))
      ? (input as unknown[][])
      : [input]
    : []

  const items: CollectedFootnote[] = []
  const byAnnotationKey = new Map<string, CollectedFootnote>()
  const byMergeKey = new Map<string, CollectedFootnote>()

  for (const blocks of arrays) {
    for (const block of blocks) {
      if (!isBlock(block) || block._type !== 'block') continue

      const definitions = new Map<string, FootnoteValue>()
      for (const definition of block.markDefs ?? []) {
        if (definition?._key && definition._type === typeName) {
          definitions.set(definition._key, definition)
        }
      }
      if (definitions.size === 0) continue

      for (const child of block.children ?? []) {
        for (const mark of child?.marks ?? []) {
          const value = definitions.get(mark)
          // Already counted: the same annotation can span several spans when the
          // marked text also carries bold or italic.
          if (!value || byAnnotationKey.has(mark)) continue

          const occurrence = {key: mark, refId: footnoteRefId(mark, idPrefix)}
          const mergeKey = mergeKeyOf(value, mergeDuplicates)
          const existing = mergeKey ? byMergeKey.get(mergeKey) : undefined

          if (existing) {
            existing.occurrences.push(occurrence)
            byAnnotationKey.set(mark, existing)
            continue
          }

          const entry: CollectedFootnote = {
            key: mark,
            number: items.length + 1,
            id: footnoteId(mark, idPrefix),
            value,
            occurrences: [occurrence],
          }

          items.push(entry)
          byAnnotationKey.set(mark, entry)
          if (mergeKey) byMergeKey.set(mergeKey, entry)
        }
      }
    }
  }

  return {
    items,
    numberOf: (key: string) => byAnnotationKey.get(key)?.number,
    entryOf: (key: string) => byAnnotationKey.get(key),
  }
}

/**
 * True when the footnote holds nothing worth rendering.
 *
 * @public
 */
export function isEmptyFootnote(value: FootnoteValue | undefined): boolean {
  if (!value) return true
  const hasText = Array.isArray(value.text) && value.text.length > 0
  const hasSource = Boolean(
    (value.sourceTitle ?? '').trim() ||
    (value.sourceUrl ?? '').trim() ||
    (value.publisher ?? '').trim(),
  )
  return !hasText && !hasSource
}
