import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, Center, ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { BOWL_MODEL } from '../../lib/media';
import { tokens } from '../../lib/tokens';
import type { SceneProps } from './types';

/** Textured PBR ramen bowl (Higgsfield image-to-3D). Drag to turn it; it idles with a slow spin. */
function Bowl({ onLoaded }: { onLoaded?: () => void }) {
  const { scene } = useGLTF(BOWL_MODEL);
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && 'envMapIntensity' in m) m.envMapIntensity = 1.1;
    });
    onLoaded?.();
  }, [scene, onLoaded]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.18;
  });
  return (
    <group ref={ref}>
      <Center top>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export default function BowlModel({ active, tier, onReady }: SceneProps) {
  return (
    <Canvas
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 2.7, 2.7], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      aria-label="Interactive 3D ramen bowl. Drag to rotate."
      role="img"
      style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[-2.5, 4, 2]} intensity={2.2} color="#fff1dc" />
      <directionalLight position={[3, 1.5, -2]} intensity={1} color={tokens.vermilion400} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 1]} rotation-x={Math.PI / 2} scale={[5, 3, 1]} />
        <Lightformer form="rect" intensity={1} position={[-4, 1, 1]} rotation-y={Math.PI / 2} scale={[2, 3, 1]} color="#ffe2c4" />
      </Environment>
      <Suspense fallback={null}>
        {/* Bounds frames the model whatever its native scale, so a replacement GLB needs no tuning */}
        <Bounds fit clip margin={1.25}>
          <Bowl onLoaded={onReady} />
        </Bounds>
      </Suspense>
      <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={4} blur={2.6} far={1.5} resolution={256} color="#000000" />
      <OrbitControls makeDefault enablePan={false} enableZoom={false} minPolarAngle={0.35} maxPolarAngle={1.2} rotateSpeed={0.7} enableDamping />
    </Canvas>
  );
}
