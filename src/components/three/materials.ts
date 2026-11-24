import * as THREE from 'three';
import { noiseGLSL } from './glsl';
import { makeBakedBrothTexture } from './textures';

/**
 * Liquid tonkotsu broth: swirling emulsion, floating fat droplets, wet specular and fresnel.
 * uMilk 0 = clear early stock, 1 = fully emulsified milky tonkotsu.
 */
export function createBrothMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSwirl: { value: 0.3 },
      uMilk: { value: 1 },
      uEdge: { value: 1 },
      uScale: { value: 1 },
      uLightDir: { value: new THREE.Vector3(-0.5, 1, 0.4).normalize() },
      uClear: { value: new THREE.Color('#b9772f') },
      uDeep: { value: new THREE.Color('#e3c9a0') },
      uCream: { value: new THREE.Color('#f7ecd6') },
      uFat: { value: new THREE.Color('#ffd98a') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vWorld;
      void main(){
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uSwirl, uMilk, uEdge, uScale;
      uniform vec3 uLightDir, uClear, uDeep, uCream, uFat;
      varying vec2 vUv; varying vec3 vWorld;
      ${noiseGLSL}
      void main(){
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        float a = atan(p.y, p.x) + uSwirl * (1.25 - r) * 2.6 + uTime * 0.035;
        vec2 q = vec2(cos(a), sin(a)) * r * uScale;
        float t = uTime * 0.025;
        float n = fbm(q * 2.4 + vec2(t, -t));
        float n2 = fbm(q * 8.0 + 4.7 - t);
        vec3 milky = mix(uDeep, uCream, smoothstep(0.28, 0.72, n));
        vec3 col = mix(uClear * mix(0.7, 1.05, n), milky, uMilk);
        float fat = smoothstep(0.64, 0.69, n2);
        col = mix(col, uFat, fat * 0.28);

        float e = 0.02;
        float h0 = fbm(q * 4.5 + t);
        float hx = fbm((q + vec2(e, 0.0)) * 4.5 + t);
        float hy = fbm((q + vec2(0.0, e)) * 4.5 + t);
        vec3 N = normalize(vec3(-(hx - h0) * 1.6, 1.0, -(hy - h0) * 1.6));
        vec3 V = normalize(cameraPosition - vWorld);
        vec3 L = normalize(uLightDir);
        vec3 H = normalize(L + V);
        float spec = pow(max(dot(N, H), 0.0), 140.0) * (0.55 + fat * 2.2);
        float fres = pow(1.0 - max(dot(N, V), 0.0), 5.0);
        col = col * (0.78 + 0.22 * max(dot(N, L), 0.0)) + spec * vec3(1.0, 0.96, 0.88) + fres * 0.18;
        col *= mix(1.0, 0.74, smoothstep(0.8, 1.0, r) * uEdge);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

/** Baked fallback for low-power devices: same look, one texture, no per-pixel noise. */
export function createBakedBrothMaterial() {
  return new THREE.MeshStandardMaterial({ map: makeBakedBrothTexture(), roughness: 0.2, metalness: 0 });
}

/** Translucent-to-milky broth volume seen through the cutaway stockpot. */
export function createBrothVolumeMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uMilk: { value: 0 },
      uClear: { value: new THREE.Color('#c98a3e') },
      uMilky: { value: new THREE.Color('#f3e6cc') },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uMilk; uniform vec3 uClear, uMilky;
      varying vec3 vPos;
      ${noiseGLSL}
      void main(){
        float n = fbm(vec2(vPos.x + vPos.z, vPos.y * 1.6 - uTime * 0.18) * 1.3);
        float depth = smoothstep(2.0, 0.0, vPos.y);
        vec3 clear = uClear * mix(1.0, 0.55, depth);
        vec3 col = mix(clear, uMilky * mix(0.9, 1.04, n), uMilk);
        col *= 0.86 + 0.24 * n;
        float alpha = mix(0.42, 0.97, smoothstep(0.0, 0.8, uMilk));
        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

/** Wet noodle strands that hang from chopsticks: splay, waviness and spring lag in the vertex shader. */
export function createNoodleMaterial(length: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLag: { value: new THREE.Vector2() },
      uLen: { value: length },
      uLightView: { value: new THREE.Vector3(0, 1, 1).normalize() },
      uColor: { value: new THREE.Color('#efd596') },
    },
    vertexShader: /* glsl */ `
      attribute vec2 aOffset; attribute float aSeed;
      uniform float uTime, uLen; uniform vec2 uLag;
      varying vec3 vN; varying vec3 vView; varying float vH;
      void main(){
        vec3 p = position;
        float h = clamp(-p.y / uLen, 0.0, 1.0);
        p.xz += aOffset * (0.3 + 0.9 * h);
        p.x += (sin(h * 17.0 + aSeed * 37.0 + uTime * 0.8) * 0.018 + sin(h * 5.0 + aSeed * 23.0) * 0.05) * smoothstep(0.0, 0.25, h);
        p.z += cos(h * 9.0 + aSeed * 29.0) * 0.035 * smoothstep(0.0, 0.25, h);
        p.xz += uLag * h * h;
        vH = h;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vView = -mv.xyz;
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uLightView;
      varying vec3 vN; varying vec3 vView; varying float vH;
      void main(){
        vec3 N = normalize(vN), V = normalize(vView), L = normalize(uLightView);
        float diff = 0.4 + 0.6 * max(dot(N, L), 0.0);
        float spec = pow(max(dot(N, normalize(L + V)), 0.0), 70.0) * 0.85;
        float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.22;
        vec3 col = uColor * diff * mix(1.0, 0.88, vH) + spec + rim;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

/**
 * Noren curtain cloth, rendered in a pixel-space orthographic HUD. The vertex shader rebuilds each panel
 * from its UVs: it hangs from the rod, gathers toward the outer edge, slides away, and its hem lifts and
 * sways like fabric being parted. uOpen 0 = closed, 1 = fully drawn back.
 */
export function createNorenMaterial(side: -1 | 1, color: string, ink: string) {
  return new THREE.ShaderMaterial({
    // drawn in the transparent pass so it always lands on top of photo steam
    transparent: true,
    depthTest: false,
    uniforms: {
      uSide: { value: side },
      uOpen: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: new THREE.Vector2(1, 1) },
      uColor: { value: new THREE.Color(color) },
      uInk: { value: new THREE.Color(ink) },
      uMap: { value: null as THREE.Texture | null },
      uHasMap: { value: 0 },
      uTexAspect: { value: 0.25 },
      uGlyphY: { value: 0.6 },
    },
    vertexShader: /* glsl */ `
      uniform float uSide, uOpen, uTime; uniform vec2 uSize;
      varying vec2 vUv; varying float vShade;
      void main(){
        vUv = uv;
        float hang = 1.0 - uv.y;
        float inner = uSide < 0.0 ? uv.x : 1.0 - uv.x;
        float W = uSize.x * 0.5, H = uSize.y * 1.02;
        float o = uOpen;
        float gather = 1.0 - 0.74 * o * (0.75 + 0.25 * (1.0 - hang));
        float fromOuter = inner * (W - 3.0) * gather;
        float slide = o * W * (0.46 + 0.12 * hang * inner);
        float x = uSide * (W - fromOuter) + uSide * slide;
        float y = uSize.y * 0.5 - hang * H;
        float push = o * (1.0 - o) * 4.0;
        x += uSide * push * hang * hang * inner * W * 0.22;
        y += push * hang * hang * inner * H * 0.16;
        float sway = sin(uTime * 1.1 + hang * 2.6 + uSide * 1.7) * 7.0 * hang * (0.35 + o);
        x += sway;
        float folds = sin(uv.x * 3.14159 * (6.0 + 8.0 * o)) * o;
        vShade = 0.5 + 0.5 * folds + sin(uTime * 1.1 + hang * 2.6) * 0.04 * hang;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uInk; uniform sampler2D uMap; uniform float uHasMap, uTexAspect, uGlyphY; uniform vec2 uSize;
      varying vec2 vUv; varying float vShade;
      void main(){
        float weave = 0.95 + 0.05 * sin(vUv.x * 900.0) * sin(vUv.y * 1300.0);
        vec3 col = uColor * (0.8 + 0.3 * vShade) * weave;
        float sleeve = smoothstep(0.952, 0.956, vUv.y);
        col = mix(col, uColor * 0.6, sleeve);
        col = mix(col, uColor * 1.15, smoothstep(0.944, 0.946, vUv.y) * (1.0 - smoothstep(0.948, 0.95, vUv.y)));
        float panelAspect = (uSize.x * 0.5) / (uSize.y * 1.02);
        float s = 0.5;
        vec2 g = vec2((vUv.x - 0.5) / (s * uTexAspect / panelAspect) + 0.5, (vUv.y - uGlyphY) / s + 0.5);
        float inside = step(0.0, g.x) * step(g.x, 1.0) * step(0.0, g.y) * step(g.y, 1.0);
        float ink = texture2D(uMap, clamp(g, 0.0, 1.0)).a * inside * uHasMap;
        col = mix(col, uInk * (0.9 + 0.1 * vShade), ink);
        col *= mix(1.0, 0.78, smoothstep(0.035, 0.0, vUv.y));
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}
