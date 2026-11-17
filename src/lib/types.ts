/* ---------------------------------------------------------------
   Model data (lihat PRD bagian 9) — mirror dari skema Supabase
   --------------------------------------------------------------- */

export type TipeTransaksi = "income" | "expense" | "transfer";
export type TipeKategori = "income" | "expense";
export type TipeDompet =
  | "cash"
  | "bank"
  | "ewallet"
  | "credit"
  | "other";

export const TIPE_DOMPET: { value: TipeDompet; label: string }[] = [
  { value: "cash", label: "Tunai" },
  { value: "bank", label: "Bank" },
  { value: "ewallet", label: "E-wallet" },
  { value: "credit", label: "Kartu kredit" },
  { value: "other", label: "Lainnya" },
];

export interface Profile {
  id: string;
  nama: string | null;
  mata_uang: string;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  nama: string;
  tipe: TipeDompet;
  saldo_awal: number;
  warna: string;
  ikon: string;
  is_archived: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  nama: string;
  tipe: TipeKategori;
  ikon: string;
  warna: string;
  is_archived: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  tipe: TipeTransaksi;
  jumlah: number;
  tanggal: string;
  catatan: string | null;
  tag: string | null;
  transfer_group_id: string | null;
  /** 'out' | 'in' — hanya untuk transfer (penambahan terhadap PRD ringkas). */
  arah: "out" | "in" | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  periode: string; // YYYY-MM-01
  batas: number;
}

export interface Goal {
  id: string;
  user_id: string;
  nama: string;
  target: number;
  tenggat: string | null;
  status: "aktif" | "tercapai";
  created_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  jumlah: number;
  tanggal: string;
  account_id: string | null;
  created_at: string;
}

/* --------- Turunan / hasil agregasi (view SQL) ----------------- */

export interface AccountBalance {
  account_id: string;
  nama: string;
  tipe: TipeDompet;
  warna: string;
  ikon: string;
  is_archived: boolean;
  saldo: number;
}

export interface MonthlySummary {
  periode: string; // YYYY-MM-01
  pemasukan: number;
  pengeluaran: number;
}

export interface ExpenseByCategory {
  category_id: string | null;
  nama: string;
  warna: string;
  ikon: string;
  total: number;
}

export interface BudgetProgress {
  budget_id: string;
  category_id: string;
  kategori: string;
  warna: string;
  ikon: string;
  batas: number;
  terpakai: number;
  sisa: number;
  persen: number;
}

export interface GoalProgress {
  id: string;
  nama: string;
  target: number;
  tenggat: string | null;
  status: "aktif" | "tercapai";
  terkumpul: number;
  persen: number;
}

export interface TrendPoint {
  periode: string; // YYYY-MM-01
  pemasukan: number;
  pengeluaran: number;
}

/* --------- Bentuk hasil Server Action --------------------------- */

export type ActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};
