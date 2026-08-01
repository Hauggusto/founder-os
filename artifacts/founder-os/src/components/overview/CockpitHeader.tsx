import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

function LevelIndicator({ label, value, colorClass, onChange }: { label: string, value: number, colorClass: string, onChange: (v: number) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex flex-col items-start gap-1 hover:bg-[#ffffff05] p-2 rounded-md transition-colors text-left group">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <span className="text-[11px] font-bold text-foreground">{value}%</span>
          </div>
          <div className="w-[80px] h-1.5 bg-[#ffffff10] rounded-full overflow-hidden">
            <div className={`h-full ${colorClass} transition-all duration-300`} style={{ width: `${value}%` }} />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 bg-card border-card-border p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">{label}</Label>
            <span className="text-xs font-bold">{value}%</span>
          </div>
          <Slider 
            value={[value]} 
            max={100} 
            step={5} 
            onValueChange={(v) => onChange(v[0])}
            className="py-2"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CockpitHeader() {
  const { 
    weekFocus, 
    energyLevel, setEnergyLevel,
    focusLevel, setFocusLevel,
    disciplineLevel, setDisciplineLevel,
    clarityLevel, setClarityLevel
  } = useAppStore();

  const now = new Date();
  const formattedDate = format(now, "EEE d MMM yyyy", { locale: ptBR });
  
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Bom te ver, Hauggusto
          </h1>
          <p className="text-sm text-muted-foreground italic mt-1.5">
            "{weekFocus}"
          </p>
        </div>
        <p className="text-sm font-medium text-muted-foreground capitalize">
          {formattedDate}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <LevelIndicator label="Energia" value={energyLevel} colorClass="bg-[#10B981]" onChange={setEnergyLevel} />
        <LevelIndicator label="Foco" value={focusLevel} colorClass="bg-[#00C9FF]" onChange={setFocusLevel} />
        <LevelIndicator label="Disciplina" value={disciplineLevel} colorClass="bg-[#8B5CF6]" onChange={setDisciplineLevel} />
        <LevelIndicator label="Clareza" value={clarityLevel} colorClass="bg-[#F97316]" onChange={setClarityLevel} />
      </div>
    </div>
  );
}
