<template>
  <v-timeline
    align="start"
    dot-color="blue-grey-darken-1"
    :density="display.xs.value ? 'compact' : 'default'"
  >
    <!-- Q1 -->
    <v-timeline-item
      class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter"
    >
      <template v-slot:opposite>
        <p
          class="text-subtitle-1 text-xl-h5 default-title-letter font-weight-bold text-blue-grey-lighten-3"
        >
          2026 Q1
        </p>
      </template>
      <div>
        <div
          class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1"
        >
          Oyun Bulma Motoru
        </div>

        <v-divider v-if="!display.xs.value" class="w-50 mt-1 mb-2" />

        <p class="text-caption text-lg-subtitle-2 text-grey-darken-1">
          İki oyun önereceksiniz ve kusursuz algoritmam size en uygun oyunları çıkaracak.
          Çok sayıda oyuncunun ihtiyaç duyacağı ve kullanmaktan keyif alacağı bu algoritma
          tamamen ücretsiz olacak.
        </p>
      </div>
    </v-timeline-item>

    <!-- Q2 -->
    <v-timeline-item
      class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter"
    >
      <template v-slot:opposite>
        <p
          class="text-subtitle-1 text-xl-h5 default-title-letter font-weight-bold text-blue-grey-lighten-3"
        >
          2026 Q2
        </p>
      </template>
      <div>
        <div
          class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1"
        >
          Kullanıcı Etkileşimi ve İçerikler
        </div>

        <v-divider v-if="!display.xs.value" class="w-50 mt-1 mb-2" />

        <p class="text-caption text-lg-subtitle-2 text-grey-darken-1">
          Artık oyunları yorumlayabilir, beğenebilir ve paylaşabilirsiniz. Kullanıcıların
          etkileşimleri platforma yön verecek ve içerikler daha da zenginleşecek. Sosyal
          bir deneyim için ilk adımlar atılıyor.
        </p>
      </div>
    </v-timeline-item>

    <!-- Q3 -->
    <v-timeline-item
      class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter"
    >
      <template v-slot:opposite>
        <p
          class="text-subtitle-1 text-xl-h5 default-title-letter font-weight-bold text-blue-grey-lighten-3"
        >
          2026 Q3
        </p>
      </template>
      <div>
        <div
          class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1"
        >
          Entegre Uygulamalar ve Yapay Zeka Destekli Öneriler
        </div>

        <v-divider v-if="!display.xs.value" class="w-50 mt-1 mb-2" />

        <p class="text-caption text-lg-subtitle-2 text-grey-darken-1">
          Steam, Epic ve diğer platformlarla entegrasyon sağlanacak. Yapay zeka, oyun
          tercihlerinizi analiz edecek ve size daha güçlü öneriler sunacak. Tüm
          etkileşimler ve veriler platformda kayıt altında tutulacak.
        </p>
      </div>
    </v-timeline-item>

    <!-- Q4 -->
    <v-timeline-item
      class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter"
    >
      <template v-slot:opposite>
        <p
          class="text-subtitle-1 text-xl-h5 default-title-letter font-weight-bold text-blue-grey-lighten-3"
        >
          2026 Q4
        </p>
      </template>
      <div>
        <div
          class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1"
        >
          Sürpriz Gelişme 🎉
        </div>

        <v-divider v-if="!display.xs.value" class="w-50 mt-1 mb-2" />

        <p class="text-caption text-lg-subtitle-2 text-grey-darken-1">
          Büyük bir yenilik geliyor! Hem npmrungame ekosistemi için hem de kullanıcıları
          ve izleyicileri için büyük bir proje geliyor.
        </p>
      </div>
    </v-timeline-item>
  </v-timeline>
</template>

<script lang="ts" setup>
const display = useDisplay();
</script>

<style scoped>
@import url("~/assets/css/main.css");
</style>
