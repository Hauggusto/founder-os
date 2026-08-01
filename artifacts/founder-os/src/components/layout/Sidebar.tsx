import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  DollarSign, 
  FolderKanban, 
  Users, 
  Radio, 
  Bot, 
  Library,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  TrendingUp,
  CheckSquare,
  BookOpen,
  Package,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import { DataManager } from './DataManager';
import { motion, AnimatePresence } from 'framer-motion';

const navGroups = [
  {
    label: 'Sistema',
    items: [
      { path: '/', label: 'Cockpit', icon: LayoutDashboard },
      { path: '/financeiro', label: 'Financeiro', icon: DollarSign },
      { path: '/projetos', label: 'Projetos', icon: FolderKanban },
      { path: '/comercial', label: 'Comercial', icon: TrendingUp },
      { path: '/habitos', label: 'Hábitos', icon: CheckSquare },
    ]
  },
  {
    label: 'Vida',
    items: [
      { path: '/identidade', label: 'Identidade', icon: Sparkles },
      { path: '/aprendizado', label: 'Aprendizado', icon: BookOpen },
      { path: '/relacoes', label: 'Relações', icon: Users },
      { path: '/recursos', label: 'Recursos', icon: Package },
      { path: '/analises', label: 'Análises', icon: BarChart2 },
    ]
  },
  {
    label: 'Distribuição',
    items: [
      { path: '/canais', label: 'Canais', icon: Radio },
      { path: '/agentes', label: 'Agentes', icon: Bot },
      { path: '/biblioteca', label: 'Biblioteca', icon: Library },
    ]
  }
];

export function Sidebar() {
  const [location] = useLocation();
  const { openAddModal, sidebarCollapsed: collapsed, setSidebarCollapsed } = useAppStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground text-base tracking-tight">
                Founder OS
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto"
            >
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
              
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`
                      relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer
                      ${isActive 
                        ? 'bg-sidebar-accent text-sidebar-primary' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }
                    `}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                    {!collapsed && (
                      <span className="text-[13px] font-medium">{item.label}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-3">
        {!collapsed && (
          <div className="mb-2">
            <DataManager />
          </div>
        )}
        
        <Button
          onClick={() => openAddModal()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size={collapsed ? 'icon' : 'default'}
          data-testid="button-add-module"
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span className="ml-2 text-sm">Adicionar</span>}
        </Button>

        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 bg-accent">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                  HA
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-sidebar-foreground/70">Hauggusto</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!collapsed)}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 ml-auto"
            data-testid="button-toggle-sidebar"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}
