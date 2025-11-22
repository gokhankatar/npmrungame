<template>
  <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
    <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
      <div
        class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5"
      >
        <v-icon icon="mdi-post-outline" :size="isSmallScreen ? 'small' : 'x-large'" />
        <p
          class="shadowed-text text-subtitle-2 text-sm-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter"
        >
          Bloglar
          <strong class="font-weight-bold default-title-letter"
            >({{ blogs?.length }})</strong
          >
        </p>
      </div>

      <v-btn
        icon="mdi-refresh"
        class="rounded text-caption text-lg-subtitle-2"
        :ripple="false"
        variant="tonal"
        @click="getBlogsFromDb"
        :size="isSmallScreen ? 'x-small' : 'small'"
        :loading="isGettingBlogs"
      />
    </v-col>

    <v-col cols="12" lg="10">
      <v-data-table
        :headers="header_blogs"
        :loading="isGettingBlogs"
        :items="blogs"
        class="admin-data-table rounded-lg w-100"
        items-per-page-text="Sayfa Başı Blog Sayısı"
        hover
      >
        <template #item="{ item, index }">
          <tr class="table-row cursor-pointer" @click="handleRowClick(item)">
            <td>
              <div class="d-flex align-center ga-1 ga-lg-2 py-2">
                <img
                  :src="item.imageUrl"
                  :width="isLargeScreen ? 75 : 40"
                  class="rounded-lg h-100"
                  cover
                />
                <p
                  class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
                >
                  {{
                    isLargeScreen
                      ? truncateText(item.title, 40)
                      : truncateText(item.title, 15)
                  }}
                </p>
              </div>
            </td>

            <td>
              <v-chip
                prepend-icon="mdi-clock-time-nine-outline"
                size="small"
                variant="outlined"
                :text="formatDateTR(item.createdAt)"
                :ripple="false"
              />
            </td>

            <td>
              <div class="d-flex align-center ga-1 flex-wrap py-1">
                <v-chip
                  v-for="(keyword, index) in item.keywords"
                  :key="index"
                  :size="isSmallScreen ? 'x-small' : 'small'"
                  color="green-accent-2"
                  variant="tonal"
                  :ripple="false"
                  :text="keyword"
                />
              </div>
            </td>

            <td>
              <div class="d-flex align-center ga-1">
                <v-btn
                  @click.stop="handleRowClick(item)"
                  variant="tonal"
                  icon="mdi-pencil"
                  class="text-caption text-lg-subtitle-2 default-title-letter rounded"
                  size="x-small"
                  color="primary"
                />

                <v-btn
                  @click.stop="handleDeleteBlog(item)"
                  variant="tonal"
                  icon="mdi-delete"
                  class="text-caption text-lg-subtitle-2 default-title-letter rounded"
                  size="x-small"
                  color="error"
                />
              </div>
            </td>
          </tr>
        </template>

        <template #loading>
          <v-skeleton-loader
            class="bg-transparent"
            :type="blogs?.length > 10 ? 'table-row@10' : `table-row@${blogs?.length}`"
          />
        </template>
      </v-data-table>
    </v-col>

    <v-col cols="12" lg="10">
      <v-btn
        @click="isAddBlog = true"
        :ripple="false"
        color="green-accent-2"
        text="Blog Ekle"
        prepend-icon="mdi-plus"
        class="float-right"
        :block="isSmallScreen ? true : false"
      />
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
    <v-form
      ref="addBlogForm"
      @submit.prevent="submitBlog"
      class="add-blog-form overflow-y-auto pa-2 pa-md-5 pa-lg-10 rounded-lg"
    >
      <p
        class="text-subtitle-2 text-md-subtitle-1 text-lg-h5 text-xl-h4 text-grey-lighten-1 default-title-letter"
      >
        Blog Ekle
      </p>

      <v-btn
        class="close-icon-in-add-blog-form ma-1 ma-lg-2"
        icon="mdi-close"
        color="grey-lighten-1"
        size="small"
        :ripple="false"
        @click="isAddBlog = false"
        variant="text"
      />

      <v-divider class="w-100 mb-5 mt-2" color="white" />

      <v-img
        v-if="formModels.previewUrl"
        :src="formModels.previewUrl"
        class="my-3 rounded-lg w-100 w-sm-50"
        cover
      />

      <v-file-input
        label="Blog Resmi"
        :rules="rules.file"
        accept="image/*"
        class="text-grey-lighten-1"
        prepend-icon=""
        color="grey-lighten-1"
        :density="isSmallScreen ? 'compact' : 'comfortable'"
        variant="outlined"
        v-model="formModels.file"
        required
        prepend-inner-icon="mdi-image"
      />

      <v-text-field
        v-model="formModels.title"
        :rules="rules.title"
        :density="isSmallScreen ? 'compact' : 'comfortable'"
        variant="outlined"
        label="Başlık"
        prepend-inner-icon="mdi-subtitles-outline"
        class="text-caption text-lg-subtitle-2 default-title-letter text-grey-lighten-1"
        required
        clearable
      />

      <v-combobox
        v-model="formModels.keywords"
        :density="isSmallScreen ? 'compact' : 'comfortable'"
        class="text-caption text-lg-subtitle-2 default-title-letter text-grey-lighten-1"
        label="Anahtar Kelimeler"
        prepend-inner-icon="mdi-key"
        multiple
        chips
        variant="outlined"
        clearable
      ></v-combobox>

      <v-textarea
        v-model="formModels.content"
        :rules="rules.content"
        :density="isSmallScreen ? 'compact' : 'comfortable'"
        label="İçerik"
        prepend-inner-icon="mdi-text"
        class="text-caption text-lg-subtitle-2 default-title-letter text-grey-lighten-1"
        variant="outlined"
        rows="3"
        counter
        required
        clearable
      />

      <!-- Submit -->
      <v-btn
        :loading="isSubmitting"
        :ripple="false"
        variant="tonal"
        prepend-icon="mdi-send"
        type="submit"
        color="green-accent-2"
        class="mt-4"
        text="Blog Ekle"
      />
    </v-form>
  </v-dialog>

  <!-- Blog Detail -->
  <v-dialog
    v-model="isOpenBlogDetail"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.7rem);
      -webkit-backdrop-filter: blur(0.7rem);
    "
  >
    <div
      class="blog-detail-in-admin d-flex flex-column align-start ga-1 ga-lg-3 pa-2 pa-md-5 pa-lg-10 rounded-lg w-100"
    >
      <v-btn
        class="close-icon-in-blog-detail ma-1 ma-lg-2"
        icon="mdi-close"
        color="grey-lighten-1"
        size="small"
        :ripple="false"
        @click="isOpenBlogDetail = false"
        variant="text"
      />

      <v-img class="rounded-lg w-100 w-sm-50" :src="activeBlog?.imageUrl" cover />

      <p class="text-caption text-grey-darken-1">
        {{ formatDateTR(activeBlog?.createdAt) }}
      </p>

      <p
        class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter"
      >
        {{ activeBlog?.title }}
      </p>

      <p class="text-caption text-lg-subtitle-2 default-title-letter text-grey-darken-1">
        {{ displayedContent }}
      </p>

      <div class="d-flex align-center justify-end w-100">
        <v-btn
          variant="text"
          size="small"
          :ripple="false"
          :append-icon="showFullContent ? 'mdi-arrow-left' : 'mdi-arrow-right'"
          class="text-grey-lighten-1"
          @click="showFullContent = !showFullContent"
          :text="showFullContent ? 'Daha az göster' : 'Açıklamanın tamamını oku'"
        />
      </div>
    </div>
  </v-dialog>

  <!-- Confirmation Pop Up -->
  <v-dialog
    v-model="isOpenConfirmationDialog"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.7rem);
      -webkit-backdrop-filter: blur(0.7rem);
    "
  >
    <div
      class="blog-detail-in-admin d-flex flex-column align-start ga-1 ga-lg-3 pa-2 pa-md-5 pa-lg-10 rounded-lg w-100"
    >
      <p
        class="text-subtitle-2 text-md-subtitle-1 text-xl-h5 default-title-letter text-grey-lighten-1"
      >
        Bu blog yazsını veri tabanından silmek istediğinden emin misin ?
      </p>

      <v-divider color="white" class="w-100" />

      <div class="d-flex flex-column align-start ga-1">
        <v-img :src="activeBlog?.imageUrl" class="rounded-lg w-100 w-sm-50" cover />
        <p class="text-caption text-grey-darken-1">
          {{ formatDateTR(activeBlog.createdAt) }}
        </p>

        <p
          class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1"
        >
          {{ activeBlog?.title }}
        </p>

        <p
          class="text-caption text-lg-subtitle-2 default-title-letter text-grey-darken-1"
        >
          {{ displayedContent }}
        </p>

        <div class="d-flex align-center justify-end w-100">
          <v-btn
            variant="text"
            size="small"
            :ripple="false"
            :append-icon="showFullContent ? 'mdi-arrow-left' : 'mdi-arrow-right'"
            class="text-grey-lighten-1"
            @click="showFullContent = !showFullContent"
            :text="showFullContent ? 'Daha az göster' : 'Açıklamanın tamamını oku'"
          />
        </div>
      </div>

      <div class="w-100 d-flex align-center justify-end ga-1 mt-2">
        <v-btn
          @click="isOpenConfirmationDialog = false"
          :ripple="false"
          class="rounded"
          :size="isLargeScreen ? 'default' : 'small'"
          color="grey-lighten-2"
          variant="text"
          prepend-icon="mdi-close"
          text="Iptal"
        />

        <v-btn
          @click="deleteThisGameFromDb(activeBlog?.firestoreId)"
          :loading="isDeletingBlogFromDb"
          :ripple="false"
          class="rounded"
          color="error"
          :size="isLargeScreen ? 'default' : 'small'"
          variant="tonal"
          prepend-icon="mdi-delete"
          text="Evet"
        />
      </div>
    </div>
  </v-dialog>

  <!-- Toast Bar -->
  <v-snackbar
    v-model="blogToastModels.blogToastBar"
    :text="blogToastModels.msg"
    :color="blogToastModels.color"
    variant="tonal"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import type { Add_Blog_Form_Model } from "~/composables/core/interfaces";
import { VForm } from "vuetify/components";
import { header_blogs } from "~/composables/data/headerTables";
import { truncateText } from "~/composables/core/basicFunc";
import { useFirestoreDateFormatted } from "~/composables/data/handleData";

const { $firestore } = useNuxtApp();
const config = useRuntimeConfig();
const display = useDisplay();

const isSmallScreen = computed(() => display.smAndDown.value);
const isLargeScreen = computed(() => display.lgAndUp.value);

const isSubmitting = ref(false);
const isAddBlog = ref(false);
const isGettingBlogs = ref(false);
const isOpenBlogDetail = ref(false);
const showFullContent = ref(false);
const isOpenConfirmationDialog = ref(false);
const isDeletingBlogFromDb = ref(false);

const addBlogForm = ref<InstanceType<typeof VForm> | null>(null);
const blogs = ref<any[]>([]);
const activeBlog = ref<any | null>(null);

const blogToastModels = ref({
  blogToastBar: false,
  color: "",
  msg: "",
});

const { formatDateTR } = useFirestoreDateFormatted();

const formModels = ref<Add_Blog_Form_Model>({
  title: "",
  content: "",
  file: null,
  keywords: null,
  previewUrl: "",
});

const rules = ref({
  file: [(v: string) => !!v || "Resim Gerekli!"],
  title: [
    (v: string) => !!v || "Başlık Gerekli!",
    (v: string) => (v && v.length >= 6) || "Başlık en az 6 karakter olmalı!",
  ],
  content: [
    (v: string) => !!v || "İçerik Gerekli!",
    (v: string) => (v && v.length >= 50) || "İçerik en az 50 karakter olmalı!",
  ],
});

const displayedContent = computed(() => {
  if (showFullContent.value) return activeBlog.value?.content;
  return truncateText(activeBlog.value?.content, 250);
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

    blogToastModels.value.msg = "Blog başarı ile eklendi!";
    blogToastModels.value.color = "success";
    blogToastModels.value.blogToastBar = true;

    await getBlogsFromDb();

    formModels.value.file = null;
    formModels.value.previewUrl = null;
    formModels.value.title = "";
    formModels.value.content = "";
    formModels.value.keywords = [];
  } catch (err) {
    console.error(err);

    blogToastModels.value.msg = "Blog eklerken hata oluştu!";
    blogToastModels.value.color = "error";
    blogToastModels.value.blogToastBar = true;
  } finally {
    addBlogForm.value?.reset();
    addBlogForm.value?.resetValidation();
    isSubmitting.value = false;
    isAddBlog.value = false;
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
  activeBlog.value = item;
  isOpenBlogDetail.value = true;
};

const handleDeleteBlog = (blog: any) => {
  activeBlog.value = blog;
  isOpenConfirmationDialog.value = true;
};

const deleteThisGameFromDb = async (firestoreId: string) => {
  try {
    isDeletingBlogFromDb.value = true;

    await deleteDoc(doc($firestore, "blogs", firestoreId));

    console.log("The blog deleted from DB :", firestoreId);

    blogToastModels.value.color = "error";
    blogToastModels.value.msg = `${activeBlog.value?.title} baslıklı blog silindi!`;
    blogToastModels.value.blogToastBar = true;
  } catch (error) {
    console.error("Silme hatası:", error);
  } finally {
    isOpenConfirmationDialog.value = false;
    isDeletingBlogFromDb.value = false;

    // Update List
    await getBlogsFromDb();
  }
};

watch(
  () => formModels.value.file,
  (newFile) => {
    if (!newFile) {
      formModels.value.previewUrl = "";
      return;
    }

    formModels.value.previewUrl = URL.createObjectURL(newFile);
  }
);

onMounted(() => {
  getBlogsFromDb();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
@import url("~/assets/css/admin_blogs.css");
</style>
