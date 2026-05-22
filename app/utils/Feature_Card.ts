import type { Feature_Card } from "~/composables/core/interfaces";

export const feature_cards: Feature_Card[] = [
  {
    title: "4K Kalite",
    description:
      "60 FPS, maksimum grafik ayarları ve gerçekçi atmosfer. Oyunu tasarlandığı gibi deneyimle.",
    icon: "mdi-video-4k-box",
    path: "/discover",
  },
  {
    title: "AAA Oyunlar",
    description:
      "Cyberpunk, Elden Ring, Alan Wake gibi büyük yapımların en iyi bölümleri; analizli ve keyifli sunum.",
    icon: "mdi-trophy",
    path: "/discover",
  },
  {
    title: "Topluluk Desteği",
    description:
      "Yorumlara cevap, öneri listeleri ve yeni serileri birlikte belirleyen aktif bir izleyici kitlesi.",
    icon: "mdi-account-group",
    path: "/recommend-games",
  },
  {
    title: "Spoiler’a Saygı",
    description:
      "Önemli sahnelerde önceden uyarı. Oyunun sürprizlerini bozmayacak şekilde akıcı ilerleyiş.",
    icon: "mdi-alert",
    path: "/blogs",
  },
  {
    title: "Gerçek Oyun Anları",
    description:
      "Yapay highlight değil: clutch anları, başarısızlıklar, boss denemeleri—tamamen doğal.",
    icon: "mdi-fire",
    path: "/completed-games",
  },
  {
    title: "Sistem ve FPS Notları",
    description:
      "Hangi grafik ayarı kaç FPS veriyor, 4K mı 1440p mi? Performans gözlemleri ve pratik tavsiyeler.",
    icon: "mdi-monitor-dashboard",
    path: "/blogs",
  },
  {
    title: "Niş Indie’ler",
    description:
      "AAA dışında gözden kaçan bağımsız oyunları da keşfet. Sürpriz deneyimler ve yeni favoriler.",
    icon: "mdi-star-shooting-outline",
    path: "/discover",
  },
  {
    title: "Edit ve Hikâye Akışı",
    description:
      "Gereksiz beklemeler yok. Sahneler net, tempolu ve takip etmesi kolay şekilde düzenlenmiş içerik.",
    icon: "mdi-timeline-text",
    path: "/blogs",
  },
];
