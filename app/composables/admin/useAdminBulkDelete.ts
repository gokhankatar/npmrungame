import { writeBatch, doc, type Firestore } from "firebase/firestore";

export function useAdminBulkDelete(
  getItemId: (item: any) => string = (item) => item.firestoreId
) {
  const bulkDeleteMode = ref(false);
  const selectedIds = ref<string[]>([]);

  const selectedCount = computed(() => selectedIds.value.length);

  const isSelected = (item: any) => {
    const id = getItemId(item);
    return id ? selectedIds.value.includes(id) : false;
  };

  const toggleBulkMode = () => {
    bulkDeleteMode.value = !bulkDeleteMode.value;
    if (!bulkDeleteMode.value) {
      selectedIds.value = [];
    }
  };

  const exitBulkMode = () => {
    bulkDeleteMode.value = false;
    selectedIds.value = [];
  };

  const toggleSelect = (item: any) => {
    const id = getItemId(item);
    if (!id) return;

    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter((x) => x !== id);
    } else {
      selectedIds.value = [...selectedIds.value, id];
    }
  };

  const selectAll = (items: any[]) => {
    selectedIds.value = items.map(getItemId).filter(Boolean);
  };

  const clearSelection = () => {
    selectedIds.value = [];
  };

  const getSelectedFromList = (items: any[]) =>
    items.filter((item) => isSelected(item));

  return {
    bulkDeleteMode,
    selectedIds,
    selectedCount,
    isSelected,
    toggleBulkMode,
    exitBulkMode,
    toggleSelect,
    selectAll,
    clearSelection,
    getSelectedFromList,
  };
}

export async function batchDeleteFromFirestore(
  firestore: Firestore,
  collectionName: string,
  ids: string[]
) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return;

  const chunkSize = 500;
  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    const batch = writeBatch(firestore);
    uniqueIds.slice(i, i + chunkSize).forEach((id) => {
      batch.delete(doc(firestore, collectionName, id));
    });
    await batch.commit();
  }
}
