import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { BodyOfLight } from './BodyOfLight'
import { Breeze } from './Breeze'
import { CameraRig } from './CameraRig'
import { Centres } from './Centres'
import { Channels } from './Channels'
import { CrownLotus } from './CrownLotus'
import { Dust } from './Dust'

/**
 * One continuous world for the hero and the journey. The canvas is transparent: the
 * solid field and the monumental type live behind it in the page, so the lotus can
 * overlap the letters.
 */
export function World() {
  return (
    <Canvas
      className="world"
      dpr={[1, 1.75]}
      camera={{ fov: 30, near: 0.01, far: 40, position: [0, 1.77, 0.6] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1 }}
    >
      <CameraRig />
      <ambientLight intensity={0.16} />
      <directionalLight position={[-2.5, 5, 3]} intensity={2.6} color="#fff6ec" />
      <directionalLight position={[3, 1.5, 2]} intensity={0.5} color="#ffd9c2" />
      <directionalLight position={[0, -1.2, 3]} intensity={0.7} color="#ffe2c4" />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={2.4} position={[-2, 5, 4]} scale={[10, 2.5, 1]} />
          <Lightformer form="rect" intensity={6} position={[0, 4, 1.2]} rotation={[Math.PI / 2, 0, 0]} scale={[1.2, 1.2, 1]} />
          <Lightformer form="rect" intensity={1.2} position={[3, 2, 5]} scale={[2, 6, 1]} rotation={[0, -0.4, 0]} />
          <Lightformer form="circle" intensity={1.4} position={[-5, 0, 3]} scale={4} color="#ffe9d6" />
          <Lightformer form="ring" intensity={0.8} position={[0, -2, -5]} scale={10} color="#e3d8ff" />
        </Environment>
      </Suspense>
      <CrownLotus />
      <Breeze />
      <Dust />
      <BodyOfLight />
      <Channels />
      <Centres />
    </Canvas>
  )
}

