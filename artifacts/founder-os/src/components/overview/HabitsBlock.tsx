import { useAppStore } from '@/store/useAppStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HabitsBlock() {
  const { habits, toggleHabit } = useAppStore();
  
  const doneCount = habits.filter(h => h.done).length;

  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          Hábitos de Hoje <span className="text-xs font-normal text-muted-foreground bg-[#ffffff0a] px-2 py-0.5 rounded">{doneCount}/{habits.length}</span>
        </h3>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary hidden">
          + Hábito
        </Button>
      </div>

      <div className="space-y-2">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-3 p-2 hover:bg-[#ffffff05] rounded-md transition-colors group">
            <Checkbox 
              checked={habit.done} 
              onCheckedChange={() => toggleHabit(habit.id)}
              className={habit.done ? "data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981]" : ""}
            />
            <span className={`text-sm flex-1 ${habit.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {habit.title}
            </span>
            {habit.streak > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-[#F97316] font-medium bg-[#F97316]/10 px-1.5 py-0.5 rounded">
                <Flame className="w-3 h-3" />
                {habit.streak} dias
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
