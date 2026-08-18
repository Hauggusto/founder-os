import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout/Layout';
import { AddModuleModal } from '@/components/modules/AddModuleModal';
import Overview from '@/pages/Overview';
import Financial from '@/pages/Financial';
import Projects from '@/pages/Projects';
import Identity from '@/pages/Identity';
import Habits from '@/pages/Habits';
import AlertRisk from '@/pages/AlertRisk';
import Resources from '@/pages/Resources';
import { ProductivityPanel } from '@/components/commercial/ProductivityPanel';
import { ProductivityGauge } from '@/components/commercial/ProductivityGauge';
import Commercial from '@/pages/Commercial';
import Agents from '@/pages/Agents';
import { AgentAnalytics } from '@/components/agents/AgentAnalytics';
import FinancialAccount from '@/pages/FinancialAccount';
import Placeholder from '@/pages/Placeholder';
import Analysis from '@/pages/Analysis';
import Learning from '@/pages/Learning';
import Opportunities from '@/pages/Opportunities';
import { AuthGate } from '@/components/auth/AuthGate';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/financeiro" component={Financial} />
        <Route path="/produtividade">
          <div className="mx-auto w-full max-w-[1500px] space-y-6"><header className="rounded-2xl border border-emerald-400/25 bg-gradient-to-r from-[#061510] via-card to-[#111421] p-6 shadow-[0_16px_40px_rgba(16,185,129,.07)]"><p className="text-xs font-semibold uppercase tracking-[.25em] text-emerald-300">ROTINA / PERFORMANCE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Produtividade diária</h1><p className="mt-1 text-sm text-muted-foreground">Planeje ações pontuais, registre a execução e acompanhe seu ritmo por área.</p></header><ProductivityGauge /><ProductivityPanel /></div>
        </Route>
        <Route path="/financeiro/conta/:id" component={FinancialAccount} />
        <Route path="/projetos" component={Projects} />
        
        <Route path="/comercial">
          <Commercial />
          <div className="mx-auto mt-6 w-full max-w-[1500px]"><ProductivityPanel /></div>
        </Route>
        <Route path="/oportunidades">
          <Opportunities />
        </Route>
        <Route path="/habitos" component={Habits} />
        <Route path="/alertas-risco" component={AlertRisk} />
        <Route path="/identidade" component={Identity} />
        <Route path="/aprendizado" component={Learning} />
        <Route path="/relacoes">
          <Placeholder title="Relações" description="Pessoas importantes, relacionamentos e rede de contatos." />
        </Route>
        <Route path="/recursos" component={Resources} />
        <Route path="/analises">
          <Analysis />
        </Route>
        
        <Route path="/canais">
          <Placeholder
            title="Canais"
            description="Gerencie seus canais de comunicação e distribuição."
          />
        </Route>
        <Route path="/agentes">
          <Agents />
          <div className="mx-auto mt-6 w-full max-w-[1500px]"><AgentAnalytics /></div>
        </Route>
        <Route path="/biblioteca">
          <Placeholder
            title="Biblioteca"
            description="Sua base de conhecimento pessoal: artigos, referências e recursos salvos."
          />
        </Route>
        <Route component={NotFound} />
      </Switch>
      <AddModuleModal />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthGate><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter></AuthGate>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
