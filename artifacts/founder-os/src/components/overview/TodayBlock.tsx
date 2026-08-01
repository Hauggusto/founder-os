import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export function TodayBlock() {
  const { priorities, togglePriority, addPriority } = useAppStore();
  const [newPriority, setNewPriority] = useState('');

  const handleAddPriority = () => {
    if (newPriority.trim()) {
      addPriority(newPriority);
      setNewPriority('');
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Prioridades de Hoje
      </h3>
      
      <div className="space-y-3 mb-4">
        {priorities.map((priority) => (
          <div
            key={priority.id}
            className="flex items-center gap-3 group"
            data-testid={`priority-${priority.id}`}
          >
            <Checkbox
              checked={priority.done}
              onCheckedChange={() => togglePriority(priority.id)}
              className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span
              className={`text-sm flex-1 ${
                priority.done
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              }`}
            >
              {priority.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Nova prioridade..."
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddPriority()}
          className="bg-background border-input text-sm"
          data-testid="input-new-priority"
        />
        <Button
          size="icon"
          onClick={handleAddPriority}
          className="bg-primary hover:bg-primary/90"
          data-testid="button-add-priority"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
