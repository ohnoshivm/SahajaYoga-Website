import { describe, expect, it } from 'vitest'
import { BOUNDS, figureSDF, sampleFigure } from './figure'
import { CENTRES, KUNDALINI_Y } from './data'

describe('body of light', () => {
  it('is solid where a seated body is, and empty around it', () => {
    expect(figureSDF(0, 0.6, -0.04)).toBeLessThan(0) // belly
    expect(figureSDF(0, 1.27, 0)).toBeLessThan(0) // head
    expect(figureSDF(0.41, 0.385, 0.33)).toBeLessThan(0) // left hand on the knee
    expect(figureSDF(0, 1.5, 0)).toBeGreaterThan(0) // above the head
    expect(figureSDF(0.5, 1.0, 0)).toBeGreaterThan(0) // beside the shoulder
  })

  it('has the centres and the Kundalini inside or just above the body', () => {
    expect(figureSDF(0, KUNDALINI_Y, -0.03)).toBeLessThan(0)
    for (const c of CENTRES.filter((c) => c.id !== 'sahasrara' && c.id !== 'void')) {
      expect(figureSDF(0, c.y, c.z), c.id).toBeLessThan(0)
    }
  })

  it('samples the requested count, mostly on the skin, inside the bounds', () => {
    const f = sampleFigure(4000)
    expect(f.seed.length).toBe(4000)
    const onSkin = f.shell.reduce((a, b) => a + b, 0) / 4000
    expect(onSkin).toBeGreaterThan(0.7)
    for (let i = 0; i < f.position.length; i += 3) {
      expect(f.position[i]).toBeGreaterThan(BOUNDS.min[0] - 0.05)
      expect(f.position[i + 1]).toBeLessThan(BOUNDS.max[1] + 0.05)
      expect(Math.abs(figureSDF(f.position[i], f.position[i + 1], f.position[i + 2]))).toBeLessThan(0.2)
    }
  })

  it('is the same figure every time', () => {
    expect(sampleFigure(500).position).toEqual(sampleFigure(500).position)
  })
})
