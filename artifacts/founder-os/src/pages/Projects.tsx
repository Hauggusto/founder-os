import { useState } from 'react';
import { useAppStore, type ModuleStatus } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Projects() {
  const { modules, openAddModal, duplicateModule, updateModule, deleteModule } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<ModuleStatus | 'all'>('all');

  const projects = modules
    .filter(m => m.type === 'project')
    .filter(m => filterStatus === 'all' || m.status === filterStatus)
    .sort((a, b) => a.order - b.order);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
      case 'paused':
        return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'done':
        return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
      case 'archived':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Ativo',
      paused: 'Pausado',
      done: 'Concluído',
      archived: 'Arquivado',
    };
    return labels[status] || status;
  };

  return (
    <div className="max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Projetos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os seus projetos em andamento
          </p>
        </div>
        <Button
          onClick={() => openAddModal('project')}
          className="bg-primary hover:bg-primary/90"
          data-testid="button-new-project"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'paused', 'done', 'archived'] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? 'bg-primary' : ''}
          >
            {status === 'all' ? 'Todos' : getStatusLabel(status)}
          </Button>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="bg-card border border-card-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Nenhum projeto encontrado.
          </p>
          <Button
            onClick={() => openAddModal('project')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-card border border-card-border rounded-lg p-5 hover:scale-[1.01] transition-transform duration-200"
              data-testid={`project-card-${project.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {project.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(project.status)}`}
                  >
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-popover-border">
                    <DropdownMenuItem onClick={() => openAddModal('project', project)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateModule(project.id)}>
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateModule(project.id, { status: 'archived' })}>
                      Arquivar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteModule(project.id)}
                      className="text-destructive"
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold text-foreground">
                      {project.progress || 0}%
                    </span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>

                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
