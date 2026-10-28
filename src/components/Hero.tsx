import { site } from "@/content/site";
import Pipeline from "./Pipeline";
import { CvButton, LinkedInLink } from "./ProfileLinks";
import { IconMail } from "./icons";

export default function Hero() {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title">
            <span className="hero-name">{site.name}</span>
            <span className="hero-headline">{site.headline}</span>
          </h1>
          <div className="hero-role">
            <span className="hero-role-title">{site.role}</span>
            <ul className="hero-focus" aria-label="Enfoque">
              {site.focus.map((f) => (
                <li key={f} className="chip">
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="hero-intro">{site.intro}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#proyectos">
              Explorar proyectos
            </a>
            <CvButton />
            <a className="btn" href="#contacto">
              <IconMail />
              Contactarme
            </a>
            <LinkedInLink />
          </div>
        </div>
        <div className="hero-visual">
          <Pipeline />
          <p className="hero-visual-note">Elige un nodo para ver qué ocurre en cada etapa.</p>
        </div>
      </div>
    </section>
  );
}
