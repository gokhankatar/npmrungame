import { ref } from "vue";
import { collection, getDocs } from "firebase/firestore";
import type { Existed_Game_Collection } from "../core/interfaces";

export const useGameCollectionStatus = ($firestore: any) => {
    const gameCollectionStatus = ref<Existed_Game_Collection>(null);
    const isGettingGameStatus = ref(false);

    const getGameCollectionStatus = async (gameId?: string | number) => {
        try {
            isGettingGameStatus.value = true;

            if (!gameId) {
                gameCollectionStatus.value = null;
                return;
            }

            const collectionsMap: {
                key: Existed_Game_Collection;
                name: string;
            }[] = [
                    { key: "completed_games", name: "completed_games" },
                    { key: "current_games", name: "current_games" },
                    { key: "to_play_games", name: "to_play_games" },
                    { key: "recommended_games", name: "recommended_games" },
                ];

            for (const col of collectionsMap) {
                const colRef = collection($firestore, col.name);
                const snapshot = await getDocs(colRef);

                const exists = snapshot.docs.some(
                    (doc) => doc.data()?.id === gameId
                );

                if (exists) {
                    gameCollectionStatus.value = col.key;
                    return col.key;
                }
            }

            gameCollectionStatus.value = null;
            return null;
        } catch (err) {
            console.error("useGameCollectionStatus error:", err);
            gameCollectionStatus.value = null;
            return null;
        } finally {
            isGettingGameStatus.value = false;
        }
    };

    return {
        gameCollectionStatus,
        isGettingGameStatus,
        getGameCollectionStatus,
    };
};
