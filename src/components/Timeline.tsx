import { education, experience, languages } from "@/content/profile";

const Pending = ({ children = "Pendiente" }: { children?: React.ReactNode }) => (
  <span className="status status-pending">{children}</span>
);

export default function Timeline() {
  const formacion = education.filter((e) => e.kind === "formacion");
  const certificaciones = education.filter((e) => e.kind === "certificacion");

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
                  {e.groups.map((g, gi) => (
                    <div key={gi} className="timeline-group">
                      {g.title && <h4>{g.title}</h4>}
                      <ul>
                        {g.items.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="education" aria-labelledby="formacion-title">
          <h3 id="formacion-title">Formación y certificaciones</h3>
          <ul>
            {formacion.map((ed) => (
              <li key={ed.title}>
                <span className="edu-kind">Formación</span>
                <strong>{ed.title}</strong>
                {ed.detail && <span>{ed.detail}</span>}
                <span className="muted-small">{[ed.institution, ed.period].filter(Boolean).join(", ")}</span>
              </li>
            ))}
            {certificaciones.map((ed) => (
              <li key={ed.title}>
                <span className="edu-kind">Certificación</span>
                <strong>{ed.title}</strong>
                <span className="muted-small">{[ed.institution, ed.period].filter(Boolean).join(", ")}</span>
              </li>
            ))}
          </ul>
          <div className="languages">
            <h4>Idiomas</h4>
            <dl>
              {languages.map((l) => (
                <div key={l.name}>
                  <dt>{l.name}</dt>
                  <dd>{l.level}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}
