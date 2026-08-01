import { useAppStore } from '@/store/useAppStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function FinancialChart() {
  const { weeklyData } = useAppStore();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-popover-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold text-foreground mb-2">
            {payload[0].payload.label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.fill }}>
              {entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Fluxo Semanal
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="label"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}
            iconType="circle"
          />
          <Bar
            dataKey="revenue"
            name="Receita"
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="expenses"
            name="Despesas"
            fill="hsl(var(--chart-3))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
