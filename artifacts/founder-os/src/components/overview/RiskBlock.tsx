import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, CircleAlert, Flame, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Checkbox } from '@/components/ui/checkbox';

const severityConfig = {
  high: { label: 'Crítico', color: '#EF4444', surface: 'rgba(127, 29, 29, 0.16)', border: 'rgba(239, 68, 68, 0.45)', icon: Flame },
  medium: { label: 'Atenção', color: '#F59E0B', surface: 'rgba(120, 53, 15, 0.14)', border: 'rgba(245, 158, 11, 0.42)', icon: CircleAlert },
  low: { label: 'Monitorar', color: '#10B981', surface: 'rgba(6, 78, 59, 0.14)', border: 'rgba(16, 185, 129, 0.38)', icon: ShieldCheck },
} as const;

const fallbackScores = { high: 72, medium: 48, low: 25 } as const;

export function RiskBlock() {
  const { risks, nextActions, toggleNextAction } = useAppStore();
  const counts = useMemo(() => ({
    high: risks.filter((risk) => risk.severity === 'high').length,
    medium: risks.filter((risk) => risk.severity === 'medium').length,
    low: risks.filter((risk) => risk.severity === 'low').length,
  }), [risks]);
  const actions = [...nextActions].sort((a, b) => Number(a.done) - Number(b.done)).slice(0, 4);

  return (
    <section className="lg:col-span-3 overflow-hidden rounded-xl border border-[#EF4444]/25 bg-[#100D10] shadow-[0_0_40px_rgba(239,68,68,0.04)]">
      <div className="border-b border-[#ffffff0a] bg-gradient-to-r from-[#1b1014] via-transparent to-[#17130d] px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#F87171]"><AlertTriangle className="h-4 w-4" /><span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Área de Risco</span></div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Alertas que merecem direção</h2>
            <p className="mt-1 text-xs text-muted-foreground">Não é sobre culpa. É sobre enxergar cedo e agir com clareza.</p>
          </div>
          <div className="risk-summary-grid grid grid-cols-3 gap-2 sm:gap-3">
            <RiskSummary icon={<Flame className="h-4 w-4" />} label="Críticos" value={counts.high} color="#EF4444" />
            <RiskSummary icon={<CircleAlert className="h-4 w-4" />} label="Atenção" value={counts.medium} color="#F59E0B" />
            <RiskSummary icon={<CheckCircle2 className="h-4 w-4" />} label="OK" value={counts.low} color="#10B981" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 md:p-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Seus principais riscos</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {risks.map((risk) => {
              const config = severityConfig[risk.severity] || severityConfig.medium;
              const Icon = config.icon;
              const score = risk.score ?? fallbackScores[risk.severity] ?? 50;
              return (
                <article key={risk.id} className="relative overflow-hidden rounded-lg border p-4 transition-colors hover:bg-white/[0.025]" style={{ borderColor: config.border, backgroundColor: config.surface }}>
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl" style={{ backgroundColor: `${config.color}18` }} />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5"><Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: config.color }} /><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-foreground">{risk.title}</h3><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: config.color }}>{config.label} · {risk.category}</p></div></div>
                    <RiskMeter score={score} color={config.color} />
                  </div>
                  <p className="relative mt-4 min-h-10 text-xs leading-relaxed text-muted-foreground">{risk.description || 'Risco que precisa ser acompanhado para evitar perda de direção.'}</p>
                  {risk.factors && risk.factors.length > 0 && <ul className="relative mt-3 space-y-1.5">{risk.factors.slice(0, 3).map((factor) => <li key={factor} className="flex items-start gap-2 text-[11px] text-foreground/75"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: config.color }} />{factor}</li>)}</ul>}
                  <div className="mt-4 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: config.color }}>{risk.action || 'Plano de ação'} <ArrowRight className="h-3 w-3" /></div>
                </article>
              );
            })}
            {risks.length === 0 && <div className="rounded-lg border border-dashed border-[#ffffff15] p-6 text-sm text-muted-foreground md:col-span-2 xl:col-span-3">Nenhum risco cadastrado. Continue observando os sinais importantes da sua operação.</div>}
          </div>
        </div>

        <aside className="rounded-lg border border-[#ffffff10] bg-[#0C0F14] p-4">
          <div className="flex items-center justify-between gap-3"><h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">O que fazer agora</h3><span className="text-[10px] text-muted-foreground">{actions.filter((action) => !action.done).length} pendentes</span></div>
          <div className="mt-3 space-y-2">{actions.map((action) => <label key={action.id} className="flex cursor-pointer items-start gap-2.5 rounded-md border border-[#ffffff0d] bg-[#14171F] p-2.5 transition-colors hover:border-[#ffffff20]"><Checkbox checked={action.done} onCheckedChange={() => toggleNextAction(action.id)} className="mt-0.5" /><span className={`text-xs leading-relaxed ${action.done ? 'text-muted-foreground line-through' : 'text-foreground/85'}`}>{action.text}{action.project && <span className="mt-1 block text-[10px] text-muted-foreground">{action.project}</span>}</span></label>)}</div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#ffffff0a] px-5 py-3 text-[11px] text-muted-foreground md:px-6"><span className="font-semibold uppercase tracking-wider text-[#F87171]">Status do sistema</span><span>{counts.high} riscos críticos</span><span>{counts.medium} pontos de atenção</span><span className="text-[#10B981]">{counts.low} sob controle</span><span className="ml-auto">Atualizado agora</span></div>
    </section>
  );
}

function RiskSummary({ icon, label, value, color }: { icon: ReactNode; label: string; value: number; color: string }) {
  return <div className="min-w-[74px] rounded-md border border-[#ffffff0d] bg-black/20 px-2.5 py-2" style={{ borderTopColor: `${color}88` }}><div className="flex items-center gap-1.5" style={{ color }}>{icon}<span className="text-lg font-semibold leading-none">{value}</span></div><p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p></div>;
}

function RiskMeter({ score, color }: { score: number; color: string }) {
  return <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${color} ${score}%, rgba(255,255,255,0.08) 0)` }}><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#151216] text-xs font-semibold" style={{ color }}>{score}%</div></div>;
}
