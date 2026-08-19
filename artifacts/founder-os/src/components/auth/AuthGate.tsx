import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { LogIn, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { applyLocalPreferences, loadCloudAppData } from '@/lib/cloudSync';
import { useAppStore } from '@/store/useAppStore';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [callbackError, setCallbackError] = useState('');

  useEffect(() => {
    if (window.location.hostname === 'founder-os-up-go-on.vercel.app') {
      const destination = new URL('https://founder-os-seven-rouge.vercel.app');
      destination.pathname = window.location.pathname;
      destination.search = window.location.search;
      destination.hash = window.location.hash;
      window.location.replace(destination.toString());
      return;
    }

    if (!supabase) { setLoading(false); return; }

    let mounted = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (mounted) setSession(next);
    });

    async function initializeSession() {
      const query = new URLSearchParams(window.location.search);
      const authorizationCode = query.get('code');
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      let callbackHandled = false;

      if (authorizationCode) {
        const { error } = await supabase!.auth.exchangeCodeForSession(authorizationCode);
        callbackHandled = !error;
        if (error && mounted) setCallbackError(error.message);
      }

      // Some OAuth redirects return an implicit-flow session in the URL hash.
      // Persist it explicitly before checking the current session.
      if (!callbackHandled && accessToken && refreshToken) {
        const { error } = await supabase!.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        callbackHandled = !error;
        if (error && mounted) setCallbackError(error.message);
      }

      if (callbackHandled) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const { data } = await supabase!.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    }

    void initializeSession();
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;
    const modulesBeforeLoad = useAppStore.getState().modules;
    void loadCloudAppData().then((cloudData) => {
      if (!active) return;
      if (cloudData) {
        applyLocalPreferences(cloudData.localPreferences);
        const currentModules = useAppStore.getState().modules;
        const modulesChangedWhileLoading = JSON.stringify(currentModules) !== JSON.stringify(modulesBeforeLoad);
        useAppStore.setState(modulesChangedWhileLoading ? { ...cloudData, modules: currentModules } : cloudData);
        if (modulesChangedWhileLoading) useAppStore.getState().saveToStorage();
      }
      else useAppStore.getState().saveToStorage();
    });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    const sync = async () => {
      const modulesBeforeLoad = useAppStore.getState().modules;
      const cloudData = await loadCloudAppData();
      if (!active) return;
      if (cloudData) {
        applyLocalPreferences(cloudData.localPreferences);
        const currentModules = useAppStore.getState().modules;
        const modulesChangedWhileLoading = JSON.stringify(currentModules) !== JSON.stringify(modulesBeforeLoad);
        useAppStore.setState(modulesChangedWhileLoading ? { ...cloudData, modules: currentModules } : cloudData);
        if (modulesChangedWhileLoading) useAppStore.getState().saveToStorage();
      }
      // Also captures legacy local-only fields and sends them to the cloud.
      useAppStore.getState().saveToStorage();
    };
    const timer = window.setInterval(() => void sync(), 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [session]);

  if (!isSupabaseConfigured) {
    return <AuthMessage title="Autenticação ainda não configurada" body="Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis da Vercel e no ambiente local." />;
  }
  if (loading) return <AuthMessage title="Verificando sua sessão" body="Aguarde um instante..." />;
  if (callbackError) return <AuthMessage title="Não foi possível concluir o login" body={callbackError} />;
  if (!session) return <LoginScreen />;
  return <>{children}</>;
}

function AuthMessage({ title, body }: { title: string; body: string }) {
  return <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground"><section className="w-full max-w-md rounded-2xl border border-cyan-400/25 bg-card p-8 text-center shadow-2xl"><ShieldCheck className="mx-auto mb-5 h-10 w-10 text-cyan-400" /><h1 className="text-xl font-semibold">{title}</h1><p className="mt-3 text-sm text-muted-foreground">{body}</p></section></main>;
}

function LoginScreen() {
  const [error, setError] = useState('');
  async function login() {
    setError('');
    const { error: authError } = await supabase!.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (authError) setError(authError.message);
  }
  return <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground"><section className="w-full max-w-md rounded-2xl border border-cyan-400/25 bg-card p-8 text-center shadow-2xl"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-400/10"><ShieldCheck className="h-8 w-8 text-cyan-400" /></div><p className="text-xs font-semibold uppercase tracking-[.25em] text-cyan-400">NEURON</p><h1 className="mt-2 text-3xl font-semibold">Founder OS</h1><p className="mt-3 text-sm text-muted-foreground">Entre com sua conta Google para acessar seu dashboard.</p><button onClick={login} className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"><LogIn className="h-5 w-5" />Entrar com Google</button>{error && <p className="mt-4 text-sm text-red-400">{error}</p>}</section></main>;
}
