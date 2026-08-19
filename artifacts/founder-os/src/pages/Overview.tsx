import { CockpitHeader } from '@/components/overview/CockpitHeader';
import { KPICards } from '@/components/overview/KPICards';
import { LifeRadarChart } from '@/components/charts/LifeRadarChart';
import { WeeklyChart } from '@/components/charts/WeeklyChart';
import { ProjectsBlock } from '@/components/overview/ProjectsBlock';
import { HabitsBlock } from '@/components/overview/HabitsBlock';
import { AgendaBlock } from '@/components/overview/AgendaBlock';
import { RiskBlock } from '@/components/overview/RiskBlock';
import { NextActionsBlock } from '@/components/overview/NextActionsBlock';
import { WeekSummaryBlock } from '@/components/overview/WeekSummaryBlock';
import { DashboardInsights } from '@/components/overview/DashboardInsights';
import { FutureVisionBlock } from '@/components/overview/FutureVisionBlock';
import { ModernCalendar } from '@/components/overview/ModernCalendar';
import { WeatherWidget } from '@/components/overview/WeatherWidget';

export default function Overview() {
  return (
    <div className="max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 flex-1"><CockpitHeader /></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row"><ModernCalendar /><WeatherWidget /></div></div>

      <section className="mb-8"><div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Visão rápida</p><h2 className="mt-1 text-lg font-semibold">Como está o seu dia</h2></div><span className="text-[10px] text-muted-foreground">Atualizado pelos módulos do dashboard</span></div><KPICards /></section>

      <section className="mb-8"><div className="mb-3"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-orange-300">Centro de execução</p><h2 className="mt-1 text-lg font-semibold">O que precisa de atenção agora</h2></div><div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,.82fr)]"><HabitsBlock /><NextActionsBlock /></div></section>

      <section className="mb-8"><div className="mb-3"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-cyan-300">Leitura de evolução</p><h2 className="mt-1 text-lg font-semibold">Ritmo e direção</h2></div><div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]"><WeeklyChart /><LifeRadarChart /></div></section>

      <section className="mb-8"><RiskBlock /></section>

      <section className="mb-8"><DashboardInsights /></section>

      <section className="mb-8"><div className="mb-3"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-300">Direção futura</p><h2 className="mt-1 text-lg font-semibold">Onde você está construindo</h2></div><FutureVisionBlock /></section>

      <section className="mb-8"><div className="mb-3"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-amber-300">Contexto operacional</p><h2 className="mt-1 text-lg font-semibold">Projetos e agenda</h2></div><div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,.9fr)]"><ProjectsBlock /><AgendaBlock /></div></section>

      <section><WeekSummaryBlock /></section>
    </div>
  );
}
