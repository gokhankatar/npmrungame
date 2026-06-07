import type { Existed_Game_Collection } from "../core/interfaces";
import { game_genres } from "~/utils/Game_Genres";

const GENRE_LABEL_BY_SLUG = Object.fromEntries(
  game_genres.map((genre) => [genre.slug, genre.name])
) as Record<string, string>;

/** RAWG genre adı → sitedeki Türkçe tür etiketi */
const GENRE_LABEL_BY_RAWG_NAME: Record<string, string> = {
  Action: "Aksiyon",
  Adventure: "Macera",
  RPG: "Rol Yapma",
  "Role-playing": "Rol Yapma",
  Shooter: "Nişancı",
  Strategy: "Strateji",
  Indie: "Indie",
  Puzzle: "Bulmaca",
  Racing: "Yarış",
  Sports: "Spor",
  Simulation: "Simülasyon",
  Platformer: "Platform",
  Fighting: "Dövüş",
  Casual: "Gündelik",
  Arcade: "Arcade",
};

type GameGenreRef = { slug?: string; name?: string };

export const formatGameGenreLabels = (
  genres: GameGenreRef[] | null | undefined,
  max = 3
): string => {
  if (!genres?.length) return "";

  return genres
    .slice(0, max)
    .map((genre) => {
      if (genre.slug && GENRE_LABEL_BY_SLUG[genre.slug]) {
        return GENRE_LABEL_BY_SLUG[genre.slug].toLowerCase();
      }
      if (genre.name && GENRE_LABEL_BY_RAWG_NAME[genre.name]) {
        return GENRE_LABEL_BY_RAWG_NAME[genre.name].toLowerCase();
      }
      return (genre.name ?? "").toLowerCase();
    })
    .filter(Boolean)
    .join(" - ");
};

export const formatGameYearAndGenres = (item: {
  released?: string;
  genres?: GameGenreRef[];
}): string => {
  const year = item.released
    ? new Date(item.released).getFullYear()
    : new Date().getFullYear();
  const genres = formatGameGenreLabels(item.genres);
  return genres ? `${year} · ${genres}` : String(year);
};

export const useLimitedTags = (tags: any[] | null | undefined, limit = 3) => {
  const safeTags = tags ?? [];
  const visibleTags = safeTags.slice(0, limit);
  const hiddenCount = Math.max(0, safeTags.length - limit);
  const hiddenText = hiddenCount > 0 ? `+${hiddenCount} more` : "";

  return { visibleTags, hiddenCount, hiddenText };
};

export const useMetacriticStyle = (score?: number) => {
  if (!score) {
    return {
      color: "grey-darken-2",
      icon: "mdi-help-circle-outline",
      text: "belirsiz",
    };
  }

  if (score >= 90) {
    return {
      color: "green-accent-2",
      icon: "mdi-fire",
      text: `${score}`,
    };
  }

  if (score >= 75) {
    return {
      color: "light-green-accent-4",
      icon: "mdi-star-circle-outline",
      text: `${score}`,
    };
  }

  if (score >= 50) {
    return {
      color: "amber-darken-3",
      icon: "mdi-star-half-full",
      text: `${score}`,
    };
  }

  return {
    color: "red-accent-4",
    icon: "mdi-thumb-down-outline",
    text: `${score}`,
  };
};

export const getActiveGamePlatformColor = (
  platform: "PC" | "PS5" | "Xbox" | "Nintendo Switch" | "En Yüksek Puanlı"
): string => {
  switch (platform) {
    case "PC":
      return "#0078D7";
    case "PS5":
      return "#003087";
    case "Xbox":
      return "#107C10";
    case "Nintendo Switch":
      return "#E60012";
    case "En Yüksek Puanlı":
      return "#FFD700";
    default:
      return "#9E9E9E";
  }
};

export const getPlatformIcon = (platformName: string): string | null => {
  const name = platformName.toLowerCase();

  if (name.includes("pc")) return "mdi-microsoft-windows";
  if (name.includes("playstation")) return "mdi-sony-playstation";
  if (name.includes("xbox")) return "mdi-microsoft-xbox";
  if (name.includes("nintendo")) return "mdi-nintendo-switch";

  return null;
};

export const formatNumber = (value: number) => {
  return value.toLocaleString("tr-TR");
};

export const getRatingColor = (averageVotes: number) => {
  if (averageVotes <= 0) return "grey-darken-2";
  if (averageVotes < 2.5) return "error";
  if (averageVotes < 4) return "#F8C555";
  return "success";
};

export const getUniquePlatformIcons = (
  platforms: any[] | null | undefined
): string[] => {
  const safePlatforms = platforms ?? [];

  const icons = safePlatforms
    .map((p) => getPlatformIcon(p?.platform?.name))
    .filter((icon): icon is string => Boolean(icon));

  return [...new Set(icons)];
};

export const parseRequirements = (raw?: string) => {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.replace(/^Minimum:|^Recommended:\s*/g, ""))
    .filter(Boolean);
};

export const useTRFormat = () => {
  const formatTR = (timestamp: string | number): string => {
    const t = Number(timestamp);
    if (Number.isNaN(t)) throw new Error("Invalid timestamp");

    const date = new Date(t);

    const df = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Europe/Istanbul",
    });

    const parts = df.formatToParts(date);
    const part = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "";

    const day = part("day");
    const month = part("month");
    const year = part("year");
    const hour = part("hour");
    const minute = part("minute");
    const second = part("second");

    return `${day} ${month} ${year} ${hour}:${minute}:${second}`;
  };

  return { formatTR };
};

export const useFirestoreDateFormatted = () => {
  const formatDateTR = (timestamp: any): string => {
    if (!timestamp) return "-";

    let date: Date | null = null;

    if (typeof timestamp === "object" && "seconds" in timestamp) {
      const ms =
        timestamp.seconds * 1000 +
        Math.floor(timestamp.nanoseconds / 1_000_000);
      date = new Date(ms);
    } else if (!Number.isNaN(Number(timestamp))) {
      date = new Date(Number(timestamp));
    } else if (typeof timestamp === "string") {
      const parsed = new Date(timestamp);
      if (!Number.isNaN(parsed.getTime())) date = parsed;
    }

    if (!date) return "-";

    try {
      const df = new Intl.DateTimeFormat("tr-TR", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Europe/Istanbul",
      });

      return df.format(date);
    } catch (_) {
      return "-";
    }
  };

  return { formatDateTR };
};

export const normalizeText = (s: any): string =>
  String(s ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const useBlogHtmlFormatter = (rawText: string): string => {
  if (!rawText) return "";

  const lines = rawText.split("\n");
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    // Main title (#)
    if (line.startsWith("# ")) {
      const content = line.replace(/^#\s*/, "");
      result.push(
        `<p class="text-grey-lighten-1 text-subtitle-2 text-sm-subtitle-1 text-lg-h5 default-title-letter font-weight-bold mb-3">${content}</p>`
      );
      continue;
    }

    // Subtitle (##)
    if (line.startsWith("## ")) {
      const content = line.replace(/^##\s*/, "");
      result.push(
        `<p class="text-grey-lighten-1 text-subtitle-2 text-lg-h6 default-title-letter font-medium mb-2">${content}</p>`
      );
      continue;
    }

    // Divider
    if (line.startsWith("--") || line.startsWith("—-")) {
      result.push(`<hr class="my-4 border-t border-white" />`);
      continue;
    }

    // Normal text
    result.push(
      `<p class="text-grey-darken-1 text-caption text-lg-subtitle-2 text-xl-subtitle-1 mb-2">${line}</p>`
    );
  }

  return result.join("\n");
};

export const extractNameFromEmail = (email: string): string => {
  if (!email || !email.includes("@")) return "";

  return email.split("@")[0] as string;
};

export const getNotificationStatusByStatus = (status: string): string => {
  if (status === "recommended_game") {
    return "oyun önerisi";
  } else if (status === "registered_user") {
    return "kullanıcı kaydı";
  } else if (status === "message") {
    return "kullanıcı mesajı";
  }

  return "bildirim";
};

export const getNotificationColorByStatus = (status: string): string => {
  if (status === "recommended_game") {
    return "#673AB7";
  } else if (status === "registered_user") {
    return "#2196F3";
  } else if (status === "message") {
    return "#4CAF50";
  }

  return "#9E9E9E";
};


export const getGameStatusTextByGameCollectionStatus = (status: Existed_Game_Collection) => {
  if (status == null) return

  if (status == "completed_games") {
    return {
      slug_msg: "Bu Oyunu Tamamladın",
      btn_text: "Tamamlananlardan Çıkar"
    }
  } else if (status == "current_games") {
    return {
      slug_msg: "Bu Oyunu Şuan Oynuyorsun",
      btn_text: "Tamamlananlara Ekle"
    }
  } else if (status == "recommended_games") {
    return {
      slug_msg: "Bu Oyun Sana Önerildi",
      btn_text: "Oynanacaklara Ekle"
    }
  } else if (status == "to_play_games") {
    return {
      slug_msg: "Bu Oyunu Oynanacaklarda",
      btn_text: "Şuan Oynanlara Ekle"
    }
  } else if (status == "upcoming_games") {
    return {
      slug_msg: "Bu Oyun Radarında",
      btn_text: "Radardan Çıkar"
    }
  }
}

export interface GameCollectionPublicInfo {
  icon: string;
  color: string;
  title: string;
  message: string;
  path?: string;
}

export const getGameCollectionPublicInfo = (
  status: Existed_Game_Collection
): GameCollectionPublicInfo | null => {
  if (status == null) return null;

  const map: Record<NonNullable<Existed_Game_Collection>, GameCollectionPublicInfo> = {
    completed_games: {
      icon: "mdi-trophy",
      color: "#69f0ae",
      title: "Bitirilen oyunlar arasında",
      message: "Bu oyun npmrungame'de tamamlanan koleksiyonda yer alıyor.",
      path: "/completed-games",
    },
    current_games: {
      icon: "mdi-gamepad-variant",
      color: "#64b5f6",
      title: "Şu an oynanıyor",
      message: "Gökhan şu an bu oyunu oynuyor — kanaldan takip edebilirsin.",
      path: "/",
    },
    recommended_games: {
      icon: "mdi-heart-plus",
      color: "#b39ddb",
      title: "Önerilenler listesinde",
      message: "Bu oyun topluluk veya kanal tarafından önerildi.",
      path: "/recommend-games",
    },
    to_play_games: {
      icon: "mdi-playlist-play",
      color: "#ffb74d",
      title: "Oynanacaklar listesinde",
      message: "Bu oyun oynanmayı bekleyenler arasında.",
      path: "/radarimdaki-oyunlar",
    },
    upcoming_games: {
      icon: "mdi-radar",
      color: "#ffb74d",
      title: "Radarımdaki oyunlar",
      message: "Bu oyun npmrungame radarında — çıkışını veya fırsatını takip ediyor.",
      path: "/radarimdaki-oyunlar",
    },
  };

  return map[status];
};