/** Kullanıcının seçtiği tercih (Sistem = işletim sistemini takip eder) */
export type ThemePreference = "light" | "dark" | "system";
/** Gerçekte uygulanan, çözülmüş tema */
export type ThemeMode = "light" | "dark";

const THEME_KEY = "npmrungame-theme";
const RESOLVED_KEY = "npmrungame-theme-resolved";

let mediaQuery: MediaQueryList | null = null;
let mediaListener: (() => void) | null = null;

function isPreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function isMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function useAppTheme() {
  /** Cookie → SSR ve client aynı temayı görür (hydration mismatch önler) */
  const preferenceCookie = useCookie<ThemePreference>(THEME_KEY, {
    default: () => "system",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  const resolvedCookie = useCookie<ThemeMode>(RESOLVED_KEY, {
    default: () => "dark",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  const preference = useState<ThemePreference>("theme-preference", () =>
    isPreference(preferenceCookie.value) ? preferenceCookie.value : "system"
  );

  const theme = useState<ThemeMode>("theme", () => {
    if (isMode(resolvedCookie.value)) return resolvedCookie.value;
    if (preference.value === "light" || preference.value === "dark") {
      return preference.value;
    }
    return "dark";
  });

  function resolve(pref: ThemePreference): ThemeMode {
    if (pref !== "system") return pref;
    if (!import.meta.client) {
      return isMode(resolvedCookie.value) ? resolvedCookie.value : "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function paintRoot(resolved: ThemeMode) {
    if (!import.meta.client) return;
    const bg = resolved === "dark" ? "#070b14" : "#b9c1cf";
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    root.style.backgroundColor = bg;
    root.style.setProperty("--app-bg", bg);
  }

  function applyTheme(pref: ThemePreference) {
    const resolved = resolve(pref);
    theme.value = resolved;
    preferenceCookie.value = pref;
    resolvedCookie.value = resolved;
    paintRoot(resolved);
  }

  // SSR + client: html.dark + --app-bg Nuxt useHead ile senkron
  useHead({
    htmlAttrs: {
      class: computed(() => ({ dark: theme.value === "dark" })),
      style: computed(
        () =>
          `color-scheme:${theme.value};background-color:${
            theme.value === "dark" ? "#070b14" : "#b9c1cf"
          };--app-bg:${theme.value === "dark" ? "#070b14" : "#b9c1cf"}`
      ),
    },
  });

  if (import.meta.client) {
    watch(
      theme,
      (resolved) => {
        paintRoot(resolved);
      },
      { immediate: true }
    );
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
    const stored = localStorage.getItem(THEME_KEY);
    const pref = isPreference(stored)
      ? stored
      : isPreference(preferenceCookie.value)
        ? preferenceCookie.value
        : "system";
    // Zaten aynıysa DOM/state'i yeniden yazma (hydration sonrası gereksiz flash)
    if (pref === preference.value && resolve(pref) === theme.value) {
      watchSystem();
      return;
    }
    setTheme(pref);
  }

  return { theme, preference, setTheme, toggleTheme, initTheme };
}
