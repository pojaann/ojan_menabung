import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { isGuestMode } from "@/lib/guest";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type PageAuth =
  | { mode: "user"; user: User }
  | { mode: "guest"; user: null }
  | { mode: "anon"; user: null };

/**
 * Konteks autentikasi untuk halaman (app).
 * - user   : sesi Supabase valid
 * - guest  : cookie mode guest (tanpa query database sama sekali)
 * - anon   : tidak ada sesi dan tidak guest -> dialihkan ke /login
 */
export async function getPageAuth(): Promise<PageAuth> {
  const guest = await isGuestMode();
  if (!isSupabaseConfigured) {
    return guest ? { mode: "guest", user: null } : { mode: "anon", user: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return { mode: "user", user };
  if (guest) return { mode: "guest", user: null };

  redirect("/login");
}

/**
 * Penjaga untuk Server Action: TOLAK semua operasi tulis tanpa sesi
 * (termasuk tamu dan Supabase belum dikonfigurasi).
 */
export async function requireUserForAction(): Promise<
  { user: User; ok: true } | { user: null; ok: false; error: string }
> {
  if (!isSupabaseConfigured) {
    return {
      user: null,
      ok: false,
      error: "Supabase belum dikonfigurasi. Silakan isi .env.local terlebih dahulu.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      ok: false,
      error: "Masuk untuk mulai mencatat — sesi Anda tidak valid atau berakhir.",
    };
  }

  return { user, ok: true };
}

/** Profil pengguna (dibuat otomatis oleh trigger saat pendaftaran). */
export async function getProfile(userId: string) {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, nama, mata_uang, created_at")
    .eq("id", userId)
    .maybeSingle();
  return data;
}
