import { useMemo, useState } from 'react';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppStore } from '@/store/useAppStore';

const CHART_COLORS = ['#10B981', '#22C55E', '#14B8A6', '#06B6D4', '#84CC16'];

export function FinancialInsightsCharts() {
  const { transactions } = useAppStore();
  const [revenueDays, setRevenueDays] = useState<7 | 15 | 30>(30);

  const revenueTransactions = transactions.filter((transaction) => transaction.type === 'income');
  const revenueByDay = useMemo(() => {
    const grouped = new Map<string, number>();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - revenueDays + 1);
    const cutoffDate = cutoff.toISOString().slice(0, 10);
    revenueTransactions.filter((transaction) => transaction.date >= cutoffDate).forEach((transaction) => {
      const day = transaction.date.slice(0, 10);
      grouped.set(day, (grouped.get(day) || 0) + transaction.amount);
    });

    return [...grouped.entries()]
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, value]) => ({ label: formatDay(date), value }));
  }, [revenueDays, revenueTransactions]);

  const revenueMax = Math.max(0, ...revenueByDay.map((item) => item.value));
  const revenueTicks = [0, 500, 1000, 2000];
  if (revenueMax > 2000) revenueTicks.push(Math.ceil(revenueMax / 1000) * 1000);

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
        <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-[17px] font-semibold text-foreground">Receita nos últimos {revenueDays} dias</h2><p className="mt-1 text-xs text-muted-foreground">Entradas registradas por dia</p></div>
          <div className="flex items-center gap-1 rounded-lg border border-[#ffffff10] bg-background/70 p-1" aria-label="Período do gráfico de receitas">
            {([7, 15, 30] as const).map((days) => <button key={days} type="button" onClick={() => setRevenueDays(days)} className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition ${revenueDays === days ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{days} dias</button>)}
          </div>
        </div>
        <div className="h-[245px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByDay} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
              <defs><linearGradient id="financialRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.34} /><stop offset="100%" stopColor="#10B981" stopOpacity={0.02} /></linearGradient></defs>
              <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
              <YAxis ticks={revenueTicks} domain={[0, Math.max(2000, revenueTicks[revenueTicks.length - 1])]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatAxisValue} />
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
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-bold text-foreground">{formatCurrency(totalRevenue)}</span><span className="mt-1 text-[10px] text-muted-foreground">Receita total</span></div>
        </div>
        <div className="space-y-2">
          {breakdown.map((item, index) => <div key={item.name} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2 text-foreground/80"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length], boxShadow: `0 0 7px ${CHART_COLORS[index % CHART_COLORS.length]}` }} /> <span className="truncate">{item.name}</span></span><span className="shrink-0 font-medium text-muted-foreground">{formatCurrency(item.value)} ({totalRevenue ? Math.round(item.value / totalRevenue * 100) : 0}%)</span></div>)}
          {breakdown.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma receita registrada ainda.</p>}
        </div>
      </section>
    </div>
  );
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function formatAxisValue(value: number) {
  if (value >= 1000) return `${value / 1000}k`;
  return String(value);
}

function RevenueTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-md border border-card-border bg-popover px-3 py-2 shadow-lg"><p className="text-[10px] text-muted-foreground">Receita</p><p className="text-xs font-semibold text-[#10B981]">{formatCurrency(Number(payload[0].value))}</p></div>;
}

function BreakdownTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-md border border-card-border bg-popover px-3 py-2 shadow-lg"><p className="text-xs font-semibold text-foreground">{payload[0].name}</p><p className="text-xs text-[#10B981]">{formatCurrency(Number(payload[0].value))}</p></div>;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
