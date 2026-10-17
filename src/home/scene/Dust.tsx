import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { rng } from '../figure'
import { journey } from '../scroll'
import { CH, darkness, focus } from './shared'

const AIR = 1800
const GROUND = 2600

/**
 * Golden dust around the body of light: motes drifting slowly upward in the air, and a
 * glittering pool on the ground where the figure sits. Only on the dark fields.
 */
export function Dust() {
  const dpr = useThree((s) => s.viewport.dpr)
  const geometry = useMemo(() => {
    const r = rng(23)
    const n = AIR + GROUND
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    const ground = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      if (i < AIR) {
        pos.set([(r() - 0.5) * 2.6, r() * 1.9, (r() - 0.5) * 1.6], i * 3)
      } else {
        // A pool that thins out from the body.
        const a = r() * Math.PI * 2
        const rad = 0.15 + Math.pow(r(), 1.8) * 1.15
        pos.set([Math.cos(a) * rad, r() * 0.02, Math.sin(a) * rad * 0.7 + 0.15], i * 3)
        ground[i] = 1
      }
      seed[i] = r()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aGround', new THREE.BufferAttribute(ground, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.8, 0), 3)
    return g
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uPixel: { value: 1 }, uMotion: { value: 1 } },
        vertexShader: /* glsl */ `
          uniform float uTime, uPixel, uMotion;
          attribute float aSeed;
          attribute float aGround;
          varying float vA;
          void main() {
            vec3 p = position;
            if (aGround < 0.5) {
              p.y = mod(p.y + uTime * 0.025 * (0.4 + aSeed) * uMotion, 1.9);
              p.x += sin(uTime * 0.3 + aSeed * 30.0) * 0.03 * uMotion;
            }
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float tw = mix(1.0, 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 50.0), 2.0), uMotion);
            vA = tw * (aGround > 0.5 ? 0.7 : 0.45);
            gl_PointSize = (aGround > 0.5 ? 1.6 : 1.2) * (0.6 + aSeed) * uPixel / -mv.z;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uOpacity;
          varying float vA;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float a = exp(-dot(c, c) * 12.0) * vA * uOpacity;
            if (a < 0.004) discard;
            gl_FragColor = vec4(1.0, 0.86, 0.6, a);
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  )

  useFrame((_, dt) => {
    const t = journey.t
    const u = material.uniforms
    u.uTime.value += dt
    u.uMotion.value = journey.reduced ? 0 : 1
    u.uPixel.value = dpr * 6
    // Strongest when the whole figure is in view.
    const wide = Math.max(focus(t, CH.system, 0.9), focus(t, CH.opening, 0.8), focus(t, CH.ida), focus(t, CH.pingala), focus(t, CH.sushumna))
    u.uOpacity.value = darkness(t) * (0.3 + 0.7 * wide)
  })

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={1} />
}
