import { useMemo, useState } from 'react';
import { Pencil, Plus, Tag, Trash2, X } from 'lucide-react';
import { useAppStore, type DashboardTag } from '@/store/useAppStore';

const palette = ['#22C55E', '#FACC15', '#EF4444', '#00C9FF', '#A855F7', '#F97316'];

export function TagManager() {
  const { tags, modules, habits, productivityHabits, nextActions, addTag, updateTag, deleteTag } = useAppStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(palette[0]);
  const [editing, setEditing] = useState<string | null>(null);

  const counts = useMemo(() => {
    const all = [...modules.flatMap((item) => item.tags || []), ...habits.flatMap((item) => item.tags || []), ...productivityHabits.flatMap((item) => item.tags || []), ...nextActions.flatMap((item) => item.tags || [])];
    return new Map(tags.map((tag) => [tag.id, all.filter((id) => id === tag.id || id.toLowerCase() === tag.name.toLowerCase()).length]));
  }, [tags, modules, habits, productivityHabits, nextActions]);

  const submit = () => {
    if (!name.trim()) return;
    if (editing) updateTag(editing, { name: name.trim(), color });
    else addTag({ name: name.trim(), color });
    setName(''); setColor(palette[0]); setEditing(null);
  };

  const startEdit = (tag: DashboardTag) => { setEditing(tag.id); setName(tag.name); setColor(tag.color); setOpen(true); };

  return <section className="rounded-2xl border border-primary/20 bg-card/80 p-4 shadow-[0_12px_35px_rgba(0,0,0,.12)]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary"><Tag className="h-4 w-4" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">Organização</p><h3 className="text-sm font-semibold">Tags do dashboard</h3></div></div>
      <button onClick={() => { setOpen((value) => !value); setEditing(null); setName(''); }} className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-3 py-1.5 text-xs text-primary hover:bg-primary/10"><Plus className="h-3.5 w-3.5" /> Nova tag</button>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <div key={tag.id} className="group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px]" style={{ borderColor: `${tag.color}66`, color: tag.color, backgroundColor: `${tag.color}12` }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />{tag.name}<span className="opacity-60">{counts.get(tag.id) || 0}</span><button onClick={() => startEdit(tag)} className="ml-1 opacity-0 transition group-hover:opacity-100" aria-label={`Editar tag ${tag.name}`}><Pencil className="h-3 w-3" /></button><button onClick={() => deleteTag(tag.id)} className="opacity-0 text-red-300 transition group-hover:opacity-100" aria-label={`Excluir tag ${tag.name}`}><Trash2 className="h-3 w-3" /></button></div>)}</div>
    {open && <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-background/60 p-2"><input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submit(); if (event.key === 'Escape') { setOpen(false); setEditing(null); } }} placeholder="Nome da tag" className="h-8 min-w-[180px] flex-1 rounded-lg border border-white/10 bg-background px-2 text-xs outline-none focus:border-primary" /><div className="flex items-center gap-1">{palette.map((item) => <button key={item} onClick={() => setColor(item)} className={`h-6 w-6 rounded-full border-2 ${color === item ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: item }} aria-label={`Usar cor ${item}`} />)}</div><button onClick={submit} className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground">{editing ? 'Salvar' : 'Criar'}</button><button onClick={() => { setOpen(false); setEditing(null); }} className="h-8 w-8 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground" aria-label="Fechar tags"><X className="mx-auto h-3.5 w-3.5" /></button></div>}
  </section>;
}
