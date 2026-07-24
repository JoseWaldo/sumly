import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { es } from "date-fns/locale";

export const COLOMBIA_TZ = "America/Bogota";

export function parseDateCol(dateStr: string): Date {
  const parts = dateStr.split("T")[0].split("-");
  return TZDate.tz(COLOMBIA_TZ, Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

export function todayCol(): string {
  return format(TZDate.tz(COLOMBIA_TZ), "yyyy-MM-dd");
}

export function formatDateCol(date: Date | string, fmt: string = "dd MMM yyyy"): string {
  const d = typeof date === "string" ? parseDateCol(date) : date;
  return format(d, fmt, { locale: es });
}

export function formatCurrencyCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function currentMonthCol(): { month: number; year: number } {
  const now = TZDate.tz(COLOMBIA_TZ);
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatCurrencyInput(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "";
  return new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
