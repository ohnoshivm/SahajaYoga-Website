import { BufferAttribute, BufferGeometry } from "three";

export type PetalShape = {
  /** petal length (base → tip) */
  length: number;
  /** maximum half-width */
  width: number;
  /** how strongly the edges curl toward the lotus centre (concave inner face) */
  cup: number;
  /** tip lean: + curls outward, - curls inward */
  curl: number;
  /** where the petal is widest (0..1 along its length) */
  bulge?: number;
  segU?: number;
  segV?: number;
};

/**
 * One lotus petal as a parametric surface in local space:
 * base at origin, grows along +Y, outer face toward +Z, centre of the lotus toward -Z.
 * uv.x = across (0..1), uv.y = along (0 base → 1 tip). The shader uses uv.y for the
 * golden root tint and the inner glow.
 */
export function createPetalGeometry({
  length,
  width,
  cup,
  curl,
  bulge = 0.46,
  segU = 22,
  segV = 44,
}: PetalShape): BufferGeometry {
  const cols = segU + 1;
  const rows = segV + 1;
  const positions = new Float32Array(cols * rows * 3);
  const uvs = new Float32Array(cols * rows * 2);
  const indices: number[] = [];

  // exponent that places the widest point at `bulge`
  const k = Math.log(0.5) / Math.log(bulge);

  for (let i = 0; i < rows; i++) {
    const v = i / segV;
    // pointed tip, rounded shoulder, narrow root
    const profile = Math.pow(Math.sin(Math.PI * Math.pow(v, k)), 0.72);
    const half = width * profile * (1 - 0.12 * v) + width * 0.06 * (1 - v);
    const bend = Math.sin(Math.PI * Math.min(1, v * 1.05));

    for (let j = 0; j < cols; j++) {
      const u = j / segU;
      const s = (u - 0.5) * 2; // -1..1 across the petal
      const x = s * half;
      // midrib spine leans gently, tip curls by `curl`
      const spineZ = curl * length * Math.pow(v, 2.6);
      // edges curl toward centre (-Z): concave inner face
      const cupZ = -cup * width * s * s * (0.25 + 0.75 * bend);
      // spoon-like convexity along the length (petals bow outward, never fold)
      const bow = 0.06 * length * Math.sin(Math.PI * v);
      const y = v * length * (1 - 0.04 * s * s);
      const z = spineZ + cupZ + bow;

      const p = (i * cols + j) * 3;
      positions[p] = x;
      positions[p + 1] = y;
      positions[p + 2] = z;
      const t = (i * cols + j) * 2;
      uvs[t] = u;
      uvs[t + 1] = v;
    }
  }

  for (let i = 0; i < segV; i++) {
    for (let j = 0; j < segU; j++) {
      const a = i * cols + j;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export type Tier = {
  count: number;
  shape: PetalShape;
  /** base radius from the lotus axis */
  radius: number;
  /** base height */
  lift: number;
  /** petal tilt away from the axis, closed bud → open bloom (radians) */
  tiltClosed: number;
  tiltOpen: number;
  /** tip curl in the open state (overrides shape.curl progressively) */
  curlOpen: number;
  /** angular offset in petal-steps (0.5 = interleaved with the tier inside) */
  phase: number;
  /** bloom window within the 0..1 hold progress */
  window: [number, number];
  /** strength of the golden inner glow on this tier */
  glow: number;
};

/** Five tiers modelled on the approved reference lotus (outer sepals → glowing core). */
export const LOTUS_TIERS: Tier[] = [
  {
    // outer sepal-petals: wide, almost horizontal when open, tips lifting
    count: 8,
    shape: { length: 1.15, width: 0.36, cup: 0.7, curl: -0.42, bulge: 0.42 },
    radius: 0.2,
    lift: 0.0,
    tiltClosed: 0.24,
    tiltOpen: 1.3,
    curlOpen: -0.32,
    phase: 0.25,
    window: [0.0, 0.6],
    glow: 0.12,
  },
  {
    count: 8,
    shape: { length: 1.15, width: 0.36, cup: 0.85, curl: -0.4, bulge: 0.42 },
    radius: 0.17,
    lift: 0.04,
    tiltClosed: 0.2,
    tiltOpen: 0.95,
    curlOpen: -0.2,
    phase: 0.75,
    window: [0.08, 0.7],
    glow: 0.25,
  },
  {
    count: 8,
    shape: { length: 1.1, width: 0.33, cup: 1.0, curl: -0.36, bulge: 0.43 },
    radius: 0.13,
    lift: 0.08,
    tiltClosed: 0.16,
    tiltOpen: 0.66,
    curlOpen: -0.12,
    phase: 0.25,
    window: [0.2, 0.82],
    glow: 0.45,
  },
  {
    count: 6,
    shape: { length: 0.95, width: 0.3, cup: 1.05, curl: -0.24, bulge: 0.45 },
    radius: 0.09,
    lift: 0.11,
    tiltClosed: 0.12,
    tiltOpen: 0.42,
    curlOpen: -0.05,
    phase: 0.75,
    window: [0.34, 0.92],
    glow: 0.75,
  },
  {
    count: 5,
    shape: { length: 0.6, width: 0.22, cup: 1.15, curl: -0.2, bulge: 0.5 },
    radius: 0.05,
    lift: 0.14,
    tiltClosed: 0.08,
    tiltOpen: 0.22,
    curlOpen: -0.1,
    phase: 0.2,
    window: [0.48, 1.0],
    glow: 1.0,
  },
];

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
