export type PlayNoteItem = {
  id: string;
  text: string;
  youtubeUrl?: string;
  /** Linkte gömülü başlangıç saniyesi (opsiyonel) */
  youtubeStartSeconds?: number;
  youtubeVideoId?: string;
  youtubeThumb?: string;
  done?: boolean;
  createdAt: string;
};

export const createPlayNoteId = () =>
  `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const isValidYoutubeUrl = (url: string) => {
  const raw = url.trim();
  if (!raw) return true;
  return Boolean(extractYoutubeVideoId(raw));
};

/** youtube.com / youtu.be / shorts / embed → video id */
export const extractYoutubeVideoId = (url: string): string | null => {
  const raw = url.trim();
  if (!raw) return null;

  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(withProto);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{6,}$/.test(id) ? id : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (u.searchParams.get("v")) {
        const id = u.searchParams.get("v")!;
        return /^[\w-]{6,}$/.test(id) ? id : null;
      }
      const parts = u.pathname.split("/").filter(Boolean);
      // /shorts/ID, /embed/ID, /live/ID
      if (
        parts.length >= 2 &&
        ["shorts", "embed", "live", "v"].includes(parts[0]!)
      ) {
        const id = parts[1]!;
        return /^[\w-]{6,}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
};

/** `t=90`, `t=1m30s`, `start=90` → saniye */
export const parseYoutubeStartSeconds = (url: string): number | undefined => {
  try {
    const withProto = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const u = new URL(withProto);
    const t = u.searchParams.get("t") || u.searchParams.get("start");
    if (!t) return undefined;

    if (/^\d+$/.test(t)) return Number(t);

    const match = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
    if (!match) return undefined;
    const h = Number(match[1] || 0);
    const m = Number(match[2] || 0);
    const s = Number(match[3] || 0);
    const total = h * 3600 + m * 60 + s;
    return total > 0 ? total : undefined;
  } catch {
    return undefined;
  }
};

export const youtubeThumbnailUrl = (
  videoId: string,
  quality: "hq" | "mq" | "sd" | "max" = "hq"
) => {
  const map = {
    max: "maxresdefault",
    hq: "hqdefault",
    mq: "mqdefault",
    sd: "sddefault",
  } as const;
  return `https://img.youtube.com/vi/${videoId}/${map[quality]}.jpg`;
};

export const formatTimestampLabel = (totalSeconds?: number) => {
  if (totalSeconds == null || totalSeconds <= 0) return "";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const minutesSecondsToTotal = (minutes: number, seconds: number) => {
  const m = Math.max(0, Math.floor(minutes) || 0);
  const s = Math.min(59, Math.max(0, Math.floor(seconds) || 0));
  return m * 60 + s;
};

/** Link + opsiyonel dk/sn → t= parametreli watch URL */
export const buildYoutubeWatchUrl = (
  rawUrl: string,
  startSeconds?: number
): string | undefined => {
  const id = extractYoutubeVideoId(rawUrl);
  if (!id) return undefined;

  const fromLink = parseYoutubeStartSeconds(rawUrl);
  const t =
    startSeconds != null && startSeconds > 0
      ? startSeconds
      : fromLink && fromLink > 0
        ? fromLink
        : undefined;

  const base = `https://www.youtube.com/watch?v=${id}`;
  return t ? `${base}&t=${t}` : base;
};

export const normalizeYoutubeUrl = (url: string, startSeconds?: number) =>
  buildYoutubeWatchUrl(url, startSeconds) || url.trim();

export const playNotesCount = (
  game: { playNotes?: PlayNoteItem[] } | null | undefined
) => (Array.isArray(game?.playNotes) ? game!.playNotes!.length : 0);

/** Firestore updateDoc undefined kabul etmez — sadece dolu alanları yaz */
export const sanitizePlayNoteForFirestore = (
  note: PlayNoteItem
): Record<string, unknown> => {
  const out: Record<string, unknown> = {
    id: note.id,
    text: note.text,
    done: Boolean(note.done),
    createdAt: note.createdAt || new Date().toISOString(),
  };

  if (note.youtubeUrl) out.youtubeUrl = note.youtubeUrl;
  if (note.youtubeVideoId) out.youtubeVideoId = note.youtubeVideoId;
  if (note.youtubeThumb) out.youtubeThumb = note.youtubeThumb;
  if (
    typeof note.youtubeStartSeconds === "number" &&
    note.youtubeStartSeconds > 0
  ) {
    out.youtubeStartSeconds = note.youtubeStartSeconds;
  }

  return out;
};

export const sanitizePlayNotesForFirestore = (notes: PlayNoteItem[]) =>
  notes.map(sanitizePlayNoteForFirestore);
