/**
 * Falling pixel-art flowers with depth of field (the light chapter's take on the source's
 * falling pixels). Three layers, each its own canvas so the blur is a cheap CSS filter:
 *   far  — small, slow, softly blurred
 *   mid  — crisp pixel blossoms that flutter (3D flip) and turn in quarter steps
 *   near — a few large, heavily blurred blossoms drifting past the lens
 * A shared wind (slow gusts + scroll velocity) pushes them sideways.
 */
import { g, raf as pageRaf } from "./life";
const SPRITES = [
  ["..#..", ".#o#.", "#ooo#", ".#o#.", "..#.."],
  [".#.#.", "##.##", "..o..", "##.##", ".#.#."],
  [".##..", "#oo#.", "#oo##", ".####", "..#.."],
  ["##", ".#"],
  ["#"],
];
const PETALS = ["#e5462c", "#f36b3f", "#d23722", "#ff9064", "#c92f1d", "#ef5a3a"];
const CENTRES = ["#7a1a0e", "#ffc65a", "#8f2412"];
type Layer = "far" | "mid" | "near";
const CFG: Record<Layer, { unit: number; n: number; vy: [number, number]; sprites: number[]; alpha: number; fromCrown: number }> = {
  far: { unit: 3, n: 34, vy: [0.25, 0.55], sprites: [0, 1, 2, 3, 4], alpha: 0.55, fromCrown: 0.8 },
  mid: { unit: 6, n: 16, vy: [0.6, 1.2], sprites: [0, 1, 2, 3], alpha: 1, fromCrown: 0.75 },
  near: { unit: 22, n: 7, vy: [0.7, 1.3], sprites: [0, 1, 2, 3], alpha: 0.95, fromCrown: 0.35 },
};

let wind = 0; // shared between layers
let windT = 0;

export function initFlowers(canvas: HTMLCanvasElement, area: () => DOMRect | null) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = (canvas.dataset.flowers as Layer) || "mid";
  const cfg = CFG[layer];
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  const U = cfg.unit * dpr;
  type F = { x: number; y: number; vy: number; amp: number; f: number; ph: number; flip: number; fs: number; rot: number; spin: number; s: number; petal: string; centre: string; a: number };
  let W = 0, H = 0, fl: F[] = [];

  const crown = () => {
    const c = canvas.getBoundingClientRect(), t = area();
    if (!t) return { x0: W * 0.4, x1: W, y0: 0, y1: H * 0.4 };
    return {
      x0: (t.left - c.left + t.width * 0.05) * dpr, x1: (t.right - c.left - t.width * 0.05) * dpr,
      y0: (t.top - c.top + t.height * 0.04) * dpr, y1: (t.top - c.top + t.height * 0.42) * dpr,
    };
  };
  const spawn = (initial: boolean): F => {
    const k = crown(), crownBorn = Math.random() < cfg.fromCrown;
    return {
      x: crownBorn ? k.x0 + Math.random() * (k.x1 - k.x0) : Math.random() * W,
      y: initial ? Math.random() * H : crownBorn ? k.y0 + Math.random() * (k.y1 - k.y0) : -U * 8,
      vy: cfg.vy[0] + Math.random() * (cfg.vy[1] - cfg.vy[0]),
      amp: (10 + Math.random() * 26) * dpr, f: 0.5 + Math.random() * 0.9, ph: Math.random() * 6.3,
      flip: Math.random() * 6.3, fs: 1.2 + Math.random() * 2.2,
      rot: (Math.random() * 4) | 0, spin: 0.5 + Math.random() * 1.5,
      s: cfg.sprites[(Math.random() * cfg.sprites.length) | 0],
      petal: PETALS[(Math.random() * PETALS.length) | 0], centre: CENTRES[(Math.random() * CENTRES.length) | 0],
      a: initial ? 1 : 0,
    };
  };
  const resize = () => {
    W = canvas.width = Math.round(canvas.clientWidth * dpr); H = canvas.height = Math.round(canvas.clientHeight * dpr);
    const n = Math.round(cfg.n * Math.min(1.2, Math.max(0.5, canvas.clientWidth / 1440)));
    fl = Array.from({ length: n }, () => spawn(true));
  };

  const drawSprite = (p: F, px: number, py: number) => {
    const sp = SPRITES[p.s], n = sp.length, m = sp[0].length;
    // flutter: the blossom flips like a coin as it falls — squeeze its width, pixel-snapped
    const sx = Math.max(0.2, Math.abs(Math.cos(p.flip)));
    const cw = Math.max(1, Math.round(U * sx)), ox = Math.round((U - cw) * m / 2);
    const back = Math.cos(p.flip) < 0;
    ctx.globalAlpha = p.a * cfg.alpha;
    for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) {
      const ch = sp[r][c]; if (ch === ".") continue;
      let rr = r, cc = c;
      if (p.rot === 1) { rr = c; cc = n - 1 - r; } else if (p.rot === 2) { rr = n - 1 - r; cc = m - 1 - c; } else if (p.rot === 3) { rr = m - 1 - c; cc = r; }
      ctx.fillStyle = ch === "o" && !back ? p.centre : p.petal;
      ctx.fillRect(px + ox + cc * cw, py + rr * U, cw, U);
    }
  };

  let raf = 0, last = performance.now(), lastY = scrollY;
  const tick = (now: number) => {
    if (!canvas.isConnected) return; // e.g. the preloader has gone
    raf = pageRaf(tick);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const dy = scrollY - lastY; lastY = scrollY;
    if (layer === "mid") { // one layer drives the shared wind
      windT += dt;
      const gust = Math.sin(windT * 0.35) * 0.7 + Math.sin(windT * 0.9 + 1.3) * 0.35 + Math.sin(windT * 2.1) * 0.1;
      wind += (gust - 0.25 + dy * 0.01 - wind) * 0.05;
    }
    const depth = layer === "near" ? 1.6 : layer === "mid" ? 1 : 0.5;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < fl.length; i++) {
      const p = fl[i];
      p.y += (p.vy * 60 * dt + Math.abs(dy) * 0.06 * depth) * dpr;
      p.x += wind * 38 * dt * depth * dpr;
      p.ph += p.f * dt * 2;
      p.flip += p.fs * dt;
      p.a = Math.min(1, p.a + dt * 1.2);
      p.spin -= dt; if (p.spin <= 0) { p.rot = (p.rot + 1) % 4; p.spin = 0.5 + Math.random() * 1.5; }
      if (p.y > H + U * 6 || p.x < -W * 0.2 || p.x > W * 1.2) { fl[i] = spawn(false); continue; }
      const x = p.x + Math.sin(p.ph) * p.amp;
      drawSprite(p, Math.round(x / U) * U, Math.round(p.y / U) * U);
    }
    ctx.globalAlpha = 1;
  };
  resize();
  addEventListener("resize", resize, g({ passive: true }));
  new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e.isIntersecting) { last = performance.now(); raf = pageRaf(tick); }
  }).observe(canvas.parentElement!);
}

/**
 * Cloud bank from layered value noise (fBm), lit from above — soft, painterly cumulus that
 * fades into the page colour at every edge, so the chapter has no visible seams.
 * Rendered once at low resolution and scaled up smoothly.
 */
export function drawClouds(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  // seeded lattice + smooth value noise
  const P = new Uint8Array(512);
  { let s = 7; for (let i = 0; i < 256; i++) { s = (s * 16807) % 2147483647; P[i] = s & 255; } for (let i = 0; i < 256; i++) P[i + 256] = P[i]; }
  const hash = (x: number, y: number) => P[(P[x & 255] + y) & 511] / 255;
  const sm = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    const u = sm(xf), v = sm(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x: number, y: number) => { let s = 0, a = 0.5, f = 1; for (let o = 0; o < 6; o++) { s += a * noise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; };

  const paint = () => {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (!cw || !ch) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    const w = 360, h = Math.max(120, Math.round((360 * ch) / cw));
    const low = document.createElement("canvas"); low.width = w; low.height = h;
    const lc = low.getContext("2d")!;
    const img = lc.createImageData(w, h), D = img.data;
    const dens = (x: number, y: number) => {
      const nx = x / w, ny = y / h;
      // bank envelope: a rolling top edge, densest in the lower half, gone at the very bottom & sides
      const top = 0.42 + 0.12 * Math.sin(nx * 5.1 + 1.2) + 0.08 * Math.sin(nx * 11.7);
      const env = Math.min(1, Math.max(0, (ny - top) / 0.18)) * Math.min(1, Math.max(0, (1 - ny) / 0.22)) * Math.min(1, nx / 0.06, (1 - nx) / 0.06);
      return fbm(nx * 6.5, ny * 4.2) * env;
    };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d = dens(x, y);
      const a = Math.min(1, Math.max(0, (d - 0.3) / 0.28));
      if (a <= 0) continue;
      // light from above: brighter where density falls off upwards
      const up = dens(x, y - 3);
      const lit = Math.min(1, Math.max(0, 0.62 + (d - up) * 3.2 - (y / h) * 0.25));
      const i = (y * w + x) * 4;
      D[i] = 196 + 59 * lit; D[i + 1] = 193 + 62 * lit; D[i + 2] = 208 + 47 * lit; D[i + 3] = a * 235;
    }
    lc.putImageData(img, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.filter = `blur(${(1.5 * dpr).toFixed(1)}px)`;
    ctx.drawImage(low, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";
  };
  paint();
  let w0 = innerWidth;
  addEventListener("resize", () => { if (Math.abs(innerWidth - w0) > 80) { w0 = innerWidth; paint(); } }, g({ passive: true }));
}
