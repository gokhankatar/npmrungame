import { deleteField, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import store from "~/store/store";

export type UserProfilePatch = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string | null;
  username?: string;
};

const AVATAR_BUCKET = "npmrungame_avatars";
const MAX_AVATAR_BYTES = 2.5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function useUserProfile() {
  const { $firestore, $supabase } = useNuxtApp();
  const _store = store();

  const saving = ref(false);
  const uploading = ref(false);
  const error = ref("");

  const user = computed(() => _store.user);

  const displayName = computed(() => {
    const u = user.value;
    if (!u) return "oyuncu";
    const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
    return full || u.username || u.displayName || u.email || "oyuncu";
  });

  const avatarSrc = computed(() => {
    const u = user.value;
    return (u?.avatarUrl || u?.photoURL || "") as string;
  });

  async function patchProfile(patch: UserProfilePatch) {
    const uid = user.value?.uid;
    if (!uid || !$firestore) throw new Error("Oturum bulunamadı");

    error.value = "";
    saving.value = true;
    try {
      const payload: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };

      if (patch.firstName !== undefined) payload.firstName = patch.firstName.trim();
      if (patch.lastName !== undefined) payload.lastName = patch.lastName.trim();
      if (patch.phone !== undefined) payload.phone = patch.phone.trim();
      if (patch.username !== undefined) payload.username = patch.username.trim();
      if (patch.avatarUrl === null) payload.avatarUrl = deleteField();
      else if (patch.avatarUrl !== undefined) payload.avatarUrl = patch.avatarUrl;

      await updateDoc(doc($firestore, "registered_users", uid), payload);

      const nextUser = { ...user.value, updatedAt: new Date().toISOString() } as Record<
        string,
        unknown
      >;
      if (patch.firstName !== undefined) nextUser.firstName = payload.firstName;
      if (patch.lastName !== undefined) nextUser.lastName = payload.lastName;
      if (patch.phone !== undefined) nextUser.phone = payload.phone;
      if (patch.username !== undefined) nextUser.username = payload.username;
      if (patch.avatarUrl === null) delete nextUser.avatarUrl;
      else if (patch.avatarUrl !== undefined) nextUser.avatarUrl = patch.avatarUrl;

      _store.setUser(nextUser);
      return true;
    } catch (e: any) {
      error.value = e?.message || "Profil güncellenemedi";
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function uploadAvatar(file: File) {
    const uid = user.value?.uid;
    if (!uid) throw new Error("Oturum bulunamadı");
    if (!$supabase) throw new Error("Depolama hazır değil");

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Sadece JPG, PNG, WEBP veya GIF yükleyebilirsin");
    }
    if (file.size > MAX_AVATAR_BYTES) {
      throw new Error("Görsel en fazla 2.5 MB olabilir");
    }

    error.value = "";
    uploading.value = true;
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uid}/avatar_${Date.now()}.${ext}`;

      const { error: upErr } = await $supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const { data: urlData } = $supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(path);

      if (!urlData?.publicUrl) throw new Error("Avatar URL alınamadı");

      await patchProfile({ avatarUrl: urlData.publicUrl });
      return urlData.publicUrl;
    } catch (e: any) {
      error.value = e?.message || "Avatar yüklenemedi";
      throw e;
    } finally {
      uploading.value = false;
    }
  }

  async function removeAvatar() {
    await patchProfile({ avatarUrl: null });
  }

  return {
    user,
    displayName,
    avatarSrc,
    saving,
    uploading,
    error,
    patchProfile,
    uploadAvatar,
    removeAvatar,
  };
}
