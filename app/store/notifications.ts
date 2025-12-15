import { defineStore } from "pinia";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

export const useNotificationsStore = defineStore("npmrungame_notifications", {
  state: () => ({
    notifications: [] as any[],
    isLoading: false,
  }),

  getters: {
    unreadCount: (state) =>
      state.notifications.filter((n) => !n.read_status).length,
  },

  actions: {
    async fetchNotifications($firestore: any) {
      if (this.isLoading) return;
      this.isLoading = true;

      try {
        const snap = await getDocs(collection($firestore, "notifications"));
        this.notifications = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (err) {
        console.error("fetchNotifications failed", err);
      } finally {
        this.isLoading = false;
      }
    },

    async markAsRead($firestore: any, id: string) {
      const item = this.notifications.find((n) => n.id === id);
      if (!item || item.read_status) return;

      item.read_status = true;

      try {
        await updateDoc(doc($firestore, "notifications", id), {
          read_status: true,
        });
      } catch (err) {
        console.error("markAsRead failed", err);
        item.read_status = false;
      }
    },

    // 🔥 MARK ALL AS READ
    async markAllAsRead($firestore: any) {
      if (this.isLoading) return;
      this.isLoading = true;

      const batch = writeBatch($firestore);
      const rollback: any[] = [];

      try {
        this.notifications.forEach((n) => {
          if (!n.read_status) {
            rollback.push(n);
            n.read_status = true;
            batch.update(doc($firestore, "notifications", n.id), {
              read_status: true,
            });
          }
        });

        await batch.commit();
      } catch (err) {
        console.error("markAllAsRead failed", err);
        rollback.forEach((n) => (n.read_status = false));
      } finally {
        this.isLoading = false;
      }
    },

    // 🧨 DELETE ALL
    async deleteAll($firestore: any) {
      if (this.isLoading) return;
      this.isLoading = true;

      const batch = writeBatch($firestore);
      const backup = [...this.notifications];

      try {
        this.notifications.forEach((n) => {
          batch.delete(doc($firestore, "notifications", n.id));
        });

        await batch.commit();
        this.notifications = [];
      } catch (err) {
        console.error("deleteAll failed", err);
        this.notifications = backup;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
