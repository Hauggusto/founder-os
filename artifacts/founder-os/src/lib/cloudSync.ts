import { supabase } from "@/lib/supabase";
import type { AppData } from "@/store/useAppStore";

export const CLOUD_LOCAL_STORAGE_KEYS = [
  "founder-os-daily-productivity",
  "founder-os-one-off-habit-tasks",
  "founder-os-commercial-items",
  "founder-os-storage-drives",
  "founder-os-personal-apps",
  "founder-os-portfolio",
  "founder-os-profile-photo",
  "founder-os-psychological-floor",
  "founder-os-theme",
  "founder-os-sidebar-width",
  "founder-os-agents",
  "investedAmount",
] as const;

export type CloudLocalPreferences = Record<string, string | null>;

export function readLocalPreferences(): CloudLocalPreferences {
  if (typeof window === "undefined") return {};
  return Object.fromEntries(CLOUD_LOCAL_STORAGE_KEYS.map((key) => [key, window.localStorage.getItem(key)]));
}

export function applyLocalPreferences(preferences?: CloudLocalPreferences) {
  if (typeof window === "undefined" || !preferences) return;
  for (const key of CLOUD_LOCAL_STORAGE_KEYS) {
    const value = preferences[key];
    if (value === null || value === undefined) continue;
    window.localStorage.setItem(key, value);
  }
}

export async function loadCloudAppData(): Promise<AppData | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from("user_app_data")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data?.data) return null;
  return data.data as AppData;
}

export async function saveCloudAppData(appData: AppData) {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;
  cloudWriteQueue = cloudWriteQueue.then(async () => {
    const { error } = await supabase!.from("user_app_data").upsert({
      user_id: user.id,
      data: { ...appData, localPreferences: readLocalPreferences() },
      updated_at: new Date().toISOString(),
    });
    if (error) console.error("Cloud save failed:", error.message);
  });
  await cloudWriteQueue;
}

let cloudWriteQueue = Promise.resolve();
