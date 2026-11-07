/**
 * /work hub behaviour (after string-tune.fiddle.digital/skill-hub):
 *  - per-card --progress (0 → card entering at the bottom, .5 → centred, 1 → leaving at the top)
 *    drives the CSS drum (rotateX + scale + opacity);
 *  - the card nearest the centre line is "active": side readouts update, it becomes clickable;
 *  - the centre string wobbles with scroll velocity and the pointer, then springs back;
 *  - W / S step between cards, Enter opens the active one; on-screen keys mirror the keyboard;
 *  - "Change view" swaps the drum for a catalogue list.
 */
import { StringTune } from "./string";
import { g, raf as pageRaf } from "./life";
// @ts-ignore — vendored JS (React Bits SoundEngine + SoundNotch preset)
import { playSound } from "./sound/engine.js";
// @ts-ignore
import notch from "./sound/notch.js";

export function initHub(hub: HTMLElement) {
  const items = [...hub.querySelectorAll<HTMLElement>("[data-hub-i]")];
  if (!items.length) return;
  const $ = <T extends Element = HTMLElement>(s: string) => hub.querySelector<T>(s)!;
  const catEl = $("[data-hub-cat]"), nameEl = $("[data-hub-name]"), tagsEl = $("[data-hub-tags]"), blurbEl = $("[data-hub-blurb]");
  const path = $<SVGPathElement>("[data-hub-string] path");
  const viewBtn = $<HTMLButtonElement>("[data-hub-view]"), cata = $("[data-hub-cata]");
  const blurbs = new Map<HTMLElement, string>();
  // one-line descriptions come from a JSON island rendered by work.astro
  const island = document.getElementById("hub-blurbs");
  const blurbList: string[] = island ? JSON.parse(island.textContent || "[]") : [];
  items.forEach((el, i) => blurbs.set(el, blurbList[i] ?? ""));

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active = -1, cata_on = false;

  const swapText = (el: HTMLElement, html: string) => {
    if (el.innerHTML === html) return;
    el.classList.add("-swap");
    setTimeout(() => { el.innerHTML = html; el.classList.remove("-swap"); }, 180);
  };
  // a soft "notch" tick each time a new card crosses the centre line (scroll or W / S) and when the
  // cursor catches / releases the centre string;
  // muted with the rest of the UI sounds when sound is off (audio.ts → setSoundMuted)
  let lastTick = 0;
  const tick = (pitch = 1.5) => {
    const now = performance.now();
    if (now - lastTick < 40) return; // fast scroll: don't rattle
    lastTick = now;
    playSound(notch, { pitch, variation: 0.3, volume: -8 }).catch(() => {});
  };
  const setActive = (i: number) => {
    if (i === active) return;
    if (active !== -1) tick(); // not for the initial pick on page load / after the catalogue
    items[active]?.classList.remove("-active");
    items[active]?.querySelector<HTMLElement>(".hub__card")?.setAttribute("tabindex", "-1");
    active = i;
    const el = items[i];
    el.classList.add("-active");
    el.querySelector<HTMLElement>(".hub__card")?.setAttribute("tabindex", "0");
    const d = el.dataset;
    swapText(catEl, d.cat ?? "");
    swapText(nameEl, `<i>${d.n}.</i>${d.name} /`);
    swapText(tagsEl, (d.tags ?? "").split("|").map((t) => `<span>${t}</span>`).join(""));
    if (blurbEl) swapText(blurbEl, blurbs.get(el) ?? "");
  };

  // --- drum progress -----------------------------------------------------------
  const update = () => {
    const vh = innerHeight;
    hub.classList.toggle("-end", hub.getBoundingClientRect().bottom < vh * 0.97); // footer arriving: readouts leave
    let best = 0, bestD = Infinity;
    items.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const p = (vh - r.top) / (vh + r.height);
      el.style.setProperty("--progress", Math.min(1.2, Math.max(-0.2, p)).toFixed(4));
      const d = Math.abs(r.top + r.height / 2 - vh / 2);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (!cata_on) setActive(best);
  };

  // --- centre string -------------------------------------------------------------
  let sy = 40, sv = 0, sx = 500, lastY = scrollY, held = false;
  const MID = 40;
  const drawString = () => path.setAttribute("d", `M0 40 Q${sx.toFixed(1)} ${(2 * sy - MID).toFixed(1)} 1000 40`);
  const svg = path.ownerSVGElement!;
  addEventListener("pointermove", (e) => {
    if (reduce || cata_on) return;
    const r = svg.getBoundingClientRect();
    const ly = ((e.clientY - r.top) / r.height) * 80;
    const near = Math.abs(e.clientY - (r.top + r.height / 2)) < r.height * 0.6;
    // the cursor catching the string (and letting it spring back) gets the same notch tick
    if (near) { if (!held) tick(); held = true; sx = ((e.clientX - r.left) / r.width) * 1000; sy = Math.max(10, Math.min(70, ly)); sv = 0; }
    else { if (held) tick(1.25); held = false; }
  }, g({ passive: true }));

  const loop = () => {
    const dy = scrollY - lastY; lastY = scrollY;
    if (!held) {
      sv += -dy * 0.05;                    // scroll pushes the string
      sv += (MID - sy) * 0.12; sv *= 0.86; // spring back
      sy += sv; sx += (500 - sx) * 0.04;
    }
    drawString();
    update();
    pageRaf(loop);
  };
  if (reduce) { addEventListener("scroll", update, g({ passive: true })); update(); drawString(); }
  else pageRaf(loop);

  // --- keys --------------------------------------------------------------------
  const st = StringTune.getInstance();
  const centreOf = (el: HTMLElement) => el.getBoundingClientRect().top + scrollY + el.offsetHeight / 2 - innerHeight / 2;
  const go = (dir: 1 | -1) => {
    const i = Math.max(0, Math.min(items.length - 1, active + dir));
    st.scrollTo(centreOf(items[i]));
  };
  const openActive = () => {
    const a = items[active]?.querySelector<HTMLAnchorElement>("a.hub__card");
    if (a) a.click();
  };
  const keyBtn = (k: string) => hub.querySelector<HTMLElement>(`[data-hub-key="${k}"]`);
  const flash = (k: string) => { const b = keyBtn(k); if (!b) return; b.classList.add("-down"); setTimeout(() => b.classList.remove("-down"), 160); };
  const act = (k: string) => { flash(k); if (k === "prev") go(-1); else if (k === "next") go(1); else openActive(); };
  hub.querySelectorAll<HTMLElement>("[data-hub-key]").forEach((b) => b.addEventListener("click", () => act(b.dataset.hubKey!)));
  addEventListener("keydown", (e) => {
    if (cata_on || e.metaKey || e.ctrlKey || e.altKey || document.documentElement.classList.contains("-pop")) return;
    const t = e.target as HTMLElement;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === "w") { e.preventDefault(); act("prev"); }
    else if (k === "s") { e.preventDefault(); act("next"); }
    else if (k === "enter" && (t === document.body || hub.contains(t) === false)) { e.preventDefault(); act("open"); }
  }, g());

  // --- change view -------------------------------------------------------------
  viewBtn.addEventListener("click", () => {
    cata_on = !cata_on;
    viewBtn.setAttribute("aria-pressed", String(cata_on));
    if (cata_on) {
      hub.classList.add("-cata");
      cata.hidden = false; cata.classList.add("-from");
      pageRaf(() => pageRaf(() => cata.classList.remove("-from")));
      setTimeout(() => { if (cata_on) { hub.classList.add("-cata-done"); st.scrollTo(0); } }, 650);
    } else {
      cata.classList.add("-from");
      setTimeout(() => {
        cata.hidden = true; hub.classList.remove("-cata-done");
        pageRaf(() => { hub.classList.remove("-cata"); active = -1; update(); });
      }, 450);
    }
  });

  update(); drawString();
}
