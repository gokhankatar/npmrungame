<template>
  <v-row class="d-flex justify-center align-center w-100">
    <v-col cols="12" lg="10">
      <v-data-table :headers="header_blogs" :loading="isGettingBlogs" :items="blogs"
        class="admin-data-table rounded-lg w-100" items-per-page-text="Sayfa Başı Oyun Sayısı" hover>
        <template #item="{ item, index }">
          <tr class="table-row cursor-pointer" @click="handleRowClick(item)">
            <td>
              <div class="d-flex align-center ga-1 ga-lg-2 py-2">
                <img :src="item.imageUrl" width="100" class="rounded-lg h-100" cover />
                <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
                  {{ truncateText(item.title, 30) }}
                </p>
              </div>
            </td>

            <td>
              <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
                {{ formatTR(item.createdAt?.seconds) }}
              </p>
            </td>

            <td>
              <div class="d-flex align-center ga-1 flex-wrap py-1">
                <v-chip v-for="(keyword, index) in item.keywords" :key="index"
                  :size="isSmallScreen ? 'x-small' : 'small'" color="green-accent-2" variant="tonal" :ripple="false"
                  :text="keyword" />
              </div>
            </td>

            <td>
              <v-btn @click.stop="handleRowClick(item)" variant="tonal" prepend-icon="mdi-delete"
                class="text-caption text-lg-subtitle-2 default-title-letter rounded-xl" text="Sil" color="error"
                block />
            </td>
          </tr>
        </template>

        <template #loading>
          <v-skeleton-loader class="bg-transparent" :type="blogs?.length > 10
            ? 'table-row@10'
            : `table-row@${blogs?.length}`
            " />
        </template>
      </v-data-table>
    </v-col>

    <v-col cols="12" lg="10">
      <v-btn @click="isAddBlog = true" :ripple="false" color="green-accent-2" text="Blog Ekle" prepend-icon="mdi-plus"
        class="float-right" :block="isSmallScreen ? true : false" />
    </v-col>
  </v-row>

  <!-- Add Blog Pop Up -->
  <v-dialog v-model="isAddBlog" :max-width="600" style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.7rem);
      -webkit-backdrop-filter: blur(0.7rem);
    ">
    <v-form ref="addBlogForm" @submit.prevent="submitBlog"
      class="add-blog-form overflow-y-auto pa-2 pa-lg-5 rounded-lg">
      <p class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-lighten-1 default-title-letter">
        Blog Ekle
      </p>

      <v-btn class="close-icon-in-add-blog-form ma-1 ma-lg-2" icon="mdi-close" color="grey-lighten-1" size="small"
        :ripple="false" @click="isAddBlog = false" variant="text" />

      <v-divider class="w-100 mb-5 mt-2" color="white" />

      <v-img v-if="formModels.previewUrl" :src="formModels.previewUrl" max-width="300" class="my-3 rounded-lg" />

      <v-file-input label="Blog Resmi" :rules="rules.file" accept="image/*" class="text-grey-lighten-1" prepend-icon=""
        color="grey-lighten-1" :density="isSmallScreen ? 'compact' : 'comfortable'" variant="outlined"
        v-model="formModels.file" required prepend-inner-icon="mdi-image" />

      <v-text-field v-model="formModels.title" :rules="rules.title" :density="isSmallScreen ? 'compact' : 'comfortable'"
        variant="outlined" label="Başlık" prepend-inner-icon="mdi-subtitles-outline"
        class="text-caption text-lg-subtitle-2 default-title-letter text-grey-lighten-1" required clearable />

      <v-combobox v-model="formModels.keywords" :density="isSmallScreen ? 'compact' : 'comfortable'"
        class="text-caption text-lg-subtitle-2 default-title-letter text-grey-lighten-1" label="Anahtar Kelimeler"
        prepend-inner-icon="mdi-key" multiple chips variant="outlined" clearable></v-combobox>

      <v-textarea v-model="formModels.content" :rules="rules.content"
        :density="isSmallScreen ? 'compact' : 'comfortable'" label="İçerik" prepend-inner-icon="mdi-text"
        class="text-caption text-lg-subtitle-2 default-title-letter text-grey-lighten-1" variant="outlined" rows="3"
        required clearable />

      <!-- Submit -->
      <v-btn :loading="isSubmitting" :ripple="false" variant="tonal" prepend-icon="mdi-send" type="submit"
        color="green-accent-2" class="mt-4" text="Blog Ekle" />
    </v-form>
  </v-dialog>

  <v-snackbar v-model="blogToastModels.blogToastBar" :text="blogToastModels.msg" :color="blogToastModels.color"
    variant="tonal" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import type { Add_Blog_Form_Model } from "~/composables/core/interfaces";
import { VForm } from "vuetify/components";
import { header_blogs } from "~/composables/data/headerTables";
import { truncateText } from "~/composables/core/basicFunc";
import { useTRFormat } from "~/composables/data/handleData";

const { $firestore } = useNuxtApp();
const config = useRuntimeConfig();
const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value)

const isSubmitting = ref(false);
const isAddBlog = ref(false);
const isGettingBlogs = ref(false);

const addBlogForm = ref<InstanceType<typeof VForm> | null>(null);

const blogToastModels = ref({
  blogToastBar: false,
  color: "",
  msg: ""
})

const { formatTR } = useTRFormat()

const blogs = ref<any[]>([]);

const formModels = ref<Add_Blog_Form_Model>({
  title: "",
  content: "",
  file: null,
  keywords: null,
  previewUrl: ""
})

const rules = ref({
  file: [
    (v: string) => !!v || "Resim Gerekli!",
  ],
  title: [
    (v: string) => !!v || "Başlık Gerekli!",
    (v: string) => (v && v.length >= 6) || "Başlık en az 6 karakter olmalı!",
  ],
  content: [
    (v: string) => !!v || "İçerik Gerekli!",
    (v: string) => (v && v.length >= 50) || "İçerik en az 50 karakter olmalı!",
  ],
});

const uploadBlogImage = async (file: File): Promise<string> => {
  const { $supabase } = useNuxtApp();
  if (!file) throw new Error("Dosya yok!");

  const fileName = `${Date.now()}_${file.name}`;

  const { data, error } = await $supabase.storage
    .from("npmrungame_blogs")
    .upload(fileName, file, { upsert: true });

  if (error) {
    console.error("Supabase upload hatası:", error);
    throw error;
  }

  const { data: urlData } = $supabase.storage
    .from("npmrungame_blogs")
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) throw new Error("Public URL alınamadı!");

  return urlData.publicUrl;
};

// Form submit
const submitBlog = async () => {

  const result = await addBlogForm.value?.validate();
  if (!result || !result.valid) return;

  isSubmitting.value = true;

  try {
    // 1️⃣ Upload Img To Supabase
    const imageUrl = await uploadBlogImage(formModels.value?.file!);
    const blogsCollection = collection($firestore, "blogs");

    // 2️⃣ Add To Firebase
    await addDoc(blogsCollection, {
      title: formModels.value?.title,
      content: formModels.value?.content,
      keywords: formModels.value?.keywords,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    blogToastModels.value.msg = "Blog başarı ile eklendi!"
    blogToastModels.value.color = "success"
    blogToastModels.value.blogToastBar = true

    formModels.value.file = null;
    formModels.value.previewUrl = null;
    formModels.value.title = "";
    formModels.value.content = "";
    formModels.value.keywords = [];
  } catch (err) {
    console.error(err);

    blogToastModels.value.msg = "Blog eklerken hata oluştu!"
    blogToastModels.value.color = "error"
    blogToastModels.value.blogToastBar = true
  } finally {
    isSubmitting.value = false;
  }
};

const getBlogsFromDb = async () => {
  try {
    isGettingBlogs.value = true;
    const blogsCol = collection($firestore, "blogs");
    const blogsSnapshot = await getDocs(blogsCol);

    const blogsList = blogsSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    console.log("blogs list", blogsList);

    blogs.value = blogsList;
  } catch (error: any) {
    console.error("Error while getting blogs : ", error.message);
  } finally {
    isGettingBlogs.value = false;
  }
};

const handleRowClick = (item: any) => {
  console.log(item)
}

watch(formModels.value?.file!, async (newFile) => {
  if (!newFile) return;

  formModels.value.previewUrl = URL.createObjectURL(newFile);
});

onMounted(() => {
  getBlogsFromDb();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
@import url("~/assets/css/admin_blogs.css");
</style>
