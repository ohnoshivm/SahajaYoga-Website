import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CENTRES, CROWN_Y, KUNDALINI_Y } from '../data'
import { journey, smoothstep } from '../scroll'

/**
 * Where the camera stands for each chapter (index = journey position + 1). Between two
 * stops it orbits around its subject instead of cutting through the body, and it holds
 * still in the middle of each chapter so the words can be read.
 */
type Stop = { target: [number, number, number]; from: [number, number, number] }
const y = (id: string) => CENTRES.find((c) => c.id === id)!.y

const close = (id: string, dx: number, lift = 0.12, dist = 1.15): Stop => ({
  target: [0, y(id), 0],
  from: [dx, y(id) + lift, dist],
})

const STOPS: Stop[] = [
  // Hero: the lotus from three-quarters above.
  { target: [0, CROWN_Y + 0.045, 0], from: [0, CROWN_Y + 0.3, 0.6] },
  // The whole figure.
  { target: [0, 0.78, 0.05], from: [0, 0.86, 3.75] },
  // Kundalini, close at the sacrum.
  { target: [0, KUNDALINI_Y, 0], from: [0.32, KUNDALINI_Y + 0.2, 1.15] },
  // Ida and Pingala from behind, so the person's left reads on the left, as on the chart.
  { target: [0, 0.8, 0], from: [0.7, 1.0, -2.9] },
  { target: [0, 0.8, 0], from: [-0.7, 1.0, -2.9] },
  { target: [0, 0.8, 0], from: [0, 0.95, -3.1] },
  close('mooladhara', 0.2, 0.1),
  close('swadisthan', -0.22),
  close('nabhi', 0.22),
  { target: [0, y('void'), 0], from: [0, y('void') + 0.62, 1.05] },
  close('anahat', -0.22),
  close('vishuddhi', 0.2, 0.1, 1.05),
  { target: [0, y('agnya'), 0.07], from: [0, y('agnya') + 0.06, 0.95] },
  { target: [0, CROWN_Y, 0], from: [0, CROWN_Y + 0.48, 0.8] },
  // The opening: wide, the whole column of light.
  { target: [0, 0.85, 0], from: [0, 1.0, 3.3] },
  // The hands: the figure steps aside for the map.
  { target: [0, 0.7, 0], from: [1.7, 0.95, 2.6] },
  { target: [0, 0.75, 0], from: [0, 0.82, 4.4] },
]

const v = (a: [number, number, number]) => new THREE.Vector3(...a)

export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const stops = useMemo(
    () => STOPS.map((s) => ({ target: v(s.target), offset: new THREE.Spherical().setFromVector3(v(s.from).sub(v(s.target))) })),
    [],
  )
  const pos = useRef(new THREE.Vector3(...STOPS[0].from))
  const look = useRef(new THREE.Vector3(...STOPS[0].target))
  const shift = useRef(0)
  const tmpT = useMemo(() => new THREE.Vector3(), [])
  const tmpS = useMemo(() => new THREE.Spherical(), [])
  const tmpP = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    const t = THREE.MathUtils.clamp(Number.isFinite(journey.t) ? journey.t : -1, -1, STOPS.length - 2)
    const i = Math.min(STOPS.length - 2, Math.floor(t + 1))
    const s = t + 1 - i
    // The hero eases continuously; chapters hold in their middle third.
    const e = i === 0 ? smoothstep(0, 1, s) : smoothstep(0.22, 0.78, s)
    const a = stops[i]
    const b = stops[i + 1]
    if (!a || !b) return
    tmpT.copy(a.target).lerp(b.target, e)
    let dTheta = b.offset.theta - a.offset.theta
    if (dTheta > Math.PI) dTheta -= Math.PI * 2
    if (dTheta < -Math.PI) dTheta += Math.PI * 2
    tmpS.set(
      THREE.MathUtils.lerp(a.offset.radius, b.offset.radius, e),
      THREE.MathUtils.lerp(a.offset.phi, b.offset.phi, e),
      a.offset.theta + dTheta * e,
    )
    // Narrow screens step back so the subject still fits across.
    const aspect = size.width / size.height
    tmpS.radius *= Math.max(1, 1.15 / aspect)
    tmpP.setFromSpherical(tmpS).add(tmpT)

    const k = journey.reduced ? 30 : 4.2
    pos.current.x = THREE.MathUtils.damp(pos.current.x, tmpP.x, k, dt)
    pos.current.y = THREE.MathUtils.damp(pos.current.y, tmpP.y, k, dt)
    pos.current.z = THREE.MathUtils.damp(pos.current.z, tmpP.z, k, dt)
    look.current.x = THREE.MathUtils.damp(look.current.x, tmpT.x, k, dt)
    look.current.y = THREE.MathUtils.damp(look.current.y, tmpT.y, k, dt)
    look.current.z = THREE.MathUtils.damp(look.current.z, tmpT.z, k, dt)
    camera.position.copy(pos.current)
    camera.lookAt(look.current)

    // In the chapters the subject moves aside for the text: right on wide screens, up on phones.
    // The first chapter stays centred, like a second title; from the Kundalini on, text sits beside.
    const into = smoothstep(0.3, 0.8, journey.t) * (1 - smoothstep(STOPS.length - 2.6, STOPS.length - 2, journey.t))
    shift.current = THREE.MathUtils.damp(shift.current, into, k, dt)
    const wide = aspect > 1.05
    const w = size.width
    const h = size.height
    if (shift.current > 0.001) camera.setViewOffset(w, h, wide ? -w * 0.17 * shift.current : 0, wide ? 0 : h * 0.14 * shift.current, w, h)
    else camera.clearViewOffset()
  })
  return null
}
