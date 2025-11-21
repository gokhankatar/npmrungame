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
  { title: "Delete", key: "delete", align: "start", sortable: false },
];

export const header_blogs: DeepReadonly<
  {
    title: string;
    key: string;
    align: "start" | "center" | "end";
    sortable: boolean;
  }[]
> = [
  { title: "Blog", key: "title", align: "start", sortable: true },
  {
    title: "Created Time",
    key: "created_time",
    align: "start",
    sortable: true,
  },
  { title: "Keywords", key: "keywords", align: "start", sortable: true },
  { title: "Action", key: "action", align: "start", sortable: false },
];
