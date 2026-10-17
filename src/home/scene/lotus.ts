import * as THREE from 'three'

/**
 * A real lotus petal as a curved surface: narrow at the base, broad through the middle,
 * drawing to a soft point; cupped across its width and bending along its length.
 * Local frame: base at the origin, tip at y = 1, the inside of the cup facing +z.
 */
export function lotusPetal({ cup = 0.45, bend = 0.2, curl = 0.25, segU = 14, segV = 28 } = {}) {
  const pos: number[] = []
  const uv: number[] = []
  const col: number[] = []
  const idx: number[] = []
  // Full, rounded shoulders that draw to a soft point.
  const half = (v: number) => 0.05 * (1 - v) + 0.43 * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.92)), 0.7) * (1 - 0.18 * v * v * v)
  for (let j = 0; j <= segV; j++) {
    const v = j / segV
    const w = half(v)
    for (let i = 0; i <= segU; i++) {
      const u = (i / segU) * 2 - 1
      const x = u * w
      // Spoon-like: the edges lift into a cup, the middle bellies out, the tip bends.
      const tip = Math.max(0, v - 0.55)
      const z = cup * u * u * w * 1.7 - 0.06 * Math.sin(Math.PI * v) + bend * v * v + curl * tip * tip * 4
      pos.push(x, v, z)
      uv.push(u * 0.5 + 0.5, v)
      // Deeper at the base, luminous at the tip, a bright rim along the edges.
      const k = Math.min(1, 0.56 + 0.4 * Math.pow(v, 0.8) + 0.14 * Math.pow(Math.abs(u), 6))
      col.push(k, k, k)
    }
  }
  const row = segU + 1
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * row + i
      idx.push(a, a + 1, a + row, a + 1, a + row + 1, a + row)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

export type Layer = {
  n: number
  /** Distance of the petal bases from the centre. */
  r: number
  len: number
  /** Width relative to length. */
  width: number
  /** Lift when fully open (radians from lying flat). */
  tilt: number
  /** Height of this layer's bases on the axis. */
  z: number
}

const dummy = new THREE.Object3D()

/**
 * Place one layer's petals. `open` runs from 0 (a closed bud) to 1 (fully open);
 * `jitter` gives each petal a fixed, gentle irregularity so the flower looks grown.
 */
export function placeLayer(mesh: THREE.InstancedMesh, layer: Layer, open: number, offset: number, jitter?: number[]) {
  const { n, r, len, width, tilt, z } = layer
  const lift = THREE.MathUtils.lerp(1.52, tilt, open)
  for (let k = 0; k < n; k++) {
    const j = jitter?.[k] ?? 0
    const a = (k / n) * Math.PI * 2 + offset
    dummy.position.set(Math.cos(a) * r, Math.sin(a) * r, z)
    dummy.rotation.set(0, 0, 0)
    dummy.rotateZ(a - Math.PI / 2 + j * 0.04)
    dummy.rotateX(lift + j * 0.06)
    dummy.scale.set(len * width * (1 + j * 0.05), len, len)
    dummy.updateMatrix()
    mesh.setMatrixAt(k, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
}

export function jitterFor(n: number, seed: number) {
  let s = seed
  return Array.from({ length: n }, () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1)
}
