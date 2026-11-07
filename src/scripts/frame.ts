/**
 * The rounded "window" (after string-tune.fiddle.digital, where the whole site sits inside an
 * inset rounded-rect mask): at the end of the story chapter the black letterbox bars above and
 * below the panorama glide out towards the screen edges and settle as a thin dark rim with
 * curved corners, which then frames every chapter after it.
 *
 * Implementation: one fixed element whose huge box-shadow paints everything *outside* a
 * rounded rectangle. The rectangle animates from the panorama band's rect (= the bars) to a
 * small inset (= the rim). Scroll-driven, eased with a little lag so the bars move "slowly".
 * Hand-off: on the frame's first visible frame it hides the story's own bars (same rect, same
 * colour), so it is the bars themselves that appear to open — while the story wipes the
 * panorama to paper behind them (story.ts, same p .9 → .975 window).
 */
import { raf as pageRaf } from "./life";
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initFrame(frame: HTMLElement, story: HTMLElement) {
  const hole = frame.firstElementChild as HTMLElement;
  const band = story.querySelector<HTMLElement>("[data-band-rest]") ?? story.querySelector<HTMLElement>("[data-band]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const storyBars = story.querySelector<HTMLElement>("[data-bars]");
  let cur = -1;

  const geom = () => {
    const small = innerWidth < 1024;
    return { rim: small ? 9 : 16, radius: small ? 28 : 52 };
  };
  const progress = () => {
    const r = story.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, story.offsetHeight - innerHeight));
  };
  // the bars open while the panorama behind them turns to paper — same window as the wipe in
  // story.ts (p .9 → .975), so both finish together
  const START = 0.9, END = 0.975;
  const target = () => {
    const p = progress();
    if (p < START) return -1;               // frame not in play yet: the story's bars are showing
    return clamp((p - START) / (END - START));
  };

  const apply = (t: number) => {
    // swap in the same callback as the frame appears, so there is never a frame with both / neither
    if (storyBars) storyBars.style.visibility = t < 0 ? "" : "hidden";
    if (t < 0 && story.dataset.theme !== "dark") { story.dataset.theme = "dark"; dispatchEvent(new Event("scroll")); }
    if (t < 0) { frame.style.visibility = "hidden"; return; }
    frame.style.visibility = "visible";
    const { rim, radius } = geom();
    const vh = innerHeight;
    // start: the panorama band (the bars are everything above/below it)
    const b = band?.getBoundingClientRect();
    const top0 = b ? b.top : vh * 0.21, bot0 = b ? vh - b.bottom : vh * 0.21;
    const e = ease(t);
    const top = top0 + (rim - top0) * e, bot = bot0 + (rim - bot0) * e, side = rim * e;
    hole.style.inset = `${top.toFixed(1)}px ${side.toFixed(1)}px ${bot.toFixed(1)}px ${side.toFixed(1)}px`;
    hole.style.borderRadius = `${(radius * e).toFixed(1)}px`;
    // once the top bar has slid up past the header, the header sits on paper: flip its theme
    // (ui.ts reads data-theme on scroll; nudge it when the state changes mid-ease)
    const theme = top < 44 ? "light" : "dark";
    if (story.dataset.theme !== theme) { story.dataset.theme = theme; dispatchEvent(new Event("scroll")); }
    // while the bars move the header stays on top; once the rim has settled it goes above the
    // header's own light gradient, so the rim stays solid black all the way round
    frame.style.zIndex = t > 0.97 ? "101" : "80";
  };

  const shell = document.querySelector<HTMLElement>(".shell");
  const tick = () => {
    pageRaf(tick);
    if (shell?.classList.contains("-clip")) return; // page shrunk into a sheet thumbnail: hold the frame as it was
    const t = target();
    if (t < 0) { if (cur !== -1) { cur = -1; apply(-1); } return; }
    cur = cur < 0 || reduce ? t : cur + (t - cur) * 0.25;
    apply(cur);
  };
  // past the story the rim simply stays; before it nothing is drawn
  pageRaf(tick);
}
