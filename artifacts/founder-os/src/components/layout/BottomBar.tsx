import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { Plus, Target, CheckSquare, Search, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BottomBar() {
  const { sidebarCollapsed, openAddModal, addHabitEntry, addQuickCapture } = useAppStore();
  const [captureText, setCaptureText] = useState('');
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  
  // Local state for New Habit Modal
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState('Saúde');

  const handleCaptureSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && captureText.trim()) {
      addQuickCapture(captureText.trim());
      setCaptureText('');
    }
  };

  const handleAddHabit = () => {
    if (habitTitle.trim()) {
      addHabitEntry({
        title: habitTitle,
        category: habitCategory,
        done: false,
        streak: 0,
        order: 99
      });
      setHabitTitle('');
      setIsHabitModalOpen(false);
    }
  };

  return (
    <>
      <motion.div 
        animate={{ left: sidebarCollapsed ? 60 : 220 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed bottom-0 right-0 h-[52px] bg-[#0D0F14] border-t border-[#ffffff10] flex items-center px-4 gap-4 z-40"
      >
        <div className="flex-1 max-w-2xl flex items-center gap-2 bg-[#1A1D24] px-3 py-1.5 rounded-md border border-[#ffffff0a] focus-within:border-[#ffffff20] transition-colors">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Capture uma ideia, tarefa ou observação..." 
            className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground/60"
            value={captureText}
            onChange={(e) => setCaptureText(e.target.value)}
            onKeyDown={handleCaptureSubmit}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground" onClick={() => openAddModal('project')}>
            <Plus className="w-3 h-3 mr-1" />
            Novo Projeto
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground" onClick={() => openAddModal('note')}>
            <Lightbulb className="w-3 h-3 mr-1" />
            Nova Ideia
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground" onClick={() => setIsHabitModalOpen(true)}>
            <CheckSquare className="w-3 h-3 mr-1" />
            Novo Hábito
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground" onClick={() => openAddModal('goal')}>
            <Target className="w-3 h-3 mr-1" />
            Nova Meta
          </Button>
        </div>
      </motion.div>

      {/* Local Modal for New Habit */}
      <Dialog open={isHabitModalOpen} onOpenChange={setIsHabitModalOpen}>
        <DialogContent className="bg-card border-card-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Hábito Diário</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Hábito</Label>
              <Input 
                id="name" 
                placeholder="Ex: Leitura 30min" 
                value={habitTitle}
                onChange={(e) => setHabitTitle(e.target.value)}
                className="bg-background border-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={habitCategory} onValueChange={setHabitCategory}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Aprendizado">Aprendizado</SelectItem>
                  <SelectItem value="Operações">Operações</SelectItem>
                  <SelectItem value="Espiritualidade">Espiritualidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsHabitModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddHabit} className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar Hábito</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
