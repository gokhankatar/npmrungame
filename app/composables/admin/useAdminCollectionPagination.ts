import { computed, ref, watch, type Ref } from "vue";

export const ADMIN_PAGE_SIZE_OPTIONS = [10, 20, 40, 80] as const;

const DEFAULT_PAGE_SIZE = 10;

export function useAdminCollectionPagination<T>(
  source: Ref<T[]>,
  initialPageSize: number = DEFAULT_PAGE_SIZE
) {
  const page = ref(1);
  const pageSize = ref(initialPageSize);

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(source.value.length / pageSize.value) || 1)
  );

  const paginatedItems = computed(() => {
    const start = (page.value - 1) * pageSize.value;
    return source.value.slice(start, start + pageSize.value);
  });

  const totalCount = computed(() => source.value.length);

  const resetPage = () => {
    page.value = 1;
  };

  watch(pageSize, () => {
    page.value = 1;
  });

  watch(
    () => [source.value.length, pageSize.value] as const,
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
    totalCount,
    pageSizeOptions: ADMIN_PAGE_SIZE_OPTIONS,
    resetPage,
  };
}
