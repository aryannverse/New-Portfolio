/**
 * Sound experience.
 *  - Ambient track (public/audio/ambient.mp3) through Web Audio, so fades are sample-smooth.
 *  - Choice is remembered (localStorage "av-sound" = on | off); playback position is saved
 *    continuously, so pausing at 2:45 resumes at 2:45 — across pages and reloads too.
 *  - UI sounds (React Bits SoundEngine): "nib" on every click, "plush" when the nav changes page.
 *  - Toggle: [data-sound-toggle] buttons (header, phone menu). html.-sound-on reflects the state.
 */
import { playSound, preloadSound, setSoundMuted, setSoundVolume } from "./sound/engine.js";
import nib from "./sound/nib.js";
import plush from "./sound/plush.js";

const KEY = "av-sound", TKEY = "av-sound-t";
const VOLUME = 0.55;         // moderate: the track is loudness-normalised to −20 LUFS, then compressed below
const FADE_IN = 1.8, FADE_OUT = 0.9;
const root = document.documentElement;

let el: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let saver = 0, wantPlay = false;

const stored = () => localStorage.getItem(KEY) as "on" | "off" | null;
export const soundOn = () => stored() === "on";

function ensure() {
  if (el) return;
  el = new Audio("/audio/ambient.mp3");
  el.loop = true; el.preload = "auto"; el.crossOrigin = "anonymous";
  const t = parseFloat(localStorage.getItem(TKEY) || "0");
  if (t > 0) el.addEventListener("loadedmetadata", () => { if (el && t < el.duration) el.currentTime = t; }, { once: true });
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  gain = ctx.createGain(); gain.gain.value = 0;
  // the piece has very soft passages that dropped to near-silence at a moderate volume: a gentle
  // compressor evens it out (loud parts held back, so the whole track can sit a little higher)
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -30; comp.knee.value = 12; comp.ratio.value = 3.5;
  comp.attack.value = 0.08; comp.release.value = 0.6;
  const makeup = ctx.createGain(); makeup.gain.value = 0.75; // overall level: background, not foreground
  ctx.createMediaElementSource(el).connect(gain);
  gain.connect(comp); comp.connect(makeup); makeup.connect(ctx.destination);
  if (import.meta.env.DEV) (window as unknown as { __amb: unknown }).__amb = { el, ctx, gain, out: makeup };
}

const ramp = (to: number, secs: number) => {
  if (!ctx || !gain) return;
  const now = ctx.currentTime, g = gain.gain;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(to, now + secs);
};
const saveTime = () => { if (el && !Number.isNaN(el.currentTime)) localStorage.setItem(TKEY, el.currentTime.toFixed(2)); };

async function start() {
  ensure(); wantPlay = true;
  try {
    if (ctx!.state === "suspended") await ctx!.resume();
    await el!.play();
    ramp(VOLUME, FADE_IN);
    clearInterval(saver); saver = window.setInterval(saveTime, 1000);
  } catch {
    // autoplay blocked on this page: start on the first interaction instead
    const resume = () => { if (wantPlay && soundOn()) start(); };
    addEventListener("pointerdown", resume, { once: true, capture: true });
    addEventListener("keydown", resume, { once: true, capture: true });
  }
}
function stop(secs = FADE_OUT) {
  wantPlay = false;
  if (!el || !ctx) return;
  ramp(0, secs);
  clearInterval(saver); saveTime();
  setTimeout(() => { if (!wantPlay && el) { el.pause(); saveTime(); } }, secs * 1000 + 60);
}

function reflect() {
  const on = soundOn();
  root.classList.toggle("-sound-on", on);
  document.querySelectorAll<HTMLElement>("[data-sound-toggle]").forEach((b) => {
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Mute sound" : "Turn sound on");
  });
  setSoundMuted(!on);
}

/** Set the preference (from the preloader prompt or the toggle). */
export function setSound(on: boolean) {
  localStorage.setItem(KEY, on ? "on" : "off");
  reflect();
  if (on) { start(); playSound(nib, { volume: -15.5 }).catch(() => {}); } else stop();
}

/** Refresh toggle buttons for the current page (the header is re-rendered on every page swap). */
export function reflectSound() { reflect(); }

/** Once per session — the document (and this audio graph) persists across page changes. */
export function initAudio() {
  setSoundVolume(1);
  reflect();
  preloadSound(nib, { volume: -15.5 }); preloadSound(plush);

  // capture phase: toggles + UI sounds, before the router / page handlers see the click
  document.addEventListener("click", (e) => {
    const t = e.target as Element;
    if (t.closest?.("[data-sound-toggle]")) { e.stopPropagation(); setSound(!soundOn()); return; }
    if (!soundOn()) return;
    const a = t.closest?.("a[href]") as HTMLAnchorElement | null;
    const url = a ? new URL(a.href, location.href) : null;
    const route = !!(a && url && url.origin === location.origin && url.pathname !== location.pathname && (!a.target || a.target === "_self") && !e.metaKey && !e.ctrlKey);
    playSound(route ? plush : nib, route ? {} : { volume: -15.5 }).catch(() => {}); // the music carries on across pages
  }, true);

  addEventListener("pagehide", saveTime);
  document.addEventListener("visibilitychange", () => { if (document.hidden) saveTime(); });

  // returning visitor who chose sound: continue where the music left off (unless the preloader will ask)
  if (soundOn() && !root.classList.contains("-preload")) start();
}
