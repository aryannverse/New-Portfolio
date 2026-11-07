/**
 * Story chapter:
 *  - panorama band assembles from random mosaic cells, then sharpens (entry)
 *  - dialogue lines type out as the chapter scrolls
 *  - paper-coloured cells wipe the panorama into the light chapter *behind* the black bars while
 *    the dialogue fades out and the bars open (exit, p .9 → .975, all simultaneous), then the
 *    stage fades to reveal the light chapter already sitting underneath it;
 *    once it is white, frame.ts takes over the bars and opens them into the rounded rim
 */
import { g, raf as pageRaf, sig } from "./life";
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function initStory(root: HTMLElement) {
  const band = root.querySelector<HTMLCanvasElement>("[data-band]")!;
  const wipe = root.querySelector<HTMLCanvasElement>("[data-wipe]")!;
  const lineEl = root.querySelector<HTMLElement>("[data-line]")!;
  const ticks = [...root.querySelectorAll<HTMLElement>(".story__ticks li")];
  const lines: string[] = JSON.parse(root.querySelector("[data-lines]")!.textContent || "[]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paper = getComputedStyle(document.documentElement).getPropertyValue("--c-paper").trim() || "#e9e9e7";
  const bctx = band.getContext("2d")!, wctx = wipe.getContext("2d")!;
  const img = new Image(); img.decoding = "async"; img.src = band.dataset.src!;
  const focusY = Number(band.dataset.focusY ?? 0.55); // vertical anchor of the cover crop (0 top … 1 bottom)
  const mosaic = document.createElement("canvas"), mctx = mosaic.getContext("2d")!;

  const CELL = innerWidth < 1024 ? 28 : 44;
  let cells: { x: number; y: number; r: number; r2: number }[] = [];
  let bw = 0, bh = 0, ww = 0, wh = 0;
  const dpr = Math.min(devicePixelRatio, 1.5);

  const layout = () => {
    const b = band.getBoundingClientRect();
    bw = band.width = Math.round(b.width * dpr); bh = band.height = Math.round(b.height * dpr);
    ww = wipe.width = Math.round(innerWidth * dpr); wh = wipe.height = Math.round(innerHeight * dpr);
    const c = CELL * dpr; cells = [];
    for (let y = 0; y < Math.max(bh, wh); y += c) for (let x = 0; x < Math.max(bw, ww); x += c) cells.push({ x, y, r: Math.random(), r2: Math.random() * 0.85 + (y / wh) * 0.15 });
    mosaic.width = Math.ceil(bw / c) || 1; mosaic.height = Math.ceil(bh / c) || 1;
    last = -1;
  };

  // object-fit: cover source rect, with a slow horizontal pan
  const cover = (pan: number) => {
    const ir = img.naturalWidth / img.naturalHeight, cr = bw / bh;
    let sw = img.naturalWidth, sh = img.naturalHeight;
    if (ir > cr) sw = sh * cr; else sh = sw / cr;
    sw /= 1.08; sh /= 1.08; // headroom for the pan
    const sx = (img.naturalWidth - sw) * pan, sy = (img.naturalHeight - sh) * focusY;
    return [sx, sy, sw, sh] as const;
  };

  let last = -1, lastLine = -1, typing = 0;
  const typeLine = (i: number) => {
    clearInterval(typing);
    ticks.forEach((t, k) => t.classList.toggle("-on", k === i));
    const html = lines[i] || "";
    if (reduce) { lineEl.innerHTML = html; return; }
    // reveal characters while keeping <mark> tags intact
    const tmp = document.createElement("div"); tmp.innerHTML = html;
    const total = tmp.textContent!.length; let n = 0;
    const render = () => {
      let left = n; const out = document.createElement("div");
      const walk = (src: Node, dst: Node) => {
        for (const c of src.childNodes) {
          if (left <= 0) return;
          if (c.nodeType === 3) { const t = c.textContent!.slice(0, left); left -= t.length; dst.appendChild(document.createTextNode(t)); }
          else { const e = (c as Element).cloneNode(false); dst.appendChild(e); walk(c, e); }
        }
      };
      walk(tmp, out);
      lineEl.innerHTML = out.innerHTML + (n < total ? '<span class="caret"></span>' : "");
    };
    typing = window.setInterval(() => { n += 2; render(); if (n >= total) clearInterval(typing); }, 24);
  };

  const bars = root.querySelector<HTMLElement>("[data-bars] i");
  const sticky = root.querySelector<HTMLElement>(".story__sticky")!;
  const rest = root.querySelector<HTMLElement>("[data-band-rest]");
  const draw = (p: number) => {
    const entry = reduce ? 1 : clamp(p / 0.1);
    // bars come in from the screen edges once the panorama has assembled full-screen
    if (bars && rest) {
      const k = reduce ? 1 : clamp((p - 0.035) / 0.075);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const top = rest.offsetTop * e, bot = (root.querySelector<HTMLElement>(".story__sticky")!.offsetHeight - rest.offsetTop - rest.offsetHeight) * e;
      bars.style.inset = `${top.toFixed(1)}px 0 ${bot.toFixed(1)}px 0`;
    }
    // exit p .9 → .975: the pixel wipe, the dialogue fade-out AND the bars opening (frame.ts,
    // same window) all run together and finish together; then (.975 → 1) the paper stage fades
    // away, uncovering the light chapter that sits underneath (Listen.astro, .light-wrap)
    const exit = reduce ? 0 : clamp((p - 0.9) / 0.075);
    sticky.style.opacity = (1 - clamp((p - 0.975) / 0.025)).toFixed(3);
    root.classList.toggle("-live", entry > 0.6);
    root.classList.toggle("-out", exit > 0);
    root.style.setProperty("--out", (1 - clamp(exit * 1.6)).toFixed(3));

    // band
    if (img.complete && img.naturalWidth && bw) {
      const pan = 0.15 + p * 0.7;
      const [sx, sy, sw, sh] = cover(pan);
      const key = Math.round(entry * 200) + Math.round(pan * 2000) * 1000;
      if (key !== last) {
        last = key;
        bctx.clearRect(0, 0, bw, bh);
        if (entry >= 1) bctx.drawImage(img, sx, sy, sw, sh, 0, 0, bw, bh);
        else {
          mctx.imageSmoothingEnabled = true;
          mctx.drawImage(img, sx, sy, sw, sh, 0, 0, mosaic.width, mosaic.height);
          const c = CELL * dpr, kx = mosaic.width / bw, ky = mosaic.height / bh, ix = sw / bw, iy = sh / bh;
          bctx.imageSmoothingEnabled = false;
          for (const cell of cells) {
            if (cell.y >= bh || cell.x >= bw || cell.r > entry) continue;
            if (cell.r < entry - 0.35) bctx.drawImage(img, sx + cell.x * ix, sy + cell.y * iy, c * ix, c * iy, cell.x, cell.y, c, c);
            else bctx.drawImage(mosaic, cell.x * kx, cell.y * ky, Math.max(1, c * kx), Math.max(1, c * ky), cell.x, cell.y, c, c);
          }
        }
      }
    }

    // exit wipe
    wctx.clearRect(0, 0, ww, wh);
    if (exit > 0) {
      wctx.fillStyle = paper; const c = CELL * dpr;
      for (const cell of cells) if (cell.r2 < exit * 1.05 && cell.y < wh && cell.x < ww) wctx.fillRect(cell.x, cell.y, c + 1, c + 1);
    }

    // dialogue
    const li = clamp(Math.floor(clamp((p - 0.08) / 0.82) * lines.length), 0, lines.length - 1);
    if (li !== lastLine && entry > 0.6) { lastLine = li; typeLine(li); }
  };

  const progress = () => clamp(-root.getBoundingClientRect().top / Math.max(1, root.offsetHeight - innerHeight));
  let raf = 0, active = false;
  const loop = () => { raf = pageRaf(loop); draw(progress()); };
  new IntersectionObserver(([e]) => {
    active = e.isIntersecting;
    if (active) { cancelAnimationFrame(raf); raf = pageRaf(loop); } else cancelAnimationFrame(raf);
  }, { rootMargin: "100px" }).observe(root);

  img.addEventListener("load", () => { last = -1; });
  layout();
  addEventListener("resize", () => { layout(); }, g({ passive: true }));
  sig().addEventListener("abort", () => clearInterval(typing), { once: true });

  root.querySelector("[data-skip]")!.addEventListener("click", () => {
    window.scrollTo({ top: root.getBoundingClientRect().top + scrollY + root.offsetHeight - innerHeight * 0.99, behavior: reduce ? "auto" : "smooth" });
  });
}
