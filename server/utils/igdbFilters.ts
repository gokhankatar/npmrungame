/** RAWG slug / site filtreleri → IGDB id eşlemeleri */

export const PLATFORM_IDS: Record<string, number[]> = {
  // PC family
  pc: [6, 14, 3],
  // PlayStation (PS5 odaklı + PS4)
  ps5: [167, 48],
  // Xbox Series + Xbox One
  xbox: [169, 49],
  // Nintendo Switch
  nintendo: [130],
};

/** Genre slug → IGDB genre id */
export const GENRE_IDS: Record<string, number> = {
  "role-playing-games-rpg": 12,
  adventure: 31,
  indie: 32,
  strategy: 15,
  shooter: 5,
};

/**
 * IGDB'de ayrı "Action" genre yok; theme id=1 (action).
 * Site "action" genre filtresi bu theme'e map edilir.
 */
export const GENRE_AS_THEME_IDS: Record<string, number> = {
  action: 1,
};

/** Tag slug → IGDB theme id */
export const THEME_IDS: Record<string, number> = {
  horror: 19,
};

/** Tag slug → IGDB keyword id */
export const KEYWORD_IDS: Record<string, number> = {
  "souls-like": 17326, // "soulslike"
};

/** Keşif / anasayfa / aramada gösterilmeyecek IGDB theme id'leri */
export const EXCLUDED_THEME_IDS = [
  42, // erotic
] as const;

/** Apicalypse where parçası — erotik vb. temaları ele */
export const safeContentWhereParts = (): string[] =>
  EXCLUDED_THEME_IDS.map((id) => `themes != (${id})`);

export const MAX_IGDB_PAGE = 500;
