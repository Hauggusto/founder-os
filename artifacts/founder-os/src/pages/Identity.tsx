import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarDays, Check, ClipboardCheck, Minus, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { useAppStore, type IdentityStatus } from '@/store/useAppStore';

const scoreOf: Record<IdentityStatus, number> = { done: 1, partial: 0.5, missed: 0 };

function levelFor(score: number) {
  if (score >= 75) return { name: 'Hauggusto IV', subtitle: 'Expansão / Excelência', color: '#F97316' };
  if (score >= 50) return { name: 'Hauggusto III', subtitle: 'Estrutura / Consistência', color: '#3B82F6' };
  if (score >= 25) return { name: 'Hauggusto II', subtitle: 'Em Construção', color: '#10B981' };
  return { name: 'Hauggusto I', subtitle: 'Reativo / Sobrevivência', color: '#EF4444' };
}

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Identity() {
  const { identityItems, identityChecks, addIdentityItem, updateIdentityItem, deleteIdentityItem, setIdentityCheck } = useAppStore();
  const [period, setPeriod] = useState<'week' | 'month' | 'previousMonth'>('week');
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [todayTick, setTodayTick] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setTodayTick(Date.now()), 60_000); return () => window.clearInterval(timer); }, []);
  const days = useMemo(() => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    if (period === 'week') {
      const mondayOffset = (now.getDay() + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOffset);
      return Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return date; });
    }
    const monthOffset = period === 'previousMonth' ? -1 : 0;
    const first = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1, 12);
    const totalDays = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0).getDate();
    return Array.from({ length: totalDays }, (_, index) => new Date(first.getFullYear(), first.getMonth(), index + 1, 12));
  }, [period, todayTick]);
  const checks = useMemo(() => new Map(identityChecks.map((check) => [`${check.itemId}-${check.date}`, check.status])), [identityChecks]);
  const statusAt = (itemId: string, date: Date) => checks.get(`${itemId}-${dateKey(date)}`) || null;
  const chartData = days.map((date) => {
    const values = identityItems.map((item) => statusAt(item.id, date)).filter(Boolean) as IdentityStatus[];
    return { label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }), score: values.length ? Math.round(values.reduce((sum, status) => sum + scoreOf[status], 0) / values.length * 100) : 0, tracked: values.length > 0 && date <= new Date(todayTick) };
  });
  const allValues = chartData.filter((item) => item.tracked).map((item) => item.score);
  const score = allValues.length ? Math.round(allValues.reduce((sum, value) => sum + value, 0) / allValues.length) : 0;
  const level = levelFor(score);
  const today = new Date();
  const identityBreakdown = [
    { name: 'Hauggusto I', subtitle: 'Reativo / Sobrevivência', color: '#EF4444', min: 0, max: 24 },
    { name: 'Hauggusto II', subtitle: 'Em Construção', color: '#10B981', min: 25, max: 49 },
    { name: 'Hauggusto III', subtitle: 'Estrutura / Consistência', color: '#3B82F6', min: 50, max: 74 },
    { name: 'Hauggusto IV', subtitle: 'Expansão / Excelência', color: '#F97316', min: 75, max: 100 },
  ].map((item) => {
    const trackedDays = chartData.filter((day) => day.tracked);
    const count = trackedDays.filter((day) => day.score >= item.min && day.score <= item.max).length;
    return { ...item, days: count, percentage: trackedDays.length ? Math.round(count / trackedDays.length * 100) : 0 };
  });
  const dominantIdentity = [...identityBreakdown].sort((a, b) => b.days - a.days)[0];
  const cycle = (status: IdentityStatus | null): IdentityStatus | null => status === null ? 'done' : status === 'done' ? 'partial' : status === 'partial' ? 'missed' : null;

  const submitItem = () => { if (newItem.trim()) { addIdentityItem(newItem); setNewItem(''); } };
  const beginEdit = (id: string, title: string) => { setEditingId(id); setEditingTitle(title); };
  const saveEdit = () => { if (editingId && editingTitle.trim()) updateIdentityItem(editingId, editingTitle); setEditingId(null); setEditingTitle(''); };

  return (
    <div className="max-w-[1600px] space-y-6">
      <header className="rounded-xl border border-[#3b82f655] bg-gradient-to-r from-[#11162a] via-card to-[#17121f] p-6 shadow-[0_0_30px_#3b82f611]">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div><p className="mb-2 text-xs font-semibold tracking-[0.28em] text-primary">IDENTIDADE / EXECUÇÃO</p><h1 className="text-3xl font-bold tracking-tight">Dashboard de Identidade</h1><p className="mt-1 text-sm text-muted-foreground">Acompanhe quem você está sendo através das suas ações.</p></div>
          <div className="rounded-lg border border-border/70 bg-background/40 px-4 py-2 text-right"><p className="text-xs text-muted-foreground">Período acompanhado</p><p className="text-sm font-medium text-primary">{period === 'week' ? 'Semana atual' : period === 'month' ? 'Mês atual' : 'Mês anterior'}</p></div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="rounded-lg border p-5" style={{ borderColor: `${level.color}66`, background: `${level.color}0d` }}><div className="flex items-center gap-4"><div className="h-12 w-12 rounded-full" style={{ background: level.color, boxShadow: `0 0 24px ${level.color}88` }} /><div><p className="text-2xl font-bold" style={{ color: level.color }}>{level.name}</p><p className="text-sm text-muted-foreground">{level.subtitle}</p></div></div><p className="mt-4 text-xs text-muted-foreground">O nível sobe com consistência e cai quando os dias vermelhos superam os verdes.</p></div>
          <div className="flex min-w-[180px] items-center gap-3 rounded-lg border border-border/70 bg-background/35 p-5"><CalendarDays className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{score}%</p><p className="text-xs text-muted-foreground">execução no período</p></div></div>
        </div>
      </header>

      <section className="rounded-xl border border-border/70 bg-card/70 p-5"><div className="mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><div><h2 className="font-semibold">Progresso da identidade</h2><p className="text-xs text-muted-foreground">Peso: verde 100% · laranja 50% · vermelho 0%</p></div></div><div className="h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="identity-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={level.color} stopOpacity={0.35} /><stop offset="100%" stopColor={level.color} stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="rgba(148,163,184,.09)" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} /><Tooltip contentStyle={{ background: '#10141d', border: '1px solid #334155', borderRadius: 8 }} formatter={(value) => [`${value}%`, 'Execução']} /><Area type="monotone" dataKey="score" stroke={level.color} fill="url(#identity-fill)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></section>

      <section className="overflow-hidden rounded-xl border border-border/70 bg-card/70"><div className="border-b border-border/60 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /><div><h2 className="font-semibold">Checklist de identidade</h2><p className="text-xs text-muted-foreground">{period === 'week' ? 'Semana atual: segunda a domingo.' : period === 'month' ? 'Mês atual: dia 1 até o último dia.' : 'Mês anterior: histórico completo do mês passado.'}</p></div></div><div className="flex flex-wrap items-center gap-2"><div className="flex gap-1 rounded-lg border border-border/70 bg-background/40 p-1"><button onClick={() => setPeriod('week')} className={`rounded-md px-3 py-1.5 text-xs ${period === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Semanal</button><button onClick={() => setPeriod('month')} className={`rounded-md px-3 py-1.5 text-xs ${period === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Mensal</button><button onClick={() => setPeriod('previousMonth')} className={`rounded-md px-3 py-1.5 text-xs ${period === 'previousMonth' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Mês anterior</button></div><input value={newItem} onChange={(event) => setNewItem(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitItem()} placeholder="Adicionar campo..." className="h-9 w-48 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" /><button onClick={submitItem} className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Campo</button></div></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse"><thead><tr className="border-b border-border/50 text-xs text-muted-foreground"><th className="sticky left-0 z-10 bg-card px-5 py-3 text-left">Comportamento</th>{days.map((date) => <th key={dateKey(date)} className={`px-1 py-3 text-center font-medium ${dateKey(date) === dateKey(today) ? 'text-primary' : ''}`}><span className="block uppercase">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span><span>{date.getDate()}</span></th>)}</tr></thead><tbody>{identityItems.map((item) => { const rowValues = days.map((date) => statusAt(item.id, date)).filter(Boolean) as IdentityStatus[]; const rowScore = rowValues.length ? Math.round(rowValues.reduce((sum, status) => sum + scoreOf[status], 0) / rowValues.length * 100) : 0; return <tr key={item.id} className="border-b border-border/40 last:border-0"><td className="sticky left-0 bg-card px-5 py-4"><div className="flex items-center gap-2">{editingId === item.id ? <input autoFocus value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && saveEdit()} onBlur={saveEdit} className="min-w-0 flex-1 rounded border border-primary bg-background px-2 py-1 text-sm outline-none" /> : <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="text-xs text-emerald-400">{rowScore}% execução</p></div>}<button onClick={() => beginEdit(item.id, item.title)} className="text-muted-foreground transition hover:text-primary" title="Editar comportamento"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => deleteIdentityItem(item.id)} className="text-muted-foreground transition hover:text-red-400" title="Excluir campo"><Trash2 className="h-3.5 w-3.5" /></button></div></td>{days.map((date) => { const status = statusAt(item.id, date); return <td key={dateKey(date)} className="px-1 py-4 text-center"><button title={status ? `Status: ${status}` : 'Não registrado'} onClick={() => setIdentityCheck(item.id, dateKey(date), cycle(status))} className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md border transition hover:scale-110 ${status === 'done' ? 'border-emerald-500/75 bg-emerald-950/80 text-emerald-200 shadow-[0_0_9px_rgba(16,185,129,.55)]' : status === 'partial' ? 'border-orange-500/75 bg-orange-950/80 text-orange-200 shadow-[0_0_9px_rgba(249,115,22,.55)]' : status === 'missed' ? 'border-red-500/75 bg-red-950/80 text-red-200 shadow-[0_0_9px_rgba(239,68,68,.55)]' : 'border-cyan-500/30 bg-background/60 text-transparent shadow-[0_0_6px_rgba(34,211,238,.16)]'}`}>{status === 'done' ? <Check className="h-4 w-4" /> : status === 'partial' ? <Minus className="h-4 w-4" /> : status === 'missed' ? <X className="h-4 w-4" /> : <span>·</span>}</button></td>})}</tr>; })}</tbody></table></div></section>

      <section className="rounded-xl border border-border/70 bg-card/70 p-4"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Distribuição da identidade</h2><p className="text-xs text-muted-foreground">Quantos dias do período ficaram em cada nível.</p></div><div className="rounded-md border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-right"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Modo dominante</p><p className="text-sm font-semibold" style={{ color: dominantIdentity.color }}>{dominantIdentity.name}</p><p className="text-[10px] text-muted-foreground">{dominantIdentity.subtitle}</p></div></div><div className="grid gap-3 md:grid-cols-4">{identityBreakdown.map((item) => <div key={item.name} className="rounded-lg border p-3" style={{ borderColor: `${item.color}66`, background: `${item.color}0b`, boxShadow: `0 0 14px ${item.color}12` }}><div className="flex items-start justify-between"><p className="text-2xl font-bold" style={{ color: item.color }}>{item.percentage}%</p><span className="text-xs text-muted-foreground">{item.days} {item.days === 1 ? 'dia' : 'dias'}</span></div><p className="mt-1 text-sm font-medium" style={{ color: item.color }}>{item.name}</p><p className="text-[11px] text-muted-foreground">{item.subtitle}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/80"><div className="h-full rounded-full" style={{ width: `${item.percentage}%`, background: item.color, boxShadow: `0 0 8px ${item.color}` }} /></div></div>)}</div></section>
    </div>
  );
}
