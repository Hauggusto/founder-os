import { useEffect, useState } from 'react';

export type Agent = { id: string; name: string; role: string; workplace: string; project: string; executions: number; success: number; photo?: string; status: 'Ativo' | 'Em testes' };
const KEY = 'founder-os-agents';
export const defaultAgents: Agent[] = [
  { id: 'agent-marcos', name: 'Marcos', role: 'Editor de Vídeos', workplace: 'Conteúdo', project: 'Soul Krieg', executions: 34, success: 88, status: 'Ativo' },
  { id: 'agent-lara', name: 'Lara', role: 'Roteirista', workplace: 'Conteúdo', project: 'Myalone', executions: 27, success: 85, status: 'Ativo' },
  { id: 'agent-vini', name: 'Vini', role: 'Publicador', workplace: 'Distribuição', project: 'Redforce', executions: 42, success: 90, status: 'Ativo' },
  { id: 'agent-isa', name: 'Isa', role: 'Pesquisadora', workplace: 'Inteligência', project: 'Anime', executions: 12, success: 84, status: 'Ativo' },
  { id: 'agent-beta', name: 'Beta', role: 'Analista', workplace: 'Métricas', project: 'Myred', executions: 12, success: 70, status: 'Em testes' },
];
export const loadAgents = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || defaultAgents; } catch { return defaultAgents; } };
export const saveAgents = (agents: Agent[]) => { localStorage.setItem(KEY, JSON.stringify(agents)); window.dispatchEvent(new CustomEvent('founder-agents-updated')); };
export function useAgents() { const [agents, setAgents] = useState<Agent[]>(loadAgents); useEffect(() => { const update = () => setAgents(loadAgents()); window.addEventListener('founder-agents-updated', update); return () => window.removeEventListener('founder-agents-updated', update); }, []); return [agents, (next: Agent[]) => { setAgents(next); saveAgents(next); }] as const; }
