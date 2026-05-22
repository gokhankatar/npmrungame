import _ from "lodash";

export type AdminCollectionSortMode = "added" | "new" | "old" | "meta";

const defaultSortLabels: Record<AdminCollectionSortMode, string> = {
  added: "En son eklenen",
  new: "Çıkış (yeni)",
  old: "Çıkış (eski)",
  meta: "Metacritic",
};

const defaultSortIcons: Record<AdminCollectionSortMode, string> = {
  added: "mdi-clock-outline",
  new: "mdi-calendar",
  old: "mdi-calendar-arrow-left",
  meta: "mdi-star",
};

export const defaultGetSortTimestamp = (game: any) => {
  if (game?.completed_at) return new Date(game.completed_at).getTime();
  const added = game?.added_at;
  if (added?.toMillis) return added.toMillis();
  if (added?.seconds) return added.seconds * 1000;
  return game?.released ?? 0;
};

export function useAdminCollectionList(
  defaultSort: AdminCollectionSortMode = "added"
) {
  const allGames = ref<any[]>([]);
  const games = ref<any[]>([]);
  const listSearchQuery = ref("");
  const currentSortMode = ref<AdminCollectionSortMode>(defaultSort);

  const totalGamesCount = computed(() => allGames.value.length);
  const filteredGamesCount = computed(() => games.value.length);

  const avgPlaytime = computed(() => {
    if (!allGames.value.length) return "—";
    const total = _.sumBy(allGames.value, (g: any) => Number(g.playtime) || 0);
    return (total / allGames.value.length).toFixed(1);
  });

  const avgMetacritic = computed(() => {
    const scores = allGames.value
      .map((g: any) => g.metacritic)
      .filter((v: any) => v != null && !Number.isNaN(Number(v)));
    if (!scores.length) return "—";
    return String(Math.round(_.sumBy(scores, Number) / scores.length));
  });

  const sortLabel = computed(
    () => defaultSortLabels[currentSortMode.value] ?? "Sırala"
  );

  const sortMenuIcon = computed(
    () => defaultSortIcons[currentSortMode.value] ?? "mdi-sort"
  );

  const applyListSearch = () => {
    const q = listSearchQuery.value?.trim().toLowerCase();
    if (!q || q.length < 2) {
      games.value = [...allGames.value];
      return;
    }
    games.value = allGames.value.filter((game: any) =>
      game?.name?.toLowerCase().includes(q)
    );
  };

  const debouncedListSearch = _.debounce(applyListSearch, 280);

  const onListSearchInput = () => debouncedListSearch();

  const clearListSearch = () => {
    listSearchQuery.value = "";
    applyListSearch();
  };

  const sortGames = (list: any[], type: AdminCollectionSortMode) => {
    if (!list?.length) return [];

    if (type === "meta") {
      return _.sortBy(list, (g: any) => g?.metacritic ?? 0).reverse();
    }

    if (type === "added") {
      return _.sortBy(list, defaultGetSortTimestamp).reverse();
    }

    const byReleased = _.sortBy(list, (g: any) => g?.released ?? 0);
    return type === "new" ? byReleased.reverse() : byReleased;
  };

  const sortBy = (mode: AdminCollectionSortMode) => {
    currentSortMode.value = mode;
    allGames.value = sortGames(allGames.value, mode);
    applyListSearch();
  };

  const setAllGames = (list: any[], sort: AdminCollectionSortMode = defaultSort) => {
    currentSortMode.value = sort;
    allGames.value = sortGames(list, sort);
    applyListSearch();
  };

  onUnmounted(() => {
    debouncedListSearch.cancel();
  });

  return {
    allGames,
    games,
    listSearchQuery,
    currentSortMode,
    totalGamesCount,
    filteredGamesCount,
    avgPlaytime,
    avgMetacritic,
    sortLabel,
    sortMenuIcon,
    applyListSearch,
    onListSearchInput,
    clearListSearch,
    sortBy,
    setAllGames,
  };
}
