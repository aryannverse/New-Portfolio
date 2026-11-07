/**
 * Cursor pixel trail (after the katana / bamboo hover on string-tune.fiddle.digital):
 * a soft, ragged brush follows the pointer and turns what's under it into a crisp mosaic
 * of the object itself — then the mosaic dissolves back.
 *
 *  - Mosaic colours are nearest-pixel samples of the rendered frame (sharp, not muddy averages).
 *  - The result is clipped to the object's own alpha, so pixels never spill outside it.
 *  - Works with any canvas source (WebGL or 2D). Call draw() right after the source renders.
 */
import { g } from "./life";
export function pixelTrail(src: HTMLCanvasElement, cssCell = 14) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  if (reduce || !fine) return { draw: () => {} };

  const ov = document.createElement("canvas");
  ov.setAttribute("aria-hidden", "true");
  if (src.hasAttribute("data-pin-on-pop")) ov.setAttribute("data-pin-on-pop", "");
  const cs = getComputedStyle(src);
  const fixed = cs.position === "fixed";
  Object.assign(ov.style, {
    position: fixed ? "fixed" : "absolute", pointerEvents: "none", zIndex: cs.zIndex,
    ...(fixed ? { inset: "0", width: "100%", height: "100%" } : {}),
  });
  src.after(ov);
  const ctx = ov.getContext("2d")!;
  const small = document.createElement("canvas");
  const sctx = small.getContext("2d")!;

  let cols = 0, rows = 0, cell = 0, mask = new Float32Array(0), live = 0;
  const layout = () => {
    const w = src.clientWidth, h = src.clientHeight;
    if (!w || !h) return;
    if (!fixed) Object.assign(ov.style, { left: `${src.offsetLeft}px`, top: `${src.offsetTop}px`, width: `${w}px`, height: `${h}px` });
    ov.width = src.width; ov.height = src.height;
    cell = cssCell * (src.width / w);
    cols = Math.ceil(src.width / cell); rows = Math.ceil(src.height / cell);
    small.width = cols; small.height = rows;
    mask = new Float32Array(cols * rows); live = 0;
  };
  new ResizeObserver(layout).observe(src);
  layout();

  // soft round brush with a ragged edge, ~3 cells across
  const R = 1.9;
  const stamp = (x: number, y: number) => {
    const cx = x / cssCell, cy = y / cssCell;
    for (let r = Math.floor(cy - R); r <= Math.ceil(cy + R); r++) {
      for (let c = Math.floor(cx - R); c <= Math.ceil(cx + R); c++) {
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        const d = Math.hypot(c + 0.5 - cx, r + 0.5 - cy) / R;
        const v = 1.15 - d + (Math.random() - 0.5) * 0.55;
        if (v <= 0.25) continue;
        const i = r * cols + c, nv = Math.min(1, v);
        if (mask[i] < nv) { if (mask[i] <= 0) live++; mask[i] = nv; }
      }
    }
  };
  let lx: number | null = null, ly = 0;
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const b = src.getBoundingClientRect();
    const x = e.clientX - b.left, y = e.clientY - b.top;
    if (x < -cssCell || y < -cssCell || x > b.width + cssCell || y > b.height + cssCell) { lx = null; return; }
    if (lx !== null) {
      const d = Math.hypot(x - lx, y - ly), n = Math.max(1, Math.ceil(d / (cssCell * 0.8)));
      for (let k = 1; k <= n; k++) stamp(lx + ((x - lx) * k) / n, ly + ((y - ly) * k) / n);
    } else stamp(x, y);
    lx = x; ly = y;
  }, g({ passive: true }));
  document.addEventListener("pointerleave", () => { lx = null; }, g());

  let last = performance.now(), dirty = false;
  const draw = () => {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (ov.width !== src.width || ov.height !== src.height) layout();
    ov.style.opacity = src.style.opacity; ov.style.visibility = src.style.visibility;
    if (!live) { if (dirty) { ctx.clearRect(0, 0, ov.width, ov.height); dirty = false; } return; }
    // nearest-pixel down-sample → one crisp colour per cell
    sctx.imageSmoothingEnabled = false;
    sctx.clearRect(0, 0, cols, rows);
    sctx.drawImage(src, 0, 0, cols * cell, rows * cell, 0, 0, cols, rows);
    ctx.globalCompositeOperation = "source-over";
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, ov.width, ov.height);
    const sz = Math.ceil(cell);
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] <= 0) continue;
      mask[i] -= dt * 0.95;
      if (mask[i] <= 0) { live--; continue; }
      const c = i % cols, r = (i / cols) | 0;
      ctx.globalAlpha = Math.min(1, mask[i] * 4); // hold, then a quick dissolve at the end
      ctx.drawImage(small, c, r, 1, 1, Math.floor(c * cell), Math.floor(r * cell), sz, sz);
    }
    ctx.globalAlpha = 1;
    // clip the mosaic to the object's silhouette
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(src, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    dirty = true;
  };
  return { draw };
}
