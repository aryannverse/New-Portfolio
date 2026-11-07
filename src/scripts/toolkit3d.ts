/**
 * Toolkit logo wall centrepiece: the MacBook spinning on its own axis, held in a
 * sticky frame while the logo columns scroll past (pattern from nickho-motorsports.nl's
 * sponsor wall). Scroll speed adds spin; the cursor adds tilt. Only renders while visible.
 */
import {
  ACESFilmicToneMapping, AmbientLight, Color, DirectionalLight, Group, PerspectiveCamera,
  PMREMGenerator, Scene, SRGBColorSpace, WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createMacbook } from "./macbook";
import { pixelTrail } from "./pixeltrail";
import { g, sig, raf as pageRaf } from "./life";

export async function initToolkit3d(canvas: HTMLCanvasElement) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer: WebGLRenderer;
  try { renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new AmbientLight(0xffffff, 0.25));
  const key = new DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 4); scene.add(key);
  const rim = new DirectionalLight(new Color(getComputedStyle(document.documentElement).getPropertyValue("--c-accent").trim() || "#b5302a"), 1.6);
  rim.position.set(-4, 1, -3); scene.add(rim);

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.6, 8.2);
  camera.lookAt(0, 0.55, 0);

  let mb;
  const s0 = sig();
  try { mb = await createMacbook(); } catch { renderer.dispose(); canvas.remove(); return; }
  if (s0.aborted) { renderer.dispose(); renderer.forceContextLoss(); return; }
  // turntable spins about the open laptop's footprint centre (the lid leans back behind the base)
  const spin = new Group();
  mb.root.position.z = 0.36;
  spin.add(mb.root);
  const tilt = new Group();
  tilt.add(spin);
  scene.add(tilt);
  mb.setLid(1.9);
  tilt.rotation.set(0.32, 0, 0.06);
  canvas.classList.add("-loaded");
  const trail = pixelTrail(canvas, 26);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole laptop in frame on narrow canvases
    camera.position.z = 8.2 * Math.max(1, 1.2 / camera.aspect);
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener("pointermove", (e) => { tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; }, g({ passive: true }));

  let visible = false, raf = 0, last = performance.now(), lastY = scrollY, boost = 0;
  const tick = (now: number) => {
    raf = visible && !document.hidden ? pageRaf(tick) : 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    // scroll velocity → extra spin, decays smoothly
    const dy = scrollY - lastY; lastY = scrollY;
    boost += (Math.min(6, Math.abs(dy) * 0.02) - boost) * 0.08;
    if (!reduce) spin.rotation.y += dt * (0.45 + boost);
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    tilt.rotation.x = 0.32 + my * 0.12;
    tilt.rotation.z = 0.06 - mx * 0.06;
    tilt.position.y = reduce ? 0 : Math.sin(now / 1000 * 0.9) * 0.05;
    renderer.render(scene, camera);
    trail.draw();
  };
  const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); lastY = scrollY; raf = pageRaf(tick); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { rootMargin: "10% 0px" }).observe(canvas);
  document.addEventListener("visibilitychange", start, g());
  sig().addEventListener("abort", () => { cancelAnimationFrame(raf); renderer.dispose(); renderer.forceContextLoss(); }, { once: true });
  if (reduce) { spin.rotation.y = -0.5; }
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); cancelAnimationFrame(raf); canvas.style.display = "none"; });
}
