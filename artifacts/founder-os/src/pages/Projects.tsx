import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAppStore, type ModuleStatus } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Link2,
  MoreVertical,
  Plus,
  Upload,
  X,
  CheckCircle2,
  Layers3,
  Tag,
  Trash2,
} from "lucide-react";

const ecosystemColors = ["#00C9FF", "#10B981", "#FACC15", "#EF4444", "#A855F7", "#F97316", "#38BDF8"];
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Projects() {
  const [location, setLocation] = useLocation();
  const { modules, ecosystems, tags, habits, productivityHabits, nextActions, addModule, updateModule, addEcosystem, deleteEcosystem, duplicateModule, deleteModule, addProductivityHabitEntry, updateProductivityHabitEntry, deleteProductivityHabitEntry } =
    useAppStore();
  const [newEcosystem, setNewEcosystem] = useState("");
  const [newEcosystemColor, setNewEcosystemColor] = useState("#00C9FF");
  const [selectedEcosystemId, setSelectedEcosystemId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ModuleStatus | "all">("all");
  const query = new URLSearchParams(location.split("?")[1] || "");
  const selectedProject = query.get("project");
  const selectedTag = query.get("tag");
  const selectedEcosystem = selectedEcosystemId || query.get("ecosystem");
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(
    null,
  );
  const [projectEditor, setProjectEditor] = useState<ReturnType<
    typeof emptyProjectForm
  > | null>(null);
  const [newProjectTask, setNewProjectTask] = useState("");
  const { reorderModules } = useAppStore();

  const openProjectEditor = (project?: (typeof modules)[number]) =>
    setProjectEditor(
      project
        ? {
            id: project.id,
            title: project.title,
            category: project.category || "",
            ecosystem: project.ecosystem || "",
            status: project.status,
            progress: project.progress || 0,
            phase: project.phase || "",
            nextAction: project.nextAction || "",
            description: project.description || "",
            tags: (project.tags || []).join(", "),
            url: project.url || "",
            thumbnail: project.thumbnail || "",
          }
        : { ...emptyProjectForm(), ecosystem: selectedEcosystem || "" },
    );
  const saveProject = () => {
    if (!projectEditor?.title.trim()) return;
    const payload = {
      type: "project" as const,
      title: projectEditor.title.trim(),
      category: projectEditor.category.trim() || "Sem grupo",
      ecosystem: projectEditor.ecosystem || undefined,
      status: projectEditor.status,
      progress: projectEditor.progress,
      phase: projectEditor.phase.trim(),
      nextAction: projectEditor.nextAction.trim(),
      description: projectEditor.description.trim(),
      tags: projectEditor.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      url: projectEditor.url.trim(),
      thumbnail: projectEditor.thumbnail,
      order: projectEditor.id
        ? modules.find((item) => item.id === projectEditor.id)?.order || 0
        : modules.filter((item) => item.type === "project").length,
    };
    if (projectEditor.id) updateModule(projectEditor.id, payload);
    else addModule(payload);
    setProjectEditor(null);
  };

  const projects = modules
    .filter((m) => m.type === "project")
    .filter((m) => !selectedProject || m.title.trim().toLowerCase() === selectedProject.trim().toLowerCase())
    .filter((m) => {
      if (!selectedEcosystem) return true;
      const activeEcosystem = ecosystems.find((ecosystem) => ecosystem.id === selectedEcosystem);
      const selectedName = activeEcosystem?.name.trim().toLowerCase() || decodeURIComponent(selectedEcosystem).trim().toLowerCase();
      return m.ecosystem === selectedEcosystem ||
        m.ecosystem?.trim().toLowerCase() === selectedName ||
        m.category?.trim().toLowerCase() === selectedName;
    })
    .filter((m) => !selectedTag || (m.tags || []).some((tag) => tag.trim().toLowerCase() === selectedTag.trim().toLowerCase()))
    .filter((m) => filterStatus === "all" || m.status === filterStatus)
    .sort((a, b) => a.order - b.order);
  const allProjects = modules.filter((module) => module.type === "project");
  const selectedProjectRecord = selectedProject
    ? allProjects.find((project) => project.title.trim().toLowerCase() === selectedProject.trim().toLowerCase())
    : undefined;
  const activeCount = allProjects.filter((project) => project.status === "active").length;
  const pausedCount = allProjects.filter((project) => project.status === "paused").length;
  const completedCount = allProjects.filter((project) => project.status === "done").length;
  const averageProgress = allProjects.length ? Math.round(allProjects.reduce((total, project) => total + (project.progress || 0), 0) / allProjects.length) : 0;
  const isHabitLinkedToProject = (habit: (typeof productivityHabits)[number], project: (typeof allProjects)[number]) =>
    (habit.project || habit.category || "").trim().toLowerCase() === project.title.trim().toLowerCase();
  const projectProgress = (project: (typeof allProjects)[number]) => {
    const linkedHabits = productivityHabits.filter((habit) => isHabitLinkedToProject(habit, project));
    const linkedActions = nextActions.filter((action) => (action.project || '').trim().toLowerCase() === project.title.trim().toLowerCase());
    const total = linkedHabits.length + linkedActions.length;
    if (!total) return project.progress || 0;
    const done = linkedHabits.filter((habit) => habit.done || Object.values(habit.checks || {}).some((status) => status === 'done')).length + linkedActions.filter((action) => action.done).length;
    return Math.round((done / total) * 100);
  };
  const createEcosystem = () => { if (!newEcosystem.trim()) return; addEcosystem({ name: newEcosystem.trim(), color: newEcosystemColor }); setNewEcosystem(""); };
  const clearProjectFilter = () => { setSelectedEcosystemId(null); setLocation("/projetos"); };
  const tagLabel = (tagIdOrName: string) => tags.find((tag) => tag.id === tagIdOrName)?.name || tagIdOrName;
  const openTag = (name: string) => setLocation(`/projetos?tag=${encodeURIComponent(name)}`);
  const clearTag = () => setLocation('/projetos');
  const enterProject = (projectTitle: string) => {
    setLocation(`/projetos?project=${encodeURIComponent(projectTitle)}`);
    window.setTimeout(() => document.getElementById("project-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };
  const addTaskToProject = () => {
    if (!selectedProjectRecord || !newProjectTask.trim()) return;
    addProductivityHabitEntry({
      title: newProjectTask.trim(),
      done: false,
      streak: 0,
      category: selectedProjectRecord.title,
      project: selectedProjectRecord.title,
      order: productivityHabits.length,
    });
    setNewProjectTask("");
  };
  const selectedTagRecord = tags.find((tag) => tag.name.trim().toLowerCase() === selectedTag?.trim().toLowerCase());
  const relatedActions = selectedTag ? nextActions.filter((action) => (action.tags || []).some((tag) => tag === selectedTag || tagLabel(tag).toLowerCase() === selectedTag.toLowerCase())) : [];
  const relatedHabits = selectedTag ? [...habits, ...productivityHabits].filter((habit) => (habit.tags || []).some((tag) => tag === selectedTag || tagLabel(tag).toLowerCase() === selectedTag.toLowerCase())) : [];

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
      case "active":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30";
      case "paused":
        return "bg-chart-3/20 text-chart-3 border-chart-3/30";
      case "done":
        return "bg-chart-1/20 text-chart-1 border-chart-1/30";
      case "archived":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Ativo",
      paused: "Pausado",
      done: "Concluído",
      archived: "Arquivado",
    };
    return labels[status] || status;
  };

  return (
    <div className="max-w-[1600px]">
      <div className="mb-6 flex items-center justify-between">
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
      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[['Ativos', activeCount, 'text-emerald-300'], ['Pausados', pausedCount, 'text-orange-300'], ['Concluídos', completedCount, 'text-cyan-300'], ['Projetos', allProjects.length, 'text-primary'], ['Progresso médio', `${averageProgress}%`, 'text-violet-300']].map(([label, value, tone]) => <article key={String(label)} className="rounded-xl border border-white/[.08] bg-card/70 px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,.12)]"><p className="text-[10px] uppercase tracking-[.14em] text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p></article>)}
      </section>
      <div className="flex gap-2 mb-6">
        {(["all", "active", "paused", "done", "archived"] as const).map(
          (status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilterStatus(status); if (status === "all") clearProjectFilter(); }}
              className={filterStatus === status ? "bg-primary" : ""}
            >
              {status === "all" ? "Todos" : getStatusLabel(status)}
            </Button>
          ),
        )}
      </div>
      <div className="mb-6 rounded-xl border border-primary/15 bg-card/50 p-3"><div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-primary"><Tag className="h-3.5 w-3.5" /> Filtrar por tag</div><div className="flex flex-wrap gap-2">{tags.map((tag) => <button key={tag.id} type="button" onClick={() => openTag(tag.name)} className={`inline-flex min-w-[120px] items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold transition ${selectedTag?.toLowerCase() === tag.name.toLowerCase() ? 'ring-2 ring-white/20' : 'hover:brightness-125'}`} style={{ borderColor: `${tag.color}99`, color: tag.color, backgroundColor: `${tag.color}15` }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />{tag.name}<span className="opacity-60">{(modules.filter((module) => (module.tags || []).some((item) => item.toLowerCase() === tag.name.toLowerCase())).length)}</span></button>)}{selectedTag && <button type="button" onClick={clearTag} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground">Limpar filtro</button>}</div></div>
      {selectedTag && <section className="mb-6 grid gap-3 lg:grid-cols-2"><article className="rounded-xl border border-primary/20 bg-card/60 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-primary">Tag selecionada</p><h2 className="mt-1 text-lg font-semibold" style={{ color: selectedTagRecord?.color }}>{selectedTag}</h2><p className="mt-1 text-xs text-muted-foreground">Tudo que está relacionado a este assunto aparece nesta visão.</p><div className="mt-3 text-xs text-muted-foreground">{projects.length} projetos · {relatedActions.length} ações · {relatedHabits.length} hábitos</div></article><article className="rounded-xl border border-white/[.08] bg-card/60 p-4"><p className="mb-2 text-[10px] uppercase tracking-[.16em] text-muted-foreground">Atividade relacionada</p>{[...relatedActions.map((item) => ({ id: item.id, title: item.text, type: 'Ação' })), ...relatedHabits.map((item) => ({ id: item.id, title: item.title, type: 'Hábito' }))].slice(0, 6).map((item) => <div key={`${item.type}-${item.id}`} className="flex items-center justify-between border-b border-white/[.06] py-1.5 text-xs"><span>{item.title}</span><span className="text-[9px] uppercase text-muted-foreground">{item.type}</span></div>)}{!relatedActions.length && !relatedHabits.length && <p className="text-xs text-muted-foreground">Nenhuma tarefa ou hábito foi associado a esta tag ainda.</p>}</article></section>}
      {(selectedEcosystem || selectedProject) && <button type="button" onClick={clearProjectFilter} className="mb-4 inline-flex items-center rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/20">← Todos os projetos</button>}
      {selectedProjectRecord && (
        <section id="project-workspace" className="mb-6 scroll-mt-4 rounded-2xl border border-primary/20 bg-card/70 p-4 shadow-[0_12px_30px_rgba(0,0,0,.16)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[.16em] text-primary">Área do projeto</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">{selectedProjectRecord.title}</h2>
              <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{selectedProjectRecord.description || "Detalhes, tarefas e andamento deste projeto."}</p>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Progresso</p><p className="text-lg font-semibold text-primary">{projectProgress(selectedProjectRecord)}%</p></div>
              <Button variant="outline" size="sm" onClick={() => openProjectEditor(selectedProjectRecord)}>Editar projeto</Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-amber-400/15 bg-amber-400/[.035] p-3">
              <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-amber-300">Tarefas do projeto</p><span className="text-[10px] text-muted-foreground">{productivityHabits.filter((habit) => isHabitLinkedToProject(habit, selectedProjectRecord)).length}</span></div>
              <div className="space-y-1.5">
                {productivityHabits.filter((habit) => isHabitLinkedToProject(habit, selectedProjectRecord)).map((habit) => <div key={habit.id} className="group flex items-center gap-2 text-xs text-foreground/85"><CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${habit.done || Object.values(habit.checks || {}).some((status) => status === 'done') ? 'text-emerald-400' : 'text-muted-foreground'}`} /><input value={habit.title} onChange={(event) => updateProductivityHabitEntry(habit.id, { title: event.target.value })} className="min-w-0 flex-1 bg-transparent outline-none ring-0 focus:text-primary" aria-label={`Editar tarefa ${habit.title}`} /><button type="button" onClick={() => deleteProductivityHabitEntry(habit.id)} className="opacity-0 transition group-hover:opacity-100 text-muted-foreground hover:text-red-400" title="Excluir tarefa" aria-label={`Excluir tarefa ${habit.title}`}><Trash2 className="h-3.5 w-3.5" /></button></div>)}
                {!productivityHabits.some((habit) => isHabitLinkedToProject(habit, selectedProjectRecord)) && <p className="text-[11px] text-muted-foreground">Nenhuma tarefa vinculada ainda.</p>}
                <div className="mt-3 flex gap-2 border-t border-amber-400/10 pt-3">
                  <input value={newProjectTask} onChange={(event) => setNewProjectTask(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addTaskToProject(); if (event.key === "Escape") setNewProjectTask(""); }} placeholder="Adicionar tarefa ao projeto" className="min-w-0 flex-1 rounded-md border-0 bg-background/60 px-2.5 py-1.5 text-[11px] outline-none ring-1 ring-amber-400/20 focus:ring-amber-300/60" />
                  <button type="button" onClick={addTaskToProject} className="rounded-md bg-amber-300 px-2.5 py-1.5 text-[11px] font-semibold text-slate-950">+ Tarefa</button>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[.035] p-3">
              <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-cyan-300">Próximas ações</p><span className="text-[10px] text-muted-foreground">{nextActions.filter((action) => (action.project || '').trim().toLowerCase() === selectedProjectRecord.title.trim().toLowerCase()).length}</span></div>
              <div className="space-y-1.5">
                {nextActions.filter((action) => (action.project || '').trim().toLowerCase() === selectedProjectRecord.title.trim().toLowerCase()).map((action) => <div key={action.id} className="flex items-center gap-2 text-xs text-foreground/85"><span className={`h-1.5 w-1.5 rounded-full ${action.done ? 'bg-emerald-400' : 'bg-cyan-400'}`} /><span className={action.done ? 'text-muted-foreground line-through' : ''}>{action.text}</span></div>)}
                {!nextActions.some((action) => (action.project || '').trim().toLowerCase() === selectedProjectRecord.title.trim().toLowerCase()) && <p className="text-[11px] text-muted-foreground">Nenhuma ação vinculada ainda.</p>}
              </div>
            </div>
          </div>
        </section>
      )}
      <p className="mb-4 text-xs text-muted-foreground">
        Arraste qualquer card para reorganizar a ordem dos projetos.
      </p>

      <section className="mb-6 rounded-2xl border border-primary/20 bg-card/50 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Layers3 className="h-5 w-5 text-primary" /><div><h2 className="text-sm font-semibold">Ecossistemas</h2><p className="text-xs text-muted-foreground">Crie uma frente e arraste os projetos correspondentes para dentro dela.</p></div></div><div className="flex flex-wrap items-center gap-2"><input value={newEcosystem} onChange={(event) => setNewEcosystem(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createEcosystem(); if (event.key === "Escape") setNewEcosystem(""); }} placeholder="Nome do ecossistema" className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary" /><div className="flex h-9 items-center gap-1 rounded-lg border border-primary/20 bg-background/70 px-2" aria-label="Escolher cor do ecossistema">{ecosystemColors.map((color) => <button key={color} type="button" onClick={() => setNewEcosystemColor(color)} className={`h-5 w-5 rounded-full border-2 transition hover:scale-110 ${newEcosystemColor === color ? "border-white shadow-[0_0_9px_currentColor]" : "border-transparent"}`} style={{ backgroundColor: color, color }} aria-label={`Usar cor ${color}`} />)}</div><Button onClick={createEcosystem} size="sm" className="bg-primary">+ Criar</Button></div></div>
        {ecosystems.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-muted-foreground">Crie seu primeiro ecossistema para começar a organizar os projetos.</div> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{ecosystems.map((ecosystem, index) => { const palette = ["#00C9FF", "#A855F7", "#10B981", "#F59E0B", "#EF4444", "#F97316"]; const color = ecosystem.color === "#00C9FF" ? palette[index % palette.length] : ecosystem.color; const linked = allProjects.filter((project) => project.ecosystem === ecosystem.id || project.category?.trim().toLowerCase() === ecosystem.name.trim().toLowerCase()); return <article key={ecosystem.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const projectId = event.dataTransfer.getData("project-id"); if (projectId) updateModule(projectId, { ecosystem: ecosystem.id }); }} onClick={() => { setSelectedEcosystemId(ecosystem.id); setLocation(`/projetos?ecosystem=${encodeURIComponent(ecosystem.id)}`); }} style={{ borderColor: `${color}99`, boxShadow: `inset 0 1px 0 ${color}33` }} className="relative min-h-32 cursor-pointer rounded-xl border bg-background/40 p-3 transition hover:brightness-110"><button type="button" aria-label={`Excluir ecossistema ${ecosystem.name}`} onClick={(event) => { event.stopPropagation(); if (window.confirm(`Excluir o ecossistema ${ecosystem.name}? Os projetos serão mantidos.`)) { deleteEcosystem(ecosystem.id); if (selectedEcosystem === ecosystem.id) { setSelectedEcosystemId(null); setLocation('/projetos'); } } }} className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition hover:bg-red-500/15 hover:text-red-400"><X className="h-3.5 w-3.5" /></button><div className="mb-3 flex items-center gap-2 pr-7"><span className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color }} /><h3 className="text-xs font-semibold" style={{ color }}>{ecosystem.name}</h3></div>{linked.length ? <div className="flex flex-wrap gap-2">{linked.map((project) => <Link key={project.id} href={`/projetos?project=${encodeURIComponent(project.title)}`} onClick={(event) => event.stopPropagation()} style={{ borderColor: `${color}66`, backgroundColor: `${color}12` }} className="rounded-lg border px-2.5 py-2 text-xs hover:brightness-125">{project.title}</Link>)}</div> : <p className="rounded-lg border border-dashed border-white/10 p-3 text-center text-[11px] text-muted-foreground">Solte um projeto aqui</p>}<div className="mt-3 border-t pt-2 text-[10px] text-muted-foreground">{linked.length} {linked.length === 1 ? "projeto" : "projetos"}</div></article>; })}</div>}
        <p className="mt-3 text-[10px] text-muted-foreground">Para vincular: arraste um card de projeto e solte no ecossistema desejado.</p>
      </section>

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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="cursor-grab overflow-hidden bg-card border border-card-border rounded-lg transition-transform duration-200 hover:scale-[1.01] active:cursor-grabbing active:scale-[0.99]"
              data-testid={`project-card-${project.id}`}
              draggable
              onDragStart={(event) => { setDraggedProjectId(project.id); event.dataTransfer.setData("project-id", project.id); }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverProjectId(project.id);
              }}
              onDragLeave={() => setDragOverProjectId(null)}
              onDrop={(event) => {
                event.preventDefault();
                moveProject(project.id);
              }}
              onDragEnd={() => {
                setDraggedProjectId(null);
                setDragOverProjectId(null);
              }}
              style={{
                borderColor:
                  dragOverProjectId === project.id ? "#00C9FF99" : undefined,
                boxShadow:
                  dragOverProjectId === project.id
                    ? "0 0 18px #00C9FF33"
                    : undefined,
              }}
            >
              {project.thumbnail ? (
                <img
                  src={project.thumbnail}
                  alt={`Thumbnail do projeto ${project.title}`}
                  className="aspect-[16/8] w-full border-b border-[#ffffff0a] object-cover"
                />
              ) : (
                <div className="flex aspect-[16/8] w-full items-center justify-center border-b border-dashed border-[#ffffff15] bg-background text-[10px] text-muted-foreground">
                  Sem thumbnail
                </div>
              )}
              <div className="p-3">
                {(() => {
                  const linkedTasks = productivityHabits.filter((habit) =>
                    isHabitLinkedToProject(habit, project),
                  );
                  return linkedTasks.length > 0 ? (
                    <div className="mb-3 rounded-lg border border-amber-400/20 bg-amber-400/[.04] p-2.5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-amber-300">Produtividade vinculada</span>
                        <span className="text-[10px] text-muted-foreground">{linkedTasks.length} itens</span>
                      </div>
                      <div className="space-y-1">
                        {linkedTasks.slice(0, 4).map((task) => (
                          <div key={task.id} className="flex items-center gap-1.5 text-[11px] text-foreground/80">
                            <CheckCircle2 className={`h-3 w-3 ${task.done ? "text-emerald-400" : "text-muted-foreground"}`} />
                            <span className={task.done ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-foreground">
                      {project.title}
                    </h3>
                    <p className="mt-0.5 truncate text-[9px] uppercase tracking-wider text-muted-foreground">
                      Grupo: {project.category || "Sem grupo"}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(project.status)}`}
                    >
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold text-foreground">
                        {projectProgress(project)}%
                      </span>
                    </div>
                    <Progress value={projectProgress(project)} className="h-1.5" />
                  </div>

                  {project.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {project.description}
                    </p>
                  )}

                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => openTag(tag)}
                          className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2">
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => { event.stopPropagation(); enterProject(project.title); }}
                    className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/10"
                  >
                    Entrar <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-popover border-popover-border"
                    >
                      <DropdownMenuItem
                        onClick={() => openProjectEditor(project)}
                      >
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => duplicateModule(project.id)}
                      >
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          updateModule(project.id, { status: "archived" })
                        }
                      >
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
              </div>
            </div>
          ))}
        </div>
      )}
      {projectEditor && (
        <ProjectEditor
          form={projectEditor}
          setForm={setProjectEditor}
          ecosystems={ecosystems}
          onClose={() => setProjectEditor(null)}
          onSave={saveProject}
        />
      )}
    </div>
  );
}

function emptyProjectForm() {
  return {
    id: "",
    title: "",
    category: "",
    ecosystem: "",
    status: "active" as ModuleStatus,
    progress: 0,
    phase: "",
    nextAction: "",
    description: "",
    tags: "",
    url: "",
    thumbnail: "",
  };
}

function ProjectEditor({
  form,
  setForm,
  ecosystems,
  onClose,
  onSave,
}: {
  form: ReturnType<typeof emptyProjectForm>;
  setForm: React.Dispatch<React.SetStateAction<ReturnType<typeof emptyProjectForm>>>;
  ecosystems: { id: string; name: string; color?: string }[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [thumbnailError, setThumbnailError] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState(form.thumbnail);
  const [thumbnailProcessing, setThumbnailProcessing] = useState(false);
  const update = (
    key: keyof ReturnType<typeof emptyProjectForm>,
    value: string | number,
  ) => setForm((current) => ({ ...current, [key]: value }));
  const upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setThumbnailError("");
    setThumbnailProcessing(true);
    if (file.type && !file.type.startsWith("image/")) {
      setThumbnailError("Escolha um arquivo de imagem válido.");
      setThumbnailProcessing(false);
      event.target.value = "";
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);
    const image = new Image();
    image.onload = () => {
      const targetWidth = 1280;
      const targetHeight = 720;
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        setThumbnailError("Não foi possível preparar essa imagem.");
        setThumbnailProcessing(false);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      const scale = Math.max(targetWidth / image.width, targetHeight / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(image, (targetWidth - width) / 2, (targetHeight - height) / 2, width, height);
      const normalizedImage = canvas.toDataURL("image/jpeg", 0.78);
      setThumbnailPreview(normalizedImage);
      update("thumbnail", normalizedImage);
      setThumbnailProcessing(false);
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      setThumbnailError("Esse formato de imagem não pôde ser lido pelo navegador.");
      setThumbnailProcessing(false);
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
    event.target.value = "";
  };
  const statuses = [
    { value: "active", label: "Ativo", hint: "Em execução", color: "#10B981" },
    { value: "paused", label: "Pausado", hint: "Em espera", color: "#F97316" },
    { value: "done", label: "Concluído", hint: "Finalizado", color: "#00C9FF" },
    {
      value: "archived",
      label: "Arquivado",
      hint: "Fora de foco",
      color: "#94A3B8",
    },
  ] as const;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              PROJETOS
            </p>
            <h2 className="mt-1 text-xl font-bold">
              {form.id ? "Editar projeto" : "Novo projeto"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Cadastro exclusivo desta área.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome do projeto *">
            <input
              autoFocus
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Ex.: Soul Krieg"
            />
          </Field>
          <Field label="Grupo / categoria">
            <input
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="Ex.: Canais, Produto, Cliente"
            />
          </Field>
          <Field label="Ecossistema">
            <select
              value={form.ecosystem}
              onChange={(e) => update("ecosystem", e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"
            >
              <option value="">Sem ecossistema</option>
              {ecosystems.map((ecosystem) => (
                <option key={ecosystem.id} value={ecosystem.id}>
                  {ecosystem.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Status do projeto
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {statuses.map((status) => (
                <button
                  type="button"
                  key={status.value}
                  onClick={() => update("status", status.value)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${form.status === status.value ? "bg-white/[0.08]" : "border-white/10 bg-background/30 hover:bg-white/[0.04]"}`}
                  style={{
                    borderColor:
                      form.status === status.value
                        ? `${status.color}99`
                        : undefined,
                    boxShadow:
                      form.status === status.value
                        ? `0 0 16px ${status.color}22`
                        : undefined,
                  }}
                >
                  <span
                    className="mb-2 block h-2 w-2 rounded-full"
                    style={{
                      background: status.color,
                      boxShadow: `0 0 8px ${status.color}`,
                    }}
                  />
                  <span className="block text-xs font-semibold">
                    {status.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {status.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <Field label={`Execução do projeto: ${form.progress}%`}>
            <div className="rounded-xl border border-white/15 bg-background/40 p-3">
              <div className="mb-2 flex justify-between text-[10px] text-muted-foreground">
                <span>Início</span>
                <span>Execução atual</span>
                <span>100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress}
                onChange={(e) => update("progress", Number(e.target.value))}
                className="mt-1 w-full accent-primary"
              />
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${form.progress}%` }}
                />
              </div>
            </div>
          </Field>
          <Field label="Fase atual">
            <input
              value={form.phase}
              onChange={(e) => update("phase", e.target.value)}
              placeholder="Ex.: Construção"
            />
          </Field>
          <Field label="Próxima ação">
            <input
              value={form.nextAction}
              onChange={(e) => update("nextAction", e.target.value)}
              placeholder="Ex.: Publicar novo conteúdo"
            />
          </Field>
          <Field label="Link do canal / projeto">
            <input
              value={form.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Tags separadas por vírgula">
            <input
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="Gaming, Lançamento Q2"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Descrição">
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                placeholder="Objetivo e contexto do projeto"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Thumbnail horizontal
            </label>
            <label className="mt-2 flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-primary/40 bg-background/50 text-xs text-muted-foreground hover:border-primary">
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Preview"
                  className="h-36 w-full object-cover"
                />
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Enviar imagem do projeto
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={upload}
                className="hidden"
              />
            </label>
            {thumbnailError && <p className="mt-2 text-xs text-destructive">{thumbnailError}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={!form.title.trim() || thumbnailProcessing}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {thumbnailProcessing ? "Preparando imagem..." : "Salvar projeto"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-medium text-muted-foreground">
      {label}
      <div className="mt-2 [&_input:not([type=range])]:w-full [&_input:not([type=range])]:rounded-lg [&_input:not([type=range])]:border [&_input:not([type=range])]:border-white/15 [&_input:not([type=range])]:bg-background/50 [&_input:not([type=range])]:px-3 [&_input:not([type=range])]:py-2.5 [&_input:not([type=range])]:text-sm [&_input:not([type=range])]:text-foreground [&_input:not([type=range])]:outline-none [&_input:not([type=range])]:focus:border-primary [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-white/15 [&_select]:bg-background/50 [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-sm [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-white/15 [&_textarea]:bg-background/50 [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:text-sm [&_textarea]:text-foreground [&_textarea]:outline-none [&_textarea]:focus:border-primary">
        {children}
      </div>
    </label>
  );
}
