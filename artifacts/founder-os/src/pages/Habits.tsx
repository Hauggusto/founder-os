import { useMemo, useState } from 'react';
import { Check, ClipboardCheck, Minus, Plus, X } from 'lucide-react';
import { useAppStore, type HabitEntry, type IdentityStatus } from '@/store/useAppStore';

const keyOf = (date: Date) => date.toISOString().slice(0, 10);
const nextStatus = (status?: IdentityStatus): IdentityStatus | null => status === undefined ? 'done' : status === 'done' ? 'partial' : status === 'partial' ? 'missed' : null;

function weekDays() {
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return date; });
}

const tone: Record<string, string> = {
  done: 'border-emerald-500/70 bg-emerald-950/80 text-emerald-200 shadow-[0_0_9px_rgba(16,185,129,.5)]',
  partial: 'border-orange-500/70 bg-orange-950/80 text-orange-200 shadow-[0_0_9px_rgba(249,115,22,.45)]',
  missed: 'border-red-500/70 bg-red-950/80 text-red-200 shadow-[0_0_9px_rgba(239,68,68,.45)]',
};

function HabitCell({ habit, date, onChange }: { habit: HabitEntry; date: Date; onChange: (status: IdentityStatus | null) => void }) {
  const status = habit.checks?.[keyOf(date)];
  return <button title={status || 'Não registrado'} onClick={() => onChange(nextStatus(status))} className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg border transition hover:scale-110 ${status ? tone[status] : 'border-cyan-500/25 bg-background/50 text-transparent'}`}>
    {status === 'done' ? <Check className="h-4 w-4" /> : status === 'partial' ? <Minus className="h-4 w-4" /> : status === 'missed' ? <X className="h-4 w-4" /> : '·'}
  </button>;
}

export default function Habits() {
  const { habits, addHabitEntry, setHabitCheck } = useAppStore();
  const [title, setTitle] = useState('');
  const days = useMemo(weekDays, []);
  const grouped = habits.reduce<Record<string, HabitEntry[]>>((groups, habit) => { (groups[habit.category || 'Rotina'] ||= []).push(habit); return groups; }, {});
  const add = () => { if (!title.trim()) return; addHabitEntry({ title: title.trim(), done: false, streak: 0, category: 'Rotina', order: habits.length }); setTitle(''); };
  const score = habits.length ? Math.round(habits.reduce((sum, habit) => sum + days.reduce((inner, day) => inner + (habit.checks?.[keyOf(day)] === 'done' ? 1 : habit.checks?.[keyOf(day)] === 'partial' ? .5 : 0), 0), 0) / (habits.length * 7) * 100) : 0;

  return <div className="mx-auto w-full max-w-[1500px] space-y-6">
    <header className="rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-[#07151d] via-card to-[#111421] p-6"><p className="text-xs font-semibold uppercase tracking-[.25em] text-cyan-400">ROTINA / EXECUÇÃO</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Checklist de Hábitos</h1><p className="mt-1 text-sm text-muted-foreground">Registre aqui o que você precisa fazer em cada dia. A Identidade acompanha automaticamente.</p></div><div className="rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-5 py-3 text-right"><p className="text-xs text-muted-foreground">Execução da semana</p><p className="text-2xl font-bold text-cyan-300">{score}%</p></div></div></header>
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/70"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-5"><div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-cyan-400" /><div><h2 className="font-semibold">Grade semanal</h2><p className="text-xs text-muted-foreground">Verde: feito · laranja: parcial · vermelho: não executado</p></div></div><div className="flex gap-2"><input value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && add()} placeholder="Novo hábito..." className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-cyan-400" /><button onClick={add} className="inline-flex h-9 items-center gap-1 rounded-lg bg-cyan-400 px-3 text-sm font-semibold text-slate-950"><Plus className="h-4 w-4" />Adicionar</button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse"><thead><tr className="border-b border-border/50 text-xs text-muted-foreground"><th className="sticky left-0 z-10 bg-card px-5 py-3 text-left">Hábito</th>{days.map((date) => <th key={keyOf(date)} className="px-2 py-3 text-center"><span className="block uppercase">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span><span>{date.getDate()}</span></th>)}</tr></thead><tbody>{Object.entries(grouped).map(([category, entries]) => <><tr key={`category-${category}`}><td colSpan={8} className="bg-background/30 px-5 py-2 text-[10px] font-semibold uppercase tracking-[.2em] text-cyan-300">{category}</td></tr>{entries.map((habit) => <tr key={habit.id} className="border-b border-border/40 last:border-0"><td className="sticky left-0 bg-card px-5 py-4"><p className="text-sm font-medium">{habit.title}</p><p className="text-xs text-muted-foreground">Sequência: {habit.streak} dias</p></td>{days.map((date) => <td key={keyOf(date)} className="px-2 py-4 text-center"><HabitCell habit={habit} date={date} onChange={(status) => setHabitCheck(habit.id, keyOf(date), status)} /></td>)}</tr>)}</>)}</tbody></table></div></section>
  </div>;
}
