import type {FootnoteValue} from './types'

/**
 * The source of a footnote, reduced to what a renderer needs.
 *
 * @public
 */
export interface SourceParts {
  /** Link text — the title, or the bare host when no title was given. */
  label?: string
  url?: string
  publisher?: string
  date?: string
}

/**
 * Host of a URL without `www.`, used as link text when a source has no title.
 *
 * @public
 */
export function hostOf(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

/**
 * Formats a date string with the given formatter, falling back to the raw value
 * — a half-typed date should still show up rather than disappear.
 *
 * @public
 */
export function formatFootnoteDate(
  date: string | undefined,
  formatDate?: (date: Date) => string,
): string | undefined {
  const raw = (date ?? '').trim()
  if (!raw) return undefined
  if (!formatDate) return raw

  // Only ISO dates go through the formatter. Anything else is a free-text date
  // like "summer 2026" — JavaScript would happily invent a day for it.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  const parsed = new Date(`${raw}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return raw
  return formatDate(parsed)
}

/**
 * Pulls the source out of a footnote value, ready for rendering. Returns
 * `undefined` when the footnote is a plain note without a source.
 *
 * @public
 */
export function sourceOf(
  value: FootnoteValue,
  formatDate?: (date: Date) => string,
): SourceParts | undefined {
  const url = (value.sourceUrl ?? '').trim() || undefined
  const title = (value.sourceTitle ?? '').trim() || undefined
  const publisher = (value.publisher ?? '').trim() || undefined
  const date = formatFootnoteDate(value.date, formatDate)

  const label = title || (url ? hostOf(url) : undefined)
  if (!label && !publisher && !date) return undefined

  return {label, url, publisher, date}
}
