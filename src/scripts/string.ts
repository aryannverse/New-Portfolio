import StringTune, {
  StringProgress,
  StringProgressPart,
  StringSplit,
  StringParallax,
  StringCursor,
  StringMagnetic,
  StringImpulse,
  StringScroller,
  StringLazy,
  StringSpotlight,
  StringVideoAutoplay,
} from "@fiddle-digital/string-tune";

/** Single StringTune instance shared by every section script. */
export function bootString() {
  const st = StringTune.getInstance();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  st.use(StringProgress);
  st.use(StringProgressPart);
  st.use(StringSplit);
  st.use(StringParallax);
  st.use(StringScroller);
  st.use(StringLazy);
  st.use(StringSpotlight);
  st.use(StringVideoAutoplay);
  st.use(StringImpulse);
  if (matchMedia("(pointer: fine)").matches) {
    st.use(StringCursor, { lerp: 0.8 });
    st.use(StringMagnetic);
  }

  st.scrollDesktopMode = reduce ? "default" : "smooth";
  st.scrollMobileMode = "default";
  st.speed = 0.16;
  st.speedAccelerate = 0.25;
  st.start(60);

  // keep a usable 1vh on mobile browsers with collapsing toolbars
  const setVh = () => document.documentElement.style.setProperty("--vh", `${window.innerHeight / 100}px`);
  setVh();
  addEventListener("resize", setVh, { passive: true });

  document.documentElement.classList.add("-ready");
  rebindOnSwap(st);
  return st;
}

/**
 * Astro's ClientRouter swaps in a brand-new <body> on every navigation, but StringTune bound
 * itself to the first one: its DOM observer, its scroll container (wheel / resize / mutation
 * listeners) and its object registry all keep pointing at the old, detached page. Result: split
 * text never re-splits (every wave line shows at once, stacked), progress/parallax stop updating.
 *
 * So, around each swap:
 *  - before: release every object of the outgoing page (objects are cached by string-id, and the
 *    next page re-uses ids such as "stage" — a stale entry would be re-used with the old element);
 *  - after: point the scroll container at the new body, re-attach the DOM observer and register
 *    the new page's [string] elements (same as StringTune's own start-up initObjects()).
 * The internals used here are plain JS members of StringTune 1.2.x (private only in its typings).
 */
type Internals = {
  objectManager: { objects: Map<string, { htmlElement?: HTMLElement }>; remove(id: string): void; observeDOM(): void };
  initObjects(): void;
  observeContainerMutations?(): void;
  scrollContainer: unknown;
};
function rebindOnSwap(st: StringTune) {
  const s = st as unknown as Internals;
  document.addEventListener("astro:before-swap", () => {
    const om = s.objectManager;
    for (const [id, o] of [...om.objects]) {
      if (o.htmlElement?.closest("[data-astro-transition-persist]")) continue; // survives the swap
      try { om.remove(id); } catch { om.objects.delete(id); }
    }
  });
  document.addEventListener("astro:after-swap", () => {
    s.scrollContainer = window;           // re-binds wheel/scroll/resize/transitionend to the new body
    s.observeContainerMutations?.();
    s.objectManager.observeDOM();         // MutationObserver on the new body
    s.initObjects();                      // register + connect this page's [string] elements
  });
}

export { StringTune };
