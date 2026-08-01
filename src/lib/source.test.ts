import {describe, expect, it} from 'vitest'

import {formatFootnoteDate, hostOf, sourceOf} from './source'

describe('hostOf', () => {
  it('strips the protocol and www', () => {
    expect(hostOf('https://www.rollingstone.de/artikel')).toBe('rollingstone.de')
  })

  it('returns nothing for garbage', () => {
    expect(hostOf('not a url')).toBeUndefined()
  })
})

describe('formatFootnoteDate', () => {
  it('applies the given formatter', () => {
    expect(formatFootnoteDate('2026-07-14', (date) => String(date.getUTCFullYear()))).toBe('2026')
  })

  it('falls back to the raw value without a formatter', () => {
    expect(formatFootnoteDate('2026-07-14')).toBe('2026-07-14')
  })

  it('keeps an unparseable date instead of dropping it', () => {
    expect(formatFootnoteDate('summer 2026', () => 'never')).toBe('summer 2026')
  })

  it('is empty for a missing date', () => {
    expect(formatFootnoteDate(undefined)).toBeUndefined()
    expect(formatFootnoteDate('   ')).toBeUndefined()
  })
})

describe('sourceOf', () => {
  it('prefers the title as link text', () => {
    expect(
      sourceOf({sourceTitle: 'Tour announced', sourceUrl: 'https://www.example.com/a'}),
    ).toEqual({
      label: 'Tour announced',
      url: 'https://www.example.com/a',
      publisher: undefined,
      date: undefined,
    })
  })

  it('falls back to the host when there is no title', () => {
    expect(sourceOf({sourceUrl: 'https://www.example.com/a'})?.label).toBe('example.com')
  })

  it('works for offline sources without a url', () => {
    expect(sourceOf({sourceTitle: 'Booklet', publisher: 'Universal'})).toMatchObject({
      label: 'Booklet',
      publisher: 'Universal',
      url: undefined,
    })
  })

  it('returns nothing for a plain note', () => {
    expect(sourceOf({})).toBeUndefined()
    expect(sourceOf({sourceTitle: '   '})).toBeUndefined()
  })
})
