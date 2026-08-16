import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, DollarSign, FolderKanban, TrendingUp, MailSearch,
  AlertTriangle, CheckSquare, Activity, Sparkles, BookOpen, Users,
  Package, BarChart2, Radio, Bot, Library, Menu, X
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const menuGroups = [
  { label: 'Sistema', items: [
    ['/', 'Cockpit', LayoutDashboard], ['/financeiro', 'Financeiro', DollarSign],
    ['/projetos', 'Projetos', FolderKanban], ['/comercial', 'Comercial', TrendingUp],
    ['/oportunidades', 'Oportunidades', MailSearch], ['/alertas-risco', 'Alertas / Risco', AlertTriangle],
  ]},
  { label: 'Execução', items: [
    ['/habitos', 'Hábitos', CheckSquare], ['/produtividade', 'Produtividade', Activity],
    ['/identidade', 'Identidade', Sparkles],
  ]},
  { label: 'Vida', items: [
    ['/aprendizado', 'Aprendizado', BookOpen], ['/relacoes', 'Relações', Users],
    ['/recursos', 'Recursos', Package], ['/analises', 'Análises', BarChart2],
  ]},
  { label: 'Distribuição', items: [
    ['/canais', 'Canais', Radio], ['/agentes', 'Agentes', Bot],
    ['/biblioteca', 'Biblioteca', Library],
  ]},
] as const;

export function Layout({ children }: LayoutProps) {
  const sidebarCollapsed = useAppStore(s => s.sidebarCollapsed);
  const sidebarWidth = useAppStore(s => s.sidebarWidth);
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <nav className="mobile-nav mobile-nav-only-menu" aria-label="Navegação mobile">
        <button type="button" className="mobile-nav-item mobile-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Abrir menu completo">
          <Menu className="h-5 w-5" /><small>Menu</small>
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu-layer" role="dialog" aria-modal="true" aria-label="Menu completo">
          <button type="button" className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />
          <aside className="mobile-drawer">
            <div className="mobile-drawer-header">
              <div><span className="text-[10px] uppercase tracking-[.2em] text-primary">Neuron</span><h2>Menu completo</h2></div>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X className="h-5 w-5" /></button>
            </div>
            <div className="mobile-drawer-scroll">
              {menuGroups.map((group) => (
                <div key={group.label} className="mobile-drawer-group">
                  <p>{group.label}</p>
                  {group.items.map(([path, label, Icon]) => (
                    <Link key={path} href={path} onClick={() => setMenuOpen(false)}>
                      <span className={location === path || (path !== '/' && location.startsWith(path)) ? 'mobile-drawer-item active' : 'mobile-drawer-item'}>
                        <Icon className="h-4 w-4" /><span>{label}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 60 : sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen pb-40 p-6 mobile-main"
      >
        {children}
      </motion.main>
      <BottomBar />
    </div>
  );
}
