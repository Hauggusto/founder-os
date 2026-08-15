import { useState, useEffect } from 'react';
import { useAppStore, type ModuleType, type ModuleStatus } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ImagePlus, X } from 'lucide-react';

const MODULE_TYPES: { value: ModuleType; label: string }[] = [
  { value: 'metric', label: 'Métrica' },
  { value: 'project', label: 'Projeto' },
  { value: 'financial_account', label: 'Conta Financeira' },
  { value: 'task', label: 'Tarefa' },
  { value: 'note', label: 'Nota' },
  { value: 'link', label: 'Link/Referência' },
];

const STATUSES: { value: ModuleStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'archived', label: 'Arquivado' },
  { value: 'done', label: 'Concluído' },
];

const COLORS = [
  '#00C9FF', '#0EA5E9', '#8B5CF6', '#EC4899',
  '#F59E0B', '#10B981', '#EF4444', '#6B7280'
];

export function AddModuleModal() {
  const { isAddModalOpen, closeAddModal, editingModule, editingModuleType, addModule, updateModule, categories, addCategory } = useAppStore();

  const [type, setType] = useState<ModuleType>(editingModuleType || 'project');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [status, setStatus] = useState<ModuleStatus>('active');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailError, setThumbnailError] = useState('');
  const [phase, setPhase] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [tags, setTags] = useState('');
  const [url, setUrl] = useState('');
  const [unit, setUnit] = useState('');
  const [accountType, setAccountType] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (editingModule) {
      setType(editingModule.type);
      setTitle(editingModule.title);
      setCategory(editingModule.category);
      setSubcategory(editingModule.subcategory || '');
      setColor(editingModule.color || COLORS[0]);
      setStatus(editingModule.status);
      setValue(editingModule.value?.toString() || '');
      setDescription(editingModule.description || '');
      setProgress(editingModule.progress || 0);
      setThumbnail(editingModule.thumbnail || '');
      setThumbnailError('');
      setPhase(editingModule.phase || '');
      setNextAction(editingModule.nextAction || '');
      setTags(editingModule.tags?.join(', ') || '');
      setUrl(editingModule.url || '');
      setUnit(editingModule.unit || '');
      setAccountType(editingModule.accountType || '');
    } else {
      // Reset for new module
      setType(editingModuleType || 'project');
      setTitle('');
      setCategory('');
      setSubcategory('');
      setColor(COLORS[0]);
      setStatus('active');
      setValue('');
      setDescription('');
      setProgress(0);
      setThumbnail('');
      setThumbnailError('');
      setPhase('');
      setNextAction('');
      setTags('');
      setUrl('');
      setUnit('');
      setAccountType('');
    }
  }, [editingModule, editingModuleType, isAddModalOpen]);

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setThumbnailError('Escolha um arquivo de imagem.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setThumbnailError('A imagem deve ter no máximo 3 MB.');
      return;
    }

    setThumbnailError('');
    const reader = new FileReader();
    reader.onload = () => setThumbnail(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const moduleData: any = {
      type,
      title,
      category,
      subcategory: subcategory || undefined,
      color,
      status,
      description: description || undefined,
    };

    // Type-specific fields
    if (type === 'project') {
      moduleData.projectName = title;
      moduleData.progress = progress;
      moduleData.thumbnail = thumbnail || undefined;
      moduleData.phase = phase || undefined;
      moduleData.nextAction = nextAction || undefined;
      if (tags) moduleData.tags = tags.split(',').map(t => t.trim());
    }

    if (type === 'financial_account') {
      moduleData.thumbnail = thumbnail || undefined;
    }

    if (type === 'metric') {
      moduleData.value = parseFloat(value) || 0;
      moduleData.unit = unit;
      moduleData.trend = 'stable';
    }

    if (type === 'financial_account') {
      moduleData.balance = parseFloat(value) || 0;
      moduleData.currency = 'BRL';
      moduleData.accountType = accountType;
    }

    if (type === 'task') {
      moduleData.done = false;
      moduleData.priority = 'medium';
    }

    if (type === 'note') {
      moduleData.content = description;
    }

    if (type === 'link') {
      moduleData.url = url;
    }

    if (editingModule) {
      updateModule(editingModule.id, moduleData);
    } else {
      addModule(moduleData);
    }

    closeAddModal();
  };

  const handleCategoryChange = (val: string) => {
    if (val === '__new__') {
      setShowNewCategory(true);
    } else {
      setCategory(val);
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({ name: newCategoryName, order: categories.length });
      setCategory(newCategoryName);
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  return (
    <Dialog open={isAddModalOpen} onOpenChange={closeAddModal}>
      <DialogContent className="bg-card border-card-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as ModuleType)}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODULE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-input"
              placeholder="Nome do módulo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            {showNewCategory ? (
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da nova categoria"
                  className="bg-background border-input"
                />
                <Button onClick={handleCreateCategory} size="sm">Criar</Button>
                <Button onClick={() => setShowNewCategory(false)} variant="ghost" size="sm">
                  Cancelar
                </Button>
              </div>
            ) : (
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Selecione ou crie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">+ Nova categoria...</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ModuleStatus)}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded border-2 ${
                      color === c ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Type-specific fields */}
          {(type === 'project' || type === 'financial_account') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="project-thumbnail">Imagem do cartão / conta</Label>
                {thumbnail ? (
                  <div className="group relative overflow-hidden rounded-lg border border-card-border bg-background">
                    <img src={thumbnail} alt="Prévia da capa do projeto" className="aspect-video w-full object-cover" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => setThumbnail('')}
                      className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remover imagem"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="project-thumbnail" className="flex aspect-[2.2/1] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Clique para enviar a imagem do cartão ou conta</span>
                    <span className="text-[10px] opacity-70">JPG, PNG ou WebP</span>
                  </label>
                )}
                <input id="project-thumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} className="sr-only" />
                {thumbnailError && <p className="text-xs text-destructive">{thumbnailError}</p>}
              </div>
              <div className="space-y-2">
                <Label>Progresso: {progress}%</Label>
                <Slider
                  value={[progress]}
                  onValueChange={(v) => setProgress(v[0])}
                  max={100}
                  step={5}
                  className="py-4"
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ex: MVP, B2B, Q2"
                  className="bg-background border-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fase atual</Label>
                  <Input value={phase} onChange={(e) => setPhase(e.target.value)} className="bg-background border-input" placeholder="Construção, Validação..." />
                </div>
                <div className="space-y-2">
                  <Label>Próxima ação</Label>
                  <Input value={nextAction} onChange={(e) => setNextAction(e.target.value)} className="bg-background border-input" placeholder="Definir próximo passo" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Link do canal / projeto</Label>
                <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="bg-background border-input" placeholder="https://youtube.com/..." />
              </div>
            </>
          )}

          {(type === 'metric' || type === 'financial_account') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="bg-background border-input"
                  placeholder="0"
                />
              </div>
              {type === 'metric' && (
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="bg-background border-input"
                    placeholder="R$, %, dias..."
                  />
                </div>
              )}
              {type === 'financial_account' && (
                <div className="space-y-2">
                  <Label>Tipo de Conta</Label>
                  <Input
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="bg-background border-input"
                    placeholder="Corrente, Poupança..."
                  />
                </div>
              )}
            </div>
          )}

          {type === 'link' && (
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-background border-input"
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Observação</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-input resize-none"
              rows={3}
              placeholder="Notas adicionais..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={closeAddModal}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            {editingModule ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
