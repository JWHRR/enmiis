"use client";

import * as THREE from "three";
import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  OrbitControls,
  Sparkles,
} from "@react-three/drei";
import Garment from "./Garment";
import type { DesignConfig } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Stage — shared cinematic environment for hero + configurator       */
/* ------------------------------------------------------------------ */

function Lights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <spotLight
        position={[3.5, 4.5, 3]}
        angle={0.45}
        penumbra={0.9}
        intensity={90}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        color="#fff4e0"
      />
      <spotLight
        position={[-4, 2.5, -2.5]}
        angle={0.6}
        penumbra={1}
        intensity={40}
        color="#b8c4ff"
      />
      <pointLight position={[0, 1.2, -2.2]} intensity={12} color="#e8d5a3" />
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[0, 3, 4]}
          scale={[6, 3, 1]}
          color="#fff6e6"
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[-5, 1.5, -1]}
          rotation-y={Math.PI / 2}
          scale={[4, 2, 1]}
          color="#cfd8ff"
        />
        <Lightformer
          form="circle"
          intensity={1.4}
          position={[4, 2, 1]}
          rotation-y={-Math.PI / 2.5}
          scale={2.4}
          color="#f2e2bd"
        />
      </Environment>
    </>
  );
}

/** hero-only: garment slowly rotates + follows the pointer */
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    /* gentle front-facing sway — the embroidery stays presented */
    const targetY = Math.sin(t * 0.26) * 0.38 + pointer.x * 0.4;
    const targetX = -pointer.y * 0.12;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 2.5, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 2.5, delta);
  });
  return <group ref={group}>{children}</group>;
}

export function HeroStage({ cfg }: { cfg: DesignConfig }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0.1, 1.05, 3.5], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      onCreated={({ camera }) => camera.lookAt(0.78, 0.82, 0)}
    >
      <Suspense fallback={null}>
        <Lights />
        <Sparkles
          count={90}
          scale={[3.4, 2.6, 2.4]}
          position={[0, 1.1, 0]}
          size={2.2}
          speed={0.35}
          opacity={0.5}
          color="#e8d5a3"
        />
        <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.3}>
          <group position={[0.78, 0, 0]}>
            <ParallaxRig>
              <group position={[0, -0.04, 0]}>
                <Garment cfg={cfg} />
              </group>
            </ParallaxRig>
          </group>
        </Float>
        <ContactShadows
          position={[0, -0.12, 0]}
          opacity={0.5}
          scale={5}
          blur={2.6}
          far={2.2}
          resolution={512}
          color="#000000"
        />
      </Suspense>
    </Canvas>
  );
}

/** compact product viewer for shop cards — drag to rotate, no zoom */
export function MiniStage({ cfg }: { cfg: DesignConfig }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0.35, 1.05, 3.0], fov: 33 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Lights />
        <Garment cfg={cfg} />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={4}
          blur={2.4}
          far={2.2}
          resolution={384}
          color="#000000"
        />
        <OrbitControls
          makeDefault
          target={[0, 0.85, 0]}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.9}
          enableDamping
          dampingFactor={0.08}
        />
      </Suspense>
    </Canvas>
  );
}

export function ConfiguratorStage({ cfg }: { cfg: DesignConfig }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0.5, 1.1, 3.15], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Lights />
        <group>
          <Garment cfg={cfg} />
        </group>
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.55}
          scale={5}
          blur={2.4}
          far={2.4}
          resolution={512}
          color="#000000"
        />
        <OrbitControls
          makeDefault
          target={[0, 0.82, 0]}
          minDistance={1}
          maxDistance={4.5}
          maxPolarAngle={Math.PI / 1.9}
          enableDamping
          dampingFactor={0.08}
        />
      </Suspense>
    </Canvas>
  );
}
