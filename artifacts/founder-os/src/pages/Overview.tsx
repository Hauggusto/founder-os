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

export default function Overview() {
  return (
    <div className="max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <CockpitHeader />
      
      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <LifeRadarChart />
        </div>
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProjectsBlock />
          <HabitsBlock />
          <AgendaBlock />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <RiskBlock />
          <NextActionsBlock />
          <WeekSummaryBlock />
        </div>
      </div>
    </div>
  );
}
