import { useState } from 'react';
import { useLocation } from 'wouter';
import { BarChart2, Bot, FolderKanban, GitBranch, ListTodo, Search, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

type QuickAction = {
  label: string;
  icon: LucideIcon;
  color: string;
  glow: string;
  onClick: () => void;
};

export function BottomBar() {
  const [, navigate] = useLocation();
  const { sidebarCollapsed, openAddModal, addQuickCapture } = useAppStore();
  const [captureText, setCaptureText] = useState('');

  const handleCaptureSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && captureText.trim()) {
      addQuickCapture(captureText.trim());
      setCaptureText('');
    }
  };

  const actions: QuickAction[] = [
    { label: 'Nova Tarefa', icon: ListTodo, color: '#00C9FF', glow: 'rgba(0,201,255,0.16)', onClick: () => openAddModal('task') },
    { label: 'Novo Projeto', icon: FolderKanban, color: '#38BDF8', glow: 'rgba(56,189,248,0.16)', onClick: () => openAddModal('project') },
    { label: 'Novo Agente', icon: Bot, color: '#22D3EE', glow: 'rgba(34,211,238,0.16)', onClick: () => navigate('/agentes') },
    { label: 'Novo Fluxo', icon: GitBranch, color: '#2DD4BF', glow: 'rgba(45,212,191,0.16)', onClick: () => navigate('/canais') },
    { label: 'Relatório Semanal', icon: BarChart2, color: '#A855F7', glow: 'rgba(168,85,247,0.16)', onClick: () => navigate('/analises') },
  ];

  return (
    <motion.div
      animate={{ left: sidebarCollapsed ? 60 : 220 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed bottom-0 right-0 z-40 border-t border-[#00C9FF]/20 bg-[#090C12]/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,201,255,0.06)] backdrop-blur-xl md:px-6"
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/80">Ações rápidas</h2>
          </div>
          <div className="hidden w-full max-w-[280px] items-center gap-2 rounded-md border border-[#ffffff10] bg-[#11151D] px-2.5 py-1.5 focus-within:border-primary/40 md:flex">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Captura rápida..."
              className="w-full border-none bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
              value={captureText}
              onChange={(event) => setCaptureText(event.target.value)}
              onKeyDown={handleCaptureSubmit}
            />
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="group relative flex h-[76px] min-w-[112px] flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-[#ffffff12] bg-[#0E141C] px-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20"
                style={{ ['--action-color' as string]: action.color, ['--action-glow' as string]: action.glow }}
              >
                <span className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 50% 0%, ${action.glow}, transparent 65%)` }} />
                <Icon className="relative h-6 w-6 transition-transform duration-200 group-hover:scale-110" style={{ color: 'var(--action-color)', filter: 'drop-shadow(0 0 6px var(--action-color))' }} />
                <span className="relative whitespace-nowrap text-[11px] font-medium text-foreground/80 group-hover:text-foreground">{action.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-md border border-[#ffffff10] bg-[#11151D] px-2.5 py-1.5 md:hidden">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Captura rápida..."
            className="w-full border-none bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
            value={captureText}
            onChange={(event) => setCaptureText(event.target.value)}
            onKeyDown={handleCaptureSubmit}
          />
        </div>
      </div>
    </motion.div>
  );
}
