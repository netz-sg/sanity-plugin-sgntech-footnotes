import {Fragment} from 'react'

interface Span {
  _type?: string
  _key?: string
  text?: string
  marks?: string[]
}

interface Block {
  _type?: string
  _key?: string
  children?: Span[]
  markDefs?: {_key?: string; _type?: string; href?: string}[]
}

function isBlockLike(value: unknown): value is Block {
  return typeof value === 'object' && value !== null
}

/**
 * Renders the note's Portable Text.
 *
 * The schema only allows what a footnote actually needs — plain paragraphs,
 * bold, italic and links — so this handles it directly instead of pulling in a
 * Portable Text renderer as a dependency. Pass `renderText` to `Footnotes` if
 * you would rather render it with your own setup.
 *
 * @public
 */
export function NoteText(props: {value: unknown}): React.JSX.Element | null {
  const blocks = Array.isArray(props.value) ? props.value.filter(isBlockLike) : []
  if (blocks.length === 0) return null

  return (
    <>
      {blocks.map((block, blockIndex) => {
        if (block?._type !== 'block') return null

        const links = new Map<string, string>()
        for (const definition of block.markDefs ?? []) {
          if (definition?._key && definition._type === 'link' && definition.href) {
            links.set(definition._key, definition.href)
          }
        }

        return (
          <Fragment key={block._key ?? blockIndex}>
            {blockIndex > 0 && ' '}
            {(block.children ?? []).map((span, spanIndex) => {
              const text = span?.text ?? ''
              if (!text) return null

              let node: React.ReactNode = text
              const marks = span.marks ?? []

              if (marks.includes('em')) node = <em>{node}</em>
              if (marks.includes('strong')) node = <strong>{node}</strong>

              const href = marks.map((mark) => links.get(mark)).find(Boolean)
              if (href) {
                node = (
                  <a href={href} rel="noreferrer noopener" target="_blank">
                    {node}
                  </a>
                )
              }

              return <Fragment key={span._key ?? spanIndex}>{node}</Fragment>
            })}
          </Fragment>
        )
      })}
    </>
  )
}

/**
 * Plain-text version of a note, for titles and other places that cannot take
 * markup — the popover uses it as the accessible description.
 *
 * @public
 */
export function noteToPlainText(value: unknown): string {
  const blocks = Array.isArray(value) ? value.filter(isBlockLike) : []
  return blocks
    .filter((block) => block?._type === 'block')
    .map((block) => (block.children ?? []).map((span) => span?.text ?? '').join(''))
    .join(' ')
    .trim()
}
