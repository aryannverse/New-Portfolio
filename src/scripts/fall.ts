/** Slowly falling pixel blocks (accent colour) — two depth layers. */
import { g, raf as pageRaf } from "./life";
export function initFall(canvas: HTMLCanvasElement) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const front = canvas.dataset.fall === "front";
  const ctx = canvas.getContext("2d")!;
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--c-accent").trim() || "#b5302a";
  const dpr = Math.min(devicePixelRatio, 1.5);
  const U = (front ? 14 : 9) * dpr; // pixel unit
  type P = { x: number; y: number; v: number; shape: number; a: number };
  const shapes = [[[0, 0]], [[0, 0], [0, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 0]], [[0, 0], [0, 1], [0, 2]]];
  let W = 0, H = 0, parts: P[] = [];
  const resize = () => {
    W = canvas.width = canvas.clientWidth * dpr; H = canvas.height = canvas.clientHeight * dpr;
    const n = front ? 7 : 16;
    parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, v: (front ? 0.7 : 0.35) + Math.random() * 0.5, shape: (Math.random() * shapes.length) | 0, a: front ? 0.95 : 0.55 }));
  };
  let raf = 0, lastY = scrollY;
  const tick = () => {
    raf = pageRaf(tick);
    const dy = scrollY - lastY; lastY = scrollY;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = accent;
    for (const p of parts) {
      p.y += (p.v + Math.max(0, dy) * (front ? 0.08 : 0.03)) * dpr;
      if (p.y > H + U * 3) { p.y = -U * 3; p.x = Math.random() * W; }
      ctx.globalAlpha = p.a;
      const sx = Math.round(p.x / U) * U, sy = Math.round(p.y / U) * U;
      for (const [cx, cy] of shapes[p.shape]) ctx.fillRect(sx + cx * U, sy + cy * U, U, U);
    }
  };
  resize();
  addEventListener("resize", resize, g({ passive: true }));
  new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) raf = pageRaf(tick); }).observe(canvas.parentElement!);
}
