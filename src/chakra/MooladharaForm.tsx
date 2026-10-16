import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Mooladhara as a sculpted jewel, true to the Sahaja Yoga icon:
 * four petals, a lapis circle, an orange square (earth) and a yellow
 * downward triangle, each inlaid in gold. Procedural; it never spins.
 */

type Shape = THREE.Shape

function petalShape(scale = 1): Shape {
  const k = scale
  const s = new THREE.Shape()
  s.moveTo(-0.6 * k, 0)
  s.bezierCurveTo(-0.84 * k, 0.4 * k, -0.52 * k, 0.82 * k, 0, 1.12 * k)
  s.bezierCurveTo(0.52 * k, 0.82 * k, 0.84 * k, 0.4 * k, 0.6 * k, 0)
  s.bezierCurveTo(0.3 * k, -0.14 * k, -0.3 * k, -0.14 * k, -0.6 * k, 0)
  return s
}

function roundedSquare(half: number, r: number): Shape {
  const s = new THREE.Shape()
  s.moveTo(-half + r, -half)
  s.lineTo(half - r, -half)
  s.quadraticCurveTo(half, -half, half, -half + r)
  s.lineTo(half, half - r)
  s.quadraticCurveTo(half, half, half - r, half)
  s.lineTo(-half + r, half)
  s.quadraticCurveTo(-half, half, -half, half - r)
  s.lineTo(-half, -half + r)
  s.quadraticCurveTo(-half, -half, -half + r, -half)
  return s
}

function downTriangle(size: number, r = 0.035): Shape {
  // Points down, as in the Sahaja Yoga icon; corners softly rounded.
  const h = size * Math.sqrt(3) * 0.5
  const pts = [
    new THREE.Vector2(-size / 2, h / 3),
    new THREE.Vector2(size / 2, h / 3),
    new THREE.Vector2(0, (-2 * h) / 3),
  ]
  const s = new THREE.Shape()
  pts.forEach((p, i) => {
    const prev = pts[(i + 2) % 3]
    const next = pts[(i + 1) % 3]
    const a = p.clone().add(prev.clone().sub(p).setLength(r * 3))
    const b = p.clone().add(next.clone().sub(p).setLength(r * 3))
    if (i === 0) s.moveTo(a.x, a.y)
    else s.lineTo(a.x, a.y)
    s.quadraticCurveTo(p.x, p.y, b.x, b.y)
  })
  s.closePath()
  return s
}

function extrude(shape: Shape, depth: number, bevel: number) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8,
    bevelSegments: 8, curveSegments: 64,
  })
  g.translate(0, 0, -depth / 2)
  return g
}

/** Cup a petal: edges lift toward the viewer, the tip leans back, like a real lotus petal. */
function cup(g: THREE.BufferGeometry, lift: number, lean: number) {
  const p = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const nx = x / 0.8
    const ny = Math.max(0, y) / 1.12
    p.setZ(i, z + lift * nx * nx * (0.35 + ny) - lean * ny * ny)
  }
  p.needsUpdate = true
  g.computeVertexNormals()
  return g
}

type Props = {
  pulse: React.MutableRefObject<number>
  bloom: React.MutableRefObject<number>
  pointer: React.MutableRefObject<[number, number]>
  still: boolean
}

export function MooladharaForm({ pulse, bloom, pointer, still }: Props) {
  const group = useRef<THREE.Group>(null)

  const geo = useMemo(() => ({
    petal: cup(extrude(petalShape(1), 0.14, 0.07), 0.2, 0.18),
    petalRim: cup(extrude(petalShape(1.07), 0.06, 0.03), 0.2, 0.18),
    disc: (() => {
      const g = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 160, 1)
      g.rotateX(Math.PI / 2)
      return g
    })(),
    ring: new THREE.TorusGeometry(1.215, 0.048, 32, 200),
    squareFrame: extrude(roundedSquare(0.86, 0.06), 0.1, 0.035),
    square: extrude(roundedSquare(0.79, 0.045), 0.12, 0.04),
    triFrame: extrude(downTriangle(1.5), 0.1, 0.03),
    tri: extrude(downTriangle(1.36), 0.13, 0.035),
  }), [])

  const mats = useMemo(() => {
    const jewel = (color: string, o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
      new THREE.MeshPhysicalMaterial({
        color, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12,
        emissive: new THREE.Color(color), emissiveIntensity: 0, ...o,
      })
    const gold = new THREE.MeshPhysicalMaterial({
      color: '#E9C98B', metalness: 1, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.2,
    })
    return {
      gold,
      petal: jewel('#A3110B', { envMapIntensity: 0.5, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.32, sheen: 0.35, sheenColor: new THREE.Color('#ff8f78'), sheenRoughness: 0.5 }),
      disc: jewel('#22389A', { roughness: 0.18 }),
      square: jewel('#E2621A', { roughness: 0.26, metalness: 0.18, clearcoatRoughness: 0.22 }),
      tri: jewel('#F6B70E', { envMapIntensity: 0.75, roughness: 0.2, metalness: 0.12, clearcoatRoughness: 0.16 }),
    }
  }, [])

  // Top, right, bottom and left, as in the icon.
  const petals = [0, 1, 2, 3].map((i) => {
    const a = (i * Math.PI) / 2
    return { pos: [Math.sin(a) * 0.98, Math.cos(a) * 0.98, -0.16] as const, rot: -a }
  })

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const max = THREE.MathUtils.degToRad(5)
    const [px, py] = still ? [0, 0] : pointer.current
    // Resting pose leans back a little so it reads as an object, not an icon.
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, px * max, 2.6, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -0.2 - py * max, 2.6, dt)
    const breath = still ? 0 : Math.sin((t / 10) * Math.PI * 2)
    g.position.y = breath * 0.05
    pulse.current = Math.max(0, pulse.current - dt * 1.8)
    bloom.current = Math.max(0, bloom.current - dt * 0.6)
    const p = pulse.current
    const b = bloom.current
    g.scale.setScalar(1 + breath * 0.008 + p * 0.022 + b * 0.04)
    mats.tri.emissiveIntensity = 0.16 + p * 0.5 + b * 0.9
    mats.square.emissiveIntensity = p * 0.25 + b * 0.5
    mats.petal.emissiveIntensity = p * 0.18 + b * 0.45
  })

  return (
    <group ref={group}>
      {petals.map((p, i) => (
        <group key={i} position={p.pos} rotation={[0, 0, p.rot]}>
          <mesh geometry={geo.petalRim} material={mats.gold} position={[0, -0.02, -0.05]} />
          <mesh geometry={geo.petal} material={mats.petal} />
        </group>
      ))}
      <mesh geometry={geo.disc} material={mats.disc} />
      <mesh geometry={geo.ring} material={mats.gold} position={[0, 0, 0.08]} />
      <mesh geometry={geo.squareFrame} material={mats.gold} position={[0, 0, 0.12]} />
      <mesh geometry={geo.square} material={mats.square} position={[0, 0, 0.19]} />
      <mesh geometry={geo.triFrame} material={mats.gold} position={[0, 0.216, 0.29]} />
      <mesh geometry={geo.tri} material={mats.tri} position={[0, 0.196, 0.36]} />
    </group>
  )
}
