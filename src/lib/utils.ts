import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------------------------------------------------------------
   Uang (IDR)
   --------------------------------------------------------------- */
const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Rp 1.250.000 */
export function formatRupiah(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Rp 0";
  return rupiahFormatter.format(value);
}

/** 1.250.000 (tanpa simbol, untuk input) */
export function groupDigits(value: number | string): string {
  const digits = typeof value === "string" ? value.replace(/[^\d]/g, "") : String(Math.trunc(value));
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

/** "1.250.000" | "Rp 1.250.000" | "1250000" -> 1250000 */
export function parseRupiah(value: string | null | undefined): number {
  if (!value) return 0;
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

/** Ringkas untuk sumbu grafik: Rp 1,2 jt */
export function formatRupiahShort(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (abs >= 1_000) return `Rp ${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return formatRupiah(value);
}

/* ---------------------------------------------------------------
   Tanggal — zona waktu Asia/Jakarta
   --------------------------------------------------------------- */
const JAKARTA = "Asia/Jakarta";

/** Hari ini (YYYY-MM-DD) menurut zona Asia/Jakarta. */
export function todayJakarta(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: JAKARTA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** "2026-11" */
export function monthKeyOf(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM");
}

/** "November 2026" */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return format(new Date(Number(y), Number(m) - 1, 1), "MMMM yyyy", { locale: id });
}

/** "17 Nov 2026" */
export function formatDateID(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy", { locale: id });
}

/** "Senin, 17 November 2026" */
export function formatDateLongID(iso: string): string {
  return format(parseISO(iso), "EEEE, d MMMM yyyy", { locale: id });
}

/** Awal bulan (YYYY-MM-01) dari key "YYYY-MM". */
export function monthStartISO(key: string): string {
  return `${key}-01`;
}

/** Akhir bulan dari key "YYYY-MM". */
export function monthEndISO(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${key}-${String(last).padStart(2, "0")}`;
}

/** Daftar 6 bulan terakhir (termasuk bulan berjalan), terbaru di depan. */
export function last6Months(fromKey?: string): string[] {
  const base = fromKey ? parseISO(`${fromKey}-01`) : (() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  })();
  const keys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    keys.push(format(d, "yyyy-MM"));
  }
  return keys;
}

/** Input bulan "YYYY-MM" hari ini. */
export function thisMonthKey(): string {
  return monthKeyOf(todayJakarta());
}
