import { forwardRef, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Hud, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { Progress } from '../../lib/scroll';
import { easeInOutCubic, seg } from '../../lib/math';
import { createNorenMaterial } from './materials';
import { loadFont, makeGlyphTexture, rng } from './textures';
import type { SceneTier } from './types';

/** Shared canvas: tiered DPR, paused when inactive, signals once the first frame is on screen. */
export function StageCanvas({
  active,
  tier,
  onReady,
  camera,
  children,
  background,
}: {
  active: boolean;
  tier: SceneTier;
  onReady?: () => void;
  camera: { position: [number, number, number]; fov: number };
  background: string;
  children: ReactNode;
}) {
  return (
    <Canvas
      dpr={tier === 'high' ? [1, 1.75] : 1}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: tier === 'high', powerPreference: 'high-performance', alpha: false, stencil: false }}
      camera={{ ...camera, near: 0.1, far: 60 }}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0 }}
      // With an opaque canvas three clears render targets to alpha 1, which would turn ContactShadows' target solid.
      onCreated={({ gl }) => gl.setClearAlpha(0)}
    >
      <color attach="background" args={[background]} />
      {children}
      <FirstFrame onReady={onReady} />
    </Canvas>
  );
}

function FirstFrame({ onReady }: { onReady?: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => onReady?.());
  });
  return null;
}

/** Points the camera at a target and pulls back on narrow (portrait) viewports. */
export function useResponsiveCamera(
  from: THREE.Vector3Tuple,
  to: THREE.Vector3Tuple,
  target: THREE.Vector3Tuple,
  getT: () => number,
  portraitBoost = 1.55,
) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const a = useMemo(() => new THREE.Vector3(...from), [from]);
  const b = useMemo(() => new THREE.Vector3(...to), [to]);
  const look = useMemo(() => new THREE.Vector3(...target), [target]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, []);
  const smooth = useRef({ x: 0, y: 0 });
  useFrame((_, dt) => {
    const aspect = size.width / size.height;
    const boost = aspect < 1 ? THREE.MathUtils.lerp(portraitBoost, 1, THREE.MathUtils.clamp((aspect - 0.45) / 0.55, 0, 1)) : 1;
    const k = 1 - Math.exp(-dt * 3);
    smooth.current.x += (pointer.current.x - smooth.current.x) * k;
    smooth.current.y += (pointer.current.y - smooth.current.y) * k;
    tmp.lerpVectors(a, b, getT()).sub(look).multiplyScalar(boost).add(look);
    tmp.x += smooth.current.x * 0.35;
    tmp.y -= smooth.current.y * 0.2;
    camera.position.copy(tmp);
    camera.lookAt(look);
  });
}

/**
 * Noren curtain overlay. Lives in a pixel-space HUD so it always covers the viewport exactly.
 * Opens across progress `range`; hidden entirely once drawn back so it costs nothing afterwards.
 */
export function NorenHud({
  progress,
  range = [0, 0.14],
  color = '#D7392B',
  ink = '#FAF8F3',
  glyphs = ['豚骨', 'ラーメン'],
}: {
  progress: Progress;
  range?: [number, number];
  color?: string;
  ink?: string;
  glyphs?: [string, string];
}) {
  return (
    <Hud renderPriority={1}>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={1} />
      <NorenPanels progress={progress} range={range} color={color} ink={ink} glyphs={glyphs} />
    </Hud>
  );
}

export function NorenPanels({
  progress,
  range,
  color,
  ink,
  glyphs,
}: {
  progress: Progress;
  range: [number, number];
  color: string;
  ink: string;
  glyphs: [string, string];
}) {
  const size = useThree((s) => s.size);
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1, 40, 36), []);
  const left = useMemo(() => createNorenMaterial(-1, color, ink), [color, ink]);
  const right = useMemo(() => createNorenMaterial(1, color, ink), [color, ink]);
  const group = useRef<THREE.Group>(null);
  const glyphKey = glyphs.join('|');

  useEffect(() => {
    const texts = glyphKey.split('|');
    let cancelled = false;
    loadFont('700 196px "Noto Sans JP"', texts.join('')).then(() => {
      if (cancelled) return;
      [left, right].forEach((m, i) => {
        m.uniforms.uMap.value = makeGlyphTexture(texts[i] ?? '');
        m.uniforms.uHasMap.value = 1;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [left, right, glyphKey]);

  useFrame((_, dt) => {
    const o = easeInOutCubic(seg(progress.value, range[0], range[1]));
    for (const m of [left, right]) {
      m.uniforms.uOpen.value = o;
      m.uniforms.uTime.value += dt;
      m.uniforms.uSize.value.set(size.width, size.height);
      m.uniforms.uGlyphY.value = size.width / size.height < 0.8 ? 0.3 : 0.6;
    }
    if (group.current) group.current.visible = o < 0.999;
  });

  return (
    <group ref={group}>
      <mesh geometry={geo} material={left} frustumCulled={false} renderOrder={3} />
      <mesh geometry={geo} material={right} frustumCulled={false} renderOrder={3} />
    </group>
  );
}

/** Standalone noren canvas for chapter openers that have no 3D scene of their own. */
export function NorenCanvas({ progress, active, color, ink, glyphs, onReady }: { progress: Progress; active: boolean; color: string; ink: string; glyphs: [string, string]; onReady?: () => void }) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10], zoom: 1 }}
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, alpha: true, stencil: false }}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0 }}
    >
      <NorenPanels progress={progress} range={[0, 1]} color={color} ink={ink} glyphs={glyphs} />
      <FirstFrame onReady={onReady} />
    </Canvas>
  );
}

/**
 * Soft steam sprites rising from a disc. With `targets`, particles converge on those positions as
 * `getForm()` goes 0 -> 1 (the hero uses this to write the wordmark in steam).
 */
export function Steam({
  count,
  baseY,
  radius,
  height = 2.6,
  getVisible,
  getForm,
  targets,
}: {
  count: number;
  baseY: number;
  radius: number;
  height?: number;
  getVisible: () => number;
  getForm?: () => number;
  targets?: Float32Array | null;
}) {
  const dpr = useThree((s) => s.viewport.dpr);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const r = rng(41);
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < count * 4; i++) seed[i] = r();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
    g.setAttribute('aTarget', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, baseY + height / 2, 0), 6);
    return g;
  }, [count, baseY, height]);

  useEffect(() => {
    if (!targets) return;
    const attr = geo.getAttribute('aTarget') as THREE.BufferAttribute;
    (attr.array as Float32Array).set(targets.subarray(0, count * 3));
    attr.needsUpdate = true;
  }, [geo, targets, count]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uVisible: { value: 0 },
          uForm: { value: 0 },
          uSize: { value: 10 },
          uBase: { value: baseY },
          uRadius: { value: radius },
          uHeight: { value: height },
          uColor: { value: new THREE.Color('#fbf6ec') },
        },
        vertexShader: /* glsl */ `
          attribute vec4 aSeed; attribute vec3 aTarget;
          uniform float uTime, uVisible, uForm, uSize, uBase, uRadius, uHeight;
          varying float vAlpha;
          void main(){
            float life = fract(uTime * (0.05 + aSeed.x * 0.05) + aSeed.y);
            float ang = aSeed.z * 6.2831;
            float rad = sqrt(aSeed.w) * uRadius;
            vec3 rise = vec3(cos(ang) * rad, uBase + life * uHeight, sin(ang) * rad * 0.8);
            rise.x += sin(life * 5.0 + aSeed.y * 12.0) * 0.28 * life;
            rise.z += cos(life * 4.0 + aSeed.x * 9.0) * 0.2 * life;
            rise.x *= 1.0 + life * 0.5;
            float f = smoothstep(0.0, 1.0, clamp(uForm * 1.7 - aSeed.y * 0.7, 0.0, 1.0));
            vec3 pos = mix(rise, aTarget + vec3(sin(uTime * 1.3 + aSeed.x * 20.0), cos(uTime + aSeed.z * 17.0), 0.0) * 0.004, f);
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = mix(mix(24.0, 84.0, life), 5.2, f) * uSize / -mv.z;
            vAlpha = mix(sin(life * 3.14159) * 0.04, 0.85, f) * uVisible;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; varying float vAlpha;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(uColor, a * a * vAlpha);
            #include <colorspace_fragment>
          }`,
      }),
    [baseY, radius, height],
  );

  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt;
    mat.uniforms.uVisible.value = getVisible();
    mat.uniforms.uForm.value = targets && getForm ? getForm() : 0;
    mat.uniforms.uSize.value = 10 * dpr;
  });

  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

/** Lacquered chopsticks. The group origin is the pinch point at the tips; sticks run along +Y. */
export const Chopsticks = forwardRef<THREE.Group>(function Chopsticks(_, ref) {
  const { stick, band } = useMemo(() => {
    const stick = new THREE.CylinderGeometry(0.03, 0.011, 2.3, 14, 1);
    stick.translate(0, 1.15, 0);
    const band = new THREE.CylinderGeometry(0.0315, 0.029, 0.36, 14, 1);
    band.translate(0, 1.92, 0);
    return { stick, band };
  }, []);
  return (
    <group ref={ref}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.016, 0, 0]} rotation={[0, 0, s * -0.028]}>
          <mesh geometry={stick}>
            <meshPhysicalMaterial color="#2a1c14" roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.3} />
          </mesh>
          <mesh geometry={band}>
            <meshPhysicalMaterial color="#D7392B" roughness={0.3} clearcoat={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

/** Shifts content right on wide viewports so it clears the left-hand copy column. */
export function ClearOfCopy({ children, factor = 2.2, max = 1.9 }: { children: ReactNode; factor?: number; max?: number }) {
  const size = useThree((s) => s.size);
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const a = size.width / size.height;
    g.current!.position.x = a > 1.15 ? Math.min(max, (a - 1) * factor) : 0;
  });
  return <group ref={g}>{children}</group>;
}

const UP = new THREE.Vector3(0, 1, 0);
/** Quaternion that turns the chopsticks' +Y toward `dir`. */
export const aimQuat = (dir: THREE.Vector3Tuple) => new THREE.Quaternion().setFromUnitVectors(UP, new THREE.Vector3(...dir).normalize());
