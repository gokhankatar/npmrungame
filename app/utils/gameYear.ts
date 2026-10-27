/** createdAt / completed_at / added_at → ms */
export function getGameTimestampMs(game: any): number | null {
  const created =
    game?.createdAt?.toMillis?.() ??
    (game?.createdAt?.seconds != null
      ? game.createdAt.seconds * 1000
      : null);
  if (typeof created === "number" && !Number.isNaN(created)) return created;

  const added =
    game?.added_at?.toMillis?.() ??
    (game?.added_at?.seconds != null ? game.added_at.seconds * 1000 : null);
  if (typeof added === "number" && !Number.isNaN(added)) return added;

  if (typeof game?.completed_at === "string") {
    const t = Date.parse(game.completed_at);
    if (!Number.isNaN(t)) return t;
  }

  return null;
}

export function getGameYear(game: any): number | null {
  const ms = getGameTimestampMs(game);
  if (ms == null) return null;
  return new Date(ms).getFullYear();
}

/** Bitirme kaydı bu takvim yılına mı ait? */
export function isFinishedThisYear(
  game: any,
  year: number = new Date().getFullYear()
): boolean {
  const y = getGameYear(game);
  if (y != null) return y === year;
  // createdAt yoksa (eski kayıt): sadece koleksiyon yılı ile aynıysak göster
  return year === 2026;
}

/** Bitirilen oyunu “bu yıl” koleksiyonuna da yaz (her oyuncu) */
export function shouldMirrorToThisYearList(): boolean {
  return true;
}
