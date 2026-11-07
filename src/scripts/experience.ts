/**
 * Experience chapter, driven by scroll (after "Code With Clarity" on string-tune.fiddle.digital):
 *  - at rest the stage shows a glyph — "( signature )" — which blurs away as you start scrolling;
 *  - then each company word blurs in, holds, and blurs out for the next one;
 *  - each role's text fills in word by word (soft cross-fade from faint to ink);
 *  - finally the ink shape rises to close the chapter.
 * Everything is eased with a little lag so the motion stays smooth and unhurried.
 */
import { raf as pageRaf } from "./life";
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function initExperience(root: HTMLElement) {
  const glyph = root.querySelector<HTMLElement>("[data-exp-glyph]");
  const words = [...root.querySelectorAll<HTMLElement>(".exp__words > .swap")];
  const steps = [...root.querySelectorAll<HTMLElement>(".exp__text")];
  const cover = root.querySelector<HTMLElement>(".exp__cover")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const n = words.length;
  const G = 0.1;            // share of the chapter where only the glyph is on stage
  const END = 0.86;         // after this the closing cover takes over
  let raf = 0, qs = -1, ps = -1;

  const frame = () => {
    raf = pageRaf(frame);
    const top = root.getBoundingClientRect().top + scrollY;
    const p = clamp((scrollY - top) / Math.max(1, root.offsetHeight - innerHeight));
    // smooth the scroll position itself: slower, softer transitions
    ps = ps < 0 || reduce ? p : ps + (p - ps) * 0.09;
    const q = clamp((ps - G) / (END - G)) * n; // 0..n across the roles

    if (glyph) {
      const out = clamp(ps / (G * 0.75));     // glyph leaves first…
      glyph.style.setProperty("--g", (1 - out).toFixed(3));
    }
    words.forEach((w, i) => {
      // …and only then the first word arrives (later words overlap the previous one's exit)
      const inn = clamp((q - i + (i === 0 ? -0.04 : 0.15)) / 0.5);
      const out = i === n - 1 ? 0 : clamp((q - i - 0.75) / 0.45);
      w.style.setProperty("--in", inn.toFixed(3));
      w.style.setProperty("--out", out.toFixed(3));
    });
    if (Math.abs(q - qs) > 0.0005) {
      qs = q;
      steps.forEach((s, i) => {
        const local = clamp((q - i) / 0.95);
        s.closest(".exp__step")?.classList.toggle("-on", q > i + 0.02); // heading: grey until reached, then ink for good
        const ws = s.querySelectorAll<HTMLElement>(".-s-word");
        const len = ws.length;
        // fractional fill: each word fades in over ~3 words' worth of progress
        ws.forEach((w, j) => w.style.setProperty("--f", clamp(local * (len + 3) - j, 0, 3) / 3 + ""));
      });
    }
    cover.style.setProperty("--c", clamp((ps - 0.88) / 0.12).toFixed(3));
  };
  new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e.isIntersecting) raf = pageRaf(frame);
  }).observe(root);
}
