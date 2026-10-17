import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CENTRES, CROWN_Y, KUNDALINI_Y, type Centre } from '../data'
import { journey, smoothstep } from '../scroll'
import { CENTRE_CH, CH, focus, glowMaterial, presence as darkness } from './shared'
import { jitterFor, lotusPetal, placeLayer } from './lotus'

/** Where the rising Kundalini is during the opening chapter (null before and after). */
function risingY(t: number): number | null {
  const k = smoothstep(CH.opening - 0.55, CH.opening + 0.05, t)
  if (k <= 0 || t > CH.opening + 0.6) return null
  return THREE.MathUtils.lerp(KUNDALINI_Y, CROWN_Y + 0.02, k)
}

/** How lit a centre is: its own chapter, or the Kundalini passing through it in the opening. */
function lightOf(c: Centre, t: number) {
  const own = focus(t, CENTRE_CH[c.id])
  const rise = risingY(t)
  const lit = rise === null ? (t > CH.opening ? focus(t, CH.opening, 0.9) : 0) : smoothstep(c.y - 0.03, c.y + 0.02, rise)
  return Math.max(own, lit)
}

/**
 * One chakra as a small glowing lotus in 3D, with its true number of petals, sitting
 * like a flower that opens toward the viewer. It turns slowly clockwise.
 */
function Lotus({ c }: { c: Centre }) {
  const spin = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.InstancedMesh>(null)
  const n = c.petals
  const wings = n === 2
  const geo = useMemo(() => lotusPetal({ cup: wings ? 0.3 : 0.5, bend: wings ? -0.05 : 0.12, curl: 0.25 }), [wings])
  const layer = useMemo(
    () => ({ n, r: wings ? 0.005 : 0.01, len: wings ? 0.062 : 0.056, width: wings ? 0.62 : n > 10 ? 0.42 : 0.56, tilt: wings ? 0.25 : 0.62, z: 0 }),
    [n, wings],
  )
  const jitter = useMemo(() => jitterFor(n, n * 7 + 3), [n])
  const mat = useMemo(
    () =>
      // Normal blending keeps each chakra's own colour; the halo behind carries the glow.
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(c.glow).multiplyScalar(1.1),
        vertexColors: true,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      }),
    [c.glow],
  )
  const core = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(c.glow).lerp(new THREE.Color('#ffffff'), 0.55), transparent: true, opacity: 0, toneMapped: false }), [c.glow])
  const halo = useMemo(() => glowMaterial(c.glow), [c.glow])
  const last = useRef(-1)

  useLayoutEffect(() => {
    if (mesh.current) placeLayer(mesh.current, layer, 0.7, 0, jitter)
  }, [layer, jitter])

  useFrame((_, dt) => {
    const t = journey.t
    const dark = darkness(t)
    const level = lightOf(c, t)
    const open = 0.7 + 0.3 * level
    if (mesh.current && Math.abs(open - last.current) > 0.002) {
      placeLayer(mesh.current, layer, open, 0, jitter)
      last.current = open
    }
    mat.opacity = dark * (0.62 + 0.38 * level)
    core.opacity = dark * (0.5 + 0.5 * level)
    halo.uniforms.uOpacity.value = dark * (0.25 + 0.95 * level)
    if (spin.current) {
      if (!wings) spin.current.rotation.z -= dt * (0.12 + level * 0.3) * (journey.reduced ? 0 : 1)
      spin.current.scale.setScalar(1 + level * 0.4)
    }
  })

  return (
    <group position={[0, c.y, c.z + 0.02]}>
      {/* Tilted toward the viewer, like a flower seen from slightly above. */}
      <group rotation={[wings ? 0 : -0.95, 0, 0]}>
        <group ref={spin}>
          <instancedMesh ref={mesh} args={[geo, mat, n]} frustumCulled={false} renderOrder={6} />
          <mesh material={core} position={[0, 0, 0.008]} renderOrder={7}>
            <sphereGeometry args={[0.012, 16, 16]} />
          </mesh>
        </group>
      </group>
      <mesh material={halo} scale={0.28} renderOrder={5}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  )
}

/** The Void: a wide, calm ring of light around the body at the Nabhi, the ocean of illusion. */
function VoidRing({ c }: { c: Centre }) {
  const mats = useMemo(
    () =>
      [0, 1].map(() => new THREE.MeshBasicMaterial({ color: c.glow, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })),
    [c.glow],
  )
  const ring = useRef<THREE.Group>(null)
  useFrame((state) => {
    const t = journey.t
    const level = lightOf(c, t)
    const dark = darkness(t)
    mats[0].opacity = dark * (0.35 + 0.65 * level)
    mats[1].opacity = dark * (0.08 + 0.3 * level)
    if (ring.current && !journey.reduced) ring.current.rotation.z = state.clock.elapsedTime * 0.05
  })
  return (
    <group position={[0, c.y, 0.03]} rotation={[Math.PI / 2 - 0.12, 0, 0]}>
      <group ref={ring}>
        <mesh material={mats[0]}>
          <torusGeometry args={[0.42, 0.0022, 8, 220]} />
        </mesh>
        <mesh material={mats[1]}>
          <torusGeometry args={[0.42, 0.012, 10, 220]} />
        </mesh>
      </group>
    </group>
  )
}

/** The Kundalini: a golden spiral of three and a half turns inside the triangular sacrum. */
function Kundalini() {
  const spiral = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const turns = 3.5
    for (let i = 0; i <= 220; i++) {
      const k = i / 220
      const a = k * turns * Math.PI * 2
      const r = 0.004 + k * 0.03
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 440, 0.0022, 6, false)
  }, [])
  const tri = useMemo(() => {
    const s = 0.058
    const pts = [0, 1, 2, 0].map((k) => {
      const a = -Math.PI / 2 + (k * Math.PI * 2) / 3
      return new THREE.Vector3(Math.cos(a) * s, Math.sin(a) * s - 0.006, 0)
    })
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0), 90, 0.0014, 4, false)
  }, [])
  const coilMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFD98A').multiplyScalar(1.3), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }),
    [],
  )
  const triMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#F6DDA4', transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }), [])
  const halo = useMemo(() => glowMaterial('#FFD98A'), [])
  const orb = useMemo(() => glowMaterial('#FFF4DC'), [])
  const coil = useRef<THREE.Group>(null)
  const orbMesh = useRef<THREE.Mesh>(null)

  useFrame((_, dt) => {
    const t = journey.t
    const dark = darkness(t)
    const own = focus(t, CH.kundalini)
    const rise = risingY(t)
    const away = rise === null ? (t > CH.opening ? 1 : 0) : smoothstep(KUNDALINI_Y, KUNDALINI_Y + 0.15, rise)
    coilMat.opacity = dark * (0.55 + 0.45 * own) * (1 - away * 0.7)
    triMat.opacity = dark * (0.2 + 0.55 * own)
    halo.uniforms.uOpacity.value = dark * (0.2 + 0.8 * own) * (1 - away * 0.6)
    if (coil.current && !journey.reduced) coil.current.rotation.z -= dt * (0.25 + own * 0.8)
    const o = orbMesh.current
    if (o) {
      o.visible = rise !== null
      if (rise !== null) o.position.y = rise
      orb.uniforms.uOpacity.value = rise === null ? 0 : 1.3
    }
  })

  return (
    <group>
      <group position={[0, KUNDALINI_Y, 0.03]}>
        <group ref={coil}>
          <mesh geometry={spiral} material={coilMat} renderOrder={6} />
        </group>
        <mesh geometry={tri} material={triMat} renderOrder={6} />
        <mesh material={halo} scale={0.22} renderOrder={5}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </group>
      <mesh ref={orbMesh} material={orb} position={[0, KUNDALINI_Y, 0]} scale={0.2} renderOrder={7}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  )
}

export function Centres() {
  return (
    <group>
      {CENTRES.filter((c) => c.id !== 'sahasrara' && c.id !== 'void').map((c) => (
        <Lotus key={c.id} c={c} />
      ))}
      <VoidRing c={CENTRES.find((c) => c.id === 'void')!} />
      <Kundalini />
    </group>
  )
}
