import { education, experience } from "@/content/profile";

const Pending = ({ children = "Pendiente" }: { children?: React.ReactNode }) => (
  <span className="status status-pending">{children}</span>
);

export default function Timeline() {
  return (
    <section className="section" id="trayectoria" aria-labelledby="trayectoria-title">
      <div className="container trajectory">
        <div>
          <div className="section-head">
            <h2 id="trayectoria-title">Trayectoria</h2>
            <p>Experiencia profesional, de la más reciente a la más antigua.</p>
          </div>
          <ol className="timeline">
            {experience.map((e, i) => (
              <li key={i} className="timeline-item">
                <div className="timeline-meta">{e.period ?? <Pending>Fechas pendientes</Pending>}</div>
                <div className="timeline-body">
                  <h3>{e.role ?? <Pending>Puesto pendiente</Pending>}</h3>
                  <p className="timeline-company">{e.company ?? <Pending>Empresa pendiente</Pending>}</p>
                  {e.highlights.length > 0 ? (
                    <ul>
                      {e.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted-small">Responsabilidades pendientes de capturar desde el CV.</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="education" aria-labelledby="formacion-title">
          <h3 id="formacion-title">Formación y certificaciones</h3>
          <ul>
            {education.map((ed, i) => (
              <li key={i}>
                <span className="edu-kind">{ed.kind === "formacion" ? "Formación" : "Certificación"}</span>
                <strong>{ed.title ?? <Pending />}</strong>
                {(ed.institution || ed.period) && (
                  <span className="muted-small">{[ed.institution, ed.period].filter(Boolean).join(", ")}</span>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
