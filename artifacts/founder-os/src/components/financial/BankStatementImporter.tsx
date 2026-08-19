import { useRef, useState } from 'react';
import { Check, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FINANCIAL_CATEGORIES, type FinancialTransaction } from '@/store/useAppStore';

type ImportedTransaction = Omit<FinancialTransaction, 'id'>;

export function BankStatementImporter({ accountName, onImport }: { accountName: string; onImport: (rows: ImportedTransaction[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportedTransaction[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const openPicker = () => inputRef.current?.click();
  const reset = () => { setRows([]); setFileName(''); setError(''); if (inputRef.current) inputRef.current.value = ''; };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const text = await file.text();
      const parsed = file.name.toLowerCase().endsWith('.ofx') ? parseOfx(text, accountName) : parseCsv(text, accountName);
      if (!parsed.length) throw new Error('Não encontrei lançamentos reconhecíveis. Exporte o extrato Nubank em CSV ou OFX.');
      setRows(parsed);
      setFileName(file.name);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível ler este arquivo.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (index: number, updates: Partial<ImportedTransaction>) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...updates } : row));

  if (rows.length) return (
    <div className="mt-3 rounded-lg border border-primary/25 bg-primary/[0.04] p-3" onClick={(event) => event.preventDefault()}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2"><FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><p className="truncate text-[11px] font-semibold text-foreground">Conferir importação</p><p className="truncate text-[10px] text-muted-foreground">{fileName} · {rows.length} lançamentos · {accountName}</p></div></div>
        <button type="button" onClick={reset} className="rounded p-1 text-muted-foreground hover:bg-white/[0.05] hover:text-foreground" aria-label="Cancelar importação"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {rows.map((row, index) => <div key={`${row.date}-${index}`} className="grid gap-1.5 rounded-md border border-border/60 bg-background/60 p-2 sm:grid-cols-[1.5fr_0.7fr_0.7fr_0.85fr]">
          <input value={row.description} onChange={(event) => updateRow(index, { description: event.target.value })} aria-label="Descrição" className="min-w-0 rounded border border-border bg-background px-2 py-1.5 text-[10px] text-foreground outline-none focus:border-primary" />
          <StatementSelect value={row.category} onChange={(value) => updateRow(index, { category: value })} options={FINANCIAL_CATEGORIES.map((category) => [category, category] as [string, string])} />
          <label className="flex min-w-0 items-center rounded border border-border bg-background px-2 focus-within:border-primary"><span className="mr-1 text-[10px] text-muted-foreground">R$</span><input value={row.amount} onChange={(event) => updateRow(index, { amount: Math.abs(Number(event.target.value.replace(',', '.')) || 0) })} type="number" min="0" step="0.01" aria-label="Valor" className="min-w-0 w-full bg-transparent py-1.5 text-[10px] text-foreground outline-none" /></label>
          <div className="flex gap-1.5"><StatementSelect value={row.type} onChange={(value) => updateRow(index, { type: value as FinancialTransaction['type'] })} options={[["expense", "Despesa"], ["income", "Receita"]]} /><input value={row.date} onChange={(event) => updateRow(index, { date: event.target.value })} type="date" aria-label="Data" className="min-w-0 w-[105px] rounded border border-border bg-background px-1.5 py-1.5 text-[10px] text-foreground outline-none focus:border-primary" /></div>
        </div>)}
      </div>
      <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={reset} className="rounded-md px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-white/[0.05]">Cancelar</button><button type="button" onClick={() => { onImport(rows); reset(); }} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground hover:opacity-90"><Check className="h-3.5 w-3.5" /> Importar lançamentos</button></div>
    </div>
  );

  return <div className="mt-3">
    <input ref={inputRef} type="file" accept=".csv,.ofx,text/csv,application/x-ofx" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
    <button type="button" onClick={openPicker} className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/25 bg-primary/[0.05] px-3 py-2 text-[10px] font-medium text-primary transition hover:border-primary/50 hover:bg-primary/10"><Upload className="h-3.5 w-3.5" /> Importar extrato</button>
    <p className="mt-1.5 text-[9px] text-muted-foreground">Nubank: CSV ou OFX · confira antes de salvar</p>
    {loading && <p className="mt-1 flex items-center gap-1 text-[10px] text-primary"><Loader2 className="h-3 w-3 animate-spin" /> Lendo arquivo…</p>}
    {error && <p className="mt-1 text-[10px] text-red-300">{error}</p>}
  </div>;
}

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function parseCsv(text: string, account: string): ImportedTransaction[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const delimiter = (lines[0].match(/;/g)?.length || 0) > (lines[0].match(/,/g)?.length || 0) ? ';' : ',';
  const headers = splitCsvLine(lines[0], delimiter).map(normalize);
  const find = (...names: string[]) => headers.findIndex((header) => names.some((name) => header.includes(name)));
  const dateIndex = find('data', 'date', 'dia');
  const descriptionIndex = find('descricao', 'historico', 'description', 'memo', 'nome', 'title');
  const amountIndex = find('valor', 'amount', 'value');
  const creditIndex = find('credito', 'credit');
  const debitIndex = find('debito', 'debit');
  if (dateIndex < 0 || descriptionIndex < 0) return [];
  return lines.slice(1).map((line) => splitCsvLine(line, delimiter)).map((values) => {
    const credit = creditIndex >= 0 ? parseMoney(values[creditIndex]) : 0;
    const debit = debitIndex >= 0 ? parseMoney(values[debitIndex]) : 0;
    const rawAmount = amountIndex >= 0 ? parseMoney(values[amountIndex]) : credit || -debit;
    const expense = debit > 0 || rawAmount < 0;
    const amount = Math.abs(rawAmount || credit || debit);
    return { description: (values[descriptionIndex] || 'Lançamento importado').trim(), amount, type: expense ? 'expense' : 'income', category: 'Importado', account, status: 'paid', date: parseDate(values[dateIndex]) } as ImportedTransaction;
  }).filter((row) => row.amount > 0 && row.date);
}

function parseOfx(text: string, account: string): ImportedTransaction[] {
  return [...text.matchAll(/<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>))/gi)].map((match) => {
    const block = match[1];
    const read = (tag: string) => block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i'))?.[1]?.trim() || '';
    const amount = parseMoney(read('TRNAMT'));
    return { description: read('NAME') || read('MEMO') || 'Lançamento importado', amount: Math.abs(amount), type: amount < 0 ? 'expense' : 'income', category: 'Importado', account, status: 'paid', date: parseDate(read('DTPOSTED')) } as ImportedTransaction;
  }).filter((row) => row.amount > 0 && row.date);
}

function splitCsvLine(line: string, delimiter: string) {
  const values: string[] = []; let current = ''; let quoted = false;
  for (const char of line) { if (char === '"') quoted = !quoted; else if (char === delimiter && !quoted) { values.push(current.trim().replace(/^"|"$/g, '')); current = ''; } else current += char; }
  values.push(current.trim().replace(/^"|"$/g, '')); return values;
}

function parseMoney(value = '') {
  const cleaned = value.replace(/R\$|\s/g, '').replace(/[()]/g, '-');
  if (cleaned.includes(',') && cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) return Number(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
  return Number(cleaned.replace(/,/g, '')) || 0;
}

function parseDate(value = '') {
  const raw = value.trim();
  const br = raw.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (br) return `${br[3].length === 2 ? `20${br[3]}` : br[3]}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`;
  const ofx = raw.match(/^(\d{4})(\d{2})(\d{2})/);
  if (ofx) return `${ofx[1]}-${ofx[2]}-${ofx[3]}`;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return iso ? raw.slice(0, 10) : '';
}

function StatementSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger className="h-7 min-w-0 flex-1 border-primary/20 bg-[#0b1118] px-1.5 text-[9px] text-foreground shadow-none"><SelectValue /></SelectTrigger><SelectContent className="border-primary/25 bg-[#0b1118] text-foreground">{options.map(([optionValue, label]) => <SelectItem key={optionValue} value={optionValue} className="text-[9px] focus:bg-primary/20">{label}</SelectItem>)}</SelectContent></Select>;
}
