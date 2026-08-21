import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

const TABLE = 'user_app_data';
const FLOOR_KEY = 'founder-os-psychological-floor';
const REFRESH_GUARD_MS = 1500;

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
    let lastRefresh = 0;
    let lastSaved = '';
    let ready = false;
    let userId = '';

    const applyRemoteData = (remoteData: unknown) => {
      if (disposed || !remoteData || typeof remoteData !== 'object') return;
      const payload = remoteData as Record<string, unknown>;
      if (typeof payload.psychologicalFloor === 'number') {
        localStorage.setItem(FLOOR_KEY, String(payload.psychologicalFloor));
        window.dispatchEvent(new Event('founder-os-psychological-floor-updated'));
      }
      const { psychologicalFloor: _floor, ...appData } = payload;
      useAppStore.getState().importData(JSON.stringify(appData));
      lastSaved = serialize();
    };

    const readRemote = async () => {
      if (disposed || !userId) return;
      const now = Date.now();
      if (now - lastRefresh < REFRESH_GUARD_MS) return;
      lastRefresh = now;
      const { data: remote, error } = await supabase
        .from(TABLE)
        .select('data,updated_at')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        console.warn('Founder OS: não foi possível atualizar os dados online.', error.message);
        return;
      }
      if (remote?.data) applyRemoteData(remote.data);
    };

    const save = async () => {
      if (disposed || !ready || !userId) return;
      const serialized = serialize();
      if (serialized === lastSaved) return;
      const { error } = await supabase.from(TABLE).upsert(
        { user_id: userId, data: JSON.parse(serialized), updated_at: new Date().toISOString() },
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

    const onLocalPreferenceUpdated = () => { void save(); };
    const onResume = () => { void readRemote(); };
    const onVisibility = () => { if (document.visibilityState === 'visible') void readRemote(); };

    const initialize = async () => {
      const { data: authData } = await supabase.auth.getUser();
      userId = authData.user?.id || '';
      if (!userId || disposed) return;

      await readRemote();
      if (disposed) return;

      ready = true;
      lastSaved = serialize();
      const unsubscribe = useAppStore.subscribe(scheduleSave);
      window.addEventListener('founder-os-psychological-floor-updated', onLocalPreferenceUpdated);
      window.addEventListener('focus', onResume);
      window.addEventListener('online', onResume);
      document.addEventListener('visibilitychange', onVisibility);

      const channel = supabase
        .channel(`founder-os-sync-${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: TABLE, filter: `user_id=eq.${userId}` },
          (payload) => applyRemoteData((payload.new as { data?: unknown })?.data),
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') void readRemote();
        });

      return () => {
        unsubscribe();
        void supabase.removeChannel(channel);
      };
    };

    let cleanup: (() => void) | undefined;
    void initialize().then((value) => { cleanup = value; });

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      cleanup?.();
      window.removeEventListener('founder-os-psychological-floor-updated', onLocalPreferenceUpdated);
      window.removeEventListener('focus', onResume);
      window.removeEventListener('online', onResume);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
