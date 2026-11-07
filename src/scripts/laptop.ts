/**
 * The hero object (takes the katana's role in the source layout): the MacBook GLB
 * (src/scripts/macbook.ts) with a fixed wallpaper. Scroll drives position, rotation
 * and lid angle; the cursor adds a slight tilt.
 */
import {
  ACESFilmicToneMapping, AmbientLight, Color, DirectionalLight, PerspectiveCamera,
  PMREMGenerator, Scene, SRGBColorSpace, Vector2, WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createMacbook } from "./macbook";
import { pixelTrail } from "./pixeltrail";
import { g, sig, raf as pageRaf } from "./life";
import { heroDone } from "./hero-ready";

type K = { x: number; y: number; s: number; rx: number; ry: number; rz: number; lid: number; a: number };

export async function initLaptop(canvas: HTMLCanvasElement) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = innerWidth < 1024;
  // start the download/decoding now, in parallel with the renderer + environment setup below
  const model = createMacbook();
  model.catch(heroDone);

  let renderer: WebGLRenderer;
  try { renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch { canvas.remove(); heroDone(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;

  const trail = pixelTrail(canvas, 26);
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new AmbientLight(0xffffff, 0.15));
  const key = new DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 4); scene.add(key);
  const rim = new DirectionalLight(new Color(getComputedStyle(document.documentElement).getPropertyValue("--c-accent").trim() || "#b5302a"), 2.2);
  rim.position.set(-4, 1, -3); scene.add(rim);

  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  let mb;
  const s0 = sig();
  try { mb = await model; } catch { renderer.dispose(); canvas.remove(); heroDone(); return; }
  if (s0.aborted) { renderer.dispose(); renderer.forceContextLoss(); return; } // left the page while loading
  const wrap = mb.root;
  scene.add(wrap);

  const el = (k: string) => document.querySelector<HTMLElement>(`[data-verse="${k}"]`);
  const hero = el("hero"), stage = el("stage"), story = el("story");
  const F: Record<string, K> = {
    hero0: { x: small ? 0.45 : 1.5, y: small ? 1.5 : -0.42, s: small ? 0.55 : 1.45, rx: 0.55, ry: -0.75, rz: 0.32, lid: 1.15, a: 1 },
    hero1: { x: 0, y: 0.7, s: small ? 0.6 : 0.7, rx: 0.35, ry: -0.2, rz: 0.08, lid: 1.75, a: 1 },
    s1: { x: 0, y: 0.7, s: small ? 0.6 : 0.7, rx: 0.22, ry: 0.0, rz: 0, lid: 1.88, a: 1 },
    s2: { x: 0, y: 0.7, s: small ? 0.6 : 0.7, rx: 0.2, ry: 0.35, rz: -0.04, lid: 1.88, a: 1 },
    st0: { x: small ? -0.4 : -1.6, y: 0.35, s: small ? 0.7 : 0.95, rx: 0.3, ry: 0.55, rz: 0.04, lid: 1.9, a: 1 },
    st1: { x: small ? 0.4 : 2.0, y: 0.35, s: small ? 0.7 : 0.95, rx: 0.3, ry: -0.5, rz: -0.04, lid: 1.9, a: 1 },
    st2: { x: small ? 0.8 : 3.4, y: 0.6, s: 0.7, rx: 0.4, ry: -0.9, rz: -0.1, lid: 0.3, a: 0 },
  };
  const mix = (A: K, B: K, t: number): K => {
    const m = (a: number, b: number) => a + (b - a) * t;
    return { x: m(A.x, B.x), y: m(A.y, B.y), s: m(A.s, B.s), rx: m(A.rx, B.rx), ry: m(A.ry, B.ry), rz: m(A.rz, B.rz), lid: m(A.lid, B.lid), a: m(A.a, B.a) };
  };
  const absTop = (n: HTMLElement) => n.getBoundingClientRect().top + scrollY;
  const prog = (n: HTMLElement | null, y: number) => n ? Math.min(1, Math.max(0, (y - absTop(n)) / Math.max(1, n.offsetHeight - innerHeight))) : 0;
  const ease = (t: number) => t * t * (3 - 2 * t);
  // the hero is only one screen tall, so prog() (height − viewport) would be ~0 and the MacBook
  // would snap small on the first pixel of scroll; map it across the hero's full scroll instead
  const heroProg = (y: number) => hero ? Math.min(1, Math.max(0, (y - absTop(hero)) / Math.max(1, hero.offsetHeight))) : 0;
  const target = (y: number): K => {
    if (stage && y < absTop(stage)) return mix(F.hero0, F.hero1, ease(heroProg(y)));
    if (story && y < absTop(story)) {
      const p = prog(stage, y);
      if (p < 0.35) return mix(F.hero1, F.s1, ease(p / 0.35));
      return mix(F.s1, F.s2, ease(Math.min(1, (p - 0.35) / 0.55)));
    }
    const p = prog(story, y);
    if (p < 0.15) return mix(F.s2, F.st0, ease(p / 0.15));
    if (p < 0.8) return mix(F.st0, F.st1, ease((p - 0.15) / 0.65));
    return mix(F.st1, F.st2, ease(Math.min(1, (p - 0.8) / 0.12)));
  };

  let cur = target(scrollY);
  const mouse = new Vector2(), mouseT = new Vector2();
  addEventListener("pointermove", (e) => mouseT.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), g({ passive: true }));

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  resize(); addEventListener("resize", resize, g({ passive: true }));

  // compile every shader up front (in parallel where the GPU supports it) so the first
  // visible frame doesn't hitch; the first render then uploads the textures
  try { await renderer.compileAsync(scene, camera); } catch { /* compiled lazily instead */ }
  if (s0.aborted) { renderer.dispose(); renderer.forceContextLoss(); return; }

  let raf = 0; const t0 = performance.now();
  const shell = document.querySelector<HTMLElement>(".shell");
  const tick = (now: number) => {
    raf = pageRaf(tick);
    // while a sheet is open the page is scaled into a thumbnail: section rects are measured scaled,
    // so the scroll mapping would jump back to the hero and pop the MacBook into view — hold still
    if (shell?.classList.contains("-clip")) return;
    const goal = target(scrollY);
    // past the story chapter the laptop is gone: snap instead of easing (anchor jumps, reloads)
    const past = story ? scrollY > absTop(story) + story.offsetHeight : false;
    cur = past ? goal : mix(cur, goal, reduce ? 1 : 0.085);
    mouse.lerp(mouseT, 0.06);
    const time = (now - t0) / 1000;
    const float = reduce ? 0 : Math.sin(time * 0.9) * 0.06;
    wrap.position.set(cur.x, cur.y + float, 0);
    wrap.scale.setScalar(cur.s);
    wrap.rotation.set(cur.rx - mouse.y * 0.12, cur.ry + mouse.x * 0.22, cur.rz);
    mb.setLid(cur.lid);
    const a = cur.a < 0.04 ? 0 : Math.min(1, cur.a * 1.2);
    canvas.style.opacity = String(a);
    canvas.style.visibility = a === 0 ? "hidden" : "visible";
    if (a > 0) renderer.render(scene, camera);
    trail.draw();
    heroDone(); // first frame is on the GPU: the preloader may finish
  };
  raf = pageRaf(tick);
  document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) raf = pageRaf(tick); }, g());
  sig().addEventListener("abort", () => { cancelAnimationFrame(raf); renderer.dispose(); renderer.forceContextLoss(); }, { once: true });
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); cancelAnimationFrame(raf); canvas.style.display = "none"; });
}
