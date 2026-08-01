import {definePlugin} from 'sanity'

import {createFootnoteType, type FootnoteTypeOptions} from './schema/footnote'

/**
 * Configuration for {@link footnotes}.
 *
 * @public
 */
export type FootnotesConfig = FootnoteTypeOptions

/**
 * Adds a `footnote` annotation to Sanity Studio: mark a passage, write the note,
 * optionally add a structured source. Numbers are never stored — they are
 * counted from the position in the text, so reordering paragraphs can never make
 * them disagree with the list at the end of the article.
 *
 * Register the annotation in the block type it should be available in:
 *
 * ```ts
 * import {defineArrayMember, defineConfig, defineField} from 'sanity'
 * import {footnotes} from 'sanity-plugin-sgntech-footnotes'
 *
 * export default defineConfig({
 *   plugins: [footnotes()],
 *   schema: {
 *     types: [
 *       {
 *         type: 'document',
 *         name: 'article',
 *         fields: [
 *           defineField({
 *             type: 'array',
 *             name: 'body',
 *             of: [
 *               defineArrayMember({
 *                 type: 'block',
 *                 marks: {annotations: [{type: 'footnote'}]},
 *               }),
 *             ],
 *           }),
 *         ],
 *       },
 *     ],
 *   },
 * })
 * ```
 *
 * @public
 */
export const footnotes = definePlugin<FootnotesConfig | void>((config) => {
  const options = config || {}

  return {
    name: 'sanity-plugin-sgntech-footnotes',
    schema: {
      types: [createFootnoteType(options)],
    },
  }
})

export {createFootnoteType, type FootnoteTypeOptions} from './schema/footnote'
export {collectFootnotes, footnoteId, footnoteRefId, isEmptyFootnote} from './lib/collect'
export {formatFootnoteDate, hostOf, sourceOf, type SourceParts} from './lib/source'
export {
  createFootnotes,
  type CreateFootnotesOptions,
  type FootnotesRenderKit,
} from './render/createFootnotes'
export {Footnotes, type FootnotesProps} from './render/Footnotes'
export {FootnoteRef, type FootnoteRefProps} from './render/FootnoteRef'
export {NoteText, noteToPlainText} from './render/NoteText'
export {SourceLine} from './render/SourceLine'
export {ensureFootnoteStyles, footnoteStyles} from './render/styles'
export type {
  CollectedFootnote,
  CollectOptions,
  FootnoteCollection,
  FootnoteOccurrence,
  FootnoteValue,
  MergeStrategy,
} from './lib/types'
