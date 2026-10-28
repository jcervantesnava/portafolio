/**
 * DATOS SINTÉTICOS. Generados con una semilla fija para que siempre den lo
 * mismo. Ninguna empresa, cliente, folio o importe corresponde a datos reales.
 */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const companies = [
  { id: "AUR", name: "Comercial Aurora (ficticia)", weight: 1.25 },
  { id: "NOR", name: "Distribuidora Norte (ficticia)", weight: 1 },
  { id: "PAC", name: "Servicios Pacífico (ficticia)", weight: 0.7 },
] as const;

export type CompanyId = (typeof companies)[number]["id"];

export const categories = ["Materiales", "Refacciones", "Herramienta", "Servicios"] as const;
export type Category = (typeof categories)[number];

export const regions = ["Centro", "Norte", "Bajío", "Sureste"] as const;
export type Region = (typeof regions)[number];

const customers = [
  "Constructora Alfa",
  "Taller Beta",
  "Grupo Delta",
  "Ferretería Épsilon",
  "Obras Gamma",
  "Industrias Kappa",
  "Acabados Lambda",
  "Mantenimiento Sigma",
  "Proyectos Omega",
  "Inmobiliaria Zeta",
];

/** Meses disponibles: ene-2025 a sep-2026, formato AAAA-MM. */
export const months: string[] = (() => {
  const out: string[] = [];
  for (let y = 2025; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === 2026 && m > 9) break;
      out.push(`${y}-${String(m).padStart(2, "0")}`);
    }
  }
  return out;
})();

export const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  const names = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${names[m - 1]} ${String(y).slice(2)}`;
};

export interface Sale {
  id: number;
  folio: string;
  company: CompanyId;
  month: string;
  date: string;
  customer: string;
  category: Category;
  region: Region;
  units: number;
  subtotal: number;
  iva: number;
  total: number;
  /** Estado del CFDI */
  cfdi: "Vigente" | "Cancelado";
  /** ¿Está registrado en contabilidad? (para la demo de conciliación) */
  posted: boolean;
  /** Importe registrado en contabilidad (puede diferir) */
  postedAmount: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const sales: Sale[] = (() => {
  const rnd = mulberry32(20261028);
  const out: Sale[] = [];
  let id = 1;
  months.forEach((ym, mi) => {
    const [, m] = ym.split("-").map(Number);
    const season = 1 + 0.18 * Math.sin(((m - 3) / 12) * Math.PI * 2);
    const growth = 1 + mi * 0.012;
    companies.forEach((c) => {
      const n = Math.round((14 + rnd() * 8) * c.weight);
      for (let i = 0; i < n; i++) {
        const category = categories[Math.floor(rnd() * categories.length)];
        const catBase = { Materiales: 42000, Refacciones: 61000, Herramienta: 18000, Servicios: 27000 }[category];
        const subtotal = round2(catBase * (0.35 + rnd() * 1.3) * season * growth);
        const iva = round2(subtotal * 0.16);
        const total = round2(subtotal + iva);
        const day = 1 + Math.floor(rnd() * 28);
        const cancelled = rnd() < 0.04;
        const posted = cancelled ? rnd() < 0.3 : rnd() > 0.035;
        const diff = posted && rnd() < 0.03 ? round2((rnd() - 0.5) * 1800) : 0;
        out.push({
          id: id++,
          folio: `${c.id}-${String(10000 + id * 7).slice(-5)}`,
          company: c.id,
          month: ym,
          date: `${ym}-${String(day).padStart(2, "0")}`,
          customer: customers[Math.floor(rnd() * customers.length)],
          category,
          region: regions[Math.floor(rnd() * regions.length)],
          units: 1 + Math.floor(rnd() * 40),
          subtotal,
          iva,
          total,
          cfdi: cancelled ? "Cancelado" : "Vigente",
          posted,
          postedAmount: posted ? round2(total + diff) : 0,
        });
      }
    });
  });
  return out;
})();

/** Catálogos para la demo de gestión interna. */
export const suppliers = [
  { id: "P-104", name: "Insumos Químicos del Valle (ficticio)" },
  { id: "P-118", name: "Envases y Tapas Rivera (ficticio)" },
  { id: "P-131", name: "Logística Puente (ficticio)" },
  { id: "P-145", name: "Papelería Corporativa Arce (ficticio)" },
  { id: "P-162", name: "Mantenimiento Industrial Robles (ficticio)" },
];

export const costCenters = [
  { id: "CC-1100", name: "Contabilidad" },
  { id: "CC-1200", name: "Tesorería" },
  { id: "CC-2100", name: "Producción" },
  { id: "CC-3100", name: "Almacén" },
  { id: "CC-4100", name: "Sistemas" },
];
