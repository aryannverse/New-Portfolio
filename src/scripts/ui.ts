/** Page chrome: cursor, header state, scroll %, pixel avatar, guide dialogue. (Info sheet: info.ts) */
import { g as opt } from "./life";
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function cursor() {
  const el = $("[data-cursor-el]");
  if (!el || !matchMedia("(pointer: fine)").matches) return;
  document.documentElement.classList.add("has-cursor");
  let x = -100, y = -100, cx = x, cy = y;
  addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  addEventListener("pointerdown", () => el.classList.add("-down"));
  addEventListener("pointerup", () => el.classList.remove("-down"));
  document.addEventListener("pointerover", (e) => {
    const t = (e.target as Element).closest<HTMLElement>("[data-cursor]");
    if (t) el.dataset.state = t.dataset.cursor; else delete el.dataset.state;
  });
  const k = reduce ? 1 : 0.35;
  const tick = () => {
    cx += (x - cx) * k; cy += (y - cy) * k;
    el.style.setProperty("--cx", `${cx.toFixed(1)}px`); el.style.setProperty("--cy", `${cy.toFixed(1)}px`);
    requestAnimationFrame(tick);
  };
  tick();
}

function header() {
  const h = $("[data-header]")!, pct = $("[data-scroll-pct]"), foot = $("[data-foot]");
  const themed = $$("[data-theme]");
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (pct) pct.textContent = `${Math.round((scrollY / Math.max(1, max)) * 100)}%`;
    document.documentElement.classList.toggle("-scrolled", scrollY > innerHeight * 0.6);
    // theme under the header line
    const probe = 40;
    let theme = "dark", top: string | null = null;
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (!(r.top <= probe && r.bottom > probe)) continue;
      // data-theme-top: a section painted ABOVE whatever overlaps it (the story over the light chapter)
      if (s.hasAttribute("data-theme-top")) top = s.dataset.theme!; else theme = s.dataset.theme!;
    }
    if (top) theme = top;
    // the closing ink cover of the experience chapter counts as dark
    const cover = $(".exp__cover"); if (cover && parseFloat(cover.style.getPropertyValue("--c") || "0") > 0.85) theme = "dark";
    h.classList.toggle("-on-light", theme === "light");
    const metaTheme = $('meta[name="theme-color"]');
    if (metaTheme) {
      const color = theme === "light" ? "#e9e9e7" : "#0a0a0a";
      if (metaTheme.getAttribute("content") !== color) metaTheme.setAttribute("content", color);
    }
    const bloom = $("#bloom");
    if (bloom) { const r = bloom.getBoundingClientRect(); h.classList.toggle("-fade", r.top <= probe && r.bottom > probe); }
    if (foot) h.classList.toggle("-away", foot.getBoundingClientRect().top < innerHeight * 0.35);
  };
  addEventListener("scroll", update, opt({ passive: true }));
  addEventListener("resize", update, opt({ passive: true }));
  update();
}

/** Draw an image into a tiny canvas → crisp pixel-art avatar. */
function pixelate() {
  for (const c of $$<HTMLCanvasElement>("canvas[data-pixel-src]")) {
    const img = new Image(); img.src = c.dataset.pixelSrc!;
    img.onload = () => {
      const cols = Number(c.dataset.pixelCols || 18), rows = Math.round(cols * (img.naturalHeight / img.naturalWidth));
      c.width = cols; c.height = rows;
      const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, cols, rows);
      // posterise for an 8-bit feel
      const d = ctx.getImageData(0, 0, cols, rows);
      for (let i = 0; i < d.data.length; i += 4) for (let k = 0; k < 3; k++) d.data[i + k] = Math.round(d.data[i + k] / 48) * 48;
      ctx.putImageData(d, 0, 0);
    };
  }
}

function guide() {
  const g = $("[data-guide]"); if (!g) return;
  const text = $("[data-guide-text]", g)!, next = $("[data-guide-next]", g)!;
  const lines: string[] = JSON.parse($("[data-guide-lines]", g)!.textContent || "[]");
  let i = 0, timer = 0;
  const type = (s: string) => {
    clearInterval(timer);
    if (reduce) { text.textContent = s; return; }
    let n = 0;
    timer = window.setInterval(() => {
      n += 1; text.innerHTML = `${s.slice(0, n)}${n < s.length ? '<span class="caret"></span>' : ""}`;
      if (n >= s.length) clearInterval(timer);
    }, 28);
  };
  setTimeout(() => type(lines[0]), 1600);
  next.addEventListener("click", () => {
    i += 1;
    if (i >= lines.length) { g.classList.add("-hidden"); return; }
    type(lines[i]);
    if (i === lines.length - 1) next.textContent = "Got it";
  });
  const story = $("[data-story]");
  addEventListener("scroll", () => {
    const hide = story ? story.getBoundingClientRect().top < innerHeight * 0.5 : scrollY > innerHeight * 4;
    if (i < lines.length) g.classList.toggle("-hidden", hide);
  }, opt({ passive: true }));
}


/** Phone menu: glass bar that drops from the top. */
function menu() {
  const h = $("[data-header]"), btn = $("[data-menu-btn]");
  if (!h || !btn) return;
  const set = (on: boolean) => {
    h.classList.toggle("-menu", on);
    document.documentElement.classList.toggle("-menu", on);
    btn.setAttribute("aria-expanded", String(on));
  };
  let y0 = scrollY;
  btn.addEventListener("click", (e) => { e.stopPropagation(); y0 = scrollY; set(!h.classList.contains("-menu")); });
  $$("[data-menu-link], [data-menu-backdrop]").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("click", (e) => { if (!h.contains(e.target as Node)) set(false); }, opt());
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); }, opt());
  addEventListener("scroll", () => { if (Math.abs(scrollY - y0) > 80) { set(false); y0 = scrollY; } }, opt({ passive: true }));
}

/** Home page only: "Experience" lights up while that chapter is on screen (and "Home" otherwise). */
function navSpy() {
  const exp = document.querySelector<HTMLElement>("#experience");
  if (!exp || location.pathname !== "/") return;
  const links = (href: string) => $$(`[data-nav="${href}"]`);
  let cur = "";
  const set = (key: string) => {
    if (key === cur) return; cur = key;
    for (const href of ["/", "/#experience"]) links(href).forEach((a) => {
      const on = href === key;
      a.classList.toggle("-active", on);
      if (on) a.setAttribute("aria-current", href === "/" ? "page" : "location"); else a.removeAttribute("aria-current");
    });
  };
  const update = () => {
    const r = exp.getBoundingClientRect();
    set(r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5 ? "/#experience" : "/");
  };
  addEventListener("scroll", update, opt({ passive: true })); update();
}

/** Once per session: the custom cursor (its element persists across page swaps). */
export function initCursor() { cursor(); }
/** Every page: header state, pixel avatar, guide, phone menu, nav highlight. */
export function initPageUI() { header(); pixelate(); guide(); menu(); navSpy(); }
