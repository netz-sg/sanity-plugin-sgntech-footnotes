import {defineArrayMember, defineField, defineType} from 'sanity'

import {createFootnoteAnnotation} from '../components/FootnoteAnnotation'
import {FootnoteIcon} from '../components/FootnoteIcon'
import {stringOf} from '../lib/keys'
import {noteToPlainText} from '../render/NoteText'

/**
 * Options for {@link createFootnoteType}.
 *
 * @public
 */
export interface FootnoteTypeOptions {
  /** Schema type name. Defaults to `footnote`. */
  name?: string
  /** Label in the annotation menu. Defaults to `Footnote`. */
  title?: string
  /** Offer the structured source fields. Defaults to `true`. */
  sourceFields?: boolean
  /** Show the live number on the annotated text in the editor. Defaults to `true`. */
  showNumberInEditor?: boolean
}

/**
 * Creates the `footnote` annotation type. Use this directly if you want the type
 * without installing the plugin, for example inside another plugin.
 *
 * @public
 */
export function createFootnoteType(options: FootnoteTypeOptions = {}) {
  const {
    name = 'footnote',
    title = 'Footnote',
    sourceFields = true,
    showNumberInEditor = true,
  } = options

  return defineType({
    name,
    title,
    type: 'object',
    icon: FootnoteIcon,
    components: showNumberInEditor ? {annotation: createFootnoteAnnotation(name)} : undefined,
    fields: [
      defineField({
        name: 'text',
        title: 'Note',
        description: 'The note itself. Leave empty if the source alone says everything.',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'block',
            styles: [{title: 'Normal', value: 'normal'}],
            lists: [],
            marks: {
              decorators: [
                {title: 'Strong', value: 'strong'},
                {title: 'Emphasis', value: 'em'},
              ],
              annotations: [
                defineArrayMember({
                  name: 'link',
                  type: 'object',
                  title: 'Link',
                  fields: [
                    defineField({
                      name: 'href',
                      title: 'URL',
                      type: 'url',
                      validation: (rule) =>
                        rule.required().uri({scheme: ['http', 'https', 'mailto', 'tel']}),
                    }),
                  ],
                }),
              ],
            },
          }),
        ],
      }),

      ...(sourceFields
        ? [
            defineField({
              name: 'sourceTitle',
              title: 'Source title',
              description: 'Headline of the cited article or title of the work.',
              type: 'string',
            }),
            defineField({
              name: 'sourceUrl',
              title: 'Source URL',
              type: 'url',
              validation: (rule) => rule.uri({scheme: ['http', 'https']}),
            }),
            defineField({
              name: 'publisher',
              title: 'Publisher or author',
              type: 'string',
            }),
            defineField({
              name: 'date',
              title: 'Publication date',
              type: 'date',
              options: {dateFormat: 'YYYY-MM-DD'},
            }),
          ]
        : []),
    ],

    validation: (rule) =>
      rule.custom((value: Record<string, unknown> | undefined) => {
        if (!value) return true
        const hasText = noteToPlainText(value.text).length > 0
        const hasSource = Boolean(
          stringOf(value.sourceTitle) || stringOf(value.sourceUrl) || stringOf(value.publisher),
        )
        return hasText || hasSource || 'Add a note or a source — an empty footnote helps nobody'
      }),

    preview: {
      select: {text: 'text', sourceTitle: 'sourceTitle', publisher: 'publisher', date: 'date'},
      prepare({text, sourceTitle, publisher, date}) {
        const note = noteToPlainText(text)
        const source = [sourceTitle, publisher, date].filter(Boolean).join(' · ')
        return {
          title: note || source || 'Empty footnote',
          subtitle: note ? source : undefined,
          media: FootnoteIcon,
        }
      },
    },
  })
}
