const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_BASE_URL = "https://api.igdb.com/v4";

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;
let tokenPromise: Promise<string> | null = null;

const RETRYABLE_STATUS = [408, 409, 425, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524];

type IgdbFetchOptions = {
  timeout?: number;
  retry?: number;
};

const ensureCredentials = () => {
  const config = useRuntimeConfig();
  const clientId = config.twitch_client_id;
  const clientSecret = config.twitch_client_secret;

  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "IGDB credentials are not configured",
      data: { message: "Sunucu yapılandırması eksik (Twitch Client ID/Secret)." },
    });
  }

  return { clientId: String(clientId), clientSecret: String(clientSecret) };
};

const fetchAccessToken = async (): Promise<string> => {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.accessToken;
  }

  if (tokenPromise) return tokenPromise;

  tokenPromise = (async () => {
    const { clientId, clientSecret } = ensureCredentials();

    try {
      const data = await $fetch<{ access_token: string; expires_in: number }>(
        TWITCH_TOKEN_URL,
        {
          method: "POST",
          params: {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials",
          },
          timeout: 10_000,
        }
      );

      cachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      return cachedToken.accessToken;
    } catch (error: any) {
      cachedToken = null;
      throw createError({
        statusCode: 502,
        statusMessage: "Twitch OAuth token request failed",
        data: {
          message: "Oyun servisine giriş yapılamadı, lütfen tekrar deneyin.",
          detail: error?.data ?? error?.message,
        },
      });
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
};

const mapIgdbError = (error: any) => {
  const status: number | undefined = error?.response?.status ?? error?.statusCode;
  const isTimeout =
    error?.name === "AbortError" ||
    error?.name === "TimeoutError" ||
    String(error?.message ?? "")
      .toLowerCase()
      .includes("timeout");

  if (isTimeout) {
    return createError({
      statusCode: 504,
      statusMessage: "IGDB API request timed out",
      data: { message: "Oyun servisi yanıt vermedi, lütfen tekrar deneyin." },
    });
  }

  if (status === 401 || status === 403) {
    cachedToken = null;
    return createError({
      statusCode: 502,
      statusMessage: "IGDB API rejected the credentials",
      data: { message: "Oyun servisine erişilemiyor." },
    });
  }

  if (status === 429) {
    return createError({
      statusCode: 429,
      statusMessage: "IGDB API rate limit exceeded",
      data: { message: "Çok fazla istek gönderildi, biraz bekleyin." },
    });
  }

  return createError({
    statusCode: 503,
    statusMessage: `IGDB API is unavailable${status ? ` (${status})` : ""}`,
    data: { message: "Oyun servisi şu anda kullanılamıyor." },
  });
};

/** Apicalypse body ile IGDB endpoint çağırır. */
export const igdbFetch = async <T>(
  endpoint: string,
  body: string,
  { timeout = 10_000, retry = 1 }: IgdbFetchOptions = {}
): Promise<T> => {
  const { clientId } = ensureCredentials();
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let lastError: any;

  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      const accessToken = await fetchAccessToken();

      return await $fetch<T>(`${IGDB_BASE_URL}${path}`, {
        method: "POST",
        body,
        headers: {
          "Client-ID": clientId,
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "text/plain",
        },
        timeout,
      });
    } catch (error: any) {
      lastError = error;
      const status: number | undefined = error?.response?.status ?? error?.statusCode;

      if (status === 401 || status === 403) {
        cachedToken = null;
      }

      const shouldRetry =
        attempt < retry &&
        (status == null || RETRYABLE_STATUS.includes(status) || status === 401);

      if (!shouldRetry) break;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }

  throw mapIgdbError(lastError);
};

export const igdbImageUrl = (
  imageId?: string | null,
  size:
    | "cover_big"
    | "cover_big_2x"
    | "screenshot_med"
    | "screenshot_big"
    | "screenshot_huge"
    | "1080p" = "cover_big_2x"
) => {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
};

export const unixToIsoDate = (unix?: number | null) => {
  if (unix == null || Number.isNaN(Number(unix))) return null;
  return new Date(Number(unix) * 1000).toISOString().slice(0, 10);
};

export const isoDateRangeToUnix = (dates?: string) => {
  if (!dates || !dates.includes(",")) return null;
  const [from, to] = dates.split(",").map((s) => s.trim());
  const fromTs = Math.floor(new Date(`${from}T00:00:00Z`).getTime() / 1000);
  const toTs = Math.floor(new Date(`${to}T23:59:59Z`).getTime() / 1000);
  if (Number.isNaN(fromTs) || Number.isNaN(toTs)) return null;
  return { fromTs, toTs };
};

/** Keşif / arama listeleri için alan seti */
export const IGDB_LIST_FIELDS = [
  "name",
  "slug",
  "summary",
  "first_release_date",
  "aggregated_rating",
  "aggregated_rating_count",
  "rating",
  "total_rating",
  "cover.image_id",
  "genres.id",
  "genres.name",
  "genres.slug",
  "themes.id",
  "themes.name",
  "themes.slug",
  "platforms.id",
  "platforms.name",
  "platforms.slug",
  "screenshots.image_id",
].join(",");

/** Detay sayfası için geniş alan seti */
export const IGDB_DETAIL_FIELDS = [
  IGDB_LIST_FIELDS,
  "storyline",
  "url",
  "websites.category",
  "websites.url",
  "involved_companies.developer",
  "involved_companies.publisher",
  "involved_companies.company.name",
  "keywords.name",
  "keywords.slug",
  "game_modes.name",
  "player_perspectives.name",
].join(",");
