import { site } from "@/content/site";
import { IconDownload, IconGitHub, IconLinkedIn, IconMail } from "./icons";

/**
 * Botones que dependen de datos personales. Si el dato aún no está en
 * src/content/site.ts, el botón se muestra deshabilitado y lo dice.
 */

export function CvButton({ className = "btn" }: { className?: string }) {
  if (site.cvPath) {
    return (
      <a className={className} href={site.cvPath} download>
        <IconDownload />
        Descargar CV en PDF
      </a>
    );
  }
  return (
    <span className={className} aria-disabled="true" title="El CV en PDF se publicará pronto">
      <IconDownload />
      CV en PDF pendiente
    </span>
  );
}

export function LinkedInLink({ className = "btn btn-ghost" }: { className?: string }) {
  if (site.linkedin) {
    return (
      <a className={className} href={site.linkedin} target="_blank" rel="noopener noreferrer">
        <IconLinkedIn />
        LinkedIn
      </a>
    );
  }
  return (
    <span className={className} aria-disabled="true" title="Enlace de LinkedIn pendiente">
      <IconLinkedIn />
      LinkedIn pendiente
    </span>
  );
}

export function GitHubLink({ className = "btn btn-ghost" }: { className?: string }) {
  if (site.github) {
    return (
      <a className={className} href={site.github} target="_blank" rel="noopener noreferrer">
        <IconGitHub />
        GitHub
      </a>
    );
  }
  return (
    <span className={className} aria-disabled="true" title="Enlace de GitHub pendiente">
      <IconGitHub />
      GitHub pendiente
    </span>
  );
}

export function EmailLink({ className = "btn btn-ghost" }: { className?: string }) {
  if (site.email) {
    return (
      <a className={className} href={`mailto:${site.email}`}>
        <IconMail />
        {site.email}
      </a>
    );
  }
  return (
    <span className={className} aria-disabled="true" title="Correo profesional pendiente">
      <IconMail />
      Correo pendiente
    </span>
  );
}
