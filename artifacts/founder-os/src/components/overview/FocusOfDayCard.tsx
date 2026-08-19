import { Activity, ArrowRight, CalendarCheck2, CheckCircle2, CircleAlert, ListChecks, Target } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { useAppStore } from '@/store/useAppStore';

export function FocusOfDayCard() {
  const { weekFocus, habits, nextActions, agenda } = useAppStore();
  const today = new Date().toISOString().slice(0, 10);
  const openActions = nextActions.filter((item) => !item.done).length;
  const doneHabits = habits.filter((item) => item.done).length;
  const todayAgenda = agenda.filter((item) => !item.date || item.date === today).length;
  const total = habits.length + nextActions.filter((item) => item.date === today || item.done).length;
  const completed = doneHabits + nextActions.filter((item) => item.done && item.completedAt === today).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return <section className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[.09] via-card/80 to-orange-400/[.04] p-5 shadow-[0_0_30px_#00c9ff08]">
    <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-primary"><Target className="h-4 w-4" /><span className="text-[10px] font-semibold uppercase tracking-[.2em]">Foco do dia</span></div><h2 className="mt-3 text-xl font-semibold tracking-tight">{weekFocus || 'Escolha uma direção para hoje'}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Uma leitura rápida do que merece sua energia agora.</p></div><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-xl font-semibold text-primary">{progress}%</div></div>
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-background/80"><div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all" style={{ width: `${progress}%` }} /></div>
    <div className="mt-4 grid grid-cols-3 gap-2"><Metric icon={<CircleAlert className="h-3.5 w-3.5" />} value={openActions} label="ações abertas" tone="text-orange-300" /><Metric icon={<CheckCircle2 className="h-3.5 w-3.5" />} value={doneHabits} label="hábitos feitos" tone="text-emerald-300" /><Metric icon={<CalendarCheck2 className="h-3.5 w-3.5" />} value={todayAgenda} label="na agenda" tone="text-cyan-300" /></div>
    <div className="mt-4 flex flex-wrap gap-2"><Link href="/produtividade" className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-[10px] font-semibold text-primary transition hover:bg-primary/15"><Activity className="h-3.5 w-3.5" /> Abrir execução <ArrowRight className="h-3 w-3" /></Link><Link href="/habitos" className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/35 px-3 py-2 text-[10px] text-muted-foreground transition hover:border-primary/30 hover:text-foreground"><ListChecks className="h-3.5 w-3.5" /> Ver hábitos</Link></div>
  </section>;
}

function Metric({ icon, value, label, tone }: { icon: ReactNode; value: number; label: string; tone: string }) {
  return <div className="rounded-xl border border-border/60 bg-background/35 p-2.5"><div className={`flex items-center gap-1.5 ${tone}`}><span>{icon}</span><span className="text-base font-semibold">{value}</span></div><p className="mt-0.5 text-[9px] text-muted-foreground">{label}</p></div>;
}
