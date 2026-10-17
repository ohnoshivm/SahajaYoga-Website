import { useEffect, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CENTRES } from '../data'
import { sampleFigure, type FigurePoints } from '../figure'
import { journey, smoothstep } from '../scroll'
import { CENTRE_CH, CH, darkness, focus } from './shared'

const vertexShader = /* glsl */ `
  uniform float uTime, uGather, uSize, uPixel, uFocusY, uFocus, uDim, uMotion;
  uniform vec3 uFocusColor;
  attribute vec3 aScatter;
  attribute float aSeed;
  attribute float aShell;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    // Each point gathers in its own time, so the body condenses rather than snaps.
    float g = clamp((uGather - aSeed * 0.45) / 0.55, 0.0, 1.0);
    g = g * g * (3.0 - 2.0 * g);
    vec3 p = mix(aScatter, position, g);
    float sw = (1.0 - g) * 1.8;
    float c = cos(sw), s = sin(sw);
    p.xz = mat2(c, -s, s, c) * p.xz;
    p += uMotion * 0.0022 * vec3(sin(uTime * 1.3 + aSeed * 40.0), cos(uTime * 1.1 + aSeed * 31.0), sin(uTime * 0.9 + aSeed * 17.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = mix(1.0, 0.62 + 0.38 * sin(uTime * 1.6 + aSeed * 60.0), uMotion);
    // A few points are glints: larger, brighter, with a slow sparkle.
    float glint = step(0.985, fract(aSeed * 13.7));
    float sparkle = glint * mix(1.0, 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 2.3 + aSeed * 90.0), 3.0), uMotion);
    float near = uFocus * 0.55 * exp(-pow((position.y - uFocusY) / 0.06, 2.0));
    // Warm gold and white light, like the reference: no two points quite the same.
    vec3 base = mix(vec3(1.0, 0.82, 0.55), vec3(1.0, 0.96, 0.88), fract(aSeed * 7.31));
    vColor = mix(base, uFocusColor, clamp(near, 0.0, 1.0));
    vAlpha = ((aShell > 0.5 ? 0.5 : 0.18) * twinkle + sparkle * 0.9) * (0.1 + 0.9 * g) * uDim * (1.0 + near * 1.1);
    // Points right in front of the lens thin out and never balloon, so close-ups stay clear.
    float z = -mv.z;
    vAlpha *= smoothstep(0.22, 0.75, z);
    gl_PointSize = min(uSize * uPixel * (aShell > 0.5 ? 1.0 : 1.5) * (1.0 + near * 0.5 + sparkle * 2.4) / z, 7.0 * uPixel);
  }`

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float a = exp(-dot(c, c) * 14.0) * vAlpha;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColor, a);
  }`

const isPhone = () => matchMedia('(max-width: 760px)').matches

/** The seated figure, as tens of thousands of points of light. */
export function BodyOfLight() {
  const [data, setData] = useState<FigurePoints | null>(null)
  const dpr = useThree((s) => s.viewport.dpr)

  useEffect(() => {
    // `?sync` samples on the main thread, so review renders never race the worker.
    if (new URLSearchParams(location.search).has('sync')) return setData(sampleFigure(isPhone() ? 30_000 : 76_000))
    const worker = new Worker(new URL('../figure.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<FigurePoints>) => setData(e.data)
    worker.postMessage({ count: isPhone() ? 30_000 : 76_000 })
    return () => worker.terminate()
  }, [])

  const geometry = useMemo(() => {
    if (!data) return null
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.position, 3))
    g.setAttribute('aScatter', new THREE.BufferAttribute(data.scatter, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(data.seed, 1))
    g.setAttribute('aShell', new THREE.BufferAttribute(data.shell, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.8, 0), 4)
    return g
  }, [data])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uGather: { value: 0 },
          uSize: { value: 7 },
          uPixel: { value: 1 },
          uFocusY: { value: 0 },
          uFocus: { value: 0 },
          uFocusColor: { value: new THREE.Color('#ffffff') },
          uDim: { value: 0 },
          uMotion: { value: 1 },
        },
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
    u.uMotion.value = journey.reduced ? 0 : 1
    u.uTime.value += dt
    u.uPixel.value = dpr
    // Gathers as the hero gives way, scrubbed by the scroll.
    u.uGather.value = journey.reduced ? 1 : smoothstep(-0.85, -0.02, t)
    // Steps back for the hands, and leaves for the last chapter.
    // Steps back a little while a centre is visited, so its lotus leads.
    const visiting = Math.max(...CENTRES.map((c) => focus(t, CENTRE_CH[c.id])))
    u.uDim.value = darkness(t) * (1 - 0.7 * focus(t, CH.hands)) * (1 - 0.35 * visiting)
    // Light gathers around the centre being visited.
    let best = 0
    let pick = CENTRES[0]
    for (const c of CENTRES) {
      const f = focus(t, CENTRE_CH[c.id])
      if (f > best) {
        best = f
        pick = c
      }
    }
    u.uFocus.value = best
    u.uFocusY.value = pick.y
    ;(u.uFocusColor.value as THREE.Color).set(pick.glow)
  })

  if (!geometry) return null
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />
}
