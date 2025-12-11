import { defineStore } from 'pinia'

export const useDiscoverStore = defineStore('npmrungame_query_store', () => {
    const lastQuery = ref<Record<string, any>>({})

    function setQuery(q: any) {
        lastQuery.value = { ...q }
    }

    return {
        lastQuery,
        setQuery,
    }
}, {
    persist: {
        storage: piniaPluginPersistedstate.localStorage(),
    }
})
