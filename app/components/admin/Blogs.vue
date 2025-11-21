<template>
  <v-row class="d-flex justify-center align-center">
    <v-col cols="12" sm="6" lg="3" v-for="(item, index) of blogs" :key="index">
      <v-card class="blog-card rounded-lg pa-2 pa-lg-5" :ripple="false">
        <v-img :src="item.imageUrl"></v-img>
      </v-card>
    </v-col>
  </v-row>

  <!-- Add Blog Pop Up -->
  <v-dialog
    v-model="isAddBlog"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.7rem);
      -webkit-backdrop-filter: blur(0.7rem);
    "
  >
    <v-form @submit.prevent="submitBlog" class="add-blog-form pa-2 pa-lg-5 rounded-lg">
      <p
        class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-lighten-1 default-title-letter"
      >
        Blog Ekle
      </p>

      <v-divider class="w-100 mb-5 mt-2" color="white" />

      <v-img v-if="previewUrl" :src="previewUrl" max-width="300" class="my-3" />

      <!-- Resim Upload -->
      <v-file-input
        label="Blog Resmi"
        accept="image/*"
        variant="outlined"
        v-model="file"
        required
        prepend-inner-icon="mdi-image"
      />

      <!-- Başlık -->
      <v-text-field
        v-model="title"
        variant="outlined"
        label="Başlık"
        required
        clearable
      />

      <!-- Anahtar Kelimeler -->
      <v-combobox
        v-model="keywords"
        label="Anahtar Kelimeler"
        multiple
        chips
        variant="outlined"
        clearable
      ></v-combobox>

      <!-- İçerik -->
      <v-textarea
        v-model="content"
        label="İçerik"
        variant="outlined"
        rows="6"
        required
        clearable
      />

      <!-- Submit -->
      <v-btn
        :loading="isSubmitting"
        type="submit"
        color="primary"
        class="mt-4"
        text="Blog Ekle"
      />
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";

const { $firestore } = useNuxtApp();
const config = useRuntimeConfig();

const isSubmitting = ref(false);
const isAddBlog = ref(false);
const isGettingBlogs = ref(false);

const blogs = ref<any[]>([]);
const file = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const title = ref("");
const content = ref("");
const keywords = ref<string[]>([]);

const uploadBlogImage = async (file: File): Promise<string> => {
  const { $supabase } = useNuxtApp(); // plugin'den Supabase client
  if (!file) throw new Error("Dosya yok!");

  // Dosya adını benzersiz yap
  const fileName = `${Date.now()}_${file.name}`;

  // Supabase bucket ismi: npmrungame_blogs
  const { data, error } = await $supabase.storage
    .from("npmrungame_blogs")
    .upload(fileName, file, { upsert: true });

  if (error) {
    console.error("Supabase upload hatası:", error);
    throw error;
  }

  // Public URL al
  const { data: urlData } = $supabase.storage
    .from("npmrungame_blogs")
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) throw new Error("Public URL alınamadı!");

  return urlData.publicUrl;
};

// Form submit
const submitBlog = async () => {
  if (!file.value) return alert("Resim seçmelisiniz!");

  isSubmitting.value = true;

  try {
    // 1️⃣ Resmi Supabase'e yükle
    const imageUrl = await uploadBlogImage(file.value);
    const blogsCollection = collection($firestore, "blogs");

    // 2️⃣ Firestore'a kaydet
    await addDoc(blogsCollection, {
      title: title.value,
      content: content.value,
      keywords: keywords.value,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    alert("Blog başarıyla eklendi!");

    // Formu temizle
    file.value = null;
    previewUrl.value = null;
    title.value = "";
    content.value = "";
    keywords.value = [];
  } catch (err) {
    console.error(err);
    alert("Blog ekleme sırasında bir hata oluştu.");
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

watch(file, async (newFile) => {
  if (!newFile) return;

  previewUrl.value = URL.createObjectURL(newFile);
});

onMounted(() => {
  getBlogsFromDb();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin_blogs.css");
</style>
