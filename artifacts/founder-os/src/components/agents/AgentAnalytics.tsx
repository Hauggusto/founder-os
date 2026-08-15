import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, BriefcaseBusiness, Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAgents } from '@/lib/agents';

const colors = ['#F59E0B', '#EF4444', '#00C9FF', '#A855F7', '#10B981'];

export function AgentAnalytics() {
  const [agents] = useAgents();
  const modules = useAppStore((state) => state.modules);
  const projects = modules.filter((module) => module.type === 'project');
  const distribution = projects.map((project) => ({
    name: project.title,
    agentes: agents.filter((agent) => agent.project === project.title).length,
  }));
  const unassigned = agents.filter((agent) => !projects.some((project) => project.title === agent.project)).length;
  if (unassigned) distribution.push({ name: 'Sem projeto', agentes: unassigned });

  const lineData = distribution.map((item, index) => ({
    name: item.name,
    etapa: index + 1,
    crescimento: Math.max(0, item.agentes * 20 + index * 5),
  }));

  return (
    <section className="mt-6 rounded-xl border border-[#00c9ff35] bg-[#07101a]/80 p-5 shadow-[0_0_22px_#00c9ff0b]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /><div><h2 className="font-semibold">Distribuição dos estagiários</h2><p className="text-xs text-muted-foreground">Quantidade de agentes por projeto e linhas individuais de alocação.</p></div></div>
        <div className="flex gap-3"><Metric icon={<Users className="h-4 w-4" />} label="Estagiários" value={agents.length} /><Metric icon={<BriefcaseBusiness className="h-4 w-4" />} label="Projetos" value={projects.length} /></div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Chart title="Agentes por projeto"><BarChart data={distribution}><CartesianGrid stroke="rgba(148,163,184,.08)" vertical={false} /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#07101a', border: '1px solid #00c9ff55', borderRadius: 8 }} /><Bar dataKey="agentes" name="Estagiários" fill="#00C9FF" radius={[5, 5, 0, 0]} /></BarChart></Chart>
        <Chart title="Evolução por projeto"><LineChart data={lineData}><CartesianGrid stroke="rgba(148,163,184,.08)" vertical={false} /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#07101a', border: '1px solid #A855F755', borderRadius: 8 }} /><Line type="monotone" dataKey="crescimento" name="Evolução" stroke="#A855F7" strokeWidth={2} dot={{ r: 4 }} /></LineChart></Chart>
      </div>
    </section>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactElement }) { return <div className="h-64 rounded-lg border border-white/[0.07] bg-black/15 p-2"><p className="mb-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">{title}</p><ResponsiveContainer width="100%" height="90%">{children}</ResponsiveContainer></div>; }
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2"><div className="flex items-center gap-2 text-primary">{icon}<span className="text-lg font-bold">{value}</span></div><p className="text-[10px] text-muted-foreground">{label}</p></div>; }
