/**
 * The body of light: a seated figure in meditation, described as a signed distance field
 * (capsules, round cones and ellipsoids blended together) and sampled into points.
 * Most points sit on the skin, so the silhouette reads clearly; a sparse few fill the
 * volume, so the body looks like translucent light rather than a hollow shell.
 *
 * Facing +z, sitting on y = 0, head top at ~1.4. The person's left is +x.
 */

type V = [number, number, number]

const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const len = (a: V) => Math.sqrt(dot(a, a))
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

function capsule(p: V, a: V, b: V, r: number) {
  const pa = sub(p, a)
  const ba = sub(b, a)
  const h = clamp(dot(pa, ba) / dot(ba, ba), 0, 1)
  return len([pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h]) - r
}

/** A capsule whose radius runs from r1 at a to r2 at b. */
function roundCone(p: V, a: V, b: V, r1: number, r2: number) {
  const pa = sub(p, a)
  const ba = sub(b, a)
  const h = clamp(dot(pa, ba) / dot(ba, ba), 0, 1)
  return len([pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h]) - (r1 + (r2 - r1) * h)
}

function ellipsoid(p: V, c: V, r: V) {
  const q: V = [(p[0] - c[0]) / r[0], (p[1] - c[1]) / r[1], (p[2] - c[2]) / r[2]]
  const k0 = len(q)
  const k1 = len([q[0] / r[0], q[1] / r[1], q[2] / r[2]])
  return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1
}

/** Smooth union, so joints blend like a body rather than meeting like pipes. */
function smin(a: number, b: number, k: number) {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1)
  return b + (a - b) * h - k * h * (1 - h)
}

const DEPTH = 0.78 // the torso is shallower front to back than side to side

export function figureSDF(x: number, y: number, z: number): number {
  const p: V = [x, y, z]
  const flat: V = [x, y, z / DEPTH]
  const ax = Math.abs(x)
  const m: V = [ax, y, z] // mirrored: arms and thighs are symmetric

  let d = ellipsoid(p, [0, 0.24, -0.01], [0.27, 0.14, 0.21])
  d = smin(d, roundCone(flat, [0, 0.3, -0.04], [0, 0.6, -0.04], 0.2, 0.158) * DEPTH, 0.05)
  d = smin(d, roundCone(flat, [0, 0.6, -0.04], [0, 0.94, -0.04], 0.158, 0.2) * DEPTH, 0.05)
  d = smin(d, capsule(p, [-0.19, 0.965, -0.04], [0.19, 0.965, -0.04], 0.085), 0.05)
  d = smin(d, capsule(p, [0, 1.0, -0.03], [0, 1.14, -0.01], 0.052), 0.03)
  d = smin(d, ellipsoid(p, [0, 1.27, 0.0], [0.098, 0.128, 0.112]), 0.035)
  // Arms fall from the shoulders; forearms rest forward onto the knees, palms up.
  d = smin(d, capsule(m, [0.255, 0.95, -0.04], [0.31, 0.64, 0.03], 0.056), 0.03)
  d = smin(d, capsule(m, [0.31, 0.64, 0.03], [0.39, 0.41, 0.27], 0.046), 0.025)
  d = smin(d, ellipsoid(m, [0.41, 0.385, 0.33], [0.05, 0.022, 0.078]), 0.025)
  // Thighs out to the knees, shins crossed in front.
  d = smin(d, capsule(m, [0.11, 0.2, 0.03], [0.47, 0.16, 0.3], 0.092), 0.05)
  d = smin(d, capsule(p, [-0.47, 0.13, 0.32], [0.13, 0.115, 0.43], 0.066), 0.04)
  d = smin(d, capsule(p, [0.47, 0.175, 0.31], [-0.13, 0.175, 0.4], 0.066), 0.04)
  d = smin(d, ellipsoid(p, [0.17, 0.115, 0.44], [0.07, 0.03, 0.045]), 0.03)
  d = smin(d, ellipsoid(p, [-0.17, 0.18, 0.41], [0.07, 0.03, 0.045]), 0.03)
  return d
}

/** Seeded so the figure is identical on every visit. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const BOUNDS = { min: [-0.6, 0, -0.32] as V, max: [0.6, 1.44, 0.56] as V }

export type FigurePoints = {
  /** Points on and inside the body. */
  position: Float32Array
  /** Where each point drifts in from as the body gathers. */
  scatter: Float32Array
  /** 0–1 per point: twinkle phase and gather delay. */
  seed: Float32Array
  /** 1 on the skin, 0 inside. */
  shell: Float32Array
}

export function sampleFigure(count: number, seed = 7): FigurePoints {
  const r = rng(seed)
  const position = new Float32Array(count * 3)
  const scatter = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const shell = new Float32Array(count)
  const shellTarget = Math.round(count * 0.74)
  const [x0, y0, z0] = BOUNDS.min
  const [x1, y1, z1] = BOUNDS.max
  const e = 0.0015
  let nShell = 0
  let nInner = 0
  let i = 0
  let guard = 0

  while (i < count && guard++ < count * 400) {
    const x = x0 + r() * (x1 - x0)
    const y = y0 + r() * (y1 - y0)
    const z = z0 + r() * (z1 - z0)
    const d = figureSDF(x, y, z)
    let px = x
    let py = y
    let pz = z
    let onSkin = false
    if (Math.abs(d) < 0.03 && nShell < shellTarget) {
      // Step onto the surface along the gradient.
      const gx = figureSDF(x + e, y, z) - figureSDF(x - e, y, z)
      const gy = figureSDF(x, y + e, z) - figureSDF(x, y - e, z)
      const gz = figureSDF(x, y, z + e) - figureSDF(x, y, z - e)
      const gl = Math.hypot(gx, gy, gz) || 1
      const jitter = (r() - 0.5) * 0.006
      px = x - (gx / gl) * (d + jitter)
      py = y - (gy / gl) * (d + jitter)
      pz = z - (gz / gl) * (d + jitter)
      onSkin = true
      nShell++
    } else if (d < -0.012 && nInner < count - shellTarget && r() < 0.35) {
      nInner++
    } else continue

    position.set([px, py, pz], i * 3)
    // Scattered on a wide sphere around the body, a little above it.
    const u = r() * 2 - 1
    const t = r() * Math.PI * 2
    const rad = 1.4 + r() * 2.2
    const s = Math.sqrt(1 - u * u)
    scatter.set([Math.cos(t) * s * rad, 0.8 + u * rad * 0.7, Math.sin(t) * s * rad], i * 3)
    seeds[i] = r()
    shell[i] = onSkin ? 1 : 0
    i++
  }

  return {
    position: position.subarray(0, i * 3),
    scatter: scatter.subarray(0, i * 3),
    seed: seeds.subarray(0, i),
    shell: shell.subarray(0, i),
  }
}
