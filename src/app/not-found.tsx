import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="contenido" className="container not-found">
        <h1>Esta página no existe</h1>
        <p>Puede que el enlace esté incompleto. Vuelve al inicio para ver los proyectos.</p>
        <Link className="btn btn-primary" href="/">Ir al inicio</Link>
      </main>
    </>
  );
}
