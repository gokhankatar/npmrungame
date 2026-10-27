import { requireSteamId } from "../../utils/steamApi";

type WishlistRow = {
  appId: number;
  name: string;
  priority: number;
  added: number;
  headerUrl: string;
  reviewScore: number | null;
  discountPct: number;
};

function parseWishlistPage(raw: unknown): WishlistRow[] {
  // Steam boş/gizli için [] dönebilir. HTML string gelirse Object.entries
  // her karakteri “oyun” sanıyordu → 900k+ sahte kayıt + tarayıcı kilitlenmesi.
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("<")) return [];
    try {
      return parseWishlistPage(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }

  if (Array.isArray(raw) || !raw || typeof raw !== "object") return [];

  const out: WishlistRow[] = [];
  for (const [appId, row] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d+$/.test(appId)) continue;
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const r = row as Record<string, any>;

    out.push({
      appId: Number(appId),
      name: typeof r.name === "string" && r.name ? r.name : `App ${appId}`,
      priority: Number(r.priority ?? 0),
      added: Number(r.added ?? 0),
      headerUrl:
        (typeof r.capsule === "string" && r.capsule) ||
        `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
      reviewScore: r.review_score ?? null,
      discountPct: Number(r.subs?.[0]?.discount_pct ?? 0),
    });
  }
  return out;
}

async function fetchWishlistPage(steamId: string, page: number) {
  const text = await $fetch<string>(
    `https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata/`,
    {
      params: { p: page },
      timeout: 12_000,
      responseType: "text",
      headers: {
        Accept: "application/json, text/javascript, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    }
  );
  return parseWishlistPage(text);
}

/**
 * Steam Web API’de resmi wishlist yok.
 * Store wishlist JSON endpoint’i (public profil) üzerinden proxy + sayfalama.
 */
export default defineEventHandler(async (event) => {
  const steamId = requireSteamId(getQuery(event).steamId);
  const maxPages = 20; // ~100 item/page → üst sınır ~2000

  try {
    const all: WishlistRow[] = [];

    for (let p = 0; p < maxPages; p++) {
      const page = await fetchWishlistPage(steamId, p);
      if (!page.length) break;
      all.push(...page);
      if (page.length < 50) break;
    }

    all.sort((a, b) => a.priority - b.priority || b.added - a.added);

    if (!all.length) {
      return {
        success: false,
        data: { count: 0, items: [] },
        message:
          "İstek listesi boş, gizli veya Steam JSON dönmedi. Steam profilinde istek listesini herkese açık yap.",
      };
    }

    return {
      success: true,
      data: { count: all.length, items: all },
    };
  } catch {
    return {
      success: false,
      data: { count: 0, items: [] },
      message:
        "İstek listesi alınamadı (profil gizli veya Steam store yanıt vermedi).",
    };
  }
});
