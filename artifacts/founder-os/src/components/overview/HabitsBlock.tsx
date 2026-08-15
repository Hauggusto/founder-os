import { useAppStore } from '@/store/useAppStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export function HabitsBlock() {
  const { habits, toggleHabit } = useAppStore();
  
  const doneCount = habits.filter(h => h.done).length;
  const groupedHabits = habits.reduce<Record<string, typeof habits>>((groups, habit) => {
    const category = habit.category || 'Rotina';
    (groups[category] ||= []).push(habit);
    return groups;
  }, {});

  return (
    <div className="overflow-hidden rounded-xl border border-[#00c9ff35] bg-[#07101a]/80 p-4 shadow-[0_0_22px_#00c9ff0b]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          Checklist diário <span className="text-xs font-normal text-muted-foreground bg-[#ffffff0a] px-2 py-0.5 rounded">{habits.length ? Math.round(doneCount / habits.length * 100) : 0}%</span>
        </h3>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary hidden">
          + Hábito
        </Button>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-900"><div className="h-full rounded-full bg-primary shadow-[0_0_8px_#00c9ff]" style={{ width: `${habits.length ? doneCount / habits.length * 100 : 0}%` }} /></div>
      <div className="space-y-3">
        {Object.entries(groupedHabits).map(([category, categoryHabits]) => (
          <div key={category} className="rounded-lg border border-white/[0.06] bg-black/10 px-3 py-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{category}</p>
            {categoryHabits.map((habit) => (
              <div key={habit.id} className="flex items-center gap-3 border-b border-white/[0.04] py-1.5 last:border-0">
                <Checkbox checked={habit.done} onCheckedChange={() => toggleHabit(habit.id)} className={habit.done ? "data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981]" : "border-cyan-400/40"} />
                <span className={`flex-1 text-xs ${habit.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{habit.title}</span>
                <span className="text-[10px] text-muted-foreground">{habit.done ? '1/1' : '0/1'}</span>
                {habit.streak > 0 && <Flame className="h-3 w-3 text-[#F97316]" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Link href="/habitos"><Button variant="ghost" className="mt-3 h-8 w-full text-[10px] uppercase tracking-wider text-primary hover:bg-primary/10">Ver hábitos completos</Button></Link>
    </div>
  );
}
