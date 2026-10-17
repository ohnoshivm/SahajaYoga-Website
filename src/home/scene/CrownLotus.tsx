import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CROWN_Y } from '../data'
import { journey, smoothstep } from '../scroll'
import { CH, darkness, focus, glowMaterial } from './shared'
import { jitterFor, lotusPetal, placeLayer, type Layer } from './lotus'

/**
 * The hero, and the Sahasrara on the figure's crown: a lotus of broad, glossy, iridescent
 * petals: violet at the heart, through blue, teal, green and gold, to peach and rose at
 * the rim, around gold stamens and a pearl bindu. It opens layer by layer on arrival.
 */

type Petals = Layer & { color: [number, number, number]; cup: number; bend: number; curl: number }

const LAYERS: Petals[] = [
  { n: 8, r: 0.09, len: 0.95, width: 0.56, tilt: 1.28, z: 0.16, cup: 0.5, bend: 0.2, curl: 0.2, color: [272, 0.72, 0.6] },
  { n: 10, r: 0.16, len: 1.08, width: 0.56, tilt: 1.08, z: 0.13, cup: 0.48, bend: 0.16, curl: 0.24, color: [228, 0.74, 0.6] },
  { n: 12, r: 0.23, len: 1.2, width: 0.56, tilt: 0.88, z: 0.1, cup: 0.46, bend: 0.12, curl: 0.26, color: [188, 0.68, 0.53] },
  { n: 14, r: 0.3, len: 1.3, width: 0.55, tilt: 0.7, z: 0.07, cup: 0.45, bend: 0.08, curl: 0.28, color: [96, 0.56, 0.56] },
  { n: 16, r: 0.37, len: 1.4, width: 0.54, tilt: 0.52, z: 0.04, cup: 0.44, bend: 0.05, curl: 0.3, color: [42, 0.84, 0.64] },
  { n: 18, r: 0.43, len: 1.46, width: 0.53, tilt: 0.34, z: 0.01, cup: 0.43, bend: 0.03, curl: 0.32, color: [22, 0.84, 0.72] },
  { n: 20, r: 0.48, len: 1.52, width: 0.52, tilt: 0.16, z: -0.02, cup: 0.42, bend: 0.0, curl: 0.34, color: [350, 0.74, 0.76] },
]
const STAMENS = 54
const SCALE = 0.074

/** Fine veins along each petal, lighter toward the tip. */
function veinTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 512
  const g = c.getContext('2d')!
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, 256, 512)
  g.strokeStyle = 'rgba(90, 50, 80, 0.12)'
  g.lineCap = 'round'
  for (let k = -6; k <= 6; k++) {
    g.lineWidth = k === 0 ? 2.4 : 1.2
    g.beginPath()
    g.moveTo(128 + k * 3, 0)
    g.bezierCurveTo(128 + k * 14, 160, 128 + k * 17, 330, 128 + k * 4, 506)
    g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** Light from within: bright at the base of each petal, fading toward the tip. */
function innerGlow() {
  const c = document.createElement('canvas')
  c.width = 8
  c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 256, 0, 0)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.45, '#5a5a5a')
  grad.addColorStop(1, '#101010')
  g.fillStyle = grad
  g.fillRect(0, 0, 8, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function CrownLotus() {
  const group = useRef<THREE.Group>(null)
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([])
  const born = useRef<number | null>(null)
  const veins = useMemo(veinTexture, [])
  const glow = useMemo(innerGlow, [])
  const geos = useMemo(() => LAYERS.map((l) => lotusPetal({ cup: l.cup, bend: l.bend, curl: l.curl })), [])
  const jitter = useMemo(() => LAYERS.map((l, i) => jitterFor(l.n, 7 + i * 13)), [])

  const mats = useMemo(
    () =>
      LAYERS.map((l) => {
        const color = new THREE.Color().setHSL(l.color[0] / 360, l.color[1], l.color[2])
        return new THREE.MeshPhysicalMaterial({
          color,
          vertexColors: true,
          map: veins,
          side: THREE.DoubleSide,
          roughness: 0.3,
          clearcoat: 1,
          clearcoatRoughness: 0.14,
          iridescence: 0.38,
          iridescenceIOR: 1.35,
          iridescenceThicknessRange: [160, 520],
          sheen: 0.4,
          sheenRoughness: 0.4,
          sheenColor: new THREE.Color('#ffffff'),
          emissive: color.clone().offsetHSL(0, 0.05, 0.12),
          emissiveMap: glow,
          emissiveIntensity: 0.55,
          envMapIntensity: 1.25,
        })
      }),
    [veins, glow],
  )
  const gold = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#F1C877', metalness: 0.85, roughness: 0.25, clearcoat: 0.6, emissive: new THREE.Color('#F7CF7E'), emissiveIntensity: 0.25 }),
    [],
  )
  const tips = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFE3A3').multiplyScalar(1.6), toneMapped: false }), [])
  const pearl = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#FFF8EC', roughness: 0.12, clearcoat: 1, iridescence: 0.5, emissive: new THREE.Color('#FFE6BC'), emissiveIntensity: 0.7 }),
    [],
  )
  const heart = useMemo(() => glowMaterial('#FFE9C4'), [])
  const floor = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uShadow: { value: 0.2 }, uWarm: { value: 0.35 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `uniform float uShadow, uWarm; varying vec2 vUv;
          float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          void main(){
            float d = length(vUv - 0.5) * 2.0;
            float shade = pow(smoothstep(1.0, 0.0, d), 2.4) * uShadow;
            float warm = pow(smoothstep(0.85, 0.0, d), 1.6) * uWarm;
            vec3 c = mix(vec3(0.24, 0.17, 0.12), vec3(0.98, 0.72, 0.42), warm / max(shade + warm, 0.001));
            float a = shade + warm * 0.6 + (h(gl_FragCoord.xy) - 0.5) / 255.0;
            gl_FragColor = vec4(c, max(a, 0.0));
          }`,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )

  const filament = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.008, 0.012, 0.36, 5)
    g.translate(0, 0.18, 0)
    return g
  }, [])
  const tipGeo = useMemo(() => new THREE.SphereGeometry(0.028, 10, 10), [])
  const stamenRef = useRef<THREE.InstancedMesh>(null)
  const tipRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    LAYERS.forEach((l, i) => meshes.current[i] && placeLayer(meshes.current[i]!, l, 0, i % 2 ? Math.PI / l.n : 0, jitter[i]))
    const d = new THREE.Object3D()
    const p = new THREE.Vector3()
    for (let k = 0; k < STAMENS; k++) {
      const a = (k / STAMENS) * Math.PI * 2 + (k % 2) * 0.06
      const r = 0.05 + (k % 3) * 0.02
      d.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.18)
      d.rotation.set(0, 0, 0)
      d.rotateZ(a - Math.PI / 2)
      d.rotateX(1.05 + (k % 3) * 0.12)
      d.scale.setScalar(0.9 + (k % 4) * 0.08)
      d.updateMatrix()
      stamenRef.current?.setMatrixAt(k, d.matrix)
      p.set(0, 0.36, 0).applyMatrix4(d.matrix)
      d.position.copy(p)
      d.scale.setScalar(1)
      d.rotation.set(0, 0, 0)
      d.updateMatrix()
      tipRef.current?.setMatrixAt(k, d.matrix)
    }
    if (stamenRef.current) stamenRef.current.instanceMatrix.needsUpdate = true
    if (tipRef.current) tipRef.current.instanceMatrix.needsUpdate = true
  }, [jitter])

  const last = useRef<number[]>(LAYERS.map(() => -1))

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const now = state.clock.elapsedTime
    born.current ??= now
    const age = now - born.current
    const t = journey.t
    const dark = darkness(t)
    const wide = Math.max(focus(t, CH.sahasrara), focus(t, CH.opening))
    const breath = journey.reduced ? 0 : Math.sin(now * 0.55) * 0.02

    // Arrival: the outer layers open first, the heart last.
    LAYERS.forEach((l, i) => {
      const start = 0.3 + (LAYERS.length - 1 - i) * 0.17
      const arrive = journey.reduced ? 1 : smoothstep(start, start + 1.9, age)
      const open = arrive * (1 + breath) + wide * 0.12
      const mesh = meshes.current[i]
      if (mesh && Math.abs(open - last.current[i]) > 0.0005) {
        placeLayer(mesh, l, open, i % 2 ? Math.PI / l.n : 0, jitter[i])
        last.current[i] = open
      }
    })

    const hero = 1 - smoothstep(-0.9, -0.45, t)
    // The lotus leaves with the figure before the close, and steps back for the hands.
    const away = smoothstep(CH.hands + 0.3, CH.begin - 0.2, t)
    const outer = g.parent
    if (outer) {
      outer.visible = away < 0.999
      outer.scale.setScalar(1 - away)
    }
    const [px, py] = journey.reduced ? [0, 0] : journey.pointer
    g.rotation.z += dt * 0.04
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -Math.PI / 2 + py * 0.12 * hero, 3, dt)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, px * 0.12 * hero, 3, dt)

    // On the dark fields the lotus carries its own light, enough to bloom.
    mats.forEach((m, i) => (m.emissiveIntensity = 0.55 + dark * (0.35 + 0.25 * (1 - i / LAYERS.length)) + wide * 0.35))
    gold.emissiveIntensity = 0.25 + dark * 0.5
    pearl.emissiveIntensity = 0.7 + dark * 1.4 + wide * 1.6
    heart.uniforms.uOpacity.value = 0.18 + dark * 0.6 + wide * 0.6
    floor.uniforms.uShadow.value = 0.18 * (1 - smoothstep(-0.95, -0.6, t))
    floor.uniforms.uWarm.value = 0.26 * (1 - smoothstep(-0.95, -0.6, t))
  })

  return (
    <group position={[0, CROWN_Y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} material={floor} renderOrder={0}>
        <planeGeometry args={[0.62, 0.62]} />
      </mesh>
      <group ref={group} scale={SCALE} rotation={[-Math.PI / 2, 0, 0]}>
        {LAYERS.map((l, i) => (
          <instancedMesh
            key={i}
            ref={(m) => {
              meshes.current[i] = m
            }}
            args={[geos[i], mats[i], l.n]}
            frustumCulled={false}
          />
        ))}
        <instancedMesh ref={stamenRef} args={[filament, gold, STAMENS]} frustumCulled={false} />
        <instancedMesh ref={tipRef} args={[tipGeo, tips, STAMENS]} frustumCulled={false} />
        <mesh material={pearl} position={[0, 0, 0.3]}>
          <sphereGeometry args={[0.13, 48, 48]} />
        </mesh>
      </group>
      <mesh material={heart} position={[0, 0.03, 0]} scale={0.22} renderOrder={5}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  )
}
