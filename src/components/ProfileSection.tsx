import { profile } from "@/content/profile";
import { site } from "@/content/site";

export default function ProfileSection() {
  return (
    <section className="section" id="perfil" aria-labelledby="perfil-title">
      <div className={`container profile-grid${site.photo ? " has-photo" : ""}`}>
        {site.photo && (
          <figure className="profile-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.photo} alt={`Fotografía de ${site.name}`} width={560} height={700} loading="lazy" decoding="async" />
            <figcaption>
              <strong>{site.name}</strong>
              <span>{site.photoCaption}</span>
            </figcaption>
          </figure>
        )}
        <div className="profile-text">
          <h2 id="perfil-title">{profile.title}</h2>
          {profile.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="profile-ledger" aria-labelledby="ledger-title">
          <h3 id="ledger-title">En qué he trabajado</h3>
          <ul>
            {profile.activities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
