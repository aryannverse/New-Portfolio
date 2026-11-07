/**
 * Preloader flow: counter 0→100 (paced by real page load + the hero MacBook's first frame,
 * never faster than ~2.4s, capped at 12s) →
 * sound prompt (click, ↵ = with sound, esc = silent) → exit: the prompt and flowers blur away,
 * the black screen dissolves into pixels from the centre out while the page comes into focus
 * (a backdrop-filter layer inside .pre — never filter/transform #main, see Preloader.astro).
 * No-op unless html.-preload (set once per session by the gate in Base.astro).
 */
import { initFlowers } from "./flowers";
import { setSound, soundOn } from "./audio";
import { StringTune } from "./string";
import { heroReady } from "./hero-ready";

let ran = false;

export function initPreloader() {
  const root = document.documentElement;
  const pre = document.querySelector<HTMLElement>("[data-pre]");
  if (ran || !pre || !root.classList.contains("-preload")) return;
  ran = true;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const st = StringTune.getInstance();
  const toTop = () => { scrollTo(0, 0); st.scrollTo({ position: 0, immediate: true }); };
  st.lockPageScroll(); toTop();

  const crown = pre.querySelector<HTMLElement>("[data-pre-crown]")!;
  pre.querySelectorAll<HTMLCanvasElement>("[data-flowers]").forEach((c) => initFlowers(c, () => crown.getBoundingClientRect()));

  const num = pre.querySelector<HTMLElement>("[data-pre-count]")!;
  const ask = pre.querySelector<HTMLElement>("[data-pre-ask]")!;
  const t0 = performance.now(), MIN = 2400;
  let loaded = document.readyState === "complete", shown = 0, last = t0, chosen = false;
  if (!loaded) addEventListener("load", () => { loaded = true; }, { once: true });
  // on home, also wait for the 3D MacBook to have drawn its first frame (see hero-ready.ts)
  let hero = !document.querySelector("[data-verse-canvas]") || heroReady();
  if (!hero) addEventListener("av:hero", () => { hero = true; }, { once: true });

  const tick = (now: number) => {
    const dt = Math.min(0.25, (now - last) / 1000); last = now;
    if (now - t0 > 12000) loaded = hero = true; // never hold the visitor hostage to a slow asset
    const time = Math.min(1, (now - t0) / MIN);
    // until the page + MacBook are ready, creep towards 90; afterwards run to 100
    const target = loaded && hero ? time : Math.min(0.9, time * 0.9 + (1 - Math.exp(-(now - t0) / 4000)) * 0.1);
    shown += (target - shown) * (1 - Math.exp(-dt / 0.22)); // time-based, frame-rate independent
    if (target >= 1 && shown > 0.995) shown = 1;
    num.textContent = String(Math.round(shown * 100));
    if (shown < 1) requestAnimationFrame(tick);
    else setTimeout(prompt, 350);
  };
  requestAnimationFrame(tick);

  const prompt = () => {
    pre.classList.add("-done");
    ask.hidden = false;
    setTimeout(() => {
      pre.classList.add("-ask");
      const pref = soundOn() || !localStorage.getItem("av-sound") ? "on" : "off";
      pre.querySelector<HTMLButtonElement>(`[data-pre-choice="${pref}"]`)?.focus({ preventScroll: true });
    }, 250);
  };

  // pixel dissolve: black cells vanish from the centre outwards (with a little noise)
  const dissolve = (done: () => void) => {
    const c = pre.querySelector<HTMLCanvasElement>("[data-pre-px]")!;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = (c.width = Math.round(innerWidth * dpr)), H = (c.height = Math.round(innerHeight * dpr));
    const ctx = c.getContext("2d")!;
    const S = Math.round(Math.max(26, Math.min(innerWidth, innerHeight) / 22) * dpr);
    const cells: { x: number; y: number; t: number }[] = [];
    const cx = W / 2, cy = H / 2, R = Math.hypot(cx, cy);
    for (let y = 0; y < H; y += S) for (let x = 0; x < W; x += S) {
      const d = Math.hypot(x + S / 2 - cx, y + S / 2 - cy) / R;
      cells.push({ x, y, t: d * 0.72 + Math.random() * 0.28 });
    }
    const D = reduce ? 1 : 1250, start = performance.now();
    let first = true;
    const frame = (now: number) => {
      const k = Math.min(1, (now - start) / D), e = 1 - Math.pow(1 - k, 2);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050505";
      for (const cell of cells) if (cell.t > e) ctx.fillRect(cell.x, cell.y, S + 1, S + 1);
      if (first) { first = false; pre.classList.add("-px"); } // canvas now covers: drop the black backing, start the focus-in
      if (k < 1) requestAnimationFrame(frame); else done();
    };
    requestAnimationFrame(frame);
  };

  const choose = (on: boolean) => {
    if (chosen) return; chosen = true;
    setSound(on);
    pre.classList.remove("-ask");
    pre.classList.add("-leaving");
    setTimeout(() => {
      // the MacBook is already rendering underneath (hero-ready.ts), so it is there as the cells clear
      toTop(); // the page is revealed at the hero, whatever the browser tried to restore
      dissolve(() => {
        st.unlockPageScroll();
        toTop();
        // some browsers restore the old scroll position late (after load / once scrolling is allowed
        // again): keep the hero for a moment unless the visitor starts scrolling themselves
        let touched = false;
        const mine = () => { touched = true; };
        const opts = { once: true, passive: true, capture: true } as const;
        ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) => addEventListener(ev, mine, opts));
        const until = performance.now() + 1500;
        const hold = () => { if (touched) return; if (scrollY > 2) toTop(); if (performance.now() < until) requestAnimationFrame(hold); };
        requestAnimationFrame(hold);
        setTimeout(() => {           // let the focus-in (1.4s, started with the dissolve) finish
          root.classList.remove("-preload");
          pre.remove();
          dispatchEvent(new CustomEvent("av:ready"));
        }, reduce ? 0 : 200);
      });
    }, 380);
  };
  pre.querySelectorAll<HTMLButtonElement>("[data-pre-choice]").forEach((b) => b.addEventListener("click", () => choose(b.dataset.preChoice === "on")));
  addEventListener("keydown", (e) => {
    if (!pre.classList.contains("-ask")) return;
    if (e.key === "Escape") { e.preventDefault(); choose(false); }
    else if (e.key === "Enter" && !(e.target as Element).closest?.("[data-pre-choice]")) { e.preventDefault(); choose(true); }
  });
}
