import { Circle, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'opaque' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => { const saved = localStorage.getItem('founder-os-theme'); return saved === 'light' || saved === 'opaque' || saved === 'dark' ? saved : 'dark'; });
  useEffect(() => { document.documentElement.classList.toggle('light', theme === 'light'); document.documentElement.classList.toggle('dark', theme !== 'light'); document.documentElement.classList.toggle('opaque', theme === 'opaque'); localStorage.setItem('founder-os-theme', theme); }, [theme]);
  const options: { id: Theme; label: string; icon: typeof Sun }[] = [{ id: 'light', label: 'Light', icon: Sun }, { id: 'opaque', label: 'Opaco', icon: Circle }, { id: 'dark', label: 'Night', icon: Moon }];
  return <div className="flex w-full items-center justify-center gap-1" aria-label="Tema do dashboard">{options.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTheme(id)} title={`Modo ${label}`} aria-label={`Modo ${label}`} className={`flex h-8 w-9 items-center justify-center rounded border transition ${theme === id ? 'border-primary/70 bg-primary/15 text-primary shadow-[0_0_8px_#00c9ff18]' : 'border-white/10 text-muted-foreground hover:border-primary/35 hover:bg-white/5 hover:text-foreground'}`}><Icon className="h-4 w-4" /></button>)}</div>;
}
