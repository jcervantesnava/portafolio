"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { IconClose, IconMenu } from "./icons";

const links = [
  { id: "perfil", label: "Perfil" },
  { id: "proyectos", label: "Proyectos" },
  { id: "proceso", label: "Cómo trabajo" },
  { id: "habilidades", label: "Habilidades" },
  { id: "trayectoria", label: "Trayectoria" },
  { id: "contacto", label: "Contacto" },
];

export default function Header({ home = false }: { home?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!home || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [home]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <nav className="container" aria-label="Principal">
        <a className="brand" href={home ? "#inicio" : "/"}>
          <span className="brand-mark" aria-hidden="true">
            JC
          </span>
          <span>{site.shortName}</span>
        </a>
        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
        <ul className="nav-links" id="nav-links" data-open={open}>
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={home ? `#${l.id}` : `/#${l.id}`}
                aria-current={active === l.id ? "true" : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
