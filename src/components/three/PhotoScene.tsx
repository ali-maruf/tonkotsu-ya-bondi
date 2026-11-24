import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp01, easeInOutCubic, lerp, seg } from '../../lib/math';
import type { Progress } from '../../lib/scroll';
import { NorenPanels } from './parts';
import { loadFont, rng, sampleTextPoints } from './textures';
import type { SceneProps, SceneTier } from './types';

/**
 * Photoreal 2.5D stage: a photograph plus its depth map rendered as a WebGL surface. The camera path
 * (zoom + framing) is scrubbed by scroll, and the depth map drives true parallax from scroll and pointer,
 * so near objects slide over far ones. Steam particles and the steam wordmark are anchored in image space.
 * All image positions below use top-left origin, 0..1.
 */
export type Shot = { at: number; zoom: number; center: [number, number]; drift?: [number, number] };

export type PhotoSceneProps = {
  image: string;
  imageAspect: number;
  depth?: string;
  path: Shot[];
  /** depth value that stays still while the rest parallaxes */
  focus?: number;
  /** parallax strength (uv units per unit depth) for pointer movement */
  pointerParallax?: number;
  steam?: { rect: [number, number, number, number]; count: number; rise?: number; size?: number; strength?: number };
  shimmer?: [number, number, number, number];
  wordmark?: { text: string; center: [number, number]; width: number; range: [number, number] };
  noren?: { color: string; ink: string; glyphs: [string, string]; range: [number, number] };
  vignette?: number;
  background: string;
};

function frameAt(path: Shot[], p: number) {
  if (p <= path[0].at) return path[0];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    if (p <= b.at) {
      const t = easeInOutCubic((p - a.at) / (b.at - a.at));
      return {
        at: p,
        zoom: lerp(a.zoom, b.zoom, t),
        center: [lerp(a.center[0], b.center[0], t), lerp(a.center[1], b.center[1], t)] as [number, number],
        drift: [lerp(a.drift?.[0] ?? 0, b.drift?.[0] ?? 0, t), lerp(a.drift?.[1] ?? 0, b.drift?.[1] ?? 0, t)] as [number, number],
      };
    }
  }
  return path[path.length - 1];
}

/** Shared uniforms that map image space to the screen; the photo and the particles both read them. */
function useView() {
  return useMemo(
    () => ({
      uScale: { value: new THREE.Vector2(1, 1) },
      uZoom: { value: 1 },
      uPan: { value: new THREE.Vector2() },
      uPar: { value: new THREE.Vector2() },
      uFocus: { value: 0.5 },
      uTime: { value: 0 },
    }),
    [],
  );
}
type View = ReturnType<typeof useView>;

const VIEW_GLSL = /* glsl */ `
  uniform vec2 uScale, uPan, uPar; uniform float uZoom, uFocus, uTime;
  vec2 screenToImage(vec2 s) { return (s - 0.5) * uScale / uZoom + 0.5 + uPan; }
  vec2 imageToScreen(vec2 i) { return (i - 0.5 - uPan) * uZoom / uScale + 0.5; }
`;

function Photo({ props, view }: { props: PhotoSceneProps; view: View }) {
  const [maps, setMaps] = useState<{ map: THREE.Texture; depth: THREE.Texture | null } | null>(null);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const load = (url: string) => new Promise<THREE.Texture>((res, rej) => loader.load(url, res, undefined, rej));
    Promise.all([load(props.image), props.depth ? load(props.depth).catch(() => null) : Promise.resolve(null)]).then(([map, depth]) => {
      if (cancelled) return;
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = gl.capabilities.getMaxAnisotropy();
      map.minFilter = THREE.LinearMipmapLinearFilter;
      if (depth) depth.colorSpace = THREE.NoColorSpace;
      setMaps({ map, depth });
    });
    return () => {
      cancelled = true;
    };
  }, [props.image, props.depth, gl]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        uniforms: {
          ...view,
          uMap: { value: null },
          uDepth: { value: null },
          uHasDepth: { value: 0 },
          uShimmer: { value: new THREE.Vector4(props.shimmer?.[0] ?? 0, 1 - (props.shimmer?.[3] ?? 0), props.shimmer?.[2] ?? 0, 1 - (props.shimmer?.[1] ?? 0)) },
          uVignette: { value: props.vignette ?? 0.35 },
          uReveal: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: /* glsl */ `
          ${VIEW_GLSL}
          uniform sampler2D uMap, uDepth; uniform float uHasDepth, uVignette, uReveal; uniform vec4 uShimmer;
          varying vec2 vUv;
          float depthAt(vec2 uv) { return uHasDepth > 0.5 ? texture2D(uDepth, uv).r : uFocus; }
          void main() {
            vec2 uv = screenToImage(vUv);
            // two-step parallax: sample depth, offset, resample for a steadier occlusion edge
            float d = depthAt(uv);
            float d2 = depthAt(uv - uPar * (d - uFocus));
            uv -= uPar * (mix(d, d2, 0.6) - uFocus);
            // heat shimmer above the broth
            float inS = step(uShimmer.x, uv.x) * step(uv.x, uShimmer.z) * step(uShimmer.y, uv.y) * step(uv.y, uShimmer.w);
            float sm = inS * smoothstep(uShimmer.y, uShimmer.w, uv.y);
            uv.x += sin(uv.y * 90.0 + uTime * 3.5) * 0.0011 * sm;
            uv.y += cos(uv.x * 70.0 + uTime * 2.7) * 0.0007 * sm;
            vec3 col = texture2D(uMap, clamp(uv, 0.001, 0.999)).rgb;
            float v = smoothstep(1.05, 0.25, length((vUv - 0.5) * vec2(1.15, 1.0)));
            col *= mix(1.0, v, uVignette);
            // fine film grain keeps large dark areas from banding
            float g = fract(sin(dot(vUv * 1000.0 + uTime, vec2(12.9898, 78.233))) * 43758.5453);
            col += (g - 0.5) * 0.012;
            gl_FragColor = vec4(col * uReveal, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [view, props.shimmer, props.vignette],
  );

  useEffect(() => {
    if (!maps) return;
    mat.uniforms.uMap.value = maps.map;
    mat.uniforms.uDepth.value = maps.depth;
    mat.uniforms.uHasDepth.value = maps.depth ? 1 : 0;
  }, [maps, mat]);

  useFrame((_, dt) => {
    if (maps) mat.uniforms.uReveal.value = Math.min(1, mat.uniforms.uReveal.value + dt * 2.5);
  });

  return (
    <mesh material={mat} frustumCulled={false} renderOrder={0}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

/** Steam sprites emitted from an image-space rectangle; optionally converge on a wordmark. */
function ImageSteam({ props, view, tier, progress }: { props: PhotoSceneProps; view: View; tier: SceneTier; progress: Progress }) {
  const steam = props.steam!;
  const count = Math.round(steam.count * (tier === 'high' ? 1 : 0.45));
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const [targets, setTargets] = useState<Float32Array | null>(null);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const r = rng(17);
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < seed.length; i++) seed[i] = r();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
    g.setAttribute('aTarget', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
    return g;
  }, [count]);

  useEffect(() => {
    const wm = props.wordmark;
    if (!wm) return;
    let cancelled = false;
    loadFont('800 150px Archivo', wm.text).then(() => {
      if (cancelled) return;
      const pts = sampleTextPoints(wm.text, count);
      const out = new Float32Array(count * 2);
      for (let i = 0; i < count; i++) {
        out[i * 2] = wm.center[0] + pts[i * 3] * wm.width;
        // text units are image widths; convert vertical to image-height units (top-left origin -> uv)
        out[i * 2 + 1] = 1 - (wm.center[1] - pts[i * 3 + 1] * wm.width * props.imageAspect);
      }
      setTargets(out);
    });
    return () => {
      cancelled = true;
    };
  }, [props.wordmark, props.imageAspect, count]);

  useEffect(() => {
    if (!targets) return;
    const a = geo.getAttribute('aTarget') as THREE.BufferAttribute;
    (a.array as Float32Array).set(targets);
    a.needsUpdate = true;
  }, [geo, targets]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          ...view,
          uRect: { value: new THREE.Vector4(steam.rect[0], 1 - steam.rect[3], steam.rect[2], 1 - steam.rect[1]) },
          uRise: { value: steam.rise ?? 0.45 },
          uSizePx: { value: 1 },
          uStrength: { value: steam.strength ?? 1 },
          uForm: { value: 0 },
          uAspect: { value: 1 },
        },
        vertexShader: /* glsl */ `
          ${VIEW_GLSL}
          attribute vec4 aSeed; attribute vec2 aTarget;
          uniform vec4 uRect; uniform float uRise, uSizePx, uStrength, uForm, uAspect;
          varying float vAlpha; varying float vFormed;
          void main() {
            float life = fract(uTime * (0.045 + aSeed.x * 0.05) + aSeed.y);
            vec2 origin = vec2(mix(uRect.x, uRect.z, aSeed.z), mix(uRect.y, uRect.w, aSeed.w));
            vec2 s = imageToScreen(origin);
            s.y += life * uRise;
            s.x += sin(life * 5.0 + aSeed.y * 20.0) * 0.035 * life + (aSeed.z - 0.5) * 0.06 * life;
            float f = smoothstep(0.0, 1.0, clamp(uForm * 1.7 - aSeed.y * 0.7, 0.0, 1.0));
            vec2 t = imageToScreen(aTarget) + vec2(sin(uTime * 1.3 + aSeed.x * 20.0), cos(uTime + aSeed.z * 17.0)) * 0.0012;
            s = mix(s, t, f);
            gl_Position = vec4(s * 2.0 - 1.0, 0.0, 1.0);
            gl_PointSize = mix(mix(40.0, 150.0, life), 3.2, f) * uSizePx;
            vAlpha = mix(sin(life * 3.14159) * 0.05 * uStrength, 0.85, f);
            vFormed = f;
          }`,
        fragmentShader: /* glsl */ `
          varying float vAlpha; varying float vFormed;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, mix(0.0, 0.32, vFormed), d);
            gl_FragColor = vec4(vec3(0.98, 0.96, 0.92), a * a * vAlpha);
            #include <colorspace_fragment>
          }`,
      }),
    [view, steam.rect, steam.rise, steam.strength],
  );

  useFrame(() => {
    mat.uniforms.uSizePx.value = dpr * (steam.size ?? 1) * Math.min(1.4, Math.max(0.6, size.height / 900));
    const wm = props.wordmark;
    mat.uniforms.uForm.value = wm && targets ? easeInOutCubic(seg(progress.value, wm.range[0], wm.range[1])) : 0;
  });

  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={1} />;
}

function Director({ props, view, progress }: { props: PhotoSceneProps; view: View; progress: Progress }) {
  const size = useThree((s) => s.size);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, []);

  useFrame((_, dt) => {
    view.uTime.value += dt;
    view.uFocus.value = props.focus ?? 0.5;
    const A = size.width / size.height;
    const I = props.imageAspect;
    view.uScale.value.set(A > I ? 1 : A / I, A > I ? I / A : 1);

    const f = frameAt(props.path, clamp01(progress.value));
    view.uZoom.value = f.zoom;
    // keep the frame inside the photo, leaving a little room for parallax
    const hx = view.uScale.value.x / f.zoom / 2, hy = view.uScale.value.y / f.zoom / 2;
    const m = 0.012;
    const cx = Math.min(1 - hx - m, Math.max(hx + m, f.center[0]));
    const cy = Math.min(1 - hy - m, Math.max(hy + m, 1 - f.center[1]));
    view.uPan.value.set(cx - 0.5, cy - 0.5);

    const p = pointer.current;
    const k = 1 - Math.exp(-dt * 3);
    p.sx += (p.x - p.sx) * k;
    p.sy += (p.y - p.sy) * k;
    const pp = props.pointerParallax ?? 0.02;
    view.uPar.value.set((f.drift?.[0] ?? 0) + p.sx * pp, (f.drift?.[1] ?? 0) - p.sy * pp);
  });
  return null;
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

function Content({ props, progress, tier, onReady }: { props: PhotoSceneProps; progress: Progress; tier: SceneTier; onReady?: () => void }) {
  const view = useView();
  return (
    <>
      <Director props={props} view={view} progress={progress} />
      <Photo props={props} view={view} />
      {props.steam && <ImageSteam props={props} view={view} tier={tier} progress={progress} />}
      {props.noren && (
        <NorenPanels progress={progress} range={props.noren.range} color={props.noren.color} ink={props.noren.ink} glyphs={props.noren.glyphs} />
      )}
      <FirstFrame onReady={onReady} />
    </>
  );
}

export default function PhotoScene({ progress, active, tier, onReady, ...props }: SceneProps & PhotoSceneProps) {
  return (
    <Canvas
      orthographic
      flat
      camera={{ position: [0, 0, 10], zoom: 1 }}
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, alpha: false, stencil: false, depth: false, powerPreference: 'high-performance' }}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={[props.background]} />
      <Content props={props} progress={progress} tier={tier} onReady={onReady} />
    </Canvas>
  );
}
