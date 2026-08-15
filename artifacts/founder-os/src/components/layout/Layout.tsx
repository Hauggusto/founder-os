import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const sidebarCollapsed = useAppStore(s => s.sidebarCollapsed);
  const sidebarWidth = useAppStore(s => s.sidebarWidth);
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 60 : sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen pb-40 p-6"
      >
        {children}
      </motion.main>
      <BottomBar />
    </div>
  );
}
