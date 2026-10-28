import { profile } from "@/content/profile";

export default function ProfileSection() {
  return (
    <section className="section" id="perfil" aria-labelledby="perfil-title">
      <div className="container profile-grid">
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
