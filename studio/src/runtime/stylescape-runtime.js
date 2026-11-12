/*
 * Style Scape runtime v2
 * Framework-neutral procedural renderer: seeded flow-field ribbons over an
 * interference field. WebGL first, Canvas2D fallback. No dependencies.
 *
 *   const inst = createStyleScape(canvas, scene, { maxDpr: 2, animate: true });
 *   inst.update(nextScene); inst.dispose();
 */

export const RUNTIME_VERSION = "2.0.0";
export const SCENE_VERSION = 2;

export const LIMITS = {
  count: [8, 900],
  steps: [12, 320],
  maxVertices: 520000,
  maxCanvasEdge: 4096,
  maxDpr: 2,
};

export const PARAM_SPEC = {
  count: { min: 8, max: 900, step: 1, def: 320 },
  steps: { min: 12, max: 320, step: 1, def: 140 },
  stepLength: { min: 0.002, max: 0.03, step: 0.0005, def: 0.009 },
  noiseScale: { min: 0.2, max: 6, step: 0.01, def: 1.6 },
  octaves: { min: 1, max: 5, step: 1, def: 3 },
  curl: { min: 0.2, max: 4, step: 0.01, def: 1.4 },
  warp: { min: 0, max: 2, step: 0.01, def: 0.5 },
  flowAngle: { min: -3.1416, max: 3.1416, step: 0.01, def: 0 },
  width: { min: 0.0005, max: 0.03, step: 0.0001, def: 0.006 },
  taper: { min: 0, max: 1, step: 0.01, def: 0.7 },
  opacity: { min: 0.05, max: 1, step: 0.01, def: 0.7 },
  colorSpread: { min: 0, max: 1, step: 0.01, def: 0.6 },
  interference: { min: 0, max: 1, step: 0.01, def: 0.25 },
  rings: { min: 4, max: 160, step: 1, def: 48 },
  sources: { min: 1, max: 6, step: 1, def: 3 },
  grain: { min: 0, max: 0.25, step: 0.005, def: 0.06 },
  drift: { min: 0, max: 1, step: 0.01, def: 0.35 },
  vignette: { min: 0, max: 1, step: 0.01, def: 0.35 },
};

export const BLEND_MODES = ["normal", "additive", "multiply"];

const HEX = /^#[0-9a-fA-F]{6}$/;

/* ---------------- scene validation ---------------- */

export function defaultScene() {
  const params = {};
  for (const k in PARAM_SPEC) params[k] = PARAM_SPEC[k].def;
  return {
    version: SCENE_VERSION,
    name: "Untitled field",
    seed: 1847,
    blend: "normal",
    params,
    palette: {
      background: "#0e1220",
      colors: ["#ff5a36", "#ffb547", "#f4ecd8", "#4d7cff", "#1d2a6b"],
    },
  };
}

function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}

/** Validate untrusted input. Returns { ok, scene, errors }. */
export function validateScene(input) {
  const errors = [];
  const base = defaultScene();
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, scene: base, errors: ["Scene must be a JSON object."] };
  }
  const out = base;
  if (input.version !== undefined && input.version !== SCENE_VERSION)
    errors.push("Unsupported version " + String(input.version) + " (expected " + SCENE_VERSION + ").");
  if (typeof input.name === "string") out.name = input.name.slice(0, 80);
  if (input.seed !== undefined) {
    if (typeof input.seed === "number" && Number.isFinite(input.seed))
      out.seed = Math.floor(Math.abs(input.seed)) % 2147483647;
    else errors.push("seed must be a finite number.");
  }
  if (input.blend !== undefined) {
    if (BLEND_MODES.indexOf(input.blend) >= 0) out.blend = input.blend;
    else errors.push("blend must be one of " + BLEND_MODES.join(", ") + ".");
  }
  if (input.params !== undefined) {
    if (!input.params || typeof input.params !== "object") errors.push("params must be an object.");
    else
      for (const k in input.params) {
        const spec = PARAM_SPEC[k];
        const v = input.params[k];
        if (!spec) {
          errors.push("Unknown param '" + k + "'.");
          continue;
        }
        if (typeof v !== "number" || !Number.isFinite(v)) {
          errors.push("param '" + k + "' must be a number.");
          continue;
        }
        if (v < spec.min || v > spec.max) errors.push("param '" + k + "' out of range; clamped.");
        out.params[k] = clamp(v, spec.min, spec.max);
      }
  }
  if (input.palette !== undefined) {
    const p = input.palette;
    if (!p || typeof p !== "object") errors.push("palette must be an object.");
    else {
      if (typeof p.background === "string" && HEX.test(p.background)) out.palette.background = p.background.toLowerCase();
      else if (p.background !== undefined) errors.push("palette.background must be #rrggbb.");
      if (Array.isArray(p.colors)) {
        const cs = p.colors.filter((c) => typeof c === "string" && HEX.test(c)).slice(0, 5);
        if (cs.length < 2) errors.push("palette.colors needs at least 2 #rrggbb colors.");
        else {
          while (cs.length < 5) cs.push(cs[cs.length - 1]);
          out.palette.colors = cs.map((c) => c.toLowerCase());
        }
      } else if (p.colors !== undefined) errors.push("palette.colors must be an array.");
    }
  }
  const fatal = errors.some((e) => !/clamped/.test(e));
  return { ok: !fatal, scene: out, errors };
}

/* ---------------- math ---------------- */

export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(rand) {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = p[i];
    p[i] = p[j];
    p[j] = t;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const gx = new Float32Array(256), gy = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const a = rand() * Math.PI * 2;
    gx[i] = Math.cos(a);
    gy[i] = Math.sin(a);
  }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  return function (x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const g = (ix, iy, dx, dy) => {
      const h = perm[ix + perm[iy]];
      return gx[h] * dx + gy[h] * dy;
    };
    const n00 = g(X, Y, xf, yf);
    const n10 = g(X + 1, Y, xf - 1, yf);
    const n01 = g(X, Y + 1, xf, yf - 1);
    const n11 = g(X + 1, Y + 1, xf - 1, yf - 1);
    const u = fade(xf), v = fade(yf);
    return (n00 + u * (n10 - n00)) + v * ((n01 + u * (n11 - n01)) - (n00 + u * (n10 - n00)));
  };
}

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Build ribbon geometry. Field space: x in [-aspect, aspect], y in [-1, 1].
 * Vertex layout (6 floats): x, y, side(-1|1), t(0..1), hue(0..1), rnd.
 */
export function buildGeometry(scene, aspect) {
  const P = scene.params;
  const rand = mulberry32(scene.seed + 1);
  const noise = makeNoise(rand);
  const noise2 = makeNoise(mulberry32(scene.seed * 7 + 13));
  const count = Math.round(clamp(P.count, LIMITS.count[0], LIMITS.count[1]));
  let steps = Math.round(clamp(P.steps, LIMITS.steps[0], LIMITS.steps[1]));
  // bound allocation: (steps*2 + 2) verts per ribbon
  const perRibbon = steps * 2 + 2;
  if (count * perRibbon > LIMITS.maxVertices) steps = Math.max(12, Math.floor(LIMITS.maxVertices / count / 2) - 1);
  const maxVerts = count * (steps * 2 + 3);
  const data = new Float32Array(maxVerts * 6);
  const ptsX = new Float32Array(steps), ptsY = new Float32Array(steps);
  const oct = Math.round(P.octaves);
  const fs = P.noiseScale;
  const field = (x, y) => {
    let wx = x, wy = y;
    if (P.warp > 0) {
      wx += P.warp * 0.35 * noise2(x * fs * 0.5 + 11.3, y * fs * 0.5);
      wy += P.warp * 0.35 * noise2(x * fs * 0.5, y * fs * 0.5 - 7.1);
    }
    let a = 0, amp = 1, f = fs, norm = 0;
    for (let o = 0; o < oct; o++) {
      a += amp * noise(wx * f + o * 31.7, wy * f - o * 17.3);
      norm += amp;
      amp *= 0.5;
      f *= 2;
    }
    return (a / norm) * Math.PI * 2 * P.curl + P.flowAngle;
  };
  let v = 0;
  let ribbons = 0;
  let emitFirst = false;
  const ranges = [];
  const pad = 0.15;
  for (let r = 0; r < count; r++) {
    let x = (rand() * 2 - 1) * (aspect + pad);
    let y = (rand() * 2 - 1) * (1 + pad);
    const hue = clamp(rand() * P.colorSpread + (1 - P.colorSpread) * ((y + 1) * 0.5), 0, 1);
    const rnd = rand();
    const wMul = 0.35 + rand() * 1.3;
    let n = 0;
    for (let s = 0; s < steps; s++) {
      ptsX[n] = x;
      ptsY[n] = y;
      n++;
      const a = field(x, y);
      x += Math.cos(a) * P.stepLength;
      y += Math.sin(a) * P.stepLength;
      if (x < -aspect - 0.4 || x > aspect + 0.4 || y < -1.4 || y > 1.4) break;
    }
    if (n < 3) continue;
    if (v > 0) {
      // degenerate join: repeat previous last vertex is written below; repeat first vertex here
      emitFirst = true;
    }
    const start = v + (emitFirst ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const i0 = i > 0 ? i - 1 : i, i1 = i < n - 1 ? i + 1 : i;
      const dx = ptsX[i1] - ptsX[i0], dy = ptsY[i1] - ptsY[i0];
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const t = i / (n - 1);
      const taper = 1 - P.taper * Math.pow(Math.abs(t * 2 - 1), 2);
      const w = P.width * wMul * Math.max(0.05, taper);
      for (let side = -1; side <= 1; side += 2) {
        const reps = emitFirst ? 2 : 1;
        emitFirst = false;
        for (let k = 0; k < reps; k++) {
          const o = v * 6;
          data[o] = ptsX[i] + nx * w * side;
          data[o + 1] = ptsY[i] + ny * w * side;
          data[o + 2] = side;
          data[o + 3] = t;
          data[o + 4] = hue;
          data[o + 5] = rnd;
          v++;
        }
      }
    }
    ranges.push(start, v - start);
    // degenerate: duplicate last vertex
    data.copyWithin(v * 6, (v - 1) * 6, v * 6);
    v++;
    ribbons++;
  }
  return { data: data.subarray(0, v * 6), vertexCount: v, ribbons, steps, ranges };
}

/* ---------------- shaders ---------------- */

const BG_VS = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
const BG_FS = [
  "precision highp float;varying vec2 uv;",
  "uniform vec3 bg;uniform vec3 c0;uniform vec3 c1;uniform vec3 c3;uniform float aspect;uniform float amt;uniform float rings;",
  "uniform float time;uniform float vig;uniform vec2 src[6];uniform int nsrc;",
  "void main(){vec2 q=vec2((uv.x*2.-1.)*aspect,uv.y*2.-1.);float s=0.;",
  "for(int i=0;i<6;i++){if(i>=nsrc)break;float d=length(q-src[i]);s+=sin(d*rings-time*1.2+float(i)*1.7);}",
  "s/=float(nsrc);float band=smoothstep(.55,.95,abs(s));",
  "vec3 tint=mix(c3,c0,clamp(uv.y+s*.15,0.,1.));vec3 col=mix(bg,mix(bg,tint,.55),band*amt);",
  "col+=bg*.25*(1.-length(q)/(aspect+1.))*amt;",
  "float v=1.-vig*smoothstep(.4,1.6,length(q/vec2(aspect,1.)));col*=v;",
  "gl_FragColor=vec4(col,1.);}",
].join("\n");

const RB_VS = [
  "attribute vec2 pos;attribute vec4 meta;uniform float aspect;uniform float time;uniform float drift;",
  "varying float vSide;varying float vT;varying float vHue;varying float vR;",
  "void main(){vec2 p=pos;float ph=meta.w*6.2831;",
  "p+=drift*.012*vec2(sin(time*.7+meta.y*5.+ph),cos(time*.6+meta.y*4.+ph*1.3));",
  "vSide=meta.x;vT=meta.y;vHue=meta.z;vR=meta.w;gl_Position=vec4(p.x/aspect,p.y,0.,1.);}",
].join("\n");
const RB_FS = [
  "precision highp float;varying float vSide;varying float vT;varying float vHue;varying float vR;",
  "uniform vec3 pal[5];uniform float opacity;uniform float time;uniform float drift;",
  "vec3 ramp(float h){h=clamp(h,0.,1.)*4.;if(h<1.)return mix(pal[0],pal[1],h);if(h<2.)return mix(pal[1],pal[2],h-1.);",
  "if(h<3.)return mix(pal[2],pal[3],h-2.);return mix(pal[3],pal[4],h-3.);}",
  "void main(){float edge=1.-pow(abs(vSide),6.);float ends=smoothstep(0.,.08,vT)*smoothstep(1.,.9,vT);",
  "float h=vHue+(vT-.5)*.18+sin(time*.3+vR*6.28)*.03*drift;vec3 c=ramp(h);",
  "c*=.82+.18*(1.-abs(vSide));float a=opacity*edge*ends;gl_FragColor=vec4(c*a,a);}",
].join("\n");
const GR_FS = [
  "precision highp float;varying vec2 uv;uniform float amt;uniform float seed;uniform vec2 res;",
  "float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+seed)*43758.5453);}",
  "void main(){float n=h(floor(uv*res))-.5;gl_FragColor=vec4(vec3(n>0.?1.:0.)*abs(n)*2.*amt,abs(n)*2.*amt);}",
].join("\n");

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error("Shader compile failed: " + log);
  }
  return s;
}
function program(gl, vs, fs) {
  const p = gl.createProgram();
  const a = compile(gl, gl.VERTEX_SHADER, vs), b = compile(gl, gl.FRAGMENT_SHADER, fs);
  gl.attachShader(p, a);
  gl.attachShader(p, b);
  gl.linkProgram(p);
  gl.deleteShader(a);
  gl.deleteShader(b);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("Program link failed: " + gl.getProgramInfoLog(p));
  return p;
}

function sourcesFor(scene, aspect) {
  const r = mulberry32(scene.seed * 3 + 5);
  const n = Math.round(scene.params.sources);
  const out = [];
  for (let i = 0; i < 6; i++) out.push((r() * 2 - 1) * aspect * 1.1, (r() * 2 - 1) * 1.1);
  return { arr: new Float32Array(out), n };
}

/* ---------------- WebGL renderer ---------------- */

function createGL(canvas) {
  const opts = { antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: true, alpha: false };
  const gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
  if (!gl) throw new Error("WebGL unavailable");
  const bgP = program(gl, BG_VS, BG_FS);
  const rbP = program(gl, RB_VS, RB_FS);
  const grP = program(gl, BG_VS, GR_FS);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const vbo = gl.createBuffer();
  let vcount = 0;
  const U = (p, n) => gl.getUniformLocation(p, n);
  return {
    kind: "webgl",
    upload(geom) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, geom.data, gl.STATIC_DRAW);
      vcount = geom.vertexCount;
    },
    draw(scene, aspect, time, w, h) {
      gl.viewport(0, 0, w, h);
      const P = scene.params, pal = scene.palette;
      const cols = pal.colors.map(hexToRgb);
      const bg = hexToRgb(pal.background);
      gl.disable(gl.BLEND);
      gl.useProgram(bgP);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      let loc = gl.getAttribLocation(bgP, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform3fv(U(bgP, "bg"), bg);
      gl.uniform3fv(U(bgP, "c0"), cols[0]);
      gl.uniform3fv(U(bgP, "c1"), cols[1]);
      gl.uniform3fv(U(bgP, "c3"), cols[3]);
      gl.uniform1f(U(bgP, "aspect"), aspect);
      gl.uniform1f(U(bgP, "amt"), P.interference);
      gl.uniform1f(U(bgP, "rings"), P.rings);
      gl.uniform1f(U(bgP, "time"), time * P.drift);
      gl.uniform1f(U(bgP, "vig"), P.vignette);
      const s = sourcesFor(scene, aspect);
      gl.uniform2fv(U(bgP, "src"), s.arr);
      gl.uniform1i(U(bgP, "nsrc"), s.n);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(loc);

      gl.enable(gl.BLEND);
      if (scene.blend === "additive") gl.blendFunc(gl.ONE, gl.ONE);
      else if (scene.blend === "multiply") gl.blendFuncSeparate(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(rbP);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      const lp = gl.getAttribLocation(rbP, "pos"), lm = gl.getAttribLocation(rbP, "meta");
      gl.enableVertexAttribArray(lp);
      gl.enableVertexAttribArray(lm);
      gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(lm, 4, gl.FLOAT, false, 24, 8);
      gl.uniform1f(U(rbP, "aspect"), aspect);
      gl.uniform1f(U(rbP, "time"), time);
      gl.uniform1f(U(rbP, "drift"), P.drift);
      gl.uniform1f(U(rbP, "opacity"), P.opacity);
      const flat = new Float32Array(15);
      cols.forEach((c, i) => flat.set(c, i * 3));
      gl.uniform3fv(U(rbP, "pal"), flat);
      if (vcount > 0) gl.drawArrays(gl.TRIANGLE_STRIP, 0, vcount);
      gl.disableVertexAttribArray(lp);
      gl.disableVertexAttribArray(lm);

      if (P.grain > 0) {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(grP);
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        loc = gl.getAttribLocation(grP, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(U(grP, "amt"), P.grain);
        gl.uniform1f(U(grP, "seed"), (scene.seed % 1000) * 0.37);
        gl.uniform2f(U(grP, "res"), w, h);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.disableVertexAttribArray(loc);
      }
    },
    dispose() {
      gl.deleteBuffer(quad);
      gl.deleteBuffer(vbo);
      gl.deleteProgram(bgP);
      gl.deleteProgram(rbP);
      gl.deleteProgram(grP);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    },
  };
}

/* ---------------- Canvas2D fallback ---------------- */

function create2D(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas2D unavailable");
  let geom = null;
  return {
    kind: "canvas2d",
    upload(g) {
      geom = g;
    },
    draw(scene, aspect, time, w, h) {
      const P = scene.params, pal = scene.palette;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = pal.background;
      ctx.fillRect(0, 0, w, h);
      const sx = (x) => ((x / aspect) * 0.5 + 0.5) * w;
      const sy = (y) => (1 - (y * 0.5 + 0.5)) * h;
      const scale = h / 2;
      if (P.interference > 0) {
        const s = sourcesFor(scene, aspect);
        ctx.strokeStyle = pal.colors[3];
        ctx.lineWidth = Math.max(1, scale * 0.012);
        ctx.globalAlpha = P.interference * 0.35;
        const step = (Math.PI * 2) / P.rings;
        for (let i = 0; i < s.n; i++) {
          for (let r = step; r < aspect * 2.6; r += step) {
            ctx.beginPath();
            ctx.arc(sx(s.arr[i * 2]), sy(s.arr[i * 2 + 1]), r * scale, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      ctx.globalCompositeOperation = scene.blend === "additive" ? "lighter" : scene.blend === "multiply" ? "multiply" : "source-over";
      ctx.globalAlpha = P.opacity;
      if (!geom) return;
      const d = geom.data;
      const cols = pal.colors;
      const R = geom.ranges;
      for (let r = 0; r < R.length; r += 2) {
        const st = R[r], cnt = R[r + 1];
        for (let i = st; i + 3 < st + cnt; i += 2) {
          const o = i * 6;
          const hue = clamp(d[o + 4] + (d[o + 3] - 0.5) * 0.18, 0, 1);
          ctx.fillStyle = cols[Math.min(4, Math.floor(hue * 4.999))];
          ctx.beginPath();
          ctx.moveTo(sx(d[o]), sy(d[o + 1]));
          ctx.lineTo(sx(d[o + 6]), sy(d[o + 7]));
          ctx.lineTo(sx(d[o + 18]), sy(d[o + 19]));
          ctx.lineTo(sx(d[o + 12]), sy(d[o + 13]));
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
    dispose() {
      geom = null;
    },
  };
}

/* ---------------- instance ---------------- */

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} sceneInput
 * @param {{maxDpr?:number, animate?:boolean, renderer?:'auto'|'webgl'|'canvas2d', width?:number, height?:number, onError?:(e:Error)=>void, onStats?:(s:object)=>void}} [options]
 */
export function createStyleScape(canvas, sceneInput, options) {
  const opts = Object.assign({ maxDpr: LIMITS.maxDpr, animate: true, renderer: "auto" }, options || {});
  let scene = validateScene(sceneInput).scene;
  let renderer = null;
  let fallbackReason = null;
  if (opts.renderer !== "canvas2d") {
    try {
      renderer = createGL(canvas);
    } catch (e) {
      fallbackReason = e && e.message ? e.message : String(e);
      if (opts.onError) opts.onError(new Error("WebGL failed, using Canvas2D: " + fallbackReason));
    }
  }
  if (!renderer) renderer = create2D(canvas);

  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let disposed = false, raf = 0, t0 = performance.now(), frozenTime = 0;
  let aspect = 1, w = 1, h = 1, geomKey = "", geom = null;
  let lastBuildMs = 0;

  function measure() {
    const dpr = Math.min(opts.maxDpr, (typeof devicePixelRatio === "number" ? devicePixelRatio : 1) || 1);
    let cw = opts.width, ch = opts.height;
    if (!cw || !ch) {
      const r = canvas.getBoundingClientRect();
      cw = Math.max(1, Math.round(r.width * dpr));
      ch = Math.max(1, Math.round(r.height * dpr));
    }
    const m = LIMITS.maxCanvasEdge;
    if (cw > m || ch > m) {
      const k = m / Math.max(cw, ch);
      cw = Math.round(cw * k);
      ch = Math.round(ch * k);
    }
    if (canvas.width !== cw) canvas.width = cw;
    if (canvas.height !== ch) canvas.height = ch;
    w = cw;
    h = ch;
    aspect = w / h;
  }
  function ensureGeometry() {
    const P = scene.params;
    const key = [scene.seed, aspect.toFixed(3), P.count, P.steps, P.stepLength, P.noiseScale, P.octaves, P.curl, P.warp, P.flowAngle, P.width, P.taper, P.colorSpread].join("|");
    if (key === geomKey) return;
    const s = performance.now();
    geom = buildGeometry(scene, aspect);
    lastBuildMs = performance.now() - s;
    renderer.upload(geom);
    geomKey = key;
    if (opts.onStats) opts.onStats(stats());
  }
  function stats() {
    return {
      renderer: renderer.kind,
      fallbackReason,
      ribbons: geom ? geom.ribbons : 0,
      vertices: geom ? geom.vertexCount : 0,
      buildMs: Math.round(lastBuildMs * 10) / 10,
      width: w,
      height: h,
      animated: shouldAnimate(),
    };
  }
  function shouldAnimate() {
    return opts.animate && !reduced && scene.params.drift > 0;
  }
  function currentTime() {
    return shouldAnimate() ? (performance.now() - t0) / 1000 : frozenTime;
  }
  function render() {
    if (disposed) return;
    ensureGeometry();
    renderer.draw(scene, aspect, currentTime(), w, h);
  }
  function loop() {
    raf = 0;
    if (disposed) return;
    render();
    if (shouldAnimate() && !document.hidden) raf = requestAnimationFrame(loop);
  }
  function kick() {
    if (!raf && !disposed) raf = requestAnimationFrame(loop);
  }
  function onVis() {
    if (!document.hidden) kick();
  }

  measure();
  let ro = null;
  if (!opts.width && typeof ResizeObserver === "function") {
    ro = new ResizeObserver(() => {
      measure();
      kick();
    });
    ro.observe(canvas);
  }
  if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVis);
  render();
  kick();

  return {
    get renderer() {
      return renderer.kind;
    },
    get scene() {
      return scene;
    },
    stats,
    update(next) {
      scene = validateScene(next).scene;
      kick();
    },
    resize() {
      measure();
      kick();
    },
    renderNow: render,
    toDataURL(type) {
      render();
      return canvas.toDataURL(type || "image/png");
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVis);
      renderer.dispose();
      geom = null;
    },
  };
}

/** Render a scene to a PNG data URL at fixed pixel size using an offscreen canvas. */
export function renderToDataURL(scene, width, height, renderer) {
  const c = document.createElement("canvas");
  const m = LIMITS.maxCanvasEdge;
  c.width = Math.min(m, Math.max(1, Math.round(width)));
  c.height = Math.min(m, Math.max(1, Math.round(height)));
  const inst = createStyleScape(c, scene, { animate: false, width: c.width, height: c.height, renderer: renderer || "auto" });
  try {
    return inst.toDataURL("image/png");
  } finally {
    inst.dispose();
  }
}
