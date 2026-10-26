import type { Locale } from "~/utils/i18nMessages";
import { messages } from "~/utils/i18nMessages";

const LOCALE_KEY = "npmrungame-locale";
const STATE_KEY = "app-locale";

function resolveLocale(value: unknown): Locale {
  return value === "en" || value === "tr" ? value : "tr";
}

export function useAppLocale() {
  const locale = useState<Locale>(STATE_KEY, () => "tr");

  /** `t` adı bazı tooling ile çakışabiliyor — template'te `tx` kullan */
  function tx(key: string): string {
    const loc = resolveLocale(locale.value);
    return messages[loc][key] ?? messages.tr[key] ?? key;
  }

  function setLocale(next: Locale) {
    locale.value = resolveLocale(next);
    if (import.meta.client) {
      localStorage.setItem(LOCALE_KEY, locale.value);
      document.documentElement.lang = locale.value;
    }
  }

  function initLocale() {
    if (!import.meta.client) return;
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === "tr" || stored === "en") {
      setLocale(stored);
    } else {
      document.documentElement.lang = resolveLocale(locale.value);
    }
  }

  return { locale, setLocale, initLocale, tx };
}
