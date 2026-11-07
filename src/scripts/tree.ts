/**
 * Hero backdrop: a generative ink tree (sepia line-art, red blossoms) drawn into an
 * octagon window, after the painted tree behind the katana on string-tune.fiddle.digital.
 * Original artwork — generated from a fixed seed, so it is the same tree on every visit.
 * Grows in branch by branch on load; drifts with scroll and the cursor.
 */
import { g, raf as pageRaf } from "./life";

type Op = { order: number; draw: (c: CanvasRenderingContext2D) => void };

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Two looks: the hero's sepia line-art on black, and the light chapter's red-crowned tree on paper. */
const PALETTES = {
  dark: {
    INK: "#1f1a16", BARK_A: "#8d7c69", BARK_B: "#5d5246", BARK_C: "#3d352d", GRAIN: "rgba(38, 31, 26, .75)",
    LEAF_LINE: "#8a7660", LEAF_FILL: "#231d18", BLOOM: ["#a3262b", "#8f1f24", "#b8343a"], BLOOM_LINE: "rgba(40,8,10,.8)",
    side: 0.45, tipLeaves: 2, tipBloom: 0.16, sideBloom: 0.025, leafScale: 1,
    trunk: { x: 0.5, a: 0.05, len: 250, w: 160, depth: 7 }, seed: 11,
  },
  light: {
    INK: "#1b120d", BARK_A: "#6e4c37", BARK_B: "#3f2b1f", BARK_C: "#24170f", GRAIN: "rgba(20, 12, 8, .55)",
    LEAF_LINE: "#9b2716", LEAF_FILL: "#e5462c", BLOOM: ["#f36b3f", "#d23722", "#ff9064"], BLOOM_LINE: "rgba(110,20,10,.55)",
    side: 0.8, tipLeaves: 5, tipBloom: 0.45, sideBloom: 0.08, leafScale: 1.3,
    trunk: { x: 0.68, a: -0.42, len: 300, w: 150, depth: 8 }, seed: 5,
  },
};
type Pal = typeof PALETTES.dark;

function build(W: number, H: number, P: Pal = PALETTES.dark) {
  const seed = P.seed;
  const r = rng(seed);
  const ops: Op[] = [];
  const S = Math.min(W, H) / 1000; // scale factor: design space ≈ 1000 units

  /** tapered, gently curving limb from (x,y) heading `a` (radians, 0 = up) */
  const limb = (x: number, y: number, a: number, len: number, w0: number, depth: number, order: number) => {
    const steps = Math.max(4, Math.round(len / (18 * S)));
    const pts: [number, number][] = [[x, y]];
    let ang = a, px = x, py = y;
    const bend = (r() - 0.5) * 0.09;
    for (let i = 1; i <= steps; i++) {
      ang += bend + (r() - 0.5) * 0.14 + Math.sin(i * 0.9 + depth) * 0.03 + (a - ang) * 0.22;
      px += Math.sin(ang) * (len / steps); py -= Math.cos(ang) * (len / steps);
      pts.push([px, py]);
    }
    const w1 = w0 * 0.74;
    const width = (t: number) => w0 + (w1 - w0) * t;
    // outline polygon
    const L: [number, number][] = [], R: [number, number][] = [];
    pts.forEach((p, i) => {
      const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)];
      const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1;
      const nx = -dy / d, ny = dx / d, hw = width(i / (pts.length - 1)) / 2;
      L.push([p[0] + nx * hw, p[1] + ny * hw]); R.push([p[0] - nx * hw, p[1] - ny * hw]);
    });
    const grains = w0 > 6 * S ? Math.min(5, Math.floor(w0 / (7 * S))) : 0;
    const knot = w0 > 26 * S && r() < 0.8 ? { t: 0.25 + r() * 0.5, s: 0.25 + r() * 0.2 } : null;
    ops.push({
      order,
      draw: (c) => {
        if (w0 < 2.2 * S) { // twig: single stroke
          c.strokeStyle = P.LEAF_LINE; c.lineWidth = Math.max(0.8, w0); c.lineCap = "round";
          c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
          return;
        }
        c.beginPath();
        L.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
        for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
        c.closePath();
        const g = c.createLinearGradient(L[0][0], L[0][1], R[0][0], R[0][1]);
        g.addColorStop(0, P.BARK_A); g.addColorStop(0.55, P.BARK_B); g.addColorStop(1, P.BARK_C);
        c.fillStyle = g; c.fill();
        // outline the two long sides only — no end caps, so joints flow into each other
        c.strokeStyle = P.INK; c.lineWidth = Math.max(1, 1.6 * S * 1.4); c.lineJoin = "round";
        for (const side of [L, R]) { c.beginPath(); side.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); }
        // wood grain: wavy lines running along the limb
        c.lineWidth = Math.max(0.6, 0.9 * S * 1.4); c.strokeStyle = P.GRAIN;
        for (let k = 1; k <= grains; k++) {
          const f = k / (grains + 1) - 0.5, wob = (k * 1.7) % 1;
          c.beginPath();
          pts.forEach((p, i) => {
            const t = i / (pts.length - 1), hw = width(t) / 2;
            const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)];
            const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1;
            const off = (f + Math.sin(t * 9 + wob * 6) * 0.06) * 2 * hw;
            const xx = p[0] + (-dy / d) * off, yy = p[1] + (dx / d) * off;
            i ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
          });
          c.stroke();
        }
        if (knot) { // concentric knot rings
          const i = Math.floor(knot.t * (pts.length - 1)), p = pts[i], hw = width(knot.t) / 2;
          for (let k = 1; k <= 4; k++) {
            c.beginPath(); c.ellipse(p[0], p[1], hw * knot.s * k * 0.45, hw * knot.s * k * 0.7, a, 0, Math.PI * 2);
            c.strokeStyle = k === 1 ? P.INK : P.GRAIN; c.stroke();
          }
        }
      },
    });
    return { end: pts[pts.length - 1], ang, w1, pts };
  };

  const leaf = (x: number, y: number, a: number, s: number, order: number) => ops.push({
    order,
    draw: (c) => {
      c.save(); c.translate(x, y); c.rotate(a);
      c.beginPath(); c.moveTo(0, 0);
      c.quadraticCurveTo(s * 0.45, -s * 0.5, 0, -s); c.quadraticCurveTo(-s * 0.45, -s * 0.5, 0, 0);
      c.fillStyle = P.LEAF_FILL; c.fill();
      c.strokeStyle = P.LEAF_LINE; c.lineWidth = Math.max(0.7, s * 0.06); c.stroke();
      c.beginPath(); c.moveTo(0, -s * 0.1); c.lineTo(0, -s * 0.85); c.lineWidth *= 0.7; c.stroke();
      c.restore();
    },
  });

  const bloom = (x: number, y: number, s: number, order: number) => {
    const col = P.BLOOM[Math.floor(r() * P.BLOOM.length)], rot = r() * Math.PI;
    ops.push({
      order,
      draw: (c) => {
        c.save(); c.translate(x, y); c.rotate(rot);
        for (let k = 0; k < 5; k++) {
          c.rotate((Math.PI * 2) / 5);
          c.beginPath(); c.ellipse(0, -s * 0.5, s * 0.36, s * 0.52, 0, 0, Math.PI * 2);
          c.fillStyle = col; c.fill(); c.strokeStyle = P.BLOOM_LINE; c.lineWidth = Math.max(0.6, s * 0.07); c.stroke();
        }
        c.beginPath(); c.arc(0, 0, s * 0.18, 0, Math.PI * 2); c.fillStyle = "#2a0d0e"; c.fill();
        c.restore();
      },
    });
  };

  const grow = (x: number, y: number, a: number, len: number, w: number, depth: number, order: number) => {
    const seg = limb(x, y, a, len, w, depth, order);
    // children start a little inside the parent's end so the joints read as one piece of wood
    const back = seg.pts[Math.max(0, seg.pts.length - 2)];
    const [ex, ey] = [seg.end[0] * 0.6 + back[0] * 0.4, seg.end[1] * 0.6 + back[1] * 0.4];
    // side twigs with leaves along thinner limbs
    if (w < 22 * S) {
      seg.pts.forEach((p, i) => {
        if (i === 0 || r() > P.side) return;
        const side = r() < 0.5 ? -1 : 1, la = seg.ang + side * (0.6 + r() * 0.6);
        leaf(p[0], p[1], la, (20 + r() * 16) * S * P.leafScale, order + 1);
        if (r() < P.sideBloom) bloom(p[0] + side * 6 * S, p[1] - 4 * S, (9 + r() * 6) * S, order + 2);
      });
    }
    if (depth <= 0 || w < 1.4 * S) {
      // twig tip: a little cluster
      const n = P.tipLeaves + Math.floor(r() * 2);
      for (let k = 0; k < n; k++) leaf(ex, ey, seg.ang + (r() - 0.5) * 2.4, (18 + r() * 14) * S * P.leafScale, order + 1);
      if (r() < P.tipBloom) bloom(ex + (r() - 0.5) * 10 * S, ey + (r() - 0.5) * 10 * S, (10 + r() * 8) * S, order + 2);
      return;
    }
    const kids = depth > 6 ? 2 : r() < 0.4 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const spread = (k - (kids - 1) / 2) * (0.62 + r() * 0.5) + (r() - 0.5) * 0.3;
      // branches lean outwards, away from the centre line, so the crown spreads wide
      const outward = Math.sign(ex - W / 2 || 1) * 0.06;
      const na = Math.max(-1.3, Math.min(1.3, seg.ang * 0.5 + spread * (depth > 6 ? 0.85 : 1) + outward));
      grow(ex, ey, na, len * (0.68 + r() * 0.14), seg.w1 * (0.78 + r() * 0.12), depth - 1, order + 1);
    }
  };

  // one gnarled trunk that forks low, like the painted original
  const T = P.trunk;
  grow(W * T.x, H * 1.05, T.a, T.len * S, T.w * S, T.depth, 0);
  return ops.sort((a, b) => a.order - b.order);
}

type Opts = { mode?: "hero" | "bloom" };

export function initTree(el: HTMLElement, { mode = "hero" }: Opts = {}) {
  const canvas = el.querySelector("canvas");
  if (!canvas) return;
  const P = mode === "bloom" ? PALETTES.light : PALETTES.dark;
  let onDrawn: (() => void) | null = null;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d")!;
  let ops: Op[] = [], done = 0, t0 = 0, raf = 0;
  const DUR = 2600;

  const paintBg = () => {
    const { width: W, height: H } = canvas;
    if (mode === "bloom") { ctx.clearRect(0, 0, W, H); return; } // transparent: sits on the paper
    const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.75);
    g.addColorStop(0, "#191614"); g.addColorStop(1, "#0f0e0d");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // paper grain
    const img = ctx.getImageData(0, 0, W, H), d = img.data, r = rng(3);
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    ctx.putImageData(img, 0, 0);
  };

  const setup = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ops = build(canvas.width, canvas.height, P);
    paintBg(); done = 0;
    if (reduce) { ops.forEach((o) => o.draw(ctx)); done = ops.length; return; }
    t0 = performance.now(); cancelAnimationFrame(raf); raf = pageRaf(step);
  };
  const maxOrder = () => ops.length ? ops[ops.length - 1].order : 1;
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / DUR);
    const e = 1 - Math.pow(1 - p, 2.2);
    const limit = e * (maxOrder() + 1);
    while (done < ops.length && ops[done].order <= limit) ops[done++].draw(ctx);
    onDrawn?.();
    if (done < ops.length) raf = pageRaf(step);
  };

  if (mode === "bloom") {
    // grow when the chapter comes into view; no scroll drift
    let grown = false;
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !grown) { grown = true; setup(); } }, { rootMargin: "0px 0px -20% 0px" }).observe(el);
    let rw0 = innerWidth;
    addEventListener("resize", () => { if (grown && Math.abs(innerWidth - rw0) > 80) { rw0 = innerWidth; setup(); } }, g({ passive: true }));
    return { canvas, set onFrame(f: () => void) { onDrawn = f; } };
  }

  // draw once fonts/layout have settled
  pageRaf(setup);
  let rw = innerWidth;
  addEventListener("resize", () => { if (Math.abs(innerWidth - rw) > 80) { rw = innerWidth; setup(); } }, g({ passive: true }));

  // scroll drift + fade, cursor parallax
  let mx = 0, my = 0, tx = 0, ty = 0;
  if (!reduce) addEventListener("pointermove", (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, g({ passive: true }));
  const loop = () => {
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    const p = Math.min(1, scrollY / innerHeight);
    el.style.setProperty("--tree-y", `${(-p * 18 + my * -1.2).toFixed(2)}vh`);
    el.style.setProperty("--tree-x", `${(mx * -1.4).toFixed(2)}vw`);
    el.style.opacity = String(Math.max(0, 1 - p * 1.1));
    if (p < 1.05) pageRaf(loop); else { el.style.opacity = "0"; addEventListener("scroll", wake, g({ passive: true, once: true })); }
  };
  const wake = () => pageRaf(loop);
  loop();
}
