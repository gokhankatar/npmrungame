const RAWG_BASE_URL = "https://api.rawg.io/api";

// RAWG sits behind Cloudflare, which answers with 52x while its origin is down.
const RETRYABLE_STATUS = [408, 409, 425, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524];

type RawgFetchOptions = {
  params?: Record<string, any>;
  timeout?: number;
  retry?: number;
};

export const rawgFetch = async <T>(
  path: string,
  { params = {}, timeout = 8000, retry = 1 }: RawgFetchOptions = {}
): Promise<T> => {
  const config = useRuntimeConfig();

  if (!config.rawg_api_key) {
    throw createError({
      statusCode: 500,
      statusMessage: "RAWG API key is not configured",
      data: { message: "Sunucu yapılandırması eksik." },
    });
  }

  try {
    return await $fetch<T>(`${RAWG_BASE_URL}${path}`, {
      params: { key: config.rawg_api_key, ...params },
      timeout,
      retry,
      retryDelay: 500,
      retryStatusCodes: RETRYABLE_STATUS,
    });
  } catch (error: any) {
    const status: number | undefined = error?.response?.status ?? error?.statusCode;
    const isTimeout =
      error?.name === "AbortError" ||
      error?.name === "TimeoutError" ||
      String(error?.message ?? "").toLowerCase().includes("timeout");

    if (isTimeout) {
      throw createError({
        statusCode: 504,
        statusMessage: "RAWG API request timed out",
        data: { message: "Oyun servisi yanıt vermedi, lütfen tekrar deneyin." },
      });
    }

    if (status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: "Game not found on RAWG",
        data: { message: "Oyun bulunamadı." },
      });
    }

    if (status === 401 || status === 403) {
      throw createError({
        statusCode: 502,
        statusMessage: "RAWG API rejected the credentials",
        data: { message: "Oyun servisine erişilemiyor." },
      });
    }

    if (status === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: "RAWG API rate limit exceeded",
        data: { message: "Çok fazla istek gönderildi, biraz bekleyin." },
      });
    }

    throw createError({
      statusCode: 503,
      statusMessage: `RAWG API is unavailable${status ? ` (${status})` : ""}`,
      data: { message: "Oyun servisi şu anda kullanılamıyor." },
    });
  }
};
