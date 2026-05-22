<template>
    <v-data-table
        :items="arr"
        :headers="tableHeaders"
        :loading="loading"
        class="admin-data-table rounded-lg w-100"
        :items-per-page-text="display.smAndDown.value ? 'Oyun Sayısı' : 'Sayfa Başı Oyun Sayısı'"
        :hide-default-header="display.smAndDown.value"
        hover
        item-value="firestoreId"
    >
        <template #item="{ item }">
            <!-- Small Screen -->
            <template v-if="display.smAndDown.value">
                <tr
                    class="table-row"
                    :class="{
                        'cursor-pointer': true,
                        'admin-bulk-row-selected': bulkDeleteMode && isItemSelected(item),
                    }"
                    @click="handleRowInteraction(item)"
                >
                    <td>
                        <div class="d-flex flex-column align-start ga-1 ga-sm-2 py-1">
                            <img
                                :src="item.background_image"
                                :width="display.smAndDown.value ? 30 : 60"
                                class="rounded-lg h-100"
                                cover
                            />
                            <p
                                class="text-caption text-sm-subtitle-2 text-grey-lighten-1 default-title-letter"
                            >
                                {{ item.name }}
                            </p>

                            <p
                                class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
                            >
                                {{ new Date(item.released).getFullYear() }}
                            </p>

                            <div class="d-flex align-center ga-1 flex-wrap py-1">
                                <v-chip
                                    v-for="(genre, genreIndex) in item.genres"
                                    :key="genreIndex"
                                    size="x-small"
                                    color="green-accent-2"
                                    variant="tonal"
                                    :ripple="false"
                                    :text="truncateText(genre.name, 22)"
                                />
                            </div>

                            <div class="d-flex align-center flex-wrap ga-1">
                                <template
                                    v-for="icon in getUniquePlatformIcons(item.platforms)"
                                    :key="icon"
                                >
                                    <v-icon
                                        v-if="icon"
                                        size="x-small"
                                        color="grey-lighten-1"
                                        :icon="icon"
                                    />
                                </template>
                            </div>

                            <v-chip
                                :ripple="false"
                                class="rounded"
                                size="x-small"
                                :color="
                                    item.metacritic
                                        ? useMetacriticStyle(item?.metacritic).color
                                        : 'warning'
                                "
                                :text="
                                    item.metacritic ? `Metacritic ${item.metacritic}` : 'N/A'
                                "
                            />

                            <v-btn
                                v-if="!bulkDeleteMode"
                                @click.stop="onDeleteClick(item)"
                                variant="tonal"
                                prepend-icon="mdi-delete"
                                class="text-caption text-lg-subtitle-2 default-title-letter rounded-xl mt-1"
                                text="Sil"
                                color="error"
                                block
                            />
                        </div>
                    </td>
                </tr>
            </template>

            <!-- Large Screen -->
            <template v-else>
                <tr
                    class="table-row"
                    :class="{
                        'cursor-pointer': true,
                        'admin-bulk-row-selected': bulkDeleteMode && isItemSelected(item),
                    }"
                    @click="handleRowInteraction(item)"
                >
                    <td>
                        <div class="d-flex align-center ga-1 ga-lg-2 py-2">
                            <img
                                :src="item.background_image"
                                :width="display.smAndDown.value ? 30 : 60"
                                class="rounded-lg h-100"
                                cover
                            />
                            <p
                                class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
                            >
                                {{ item.name }}
                            </p>
                        </div>
                    </td>

                    <td>
                        <p
                            class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
                        >
                            {{ new Date(item.released).getFullYear() }}
                        </p>
                    </td>

                    <td>
                        <div class="d-flex align-center ga-1 flex-wrap py-1">
                            <v-chip
                                v-for="(genre, genreIndex) in item.genres"
                                :key="genreIndex"
                                size="x-small"
                                color="green-accent-2"
                                variant="tonal"
                                :ripple="false"
                                :text="genre.name"
                            />
                        </div>
                    </td>

                    <td>
                        <div class="d-flex align-center flex-wrap ga-1">
                            <template
                                v-for="icon in getUniquePlatformIcons(item.platforms)"
                                :key="icon"
                            >
                                <v-icon
                                    v-if="icon"
                                    size="small"
                                    color="grey-lighten-1"
                                    :icon="icon"
                                />
                            </template>
                        </div>
                    </td>

                    <td>
                        <v-chip
                            :ripple="false"
                            size="small"
                            :color="
                                item.metacritic
                                    ? useMetacriticStyle(item?.metacritic).color
                                    : 'warning'
                            "
                            :text="item.metacritic ?? 'N/A'"
                        />
                    </td>

                    <td v-if="!bulkDeleteMode">
                        <v-btn
                            @click.stop="onDeleteClick(item)"
                            variant="tonal"
                            prepend-icon="mdi-delete"
                            class="text-caption text-lg-subtitle-2 default-title-letter rounded-xl"
                            text="Sil"
                            color="error"
                            block
                        />
                    </td>
                </tr>
            </template>
        </template>

        <!-- Loading -->
        <template #loading>
            <v-skeleton-loader
                class="bg-transparent"
                :type="arr.length > 10 ? 'table-row@10' : `table-row@${arr.length}`"
            />
        </template>
    </v-data-table>
</template>
<script lang="ts" setup>
import { truncateText } from "~/composables/core/basicFunc";
import { getUniquePlatformIcons, useMetacriticStyle } from "~/composables/data/handleData";
import { header_games } from "~/composables/data/headerTables";

const props = defineProps<{
    arr: any[];
    loading: boolean;
    onDeleteClick: (item: any) => void;
    onRowClick: (item: any) => void;
    bulkDeleteMode?: boolean;
    isSelected?: (item: any) => boolean;
    onToggleSelect?: (item: any) => void;
}>();

const display = useDisplay();

const tableHeaders = computed(() => {
    if (props.bulkDeleteMode) {
        return header_games.filter((h) => h.key !== "delete");
    }
    return [...header_games];
});

const isItemSelected = (item: any) => props.isSelected?.(item) ?? false;

const handleRowInteraction = (item: any) => {
    if (props.bulkDeleteMode) {
        props.onToggleSelect?.(item);
        return;
    }
    props.onRowClick(item);
};
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/admin.css";
@import "~/assets/css/completed_games.css";

.admin-bulk-row-selected {
    background: rgba(105, 240, 174, 0.08) !important;
    box-shadow: inset 3px 0 0 #69f0ae;
}
</style>
