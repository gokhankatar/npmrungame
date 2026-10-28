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
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const STEAM_STORE_HEADERS = {
  "User-Agent": STEAM_STORE_UA,
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://store.steampowered.com/",
};

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
        headers: STEAM_STORE_HEADERS,
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

function currencyFromFormattedPrice(formatted: unknown): string | null {
  const s = String(formatted || "");
  if (!s) return null;
  if (s.includes("₺") || /TL|TRY/i.test(s)) return "TRY";
  if (s.includes("$") || /USD/i.test(s)) return "USD";
  if (s.includes("€") || /EUR/i.test(s)) return "EUR";
  if (s.includes("£") || /GBP/i.test(s)) return "GBP";
  return null;
}

function centsFromSteamField(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.round(raw);
  if (typeof raw === "string" && /^\d+$/.test(raw.trim())) {
    return Number(raw.trim());
  }
  return null;
}

/**
 * Web API IStoreBrowseService/GetItems — store.steampowered.com Akamai 403
 * engelinde de çalışır (api.steampowered.com + STEAM_WEB_API_KEY).
 */
export async function fetchSteamStorePrices(
  appIds: Array<number | string>,
  opts?: { cc?: string; lang?: string; concurrency?: number }
): Promise<SteamStorePrice[]> {
  const ids = [...new Set(appIds.map(Number).filter((n) => n > 0))];
  if (!ids.length) return [];

  const key = requireSteamApiKey();
  const cc = (opts?.cc || "TR").toUpperCase().slice(0, 2);
  const lang = opts?.lang || "turkish";
  const out: SteamStorePrice[] = [];
  const chunk = 25;

  for (let i = 0; i < ids.length; i += chunk) {
    const batch = ids.slice(i, i + chunk);
    const input = {
      ids: batch.map((appid) => ({ appid })),
      context: { language: lang, country_code: cc },
      data_request: { include_all_purchase_options: true },
    };
    try {
      const data = await $fetch<{
        response?: { store_items?: Array<Record<string, any>> };
      }>("https://api.steampowered.com/IStoreBrowseService/GetItems/v1/", {
        params: {
          key,
          input_json: JSON.stringify(input),
        },
        timeout: 20_000,
      });

      for (const it of data?.response?.store_items || []) {
        const appId = Number(it.appid || 0);
        if (!appId) continue;
        const isFree = !!it.is_free;
        const best = it.best_purchase_option || null;
        const final = centsFromSteamField(best?.final_price_in_cents);
        const initial =
          centsFromSteamField(
            best?.original_price_in_cents ?? best?.initial_price_in_cents
          ) ?? final;
        const discountPct =
          typeof best?.discount_pct === "number"
            ? best.discount_pct
            : typeof best?.discount_percent === "number"
              ? best.discount_percent
              : 0;
        const currency =
          currencyFromFormattedPrice(best?.formatted_final_price) ||
          (cc === "TR" ? "TRY" : cc) ||
          "USD";

        out.push({
          appId,
          name: typeof it.name === "string" ? it.name : null,
          currency: final != null ? currency : isFree ? currency : null,
          final: final != null ? final : isFree ? 0 : null,
          initial: initial != null ? initial : isFree ? 0 : null,
          discountPct,
          isFree,
          headerUrl: null,
        });
      }
    } catch {
      // batch fail → sonraki chunk
    }
  }

  // Eksik kalanlar için eski store appdetails (çoğu IP’de 403)
  const have = new Set(out.map((r) => r.appId));
  const missing = ids.filter((id) => !have.has(id));
  if (missing.length) {
    const concurrency = Math.max(1, Math.min(opts?.concurrency || 3, 5));
    for (let i = 0; i < missing.length; i += concurrency) {
      const batch = missing.slice(i, i + concurrency);
      const rows = await Promise.all(
        batch.map((id) => fetchSteamStorePriceAppdetails(id, opts))
      );
      for (const row of rows) {
        if (row) out.push(row);
      }
    }
  }

  return out;
}

/** Store appdetails — fiyat + indirim (+ opsiyonel kapak); Akamai sık 403 verir */
async function fetchSteamStorePriceAppdetails(
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
          cc: opts?.cc || "TR",
          l: opts?.lang || "turkish",
        },
        timeout: 8_000,
        headers: STEAM_STORE_HEADERS,
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
      discountPct:
        typeof po?.discount_percent === "number" ? po.discount_percent : 0,
      isFree,
      headerUrl:
        (typeof row.header_image === "string" && row.header_image) || null,
    };
  } catch {
    return null;
  }
}

/** Tekil fiyat (browse batch üzerinden) */
export async function fetchSteamStorePrice(
  appId: number | string,
  opts?: { cc?: string; lang?: string }
): Promise<SteamStorePrice | null> {
  const rows = await fetchSteamStorePrices([appId], opts);
  return rows[0] || null;
}
