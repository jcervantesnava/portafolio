const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const mxn2 = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });
const num = new Intl.NumberFormat("es-MX");
const compact = new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 });

export const money = (n: number) => mxn.format(n);
export const money2 = (n: number) => mxn2.format(n);
export const int = (n: number) => num.format(Math.round(n));
export const short = (n: number) => compact.format(n);
export const pct = (n: number, digits = 1) =>
  `${n > 0 ? "+" : ""}${(n * 100).toFixed(digits)} %`;

export const sum = <T,>(rows: T[], f: (r: T) => number) => rows.reduce((a, r) => a + f(r), 0);
