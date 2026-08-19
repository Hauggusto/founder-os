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
            <p key={index} className="text-xs" style={{ color: entry.dataKey === 'revenue' ? '#5B9DB8' : '#C28A62' }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-8 rounded-lg border border-card-border bg-card p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">Fluxo Semanal</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">Comparativo entre entradas e saídas</p>
        </div>
        <span className="rounded-md border border-[#ffffff0c] bg-background px-2.5 py-1.5 text-[10px] text-muted-foreground">Últimas semanas</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData} barGap={8} margin={{ top: 8, right: 4, left: -12, bottom: 4 }}>
          <defs>
            <linearGradient id="weeklyRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B9DB8" stopOpacity={0.72} />
              <stop offset="100%" stopColor="#285C73" stopOpacity={0.48} />
            </linearGradient>
            <linearGradient id="weeklyExpensesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C28A62" stopOpacity={0.68} />
              <stop offset="100%" stopColor="#754A37" stopOpacity={0.44} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="2 6" stroke="rgba(148,163,184,0.08)" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#718096', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#718096', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(7, 16, 26, 0.42)', stroke: 'rgba(71, 85, 105, 0.28)', strokeWidth: 1 }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#94A3B8', paddingTop: '10px' }}
            iconType="circle"
          />
          <Bar
            dataKey="revenue"
            name="Receita"
            fill="url(#weeklyRevenueGradient)"
            radius={[5, 5, 1, 1]}
          />
          <Bar
            dataKey="expenses"
            name="Despesas"
            fill="url(#weeklyExpensesGradient)"
            radius={[5, 5, 1, 1]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
