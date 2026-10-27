/**
 * Ücretsiz kur: Frankfurter (ECB) — API key yok.
 * 1 USD = ? TRY
 */
export default defineEventHandler(async () => {
  try {
    const data = await $fetch<{
      amount?: number;
      base?: string;
      rates?: { TRY?: number };
    }>("https://api.frankfurter.app/latest", {
      params: { from: "USD", to: "TRY" },
      timeout: 8_000,
    });
    const tryPerUsd = Number(data?.rates?.TRY);
    if (!Number.isFinite(tryPerUsd) || tryPerUsd <= 0) {
      return {
        success: false,
        message: "Kur alınamadı",
        data: null,
      };
    }
    return {
      success: true,
      data: {
        from: "USD",
        to: "TRY",
        rate: tryPerUsd,
        source: "frankfurter.app",
      },
    };
  } catch (e: any) {
    return {
      success: false,
      message: e?.message || "Kur servisi yanıt vermedi",
      data: null,
    };
  }
});
