// store/votes.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useVotesStore = defineStore("votes", () => {
  const votedBlogs = ref<string[]>([]); // firestoreId'leri

  const addVote = (firestoreId: string) => {
    if (!votedBlogs.value.includes(firestoreId)) {
      votedBlogs.value.push(firestoreId);
    }
  };

  const hasVoted = (firestoreId: string) => votedBlogs.value.includes(firestoreId);

  return { votedBlogs, addVote, hasVoted };
});
