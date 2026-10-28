import type { AnchorHTMLAttributes } from "react";

// Vista previa de una sola página: convierte rutas en anclas (#).
export function toHash(href: string) {
  const m = href.match(/^\/proyectos\/([^/]+)\/?$/);
  if (m) return `#caso-${m[1]}`;
  if (href.startsWith("/#")) return href.slice(1);
  if (href === "/") return "#inicio";
  return href;
}

export default function Link({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={toHash(href)} {...rest} />;
}
