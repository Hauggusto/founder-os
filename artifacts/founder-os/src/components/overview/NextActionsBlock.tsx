import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CalendarCheck, Flag, Flame, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export function NextActionsBlock() {
  const { nextActions, toggleNextAction, addNextAction } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState<'important' | 'urgent'>('important');
  
  const sortedActions = [...nextActions].sort((a, b) => Number(a.done) - Number(b.done));

  const save = () => { if (!text.trim()) return; addNextAction(text.trim(), project.trim() || undefined, priority); setText(''); setProject(''); setAdding(false); };
  const renderActions = (items: typeof sortedActions) => <div className="space-y-2">{items.map((action) => (
          <div key={action.id} className="flex items-start gap-3 rounded-lg border border-white/[.06] bg-background/25 p-2.5 transition-colors hover:border-primary/20 hover:bg-[#ffffff05] group">
            <Checkbox 
              checked={action.done} 
              onCheckedChange={() => toggleNextAction(action.id)}
              className="mt-0.5"
            />
            {action.priority === 'urgent' ? <Flame className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" /> : <Flag className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />}
            <div className="flex-1 flex flex-col items-start gap-1.5 min-w-0">
              <span className={`text-sm leading-snug ${action.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {action.text}
              </span>
              {action.project && (
                <Badge variant="outline" className={`text-[9px] px-1 py-0 uppercase h-4 bg-[#ffffff05] text-muted-foreground border-[#ffffff10] ${action.done ? 'opacity-50' : ''}`}>
                  {action.project}
                </Badge>
              )}
            </div>
          </div>))}</div>;

  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">EXECUÇÃO</p><h3 className="mt-1 text-sm font-semibold text-foreground">Próximas ações</h3></div>
        <div className="flex items-center gap-2"><button onClick={() => setAdding((value) => !value)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 text-primary hover:bg-primary/10" aria-label="Adicionar próxima ação"><Plus className="h-4 w-4" /></button><span className="rounded-full border border-primary/20 bg-primary/[.06] px-2 py-1 text-[10px] text-primary">{sortedActions.filter((a) => !a.done).length} abertas</span></div>
      </div>
      {adding && <div className="mb-4 grid gap-2 rounded-xl border border-primary/20 bg-primary/[.04] p-2 sm:grid-cols-[1fr_1fr_auto_auto]"><input autoFocus value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setAdding(false); }} placeholder="Próxima ação" className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs outline-none focus:border-primary" /><input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Projeto / tag" className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs outline-none focus:border-primary" /><select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs"><option value="important">Importante</option><option value="urgent">Urgente</option></select><button onClick={save} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Salvar</button></div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <section><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"><CalendarCheck className="h-4 w-4 text-cyan-300" /> Hoje</div>{renderActions(sortedActions)}</section>
        <section><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"><Flag className="h-4 w-4 text-emerald-400" /> Prioridade <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[9px] text-emerald-300">IMPORTANTE</span></div>{renderActions(sortedActions.filter((a) => !a.done))}</section>
      </div>
    </div>
  );
}
