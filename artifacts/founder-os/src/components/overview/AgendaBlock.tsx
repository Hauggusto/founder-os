import { useAppStore } from '@/store/useAppStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export function AgendaBlock() {
  const { agenda, toggleAgendaItem } = useAppStore();
  
  const sortedAgenda = [...agenda].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Agenda
        </h3>
        {/* We can add an inline modal for new event later if needed, prompt allowed simple modal, but we have capture/bottom bar for now. */}
      </div>

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
              <span className={`text-xs font-mono mt-0.5 w-10 ${item.done ? 'text-muted-foreground' : 'text-primary'}`}>
                {item.time}
              </span>
              <div className="flex-1 flex items-start gap-2">
                <span className={`text-sm leading-tight ${item.done ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                  {item.title}
                </span>
                <Badge variant="outline" className={`text-[9px] px-1 py-0 uppercase h-4 border-transparent ${
                  item.type === 'meeting' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' :
                  item.type === 'task' ? 'bg-[#00C9FF]/10 text-[#00C9FF]' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {item.type}
                </Badge>
              </div>
              <Checkbox 
                checked={item.done} 
                onCheckedChange={() => toggleAgendaItem(item.id)}
                className="mt-0.5"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
