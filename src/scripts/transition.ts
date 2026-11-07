/**
 * Page transitions under Astro's ClientRouter (same-document, so the music never stops).
 *  - Native View Transitions: CSS in styles/transition.css ("the deck"); html[data-pt] gives the
 *    direction (back = going home).
 *  - No View Transitions: a curtain covers the page while the router fetches, then uncovers.
 *  - A link to the page you're already on never transitions: it just scrolls.
 * Registered once per session (document-level delegation).
 */
import { StringTune } from "./string";

const root = document.documentElement;
const native = "startViewTransition" in document;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let dir = "fwd";

/**
 * Clicks during a running page transition. For the 1.5s of "the deck", the browser hit-tests every
 * pointer event to <html> (the snapshot layer covers the page), so a nav click right after arriving
 * was silently lost and felt like a stuck nav. If a press lands on <html> while a transition runs,
 * finish the transition immediately and replay the click on whatever is really under the pointer.
 */
let running: ViewTransition | null = null;
function rescueClicksDuringTransitions() {
  if (!native) return;
  const start = document.startViewTransition.bind(document);
  (document as Document).startViewTransition = ((arg: Parameters<typeof start>[0]) => {
    const t = start(arg);
    running = t;
    t.finished.finally(() => { if (running === t) running = null; });
    return t;
  }) as typeof document.startViewTransition;

  document.addEventListener("pointerdown", (e) => {
    if (!running || e.target !== root || e.button !== 0) return;
    const t = running; running = null;
    t.skipTransition();
    const { clientX: x, clientY: y } = e;
    addEventListener("pointerup", () => {
      requestAnimationFrame(() => {
        const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("a[href], button, [data-card], [data-pop-open], [data-info-open]");
        el?.click();
      });
    }, { once: true, capture: true });
  }, true);
}

export function initTransitions() {
  rescueClicksDuringTransitions();
  // same-page links (capture phase: runs before the router's own click handler)
  document.addEventListener("click", (e) => {
    const a = (e.target as Element).closest?.("a") as HTMLAnchorElement | null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== "_self") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;
    e.preventDefault(); e.stopPropagation();
    const st = StringTune.getInstance();
    const el = url.hash ? document.querySelector<HTMLElement>(url.hash) : null;
    st.scrollTo(el ? el.getBoundingClientRect().top + scrollY : 0);
    if (url.hash !== location.hash) history.replaceState(history.state, "", url.hash || location.pathname);
  }, true);

  document.addEventListener("astro:before-preparation", (ev) => {
    const e = ev as Event & { to: URL; sourceElement?: Element; loader: () => Promise<void> };
    dir = e.to.pathname === "/" ? "back" : "fwd";
    root.dataset.pt = dir;
    if (native || reduce) return;
    const label = document.querySelector<HTMLElement>("[data-pt-label]");
    if (label) label.textContent = `( ${dir === "back" ? "Home" : (e.sourceElement?.textContent || "").replace(/[↗↑↓]/g, "").trim() || "Next"} )`;
    root.classList.toggle("-pt-back", dir === "back");
    root.classList.add("-pt-leave");
    const load = e.loader;
    e.loader = async () => { await Promise.all([load(), new Promise((r) => setTimeout(r, 760))]); };
  });

  document.addEventListener("astro:after-swap", () => {
    root.dataset.pt = dir; // the router resets <html> attributes; the deck CSS needs the direction during the animation
    if (native || reduce) return;
    root.classList.remove("-pt-leave");
    root.classList.add("-pt-in");
    if (dir === "back") root.classList.add("-pt-back");
    setTimeout(() => root.classList.remove("-pt-in", "-pt-back"), 1200);
  });
}
