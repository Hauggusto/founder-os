import { useMemo } from 'react';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppStore } from '@/store/useAppStore';

const CHART_COLORS = ['#10B981', '#22C55E', '#14B8A6', '#06B6D4', '#84CC16'];

export function FinancialInsightsCharts() {
  const { transactions } = useAppStore();

  const revenueTransactions = transactions.filter((transaction) => transaction.type === 'income');
  const revenueByDay = useMemo(() => {
    const grouped = new Map<string, number>();
    revenueTransactions.forEach((transaction) => {
      const day = transaction.date.slice(0, 10);
      grouped.set(day, (grouped.get(day) || 0) + transaction.amount);
    });

    return [...grouped.entries()]
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .slice(-30)
      .map(([date, value]) => ({ label: formatDay(date), value }));
  }, [revenueTransactions]);

  const breakdown = useMemo(() => {
    const grouped = new Map<string, number>();
    revenueTransactions.forEach((transaction) => {
      grouped.set(transaction.category, (grouped.get(transaction.category) || 0) + transaction.amount);
    });
    return [...grouped.entries()].map(([name, value]) => ({ name, value }));
  }, [revenueTransactions]);

  const totalRevenue = breakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
      <section className="min-h-[320px] rounded-lg border border-card-border bg-card p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div><h2 className="text-base font-semibold text-foreground">Receita nos últimos 30 dias</h2><p className="mt-1 text-[11px] text-muted-foreground">Entradas registradas por dia</p></div>
          <span className="rounded-md border border-[#ffffff10] bg-background px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground">30 dias⌄</span>
        </div>
        <div className="h-[245px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByDay} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
              <defs><linearGradient id="financialRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.34} /><stop offset="100%" stopColor="#10B981" stopOpacity={0.02} /></linearGradient></defs>
              <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fill="url(#financialRevenueFill)" dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#10B981', stroke: '#D1FAE5', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="min-h-[320px] rounded-lg border border-card-border bg-card p-5">
        <div className="mb-1"><h2 className="text-base font-semibold text-foreground">Distribuição da receita</h2><p className="mt-1 text-[11px] text-muted-foreground">Por categoria de entrada</p></div>
        <div className="relative h-[205px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="hsl(var(--card))" strokeWidth={2}>
                {breakdown.map((item, index) => <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<BreakdownTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-bold text-foreground">R$ {totalRevenue.toLocaleString('pt-BR')}</span><span className="mt-1 text-[10px] text-muted-foreground">Receita total</span></div>
        </div>
        <div className="space-y-2">
          {breakdown.map((item, index) => <div key={item.name} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2 text-foreground/80"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length], boxShadow: `0 0 7px ${CHART_COLORS[index % CHART_COLORS.length]}` }} /> <span className="truncate">{item.name}</span></span><span className="shrink-0 font-medium text-muted-foreground">R$ {item.value.toLocaleString('pt-BR')} ({totalRevenue ? Math.round(item.value / totalRevenue * 100) : 0}%)</span></div>)}
          {breakdown.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma receita registrada ainda.</p>}
        </div>
      </section>
    </div>
  );
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function RevenueTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-md border border-card-border bg-popover px-3 py-2 shadow-lg"><p className="text-[10px] text-muted-foreground">Receita</p><p className="text-xs font-semibold text-[#10B981]">R$ {Number(payload[0].value).toLocaleString('pt-BR')}</p></div>;
}

function BreakdownTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-md border border-card-border bg-popover px-3 py-2 shadow-lg"><p className="text-xs font-semibold text-foreground">{payload[0].name}</p><p className="text-xs text-[#10B981]">R$ {Number(payload[0].value).toLocaleString('pt-BR')}</p></div>;
}
