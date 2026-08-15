import { useState } from 'react';
import { useAppStore, type ModuleStatus } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Link2, MoreVertical, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Projects() {
  const { modules, openAddModal, duplicateModule, updateModule, deleteModule } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<ModuleStatus | 'all'>('all');
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);
  const { reorderModules } = useAppStore();

  const projects = modules
    .filter(m => m.type === 'project')
    .filter(m => filterStatus === 'all' || m.status === filterStatus)
    .sort((a, b) => a.order - b.order);

  const moveProject = (targetId: string) => {
    if (!draggedProjectId || draggedProjectId === targetId) return;
    const ids = projects.map((project) => project.id);
    const from = ids.indexOf(draggedProjectId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, draggedProjectId);
    reorderModules(ids);
    setDraggedProjectId(null);
    setDragOverProjectId(null);
  };

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
      <p className="mb-4 text-xs text-muted-foreground">Arraste qualquer card para reorganizar a ordem dos projetos.</p>

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="cursor-grab overflow-hidden bg-card border border-card-border rounded-lg transition-transform duration-200 hover:scale-[1.01] active:cursor-grabbing active:scale-[0.99]"
              data-testid={`project-card-${project.id}`}
              draggable
              onDragStart={() => setDraggedProjectId(project.id)}
              onDragOver={(event) => { event.preventDefault(); setDragOverProjectId(project.id); }}
              onDragLeave={() => setDragOverProjectId(null)}
              onDrop={(event) => { event.preventDefault(); moveProject(project.id); }}
              onDragEnd={() => { setDraggedProjectId(null); setDragOverProjectId(null); }}
              style={{ borderColor: dragOverProjectId === project.id ? '#00C9FF99' : undefined, boxShadow: dragOverProjectId === project.id ? '0 0 18px #00C9FF33' : undefined }}
            >
              {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={`Thumbnail do projeto ${project.title}`}
                      className="aspect-video w-full border-b border-[#ffffff0a] object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center border-b border-dashed border-[#ffffff15] bg-background text-[11px] text-muted-foreground">
                      Sem thumbnail
                    </div>
                  )}
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-foreground text-lg">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Grupo: {project.category || 'Sem grupo'}</p>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(project.status)}`}
                  >
                    {getStatusLabel(project.status)}
                  </Badge>
                  </div>
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
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3">
                {project.url ? <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/10"><Link2 className="h-3.5 w-3.5" /> Abrir canal <ExternalLink className="h-3 w-3" /></a> : <button onClick={() => openAddModal('project', project)} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-primary"><Link2 className="h-3.5 w-3.5" /> Adicionar link</button>}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-popover-border"><DropdownMenuItem onClick={() => openAddModal('project', project)}>Editar</DropdownMenuItem><DropdownMenuItem onClick={() => duplicateModule(project.id)}>Duplicar</DropdownMenuItem><DropdownMenuItem onClick={() => updateModule(project.id, { status: 'archived' })}>Arquivar</DropdownMenuItem><DropdownMenuItem onClick={() => deleteModule(project.id)} className="text-destructive">Excluir</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
