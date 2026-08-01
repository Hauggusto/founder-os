import { useAppStore } from '@/store/useAppStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export function NextActionsBlock() {
  const { nextActions, toggleNextAction } = useAppStore();
  
  const sortedActions = [...nextActions].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
        Próximas Ações
      </h3>

      <div className="space-y-2">
        {sortedActions.map((action) => (
          <div key={action.id} className="flex items-start gap-3 p-2 hover:bg-[#ffffff05] rounded-md transition-colors group">
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
          </div>
        ))}
      </div>
    </div>
  );
}
