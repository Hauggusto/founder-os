import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Flag, Flame, Plus, X } from 'lucide-react';
import { Link } from 'wouter';
import { Checkbox } from '@/components/ui/checkbox';

export function NextActionsBlock() {
  const { nextActions, toggleNextAction, addNextAction, updateNextAction, deleteNextAction } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState<'important' | 'urgent'>('important');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('');
  
  const sortedActions = [...nextActions].sort((a, b) => Number(a.done) - Number(b.done));

  const save = () => { if (!text.trim()) return; addNextAction(text.trim(), project.trim() || undefined, priority, date, time || undefined); setText(''); setProject(''); setDate(new Date().toISOString().slice(0, 10)); setTime(''); setAdding(false); };
  const renderActions = (items: typeof sortedActions) => <div className="space-y-2">{items.length ? items.map((action) => (
          <div key={action.id} className="flex items-start gap-3 rounded-lg border border-white/[.06] bg-background/25 p-2.5 transition-colors hover:border-primary/20 hover:bg-[#ffffff05] group">
            <Checkbox 
              checked={action.done} 
              onCheckedChange={() => toggleNextAction(action.id)}
              className="mt-0.5"
            />
            {action.priority === 'urgent' ? <Flame className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" /> : <Flag className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />}
            <div className="flex-1 flex flex-col items-start gap-1.5 min-w-0">
              <input value={action.text} onChange={(e) => updateNextAction(action.id, { text: e.target.value })} className={`w-full rounded border border-transparent bg-transparent px-1 text-sm leading-snug outline-none focus:border-primary ${action.done ? 'line-through text-muted-foreground' : 'text-foreground'}`} aria-label="Editar próxima ação" />
              <div className="flex flex-wrap items-center gap-1"><input value={action.project || ''} onChange={(e) => updateNextAction(action.id, { project: e.target.value })} placeholder="Adicionar tag" className={`h-5 min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 text-[9px] uppercase text-muted-foreground outline-none focus:border-primary ${action.done ? 'opacity-50' : ''}`} aria-label="Editar tag da ação" /><input type="date" value={action.date || ''} onChange={(e) => updateNextAction(action.id, { date: e.target.value })} className="h-5 rounded border border-transparent bg-transparent px-1 text-[9px] text-muted-foreground outline-none focus:border-primary" aria-label="Data da execução" /><select value={action.executionStatus || (action.done ? 'executed' : 'pending')} onChange={(e) => { const executionStatus = e.target.value as 'pending' | 'executed' | 'failed'; updateNextAction(action.id, { executionStatus, done: executionStatus === 'executed' }); }} className="h-5 rounded border border-transparent bg-transparent px-1 text-[9px] text-muted-foreground outline-none focus:border-primary" aria-label="Status da execução"><option value="pending">Pendente</option><option value="executed">Executada</option><option value="failed">Não executada</option></select>{action.project && <Link href={`/projetos?project=${encodeURIComponent(action.project)}`} className="shrink-0 rounded bg-primary/[.06] px-1.5 py-0.5 text-[9px] uppercase text-primary hover:bg-primary/15">Abrir projeto</Link>}</div>
            </div>
            <button onClick={() => deleteNextAction(action.id)} className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100" aria-label="Excluir próxima ação"><X className="h-3.5 w-3.5" /></button>
          </div>)) : <p className="rounded-lg border border-dashed border-white/10 p-3 text-center text-[11px] text-muted-foreground">Nenhuma ação nesta prioridade.</p>}</div>;

  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-orange-300">ENTREGAS PONTUAIS</p><h3 className="mt-1 text-sm font-semibold text-foreground">Tarefas avulsas</h3><p className="mt-1 text-[10px] text-muted-foreground">Ações com data ou horário específico, sem repetição automática.</p></div>
        <div className="flex items-center gap-2"><button onClick={() => setAdding((value) => !value)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 text-primary hover:bg-primary/10" aria-label="Adicionar próxima ação"><Plus className="h-4 w-4" /></button><span className="rounded-full border border-primary/20 bg-primary/[.06] px-2 py-1 text-[10px] text-primary">{sortedActions.filter((a) => !a.done).length} abertas</span></div>
      </div>
      {adding && <div className="mb-4 grid gap-2 rounded-xl border border-primary/20 bg-primary/[.04] p-2 sm:grid-cols-[1fr_1fr_auto_auto_auto_auto]"><input autoFocus value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setAdding(false); }} placeholder="Próxima ação avulsa" className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs outline-none focus:border-primary" /><input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Projeto / tag" className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs outline-none focus:border-primary" /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs outline-none focus:border-primary" /><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs outline-none focus:border-primary" aria-label="Horário opcional" /><select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="rounded-md border border-white/10 bg-background px-2 py-1.5 text-xs"><option value="important">Importante</option><option value="urgent">Urgente</option></select><button onClick={save} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Salvar</button></div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <section><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"><Flame className="h-4 w-4 text-orange-400" /> Urgentes <span className="rounded bg-orange-400/10 px-1.5 py-0.5 text-[9px] text-orange-300">FOGO</span></div>{renderActions(sortedActions.filter((a) => a.priority === 'urgent'))}</section>
        <section><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"><Flag className="h-4 w-4 text-emerald-400" /> Importantes <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[9px] text-emerald-300">PRIORIDADE</span></div>{renderActions(sortedActions.filter((a) => a.priority !== 'urgent'))}</section>
      </div>
    </div>
  );
}
