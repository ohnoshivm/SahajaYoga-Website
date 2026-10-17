import * as THREE from 'three'
import { CENTRES, CHAPTERS, type CentreId } from '../data'
import { smoothstep } from '../scroll'

/** Chapter index of each place in the journey. */
export const CH = Object.fromEntries(CHAPTERS.map((c, i) => [c.id, i])) as Record<string, number>
export const CENTRE_CH = Object.fromEntries(CENTRES.map((c) => [c.id, CH[c.id]])) as Record<CentreId, number>

/** 1 while the page sits on chapter i, easing to 0 half a chapter away. */
export function focus(t: number, i: number, width = 0.55) {
  return 1 - smoothstep(0.12, width, Math.abs(t - i))
}

/** How dark the field is: 0 in the hero, 1 through the journey, easing back for the last chapter. */
export function darkness(t: number) {
  return smoothstep(-0.5, -0.1, t) * (1 - smoothstep(CH.hands + 0.45, CH.begin - 0.1, t))
}

/** The subtle system steps back while the hands are shown, so the map reads cleanly. */
export function presence(t: number) {
  return darkness(t) * (1 - 0.82 * focus(t, CH.hands))
}

/** A soft round light, for halos and the rising Kundalini. */
export const glowMaterial = (color: string) =>
  new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        vec2 scale = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
        mv.xy += position.xy * scale;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = exp(-d * d * 4.5) * uOpacity;
        gl_FragColor = vec4(uColor, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })

/** The petal shared by every lotus: base at y = 0, tip at y = 1, width 1, gently cupped. */
export function petalGeometry(thick = true, detail = 24) {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  // A lotus petal: broad in the middle, drawing to a soft point.
  s.bezierCurveTo(0.56, 0.12, 0.62, 0.66, 0, 1)
  s.bezierCurveTo(-0.62, 0.66, -0.56, 0.12, 0, 0)
  const g = thick
    ? new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 2, curveSegments: detail })
    : new THREE.ShapeGeometry(s, detail)
  const p = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    p.setZ(i, p.getZ(i) + 0.22 * x * x - 0.06 * y * y)
  }
  g.computeVertexNormals()
  return g
}
