"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { CvButton, EmailLink, GitHubLink, LinkedInLink } from "./ProfileLinks";
import { IconAlert, IconCheck } from "./icons";

type State = "idle" | "sending" | "sent" | "error";
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", company: "", message: "", website: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<State>("idle");
  const [err, setErr] = useState("");

  const canSend = Boolean(site.contactEndpoint || site.email);

  const errors: Record<string, string> = {};
  if (f.name.trim().length < 2) errors.name = "Escribe tu nombre.";
  if (!emailRe.test(f.email.trim())) errors.email = "Escribe un correo válido, por ejemplo nombre@empresa.com.";
  if (f.message.trim().length < 15) errors.message = "Cuéntame un poco más (mínimo 15 caracteres).";
  const show = (k: string) => touched[k] && errors[k];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errors).length || !canSend) return;
    if (f.website) return; // campo trampa contra bots

    if (site.contactEndpoint) {
      setState("sending");
      try {
        const res = await fetch(site.contactEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ nombre: f.name, correo: f.email, empresa: f.company, mensaje: f.message }),
        });
        if (!res.ok) throw new Error(`El servicio respondió ${res.status}`);
        setState("sent");
        setF({ name: "", email: "", company: "", message: "", website: "" });
        setTouched({});
      } catch {
        setErr("No se pudo enviar el mensaje. Revisa tu conexión e intenta de nuevo.");
        setState("error");
      }
      return;
    }
    // Sin backend: abre el cliente de correo con el mensaje redactado.
    const subject = encodeURIComponent(`Contacto desde el portafolio: ${f.name}${f.company ? `, ${f.company}` : ""}`);
    const body = encodeURIComponent(`${f.message}\n\n${f.name}\n${f.email}${f.company ? `\n${f.company}` : ""}`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setState("sent");
  };

  return (
    <section className="section contact-section" id="contacto" aria-labelledby="contacto-title">
      <div className="container contact">
        <div className="contact-copy">
          <h2 id="contacto-title">Conversemos</h2>
          <p>
            Si tu equipo necesita convertir procesos manuales en herramientas, ordenar sus datos o automatizar reportes,
            me encantará platicar sobre la oportunidad, el proyecto o el puesto.
          </p>
          <div className="contact-links">
            <EmailLink className="btn" />
            <LinkedInLink className="btn" />
            <GitHubLink className="btn" />
            <CvButton className="btn btn-primary" />
          </div>
        </div>

        <form className="contact-form window" onSubmit={submit} noValidate>
          <div className="window-bar">
            <span className="window-title">nuevo_mensaje</span>
          </div>
          <div className="contact-form-body">
            {!canSend && (
              <div className="alert alert-warn" role="note">
                <IconAlert />
                <p>
                  Formulario en preparación: se activa al configurar el correo de contacto o un servicio de envío.
                </p>
              </div>
            )}
            <fieldset disabled={!canSend || state === "sending"}>
              <legend className="sr-only">Datos de contacto</legend>
              <div className="field-row">
                <label className={`field${show("name") ? " invalid" : ""}`}>
                  <span>Nombre</span>
                  <input
                    autoComplete="name"
                    value={f.name}
                    onChange={(e) => setF({ ...f, name: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    aria-invalid={!!show("name")}
                    aria-describedby="c-err-name"
                  />
                  {show("name") && <em id="c-err-name">{errors.name}</em>}
                </label>
                <label className={`field${show("email") ? " invalid" : ""}`}>
                  <span>Correo</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={f.email}
                    onChange={(e) => setF({ ...f, email: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    aria-invalid={!!show("email")}
                    aria-describedby="c-err-email"
                  />
                  {show("email") && <em id="c-err-email">{errors.email}</em>}
                </label>
              </div>
              <label className="field">
                <span>Empresa (opcional)</span>
                <input autoComplete="organization" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} />
              </label>
              <label className={`field${show("message") ? " invalid" : ""}`}>
                <span>Mensaje</span>
                <textarea
                  rows={4}
                  value={f.message}
                  onChange={(e) => setF({ ...f, message: e.target.value })}
                  onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                  aria-invalid={!!show("message")}
                  aria-describedby="c-err-message"
                />
                {show("message") && <em id="c-err-message">{errors.message}</em>}
              </label>
              <label className="sr-only" aria-hidden="true">
                Sitio web
                <input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
              </label>
              <button className="btn btn-primary" type="submit">
                {state === "sending" ? <span className="spinner" aria-hidden="true" /> : null}
                {state === "sending" ? "Enviando..." : "Enviar mensaje"}
              </button>
            </fieldset>
            <div aria-live="polite">
              {state === "sent" && (
                <div className="alert alert-ok">
                  <IconCheck />
                  <p>{site.contactEndpoint ? "Mensaje enviado. Te responderé pronto." : "Se abrió tu aplicación de correo con el mensaje listo para enviar."}</p>
                </div>
              )}
              {state === "error" && (
                <div className="alert alert-error" role="alert">
                  <IconAlert />
                  <p>{err}</p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
