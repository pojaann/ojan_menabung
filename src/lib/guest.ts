import { cookies } from "next/headers";

export const GUEST_COOKIE = "ojan_mode";
export const GUEST_VALUE = "guest";
export const THEME_COOKIE = "ojan_theme";

/** Mode guest: menjelajahi fitur tanpa data, tanpa sesi Supabase. */
export async function isGuestMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_COOKIE)?.value === GUEST_VALUE;
}

export async function getTheme(): "light" | "dark" {
  const cookieStore = await cookies();
  return cookieStore.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";
}
