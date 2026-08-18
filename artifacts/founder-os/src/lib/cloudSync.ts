import { supabase } from "@/lib/supabase";
import type { AppData } from "@/store/useAppStore";

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
      data: appData,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error("Cloud save failed:", error.message);
  });
  await cloudWriteQueue;
}

let cloudWriteQueue = Promise.resolve();
