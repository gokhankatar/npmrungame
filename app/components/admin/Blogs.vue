<template>
  <v-row
    class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10"
    :dense="display.smAndDown.value"
  >
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

      <div class="d-flex flex-wrap align-center ga-1 ga-lg-2">
        <v-menu :close-on-content-click="true" :offset="[5, 10]" location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-if="!display.xs.value"
              v-bind="props"
              icon="mdi-sort"
              class="rounded text-caption text-lg-subtitle-2"
              :ripple="false"
              variant="text"
              rounded="xl"
              color="grey-lighten-1"
              :size="isSmallScreen ? 'x-small' : 'small'"
            />
          </template>

          <v-card
            class="pa-1 pa-sm-2"
            :ripple="false"
            style="
              background: rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.15);
              backdrop-filter: blur(0.5rem);
              -webkit-backdrop-filter: blur(0.5rem);
            "
            elevation="2"
          >
            <v-list density="compact" class="bg-transparent">
              <v-list-item @click="sortBy('new')" prepend-icon="mdi-arrow-up">
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Tarihe Göre En Yeni</v-list-item-title
                >
              </v-list-item>

              <v-list-item
                @click="sortBy('old')"
                :ripple="false"
                prepend-icon="mdi-arrow-down"
              >
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Tarihe Göre En Eski</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>

        <v-btn
          icon="mdi-refresh"
          class="rounded text-caption text-lg-subtitle-2"
          :ripple="false"
          variant="text"
          rounded="xl"
          :color="isGettingBlogs ? 'green-accent-2' : 'grey-lighten-1'"
          @click="getBlogsFromDb"
          :size="isSmallScreen ? 'x-small' : 'small'"
          :loading="isGettingBlogs"
        />
      </div>
    </v-col>

    <v-col cols="12" v-if="display.xs.value">
      <v-menu :close-on-content-click="true" :offset="[5, 0]" location="bottom end">
        <template #activator="{ props }">
          <v-btn
            prepend-icon="mdi-sort"
            v-bind="props"
            class="text-caption text-lg-subtitle-2"
            :ripple="false"
            text="Sırala"
            variant="tonal"
            rounded="xl"
            color="grey-lighten-1"
            size="small"
            block
          />
        </template>

        <v-card
          class="pa-1 pa-sm-2"
          :ripple="false"
          style="
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(0.5rem);
            -webkit-backdrop-filter: blur(0.5rem);
          "
          elevation="2"
        >
          <v-list density="compact" class="bg-transparent">
            <v-list-item @click="sortBy('new')" prepend-icon="mdi-arrow-up">
              <v-list-item-title
                class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                >Tarihe Göre En Yeni</v-list-item-title
              >
            </v-list-item>

            <v-list-item
              @click="sortBy('old')"
              :ripple="false"
              prepend-icon="mdi-arrow-down"
            >
              <v-list-item-title
                class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                >Tarihe Göre En Eski</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-col>

    <v-col cols="12" lg="10">
      <v-data-table
        :headers="header_blogs"
        :loading="isGettingBlogs"
        :items="blogs"
        class="admin-data-table rounded-lg w-100"
        items-per-page-text="Sayfa Başı Blog Sayısı"
        :hide-default-header="display.smAndDown.value"
        hover
      >
        <template #item="{ item, index }">
          <template v-if="display.smAndDown.value">
            <tr class="table-row cursor-pointer" @click="handleRowClick(item)">
              <td>
                <div class="d-flex flex-column align-start ga-1 ga-sm-2 py-1">
                  <img
                    :src="item.imageUrl"
                    :width="isSmallScreen ? 30 : 60"
                    class="rounded-lg h-100"
                    cover
                  />
                  <p
                    class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
                  >
                    {{
                      display.xs.value
                        ? truncateText(item.title, 30)
                        : truncateText(item.title, 150)
                    }}
                  </p>

                  <v-chip
                    prepend-icon="mdi-clock-time-nine-outline"
                    size="x-small"
                    variant="outlined"
                    :text="formatDateTR(item.createdAt)"
                    :ripple="false"
                  />

                  <div class="d-flex align-center ga-1 flex-wrap py-1">
                    <v-chip
                      v-for="(keyword, index) in item.keywords"
                      :key="index"
                      size="x-small"
                      color="green-accent-2"
                      variant="tonal"
                      :ripple="false"
                      :text="truncateText(keyword, 22)"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <template v-else>
            <tr class="table-row cursor-pointer" @click="handleRowClick(item)">
              <td>
                <div class="d-flex align-center ga-1 ga-lg-2 py-2">
                  <img
                    :src="item.imageUrl"
                    :width="isSmallScreen ? 30 : 60"
                    class="rounded-lg h-100"
                    cover
                  />
                  <p
                    class="text-caption text-sm-subtitle-2 text-grey-lighten-1 default-title-letter"
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
                  <v-tooltip location="top" text="Güncelle">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        @click.stop="handleUpdate(item)"
                        variant="tonal"
                        icon="mdi-pencil"
                        class="text-caption text-lg-subtitle-2 default-title-letter rounded"
                        size="x-small"
                        color="primary"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip location="top" text="Sil">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        @click.stop="handleDeleteBlog(item)"
                        variant="tonal"
                        icon="mdi-delete"
                        class="text-caption text-lg-subtitle-2 default-title-letter rounded"
                        size="x-small"
                        color="error"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </template>
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
        @click="handleAddBlog"
        :ripple="false"
        color="green-accent-2"
        text="Blog Ekle"
        prepend-icon="mdi-plus"
        class="float-right"
        :block="isSmallScreen ? true : false"
      />
    </v-col>

    <v-col cols="12" lg="10" class="mt-5 mt-lg-10">
      <p class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-lighten-1">
        Blog İçeriğini Nasıl Yazmalıyım ?
      </p>

      <v-divider class="w-100 mt-2 mb-4" color="white" />

      <v-stepper-vertical
        v-model="step"
        :mandatory="false"
        color="green-accent-2"
        next-text="Sonraki"
        prev-text="Önceki"
        class="d-flex flex-column ga-2"
        multiple
        icon="mdi-eye"
        non-linear
        :hide-actions="isSmallScreen"
      >
        <!-- Title -->
        <v-stepper-vertical-item
          title="Ana Başlık (#)"
          class="text-caption text-sm-subtitle-2 text-md-subtitle-1 text-lg-h5"
          value="1"
          editable
        >
          <p
            class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter"
          >
            Blogunuzda ana başlık eklemek için satır başına <v-code>#</v-code> kullanın.
          </p>
          <p
            class="text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter"
          >
            Örnek:
          </p>
          <v-divider class="w-100 w-lg-25 mt-1 mb-2" />
          <v-code style="background: rgba(0, 0, 0, 0.7)"># OYUN TUTKUSU</v-code>
        </v-stepper-vertical-item>

        <!-- Subtitle -->
        <v-stepper-vertical-item
          title="Alt Başlık (##)"
          class="text-caption text-sm-subtitle-2 text-md-subtitle-1 text-lg-h5"
          value="2"
          editable
        >
          <p
            class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter"
          >
            Alt başlıklar için satır başına <v-code>##</v-code> ekleyin.
          </p>
          <p
            class="text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter"
          >
            Örnek:
          </p>
          <v-divider class="w-100 w-lg-25 mt-1 mb-2" />
          <v-code style="background: rgba(0, 0, 0, 0.7)">## OYNADIĞIM OYUNLAR</v-code>
        </v-stepper-vertical-item>

        <!-- Divider -->
        <v-stepper-vertical-item
          title="Divider (--)"
          class="text-caption text-sm-subtitle-2 text-md-subtitle-1 text-lg-h5"
          value="3"
          editable
        >
          <p
            class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter"
          >
            Metinleri bölmek veya yeni bir bölüm başlatmak için
            <v-code>--</v-code> kullanın.
          </p>
          <p
            class="text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter"
          >
            Örnek:
          </p>
          <v-divider class="w-100 w-lg-25 mt-1 mb-2" />
          <v-code style="background: rgba(0, 0, 0, 0.7)">--</v-code>
        </v-stepper-vertical-item>

        <!-- Normal Paragraf -->
        <v-stepper-vertical-item
          title="Paragraf"
          class="text-caption text-sm-subtitle-2 text-md-subtitle-1 text-lg-h5"
          value="4"
          editable
        >
          <p
            class="text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter"
          >
            Normal satırlar paragraf olarak kabul edilir. Sadece yazınızı yazın, ekstra
            işaret gerekmez.
          </p>
          <p
            class="text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter"
          >
            Örnek:
          </p>
          <v-divider class="w-100 w-lg-25 mt-1 mb-2" />
          <v-code style="background: rgba(0, 0, 0, 0.7)">
            Oyun oynamak sadece eğlence değil, aynı zamanda yaratıcılığı geliştiren bir
            aktivitedir.
          </v-code>
        </v-stepper-vertical-item>
      </v-stepper-vertical>
    </v-col>
  </v-row>

  <!-- Add / Update Blog Pop Up -->
  <v-dialog
    v-model="isAddBlog"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.6rem);
      -webkit-backdrop-filter: blur(0.6rem);
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
        {{ isUpdateMode ? "Blog Güncelle" : "Yeni Blog Ekle" }}
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
      />

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

      <!-- Add -->
      <v-btn
        v-if="!isUpdateMode"
        :loading="isSubmitting"
        :ripple="false"
        variant="elevated"
        prepend-icon="mdi-send"
        type="submit"
        color="green-accent-2"
        class="mt-4"
        text="Blog Ekle"
      />

      <v-row v-if="isUpdateMode" dense>
        <v-col cols="12" sm="6">
          <!-- Delete -->
          <v-btn
            @click="handleDeleteBlog(activeBlog)"
            :ripple="false"
            :size="display.smAndDown.value ? 'small' : 'default'"
            variant="elevated"
            class="text-capitalize default-title-letter text-caption text-lg-subtitle-2 text-black"
            prepend-icon="mdi-delete"
            color="error"
            text="Sil"
            block
          />
        </v-col>

        <v-col v-if="isUpdateMode" cols="12" sm="6">
          <!-- Update -->
          <v-btn
            :loading="isUpdatingBlogInDb"
            @click="updateDocOnDb"
            :ripple="false"
            class="text-capitalize default-title-letter text-caption text-lg-subtitle-2 text-black"
            variant="elevated"
            :size="display.smAndDown.value ? 'small' : 'default'"
            prepend-icon="mdi-update"
            color="primary"
            text="Güncelle"
            block
          />
        </v-col>
      </v-row>
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
      class="blog-detail-in-admin d-flex flex-column align-start ga-1 ga-lg-3 pa-3 pa-md-5 pa-lg-10 rounded-lg w-100"
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

      <div
        v-if="activeBlog?.content_raw?.length > 250"
        class="d-flex align-center justify-end w-100"
      >
        <v-btn
          variant="tonal"
          color="grey-lighten-1"
          rounded="xl"
          size="small"
          :ripple="false"
          :append-icon="showFullContent ? 'mdi-arrow-left' : 'mdi-arrow-right'"
          class="text-grey-lighten-1"
          @click="showFullContent = !showFullContent"
          :text="showFullContent ? 'Daha az göster' : 'Devamını göster'"
        />
      </div>

      <v-btn
        @click="handleDeleteBlog(activeBlog)"
        rounded="xl"
        class="mt-3"
        v-if="display.smAndDown.value"
        block
        size="small"
        text="Sil"
        prepend-icon="mdi-delete"
        color="error"
        variant="tonal"
        :ripple="false"
      />
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
      class="blog-detail-in-admin d-flex flex-column align-start ga-1 ga-lg-3 pa-3 pa-md-5 pa-lg-10 rounded-lg w-100"
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

        <div
          v-if="activeBlog?.content_raw?.length > 250"
          class="d-flex align-center justify-end w-100"
        >
          <v-btn
            variant="tonal"
            color="grey-lighten-1"
            rounded="xl"
            size="small"
            :ripple="false"
            :append-icon="showFullContent ? 'mdi-arrow-left' : 'mdi-arrow-right'"
            class="text-grey-lighten-1 rounded-lg"
            @click="showFullContent = !showFullContent"
            :text="showFullContent ? 'Daha az göster' : 'Devamını göster'"
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
  <v-dialog
    v-model="blogToastModels.blogToastBar"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div
      class="successfully-done-container d-flex flex-column align-center justify-center pa-5 rounded-xl"
    >
      <v-btn
        @click="blogToastModels.blogToastBar = false"
        class="close-icon-in-successfully-done-container ma-1 ma-lg-2"
        icon="mdi-close"
        :ripple="false"
        variant="text"
        color="grey-darken-1"
        size="small"
      />
      <v-img
        :class="blogToastModels?.status == 'warning' ? 'bg-warning rounded-xl' : ''"
        :src="getImgSrcByToastStatus(blogToastModels?.status)"
        :width="isSmallScreen ? 50 : 75"
      />
      <p
        class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter"
      >
        {{ blogToastModels?.msg }}
      </p>
    </div>
  </v-dialog>

  <!-- ! Feature News Toast -->
  <v-dialog
    v-model="modelSeenFeatureNewsToast"
    @close-on-click="handleCloseFeatureNewsToast()"
    @close-on-escape="handleCloseFeatureNewsToast()"
    @close-on-content-click="handleCloseFeatureNewsToast()"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div
      class="successfully-done-container d-flex flex-column align-center justify-center pa-5 rounded-xl"
    >
      <v-btn
        @click="handleCloseFeatureNewsToast()"
        class="close-icon-in-successfully-done-container ma-1 ma-lg-2"
        icon="mdi-close"
        :ripple="false"
        variant="text"
        color="grey-darken-1"
        size="small"
      />
      <v-avatar :image="featureImg" :size="display.smAndDown.value ? 70 : 100" />
      <p
        class="mt-2 text-center text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter"
      >
        Karıcım Yeni Özellik Geldi! <br />
        Artık blog içeriklerini güncelleyebilirsin öpüyorum.
      </p>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { type Blog_Toast_Admin, type Add_Blog_Form_Model } from "~/composables/core/interfaces";
import { VForm } from "vuetify/components";
import _ from "lodash";
import { header_blogs } from "~/composables/data/headerTables";
import { truncateText } from "~/composables/core/basicFunc";
import {
  useBlogHtmlFormatter,
  useFirestoreDateFormatted,
} from "~/composables/data/handleData";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import warningImg from "~/assets/img/warning_anim.gif"
import deletedImg from "~/assets/img/deleted_anim.gif"
import store from "~/store/store";
import featureImg from "~/assets/img/admin_gokhan_katar.jpg"

const { $firestore } = useNuxtApp();
const { formatDateTR } = useFirestoreDateFormatted();

const display = useDisplay();
const _store = store()

const isSmallScreen = computed(() => display.smAndDown.value);
const isLargeScreen = computed(() => display.lgAndUp.value);

const modelSeenFeatureNewsToast = ref(_store.isSeenFeatureNewsToast == false ? true:false);
const isSubmitting = ref(false);
const isAddBlog = ref(false);
const isGettingBlogs = ref(false);
const isOpenBlogDetail = ref(false);
const showFullContent = ref(false);
const isOpenConfirmationDialog = ref(false);
const isDeletingBlogFromDb = ref(false);
const isUpdateMode = ref(false);
const isUpdatingBlogInDb = ref(false);

const addBlogForm = ref<InstanceType<typeof VForm> | null>(null);
const blogs = ref<any[]>([]);
const activeBlog = ref<any | null>(null);
const step = shallowRef([1]);

const blogToastModels = ref<Blog_Toast_Admin>({
  blogToastBar: false,
  status: "success",
  msg: "",
});

const formModels = ref<Add_Blog_Form_Model>({
  title: "",
  content: "",
  file: null,
  keywords: null,
  previewUrl: "",
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg",
];

const rules = ref({
  file: [
    (file: File) =>
      !!file || "Bir görsel seçmelisin",

    (file: File) =>
      !file || file.size <= MAX_FILE_SIZE || "Dosya boyutu maksimum 5MB olmalı",

    (file: File) =>
      !file || allowedMimeTypes.includes(file.type) ||
      "Sadece JPG, PNG, GIF, SVG veya WEBP formatı desteklenir",
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

const displayedContent = computed(() => {
  if (showFullContent.value) return activeBlog.value?.content_raw;
  return truncateText(activeBlog.value?.content_raw, 250);
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

    const formattedContent = useBlogHtmlFormatter(formModels.value?.content);

    // 2️⃣ Add To Firebase
    await addDoc(blogsCollection, {
      title: formModels.value?.title,
      content_raw: formModels.value?.content,
      content: formattedContent,
      keywords: formModels.value?.keywords,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    blogToastModels.value.status = "success"
    blogToastModels.value.msg = "Blog başarı ile eklendi!";
    blogToastModels.value.blogToastBar = true;

    setTimeout(() => {
      blogToastModels.value.blogToastBar = false;
    }, 3500);

    await getBlogsFromDb();

    formModels.value.file = null;
    formModels.value.previewUrl = null;
    formModels.value.title = "";
    formModels.value.content = "";
    formModels.value.keywords = [];
  } catch (err) {
    console.error(err);

    blogToastModels.value.status = "warning"
    blogToastModels.value.msg = "Blog eklerken hata oluştu!";
    blogToastModels.value.blogToastBar = true;
  } finally {
    addBlogForm.value?.reset();
    formModels.value.file = null;
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

    const sortedBlogs = _.sortBy(blogsList, (b:any) => b?.createdAt?.seconds ?? 0);
    blogs.value = sortedBlogs.reverse();;
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

const handleAddBlog = () => {
  isUpdateMode.value = false;
  isAddBlog.value = true;

  formModels.value.title = "";
  formModels.value.content = "";
  formModels.value.keywords = [];
  formModels.value.previewUrl = "";
  formModels.value.file = null;

  addBlogForm.value?.reset();
  addBlogForm.value?.resetValidation();
};

const handleDeleteBlog = (blog: any) => {
  activeBlog.value = blog;
  isOpenConfirmationDialog.value = true;
};

const deleteThisGameFromDb = async (firestoreId: string) => {
  try {
    isDeletingBlogFromDb.value = true;

    await deleteDoc(doc($firestore, "blogs", firestoreId));

    blogToastModels.value.status = "deleted"
    blogToastModels.value.msg = `${activeBlog.value?.title} başlıklı blog başarıyla silindi!`;
    blogToastModels.value.blogToastBar = true;

    setTimeout(() => {
      blogToastModels.value.blogToastBar = false;
    }, 3500);
  } catch (error) {
    console.error("Silme hatası:", error);
  } finally {
    isOpenConfirmationDialog.value = false;
    isAddBlog.value = false;
    isOpenBlogDetail.value = false;
    isDeletingBlogFromDb.value = false;

    addBlogForm.value?.reset();
    formModels.value.file = null;
    // Update List
    await getBlogsFromDb();
  }
};

const getImgSrcByToastStatus = (status: "success" | "warning" | "deleted" | "updated") => {
  if (status === "success") {
    return successfullyDoneImg
  } else if (status === "deleted") {
    return deletedImg
  }else if(status === "updated"){
    return successfullyDoneImg
  }else {
    return warningImg
  }
}

const sortBlogs = (blogs: any[], type: "new" | "old") => {
  if (!blogs || blogs.length === 0) return [];

  const sorted = _.sortBy(blogs, (b) => b?.createdAt?.seconds ?? 0);

  return type === "new"
    ? sorted.reverse()
    : sorted;
};

const sortBy = (mode: string) => {
  if (mode === "new") blogs.value = sortBlogs(blogs.value, "new");
  if (mode === "old") blogs.value = sortBlogs(blogs.value, "old");
};

const handleUpdate = (blog: any) => {
  activeBlog.value = blog;
  isUpdateMode.value = true;
  isAddBlog.value = true;

  formModels.value.title = blog.title;
  formModels.value.content = blog.content_raw;
  formModels.value.keywords = blog.keywords;
  formModels.value.previewUrl = blog.imageUrl;
};

const updateDocOnDb = async () => {
  const result = await addBlogForm.value?.validate();
  if (!result?.valid) return;

  try {
    isUpdatingBlogInDb.value = true;

    const imageUrl = await uploadBlogImage(formModels.value?.file!);

    const formattedContent = useBlogHtmlFormatter(
      formModels.value.content
    );

    const blogDocRef = doc(
      $firestore,
      "blogs",
      activeBlog.value.firestoreId
    );

    await updateDoc(blogDocRef, {
      title: formModels.value.title,
      content_raw: formModels.value.content,
      content: formattedContent,
      keywords: formModels.value.keywords,
      imageUrl,
      updatedAt: serverTimestamp(),
    });

    blogToastModels.value.status = "updated";
    blogToastModels.value.msg = "Blog başarı ile güncellendi!";
    blogToastModels.value.blogToastBar = true;

    setTimeout(() => {
      blogToastModels.value.blogToastBar = false;
      addBlogForm.value?.reset();
      formModels.value.file = null;
    }, 3500);

  } catch (error: any) {
    console.error("Update failed:", error?.message || error);
  } finally {
    isUpdatingBlogInDb.value = false;
    isAddBlog.value = false;
    isUpdateMode.value = false;
    getBlogsFromDb();
  }
};

const handleCloseFeatureNewsToast = () => {
  blogToastModels.value.blogToastBar = false
  _store.setTrueIsSeenFeatureNewsToast();
}

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
