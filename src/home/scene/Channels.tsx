import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CENTRES, CROWN_Y, KUNDALINI_Y } from '../data'
import { journey, smoothstep } from '../scroll'
import { CH, focus, presence as darkness } from './shared'

/**
 * The three nadis. Ida rises on the person's left (+x) from the Mooladhara and crosses at
 * the Agnya into the right side of the brain; Pingala mirrors it from the Swadisthan;
 * Sushumna runs straight up the spine to the crown.
 */
const at = (id: string) => CENTRES.find((c) => c.id === id)!.y
const Z = -0.035

const side = (s: 1 | -1, fromY: number) =>
  new THREE.CatmullRomCurve3(
    [
      [0, fromY, Z],
      [0.075 * s, fromY + 0.1, Z],
      [0.115 * s, at('nabhi'), Z],
      [0.12 * s, at('anahat'), Z],
      [0.09 * s, at('vishuddhi'), Z],
      [0.05 * s, at('agnya') - 0.06, Z + 0.03],
      [0, at('agnya'), 0.04],
      [-0.055 * s, at('agnya') + 0.07, 0.0],
      [-0.07 * s, at('agnya') + 0.12, -0.02],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    'centripetal',
  )

const CHANNELS = [
  { id: 'ida', curve: side(1, at('mooladhara')), color: '#8DBBFF' },
  { id: 'pingala', curve: side(-1, at('swadisthan')), color: '#FFB24A' },
  {
    id: 'sushumna',
    curve: new THREE.CatmullRomCurve3([new THREE.Vector3(0, KUNDALINI_Y - 0.04, Z), new THREE.Vector3(0, 0.8, Z), new THREE.Vector3(0, CROWN_Y - 0.02, -0.01)]),
    color: '#F6DDA4',
  },
] as const

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGlow, uTime, uHead, uHalo, uMotion;
  varying vec2 vUv;
  void main() {
    float along = vUv.x;
    // Energy flowing upward, and a bright head that travels up when the channel is introduced.
    float flow = 0.6 + 0.4 * sin(along * 46.0 - uTime * 2.4 * uMotion);
    float head = exp(-pow((along - uHead) / 0.05, 2.0)) * 2.2;
    float a = (uGlow * flow + head * step(uHead, 1.05) * uGlow) * (uHalo > 0.5 ? 0.16 : 0.85);
    gl_FragColor = vec4(uColor, a);
  }`

function material(color: string, halo: boolean) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uGlow: { value: 0 },
      uTime: { value: 0 },
      uHead: { value: 2 },
      uHalo: { value: halo ? 1 : 0 },
      uMotion: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })
}

export function Channels() {
  const parts = useMemo(
    () =>
      CHANNELS.map((c) => ({
        ...c,
        core: new THREE.TubeGeometry(c.curve, 220, 0.0042, 8, false),
        halo: new THREE.TubeGeometry(c.curve, 160, 0.016, 10, false),
        coreMat: material(c.color, false),
        haloMat: material(c.color, true),
      })),
    [],
  )

  useFrame((_, dt) => {
    const t = journey.t
    const dark = darkness(t)
    for (const p of parts) {
      const i = CH[p.id]
      // Present from the first chapter; bright on its own; drawn upward as its chapter arrives.
      const own = focus(t, i)
      const opening = focus(t, CH.opening, 0.7)
      const glow = dark * (0.28 + 0.72 * Math.max(own, opening * 0.8, p.id === 'sushumna' ? focus(t, CH.kundalini) * 0.3 : 0))
      const head = journey.reduced || t < i - 0.8 || t > i + 0.3 ? 2 : smoothstep(i - 0.8, i - 0.05, t) * 1.05
      for (const m of [p.coreMat, p.haloMat]) {
        m.uniforms.uGlow.value = glow
        m.uniforms.uTime.value += dt
        m.uniforms.uHead.value = head
        m.uniforms.uMotion.value = journey.reduced ? 0 : 1
      }
    }
  })

  return (
    <group>
      {parts.map((p) => (
        <group key={p.id}>
          <mesh geometry={p.halo} material={p.haloMat} renderOrder={3} />
          <mesh geometry={p.core} material={p.coreMat} renderOrder={4} />
        </group>
      ))}
    </group>
  )
}

