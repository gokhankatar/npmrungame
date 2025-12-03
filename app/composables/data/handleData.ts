export const useLimitedTags = (tags: any[] = [], limit = 3) => {
  const visibleTags = tags.slice(0, limit);
  const hiddenCount = Math.max(0, tags.length - limit);
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

export const getUniquePlatformIcons = (platforms: any[] | null | undefined): string[] => {
  const safePlatforms = platforms ?? [];

  const icons = safePlatforms
    .map((p) => getPlatformIcon(p?.platform?.name))
    .filter((icon): icon is string => Boolean(icon));

  return [...new Set(icons)];
};

export const parseRequirements = (raw?: string) => {
  if (!raw) return []
  return raw
    .split('\n')
    .map(line => line.replace(/^Minimum:|^Recommended:\s*/g, ''))
    .filter(Boolean);
}

export const useTRFormat = () => {
  const formatTR = (timestamp: string | number): string => {
    const t = Number(timestamp);
    if (Number.isNaN(t)) throw new Error("Invalid timestamp");

    const date = new Date(t);

    const df = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short", // Nov
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
    // ❗ Veri yok → UI crash yerine "-" ver
    if (!timestamp) return "-";

    let date: Date | null = null;

    // Firestore timestamp objesi
    if (typeof timestamp === "object" && "seconds" in timestamp) {
      const ms =
        timestamp.seconds * 1000 +
        Math.floor(timestamp.nanoseconds / 1_000_000);
      date = new Date(ms);
    }

    // Firestore değil ama sayısal timestamp
    else if (!Number.isNaN(Number(timestamp))) {
      date = new Date(Number(timestamp));
    }

    // Son çare → direkt Date parse
    else if (typeof timestamp === "string") {
      const parsed = new Date(timestamp);
      if (!Number.isNaN(parsed.getTime())) date = parsed;
    }

    // Hâlâ çözülemediyse
    if (!date) return "-";

    try {
      // Locale bazlı parçalama (çok daha stabil)
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
      result.push(`<p class="text-grey-lighten-1 text-subtitle-2 text-sm-subtitle-1 text-lg-h5 default-title-letter font-weight-bold mb-3">${content}</p>`);
      continue;
    }

    // Subtitle (##)
    if (line.startsWith("## ")) {
      const content = line.replace(/^##\s*/, "");
      result.push(`<p class="text-grey-lighten-1 text-subtitle-2 text-lg-h6 default-title-letter font-medium mb-2">${content}</p>`);
      continue;
    }

    // Divider
    if (line.startsWith("--") || line.startsWith("—-")) {
      result.push(`<hr class="my-4 border-t border-white" />`);
      continue;
    }

    // Normal text
    result.push(`<p class="text-grey-darken-1 text-caption text-lg-subtitle-2 text-xl-subtitle-1 mb-2">${line}</p>`);
  }

  return result.join("\n");
};

