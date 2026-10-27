/** Steam store URL → appId */
export function parseSteamAppIdFromUrl(raw: unknown): number | null {
  const s = String(raw || "");
  const m = s.match(/store\.steampowered\.com\/app\/(\d+)/i);
  if (m?.[1]) return Number(m[1]);
  const m2 = s.match(/steamcommunity\.com\/app\/(\d+)/i);
  if (m2?.[1]) return Number(m2[1]);
  return null;
}

/** Koleksiyon / IGDB dokümanından Steam appId çıkarmaya çalış */
export function extractSteamAppId(doc: Record<string, any>): number | null {
  if (typeof doc.steamAppId === "number" && doc.steamAppId > 0) {
    return doc.steamAppId;
  }
  if (typeof doc.steam_appid === "number" && doc.steam_appid > 0) {
    return doc.steam_appid;
  }
  const direct = Number(doc.steamAppId || doc.steam_appid || 0);
  if (direct > 0) return direct;

  const urlCandidates: unknown[] = [
    doc.steamUrl,
    doc.url,
    ...(Array.isArray(doc.stores) ? doc.stores.map((s: any) => s?.url) : []),
    ...(Array.isArray(doc.websites) ? doc.websites.map((w: any) => w?.url) : []),
  ];
  for (const u of urlCandidates) {
    const id = parseSteamAppIdFromUrl(u);
    if (id) return id;
  }
  return null;
}

export function normalizeGameName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/™|®|©/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Basit isim eşleşmesi (tam / içerir) */
export function namesLikelyMatch(a: string, b: string) {
  const na = normalizeGameName(a);
  const nb = normalizeGameName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 5 && nb.length >= 5 && (na.includes(nb) || nb.includes(na))) {
    return true;
  }
  return false;
}

export function formatSteamMoney(
  cents: number | null | undefined,
  currency = "TRY"
) {
  if (cents == null || !Number.isFinite(cents)) return "—";
  const value = cents / 100;
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency === "TR" ? "TRY" : currency,
      maximumFractionDigits: value >= 100 ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}
