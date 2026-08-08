import { igdbFetch } from "../utils/igdb";
import { mapIgdbScreenshots, type IgdbGame } from "../utils/igdbMap";

const escapeSearch = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export default defineEventHandler(async (event) => {
  const { id, name } = getQuery(event);

  if (!id && !name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Game ID is required",
    });
  }

  let game: IgdbGame | undefined;
  const numericId = id != null && String(id).trim() !== "" ? Number(id) : NaN;

  if (!Number.isNaN(numericId)) {
    const byId = await igdbFetch<IgdbGame[]>(
      "games",
      `
        fields screenshots.image_id,name;
        where id = ${numericId};
        limit 1;
      `
    );
    game = byId?.[0];
  }

  if ((!game || !game.screenshots?.length) && name) {
    const q = String(name).trim();
    if (q) {
      const byName = await igdbFetch<IgdbGame[]>(
        "games",
        `
          search "${escapeSearch(q)}";
          fields screenshots.image_id,name;
          limit 5;
        `
      );
      const exact = (byName ?? []).find(
        (g) => g.name?.toLowerCase() === q.toLowerCase()
      );
      game = exact ?? byName?.[0] ?? game;
    }
  }

  return {
    results: game ? mapIgdbScreenshots(game) : [],
  };
});
