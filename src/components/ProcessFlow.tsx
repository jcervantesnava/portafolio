"use client";

import { useEffect, useRef, useState } from "react";
import { processSteps } from "@/content/profile";

const glyphs: Record<string, React.ReactNode> = {
  problem: (
    <>
      <rect x="6" y="10" width="30" height="5" rx="1.5" />
      <rect x="6" y="19" width="22" height="5" rx="1.5" className="hi" />
      <rect x="6" y="28" width="26" height="5" rx="1.5" />
      <circle cx="38" cy="28" r="8" className="stroke" />
      <path d="m44 34 6 6" className="stroke" />
    </>
  ),
  data: (
    <>
      <rect x="6" y="8" width="44" height="36" rx="3" className="stroke" />
      <path d="M6 18h44M6 28h44M20 8v36M35 8v36" className="stroke thin" />
      <rect x="21" y="19" width="13" height="8" className="hi" />
    </>
  ),
  design: (
    <>
      <rect x="4" y="18" width="14" height="14" rx="3" className="stroke" />
      <rect x="38" y="6" width="14" height="14" rx="3" className="stroke" />
      <rect x="38" y="30" width="14" height="14" rx="3" className="hi" />
      <path d="M18 25h10m0-12v24m0-24h10M28 37h10" className="stroke thin" />
    </>
  ),
  code: (
    <>
      <path d="m18 14-10 11 10 11M38 14l10 11-10 11" className="stroke" />
      <path d="m31 10-6 30" className="stroke hi-stroke" />
    </>
  ),
  test: (
    <>
      <path d="M28 8v34M14 42h28M10 16h36" className="stroke" />
      <path d="M10 16 4 30h12zM46 16l-6 14h12z" className="stroke thin" />
      <circle cx="28" cy="8" r="3" className="hi" />
    </>
  ),
  ship: (
    <>
      <path d="M8 20 28 10l20 10v18L28 48 8 38z" className="stroke" />
      <path d="M8 20l20 10 20-10M28 30v18" className="stroke thin" />
      <path d="M28 30 48 20" className="stroke hi-stroke" />
    </>
  ),
  loop: (
    <>
      <path d="M44 22a17 17 0 0 0-31-6m-1 16a17 17 0 0 0 31 6" className="stroke" />
      <path d="M12 8v8h8M44 46v-8h-8" className="stroke hi-stroke" />
    </>
  ),
};

export default function ProcessFlow() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // Recorre los pasos una vez cuando la sección entra en pantalla.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    let timer: number | undefined;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        let i = 0;
        timer = window.setInterval(() => {
          i++;
          if (i >= processSteps.length) {
            window.clearInterval(timer);
            return;
          }
          setActive((cur) => (cur === i - 1 ? i : cur));
        }, 900);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, []);

  const step = processSteps[active];

  return (
    <section className="section" id="proceso" aria-labelledby="proceso-title">
      <div className="container">
        <div className="section-head">
          <h2 id="proceso-title">De la idea a la solución</h2>
          <p>
            Así abordo un problema: empiezo por entender cómo trabaja el área y termino cuando la herramienta se usa y
            los números cuadran.
          </p>
        </div>

        <div className="process" ref={ref}>
          <ol className="process-track">
            {processSteps.map((s, i) => (
              <li key={s.title} data-state={i < active ? "done" : i === active ? "active" : "todo"}>
                <button
                  onClick={() => {
                    setActive(i);
                  }}
                  aria-pressed={i === active}
                >
                  <span className="process-n">{i + 1}</span>
                  <span className="process-label">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="process-detail" aria-live="polite">
            <svg viewBox="0 0 56 52" className="process-glyph" aria-hidden="true">
              {glyphs[step.visual]}
            </svg>
            <div>
              <h3>
                <span className="process-n-inline">Paso {active + 1} de {processSteps.length}</span>
                {step.title}
              </h3>
              <p>{step.text}</p>
              <div className="process-nav">
                <button className="btn btn-sm" disabled={active === 0} onClick={() => setActive((a) => a - 1)}>
                  Anterior
                </button>
                <button
                  className="btn btn-sm"
                  disabled={active === processSteps.length - 1}
                  onClick={() => setActive((a) => a + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
