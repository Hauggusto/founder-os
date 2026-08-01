import { useAppStore } from '@/store/useAppStore';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Copy, Archive, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ProjectsBlock() {
  const { modules, openAddModal, duplicateModule, updateModule, deleteModule } = useAppStore();
  
  const projects = modules
    .filter(m => m.type === 'project' && (m.status === 'active' || m.status === 'paused'))
    .sort((a, b) => a.order - b.order);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30';
      case 'paused':
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Projetos Ativos
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openAddModal('project')}
          className="text-xs text-primary hover:text-primary/90 h-8 px-2"
        >
          + Novo Projeto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-[#14171F] border border-[#ffffff0a] rounded-lg p-4 flex items-center justify-between group"
          >
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-sm text-foreground truncate">
                  {project.title}
                </h4>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${getStatusColor(project.status)}`}>
                  {project.status === 'active' ? 'Ativo' : 'Pausado'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 w-full">
                <Progress value={project.progress || 0} className="h-1.5 flex-1 bg-[#ffffff10] [&>div]:bg-[#00C9FF]" />
                <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                  {project.progress || 0}%
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-card border-card-border">
                <DropdownMenuItem onClick={() => openAddModal('project', project)}>
                  <Edit className="w-4 h-4 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicateModule(project.id)}>
                  <Copy className="w-4 h-4 mr-2" /> Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateModule(project.id, { status: 'archived' })}>
                  <Archive className="w-4 h-4 mr-2" /> Arquivar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => deleteModule(project.id)}>
                  <Trash className="w-4 h-4 mr-2" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
