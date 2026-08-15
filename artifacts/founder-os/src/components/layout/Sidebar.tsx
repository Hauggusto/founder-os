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
  BarChart2,
  AlertTriangle
  , MailSearch
  , Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import { DataManager } from './DataManager';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { useEffect, useState } from 'react';

const navGroups = [
  {
    label: 'Sistema',
    items: [
      { path: '/', label: 'Cockpit', icon: LayoutDashboard },
      { path: '/financeiro', label: 'Financeiro', icon: DollarSign },
      { path: '/projetos', label: 'Projetos', icon: FolderKanban },
      { path: '/comercial', label: 'Comercial', icon: TrendingUp },
      { path: '/oportunidades', label: 'Oportunidades', icon: MailSearch },
      { path: '/alertas-risco', label: 'Alertas / Risco', icon: AlertTriangle },
    ]
  },
  {
    label: 'Execução',
    items: [
      { path: '/habitos', label: 'Hábitos', icon: CheckSquare },
      { path: '/produtividade', label: 'Produtividade', icon: Activity },
      { path: '/identidade', label: 'Identidade', icon: Sparkles },
    ]
  },
  {
    label: 'Vida',
    items: [
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

const menuIconColors: Record<string, string> = {
  '/': '#00C9FF',
  '/financeiro': '#10B981',
  '/projetos': '#38BDF8',
  '/comercial': '#F59E0B',
  '/produtividade': '#10B981',
  '/oportunidades': '#FB923C',
  '/habitos': '#22D3EE',
  '/alertas-risco': '#FF4658',
  '/identidade': '#A855F7',
  '/aprendizado': '#EC4899',
  '/relacoes': '#60A5FA',
  '/recursos': '#14B8A6',
  '/analises': '#8B5CF6',
  '/canais': '#2DD4BF',
  '/agentes': '#06B6D4',
  '/biblioteca': '#F97316',
};

function ProfileMark({ photo }: { photo: string }) { return photo ? <img src={photo} alt="Foto do perfil" className="h-full w-full object-cover" /> : <Sparkles className="h-5 w-5 text-primary-foreground" />; }

export function Sidebar() {
  const [location] = useLocation();
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem('founder-os-profile-photo') || '');
  const { openAddModal, sidebarCollapsed: collapsed, setSidebarCollapsed, sidebarWidth, setSidebarWidth, modules, transactions } = useAppStore();
  const [resizing, setResizing] = useState(false);
  const primaryCash = transactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0) - transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0);
  const floorAlertActive = primaryCash < 1000;
  const uploadProfile = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => { const value = String(reader.result); setProfilePhoto(value); localStorage.setItem('founder-os-profile-photo', value); }; reader.readAsDataURL(file); };

  useEffect(() => {
    if (!resizing) return;
    const move = (event: PointerEvent) => setSidebarWidth(event.clientX);
    const stop = () => setResizing(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop, { once: true });
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizing, setSidebarWidth]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : sidebarWidth }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-[#0B0F14] shadow-[8px_0_30px_rgba(0,0,0,0.18)]"
    >
      {!collapsed && <div
        role="separator"
        aria-label="Redimensionar menu lateral"
        aria-orientation="vertical"
        title="Arraste para ajustar a largura do menu"
        onPointerDown={(event) => { event.preventDefault(); setResizing(true); }}
        className={`absolute right-[-5px] top-0 z-[60] h-full w-[10px] cursor-col-resize transition-colors ${resizing ? 'bg-primary/30' : 'hover:bg-primary/20'}`}
      />}

      {/* Logo */}
      <div className="h-48 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-1"
            >
              <label className="h-24 w-24 translate-y-8 cursor-pointer overflow-hidden rounded-full border-2 border-primary/60 bg-primary flex items-center justify-center" title="Alterar foto do perfil"><ProfileMark photo={profilePhoto} /><input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadProfile(event.target.files?.[0])} /></label>
              <span className="neuron-wordmark mt-8 text-[18px] font-light tracking-[.2em] text-sidebar-foreground">Neuron</span>
              <span className="-mt-1 text-[9px] font-light uppercase tracking-[.28em] text-sidebar-foreground/55">dashboard</span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-12 w-12 cursor-pointer overflow-hidden rounded-full border border-primary/60 bg-primary flex items-center justify-center mx-auto"
            >
              <label className="flex h-full w-full cursor-pointer items-center justify-center"><ProfileMark photo={profilePhoto} /><input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadProfile(event.target.files?.[0])} /></label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="founder-sidebar-scroll flex-1 space-y-6 overflow-y-auto px-2 pb-4 pt-10">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71819A]">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
              const isRiskItem = item.path === '/alertas-risco';
              const iconColor = menuIconColors[item.path] || '#94A3B8';
              
              return (
                <div key={item.path}>
                <Link href={item.path}>
                  <div
                    className={`
                      relative flex min-h-11 items-center gap-3 rounded-[11px] px-2.5 py-2 transition-all duration-200 cursor-pointer
                      ${isRiskItem && floorAlertActive ? 'risk-alert-pulse' : ''}
                      ${isActive
                        ? isRiskItem
                          ? 'bg-[#4A121F] text-[#FF6674] shadow-[0_0_18px_rgba(255,51,68,0.14)]'
                          : 'bg-[#232730] text-[#46CFFF] shadow-[0_0_18px_rgba(0,201,255,0.06)]'
                        : isRiskItem
                          ? 'text-[#FF5A67] hover:bg-[#35121A]'
                          : 'text-[#D6DFEC] hover:bg-white/[0.045] hover:text-foreground'
                      }
                    `}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                    className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r ${isRiskItem ? 'bg-[#FF3344]' : 'bg-primary'}`}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-white/[0.06] bg-[#111820] ${collapsed ? 'mx-auto' : ''}`}
                      style={{ color: iconColor, boxShadow: `0 0 10px ${iconColor}22` }}
                    >
                      <Icon className="h-[16px] w-[16px]" style={{ filter: `drop-shadow(0 0 5px ${iconColor})` }} />
                    </span>
                    {!collapsed && (
                      <span className="text-[13px] font-medium">{item.label}</span>
                    )}
                  </div>
                </Link>
                </div>
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
        {!collapsed && <ThemeToggle />}
        
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
