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
import Placeholder from '@/pages/Placeholder';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/financeiro" component={Financial} />
        <Route path="/projetos" component={Projects} />
        
        <Route path="/comercial">
          <Placeholder title="Comercial" description="Pipeline de vendas e contratos em andamento." />
        </Route>
        <Route path="/habitos">
          <Placeholder title="Hábitos" description="Rastreamento e evolução dos seus hábitos diários." />
        </Route>
        <Route path="/identidade">
          <Placeholder
            title="Identidade"
            description="Seu espaço para definir missão, valores e visão do seu trabalho como fundador."
          />
        </Route>
        <Route path="/aprendizado">
          <Placeholder title="Aprendizado" description="Livros, cursos e insights em progresso." />
        </Route>
        <Route path="/relacoes">
          <Placeholder title="Relações" description="Pessoas importantes, relacionamentos e rede de contatos." />
        </Route>
        <Route path="/recursos">
          <Placeholder title="Recursos" description="Ferramentas, subscriptions e ativos em uso." />
        </Route>
        <Route path="/analises">
          <Placeholder title="Análises" description="Dashboards, métricas consolidadas e tendências." />
        </Route>
        
        <Route path="/canais">
          <Placeholder
            title="Canais"
            description="Gerencie seus canais de comunicação e distribuição."
          />
        </Route>
        <Route path="/agentes">
          <Placeholder
            title="Agentes"
            description="Configure agentes automáticos para acelerar suas operações."
          />
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
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
