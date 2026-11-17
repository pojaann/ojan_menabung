/**
 * Rate limiting sederhana (in-memory, per instance server) untuk
 * endpoint autentikasi. Supabase Auth juga punya rate limit bawaan;
 * ini lapisan tambahan sesuai PRD bagian 7.
 */

const WINDOW_MS = 60_000;
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = WINDOW_MS): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }

  hits.push(now);
  buckets.set(key, hits);

  // Bersihkan bucket lama agar memori tidak membengkak.
  if (buckets.size > 1000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return true;
}

export async function clientKey(prefix: string): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown";
    return `${prefix}:${ip}`;
  } catch {
    return `${prefix}:unknown`;
  }
}
