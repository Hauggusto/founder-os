import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { readLocalPreferences } from '@/lib/cloudSync';

const TABLE = 'user_app_data';
const FLOOR_KEY = 'founder-os-psychological-floor';
// Avoid repeated full-snapshot reads when the dashboard regains focus.
const REFRESH_GUARD_MS = 60_000;

function serialize() {
  const data = JSON.parse(useAppStore.getState().exportData());
  const floor = Number(localStorage.getItem(FLOOR_KEY));
  return JSON.stringify({
    ...data,
    localPreferences: readLocalPreferences(),
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
    let localDirty = false;
    let applyingRemote = false;
    let lastLocalPreferences = '';

    const applyRemoteData = (remoteData: unknown) => {
      if (disposed || !remoteData || typeof remoteData !== 'object') return;
      // Never replace an active local edit with an older realtime/polling snapshot.
      // The pending local snapshot is saved as soon as the debounce completes.
      if (localDirty && serialize() !== lastSaved) return;
      const payload = remoteData as Record<string, unknown>;
      applyingRemote = true;
      try {
        if (typeof payload.psychologicalFloor === 'number') {
          localStorage.setItem(FLOOR_KEY, String(payload.psychologicalFloor));
          window.dispatchEvent(new Event('founder-os-psychological-floor-updated'));
        }
        const { psychologicalFloor: _floor, ...appData } = payload;
        useAppStore.getState().importData(JSON.stringify(appData));
        lastSaved = serialize();
        localDirty = false;
      } finally {
        applyingRemote = false;
      }
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
      if (!error) {
        // A keystroke may have happened while the request was in flight.
        // Only mark the edit clean when the saved snapshot is still current.
        if (serialize() === serialized) {
          lastSaved = serialized;
          localDirty = false;
        } else {
          localDirty = true;
          scheduleSave();
        }
      }
      else console.warn('Founder OS: não foi possível sincronizar os dados.', error.message);
    };

    const scheduleSave = () => {
      if (!ready) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void save(), 1500);
    };

    const onLocalPreferenceUpdated = () => {
      if (applyingRemote) return;
      localDirty = true;
      void save();
    };
    const checkLocalPreferences = () => {
      if (!ready || applyingRemote) return;
      const current = JSON.stringify(readLocalPreferences());
      if (current === lastLocalPreferences) return;
      lastLocalPreferences = current;
      localDirty = true;
      void save();
    };
    const onResume = () => { if (!localDirty) void readRemote(); };
    const onVisibility = () => { if (document.visibilityState === 'visible' && !localDirty) void readRemote(); };

    const initialize = async () => {
      const { data: authData } = await supabase.auth.getUser();
      userId = authData.user?.id || '';
      if (!userId || disposed) return;

      await readRemote();
      if (disposed) return;

      ready = true;
      lastSaved = serialize();
      lastLocalPreferences = JSON.stringify(readLocalPreferences());
      const unsubscribe = useAppStore.subscribe(() => {
        if (!applyingRemote) {
          localDirty = true;
          scheduleSave();
        }
      });
      window.addEventListener('founder-os-psychological-floor-updated', onLocalPreferenceUpdated);
      window.addEventListener('focus', onResume);
      window.addEventListener('online', onResume);
      window.addEventListener('pagehide', onLocalPreferenceUpdated);
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
      window.removeEventListener('pagehide', onLocalPreferenceUpdated);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
