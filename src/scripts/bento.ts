/**
 * Drives the two computed bento graphics (see BentoArt.astro):
 *  quant   — re-quantises a waveform; cycles 16 → 8 → 4 → 2 bit, or follows the cursor's x
 *  surface — projects a moving IV surface z(strike, maturity, t) as a wireframe; cursor tilts it
 * Only animates while on screen.
 */
import { raf as pageRaf } from "./life";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function quant(svg: SVGSVGElement) {
  const stair = svg.querySelector<SVGPathElement>("[data-q-stair]")!;
  const smooth = svg.querySelector<SVGPathElement>("[data-q-smooth]")!;
  const label = svg.querySelector<SVGTextElement>("[data-q-label]")!;
  const levelsEl = svg.querySelector<SVGTextElement>("[data-q-levels]")!;
  const ticks = [...svg.querySelectorAll<SVGRectElement>("[data-q-tick]")];
  const BITS = [16, 8, 4, 2];
  const X0 = 36, X1 = 364, Y0 = 186, Y1 = 84;
  const f = (u: number) => 0.5 + 0.38 * Math.sin(u * Math.PI * 2.2 - 0.6) + 0.1 * Math.sin(u * Math.PI * 7);
  let d = "";
  for (let i = 0; i <= 120; i++) { const u = i / 120; d += `${i ? "L" : "M"}${(X0 + u * (X1 - X0)).toFixed(1)} ${(Y0 - f(u) * (Y0 - Y1)).toFixed(1)}`; }
  smooth.setAttribute("d", d);
  let cur = -1;
  const set = (k: number) => {
    if (k === cur) return; cur = k;
    const b = BITS[k], L = Math.min(2 ** b, 96), N = b >= 8 ? 96 : b === 4 ? 32 : 14;
    let p = "";
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N, q = Math.round(f((u0 + u1) / 2) * (L - 1)) / (L - 1);
      const y = (Y0 - q * (Y0 - Y1)).toFixed(1), x0 = (X0 + u0 * (X1 - X0)).toFixed(1), x1 = (X0 + u1 * (X1 - X0)).toFixed(1);
      p += `${i ? "L" : "M"}${x0} ${y}L${x1} ${y}`;
    }
    stair.setAttribute("d", p);
    label.textContent = `${b}-bit`;
    levelsEl.textContent = `${(2 ** b).toLocaleString("en")} levels`;
    ticks.forEach((t, i) => t.classList.toggle("-on", i <= k));
  };
  set(0);
  let hover = false, t0 = performance.now();
  const card: HTMLElement | SVGSVGElement = svg.closest<HTMLElement>(".work__proj, .hub__card") ?? svg;
  card.addEventListener("pointermove", (ev) => { const e = ev as PointerEvent;
    hover = true;
    const r = svg.getBoundingClientRect();
    set(Math.max(0, Math.min(3, Math.floor(((e.clientX - r.left) / r.width) * 4))));
  });
  card.addEventListener("pointerleave", () => { hover = false; t0 = performance.now(); });
  return () => { if (!hover && !reduce) set(Math.floor((performance.now() - t0) / 1600) % 4); };
}

function surface(svg: SVGSVGElement) {
  const g = svg.querySelector<SVGGElement>("[data-surf]")!;
  const pt = svg.querySelector<SVGCircleElement>("[data-surf-pt]")!;
  const NX = 18, NY = 12;
  const rows: SVGPathElement[] = [], cols: SVGPathElement[] = [];
  const mk = () => { const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); g.appendChild(p); return p; };
  for (let j = 0; j < NY; j++) rows.push(mk());
  for (let i = 0; i < NX; i++) cols.push(mk());
  rows[Math.floor(NY * 0.55)].classList.add("-hi");
  let tx = 0, ty = 0, mx = 0, my = 0;
  const card: HTMLElement | SVGSVGElement = svg.closest<HTMLElement>(".work__proj, .hub__card") ?? svg;
  card.addEventListener("pointermove", (ev) => { const e = ev as PointerEvent; const r = svg.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; });
  card.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
  // volatility smile × term structure, gently breathing
  const z = (u: number, v: number, t: number) => 0.55 * (u - 0.5) ** 2 * 3.2 + 0.25 * Math.exp(-v * 2.2) + 0.06 * Math.sin(u * 7 + t * 1.4) * Math.cos(v * 5 - t);
  const draw = (t: number) => {
    mx += (tx - mx) * 0.08; my += (ty - my) * 0.08;
    const yaw = -0.55 + mx * 0.9, pitch = 0.62 + my * 0.5, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const P = (u: number, v: number) => {
      const x = (u - 0.5) * 2, y = (v - 0.5) * 2, h = z(u, v, t) * 1.6;
      const X = x * cy - y * sy, Y = x * sy + y * cy;
      return [200 + X * 118, 132 + Y * cp * 62 - h * sp * 92] as const;
    };
    for (let j = 0; j < NY; j++) { let d = ""; for (let i = 0; i < NX; i++) { const [a, b] = P(i / (NX - 1), j / (NY - 1)); d += `${i ? "L" : "M"}${a.toFixed(1)} ${b.toFixed(1)}`; } rows[j].setAttribute("d", d); }
    for (let i = 0; i < NX; i++) { let d = ""; for (let j = 0; j < NY; j++) { const [a, b] = P(i / (NX - 1), j / (NY - 1)); d += `${j ? "L" : "M"}${a.toFixed(1)} ${b.toFixed(1)}`; } cols[i].setAttribute("d", d); }
    const u = 0.5 + 0.38 * Math.sin(t * 0.5), [a, b] = P(u, Math.floor(NY * 0.55) / (NY - 1)); // rides the highlighted maturity
    pt.setAttribute("cx", a.toFixed(1)); pt.setAttribute("cy", b.toFixed(1));
  };
  draw(0);
  return () => { if (!reduce) draw(performance.now() / 1000); };
}

/** Every graphic: cursor parallax on its .p1 layer, and a speed change on hover. */
function interact(svg: SVGSVGElement) {
  const host = svg.closest<HTMLElement>(".work__proj, .hub__card"); if (!host || reduce) return;
  const rate = svg.dataset.bart === "shield" || svg.dataset.bart === "guard" || svg.dataset.bart === "mcp" ? 0.3 : 2.2; // slow down the readable ones, speed up the rest
  const setRate = (r: number) => svg.getAnimations({ subtree: true }).forEach((a) => (a.playbackRate = r));
  host.addEventListener("pointermove", (e) => {
    const r = svg.getBoundingClientRect();
    svg.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    svg.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  host.addEventListener("pointerenter", () => setRate(rate));
  host.addEventListener("pointerleave", () => { setRate(1); svg.style.setProperty("--px", "0"); svg.style.setProperty("--py", "0"); });
}

/** Root-cause gauge: counts 50 → 18 min while the dial sweeps back; replays on hover. */
function gauge(el: HTMLElement) {
  const n = el.querySelector<HTMLElement>("[data-count]")!, svg = el.querySelector<SVGSVGElement>(".work__dial")!;
  let raf = 0;
  const play = () => {
    cancelAnimationFrame(raf);
    const t0 = performance.now(), D = reduce ? 1 : 1800;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3), v = 50 - 32 * e;
      n.textContent = String(Math.round(v)); svg.style.setProperty("--v", ((v / 50) * 100).toFixed(1));
      if (k < 1) raf = pageRaf(step);
    };
    raf = pageRaf(step);
  };
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); setTimeout(play, 500); } }, { threshold: 0.6 }).observe(el);
  el.addEventListener("pointerenter", play);
}

export function initBento(root: HTMLElement) {
  const tickers: (() => void)[] = [];
  root.querySelectorAll<SVGSVGElement>('[data-bart="quant"]').forEach((s) => tickers.push(quant(s)));
  root.querySelectorAll<SVGSVGElement>('[data-bart="surface"]').forEach((s) => tickers.push(surface(s)));
  root.querySelectorAll<SVGSVGElement>("[data-bart]").forEach(interact);
  root.querySelectorAll<HTMLElement>("[data-gauge]").forEach(gauge);
  let raf = 0;
  const loop = () => { raf = pageRaf(loop); tickers.forEach((f) => f()); };
  new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) raf = pageRaf(loop); }).observe(root);
}
