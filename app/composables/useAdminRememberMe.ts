const STORAGE_KEY = "npmrungame_admin_remember";

export type AdminRememberData = {
  enabled: boolean;
  email: string;
  password: string;
};

export function useAdminRememberMe() {
  const save = (email: string, password: string) => {
    if (!import.meta.client) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ enabled: true, email, password } satisfies AdminRememberData)
    );
  };

  const load = (): AdminRememberData | null => {
    if (!import.meta.client) return null;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw) as AdminRememberData;
      if (!data?.enabled || !data.email) return null;

      return data;
    } catch {
      return null;
    }
  };

  const clear = () => {
    if (!import.meta.client) return;
    localStorage.removeItem(STORAGE_KEY);
  };

  return { save, load, clear };
}
