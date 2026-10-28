import Link from "next/link";
import Demo from "@/components/demos/registry";
import { IconArrowLeft, IconArrowRight, IconExternal, IconGitHub } from "@/components/icons";
import { projects, statusLabel, statusNote, type Project } from "@/content/projects";

/** Contenido de la página de detalle de un proyecto. */
export default function ProjectCase({ p }: { p: Project }) {
  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];
  return (
    <div className="container">
      <Link className="btn btn-ghost back-link" href="/#proyectos">
        <IconArrowLeft /> Todos los proyectos
      </Link>

      <header className="project-hero">
        <span className={`status status-${p.status}`}>{statusLabel[p.status]}</span>
        <h1>{p.title}</h1>
        <p className="project-lede">{p.summary}</p>
        <p className="project-status-note">{statusNote[p.status]}</p>
        <ul className="project-tech" aria-label="Tecnologías">
          {p.tech.map((t) => (
            <li key={t} className="chip">{t}</li>
          ))}
        </ul>
        {(p.repoUrl || p.demoUrl) && (
          <div className="project-links">
            {p.repoUrl && (
              <a className="btn" href={p.repoUrl} target="_blank" rel="noopener noreferrer"><IconGitHub /> Repositorio</a>
            )}
            {p.demoUrl && (
              <a className="btn" href={p.demoUrl} target="_blank" rel="noopener noreferrer"><IconExternal /> Demo en línea</a>
            )}
          </div>
        )}
      </header>

      <div className="case-grid">
        <section className="case-block">
          <h2>El problema</h2>
          <p>{p.problem}</p>
        </section>
        <section className="case-block">
          <h2>El objetivo</h2>
          <p>{p.objective}</p>
        </section>
      </div>

      <section className="case-block case-solution">
        <h2>La solución</h2>
        <ul>{p.solution.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>

      {p.demo && (
        <section className="case-demo" aria-labelledby="demo-title">
          <h2 id="demo-title">Pruébalo</h2>
          <Demo name={p.demo} />
        </section>
      )}

      {p.images && p.images.length > 0 && (
        <section className="case-block">
          <h2>Capturas</h2>
          <div className="case-images">
            {p.images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img.src} src={img.src} alt={img.alt} loading="lazy" />
            ))}
          </div>
        </section>
      )}

      <section className="case-block">
        <h2>Decisiones técnicas</h2>
        <dl className="decisions">
          {p.decisions.map((d) => (
            <div key={d.title}>
              <dt>{d.title}</dt>
              <dd>{d.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="case-grid">
        <section className="case-block">
          <h2>Aprendizajes</h2>
          <ul>{p.learnings.map((l) => <li key={l}>{l}</li>)}</ul>
        </section>
        <section className="case-block">
          <h2>{p.status === "real" ? "Beneficios" : "Beneficios potenciales"}</h2>
          <ul>{p.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
        </section>
      </div>

      <nav className="next-project" aria-label="Siguiente proyecto">
        <span className="muted-small">Siguiente</span>
        <Link href={`/proyectos/${next.slug}/`}>
          {next.title} <IconArrowRight />
        </Link>
      </nav>
    </div>
  );
}
