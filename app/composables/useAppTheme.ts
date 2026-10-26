/** Kullanıcının seçtiği tercih (Sistem = işletim sistemini takip eder) */
export type ThemePreference = "light" | "dark" | "system";
/** Gerçekte uygulanan, çözülmüş tema */
export type ThemeMode = "light" | "dark";

const THEME_KEY = "npmrungame-theme";

let mediaQuery: MediaQueryList | null = null;
let mediaListener: (() => void) | null = null;

export function useAppTheme() {
  const preference = useState<ThemePreference>(
    "theme-preference",
    () => "system"
  );
  const theme = useState<ThemeMode>("theme", () => "dark");

  function resolve(pref: ThemePreference): ThemeMode {
    if (pref !== "system") return pref;
    if (!import.meta.client) return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(pref: ThemePreference) {
    if (!import.meta.client) return;
    const resolved = resolve(pref);
    theme.value = resolved;

    const root = document.documentElement;
    if (resolved === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.style.colorScheme = resolved;
  }

  function watchSystem() {
    if (!import.meta.client || mediaListener) return;
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaListener = () => {
      if (preference.value === "system") applyTheme("system");
    };
    mediaQuery.addEventListener("change", mediaListener);
  }

  function setTheme(pref: ThemePreference) {
    preference.value = pref;
    if (import.meta.client) {
      localStorage.setItem(THEME_KEY, pref);
    }
    watchSystem();
    applyTheme(pref);
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark");
  }

  function initTheme() {
    if (!import.meta.client) return;
    const stored = localStorage.getItem(THEME_KEY) as ThemePreference | null;
    setTheme(
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system"
    );
  }

  return { theme, preference, setTheme, toggleTheme, initTheme };
}
