<template>
  <v-stepper-vertical
    v-model="step"
    :mandatory="false"
    color="green-accent-2"
    next-text="Sonraki"
    prev-text="Önceki"
    class="d-flex flex-column ga-2"
    multiple
    icon="mdi-comment-question-outline"
    non-linear
    :hide-actions="display.xs.value"
  >
    <!-- SSS 1 -->
    <v-stepper-vertical-item
      title="npmrungame nedir?"
      class="text-caption text-sm-subtitle-2 text-md-subtitle-1 text-lg-h5"
      value="5"
      editable
    >
      <p class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter">
        npmrungame, YouTube oyun kanalı olmak dısında, oyun severlerin yeni oyunları
        keşfedebileceği, oynadıkları oyunları paylaşabileceği ve arkadaşlarına
        önerebileceği bir platformdur. Algoritmamız, oyun tercihlerine uygun öneriler
        sunar ve tamamen ücretsizdir.
      </p>
    </v-stepper-vertical-item>

    <!-- SSS 2 -->
    <v-stepper-vertical-item
      title="Oyun önerileri nasıl çalışacak?"
      class="text-caption text-sm-subtitle-2 text-md-subtitle-1 text-lg-h5"
      value="6"
      editable
    >
      <p class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter">
        Oyun öneri motorumuz, oynadığınız oyunları ve beğenilerinizi analiz eder. Böylece
        size ilginizi çekebilecek benzer oyunları listeler. Yakında yapay zekâ destekli
        önerilerle daha güçlü bir sistem sunacağız.
      </p>
    </v-stepper-vertical-item>

    <!-- SSS 3 -->
    <v-stepper-vertical-item
      title="Oyunlarımı veya favori oyunlarımı paylaşabilecek miyim?"
      class="text-caption text-sm-subtitle-2 text-md-subtitle-1 text-lg-h5"
      value="7"
      editable
    >
      <p class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter">
        Evet! 2026 yılı içinde (yol haritamızdan bakabilirsiniz), oyunlarınızı platformda paylaşabilecek ve diğer kullanıcıların önerilerini
        görebileceksiniz. Ayrıca yorum yapabilecek, beğenebilecek ve favorilerinizi
        kaydedebileceksiniz.
      </p>
    </v-stepper-vertical-item>

    <!-- SSS 4 -->
    <v-stepper-vertical-item
      title="Projelerimle ilgili etkileşim alabilir miyim?"
      class="text-caption text-sm-subtitle-2 text-md-subtitle-1 text-lg-h5"
      value="8"
      editable
    >
      <p class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter">
        Sadece oyun değil, aynı zamanda geliştirdiğiniz projeleri paylaşabilir ve
        kullanıcı geri bildirimleri alabilirsiniz. Platform, oyun ve projeler arasında
        etkileşimi kolaylaştıracak şekilde tasarlandı.
      </p>
    </v-stepper-vertical-item>

    <!-- SSS 5 -->
    <v-stepper-vertical-item
      title="İletişim veya destek almak istiyorum, nasıl ulaşabilirim?"
      class="text-caption text-sm-subtitle-2 text-md-subtitle-1 text-lg-h5"
      value="9"
      editable
    >
      <p class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter">
        Bizimle iletişime geçmek çok kolay! Sitede yer alan iletişim formunu kullanabilir,
        projeler veya oyun önerileri hakkında sorularınızı iletebilirsiniz. Ayrıca YouTube
        kanalımız üzerinden de içerik ve destek alabilirsiniz.
      </p>
    </v-stepper-vertical-item>
  </v-stepper-vertical>
</template>

<script lang="ts" setup>
const display = useDisplay();
const step = shallowRef([5]);
</script>

<style scoped>
@import url("~/assets/css/main.css");
</style>
