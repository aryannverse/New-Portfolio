/**
 * Shared MacBook model (public/models/macbook.glb — "Macbook 3D model" by MahdiEdits,
 * re-compressed with meshopt + WebP). Loaded once, cloned per scene.
 *
 * The GLB ships with its lid open and a stock wallpaper. On load we:
 *  - re-map the screen with a planar UV projection and put our wallpaper on it,
 *  - wrap the lid in a pivot on the hinge axis so the lid angle can be animated,
 *  - normalise the size (base = 3 units wide) and centre the base on the origin.
 */
import {
  Box3, BufferAttribute, Group, Mesh, MeshBasicMaterial, Object3D, SRGBColorSpace,
  Texture, TextureLoader, Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export const MODEL_URL = "/models/macbook.glb";
export const SCREEN_URL = "/media/screen-ferrari.webp";

// node names inside the GLB (exported with hashed names)
const LID = "VCQqxpxkUlzqcJI";   // lid group (shell, bezel, display, camera)
const HINGE = "aXVtPPoMqmRgmzr"; // hinge barrel — its centre is the lid's rotation axis
const BASE = "BoBvWqDHZjAeVrp";  // body group
const HULL = "yIwQWXMhgFCUjXk";  // helper hull, not meant to render

export type Macbook = {
  root: Group;
  /** lid opening in radians: 0 = closed, ~1.93 = as modelled */
  setLid: (a: number) => void;
  open: number;
};

let source: Promise<{ scene: Object3D; open: number }> | null = null;

function loadSource() {
  if (source) return source;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const tex = new TextureLoader().loadAsync(SCREEN_URL).then((t) => {
    t.colorSpace = SRGBColorSpace; t.anisotropy = 8; return t;
  });
  source = Promise.all([loader.loadAsync(MODEL_URL), tex]).then(([gltf, wall]) => {
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    const hull = scene.getObjectByName(HULL); if (hull) hull.visible = false;
    const lid = scene.getObjectByName(LID)!;
    const space = lid.parent!; // all lid / hinge maths happens in the lid's parent space

    // find the display: the only material with an emissive map
    let screen: Mesh | null = null;
    scene.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh && (m.material as { emissiveMap?: Texture }).emissiveMap) screen = m;
    });

    let open = 1.93;
    if (screen) {
      const s = screen as Mesh;
      const g = s.geometry;
      const pos = g.attributes.position;
      const inv = space.matrixWorld.clone().invert();
      const toSpace = s.matrixWorld.clone().premultiply(inv);
      const pts: Vector3[] = [];
      const box = new Box3();
      for (let i = 0; i < pos.count; i++) { const v = new Vector3().fromBufferAttribute(pos, i).applyMatrix4(toSpace); pts.push(v); box.expandByPoint(v); }
      // the lid leans back: its "up" runs from (maxY, maxZ) to (minY, minZ); up in this space is -Z
      const bottom = new Vector3(0, box.max.y, box.max.z);
      const up = new Vector3(0, box.min.y - box.max.y, box.min.z - box.max.z);
      const h = up.length(); up.normalize();
      const w = box.max.x - box.min.x;
      open = Math.atan2(-up.z, up.y); // angle from "lying flat towards the front" (+Y)
      const uv = new Float32Array(pos.count * 2);
      pts.forEach((p, i) => { uv[i * 2] = (p.x - box.min.x) / w; uv[i * 2 + 1] = p.clone().sub(bottom).dot(up) / h; });
      g.setAttribute("uv", new BufferAttribute(uv, 2));
      // cover-fit the wallpaper to the panel
      const img = wall.image as { width: number; height: number };
      const panel = w / h, pic = img.width / img.height;
      if (pic > panel) { wall.repeat.set(panel / pic, 1); wall.offset.set((1 - panel / pic) / 2, 0); }
      else { wall.repeat.set(1, pic / panel); wall.offset.set(0, (1 - pic / panel) / 2); }
      s.material = new MeshBasicMaterial({ map: wall, toneMapped: false });
    }
    return { scene, open };
  });
  return source;
}

export async function createMacbook(): Promise<Macbook> {
  const { scene: src, open } = await loadSource();
  const scene = src.clone(true);
  scene.updateMatrixWorld(true);

  const lid = scene.getObjectByName(LID)!;
  const space = lid.parent!;
  const inv = space.matrixWorld.clone().invert();

  // pivot on the hinge axis
  const hinge = scene.getObjectByName(HINGE);
  const c = new Vector3();
  if (hinge) new Box3().setFromObject(hinge).getCenter(c).applyMatrix4(inv);
  const pivot = new Group();
  pivot.position.set(0, c.y, c.z);
  space.add(pivot);
  pivot.updateMatrixWorld(true);
  pivot.attach(lid);

  // normalise: base 3 units wide, base centred on the origin
  const base = scene.getObjectByName(BASE) ?? scene;
  const bb = new Box3().setFromObject(base);
  const size = bb.getSize(new Vector3()), mid = bb.getCenter(new Vector3());
  const k = 3 / size.x;
  scene.position.copy(mid).multiplyScalar(-k);
  scene.scale.setScalar(k);
  // the original procedural laptop sat slightly low; keep the same visual centre
  scene.position.y -= 0.1;

  const root = new Group();
  root.add(scene);
  return { root, open, setLid: (a: number) => { pivot.rotation.x = open - a; } };
}
