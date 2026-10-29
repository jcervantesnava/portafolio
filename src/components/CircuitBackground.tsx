"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo de circuitos tipo HUD: un chip central del que salen pistas que se
 * van encendiendo al cargar la página; después viajan pulsos de luz por ellas.
 * - La capa estática se dibuja una sola vez (rendimiento).
 * - Se pausa con la pestaña oculta y respeta "reducir movimiento".
 */

type Pt = { x: number; y: number };
interface Trace {
  pts: Pt[];
  len: number;
  segs: number[]; // longitud acumulada por punto
  delay: number; // retraso del encendido (s)
  end: "chip" | "dot" | "pad";
}
interface Pulse {
  t: number; // índice de pista
  pos: number; // distancia recorrida
  speed: number;
}

const CYAN = "58, 214, 224";
const BLUE = "76, 141, 255";

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(W: number, H: number) {
  const r = rng(7);
  const mobile = W < 760;
  const cx = mobile ? W * 0.5 : W * 0.5;
  const cy = mobile ? H * 0.34 : H * 0.46;
  const chip = mobile ? 26 : 34;
  const step = mobile ? 9 : 12;
  const traces: Trace[] = [];
  const perSide = mobile ? 6 : 9;
  const dirs: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  dirs.forEach(([dx, dy], di) => {
    for (let i = 0; i < perSide; i++) {
      const off = (i - (perSide - 1) / 2) * (chip * 1.7 / perSide);
      let x = cx + dx * chip + (dy !== 0 ? off : 0);
      let y = cy + dy * chip + (dx !== 0 ? off : 0);
      const pts: Pt[] = [{ x, y }];
      let ddx = dx;
      let ddy = dy;
      const maxLen = (dx !== 0 ? W * 0.5 : H * 0.55) * (0.45 + r() * 0.6);
      let travelled = 0;
      let straight = 3 + Math.floor(r() * 6);
      // abre en abanico: las pistas exteriores se separan del centro
      const fan = Math.sign(off) || (r() > 0.5 ? 1 : -1);
      while (travelled < maxLen) {
        const n = straight * step;
        x += ddx * n;
        y += ddy * n;
        travelled += n * Math.hypot(ddx, ddy);
        pts.push({ x, y });
        straight = 2 + Math.floor(r() * 7);
        // alterna entre recto y diagonal de 45°
        if (ddx !== 0 && ddy !== 0) {
          ddx = dx;
          ddy = dy;
        } else if (r() < 0.55) {
          if (dx !== 0) {
            ddx = dx;
            ddy = fan;
          } else {
            ddx = fan;
            ddy = dy;
          }
          straight = 1 + Math.floor(r() * 3);
        }
      }
      const segs = [0];
      for (let k = 1; k < pts.length; k++) segs.push(segs[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
      traces.push({
        pts,
        len: segs[segs.length - 1],
        segs,
        delay: 0.15 + (di * perSide + i) * 0.035 + r() * 0.25,
        end: r() < 0.25 ? "chip" : r() < 0.6 ? "pad" : "dot",
      });
    }
  });

  // Paneles HUD dispersos (rectángulos con líneas), lejos del centro
  const panels: { x: number; y: number; w: number; h: number; rows: number }[] = [];
  const nPanels = mobile ? 5 : 12;
  for (let i = 0; i < nPanels; i++) {
    const w = 40 + r() * 70;
    const h = 30 + r() * 60;
    const x = r() * (W - w);
    const y = r() * (H - h);
    if (Math.hypot(x + w / 2 - cx, y + h / 2 - cy) < chip * 5) continue;
    panels.push({ x, y, w, h, rows: 2 + Math.floor(r() * 5) });
  }
  // Anillos sueltos
  const rings: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < (mobile ? 2 : 5); i++) rings.push({ x: r() * W, y: r() * H, r: 10 + r() * 22 });

  return { cx, cy, chip, traces, panels, rings };
}

function pointAt(t: Trace, d: number): Pt {
  const s = t.segs;
  let k = 1;
  while (k < s.length - 1 && s[k] < d) k++;
  const a = t.pts[k - 1];
  const b = t.pts[k];
  const seg = s[k] - s[k - 1] || 1;
  const f = Math.min(1, Math.max(0, (d - s[k - 1]) / seg));
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

function strokePartial(ctx: CanvasRenderingContext2D, t: Trace, upto: number) {
  ctx.beginPath();
  ctx.moveTo(t.pts[0].x, t.pts[0].y);
  for (let k = 1; k < t.pts.length; k++) {
    if (t.segs[k] <= upto) ctx.lineTo(t.pts[k].x, t.pts[k].y);
    else {
      const p = pointAt(t, upto);
      ctx.lineTo(p.x, p.y);
      break;
    }
  }
  ctx.stroke();
}

export default function CircuitBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let scene = build(1, 1);
    let staticLayer: HTMLCanvasElement | null = null;
    let raf = 0;
    let start = performance.now();
    let last = 0;
    const pulses: Pulse[] = [];

    const drawStatic = () => {
      const off = document.createElement("canvas");
      off.width = W * dpr;
      off.height = H * dpr;
      const c = off.getContext("2d")!;
      c.scale(dpr, dpr);
      // pistas tenues
      c.lineWidth = 1;
      c.strokeStyle = `rgba(${CYAN}, 0.10)`;
      scene.traces.forEach((t) => strokePartial(c, t, t.len));
      // paneles
      scene.panels.forEach((p) => {
        c.strokeStyle = `rgba(${BLUE}, 0.14)`;
        c.strokeRect(p.x + 0.5, p.y + 0.5, p.w, p.h);
        c.fillStyle = `rgba(${CYAN}, 0.06)`;
        for (let i = 0; i < p.rows; i++) {
          const rw = (p.w - 12) * (0.35 + ((i * 37) % 60) / 100);
          c.fillRect(p.x + 6, p.y + 6 + i * ((p.h - 12) / p.rows), rw, Math.max(2, (p.h - 12) / p.rows - 4));
        }
      });
      scene.rings.forEach((g) => {
        c.strokeStyle = `rgba(${CYAN}, 0.12)`;
        c.beginPath();
        c.arc(g.x, g.y, g.r, 0.3, Math.PI * 1.7);
        c.stroke();
      });
      // cruces de rejilla
      c.strokeStyle = `rgba(149, 162, 185, 0.12)`;
      for (let x = 48; x < W; x += 192)
        for (let y = 48; y < H; y += 192) {
          c.beginPath();
          c.moveTo(x - 4, y);
          c.lineTo(x + 4, y);
          c.moveTo(x, y - 4);
          c.lineTo(x, y + 4);
          c.stroke();
        }
      staticLayer = off;
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      scene = build(W, H);
      pulses.length = 0;
      drawStatic();
      if (reduced) frame(performance.now(), true);
    };

    const endMark = (c: CanvasRenderingContext2D, t: Trace, a: number) => {
      const p = t.pts[t.pts.length - 1];
      c.fillStyle = `rgba(${CYAN}, ${a})`;
      c.strokeStyle = `rgba(${CYAN}, ${a})`;
      if (t.end === "dot") {
        c.beginPath();
        c.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        c.fill();
      } else if (t.end === "pad") {
        c.beginPath();
        c.arc(p.x, p.y, 4, 0, Math.PI * 2);
        c.stroke();
      } else {
        c.strokeRect(p.x - 6, p.y - 6, 12, 12);
        c.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
    };

    const frame = (now: number, force = false) => {
      raf = reduced ? 0 : requestAnimationFrame((n) => frame(n));
      if (!force && (document.hidden || now - last < 33)) return; // ~30 fps
      last = now;
      const time = (now - start) / 1000;
      // se atenúa al bajar por la página para no competir con el contenido
      const base = W < 760 ? 0.45 : 1;
      const fade = base * (1 - Math.min(1, window.scrollY / (H * 0.9)) * 0.72);
      canvas.style.opacity = String(fade);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (staticLayer) ctx.drawImage(staticLayer, 0, 0, W, H);

      const { cx, cy, chip, traces } = scene;
      const intro = reduced ? 99 : time;

      // pistas encendidas: crecen desde el chip hacia afuera
      ctx.lineWidth = 1.3;
      ctx.shadowColor = `rgba(${CYAN}, 0.8)`;
      traces.forEach((t) => {
        const prog = Math.min(1, Math.max(0, (intro - t.delay) / 1.4));
        if (prog <= 0) return;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = `rgba(${CYAN}, 0.32)`;
        strokePartial(ctx, t, t.len * prog);
        if (prog >= 1) endMark(ctx, t, 0.55);
        else {
          const p = pointAt(t, t.len * prog);
          ctx.fillStyle = `rgba(${CYAN}, 0.95)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // pulsos que viajan cuando ya todo encendió
      if (!reduced && intro > 2.5) {
        if (pulses.length < Math.min(14, traces.length / 3) && Math.random() < 0.12) {
          pulses.push({ t: Math.floor(Math.random() * traces.length), pos: 0, speed: 90 + Math.random() * 120 });
        }
        for (let i = pulses.length - 1; i >= 0; i--) {
          const pu = pulses[i];
          const tr = traces[pu.t];
          pu.pos += pu.speed / 30;
          if (pu.pos > tr.len + 40) {
            pulses.splice(i, 1);
            continue;
          }
          ctx.shadowBlur = 10;
          ctx.lineWidth = 1.8;
          const tail = Math.max(0, pu.pos - 46);
          const grad = ctx.createLinearGradient(pointAt(tr, tail).x, pointAt(tr, tail).y, pointAt(tr, pu.pos).x, pointAt(tr, pu.pos).y);
          grad.addColorStop(0, `rgba(${CYAN}, 0)`);
          grad.addColorStop(1, `rgba(${CYAN}, 0.95)`);
          ctx.strokeStyle = grad;
          ctx.beginPath();
          const steps = 6;
          for (let s = 0; s <= steps; s++) {
            const p = pointAt(tr, tail + ((Math.min(pu.pos, tr.len) - tail) * s) / steps);
            if (s === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        }
      }

      // chip central y anillos HUD
      ctx.shadowBlur = 14;
      const chipOn = Math.min(1, intro / 0.6);
      ctx.strokeStyle = `rgba(${CYAN}, ${0.85 * chipOn})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - chip, cy - chip, chip * 2, chip * 2);
      ctx.fillStyle = `rgba(6, 10, 19, 0.9)`;
      ctx.fillRect(cx - chip + 2, cy - chip + 2, chip * 2 - 4, chip * 2 - 4);
      ctx.fillStyle = `rgba(${CYAN}, ${0.9 * chipOn})`;
      ctx.fillRect(cx - chip * 0.45, cy - chip * 0.12, chip * 0.18, chip * 0.18);
      ctx.fillRect(cx + chip * 0.27, cy - chip * 0.12, chip * 0.18, chip * 0.18);
      ctx.fillRect(cx - chip * 0.3, cy + chip * 0.3, chip * 0.6, 1.5);

      ctx.shadowBlur = 8;
      ctx.lineWidth = 1.2;
      const spin = reduced ? 0 : time * 0.25;
      [chip * 2.6, chip * 3.4].forEach((rad, i) => {
        ctx.strokeStyle = `rgba(${CYAN}, ${(i === 0 ? 0.45 : 0.22) * chipOn})`;
        ctx.setLineDash(i === 0 ? [] : [3, 7]);
        ctx.beginPath();
        ctx.arc(cx, cy, rad, spin * (i === 0 ? 1 : -0.6), spin * (i === 0 ? 1 : -0.6) + Math.PI * (i === 0 ? 1.55 : 2));
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // velo a la izquierda para que el texto se lea sobre los circuitos
      if (W >= 1000) {
        const veil = ctx.createLinearGradient(0, 0, W * 0.47, 0);
        veil.addColorStop(0, "rgba(6, 10, 19, 0.82)");
        veil.addColorStop(0.75, "rgba(6, 10, 19, 0.55)");
        veil.addColorStop(1, "rgba(6, 10, 19, 0)");
        ctx.fillStyle = veil;
        ctx.fillRect(0, 0, W * 0.47, H);
      }
    };

    resize();
    if (!reduced) raf = requestAnimationFrame((n) => frame(n));
    let tm: number | undefined;
    const onResize = () => {
      clearTimeout(tm);
      tm = window.setTimeout(() => {
        resize();
        start = performance.now() - 3000; // sin repetir la intro al redimensionar
      }, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="circuit-bg" aria-hidden="true" />;
}
