import { useAppStore } from '@/store/useAppStore';
import { CalendarCheck, Flag } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export function NextActionsBlock() {
  const { nextActions, toggleNextAction } = useAppStore();
  
  const sortedActions = [...nextActions].sort((a, b) => Number(a.done) - Number(b.done));

  const renderActions = (items: typeof sortedActions) => <div className="space-y-2">{items.map((action) => (
          <div key={action.id} className="flex items-start gap-3 rounded-lg border border-white/[.06] bg-background/25 p-2.5 transition-colors hover:border-primary/20 hover:bg-[#ffffff05] group">
            <Checkbox 
              checked={action.done} 
              onCheckedChange={() => toggleNextAction(action.id)}
              className="mt-0.5"
            />
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
        <span className="rounded-full border border-primary/20 bg-primary/[.06] px-2 py-1 text-[10px] text-primary">{sortedActions.filter((a) => !a.done).length} abertas</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"><CalendarCheck className="h-4 w-4 text-cyan-300" /> Hoje</div>{renderActions(sortedActions)}</section>
        <section><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"><Flag className="h-4 w-4 text-emerald-400" /> Prioridade <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[9px] text-emerald-300">IMPORTANTE</span></div>{renderActions(sortedActions.filter((a) => !a.done))}</section>
      </div>
    </div>
  );
}
