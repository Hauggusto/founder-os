import { create } from 'zustand';
import { seedData } from './seed';
import { saveCloudAppData } from '@/lib/cloudSync';

const STORAGE_KEY = 'founder-os-data';

export type ModuleType = 'metric' | 'project' | 'financial_account' | 'task' | 'note' | 'link' | 'habit' | 'goal';
export type ModuleStatus = 'active' | 'paused' | 'archived' | 'done';
export type IdentityStatus = 'done' | 'partial' | 'missed';

export interface Module {
  id: string;
  type: ModuleType;
  title: string;
  category: string;
  subcategory?: string;
  color?: string;
  status: ModuleStatus;
  value?: number | string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  // Project fields
  projectName?: string;
  thumbnail?: string;
  phase?: string;
  nextAction?: string;
  progress?: number;
  tags?: string[];
  // Task fields
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  done?: boolean;
  // Metric fields
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  // Financial account fields
  balance?: number;
  currency?: string;
  accountType?: string;
  // Note fields
  content?: string;
  // Link fields
  url?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  order: number;
}

export interface WeeklyEntry {
  week: string;
  revenue: number;
  expenses: number;
  label?: string;
}

export interface FinancialTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account: string;
  status: 'paid' | 'pending' | 'refunded';
  date: string;
}

export interface FinancialSummaryOverrides {
  revenue?: number;
  expenses?: number;
  balance?: number;
}

export interface HabitEntry {
  id: string;
  title: string;
  done: boolean;
  streak: number;
  category: string;
  order: number;
  categoryColor?: string;
  checks?: Record<string, IdentityStatus>;
}

export interface AgendaItem {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'task' | 'reminder' | 'presencial';
  done: boolean;
  date?: string;
}

export interface LifeArea {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface RiskItem {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  score?: number;
  description?: string;
  factors?: string[];
  action?: string;
}

export interface IdentityItem {
  id: string;
  title: string;
  order: number;
}

export interface IdentityCheck {
  id: string;
  itemId: string;
  date: string;
  status: IdentityStatus;
}

export interface LearningCard {
  id: string;
  title: string;
  category: 'Curso' | 'Faculdade' | 'Livro' | 'Atualização' | 'IA' | 'Outro';
  description: string;
  progress: number;
  color: string;
}

const defaultLearningCards: LearningCard[] = [
  { id: 'learning-english', title: 'Curso de Inglês', category: 'Curso', description: 'Conversação, vocabulário e compreensão.', progress: 15, color: '#22D3EE' },
  { id: 'learning-college', title: 'Faculdade', category: 'Faculdade', description: 'Disciplinas, trabalhos e provas em andamento.', progress: 30, color: '#8B5CF6' },
  { id: 'learning-santander', title: 'Curso Santander', category: 'Atualização', description: 'Atualização profissional e novas competências.', progress: 10, color: '#EF4444' },
  { id: 'learning-ai', title: 'Inteligência Artificial', category: 'IA', description: 'Ferramentas, automações e aplicações práticas.', progress: 20, color: '#10B981' },
  { id: 'learning-books', title: 'Livros para ler', category: 'Livro', description: 'Organizar leituras que fortalecem sua visão e repertório.', progress: 0, color: '#F97316' },
];

export interface AppData {
  modules: Module[];
  categories: Category[];
  weeklyData: WeeklyEntry[];
  transactions: FinancialTransaction[];
  financialSummary: FinancialSummaryOverrides;
  quickCaptures: { id: string; text: string; createdAt: string }[];
  weekFocus: string;
  priorities: { id: string; text: string; done: boolean; order: number }[];
  
  habits: HabitEntry[];
  productivityHabits: HabitEntry[];
  agenda: AgendaItem[];
  lifeAreas: LifeArea[];
  risks: RiskItem[];
  identityItems: IdentityItem[];
  identityChecks: IdentityCheck[];
  learningCards: LearningCard[];
  nextActions: { id: string; text: string; done: boolean; project?: string; priority?: 'important' | 'urgent' }[];
  weekSummary: string;
  energyLevel: number;
  focusLevel: number;
  disciplineLevel: number;
  clarityLevel: number;
  
  version: '1.0';
}

interface AppStore extends AppData {
  isAddModalOpen: boolean;
  editingModule: Module | null;
  editingModuleType?: ModuleType;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  
  // Module actions
  addModule: (module: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  duplicateModule: (id: string) => void;
  reorderModules: (ids: string[]) => void;
  
  // Category actions
  addCategory: (cat: Omit<Category, 'id'>) => void;
  
  // Quick capture actions
  addQuickCapture: (text: string) => void;
  
  // Priority actions
  togglePriority: (id: string) => void;
  addPriority: (text: string) => void;
  reorderPriorities: (ids: string[]) => void;
  
  // Week focus
  setWeekFocus: (focus: string) => void;
  setFinancialSummary: (summary: Partial<FinancialSummaryOverrides>) => void;
  
  // Modal actions
  openAddModal: (type?: ModuleType, editing?: Module) => void;
  closeAddModal: () => void;
  
  // New actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;
  toggleHabit: (id: string) => void;
  setHabitCheck: (id: string, date: string, status: IdentityStatus | null) => void;
  setProductivityHabitCheck: (id: string, date: string, status: IdentityStatus | null) => void;
  addHabitEntry: (habit: Omit<HabitEntry, 'id'>) => void;
  addProductivityHabitEntry: (habit: Omit<HabitEntry, 'id'>) => void;
  updateHabitEntry: (id: string, updates: Partial<HabitEntry>) => void;
  updateProductivityHabitEntry: (id: string, updates: Partial<HabitEntry>) => void;
  deleteHabitEntry: (id: string) => void;
  deleteProductivityHabitEntry: (id: string) => void;
  addAgendaItem: (item: Omit<AgendaItem, 'id'>) => void;
  updateAgendaItem: (id: string, updates: Partial<AgendaItem>) => void;
  toggleAgendaItem: (id: string) => void;
  addRisk: (risk: Omit<RiskItem, 'id'>) => void;
  addNextAction: (text: string, project?: string, priority?: 'important' | 'urgent') => void;
  toggleNextAction: (id: string) => void;
  setLifeAreaScore: (id: string, score: number) => void;
  setEnergyLevel: (n: number) => void;
  setFocusLevel: (n: number) => void;
  setDisciplineLevel: (n: number) => void;
  setClarityLevel: (n: number) => void;
  setWeekSummary: (text: string) => void;
  addIdentityItem: (title: string) => void;
  updateIdentityItem: (id: string, title: string) => void;
  deleteIdentityItem: (id: string) => void;
  setIdentityCheck: (itemId: string, date: string, status: IdentityStatus | null) => void;
  addLearningCard: (card: Omit<LearningCard, 'id'>) => void;

  // Data management
  exportData: () => string;
  importData: (json: string) => boolean;
  saveToStorage: () => void;
}

// Load from localStorage or use seed
const loadInitialData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { 
        ...seedData, 
        ...parsed,
        // Keep the primary cash account aligned with the current psychological-floor scenario.
        modules: (parsed.modules || seedData.modules).map((module: Module) => module.id === '8' && module.type === 'financial_account' && module.balance === 32000 ? { ...module, balance: 300 } : module),
        // Fallbacks for new fields
        transactions: parsed.transactions || seedData.transactions,
        financialSummary: parsed.financialSummary || seedData.financialSummary,
        habits: parsed.habits || seedData.habits,
        productivityHabits: parsed.productivityHabits || parsed.habits || seedData.habits,
        agenda: parsed.agenda || seedData.agenda,
        lifeAreas: parsed.lifeAreas || seedData.lifeAreas,
        risks: parsed.risks || seedData.risks,
        identityItems: (() => {
          const items = parsed.identityItems || seedData.identityItems;
          return items.some((item: IdentityItem) => item.title === 'Entrar em contato com processo de evolução real')
            ? items
            : [...items, { id: 'identity-distribution-evolution', title: 'Entrar em contato com processo de evolução real', order: items.length }];
        })(),
        identityChecks: parsed.identityChecks || seedData.identityChecks,
        learningCards: parsed.learningCards || defaultLearningCards,
        nextActions: parsed.nextActions || seedData.nextActions,
        weekSummary: parsed.weekSummary || seedData.weekSummary,
        energyLevel: parsed.energyLevel ?? seedData.energyLevel,
        focusLevel: parsed.focusLevel ?? seedData.focusLevel,
        disciplineLevel: parsed.disciplineLevel ?? seedData.disciplineLevel,
        clarityLevel: parsed.clarityLevel ?? seedData.clarityLevel,
      };
    }
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
  }
  return { ...seedData, productivityHabits: seedData.habits, learningCards: defaultLearningCards } as AppData;
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...loadInitialData(),
  learningCards: (loadInitialData() as AppData & { learningCards?: LearningCard[] }).learningCards || defaultLearningCards,
  isAddModalOpen: false,
  editingModule: null,
  editingModuleType: undefined,
  sidebarCollapsed: false,
  sidebarWidth: Number(localStorage.getItem('founder-os-sidebar-width')) || 220,

  saveToStorage: () => {
    const state = get();
    const data: AppData = {
      modules: state.modules,
      categories: state.categories,
      weeklyData: state.weeklyData,
      transactions: state.transactions,
      financialSummary: state.financialSummary,
      quickCaptures: state.quickCaptures,
      weekFocus: state.weekFocus,
      priorities: state.priorities,
      
      habits: state.habits,
      productivityHabits: state.productivityHabits,
      agenda: state.agenda,
      lifeAreas: state.lifeAreas,
      risks: state.risks,
      identityItems: state.identityItems,
      identityChecks: state.identityChecks,
      learningCards: state.learningCards,
      nextActions: state.nextActions,
      weekSummary: state.weekSummary,
      energyLevel: state.energyLevel,
      focusLevel: state.focusLevel,
      disciplineLevel: state.disciplineLevel,
      clarityLevel: state.clarityLevel,
      
      version: '1.0',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    void saveCloudAppData(data);
  },

  addModule: (moduleData) => {
    const newModule: Module = {
      ...moduleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: get().modules.length,
    };
    set({ modules: [...get().modules, newModule] });
    get().saveToStorage();
  },

  updateModule: (id, updates) => {
    set({
      modules: get().modules.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      ),
    });
    get().saveToStorage();
  },

  deleteModule: (id) => {
    set({ modules: get().modules.filter((m) => m.id !== id) });
    get().saveToStorage();
  },

  duplicateModule: (id) => {
    const original = get().modules.find((m) => m.id === id);
    if (!original) return;
    
    const duplicate: Module = {
      ...original,
      id: Date.now().toString(),
      title: `${original.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: get().modules.length,
    };
    set({ modules: [...get().modules, duplicate] });
    get().saveToStorage();
  },

  reorderModules: (ids) => {
    const modules = get().modules;
    const reordered = ids.map((id, index) => {
      const module = modules.find((m) => m.id === id);
      return module ? { ...module, order: index } : null;
    }).filter(Boolean) as Module[];
    
    const remaining = modules.filter((module) => !ids.includes(module.id));
    set({ modules: [...reordered, ...remaining] });
    get().saveToStorage();
  },

  addCategory: (cat) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    set({ categories: [...get().categories, newCat] });
    get().saveToStorage();
  },

  addQuickCapture: (text) => {
    const newCapture = {
      id: `qc-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    };
    set({ quickCaptures: [newCapture, ...get().quickCaptures] });
    get().saveToStorage();
  },

  togglePriority: (id) => {
    set({
      priorities: get().priorities.map((p) =>
        p.id === id ? { ...p, done: !p.done } : p
      ),
    });
    get().saveToStorage();
  },

  addPriority: (text) => {
    const newPriority = {
      id: `p-${Date.now()}`,
      text,
      done: false,
      order: get().priorities.length,
    };
    set({ priorities: [...get().priorities, newPriority] });
    get().saveToStorage();
  },

  reorderPriorities: (ids) => {
    const priorities = get().priorities;
    const reordered = ids.map((id, index) => {
      const priority = priorities.find((p) => p.id === id);
      return priority ? { ...priority, order: index } : null;
    }).filter(Boolean) as { id: string; text: string; done: boolean; order: number }[];
    
    set({ priorities: reordered });
    get().saveToStorage();
  },

  setWeekFocus: (focus) => {
    set({ weekFocus: focus });
    get().saveToStorage();
  },

  setFinancialSummary: (summary) => {
    set({ financialSummary: { ...get().financialSummary, ...summary } });
    get().saveToStorage();
  },

  openAddModal: (type, editing) => {
    set({ 
      isAddModalOpen: true, 
      editingModule: editing || null,
      editingModuleType: type 
    });
  },

  closeAddModal: () => {
    set({ isAddModalOpen: false, editingModule: null, editingModuleType: undefined });
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  setSidebarWidth: (width) => {
    const nextWidth = Math.min(420, Math.max(180, Math.round(width)));
    localStorage.setItem('founder-os-sidebar-width', String(nextWidth));
    set({ sidebarWidth: nextWidth });
  },

  toggleHabit: (id) => {
    set({
      habits: get().habits.map((h) => {
        if (h.id === id) {
          const newDone = !h.done;
          return { ...h, done: newDone, streak: newDone ? h.streak + 1 : Math.max(0, h.streak - 1) };
        }
        return h;
      })
    });
    get().saveToStorage();
  },

  setHabitCheck: (id, date, status) => {
    set({ habits: get().habits.map((habit) => {
      if (habit.id !== id) return habit;
      const checks = { ...(habit.checks || {}) };
      if (status) checks[date] = status;
      else delete checks[date];
      return { ...habit, checks, done: date === new Date().toISOString().slice(0, 10) ? status === 'done' : habit.done };
    }) });
    get().saveToStorage();
  },

  setProductivityHabitCheck: (id, date, status) => {
    set({ productivityHabits: get().productivityHabits.map((habit) => {
      if (habit.id !== id) return habit;
      const checks = { ...(habit.checks || {}) };
      if (status) checks[date] = status;
      else delete checks[date];
      return { ...habit, checks, done: date === new Date().toISOString().slice(0, 10) ? status === 'done' : habit.done };
    }) });
    get().saveToStorage();
  },

  addHabitEntry: (habit) => {
    const newHabit = {
      ...habit,
      id: `h-${Date.now()}`
    };
    set({ habits: [...get().habits, newHabit] });
    get().saveToStorage();
  },

  addProductivityHabitEntry: (habit) => {
    const newHabit = { ...habit, id: `ph-${Date.now()}` };
    set({ productivityHabits: [...get().productivityHabits, newHabit] });
    get().saveToStorage();
  },

  updateHabitEntry: (id, updates) => {
    set({ habits: get().habits.map((habit) => habit.id === id ? { ...habit, ...updates } : habit) });
    get().saveToStorage();
  },

  updateProductivityHabitEntry: (id, updates) => {
    set({ productivityHabits: get().productivityHabits.map((habit) => habit.id === id ? { ...habit, ...updates } : habit) });
    get().saveToStorage();
  },

  deleteHabitEntry: (id) => {
    set({ habits: get().habits.filter((habit) => habit.id !== id) });
    get().saveToStorage();
  },

  deleteProductivityHabitEntry: (id) => {
    set({ productivityHabits: get().productivityHabits.filter((habit) => habit.id !== id) });
    get().saveToStorage();
  },

  addAgendaItem: (item) => {
    const newItem = {
      ...item,
      id: `ag-${Date.now()}`
    };
    // Keep it sorted by time if desired, but here we just append or sort on render
    set({ agenda: [...get().agenda, newItem] });
    get().saveToStorage();
  },

  toggleAgendaItem: (id) => {
    set({
      agenda: get().agenda.map((a) => a.id === id ? { ...a, done: !a.done } : a)
    });
    get().saveToStorage();
  },

  updateAgendaItem: (id, updates) => {
    set({ agenda: get().agenda.map((a) => a.id === id ? { ...a, ...updates } : a) });
    get().saveToStorage();
  },

  addRisk: (risk) => {
    const newRisk = {
      ...risk,
      id: `r-${Date.now()}`
    };
    set({ risks: [...get().risks, newRisk] });
    get().saveToStorage();
  },

  addNextAction: (text, project, priority) => {
    const newAction = {
      id: `na-${Date.now()}`,
      text,
      done: false,
      project,
      priority
    };
    set({ nextActions: [...get().nextActions, newAction] });
    get().saveToStorage();
  },

  toggleNextAction: (id) => {
    set({
      nextActions: get().nextActions.map((n) => n.id === id ? { ...n, done: !n.done } : n)
    });
    get().saveToStorage();
  },

  setLifeAreaScore: (id, score) => {
    set({
      lifeAreas: get().lifeAreas.map((l) => l.id === id ? { ...l, score } : l)
    });
    get().saveToStorage();
  },

  setEnergyLevel: (n) => { set({ energyLevel: n }); get().saveToStorage(); },
  setFocusLevel: (n) => { set({ focusLevel: n }); get().saveToStorage(); },
  setDisciplineLevel: (n) => { set({ disciplineLevel: n }); get().saveToStorage(); },
  setClarityLevel: (n) => { set({ clarityLevel: n }); get().saveToStorage(); },
  
  setWeekSummary: (text) => { set({ weekSummary: text }); get().saveToStorage(); },

  addIdentityItem: (title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    set({ identityItems: [...get().identityItems, { id: `identity-${Date.now()}`, title: trimmed, order: get().identityItems.length }] });
    get().saveToStorage();
  },

  updateIdentityItem: (id, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    set({ identityItems: get().identityItems.map((item) => item.id === id ? { ...item, title: trimmed } : item) });
    get().saveToStorage();
  },

  deleteIdentityItem: (id) => {
    set({
      identityItems: get().identityItems.filter((item) => item.id !== id),
      identityChecks: get().identityChecks.filter((check) => check.itemId !== id),
    });
    get().saveToStorage();
  },

  setIdentityCheck: (itemId, date, status) => {
    const checks = get().identityChecks.filter((check) => !(check.itemId === itemId && check.date === date));
    if (status) checks.push({ id: `${itemId}-${date}`, itemId, date, status });
    set({ identityChecks: checks });
    get().saveToStorage();
  },

  addLearningCard: (card) => {
    set({ learningCards: [...get().learningCards, { ...card, id: `learning-${Date.now()}` }] });
    get().saveToStorage();
  },

  exportData: () => {
    const state = get();
    const data: AppData = {
      modules: state.modules,
      categories: state.categories,
      weeklyData: state.weeklyData,
      transactions: state.transactions,
      financialSummary: state.financialSummary,
      quickCaptures: state.quickCaptures,
      weekFocus: state.weekFocus,
      priorities: state.priorities,
      habits: state.habits,
      productivityHabits: state.productivityHabits,
      agenda: state.agenda,
      lifeAreas: state.lifeAreas,
      risks: state.risks,
      identityItems: state.identityItems,
      identityChecks: state.identityChecks,
      learningCards: state.learningCards,
      nextActions: state.nextActions,
      weekSummary: state.weekSummary,
      energyLevel: state.energyLevel,
      focusLevel: state.focusLevel,
      disciplineLevel: state.disciplineLevel,
      clarityLevel: state.clarityLevel,
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importData: (json) => {
    try {
      const parsed = JSON.parse(json) as AppData;
      set({
        modules: parsed.modules || [],
        categories: parsed.categories || [],
        weeklyData: parsed.weeklyData || [],
        transactions: parsed.transactions || [],
        financialSummary: parsed.financialSummary || {},
        quickCaptures: parsed.quickCaptures || [],
        weekFocus: parsed.weekFocus || '',
        priorities: parsed.priorities || [],
        habits: parsed.habits || [],
        productivityHabits: parsed.productivityHabits || parsed.habits || [],
        agenda: parsed.agenda || [],
        lifeAreas: parsed.lifeAreas || [],
        risks: parsed.risks || [],
        identityItems: parsed.identityItems || [],
        identityChecks: parsed.identityChecks || [],
        learningCards: parsed.learningCards || defaultLearningCards,
        nextActions: parsed.nextActions || [],
        weekSummary: parsed.weekSummary || '',
        energyLevel: parsed.energyLevel ?? 50,
        focusLevel: parsed.focusLevel ?? 50,
        disciplineLevel: parsed.disciplineLevel ?? 50,
        clarityLevel: parsed.clarityLevel ?? 50,
      });
      get().saveToStorage();
      return true;
    } catch (err) {
      console.error('Failed to import data:', err);
      return false;
    }
  },
}));
