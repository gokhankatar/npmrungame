import { igdbFetch, IGDB_DETAIL_FIELDS } from "../utils/igdb";
import { mapIgdbGameToRawgShape, type IgdbGame } from "../utils/igdbMap";

const escapeSearch = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export default defineEventHandler(async (event) => {
  const { id, name } = getQuery(event);

  if (!id && !name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Game ID or name is required",
    });
  }

  const detailBodyForId = (gameId: number) => `
    fields ${IGDB_DETAIL_FIELDS};
    where id = ${gameId};
    limit 1;
  `;

  let game: IgdbGame | undefined;

  const numericId = id != null && String(id).trim() !== "" ? Number(id) : NaN;

  if (!Number.isNaN(numericId)) {
    const byId = await igdbFetch<IgdbGame[]>("games", detailBodyForId(numericId));
    game = byId?.[0];
  }

  // Eski RAWG id'leri IGDB'de yanlış oyuna denk gelebilir / boş gelebilir.
  // Store'daki isimle arama fallback'i mevcut Firebase kayıtlarını ayakta tutar.
  if (!game && name) {
    const q = String(name).trim();
    if (q) {
      const byName = await igdbFetch<IgdbGame[]>(
        "games",
        `
          search "${escapeSearch(q)}";
          fields ${IGDB_DETAIL_FIELDS};
          limit 5;
        `
      );

      const exact = (byName ?? []).find(
        (g) => g.name?.toLowerCase() === q.toLowerCase()
      );
      game = exact ?? byName?.[0];
    }
  }

  if (!game) {
    throw createError({
      statusCode: 404,
      statusMessage: "Game not found on IGDB",
      data: { message: "Oyun bulunamadı." },
    });
  }

  return mapIgdbGameToRawgShape(game, true);
});
