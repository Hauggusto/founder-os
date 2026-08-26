import { useState } from 'react';
import { useAppStore, type HabitEntry } from '@/store/useAppStore';
import { Flag, Flame, Plus, Tag, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

function ProjectPicker({
  value,
  projects,
  onChange,
  ariaLabel,
}: {
  value: string;
  projects: { id: string; title: string }[];
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value || 'Sem projeto';

  return (
    <div className="relative min-w-0" onBlur={() => window.setTimeout(() => setOpen(false), 120)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-7 max-w-full items-center gap-2 rounded-full bg-white/[.035] px-2.5 text-[10px] text-muted-foreground outline-none transition hover:bg-primary/[.08] hover:text-primary focus-visible:ring-1 focus-visible:ring-primary/60"
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        <span className="max-w-[150px] truncate">{selected}</span>
        <span className="text-[9px] opacity-60">⌄</span>
      </button>
      {open && (
        <div className="absolute left-0 top-8 z-30 max-h-56 min-w-[170px] overflow-y-auto rounded-xl border border-primary/20 bg-[#0b1016] p-1 shadow-[0_12px_30px_rgba(0,0,0,.45)]">
          {['', ...projects.map((project) => project.title)].map((option) => (
            <button
              key={option || 'none'}
              type="button"
              onClick={() => { onChange(option); setOpen(false); }}
              className={`block w-full rounded-lg px-2.5 py-2 text-left text-[10px] transition ${option === value ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-white/[.06] hover:text-foreground'}`}
            >
              {option || 'Sem projeto'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NextActionsBlock() {
  const { nextActions, productivityHabits, tags, modules, toggleNextAction, updateProductivityHabitEntry, setProductivityHabitCheck, addNextAction, updateNextAction, deleteNextAction } = useAppStore();
  const projects = modules.filter((module) => module.type === 'project').sort((a, b) => a.title.localeCompare(b.title));
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState<'important' | 'urgent'>('important');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  
  const today = new Date().toISOString().slice(0, 10);
  type DisplayAction = {
    id: string;
    text: string;
    done: boolean;
    priority?: 'important' | 'urgent';
    project?: string;
    completedAt?: string;
    source: 'one-off' | 'recurring';
    habit?: HabitEntry;
  };
  const recurringActions: DisplayAction[] = productivityHabits
    .filter((habit) => habit.priority)
    .map((habit) => ({
      id: `recurring:${habit.id}`,
      text: habit.title,
      done: habit.checks?.[today] === 'done',
      priority: habit.priority,
      project: habit.project,
      completedAt: habit.checks?.[today] === 'done' ? today : undefined,
      source: 'recurring' as const,
      habit,
    }));
  const sortedActions: DisplayAction[] = [
    ...nextActions.map((action) => ({ ...action, source: 'one-off' as const })),
    ...recurringActions,
  ].sort((a, b) => Number(a.done) - Number(b.done));
  const pendingActions = sortedActions.filter((action) => !action.done);
  const completedToday = sortedActions.filter((action) => action.done && action.completedAt === today).length;
  const completedActions = sortedActions.filter((action) => action.done);
  const oneOffPendingActions = pendingActions.filter((action) => action.source === 'one-off');
  const toggleDisplayAction = (action: DisplayAction) => {
    if (action.source === 'recurring' && action.habit) {
      setProductivityHabitCheck(action.habit.id, today, action.done ? null : 'done');
      return;
    }
    toggleNextAction(action.id);
  };
  const updateDisplayAction = (action: DisplayAction, updates: { text?: string; project?: string }) => {
    if (action.source === 'recurring' && action.habit) {
      updateProductivityHabitEntry(action.habit.id, updates);
      return;
    }
    updateNextAction(action.id, updates);
  };
  const deleteDisplayAction = (action: DisplayAction) => {
    if (action.source === 'recurring' && action.habit) {
      updateProductivityHabitEntry(action.habit.id, { priority: undefined });
      return;
    }
    deleteNextAction(action.id);
  };
  const save = () => { if (!text.trim()) return; addNextAction(text.trim(), project.trim() || undefined, priority, undefined, undefined, selectedTags); setText(''); setProject(''); setSelectedTags([]); setAdding(false); };
  const renderActions = (items: DisplayAction[]) => <div className="space-y-2">{items.length ? items.map((action) => (
          <div key={action.id} className="next-action-row flex items-start gap-3 rounded-lg border border-white/[.06] bg-background/25 p-2.5 transition-colors hover:border-primary/20 hover:bg-[#ffffff05] group">
            <Checkbox
              checked={action.done}
              onCheckedChange={() => toggleDisplayAction(action)}
              className={`mt-0.5 shrink-0 ${action.priority === 'urgent' ? 'border-orange-400/70 data-[state=checked]:border-orange-400 data-[state=checked]:bg-orange-400' : 'border-emerald-400/70 data-[state=checked]:border-emerald-400 data-[state=checked]:bg-emerald-400'}`}
              aria-label={`Marcar ${action.text} como concluída`}
            />
            <input value={action.text} onChange={(e) => updateDisplayAction(action, { text: e.target.value })} className={`min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 text-sm leading-snug outline-none focus:border-primary ${action.done ? 'line-through text-muted-foreground' : 'text-foreground'}`} aria-label={action.source === 'recurring' ? 'Editar tarefa recorrente' : 'Editar próxima ação'} />
            <div className="flex shrink-0 items-center gap-1.5">
              <ProjectPicker value={action.project || ''} projects={projects} onChange={(value) => updateDisplayAction(action, { project: value || undefined })} ariaLabel="Projeto da ação" />
              <button type="button" onClick={(event) => { event.stopPropagation(); deleteDisplayAction(action); }} className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100" aria-label={action.source === 'recurring' ? 'Remover prioridade da tarefa' : 'Excluir próxima ação'} title={action.source === 'recurring' ? 'Remover da lista de entregas' : 'Excluir tarefa'}><X className="h-3.5 w-3.5" /></button>
            </div>
          </div>)) : <p className="rounded-lg border border-dashed border-white/10 p-3 text-center text-[11px] text-muted-foreground">Nenhuma ação nesta prioridade.</p>}</div>;

  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-orange-300">ENTREGAS PONTUAIS</p><h3 className="mt-1 text-sm font-semibold text-foreground">Tarefas avulsas</h3><p className="mt-1 text-[10px] text-muted-foreground">Ações com data ou horário específico, sem repetição automática.</p></div>
        <div className="flex items-center gap-2"><button onClick={() => setAdding((value) => !value)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 text-primary hover:bg-primary/10" aria-label="Adicionar próxima ação"><Plus className="h-4 w-4" /></button><span className="rounded-full border border-primary/20 bg-primary/[.06] px-2 py-1 text-[10px] text-primary">{pendingActions.length} abertas</span></div>
      </div>
      {adding && <div className="mb-4 grid gap-2 rounded-xl border border-primary/20 bg-primary/[.04] p-2 sm:grid-cols-[1fr_1fr_auto_auto]"><input autoFocus value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setAdding(false); }} placeholder="Próxima ação avulsa" className="rounded-full border-0 bg-background px-3 py-2 text-xs outline-none ring-1 ring-white/10 focus:ring-primary/60" /><ProjectPicker value={project} projects={projects} onChange={setProject} ariaLabel="Projeto da nova ação" /><select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="h-8 rounded-full border-0 bg-background px-3 text-xs outline-none ring-1 ring-white/10 focus:ring-primary/60"><option value="important">Importante</option><option value="urgent">Urgente</option></select><button onClick={save} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Salvar</button><div className="flex flex-wrap items-center gap-1 sm:col-span-full"><Tag className="h-3.5 w-3.5 text-primary" />{tags.map((tag) => <button key={tag.id} type="button" onClick={() => setSelectedTags((current) => current.includes(tag.id) ? current.filter((id) => id !== tag.id) : [...current, tag.id])} className={`rounded-full border px-2 py-0.5 text-[9px] ${selectedTags.includes(tag.id) ? 'text-foreground' : 'text-muted-foreground'}`} style={{ borderColor: `${tag.color}88`, backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}25` : 'transparent' }}>{tag.name}</button>)}</div></div>}
      <div className="max-h-[28rem] overflow-y-auto overscroll-contain pr-2 [scrollbar-color:rgba(245,158,11,.55)_rgba(255,255,255,.04)] [scrollbar-width:thin]">
        <div className="grid gap-4 lg:grid-cols-2">
        <section><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"><Flame className="h-4 w-4 text-orange-400" /> Urgentes <span className="rounded bg-orange-400/10 px-1.5 py-0.5 text-[9px] text-orange-300">FOGO</span></div>{renderActions(oneOffPendingActions.filter((a) => a.priority === 'urgent'))}</section>
        <section><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"><Flag className="h-4 w-4 text-emerald-400" /> Importantes <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[9px] text-emerald-300">PRIORIDADE</span></div>{renderActions(oneOffPendingActions.filter((a) => a.priority !== 'urgent'))}</section>
        </div>
        {recurringActions.length > 0 && <section className="mt-5 border-t border-orange-400/10 pt-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"><span className="h-2 w-2 rounded-full bg-orange-300 shadow-[0_0_10px_rgba(251,146,60,.7)]" /> Rotinas recorrentes <span className="text-[10px] font-normal text-muted-foreground">vinculadas às entregas pontuais</span></div>{renderActions(recurringActions.filter((action) => !action.done))}</section>}
      </div>
      {completedActions.length > 0 && <div className="mt-3 border-t border-white/[.06] pt-3"><button onClick={() => setShowCompleted((value) => !value)} className="flex w-full items-center justify-between rounded-lg border border-emerald-400/15 bg-emerald-400/[.04] px-3 py-2 text-left text-[10px] text-emerald-300 hover:bg-emerald-400/[.08]"><span>✓ Concluídas hoje <span className="ml-1 opacity-70">{completedToday} hoje · {completedActions.length} no histórico</span></span><span>{showCompleted ? 'Ocultar' : 'Ver concluídas'}</span></button>{showCompleted && <div className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1 [scrollbar-color:rgba(52,211,153,.45)_rgba(255,255,255,.04)] [scrollbar-width:thin]">{renderActions(completedActions)}</div>}</div>}
    </div>
  );
}
