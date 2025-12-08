<template>
  <v-responsive height="100" v-if="!display.smAndDown.value" />
  <v-responsive height="70" v-else />

  <v-container class="pa-2 pa-md-5 pa-lg-10 pa-xl-15">
    <v-row class="w-100 mx-auto d-flex justify-center align-center">
      <v-col cols="12" class="d-flex flex-column align-center align-sm-start ga-6">
        <!-- Avatar -->
        <v-avatar :image="profileImgSrc" :size="display.smAndDown.value ? 120 : 200" />

        <!-- Info Section -->
        <div class="d-flex flex-column align-center align-sm-start ga-2 ga-lg-5">
          <!-- Email -->
          <a
            href="mailto:katar_gokhan@hotmail.com"
            class="text-decoration-none"
            target="_blank"
          >
            <div class="d-flex align-center ga-2 cursor-pointer">
              <v-icon
                icon="mdi-email"
                :size="display.smAndDown.value ? 'small' : 'large'"
                color="grey-lighten-1"
              />
              <p
                class="text-subtitle-2 text-sm-subtitle-1 text-lg-h5 text-grey-lighten-1"
              >
                katar_gokhan@hotmail.com
              </p>
            </div>
          </a>

          <!-- Name -->
          <p
            class="text-blue-grey-darken-1 text-h5 text-sm-h4 text-lg-h3 font-weight-medium"
          >
            Gökhan Katar
          </p>

          <!-- Description -->
          <p
            class="text-center text-sm-start text-grey-lighten-1 text-body-2 text-sm-body-1"
          >
            1996 Ankara doğumluyum. Kariyerime siber güvenlik alanında başlayarak yazılım
            mimarisi ve güvenli uygulama geliştirme konularında derinleşiyorum.
            Profesyonel hayatımda modern web teknolojilerini, ölçeklenebilir sistem
            tasarımlarını ve güvenli kodlama prensiplerini aktif olarak kullanarak yüksek
            performanslı, sürdürülebilir ve güvenilir çözümler üretmeye odaklanıyorum.

            <br /><br />

            Teknolojiyle olan bağım çok küçük yaşlarda başladı. Bilgisayar oyunlarına
            duyduğum merak, makinelerin nasıl çalıştığını çözme isteği ve yazılımla olan
            ilk temaslarım zamanla güçlü bir tutkuya dönüştü. Bugün hem işimde hem de
            kişisel projelerimde sürekli kendimi geliştirmeye, yeni teknolojileri yakından
            takip etmeye ve öğrendiklerimi gerçek dünyaya değer katan projelere
            dönüştürmeye çalışıyorum.

            <br /><br />

            İşin dışında aktif olarak içerik ürettiğim <strong>npmrungame</strong> adlı
            YouTube kanalımda farklı oyun türlerini deneyimliyor; AAA yapımlardan bağımsız
            oyunlara, 4K kalite oyun deneyimlerinden incelemelere kadar geniş bir
            yelpazede içerikler hazırlıyorum. Oyunlara olan ilgim hem yaratıcılığımı canlı
            tutuyor hem de kullanıcı deneyimine farklı bir perspektiften yaklaşmamı
            sağlıyor. Bu sayede hem tasarladığım sistemlerde hem de geliştirdiğim
            arayüzlerde oyuncu odaklı düşünme becerimi de sürekli olarak güçlendiriyorum.

            <br /><br />

            Her projeye aynı motivasyonla yaklaşıyorum: sağlam, yaratıcı ve uzun ömürlü
            işler ortaya koymak. Hem kullanıcı deneyimini hem de güvenliği ön planda
            tutarak, farklı disiplinleri bir araya getiren çözümler üretmeye çalışıyorum.
            Kendime sürekli daha iddialı hedefler koyuyor, bu hedeflere ulaşmak için
            öğrenmeye, üretmeye ve ilerlemeye devam ediyorum.
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
useHead({
  title: "npmrungame | Hakkımda",
});

const display = useDisplay();

const profileImgSrc = ref<string>(
  "https://gbfhkvefbnlgkqaqqwxp.supabase.co/storage/v1/object/public/gokhan_katar_profile/profile_img.jpg"
);
</script>

<style scoped>
@import "~/assets/css/main.css";
</style>
