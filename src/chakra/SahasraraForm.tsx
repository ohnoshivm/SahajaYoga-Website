import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { FormProps } from './ChakraForm'

/**
 * Sahasrara, the thousand-petalled lotus: exactly 1000 petals in eight rings,
 * a soft rainbow from violet at the heart to rose at the rim (the Sahasrara
 * integrates all the chakras' colours), opening around a golden centre and a
 * glowing bindu. Inner petals stand more upright, as a lotus opening towards you.
 */

const RINGS = [16, 40, 72, 104, 136, 176, 216, 240] // = 1000
const R0 = 0.56
const STEP = 0.215

function petalGeometry() {
  // Unit petal: base at y=0, tip at y=1, width 1.
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(0.52, 0.18, 0.46, 0.72, 0, 1)
  s.bezierCurveTo(-0.46, 0.72, -0.52, 0.18, 0, 0)
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.025, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 4, curveSegments: 24,
  })
  // A gentle cup along the length so each petal catches light.
  const p = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    p.setZ(i, p.getZ(i) + 0.22 * x * x - 0.06 * y * y)
  }
  g.computeVertexNormals()
  return g
}

function hexagram(r: number) {
  const tri = (rot: number) => {
    const s = new THREE.Shape()
    for (let k = 0; k < 3; k++) {
      const a = rot + (k * Math.PI * 2) / 3
      const x = Math.sin(a) * r
      const y = Math.cos(a) * r
      if (k === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    }
    s.closePath()
    return s
  }
  const opts = { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 3 }
  return [new THREE.ExtrudeGeometry(tri(0), opts), new THREE.ExtrudeGeometry(tri(Math.PI), opts)]
}

const dummy = new THREE.Object3D()

export function SahasraraForm({ pulse, bloom, pointer, still }: FormProps) {
  const group = useRef<THREE.Group>(null)
  const rings = useRef<(THREE.InstancedMesh | null)[]>([])

  const petal = useMemo(petalGeometry, [])
  const [triUp, triDown] = useMemo(() => hexagram(0.3), [])

  const ringMats = useMemo(
    () =>
      RINGS.map((_, i) => {
        const hue = (275 - i * 38 + 360) % 360
        const color = new THREE.Color().setHSL(hue / 360, 0.8 + i * 0.02, i < 2 ? 0.66 : 0.56 - i * 0.012)
        return new THREE.MeshPhysicalMaterial({
          color, roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.28,
          iridescence: 0.3, iridescenceIOR: 1.3, iridescenceThicknessRange: [200, 480],
          emissive: color, emissiveIntensity: 0, envMapIntensity: 0.6 - i * 0.05,
        })
      }),
    [],
  )
  const gold = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#E8C47C', metalness: 1, roughness: 0.22, clearcoat: 0.5, emissive: new THREE.Color('#E8C47C'), emissiveIntensity: 0 }),
    [],
  )
  const rose = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#F0A57A', metalness: 0.6, roughness: 0.25, clearcoat: 0.8 }),
    [],
  )
  const bindu = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#FFF7EC', roughness: 0.15, clearcoat: 1, emissive: new THREE.Color('#FFE7C2'), emissiveIntensity: 0.35 }),
    [],
  )

  // Ring layout, recomputed each frame only for the opening ripple.
  const place = (ring: number, open: number) => {
    const mesh = rings.current[ring]
    if (!mesh) return
    const n = RINGS[ring]
    const r = R0 + ring * STEP
    const len = 0.46 + ring * 0.035
    const width = ((2 * Math.PI * r) / n) * 1.25
    const tilt = 0.95 - ring * 0.115 - open
    const z = 0.42 - ring * 0.06
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + (ring % 2 ? Math.PI / n : 0)
      dummy.position.set(Math.cos(a) * (r - len * 0.45), Math.sin(a) * (r - len * 0.45), z)
      dummy.rotation.set(0, 0, 0)
      dummy.rotateZ(a - Math.PI / 2)
      dummy.rotateX(Math.max(0, tilt))
      dummy.scale.set(width, len, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(k, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => {
    RINGS.forEach((_, i) => place(i, 0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const max = THREE.MathUtils.degToRad(5)
    const [px, py] = still ? [0, 0] : pointer.current
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, px * max, 2.6, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -0.12 - py * max, 2.6, dt)
    const breath = still ? 0 : Math.sin((t / 10) * Math.PI * 2)
    g.position.y = breath * 0.04
    pulse.current = Math.max(0, pulse.current - dt * 1.8)
    bloom.current = Math.max(0, bloom.current - dt * 0.5)
    const p = pulse.current
    const b = bloom.current
    g.scale.setScalar(1 + breath * 0.008 + p * 0.018 + b * 0.03)

    // Petals breathe open a touch with the breath; a round sends a wave out from the centre.
    if (!still || b > 0) {
      RINGS.forEach((_, i) => {
        const wave = b > 0 ? Math.max(0, Math.sin((1 - b) * Math.PI * 2.2 - i * 0.45)) * b * 0.35 : 0
        place(i, breath * 0.03 + wave)
      })
    }
    ringMats.forEach((m, i) => {
      m.emissiveIntensity = p * 0.12 + b * 0.25 * (1 - i / RINGS.length)
    })
    bindu.emissiveIntensity = 0.35 + p * 0.9 + b * 1.4
    gold.emissiveIntensity = p * 0.15 + b * 0.3
  })

  return (
    <group ref={group}>
      {RINGS.map((n, i) => (
        <instancedMesh
          key={i}
          ref={(m) => {
            rings.current[i] = m
          }}
          args={[petal, ringMats[i], n]}
          renderOrder={RINGS.length - i}
        />
      ))}
      <mesh material={gold} position={[0, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.08, 96]} />
      </mesh>
      <mesh material={gold} position={[0, 0, 0.42]}>
        <torusGeometry args={[0.46, 0.028, 16, 120]} />
      </mesh>
      <mesh geometry={triUp} material={rose} position={[0, 0, 0.42]} />
      <mesh geometry={triDown} material={rose} position={[0, 0, 0.45]} />
      <mesh material={bindu} position={[0, 0, 0.56]}>
        <sphereGeometry args={[0.1, 48, 48]} />
      </mesh>
    </group>
  )
}
