import type { DeepReadonly } from "vue";

export const header_completed_games: DeepReadonly<
    {
        title: string;
        key: string;
        align: "start" | "center" | "end";
        sortable: boolean;
    }[]
> = [
        { title: "Name", key: "name", align: "start", sortable: true },
        { title: "Release Date", key: "released", align: "start", sortable: true },
        { title: "Genres", key: "genres", align: "start", sortable: true },
        { title: "Platforms", key: "platforms", align: "start", sortable: true },
        { title: "Metacritic", key: "metacritic", align: "start", sortable: true },
        { title: "Delete", key: "delete", align: "start", sortable: false }
    ];
