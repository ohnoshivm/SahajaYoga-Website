import { describe, expect, it } from 'vitest'
import { formatClock, parseTime, parseYouTube } from './youtube'

describe('parseYouTube', () => {
  it('reads watch, short, shorts, embed and live links', () => {
    expect(parseYouTube('https://www.youtube.com/watch?v=1H60sWcCrNE')).toEqual({ id: '1H60sWcCrNE', start: 0 })
    expect(parseYouTube('https://youtu.be/1H60sWcCrNE?si=J_O_g5X5W5bKS8pW')).toEqual({ id: '1H60sWcCrNE', start: 0 })
    expect(parseYouTube('youtube.com/shorts/1H60sWcCrNE')?.id).toBe('1H60sWcCrNE')
    expect(parseYouTube('https://www.youtube-nocookie.com/embed/1H60sWcCrNE')?.id).toBe('1H60sWcCrNE')
    expect(parseYouTube('https://m.youtube.com/live/1H60sWcCrNE')?.id).toBe('1H60sWcCrNE')
    expect(parseYouTube('1H60sWcCrNE')?.id).toBe('1H60sWcCrNE')
  })

  it('keeps a start time from the link', () => {
    expect(parseYouTube('https://youtu.be/1H60sWcCrNE?t=95')?.start).toBe(95)
    expect(parseYouTube('https://www.youtube.com/watch?v=1H60sWcCrNE&t=1m30s')?.start).toBe(90)
  })

  it('rejects anything else', () => {
    expect(parseYouTube('')).toBeNull()
    expect(parseYouTube('https://vimeo.com/123')).toBeNull()
    expect(parseYouTube('https://youtube.com/watch?v=short')).toBeNull()
  })
})

describe('parseTime', () => {
  it('reads seconds, clock times and h/m/s', () => {
    expect(parseTime('42')).toBe(42)
    expect(parseTime('42s')).toBe(42)
    expect(parseTime('1:30')).toBe(90)
    expect(parseTime('1:02:03')).toBe(3723)
    expect(parseTime('1h2m3s')).toBe(3723)
    expect(parseTime('nonsense')).toBe(0)
  })

  it('round-trips through formatClock', () => {
    expect(formatClock(90)).toBe('1:30')
    expect(formatClock(3723)).toBe('1:02:03')
    expect(parseTime(formatClock(3723))).toBe(3723)
  })
})
