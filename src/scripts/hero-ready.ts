/**
 * Tiny handshake between the hero MacBook (laptop.ts) and the preloader:
 * the preloader holds its counter below 100 until the MacBook has drawn its first frame
 * (model downloaded + decoded, shaders compiled, textures uploaded), so the home page is
 * complete the moment the visitor picks a sound option.
 */
type W = Window & { __avHero?: boolean };
export const heroReady = () => !!(window as W).__avHero;
export function heroDone() {
  if ((window as W).__avHero) return;
  (window as W).__avHero = true;
  dispatchEvent(new Event("av:hero"));
}
