/** Steam OpenID 2.0 — hesap bağlama (login değil, steamId almak için) */

export const STEAM_OPENID_LOGIN =
  "https://steamcommunity.com/openid/login";

export function buildSteamOpenIdUrl(returnToPath = "/auth/steam/callback") {
  if (!import.meta.client) {
    throw new Error("Steam OpenID sadece tarayıcıda başlatılabilir");
  }

  const origin = window.location.origin;
  const returnTo = `${origin}${returnToPath.startsWith("/") ? returnToPath : `/${returnToPath}`}`;

  const params = new URLSearchParams({
    "openid.mode": "checkid_setup",
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.claimed_id":
      "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.identity":
      "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.return_to": returnTo,
    "openid.realm": origin,
  });

  return `${STEAM_OPENID_LOGIN}?${params.toString()}`;
}

/** claimed_id URL’sinden 17 haneli SteamID64 çıkar */
export function extractSteamIdFromClaimedId(
  claimedId: string | null | undefined
): string | null {
  if (!claimedId) return null;
  const match = String(claimedId).match(/\/id\/(\d{17})$/);
  return match?.[1] ?? null;
}

export function startSteamOpenIdLink(returnToPath = "/auth/steam/callback") {
  window.location.href = buildSteamOpenIdUrl(returnToPath);
}
