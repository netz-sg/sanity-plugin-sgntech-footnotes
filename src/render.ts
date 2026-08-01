/**
 * Framework-side entry point: everything needed to render footnotes in your app.
 * This entry does not import `sanity`, so it can be used in a Next.js, Remix or
 * Astro app without pulling the Studio into the bundle.
 *
 * ```ts
 * import {createFootnotes} from 'sanity-plugin-sgntech-footnotes/render'
 * ```
 *
 * @packageDocumentation
 */

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
export {collectFootnotes, footnoteId, footnoteRefId, isEmptyFootnote} from './lib/collect'
export {formatFootnoteDate, hostOf, sourceOf, type SourceParts} from './lib/source'
export type {
  CollectedFootnote,
  CollectOptions,
  FootnoteCollection,
  FootnoteOccurrence,
  FootnoteValue,
  MergeStrategy,
} from './lib/types'
