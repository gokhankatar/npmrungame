import type { DeepReadonly } from "vue";

export const header_completed_games: DeepReadonly<
  {
    title: string;
    key: string;
    align: "start" | "center" | "end";
    sortable: boolean;
  }[]
> = [
    { title: "Oyun Adı", key: "name", align: "start", sortable: true },
    { title: "Çıkış Tarihi", key: "released", align: "start", sortable: true },
    { title: "Türler", key: "genres", align: "start", sortable: true },
    { title: "Platformlar", key: "platforms", align: "start", sortable: true },
    { title: "Metacritic", key: "metacritic", align: "start", sortable: true },
    { title: "Sil", key: "delete", align: "start", sortable: false },
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
      title: "Kayıt Tarihi",
      key: "created_time",
      align: "start",
      sortable: true,
    },
    { title: "Anahtar Kelime", key: "keywords", align: "start", sortable: true },
    { title: "Aksiyon", key: "action", align: "start", sortable: false },
  ];


export const header_registered_users: DeepReadonly<
  {
    title: string;
    key: string;
    align: "start" | "center" | "end";
    sortable: boolean;
  }[]
> = [
    { title: "Kullanıcı", key: "title", align: "start", sortable: true },
    { title: "Email", key: "title", align: "start", sortable: true },
    {
      title: "Kayıt Tarihi",
      key: "created_time",
      align: "start",
      sortable: true,
    },
    { title: "Aksiyon", key: "action", align: "start", sortable: false },
  ];
