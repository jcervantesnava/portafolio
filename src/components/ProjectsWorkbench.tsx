"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { projects, statusLabel } from "@/content/projects";
import Demo from "./demos/registry";
import { IconArrowRight } from "./icons";

export default function ProjectsWorkbench() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const p = projects[active];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % projects.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + projects.length) % projects.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = projects.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="section workbench-section" id="proyectos" aria-labelledby="proyectos-title">
      <div className="container">
        <div className="section-head">
          <h2 id="proyectos-title">Proyectos y demostraciones</h2>
          <p>
            Cinco herramientas que puedes usar aquí mismo. Son demostraciones con datos sintéticos que
            representan el tipo de soluciones que construyo; cada una tiene su caso completo con el
            problema, las decisiones técnicas y lo aprendido.
          </p>
        </div>

        <div className="workbench">
          <div className="workbench-tabs" role="tablist" aria-label="Proyectos" aria-orientation="vertical">
            {projects.map((proj, i) => (
              <button
                key={proj.slug}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`tab-${proj.slug}`}
                aria-selected={i === active}
                aria-controls={`panel-${proj.slug}`}
                tabIndex={i === active ? 0 : -1}
                className="workbench-tab"
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="workbench-tab-key" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="workbench-tab-text">
                  <span className="workbench-tab-title">{proj.title}</span>
                  <span className="workbench-tab-tech">{proj.tech.slice(0, 3).join(", ")}</span>
                </span>
              </button>
            ))}
          </div>

          <div
            className="workbench-panel"
            role="tabpanel"
            id={`panel-${p.slug}`}
            aria-labelledby={`tab-${p.slug}`}
          >
            <div className="workbench-panel-head">
              <div>
                <span className={`status status-${p.status}`}>{statusLabel[p.status]}</span>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
              </div>
              <Link className="btn btn-sm" href={`/proyectos/${p.slug}/`}>
                Ver caso completo
                <IconArrowRight />
              </Link>
            </div>
            {p.demo && (
              <div className="workbench-demo" key={p.slug}>
                <Demo name={p.demo} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
