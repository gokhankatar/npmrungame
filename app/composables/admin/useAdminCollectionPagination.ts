import { computed, ref, watch, type Ref } from "vue";

const DEFAULT_PAGE_SIZE = 10;

export function useAdminCollectionPagination<T>(
  source: Ref<T[]>,
  pageSize: number = DEFAULT_PAGE_SIZE
) {
  const page = ref(1);

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(source.value.length / pageSize))
  );

  const paginatedItems = computed(() => {
    const start = (page.value - 1) * pageSize;
    return source.value.slice(start, start + pageSize);
  });

  const resetPage = () => {
    page.value = 1;
  };

  watch(
    () => source.value.length,
    () => {
      if (page.value > pageCount.value) {
        page.value = pageCount.value;
      }
    }
  );

  return {
    page,
    pageCount,
    paginatedItems,
    pageSize,
    resetPage,
  };
}
