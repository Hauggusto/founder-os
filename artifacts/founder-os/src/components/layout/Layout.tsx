import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, DollarSign, FolderKanban, Activity, AlertTriangle, MoreHorizontal } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const sidebarCollapsed = useAppStore(s => s.sidebarCollapsed);
  const sidebarWidth = useAppStore(s => s.sidebarWidth);
  const [location] = useLocation();
  const mobileItems = [
    ['/', 'Cockpit', LayoutDashboard], ['/financeiro', 'Financeiro', DollarSign],
    ['/projetos', 'Projetos', FolderKanban], ['/produtividade', 'Produtividade', Activity],
    ['/alertas-risco', 'Risco', AlertTriangle], ['/recursos', 'Mais', MoreHorizontal],
  ] as const;
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <nav className="mobile-nav" aria-label="Navegação mobile">
        {mobileItems.map(([path, label, Icon]) => <Link key={path} href={path}><span className={location === path ? 'mobile-nav-item active' : 'mobile-nav-item'}><Icon className="h-4 w-4" /><small>{label}</small></span></Link>)}
      </nav>
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
