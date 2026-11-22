import {
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  InstancedMesh,
  Matrix4,
  MeshMatcapMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

/**
 * Cadena cromada 3D que recorre el sitio ("Tu ciudad, conectada").
 *
 * - Un eslabón es un TorusGeometry estirado en Y; se repite con un InstancedMesh (un solo draw call).
 * - Los eslabones siguen una CatmullRomCurve3 fija en la pantalla; el scroll desplaza el "offset", así la
 *   cadena se desliza como si alguien la tirara. Cada segundo eslabón gira 90° para que encastren.
 * - Cromo con MATCAP: una esfera de reflejo pintada en un canvas. Se ve metálico sin luces ni mapa de
 *   entorno, así arranca rápido incluso en celulares modestos.
 * - El color cambia según la sección visible ([data-chain-light] = white | lime | cyan) tiñendo el cromo.
 * - Respeta prefers-reduced-motion (queda quieta) y se pausa con la pestaña oculta.
 */

const TINTS: Record<string, Color> = {
  white: new Color("#ffffff"),
  lime: new Color("#c8f031"),
  cyan: new Color("rgb(80,220,255)"),
};

const TUBE = 0.12;
const RADIUS = 0.5;
const STRETCH = 1.6;
/** Paso entre eslabones encastrados (largo interior del eslabón). */
const PITCH = (RADIUS - TUBE) * STRETCH * 2 * 0.98;
/** Píxeles de scroll que avanza la cadena un eslabón. */
const SCROLL_PER_LINK = 70;
/** Cuánto se tiñe el cromo con el color de la sección (0 = plateado puro). */
const TINT_AMOUNT = 0.4;

/** Matcap de cromo: cielo claro arriba, horizonte oscuro, piso reflejado y un brillo especular. */
function chromeMatcap(): CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = size / 2;
  g.beginPath();
  g.arc(r, r, r, 0, Math.PI * 2);
  g.clip();
  const body = g.createLinearGradient(0, 0, 0, size);
  body.addColorStop(0, "#ffffff");
  body.addColorStop(0.28, "#d9dde3");
  body.addColorStop(0.46, "#5b6068");
  body.addColorStop(0.52, "#1c1f24");
  body.addColorStop(0.58, "#8a9099");
  body.addColorStop(0.8, "#e4e8ed");
  body.addColorStop(1, "#7d838c");
  g.fillStyle = body;
  g.fillRect(0, 0, size, size);
  // Oscurece el borde (efecto Fresnel invertido del cromo).
  const rim = g.createRadialGradient(r, r, r * 0.55, r, r, r);
  rim.addColorStop(0, "rgba(0,0,0,0)");
  rim.addColorStop(1, "rgba(10,12,15,0.55)");
  g.fillStyle = rim;
  g.fillRect(0, 0, size, size);
  // Brillo especular.
  const spec = g.createRadialGradient(r * 0.62, r * 0.5, 0, r * 0.62, r * 0.5, r * 0.42);
  spec.addColorStop(0, "rgba(255,255,255,1)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = spec;
  g.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function pathFor(width: number, height: number, mobile: boolean): Vector3[] {
  // Coordenadas normalizadas (x: -1 izquierda … 1 derecha; y: 1 arriba … -1 abajo), sesgadas a la derecha
  // para no competir con los textos. En móvil la cadena asoma por el borde derecho.
  const pts = mobile
    ? [
        [1.9, 1.35, -2],
        [1.2, 0.9, 0.5],
        [0.92, 0.45, 1.2],
        [1.2, 0.05, -0.5],
        [1.7, -0.25, -2],
        [1.18, -0.55, 0.8],
        [0.9, -0.95, 1.2],
        [1.35, -1.4, -1],
      ]
    : [
        [1.45, 1.35, -3],
        [0.78, 0.82, 0],
        [0.3, 0.42, 2],
        [0.5, -0.02, 0.5],
        [1.0, -0.28, -2],
        [0.62, -0.62, 0.8],
        [0.18, -0.92, 2],
        [0.45, -1.4, -1.5],
      ];
  return pts.map(([x, y, z]) => new Vector3((x! * width) / 2, (y! * height) / 2, z!));
}

export function mountChain(container: HTMLElement): () => void {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: window.devicePixelRatio < 2, alpha: true, powerPreference: "low-power" });
  } catch {
    return () => {}; // sin WebGL: el sitio funciona igual, sin la cadena
  }

  // Sin aceleración por hardware (render por software): modo liviano. La cadena se ve igual, pero solo se
  // redibuja al hacer scroll (sin animación continua) y a resolución 1x, para no trabar el equipo.
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  const software = /swiftshader|llvmpipe|software|basic render/i.test(gpu);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 767px)");
  renderer.setPixelRatio(software ? 1 : Math.min(window.devicePixelRatio, mobileQuery.matches ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.opacity = "0";
  canvas.style.transition = "opacity 1.2s ease";
  container.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  const matcap = chromeMatcap();
  const material = new MeshMatcapMaterial({ matcap, color: new Color("#ffffff") });
  let geometry: TorusGeometry | null = null;
  let mesh: InstancedMesh | null = null;
  let curve: CatmullRomCurve3 | null = null;
  let count = 0;

  const up = new Vector3(0, 1, 0);
  const tmpQ = new Quaternion();
  const twistQ = new Quaternion();
  const scaleV = new Vector3(1, STRETCH, 1);
  const matrix = new Matrix4();
  const pos = new Vector3();
  const tangent = new Vector3();

  function build() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const mobile = mobileQuery.matches;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Alto visible del mundo: en móvil se ve "más lejos" para que los eslabones sean más chicos.
    const worldH = mobile ? 21 : 12.5;
    camera.position.set(0, 0, worldH / (2 * Math.tan((camera.fov * Math.PI) / 360)));
    camera.updateProjectionMatrix();

    const worldW = worldH * camera.aspect;
    curve = new CatmullRomCurve3(pathFor(worldW, worldH, mobile), false, "catmullrom", 0.5);
    const nextCount = Math.min(140, Math.max(24, Math.round(curve.getLength() / PITCH)));

    if (!mesh || nextCount !== count) {
      if (mesh) {
        scene.remove(mesh);
        mesh.dispose();
      }
      geometry?.dispose();
      geometry = new TorusGeometry(RADIUS, TUBE, mobile || software ? 12 : 18, mobile || software ? 28 : 44);
      count = nextCount;
      mesh = new InstancedMesh(geometry, material, count);
      scene.add(mesh);
    }
  }

  function place(offset: number) {
    if (!mesh || !curve) return;
    for (let i = 0; i < count; i++) {
      const t = (((i / count + offset) % 1) + 1) % 1;
      curve.getPointAt(t, pos);
      curve.getTangentAt(t, tangent).normalize();
      tmpQ.setFromUnitVectors(up, tangent);
      // Cada segundo eslabón gira 90° alrededor de la tangente: así encastran.
      if (i % 2 === 1) {
        twistQ.setFromAxisAngle(tangent, Math.PI / 2);
        tmpQ.premultiply(twistQ);
      }
      matrix.compose(pos, tmpQ, scaleV);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  // Tinte según la sección que ocupa el centro de la pantalla.
  const white = new Color("#ffffff");
  const targetTint = new Color("#ffffff");
  function pickTint() {
    const y = window.innerHeight * 0.5;
    const sections = document.querySelectorAll<HTMLElement>("[data-chain-light]");
    let name = "white";
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom >= y) name = s.dataset.chainLight ?? "white";
    }
    targetTint.copy(white).lerp(TINTS[name] ?? white, TINT_AMOUNT);
  }

  let offset = 0;
  let drift = 0;
  let frame = 0;
  let last = performance.now();
  let running = false;
  let lastScrollAt = performance.now();

  function scrollTarget() {
    return window.scrollY / SCROLL_PER_LINK / Math.max(count, 1);
  }

  function render() {
    renderer.render(scene, camera);
  }

  // Cuadros por segundo: 60 en escritorio, 30 en el celular; quieta (sin scroll) baja a ~20.
  const minFrameMs = mobileQuery.matches ? 33 : 16;

  function tick(now: number) {
    frame = requestAnimationFrame(tick);
    const idle = now - lastScrollAt > 1500;
    if (now - last < (idle ? 50 : minFrameMs)) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    drift += dt * 0.0035; // la cadena "respira" muy despacio aunque no se scrollee
    offset += (scrollTarget() + drift - offset) * Math.min(1, dt * 6);
    material.color.lerp(targetTint, Math.min(1, dt * 2.5));
    place(offset);
    render();
  }

  function start() {
    if (running || software || reduceMotion.matches || document.hidden) return;
    running = true;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  /**
   * Un único cuadro, sin animación. Con "reducir movimiento" la cadena queda quieta (solo cambia el tinte);
   * en modo liviano (render por software) sigue al scroll pero sin suavizado ni movimiento propio.
   */
  let pending = false;
  function renderStatic(followScroll: boolean) {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      pickTint();
      material.color.copy(targetTint);
      if (followScroll) offset = scrollTarget();
      place(offset);
      render();
    });
  }

  build();
  pickTint();
  material.color.copy(targetTint);
  offset = scrollTarget();
  place(offset);
  render();
  requestAnimationFrame(() => (canvas.style.opacity = "1"));
  start();

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      build();
      place(offset);
      render();
    }, 150);
  };
  const onScroll = () => {
    lastScrollAt = performance.now();
    pickTint();
    if (reduceMotion.matches) renderStatic(false);
    else if (software) renderStatic(true);
  };
  const onVisibility = () => (document.hidden ? stop() : start());
  const onMotionChange = () => (reduceMotion.matches ? (stop(), renderStatic(false)) : start());

  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  reduceMotion.addEventListener("change", onMotionChange);

  return () => {
    stop();
    window.clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    reduceMotion.removeEventListener("change", onMotionChange);
    mesh?.dispose();
    geometry?.dispose();
    material.dispose();
    matcap.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
