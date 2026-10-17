import { Suspense, useEffect, type MutableRefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import type { Chakra } from './chakras'
import { ChakraForm } from './ChakraForm'

const FORM_SIZE = 4.5 // world units across the petals

/** Keeps the form at ~60% of the height on wide screens and ~90% of the width on phones. */
function CameraRig({ scale }: { scale: number }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / size.height
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
    const byHeight = FORM_SIZE / (0.6 * scale) / (2 * tan)
    const byWidth = FORM_SIZE / (0.9 * scale * aspect) / (2 * tan)
    cam.position.set(0, 0, Math.max(byHeight, byWidth))
    cam.updateProjectionMatrix()
  }, [camera, size, scale])
  return null
}

type Props = {
  chakra: Chakra
  pulse: MutableRefObject<number>
  bloom: MutableRefObject<number>
  pointer: MutableRefObject<[number, number]>
  still: boolean
  /** 1 = the mantra screen's size; smaller for quieter screens. */
  scale?: number
}

/** The lit 3D chakra, shared by the mantra screen and the Sadhana steps. */
export function ChakraStage({ chakra, pulse, bloom, pointer, still, scale = 1 }: Props) {
  const { light } = chakra.theme
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 20], fov: 26 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    >
      <CameraRig scale={scale} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-3, 4, 6]} intensity={2.1} color={light.key} />
      <directionalLight position={[4, -1, 3]} intensity={0.6} color={light.fill} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={2.6} position={[-2, 5, 5]} scale={[10, 2.5, 1]} />
          <Lightformer form="rect" intensity={1.4} position={[3, 2, 6]} scale={[2, 6, 1]} rotation={[0, -0.4, 0]} />
          <Lightformer form="circle" intensity={1.6} position={[-6, 0, 4]} scale={4} color={light.key} />
          <Lightformer form="rect" intensity={1.1} position={[6, -3, 4]} scale={[3, 8, 1]} color={light.rim} />
          <Lightformer form="ring" intensity={0.8} position={[0, 0, -6]} scale={10} color={light.fill} />
        </Environment>
      </Suspense>
      <ChakraForm slug={chakra.slug} pulse={pulse} bloom={bloom} pointer={pointer} still={still} />
    </Canvas>
  )
}
