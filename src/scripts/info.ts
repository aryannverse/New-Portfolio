/**
 * Sheets (the "i" info sheet, the captures gallery): the whole page (.shell) shrinks to a
 * thumbnail around the current viewport (scale .13, nudged up), a veil fades in, and the
 * sheet's parts animate in with staggered delays — then the same in reverse on close.
 * One sheet at a time; each `[data-pop="key"]` is opened by `[data-pop-open="key"]`
 * (the info sheet also by `[data-info-open]`).
 */
import { StringTune } from "./string";
import { g, sig } from "./life";

const OPEN_MS = 1600, CLOSE_MS = 1200;

export function initInfo() {
  const shell = document.querySelector<HTMLElement>("[data-shell]");
  if (!shell) return;
  const root = document.documentElement;
  const header = document.querySelector<HTMLElement>("[data-header]");
  let busy: HTMLElement | null = null; // the sheet currently open / animating

  document.querySelectorAll<HTMLElement>("[data-pop]").forEach((pop) => {
    const key = pop.dataset.pop || "info";
    let state: "closed" | "opening" | "open" | "closing" = "closed";
    let pinned: { el: HTMLElement; css: string }[] = [];
    let opener: HTMLElement | null = null;
    let timer = 0;

    // line index per word, so each line of a paragraph rises a beat after the previous one
    const indexLines = () => {
      let top = -1, li = -1;
      pop.querySelectorAll<HTMLElement>(".pop__w8").forEach((w) => {
        if (Math.abs(w.offsetTop - top) > 4) { top = w.offsetTop; li++; }
        w.style.setProperty("--li", String(li));
      });
    };

    const open = (from?: HTMLElement) => {
      // another sheet is up (e.g. "Gallery" pressed inside the info sheet): close it, then open this one
      if (busy && busy !== pop) {
        const other = busy;
        other.querySelector<HTMLElement>("[data-pop-close]")?.click();
        clearTimeout(timer);
        timer = window.setTimeout(() => { if (!busy) open(from); }, CLOSE_MS + 60);
        return;
      }
      if (state === "open" || state === "opening") return;
      clearTimeout(timer);
      busy = pop;
      opener = from ?? (document.activeElement as HTMLElement);
      const y = scrollY, vh = innerHeight;
      if (state === "closed") {
        // fixed layers inside the page would detach once the shell is transformed: pin them in place
        pinned = [...shell.querySelectorAll<HTMLElement>("[data-pin-on-pop]")].map((el) => {
          const css = el.style.cssText;
          el.style.position = "absolute"; el.style.top = `${y}px`; el.style.height = `${vh}px`;
          return { el, css };
        });
        shell.style.setProperty("--oy", `${y + vh / 2}px`);
        shell.style.setProperty("--ct", `${y}px`);
        shell.style.setProperty("--cb", `${Math.max(0, shell.offsetHeight - y - vh)}px`);
        shell.classList.add("-clip");
        void shell.offsetWidth;
      }
      state = "opening";
      if (matchMedia("(min-width: 1024px)").matches) {
        StringTune.getInstance().lockPageScroll();
      }
      pop.hidden = false;
      pop.classList.remove("-leave");
      pop.classList.add("-enter");
      indexLines();
      void pop.offsetWidth;
      root.classList.add("-pop", `-pop-${key}`);
      shell.inert = true; if (header) header.inert = true;
      requestAnimationFrame(() => { pop.classList.add("-on"); pop.classList.remove("-enter"); });
      pop.querySelector<HTMLElement>("[data-pop-close]")?.focus({ preventScroll: true });
      timer = window.setTimeout(() => { state = "open"; }, OPEN_MS);
    };

    const close = () => {
      if (state === "closed" || state === "closing") return;
      clearTimeout(timer);
      state = "closing";
      pop.classList.add("-leave");
      pop.classList.remove("-on");
      root.classList.remove("-pop", `-pop-${key}`);
      timer = window.setTimeout(() => {
        pop.hidden = true; pop.classList.remove("-leave");
        shell.classList.remove("-clip");
        pinned.forEach(({ el, css }) => { el.style.cssText = css; }); pinned = [];
        shell.inert = false; if (header) header.inert = false;
        StringTune.getInstance().unlockPageScroll();
        opener?.focus({ preventScroll: true });
        state = "closed"; busy = null;
      }, CLOSE_MS);
    };

    // Apple Music card: tilt + glare follow the cursor; playlist rows open their own links
    pop.querySelectorAll<HTMLElement>("[data-am]").forEach((am) => {
      am.addEventListener("pointermove", (e) => {
        const r = am.getBoundingClientRect();
        am.style.setProperty("--rx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        am.style.setProperty("--ry", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      am.addEventListener("pointerleave", () => { am.style.setProperty("--rx", "0"); am.style.setProperty("--ry", "0"); });
      am.querySelectorAll<HTMLElement>("[data-href]").forEach((pl) => {
        const go = (ev: Event) => { ev.preventDefault(); ev.stopPropagation(); window.open(pl.dataset.href, "_blank", "noopener"); };
        pl.addEventListener("click", go);
        pl.addEventListener("keydown", (ev) => { if ((ev as KeyboardEvent).key === "Enter") go(ev); });
      });
    });

    const sel = key === "info" ? `[data-info-open], [data-pop-open="info"]` : `[data-pop-open="${key}"]`;
    document.querySelectorAll<HTMLElement>(sel).forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); open(b); }));
    pop.querySelectorAll<HTMLElement>("[data-pop-close], [data-pop-close-veil]").forEach((b) => b.addEventListener("click", close));
    pop.addEventListener("touchmove", (e) => e.stopPropagation(), { passive: true });
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); }, g());
    sig().addEventListener("abort", () => { if (state !== "closed") { clearTimeout(timer); root.classList.remove("-pop", `-pop-${key}`); StringTune.getInstance().unlockPageScroll(); busy = null; } }, { once: true });
    // a link to the page we're on: close the sheet (the scroll itself is handled globally)
    pop.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((a) => a.addEventListener("click", () => {
      if (new URL(a.href).pathname === location.pathname) close();
    }));
    // bfcache restore: never come back to a half-open sheet
    addEventListener("pageshow", (e) => {
      if (e.persisted && state !== "closed") {
        root.classList.remove("-pop"); pop.hidden = true; state = "closed"; busy = null;
        shell.inert = false; if (header) header.inert = false; shell.classList.remove("-clip");
        StringTune.getInstance().unlockPageScroll();
      }
    }, g());
  });
}
