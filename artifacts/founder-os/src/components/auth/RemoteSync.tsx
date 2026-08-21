import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

const TABLE = 'user_app_data';
const FLOOR_KEY = 'founder-os-psychological-floor';

function serialize() {
  const data = JSON.parse(useAppStore.getState().exportData());
  const floor = Number(localStorage.getItem(FLOOR_KEY));
  return JSON.stringify({
    ...data,
    ...(Number.isFinite(floor) ? { psychologicalFloor: floor } : {}),
  });
}

export function RemoteSync() {
  useEffect(() => {
    if (!supabase) return;

    let disposed = false;
    let timer: number | undefined;
    let lastSaved = '';
    let ready = false;

    const save = async () => {
      if (disposed || !ready) return;
      const serialized = serialize();
      if (serialized === lastSaved) return;
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user || disposed) return;
      const { error } = await supabase.from(TABLE).upsert(
        { user_id: user.id, data: JSON.parse(serialized), updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
      if (!error) lastSaved = serialized;
      else console.warn('Founder OS: não foi possível sincronizar os dados.', error.message);
    };

    const scheduleSave = () => {
      if (!ready) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void save(), 1500);
    };
    const onLocalPreferenceUpdated = () => scheduleSave();

    const initialize = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user || disposed) return;

      const { data: remote, error } = await supabase
        .from(TABLE)
        .select('data,updated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) console.warn('Founder OS: não foi possível carregar a cópia online.', error.message);
      if (!disposed && remote?.data) {
        const payload = remote.data as Record<string, unknown>;
        if (typeof payload.psychologicalFloor === 'number') {
          localStorage.setItem(FLOOR_KEY, String(payload.psychologicalFloor));
        }
        const { psychologicalFloor: _floor, ...appData } = payload;
        useAppStore.getState().importData(JSON.stringify(appData));
      }

      lastSaved = serialize();
      ready = true;
      const unsubscribe = useAppStore.subscribe(scheduleSave);
      window.addEventListener('founder-os-psychological-floor-updated', onLocalPreferenceUpdated);
      if (!disposed) {
        window.addEventListener('beforeunload', () => { void save(); });
      }
      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    void initialize().then((cleanup) => { unsubscribe = cleanup; });
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      unsubscribe?.();
      window.removeEventListener('founder-os-psychological-floor-updated', onLocalPreferenceUpdated);
    };
  }, []);

  return null;
}
