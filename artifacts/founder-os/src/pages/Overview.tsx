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
      
      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <LifeRadarChart />
        </div>
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <RiskBlock />
      </div>

      <div className="mb-8">
        <DashboardInsights />
      </div>

      <div className="mb-8">
        <FutureVisionBlock />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProjectsBlock />
          <HabitsBlock />
          <AgendaBlock />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <NextActionsBlock />
          <WeekSummaryBlock />
        </div>
      </div>
    </div>
  );
}
