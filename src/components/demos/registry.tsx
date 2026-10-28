"use client";

import dynamic from "next/dynamic";
import type { DemoKey } from "@/content/projects";
import DemoBoundary from "./DemoBoundary";

const Loading = () => (
  <div className="demo-loading" role="status">
    <span className="spinner" aria-hidden="true" />
    Cargando demostración
  </div>
);

// Cada demo se carga solo cuando se necesita (mejor rendimiento inicial).
const demos: Record<DemoKey, React.ComponentType> = {
  reportes: dynamic(() => import("./ReportAutomation"), { ssr: false, loading: Loading }),
  laboratorio: dynamic(() => import("./DataLab"), { ssr: false, loading: Loading }),
  ia: dynamic(() => import("./AIAssist"), { ssr: false, loading: Loading }),
  gestion: dynamic(() => import("./InternalApp"), { ssr: false, loading: Loading }),
  bi: dynamic(() => import("./BIDashboard"), { ssr: false, loading: Loading }),
};

export default function Demo({ name }: { name: DemoKey }) {
  const C = demos[name];
  return (
    <DemoBoundary>
      <C />
    </DemoBoundary>
  );
}
