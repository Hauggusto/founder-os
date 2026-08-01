import { useAppStore } from '@/store/useAppStore';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export function LifeRadarChart() {
  const { lifeAreas, setLifeAreaScore } = useAppStore();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#14171F] border border-[#ffffff15] rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold text-foreground mb-1">
            {data.name}
          </p>
          <p className="text-sm font-bold" style={{ color: data.color }}>
            {data.score}/100
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-6 relative">
      <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
        Radar da Vida
      </h3>
      
      {/* Invisible overlay buttons to trigger edits for each area */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2 justify-end max-w-[120px]">
        {lifeAreas.map((area) => (
          <Popover key={area.id}>
            <PopoverTrigger asChild>
              <button 
                className="w-3 h-3 rounded-full opacity-50 hover:opacity-100 transition-opacity" 
                style={{ backgroundColor: area.color }} 
                title={`Editar ${area.name}`}
              />
            </PopoverTrigger>
            <PopoverContent className="w-56 bg-card border-card-border p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{area.name}</Label>
                  <span className="text-xs font-bold" style={{ color: area.color }}>{area.score}%</span>
                </div>
                <Slider 
                  value={[area.score]} 
                  max={100} 
                  step={5} 
                  onValueChange={(v) => setLifeAreaScore(area.id, v[0])}
                  className="py-2"
                />
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={lifeAreas}>
            <PolarGrid stroke="#ffffff15" />
            <PolarAngleAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Life Areas"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
