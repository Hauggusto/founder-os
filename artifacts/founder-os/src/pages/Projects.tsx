import { useState } from 'react';
import { useAppStore, type ModuleStatus } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Link2, MoreVertical, Plus, Upload, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Projects() {
  const { modules, addModule, updateModule, duplicateModule, deleteModule } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<ModuleStatus | 'all'>('all');
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);
  const [projectEditor, setProjectEditor] = useState<ReturnType<typeof emptyProjectForm> | null>(null);
  const { reorderModules } = useAppStore();

  const openProjectEditor = (project?: typeof modules[number]) => setProjectEditor(project ? { id: project.id, title: project.title, category: project.category || '', status: project.status, progress: project.progress || 0, phase: project.phase || '', nextAction: project.nextAction || '', description: project.description || '', tags: (project.tags || []).join(', '), url: project.url || '', thumbnail: project.thumbnail || '' } : emptyProjectForm());
  const saveProject = () => {
    if (!projectEditor?.title.trim()) return;
    const payload = { type: 'project' as const, title: projectEditor.title.trim(), category: projectEditor.category.trim() || 'Sem grupo', status: projectEditor.status, progress: projectEditor.progress, phase: projectEditor.phase.trim(), nextAction: projectEditor.nextAction.trim(), description: projectEditor.description.trim(), tags: projectEditor.tags.split(',').map((tag) => tag.trim()).filter(Boolean), url: projectEditor.url.trim(), thumbnail: projectEditor.thumbnail, order: projectEditor.id ? modules.find((item) => item.id === projectEditor.id)?.order || 0 : modules.filter((item) => item.type === 'project').length };
    if (projectEditor.id) updateModule(projectEditor.id, payload); else addModule(payload);
    setProjectEditor(null);
  };

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
          onClick={() => openProjectEditor()}
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
            onClick={() => openProjectEditor()}
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
                {project.url ? <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/10"><Link2 className="h-3.5 w-3.5" /> Abrir canal <ExternalLink className="h-3 w-3" /></a> : <button onClick={() => openProjectEditor(project)} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-primary"><Link2 className="h-3.5 w-3.5" /> Adicionar link</button>}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-popover-border"><DropdownMenuItem onClick={() => openProjectEditor(project)}>Editar</DropdownMenuItem><DropdownMenuItem onClick={() => duplicateModule(project.id)}>Duplicar</DropdownMenuItem><DropdownMenuItem onClick={() => updateModule(project.id, { status: 'archived' })}>Arquivar</DropdownMenuItem><DropdownMenuItem onClick={() => deleteModule(project.id)} className="text-destructive">Excluir</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {projectEditor && <ProjectEditor form={projectEditor} setForm={setProjectEditor} onClose={() => setProjectEditor(null)} onSave={saveProject} />}
    </div>
  );
}

function emptyProjectForm() { return { id: '', title: '', category: '', status: 'active' as ModuleStatus, progress: 0, phase: '', nextAction: '', description: '', tags: '', url: '', thumbnail: '' }; }

function ProjectEditor({ form, setForm, onClose, onSave }: { form: ReturnType<typeof emptyProjectForm>; setForm: (form: ReturnType<typeof emptyProjectForm>) => void; onClose: () => void; onSave: () => void }) {
  const update = (key: keyof ReturnType<typeof emptyProjectForm>, value: string | number) => setForm({ ...form, [key]: value });
  const upload = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => update('thumbnail', String(reader.result)); reader.readAsDataURL(file); };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">PROJETOS</p><h2 className="mt-1 text-xl font-bold">{form.id ? 'Editar projeto' : 'Novo projeto'}</h2><p className="text-xs text-muted-foreground">Cadastro exclusivo desta área.</p></div><button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button></div><div className="grid gap-4 md:grid-cols-2"><Field label="Nome do projeto *"><input autoFocus value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Ex.: Soul Krieg" /></Field><Field label="Grupo / categoria"><input value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="Ex.: Canais, Produto, Cliente" /></Field><Field label="Status"><select value={form.status} onChange={(e) => update('status', e.target.value)}><option value="active">Ativo</option><option value="paused">Pausado</option><option value="done">Concluído</option><option value="archived">Arquivado</option></select></Field><Field label={`Progresso: ${form.progress}%`}><input type="range" min="0" max="100" value={form.progress} onChange={(e) => update('progress', Number(e.target.value))} className="mt-3 w-full accent-primary" /></Field><Field label="Fase atual"><input value={form.phase} onChange={(e) => update('phase', e.target.value)} placeholder="Ex.: Construção" /></Field><Field label="Próxima ação"><input value={form.nextAction} onChange={(e) => update('nextAction', e.target.value)} placeholder="Ex.: Publicar novo conteúdo" /></Field><Field label="Link do canal / projeto"><input value={form.url} onChange={(e) => update('url', e.target.value)} placeholder="https://..." /></Field><Field label="Tags separadas por vírgula"><input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="Gaming, Lançamento Q2" /></Field><div className="md:col-span-2"><Field label="Descrição"><textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Objetivo e contexto do projeto" /></Field></div><div className="md:col-span-2"><label className="block text-xs font-medium text-muted-foreground">Thumbnail horizontal</label><label className="mt-2 flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-primary/40 bg-background/50 text-xs text-muted-foreground hover:border-primary">{form.thumbnail ? <img src={form.thumbnail} alt="Preview" className="h-36 w-full object-cover" /> : <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Enviar imagem do projeto</span>}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} className="hidden" /></label></div></div><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</button><button onClick={onSave} disabled={!form.title.trim()} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Salvar projeto</button></div></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-medium text-muted-foreground">{label}<div className="mt-2">{children}</div></label>; }
