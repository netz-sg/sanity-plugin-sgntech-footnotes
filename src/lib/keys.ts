function hasKey(value: unknown): value is {_key?: unknown} {
  return typeof value === 'object' && value !== null && '_key' in value
}

/**
 * Reads the `_key` off an unknown value, e.g. an annotation coming from the
 * editor or a renderer. Returns an empty string when there is none.
 *
 * @public
 */
export function keyOf(value: unknown): string {
  if (!hasKey(value)) return ''
  return typeof value._key === 'string' ? value._key : ''
}

/**
 * Trimmed string value of an unknown field. Anything that is not a string
 * counts as empty.
 *
 * @public
 */
export function stringOf(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}
