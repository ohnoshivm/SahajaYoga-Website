import {
  BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ChakraSlug } from "@/chakras/registry";

/**
 * The seven chakra forms, from the official Sahaja Yoga USA chakra-guide geometry
 * (petal counts and inner symbols). Same construction as the approved renders
 * (design/tools/chakra.html): sculpted pearl petals tinted with the chakra's colour,
 * a gold relief yantra, and a glowing centre.
 */

type Row = { n: number; r0: number; r1: number; w: number; off?: number; inner?: boolean; agnya?: boolean; lift?: number; z?: number };
type Yantra = "square" | "star" | "star12" | "triangle" | "vishuddhi" | "agnya" | "sahasrara";
export type FormSpec = { hue: string; petals: Row[]; yantra: Yantra; iridescent?: boolean };

export const FORMS: Record<ChakraSlug, FormSpec> = {
  mooladhara: { hue: "#E8705A", petals: [{ n: 4, r0: 0.44, r1: 1.0, w: 1.0, off: 0.5 }], yantra: "square" },
  swadisthan: { hue: "#F2C94C", petals: [{ n: 6, r0: 0.46, r1: 1.0, w: 0.95 }, { n: 6, r0: 0.2, r1: 0.44, w: 0.9, off: 0.5, inner: true }], yantra: "star" },
  nabhi: { hue: "#4FB377", petals: [{ n: 10, r0: 0.5, r1: 1.0, w: 0.92 }], yantra: "triangle" },
  anahat: { hue: "#7E72D1", petals: [{ n: 12, r0: 0.5, r1: 1.0, w: 0.92 }], yantra: "star12" },
  vishuddhi: { hue: "#8EC5E8", petals: [{ n: 16, r0: 0.54, r1: 1.0, w: 0.92 }], yantra: "vishuddhi" },
  agnya: { hue: "#C9CED6", petals: [{ n: 2, r0: 0.3, r1: 1.0, w: 1.0, off: 0.5, agnya: true }], yantra: "agnya" },
  sahasrara: {
    hue: "#F4EDE4",
    petals: [
      { n: 32, r0: 0.62, r1: 1.0, w: 1.1, lift: 0.1 },
      { n: 24, r0: 0.56, r1: 0.88, w: 1.1, off: 0.5, lift: 0.22, z: 0.04 },
      { n: 16, r0: 0.5, r1: 0.76, w: 1.1, lift: 0.3, z: 0.08 },
    ],
    yantra: "sahasrara",
    iridescent: true,
  },
};

function petalGeometry(o: { r0: number; r1: number; wMax: number; lift: number; cup: number; thick: number; base: Color; tip: Color }) {
  const { r0, r1, wMax, lift, cup, thick, base, tip } = o;
  const nu = 56, nv = 28, L = r1 - r0;
  const width = (u: number) => wMax * Math.pow(Math.sin(Math.PI * Math.pow(0.12 + 0.88 * u, 0.72)), 1.15);
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const c = new Color();
  for (const sign of [1, -1]) {
    const start = pos.length / 3;
    for (let i = 0; i <= nu; i++) {
      const u = i / nu, w = width(u);
      for (let j = 0; j <= nv; j++) {
        const v = (j / nv) * 2 - 1;
        let z = lift * Math.pow(u, 1.5) + cup * v * v * (w / wMax) * Math.sin(Math.PI * Math.min(1, u * 1.15));
        z += 0.012 * Math.pow(1 - Math.abs(v), 4) * Math.sin(Math.PI * u);
        const t = thick * Math.sqrt(Math.max(0, 1 - v * v)) * (1 - 0.7 * u);
        pos.push(v * w, r0 + u * L, sign > 0 ? z + t * 0.5 : z - t * 0.5);
        c.copy(base).lerp(tip, Math.pow(u, 0.9));
        col.push(c.r, c.g, c.b);
      }
    }
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const a = start + i * (nv + 1) + j, b = a + 1, cc = a + nv + 1, d = cc + 1;
        if (sign > 0) idx.push(a, cc, b, b, cc, d);
        else idx.push(a, b, cc, b, d, cc);
      }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function rods(points: Vector3[], r: number) {
  const parts: BufferGeometry[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length], len = a.distanceTo(b);
    const cyl = new CylinderGeometry(r, r, len, 20, 1, true);
    cyl.translate(0, len / 2, 0);
    cyl.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), b.clone().sub(a).normalize()));
    cyl.translate(a.x, a.y, a.z);
    parts.push(cyl.toNonIndexed());
    const s = new SphereGeometry(r, 20, 12);
    s.translate(a.x, a.y, a.z);
    parts.push(s.toNonIndexed());
  }
  return mergeGeometries(parts)!;
}
const poly = (n: number, r: number, rot: number, z: number) =>
  Array.from({ length: n }, (_, k) => {
    const a = rot + (k / n) * Math.PI * 2;
    return new Vector3(Math.cos(a) * r, Math.sin(a) * r, z);
  });
const tri = (r: number, down: boolean, z: number) => poly(3, r, down ? -Math.PI / 2 : Math.PI / 2, z);
const ring = (r: number, tube: number) => new TorusGeometry(r, tube, 24, 160);

export type FormPart = { geometry: BufferGeometry; material: "petal" | "inner" | "gold" | "cream" | "plate" | "bindu"; rotationZ?: number; z?: number };

export function buildForm(slug: ChakraSlug) {
  const spec = FORMS[slug];
  const hue = new Color(spec.hue);
  const base = hue.clone().multiplyScalar(0.82);
  const tip = hue.clone().lerp(new Color("#ffffff"), 0.3);
  const parts: FormPart[] = [];

  for (const row of spec.petals) {
    const half = Math.PI / row.n;
    const wMax = row.agnya ? 0.4 : Math.min(0.42, Math.sin(half) * row.r1 * row.w * 0.84);
    const g = petalGeometry({ r0: row.r0, r1: row.r1, wMax, lift: row.lift ?? (row.inner ? 0.08 : 0.16), cup: row.inner ? 0.04 : 0.06, thick: row.n > 20 ? 0.03 : 0.05, base, tip });
    for (let i = 0; i < row.n; i++) {
      parts.push({ geometry: g, material: row.inner ? "inner" : "petal", rotationZ: ((i + (row.off ?? 0)) / row.n) * Math.PI * 2, z: (row.inner ? 0.06 : -0.02) + (i % 2) * 0.02 + (row.z ?? 0) });
    }
  }
  const rIn = spec.petals[0].r0 + 0.02;
  parts.push({ geometry: new CylinderGeometry(rIn, rIn, 0.04, 128).rotateX(Math.PI / 2), material: "plate" });
  parts.push({ geometry: ring(rIn, 0.022), material: "gold", z: 0.03 });
  const Z = 0.06, T = 0.012;
  const gold = (g: BufferGeometry, z = 0) => parts.push({ geometry: g, material: "gold", z });
  switch (spec.yantra) {
    case "square": gold(rods(poly(4, rIn * 0.72 * Math.SQRT2, Math.PI / 4, Z), T)); gold(rods(tri(rIn * 0.6, true, Z + 0.01), T)); break;
    case "star": gold(rods(tri(rIn * 0.5, false, Z), T)); gold(rods(tri(rIn * 0.5, true, Z), T)); break;
    case "star12": gold(rods(tri(rIn * 0.86, false, Z), T)); gold(rods(tri(rIn * 0.86, true, Z), T)); break;
    case "triangle": gold(ring(rIn * 0.85, 0.008), Z); gold(rods(tri(rIn * 0.78, true, Z), T)); break;
    case "vishuddhi":
      gold(rods(tri(rIn * 0.92, true, Z), T));
      parts.push({ geometry: new CylinderGeometry(rIn * 0.3, rIn * 0.3, 0.02, 96).rotateX(Math.PI / 2), material: "cream", z: Z });
      gold(ring(rIn * 0.3, 0.009), Z + 0.012);
      break;
    case "agnya": gold(ring(rIn * 0.75, 0.012), Z); break;
    case "sahasrara":
      for (const [r, d] of [[0.88, false], [0.88, true], [0.62, false], [0.62, true], [0.36, true]] as const) gold(rods(tri(rIn * r, !d, Z), T * 0.85));
      break;
  }
  parts.push({ geometry: new SphereGeometry(slug === "vishuddhi" ? 0.07 : 0.05, 32, 16), material: "bindu", z: Z + 0.06 });

  const materials = {
    petal: new MeshPhysicalMaterial({
      color: "#ffffff", vertexColors: true, roughness: 0.34, sheen: 1, sheenRoughness: 0.45,
      sheenColor: hue.clone().lerp(new Color("#ffffff"), 0.7), clearcoat: 0.55, clearcoatRoughness: 0.22,
      iridescence: spec.iridescent ? 1 : 0.35, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 680],
      side: DoubleSide, emissive: hue, emissiveIntensity: 0.05,
    }),
    inner: new MeshPhysicalMaterial({ color: "#e9e2d8", vertexColors: true, roughness: 0.34, sheen: 1, clearcoat: 0.55, side: DoubleSide, emissive: hue, emissiveIntensity: 0.05 }),
    gold: new MeshPhysicalMaterial({ color: "#d8b07a", metalness: 0.85, roughness: 0.26, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    cream: new MeshPhysicalMaterial({ color: "#f6ecdb", roughness: 0.38, sheen: 0.8, sheenColor: new Color("#fff8ee"), clearcoat: 0.4 }),
    plate: new MeshPhysicalMaterial({ color: hue.clone().multiplyScalar(slug === "sahasrara" || slug === "agnya" ? 0.86 : 0.55), roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
    bindu: new MeshStandardMaterial({ color: "#fff4e0", emissive: "#ffd9a0", emissiveIntensity: 1.6 }),
  };
  return { parts, materials };
}
