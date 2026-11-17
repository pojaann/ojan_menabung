import { z } from "zod";

/* ---------------------------------------------------------------
   Skema validasi — dipakai di klien (form) DAN server (action)
   --------------------------------------------------------------- */

export const emailSchema = z
  .string()
  .min(1, "Email wajib diisi")
  .email("Format email tidak valid");

export const passwordSchema = z
  .string()
  .min(6, "Password minimal 6 karakter")
  .max(72, "Password terlalu panjang");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password wajib diisi"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter").max(80),
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const accountSchema = z.object({
  nama: z.string().min(1, "Nama dompet wajib diisi").max(50),
  tipe: z.enum(["cash", "bank", "ewallet", "credit", "other"]),
  saldo_awal: z.coerce
    .number({ invalid_type_error: "Saldo awal tidak valid" })
    .min(0, "Saldo awal tidak boleh negatif")
    .max(999_999_999_999_999),
  warna: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna tidak valid"),
  ikon: z.string().min(1).max(32),
});
export type AccountInput = z.infer<typeof accountSchema>;

export const categorySchema = z.object({
  nama: z.string().min(1, "Nama kategori wajib diisi").max(50),
  tipe: z.enum(["income", "expense"]),
  warna: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna tidak valid"),
  ikon: z.string().min(1).max(32),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const transactionSchema = z
  .object({
    tipe: z.enum(["income", "expense"], {
      required_error: "Tipe transaksi wajib dipilih",
    }),
    jumlah: z
      .number({ invalid_type_error: "Jumlah tidak valid" })
      .positive("Jumlah harus lebih dari 0")
      .max(999_999_999_999_999),
    tanggal: z
      .string()
      .min(1, "Tanggal wajib diisi")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
    account_id: z.string().uuid("Dompet wajib dipilih"),
    category_id: z.string().uuid("Kategori wajib dipilih"),
    catatan: z.string().max(500).optional().or(z.literal("")),
    tag: z.string().max(50).optional().or(z.literal("")),
  })
  .refine((d) => d.jumlah > 0, { message: "Jumlah harus lebih dari 0", path: ["jumlah"] });
export type TransactionInput = z.infer<typeof transactionSchema>;

export const transferSchema = z
  .object({
    tipe: z.literal("transfer"),
    jumlah: z
      .number({ invalid_type_error: "Jumlah tidak valid" })
      .positive("Jumlah harus lebih dari 0"),
    tanggal: z
      .string()
      .min(1, "Tanggal wajib diisi")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
    from_account: z.string().uuid("Dompet asal wajib dipilih"),
    to_account: z.string().uuid("Dompet tujuan wajib dipilih"),
    catatan: z.string().max(500).optional().or(z.literal("")),
  })
  .refine((d) => d.from_account !== d.to_account, {
    message: "Dompet asal dan tujuan tidak boleh sama",
    path: ["to_account"],
  });
export type TransferInput = z.infer<typeof transferSchema>;

export const budgetSchema = z.object({
  category_id: z.string().uuid("Kategori wajib dipilih"),
  periode: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Periode tidak valid"),
  batas: z
    .number({ invalid_type_error: "Batas tidak valid" })
    .positive("Batas harus lebih dari 0"),
});
export type BudgetInput = z.infer<typeof budgetSchema>;

export const goalSchema = z.object({
  nama: z.string().min(1, "Nama tujuan wajib diisi").max(80),
  target: z
    .number({ invalid_type_error: "Target tidak valid" })
    .positive("Target harus lebih dari 0"),
  tenggat: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tenggat tidak valid")
    .optional()
    .or(z.literal("")),
});
export type GoalInput = z.infer<typeof goalSchema>;

export const contributionSchema = z.object({
  goal_id: z.string().uuid(),
  jumlah: z
    .number({ invalid_type_error: "Jumlah tidak valid" })
    .positive("Jumlah harus lebih dari 0"),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  account_id: z.string().uuid().optional().or(z.literal("")),
});
export type ContributionInput = z.infer<typeof contributionSchema>;

export const profileSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter").max(80),
});

/** Ubah FormData jadi objek angka untuk field uang. */
export function moneyFromForm(formData: FormData, key: string): number {
  const raw = String(formData.get(key) ?? "").replace(/[^\d]/g, "");
  return raw ? Number(raw) : 0;
}
