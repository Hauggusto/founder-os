import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, FolderKanban } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const palette = ['#00C9FF', '#10B981', '#F59E0B', '#A855F7', '#F97316'];

export function DashboardInsights() {
  const modules = useAppStore((state) => state.modules);
  const projects = modules.filter((module) => module.type === 'project');
  const categoryData = Object.entries(projects.reduce<Record<string, number>>((acc, project) => {
    const category = project.category || 'Sem categoria';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value, percentage: projects.length ? Math.round(value / projects.length * 100) : 0 }));
  const averageProgress = projects.length ? Math.round(projects.reduce((sum, project) => sum + (project.progress || 0), 0) / projects.length) : 0;
  const progressData = projects.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((project, index) => ({ label: project.title.slice(0, 8), progress: project.progress || 0, index }));

  return <div className="grid gap-4 md:grid-cols-2">
    <section className="rounded-xl border border-[#00c9ff35] bg-[#07101a]/80 p-4 shadow-[0_0_22px_#00c9ff0b]">
      <div className="mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold tracking-wide">Distribuição por categoria</h2></div>
      <div className="flex items-center gap-5"><div className="h-32 w-32 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData.length ? categoryData : [{ name: 'Sem dados', value: 1, percentage: 0 }]} dataKey="value" innerRadius={35} outerRadius={58} paddingAngle={2} stroke="none">{(categoryData.length ? categoryData : [{ name: 'Sem dados', value: 1 }]).map((_, index) => <Cell key={index} fill={categoryData.length ? palette[index % palette.length] : '#334155'} />)}</Pie></PieChart></ResponsiveContainer></div><div className="min-w-0 flex-1 space-y-2">{categoryData.length ? categoryData.map((item, index) => <div key={item.name} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2 truncate"><i className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: palette[index % palette.length], boxShadow: `0 0 7px ${palette[index % palette.length]}` }} />{item.name}</span><span className="font-medium text-muted-foreground">{item.percentage}%</span></div>) : <p className="text-xs text-muted-foreground">Adicione projetos para visualizar.</p>}</div></div>
    </section>
    <section className="rounded-xl border border-[#00c9ff35] bg-[#07101a]/80 p-4 shadow-[0_0_22px_#00c9ff0b]">
      <div className="mb-3 flex items-center gap-2"><FolderKanban className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold tracking-wide">Status geral dos projetos</h2></div>
      <div className="flex items-center gap-4"><div className="relative h-32 w-32 shrink-0 rounded-full p-2" style={{ background: `conic-gradient(#00C9FF ${averageProgress}%, #10B981 ${averageProgress}% 100%, #172b38 100%)`, boxShadow: '0 0 16px #00c9ff22' }}><div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#07101a]"><span className="text-2xl font-bold text-foreground">{averageProgress}%</span><span className="text-[9px] uppercase tracking-wider text-muted-foreground">desempenho geral</span></div></div><div className="min-w-0 flex-1"><div className="mb-2 flex justify-between text-[10px] text-muted-foreground"><span>0%</span><span>100%</span></div><div className="h-28"><ResponsiveContainer width="100%" height="100%"><LineChart data={progressData}><XAxis dataKey="label" hide /><YAxis domain={[0, 100]} hide /><Tooltip contentStyle={{ background: '#0b1420', border: '1px solid #00c9ff55', borderRadius: 8 }} formatter={(value) => [`${value}%`, 'Progresso']} /><Line type="monotone" dataKey="progress" stroke="#00C9FF" strokeWidth={2} dot={{ r: 2, fill: '#07101a', stroke: '#00C9FF', strokeWidth: 1.5 }} /></LineChart></ResponsiveContainer></div></div></div>
    </section>
  </div>;
}
