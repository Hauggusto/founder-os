import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { readLocalPreferences } from '@/lib/cloudSync';

const TABLE = 'user_app_data';
const FLOOR_KEY = 'founder-os-psychological-floor';

function serialize() {
  const data = JSON.parse(useAppStore.getState().exportData());
  const floor = Number(localStorage.getItem(FLOOR_KEY));
  return JSON.stringify({ ...data, localPreferences: readLocalPreferences(), ...(Number.isFinite(floor) ? { psychologicalFloor: floor } : {}) });
}

/** Persists changes in batches. AuthGate performs the single initial cloud read. */
export function RemoteSync() {
  useEffect(() => {
    if (!supabase) return;
    let disposed = false;
    let timer: number | undefined;
    let ready = false;
    let userId = '';
    let lastSaved = '';
    let saving = false;

    const save = async () => {
      if (disposed || !ready || !userId || saving) return;
      const serialized = serialize();
      if (serialized === lastSaved) return;
      saving = true;
      const { error } = await supabase.from(TABLE).upsert(
        { user_id: userId, data: JSON.parse(serialized), updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
      saving = false;
      if (error) {
        console.warn('Founder OS: não foi possível sincronizar os dados.', error.message);
      } else if (serialize() === serialized) {
        lastSaved = serialized;
      } else {
        scheduleSave();
      }
    };

    const scheduleSave = () => {
      if (!ready) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void save(), 5000);
    };

    const markDirty = () => scheduleSave();
    const initialize = async () => {
      const { data: authData } = await supabase.auth.getUser();
      userId = authData.user?.id || '';
      if (!userId || disposed) return;
      ready = true;
      lastSaved = serialize();
      const unsubscribe = useAppStore.subscribe(markDirty);
      window.addEventListener('founder-os-psychological-floor-updated', markDirty);
      return () => {
        unsubscribe();
        window.removeEventListener('founder-os-psychological-floor-updated', markDirty);
      };
    };

    let cleanup: (() => void) | undefined;
    void initialize().then((value) => { cleanup = value; });
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      cleanup?.();
    };
  }, []);

  return null;
}
