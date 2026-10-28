import { skillGroups } from "@/content/profile";

export default function Skills() {
  return (
    <section className="section" id="habilidades" aria-labelledby="habilidades-title">
      <div className="container">
        <div className="section-head">
          <h2 id="habilidades-title">Habilidades tecnológicas</h2>
          <p>Organizadas por área y acompañadas de cómo las uso. Sin porcentajes: el trabajo de arriba es la mejor medida.</p>
        </div>
        <div className="skills">
          {skillGroups.map((g) => (
            <article key={g.area} className={`skill-group accent-${g.accent}`}>
              <h3>{g.area}</h3>
              <ul className="skill-items">
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <p className="skill-example">{g.example}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
