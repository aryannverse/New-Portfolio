/** A pluckable string: the control point follows the pointer, then springs back. */
import { g, raf as pageRaf } from "./life";
export function initPluck(svg: SVGSVGElement) {
  const path = svg.querySelector("path")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let y = 40, v = 0, x = 500, held = false, raf = 0, running = false;
  const K = 0.12, D = 0.86, MID = 40;

  const set = () => path.setAttribute("d", `M0 40 Q${x.toFixed(1)} ${(2 * y - MID).toFixed(1)} 1000 40`);
  const step = () => {
    if (!held) { v += (MID - y) * K; v *= D; y += v; }
    set();
    if (!held && Math.abs(v) < 0.02 && Math.abs(y - MID) < 0.05) { y = MID; set(); running = false; return; }
    raf = pageRaf(step);
  };
  const kick = () => { if (!running) { running = true; raf = pageRaf(step); } };

  const local = (e: PointerEvent) => {
    const r = svg.getBoundingClientRect();
    return { lx: ((e.clientX - r.left) / r.width) * 1000, ly: ((e.clientY - r.top) / r.height) * 80, inside: e.clientX >= r.left && e.clientX <= r.right };
  };
  svg.addEventListener("pointermove", (e) => {
    if (reduce) return;
    const { lx, ly } = local(e);
    held = true; x = lx; y = Math.max(-40, Math.min(120, ly)); v = 0; kick();
  });
  svg.addEventListener("pointerleave", () => { held = false; kick(); });
  addEventListener("resize", set, g({ passive: true }));
  set();
  return () => cancelAnimationFrame(raf);
}
