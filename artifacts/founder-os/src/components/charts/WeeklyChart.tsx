import { useAppStore } from '@/store/useAppStore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function WeeklyChart() {
  const { weeklyData } = useAppStore();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#14171F] border border-[#ffffff15] rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold text-foreground mb-2">
            {payload[0].payload.label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
        Evolução Financeira
      </h3>
      <div className="h-[220px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyData} margin={{ top: 0, left: -20, right: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C9FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00C9FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#475569', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Receita"
              stroke="#00C9FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Despesas"
              stroke="#F97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpenses)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
