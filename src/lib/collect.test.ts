import {describe, expect, it} from 'vitest'

import {collectFootnotes, footnoteId, footnoteRefId, isEmptyFootnote} from './collect'

const note = (key: string, extra: Record<string, unknown> = {}) => ({
  _type: 'footnote',
  _key: key,
  text: [
    {
      _type: 'block',
      _key: `t-${key}`,
      children: [{_type: 'span', _key: `s-${key}`, text: `Note ${key}`, marks: []}],
    },
  ],
  ...extra,
})

const block = (
  key: string,
  spans: {text: string; marks?: string[]}[],
  markDefs: unknown[] = [],
) => ({
  _type: 'block',
  _key: key,
  markDefs,
  children: spans.map((span, index) => ({
    _type: 'span',
    _key: `${key}-${index}`,
    text: span.text,
    marks: span.marks ?? [],
  })),
})

const first = block('b1', [{text: 'Tour '}, {text: 'in 2027', marks: ['fa']}], [note('fa')])
const second = block('b2', [{text: 'Label '}, {text: 'confirmed', marks: ['fb']}], [note('fb')])

describe('collectFootnotes', () => {
  it('numbers footnotes in the order they appear in the text', () => {
    const {items} = collectFootnotes([first, second])
    expect(items.map((entry) => [entry.key, entry.number])).toEqual([
      ['fa', 1],
      ['fb', 2],
    ])
  })

  it('renumbers when blocks are reordered — nothing is read from the document', () => {
    const {numberOf} = collectFootnotes([second, first])
    expect(numberOf('fb')).toBe(1)
    expect(numberOf('fa')).toBe(2)
  })

  it('follows the text, not the order of markDefs', () => {
    const mixed = block(
      'b3',
      [
        {text: 'a ', marks: ['second']},
        {text: 'b', marks: ['first']},
      ],
      [note('first'), note('second')],
    )
    const {items} = collectFootnotes([mixed])
    expect(items.map((entry) => entry.key)).toEqual(['second', 'first'])
  })

  it('counts an annotation once even when it spans several styled spans', () => {
    const split = block(
      'b4',
      [
        {text: 'bold ', marks: ['fa', 'strong']},
        {text: 'and plain', marks: ['fa']},
      ],
      [note('fa')],
    )
    const {items} = collectFootnotes([split])
    expect(items).toHaveLength(1)
    expect(items[0].occurrences).toHaveLength(1)
  })

  it('ignores annotations of other types', () => {
    const withLink = block(
      'b5',
      [{text: 'linked', marks: ['l1']}],
      [{_type: 'link', _key: 'l1', href: 'https://example.com'}],
    )
    expect(collectFootnotes([withLink]).items).toHaveLength(0)
  })

  it('accepts several Portable Text fields at once', () => {
    const {items} = collectFootnotes([[first], [second]])
    expect(items.map((entry) => entry.number)).toEqual([1, 2])
  })

  it('survives empty and malformed input', () => {
    expect(collectFootnotes(undefined).items).toEqual([])
    expect(collectFootnotes([]).items).toEqual([])
    expect(collectFootnotes([{_type: 'image'}, null]).items).toEqual([])
  })

  it('respects a custom type name', () => {
    const custom = block('b6', [{text: 'x', marks: ['c1']}], [{_type: 'source', _key: 'c1'}])
    expect(collectFootnotes([custom]).items).toHaveLength(0)
    expect(collectFootnotes([custom], {typeName: 'source'}).items).toHaveLength(1)
  })
})

describe('collectFootnotes with mergeDuplicates', () => {
  const url = 'https://example.com/article'
  const twice = [
    block('m1', [{text: 'one', marks: ['x1']}], [note('x1', {sourceUrl: url})]),
    block('m2', [{text: 'two', marks: ['x2']}], [note('x2', {sourceUrl: url})]),
    block('m3', [{text: 'three', marks: ['x3']}], [note('x3', {sourceUrl: 'https://other.test'})]),
  ]

  it('keeps separate numbers by default', () => {
    const {items} = collectFootnotes(twice)
    expect(items.map((entry) => entry.number)).toEqual([1, 2, 3])
  })

  it('merges identical source urls into one entry with several backlinks', () => {
    const {items, numberOf} = collectFootnotes(twice, {mergeDuplicates: 'url'})
    expect(items).toHaveLength(2)
    expect(numberOf('x1')).toBe(1)
    expect(numberOf('x2')).toBe(1)
    expect(numberOf('x3')).toBe(2)
    expect(items[0].occurrences.map((entry) => entry.key)).toEqual(['x1', 'x2'])
  })

  it('ignores case and trailing whitespace when comparing urls', () => {
    const messy = [
      block(
        'n1',
        [{text: 'a', marks: ['y1']}],
        [note('y1', {sourceUrl: ' HTTPS://Example.com/x '})],
      ),
      block('n2', [{text: 'b', marks: ['y2']}], [note('y2', {sourceUrl: 'https://example.com/x'})]),
    ]
    expect(collectFootnotes(messy, {mergeDuplicates: 'url'}).items).toHaveLength(1)
  })

  it('never merges notes without a source', () => {
    const plain = [
      block('p1', [{text: 'a', marks: ['z1']}], [note('z1')]),
      block('p2', [{text: 'b', marks: ['z2']}], [note('z2')]),
    ]
    expect(collectFootnotes(plain, {mergeDuplicates: 'url'}).items).toHaveLength(2)
  })
})

describe('element ids', () => {
  it('builds ids from the annotation key so shared links survive reordering', () => {
    expect(footnoteId('a1b2')).toBe('fn-a1b2')
    expect(footnoteRefId('a1b2')).toBe('fnref-a1b2')
  })

  it('applies a prefix so two articles can share a page', () => {
    expect(footnoteId('a1b2', 'tour')).toBe('tour-fn-a1b2')
    expect(footnoteRefId('a1b2', 'tour')).toBe('tour-fnref-a1b2')
  })

  it('uses the prefix in the collected entries', () => {
    const {items} = collectFootnotes([first], {idPrefix: 'tour'})
    expect(items[0].id).toBe('tour-fn-fa')
    expect(items[0].occurrences[0].refId).toBe('tour-fnref-fa')
  })
})

describe('isEmptyFootnote', () => {
  it('detects footnotes worth rendering', () => {
    expect(isEmptyFootnote(undefined)).toBe(true)
    expect(isEmptyFootnote({})).toBe(true)
    expect(isEmptyFootnote({sourceUrl: 'https://example.com'})).toBe(false)
    expect(isEmptyFootnote(note('k'))).toBe(false)
  })
})
