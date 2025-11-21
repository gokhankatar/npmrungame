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
    if (!timestamp) throw new Error("Timestamp yok");

    let date: Date;

    // Firestore timestamp objesi
    if (typeof timestamp === "object" && "seconds" in timestamp) {
      const ms =
        timestamp.seconds * 1000 +
        Math.floor(timestamp.nanoseconds / 1_000_000);
      date = new Date(ms);
    } else {
      const t = Number(timestamp);
      if (Number.isNaN(t)) throw new Error("Geçersiz timestamp");
      date = new Date(t);
    }

    // GMT+03:00 kısmını istemediğin için custom format
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "Oca", "Şub", "Mar", "Nis", "May", "Haz",
      "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    const ss = date.getSeconds().toString().padStart(2, "0");

    // Sonuç ↓
    return `${day} ${month} ${year} ${hh}:${mm}:${ss}`;
  };

  return { formatDateTR };
};
