/**
 * Page lifecycle for Astro's ClientRouter (the document persists across page changes so the
 * music keeps playing — but every page's scripts must start and stop cleanly).
 *
 *  onPage(fn)  run fn on every page (initial load + each swap); fn may return a cleanup
 *  sig()       the current page's AbortSignal — aborted just before the next swap
 *  g(opts)     listener options with that signal, for window/document listeners
 *  raf(cb)     requestAnimationFrame that silently drops callbacks of a page that has gone
 */
let ac = new AbortController();
let ready = false;
const runs: (() => void)[] = [];

export const sig = () => ac.signal;
export const g = (opts: AddEventListenerOptions = {}): AddEventListenerOptions => ({ ...opts, signal: ac.signal });
export const raf = (cb: FrameRequestCallback) => {
  const s = ac.signal;
  return requestAnimationFrame((t) => { if (!s.aborted) cb(t); });
};
/** disconnect an observer when the page goes */
export const keep = <T extends { disconnect(): void }>(o: T): T => { ac.signal.addEventListener("abort", () => o.disconnect(), { once: true }); return o; };

export function onPage(fn: () => void | (() => void)) {
  const run = () => {
    const c = fn();
    if (typeof c === "function") ac.signal.addEventListener("abort", c, { once: true });
  };
  runs.push(run);
  if (ready) run(); // module first executed after this page had already loaded
}

/* classes on <html> that belong to the session, not to a page (the router resets <html> attributes) */
const PAGE_ONLY = /^-(pop(-.*)?|scrolled|preload|menu|pt-.*)$/;
let keepClasses: string[] = [];
let keepStyle = "";

document.addEventListener("astro:page-load", () => { ready = true; runs.forEach((r) => r()); });
document.addEventListener("astro:before-swap", (e) => {
  ready = false;
  ac.abort(); ac = new AbortController();
  const html = document.documentElement;
  keepClasses = [...html.classList].filter((c) => !PAGE_ONLY.test(c));
  keepStyle = html.getAttribute("style") || "";
  const ev = e as Event & { newDocument?: Document };
  if (ev.newDocument) { // carry session state straight into the incoming <html>
    const nh = ev.newDocument.documentElement;
    keepClasses.forEach((c) => nh.classList.add(c));
    if (keepStyle) nh.setAttribute("style", keepStyle);
  }
});
document.addEventListener("astro:after-swap", () => {
  const html = document.documentElement;
  keepClasses.forEach((c) => html.classList.add(c));
});
