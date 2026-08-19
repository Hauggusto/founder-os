import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock3, Plus } from 'lucide-react';

export function AgendaBlock() {
  const { agenda, toggleAgendaItem, updateAgendaItem, addAgendaItem } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<{ title: string; time: string; date: string; type: 'meeting' | 'task' | 'reminder' | 'presencial' }>({ title: '', time: '09:00', date: new Date().toISOString().slice(0, 10), type: 'task' });
  
  const sortedAgenda = [...agenda].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Agenda
        </h3>
        <button onClick={() => setAdding((value) => !value)} className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-2 py-1 text-[10px] text-primary hover:bg-primary/10"><Plus className="h-3 w-3" /> Adicionar</button>
      </div>

      {adding && <div className="mb-3 grid gap-2 rounded-xl border border-primary/20 bg-primary/[.04] p-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
        <input autoFocus value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Nome do compromisso" className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs outline-none focus:border-primary" />
        <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs" />
        <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs" />
        <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as typeof draft.type })} className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs"><option value="task">Tarefa</option><option value="meeting">Reunião</option><option value="reminder">Lembrete</option><option value="presencial">Presencial</option></select>
        <button onClick={() => { if (!draft.title.trim()) return; addAgendaItem({ ...draft, title: draft.title.trim(), done: false }); setDraft({ ...draft, title: '' }); setAdding(false); }} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Salvar</button>
      </div>}

      <div className="space-y-1">
        {sortedAgenda.map((item, idx) => {
          const isNext = !item.done && (idx === 0 || sortedAgenda[idx - 1].done);
          return (
            <div 
              key={item.id} 
              className={`flex items-start gap-3 p-2.5 rounded-md transition-colors ${
                isNext ? 'bg-[#ffffff0a] border border-[#ffffff10]' : 'hover:bg-[#ffffff05]'
              }`}
            >
              <div className="flex w-[112px] flex-col gap-1">
                <label className={`flex items-center gap-1.5 rounded-md border border-transparent px-1 text-sm font-mono outline-none focus-within:border-primary ${item.done ? 'text-muted-foreground' : 'text-white'}`}><Clock3 className="h-3.5 w-3.5 shrink-0 text-emerald-400" /><input type="time" value={item.time} onChange={(e) => updateAgendaItem(item.id, { time: e.target.value })} className="w-[78px] bg-transparent outline-none [&::-webkit-calendar-picker-indicator]:hidden" /></label>
                <label className="flex items-center gap-1.5 rounded-md border border-transparent px-1 text-[10px] text-white outline-none focus-within:border-primary"><CalendarDays className="h-3.5 w-3.5 shrink-0 text-amber-300" /><input type="date" value={item.date || ''} onChange={(e) => updateAgendaItem(item.id, { date: e.target.value })} className="w-[88px] bg-transparent text-white outline-none [&::-webkit-calendar-picker-indicator]:hidden" aria-label="Data da agenda" /></label>
              </div>
              <div className="flex-1 flex items-start gap-2">
                <input value={item.title} onChange={(e) => updateAgendaItem(item.id, { title: e.target.value })} className={`min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 text-sm leading-tight outline-none focus:border-primary ${item.done ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`} />
                <select value={item.type} onChange={(e) => updateAgendaItem(item.id, { type: e.target.value as typeof item.type })} className={`h-5 rounded border-transparent bg-background px-1 text-[9px] uppercase outline-none focus:border-primary ${
                  item.type === 'meeting' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' :
                  item.type === 'task' ? 'bg-[#00C9FF]/10 text-[#00C9FF]' :
                  item.type === 'presencial' ? 'bg-amber-500/10 text-amber-300' : 'bg-muted text-muted-foreground'
                }`} aria-label="Tipo da agenda"><option value="meeting">Reunião</option><option value="task">Tarefa</option><option value="reminder">Lembrete</option><option value="presencial">Presencial</option></select>
              </div>
              <Checkbox 
                checked={item.done} 
                onCheckedChange={() => toggleAgendaItem(item.id)}
                className="mt-0.5"
              />
              <button onClick={() => updateAgendaItem(item.id, { title: `${item.title}` })} className="sr-only" aria-label="Salvar agenda" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
