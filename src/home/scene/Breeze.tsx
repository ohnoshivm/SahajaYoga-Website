import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CROWN_Y } from '../data'
import { rng } from '../figure'
import { journey, smoothstep } from '../scroll'
import { CH, darkness, focus } from './shared'

const COUNT = 2600

/**
 * The cool breeze: a column of glittering motes rising from the heart of the lotus,
 * each twinkling on its own. Blue-white on the ivory hero, pure light on the dark
 * fields; strongest when the Sahasrara opens.
 */
export function Breeze() {
  const dpr = useThree((s) => s.viewport.dpr)
  const geometry = useMemo(() => {
    const r = rng(11)
    const pos = new Float32Array(COUNT * 3)
    const seed = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const a = r() * Math.PI * 2
      // Denser at the core of the column.
      const rad = Math.pow(r(), 1.6)
      pos.set([Math.cos(a) * rad, r(), Math.sin(a) * rad], i * 3)
      seed[i] = r()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 2)
    return g
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#7FA6F0') },
          uCore: { value: new THREE.Color('#ffffff') },
          uOpacity: { value: 0 },
          uHeight: { value: 0.9 },
          uWidth: { value: 0.05 },
          uPixel: { value: 1 },
          uSpeed: { value: 0.07 },
        },
        vertexShader: /* glsl */ `
          uniform float uTime, uHeight, uWidth, uPixel, uSpeed;
          attribute float aSeed;
          varying float vFade;
          varying float vStar;
          void main() {
            float h = fract(position.y + uTime * uSpeed * (0.5 + aSeed * 0.9));
            float w = uWidth * (0.3 + h * 1.5);
            vec3 p = vec3(position.x * w + sin(uTime * 0.5 + aSeed * 12.0 + h * 5.0) * 0.01 * h, h * uHeight + 0.02, position.z * w);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            vFade = smoothstep(0.0, 0.1, h) * (1.0 - smoothstep(0.5, 1.0, h));
            // A few motes are stars: larger, with a slow twinkle.
            float star = step(0.93, aSeed);
            float tw = 0.5 + 0.5 * sin(uTime * (2.0 + aSeed * 3.0) + aSeed * 40.0);
            vStar = star * tw;
            gl_PointSize = (0.6 + aSeed * 0.9 + star * 2.6 * tw) * uPixel / -mv.z;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor, uCore;
          uniform float uOpacity;
          varying float vFade;
          varying float vStar;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = dot(c, c);
            float soft = exp(-d * 10.0);
            // Stars get a bright core and a thin cross of light.
            float cross = vStar * (exp(-abs(c.x) * 40.0) * exp(-abs(c.y) * 6.0) + exp(-abs(c.y) * 40.0) * exp(-abs(c.x) * 6.0));
            float a = (soft + cross) * vFade * uOpacity;
            if (a < 0.004) discard;
            gl_FragColor = vec4(mix(uColor, uCore, clamp(vStar * 0.7 + exp(-d * 40.0) * 0.5, 0.0, 1.0)), a);
          }`,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )

  const ivoryBlue = useMemo(() => new THREE.Color('#7FA6F0'), [])
  const lightBlue = useMemo(() => new THREE.Color('#DCEBFF'), [])

  useFrame((_, dt) => {
    const t = journey.t
    const u = material.uniforms
    const dark = darkness(t)
    const opening = Math.max(focus(t, CH.opening, 0.8), focus(t, CH.sahasrara) * 0.6)
    const hero = 1 - dark
    u.uTime.value += journey.reduced ? 0 : dt
    u.uPixel.value = dpr * 1.9
    ;(u.uColor.value as THREE.Color).copy(ivoryBlue).lerp(lightBlue, dark)
    u.uOpacity.value = (hero * 0.75 + dark * (0.3 + 0.7 * opening)) * (1 - smoothstep(CH.hands - 0.6, CH.hands - 0.15, t))
    u.uHeight.value = 0.85 + opening * 0.9
    u.uWidth.value = 0.05 + opening * 0.08
  })

  return <points geometry={geometry} material={material} position={[0, CROWN_Y, 0]} frustumCulled={false} renderOrder={8} />
}
