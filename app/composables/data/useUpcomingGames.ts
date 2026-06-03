import { collection, getDocs } from "firebase/firestore";
import {
  countReleasingThisYear,
  countReleasingWithinDays,
  findNextUpcoming,
  sortByReleaseDate,
  UPCOMING_GAMES_COLLECTION,
  type UpcomingGame,
} from "~/utils/upcomingGames";

export const useUpcomingGames = () => {
  const { $firestore } = useNuxtApp();

  const games = ref<UpcomingGame[]>([]);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  const sortedGames = computed(() => sortByReleaseDate(games.value));
  const nextGame = computed(() => findNextUpcoming(games.value));
  const soonCount = computed(() => countReleasingWithinDays(games.value, 30));
  const thisYearCount = computed(() => countReleasingThisYear(games.value));

  const fetchUpcomingGames = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const snapshot = await getDocs(collection($firestore, UPCOMING_GAMES_COLLECTION));
      games.value = snapshot.docs.map((d) => ({
        firestoreId: d.id,
        ...(d.data() as Omit<UpcomingGame, "firestoreId">),
      }));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Veri yüklenemedi";
      error.value = message;
      console.error("Upcoming games:", e);
      games.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    games,
    sortedGames,
    nextGame,
    soonCount,
    thisYearCount,
    isLoading,
    error,
    fetchUpcomingGames,
  };
};
