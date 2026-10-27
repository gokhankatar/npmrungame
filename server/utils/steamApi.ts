export function requireSteamApiKey() {
  const config = useRuntimeConfig();
  const key = String(config.steam_web_api_key || "").trim();
  if (!key) {
    throw createError({
      statusCode: 500,
      statusMessage: "Steam API key yapılandırılmamış",
      data: { message: ".env içinde STEAM_WEB_API_KEY eksik." },
    });
  }
  return key;
}

export function requireSteamId(raw: unknown) {
  const steamId = String(raw || "").trim();
  if (!/^\d{17}$/.test(steamId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Geçersiz steamId",
      data: { message: "17 haneli SteamID64 gerekli." },
    });
  }
  return steamId;
}

export async function steamGet<T>(
  path: string,
  params: Record<string, string | number | boolean>
): Promise<T> {
  const key = requireSteamApiKey();
  return await $fetch<T>(`https://api.steampowered.com${path}`, {
    params: { key, format: "json", ...params },
    timeout: 12_000,
  });
}

/** Klasik CDN — eski oyunlarda çalışır; yenilerde hash’li store asset gerekir */
const STEAM_CDN = "https://cdn.cloudflare.steamstatic.com/steam/apps";

export function steamHeaderUrl(appId: number | string) {
  return `${STEAM_CDN}/${appId}/header.jpg`;
}

export function steamLibraryHeroUrl(appId: number | string) {
  return `${STEAM_CDN}/${appId}/library_hero.jpg`;
}

export function steamCapsuleUrl(appId: number | string) {
  return `${STEAM_CDN}/${appId}/capsule_231x87.jpg`;
}

export function steamIconUrl(appId: number | string, hash?: string | null) {
  if (!hash) return null;
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`;
}

/**
 * Kart kapak adayları (sırayla dene).
 * Not: 2024+ bazı oyunlarda klasik header.jpg yok; store `header_image` (hash’li) gerekir.
 */
export function steamCoverCandidates(
  appId: number | string,
  opts?: { iconHash?: string | null; storeHeaderUrl?: string | null }
) {
  const list = [
    opts?.storeHeaderUrl || "",
    steamHeaderUrl(appId),
    steamLibraryHeroUrl(appId),
    steamCapsuleUrl(appId),
    steamIconUrl(appId, opts?.iconHash) || "",
  ].filter(Boolean);
  return [...new Set(list)];
}

const STEAM_STORE_UA =
  "Mozilla/5.0 (compatible; npmrungame-panel/1.0)";

/** Store appdetails — hash’li gerçek kapak URL’si */
export async function fetchSteamStoreHeader(
  appId: number | string
): Promise<string | null> {
  try {
    const data = await $fetch<Record<string, any>>(
      "https://store.steampowered.com/api/appdetails",
      {
        params: { appids: String(appId), filters: "basic" },
        timeout: 8_000,
        headers: { "User-Agent": STEAM_STORE_UA },
      }
    );
    const row = data?.[String(appId)]?.data;
    const url =
      row?.header_image ||
      row?.capsule_image ||
      row?.capsule_imagev5 ||
      null;
    return typeof url === "string" && url ? url : null;
  } catch {
    return null;
  }
}

export type SteamStorePrice = {
  appId: number;
  name: string | null;
  currency: string | null;
  /** kuruş/cent cinsinden final fiyat (Steam final) */
  final: number | null;
  initial: number | null;
  discountPct: number;
  isFree: boolean;
  headerUrl: string | null;
};

/** Store appdetails — fiyat + indirim (+ opsiyonel kapak) */
export async function fetchSteamStorePrice(
  appId: number | string,
  opts?: { cc?: string; lang?: string }
): Promise<SteamStorePrice | null> {
  const id = Number(appId);
  if (!Number.isFinite(id) || id <= 0) return null;
  try {
    const data = await $fetch<Record<string, any>>(
      "https://store.steampowered.com/api/appdetails",
      {
        params: {
          appids: String(id),
          filters: "price_overview,basic",
          cc: opts?.cc || "TR",
          l: opts?.lang || "turkish",
        },
        timeout: 8_000,
        headers: { "User-Agent": STEAM_STORE_UA },
      }
    );
    const pack = data?.[String(id)];
    if (!pack?.success || !pack.data) return null;
    const row = pack.data;
    const po = row.price_overview;
    const isFree = !!row.is_free || (!po && row.type === "game");
    return {
      appId: id,
      name: typeof row.name === "string" ? row.name : null,
      currency: po?.currency || null,
      final: typeof po?.final === "number" ? po.final : isFree ? 0 : null,
      initial: typeof po?.initial === "number" ? po.initial : isFree ? 0 : null,
      discountPct: typeof po?.discount_percent === "number" ? po.discount_percent : 0,
      isFree,
      headerUrl:
        (typeof row.header_image === "string" && row.header_image) ||
        null,
    };
  } catch {
    return null;
  }
}

/** Rate-limit dostu batch fiyat */
export async function fetchSteamStorePrices(
  appIds: Array<number | string>,
  opts?: { cc?: string; lang?: string; concurrency?: number }
): Promise<SteamStorePrice[]> {
  const ids = [...new Set(appIds.map(Number).filter((n) => n > 0))];
  const out: SteamStorePrice[] = [];
  const concurrency = Math.max(1, Math.min(opts?.concurrency || 5, 8));
  for (let i = 0; i < ids.length; i += concurrency) {
    const batch = ids.slice(i, i + concurrency);
    const rows = await Promise.all(
      batch.map((id) => fetchSteamStorePrice(id, opts))
    );
    for (const row of rows) {
      if (row) out.push(row);
    }
  }
  return out;
}
