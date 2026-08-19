import { useMemo, useState } from 'react';
import { useAppStore, type FinancialTransaction } from '@/store/useAppStore';
import { FinancialChart } from '@/components/charts/FinancialChart';
import { FinancialInsightsCharts } from '@/components/charts/FinancialInsightsCharts';
import { PortfolioPanel } from '@/components/financial/PortfolioPanel';
import { BankStatementImporter } from '@/components/financial/BankStatementImporter';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowDownRight, ArrowUpRight, CalendarDays, Check, MoreVertical, Pencil, Plus, ReceiptText, Trash2, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Financial() {
  const { modules, weeklyData, transactions, addTransaction, addTransactions, updateTransaction, deleteTransaction, openAddModal, duplicateModule, updateModule, deleteModule } = useAppStore();
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all');
  const [accountFilter, setAccountFilter] = useState('all');

  const accounts = modules.filter(m => m.type === 'financial_account');

  const filteredTransactions = useMemo(() => {
    const byAccount = accountFilter === 'all' ? transactions : transactions.filter((transaction) => transaction.account === accountFilter);
    if (period === 'all') return byAccount;
    const days = period === 'week' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return byAccount.filter((transaction) => new Date(`${transaction.date}T12:00:00`) >= cutoff);
  }, [accountFilter, period, transactions]);
  const totalRevenue = filteredTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = filteredTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = totalRevenue - totalExpenses;
  const comparisonWindow = Math.max(1, Math.min(4, Math.floor(weeklyData.length / 2)));
  const currentMonthBalance = weeklyData.slice(-comparisonWindow).reduce((sum, week) => sum + week.revenue - week.expenses, 0);
  const previousMonthBalance = weeklyData.slice(-(comparisonWindow * 2), -comparisonWindow).reduce((sum, week) => sum + week.revenue - week.expenses, 0);
  const currentWeek = weeklyData.at(-1);
  const previousWeek = weeklyData.at(-2);
  const currentWeekBalance = (currentWeek?.revenue || 0) - (currentWeek?.expenses || 0);
  const previousWeekBalance = (previousWeek?.revenue || 0) - (previousWeek?.expenses || 0);

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const revenues = filteredTransactions.filter((transaction) => transaction.type === 'income');
  const expenses = filteredTransactions.filter((transaction) => transaction.type === 'expense');
  const recentTransactions = [...filteredTransactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Tudo calculado a partir dos lançamentos registrados.</p>
      </div>

      <FinancialQuickAdd onAdd={addTransaction} />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3">
        <div><p className="text-xs font-semibold text-foreground">Período dos indicadores</p><p className="mt-0.5 text-[10px] text-muted-foreground">Altere o recorte sem editar os totais manualmente.</p></div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <select value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)} className="h-8 rounded-lg bg-transparent px-2 text-[10px] text-muted-foreground outline-none hover:text-foreground focus:text-foreground"><option value="all">Todas as contas</option>{accounts.map((account) => <option key={account.id} value={account.title}>{account.title}</option>)}</select>
        <div className="flex rounded-xl bg-background/35 p-1 shadow-inner shadow-black/10">
          {([['all', 'Todo o período'], ['month', 'Últimos 30 dias'], ['week', 'Últimos 7 dias']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition ${period === value ? 'bg-primary/15 text-primary shadow-[0_0_12px_#00c9ff12]' : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'}`}>{label}</button>)}
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Receita Total" value={totalRevenue} accent="#10B981" />
        <SummaryCard label="Despesas Totais" value={totalExpenses} accent="#F97316" />
        <SummaryCard label="Saldo" value={balance} accent="#00C9FF" />
        <ComparisonCard
          currentWeek={currentWeekBalance}
          previousWeek={previousWeekBalance}
          currentMonth={currentMonthBalance}
          previousMonth={previousMonthBalance}
        />
      </div>

      <UpcomingFinanceCards
        transactions={filteredTransactions.filter((transaction) => transaction.status === 'pending' && transaction.date >= new Date().toISOString().slice(0, 10))}
        accounts={accounts.map((account) => account.title).filter(Boolean)}
        onAdd={addTransaction}
        onUpdate={updateTransaction}
        onDelete={deleteTransaction}
      />

      <FinancialInsightsCharts />

      <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TransactionPanel
          title="Receitas da conta"
          subtitle={`${revenues.length} recebimentos registrados`}
          transactions={revenues}
          accent="#10B981"
          icon={<ArrowDownLeft className="h-4 w-4" />}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
        />
        <TransactionPanel
          title="Despesas da conta"
          subtitle={`${expenses.length} saÃ­das registradas`}
          transactions={expenses}
          accent="#F97316"
          icon={<ArrowUpRight className="h-4 w-4" />}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
        />
      </div>

      <section className="mb-8 overflow-hidden rounded-lg border border-card-border bg-card">
        <div className="flex items-center justify-between border-b border-[#ffffff0a] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ReceiptText className="h-4 w-4 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Extrato da conta</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">MovimentaÃ§Ãµes recentes de todas as contas</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary">
            <CalendarDays className="h-3.5 w-3.5" /> Filtrar perÃ­odo
          </Button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.6fr_0.8fr_0.85fr_0.8fr_0.8fr_28px] gap-4 border-b border-[#ffffff08] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>DescriÃ§Ã£o</span><span>Categoria</span><span>Conta</span><span>Valor</span><span>Status</span><span />
            </div>
            <div className="divide-y divide-[#ffffff08]">
              {recentTransactions.map((transaction) => <StatementRow key={transaction.id} transaction={transaction} onUpdate={updateTransaction} onDelete={deleteTransaction} />)}
            </div>
          </div>
        </div>
      </section>

      <FinancialChart />

      <PortfolioPanel />

      <div className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Contas</h3>
          <Button
            onClick={() => openAddModal('financial_account')}
            className="bg-primary text-black hover:bg-primary/90"
            data-testid="button-new-account"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {accounts.map((account) => (
              <div
                key={account.id}
                className="relative overflow-hidden bg-background border border-border rounded-lg hover:scale-[1.02] transition-transform duration-200"
                data-testid={`account-${account.id}`}
              >
                <a href={`/financeiro/conta/${account.id}`} className="flex aspect-[1.58/1] w-full items-center justify-center overflow-hidden border-b border-primary/20 bg-card text-[10px] text-muted-foreground">
                  {account.thumbnail ? <img src={account.thumbnail} alt={`CartÃ£o de ${account.title}`} className="h-full w-full object-cover" /> : 'FaÃ§a upload do cartÃ£o'}
                </a>
                <div className="flex items-start justify-between gap-3 border-b border-border/60 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{account.title || 'Conta sem nome'}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{account.accountType || 'Conta financeira'} · {account.currency || 'BRL'}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[9px] text-primary">Ativa</span>
                </div>
                <div className="px-3.5">
                  <BankStatementImporter accountName={account.title || 'Conta financeira'} onImport={addTransactions} />
                </div>
                <div className="flex justify-end p-1.5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-popover-border">
                    <DropdownMenuItem onClick={() => openAddModal('financial_account', account)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateModule(account.id)}>
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateModule(account.id, { status: 'archived' })}>
                      Arquivar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteModule(account.id)}
                      className="text-destructive"
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinancialQuickAdd({ onAdd }: { onAdd: (transaction: Omit<FinancialTransaction, 'id'>) => void }) {
  const [form, setForm] = useState({ type: 'income' as FinancialTransaction['type'], description: '', amount: '', category: 'Geral', account: 'Conta principal', date: new Date().toISOString().slice(0, 10), status: 'paid' as FinancialTransaction['status'] });
  const submit = () => {
    const amount = Number(form.amount.replace(',', '.'));
    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0) return;
    onAdd({ ...form, description: form.description.trim(), amount });
    setForm((current) => ({ ...current, description: '', amount: '' }));
  };
  return <section className="mb-5 rounded-xl border border-primary/20 bg-card/70 p-4 shadow-[0_0_24px_#00c9ff08]">
    <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Novo lançamento</h2><p className="mt-0.5 text-[10px] text-muted-foreground">Registre uma entrada ou saída e os indicadores serão recalculados.</p></div><ReceiptText className="h-4 w-4 text-primary" /></div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[130px_minmax(180px,1.3fr)_130px_minmax(130px,.8fr)_minmax(150px,.9fr)_145px_auto]">
      <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as FinancialTransaction['type'] })} className="h-10 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"><option value="income">Receita</option><option value="expense">Despesa</option></select>
      <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} placeholder="Descrição" className="h-10 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary" />
      <div className="flex h-10 items-center rounded-lg border border-border bg-background px-3 focus-within:border-primary"><span className="mr-1.5 text-xs text-muted-foreground">R$</span><input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} inputMode="decimal" placeholder="0,00" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></div>
      <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Categoria" className="h-10 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary" />
      <input value={form.account} onChange={(event) => setForm({ ...form, account: event.target.value })} placeholder="Conta" className="h-10 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary" />
      <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary" />
      <button type="button" onClick={submit} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"><Plus className="h-3.5 w-3.5" /> Adicionar</button>
    </div>
  </section>;
}

function UpcomingFinanceCards({ transactions, accounts, onAdd, onUpdate, onDelete }: { transactions: FinancialTransaction[]; accounts: string[]; onAdd: (transaction: Omit<FinancialTransaction, 'id'>) => void; onUpdate: (id: string, updates: Partial<FinancialTransaction>) => void; onDelete: (id: string) => void }) {
  return <section className="mb-8 grid gap-4 xl:grid-cols-2">
    <UpcomingFinanceCard kind="income" title="A receber" subtitle="Entradas previstas e recebimentos futuros" accent="#10B981" transactions={transactions.filter((transaction) => transaction.type === 'income')} accounts={accounts} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} />
    <UpcomingFinanceCard kind="expense" title="A pagar" subtitle="Contas, compromissos e pagamentos futuros" accent="#F97316" transactions={transactions.filter((transaction) => transaction.type === 'expense')} accounts={accounts} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} />
  </section>;
}

function UpcomingFinanceCard({ kind, title, subtitle, accent, transactions, accounts, onAdd, onUpdate, onDelete }: { kind: FinancialTransaction['type']; title: string; subtitle: string; accent: string; transactions: FinancialTransaction[]; accounts: string[]; onAdd: (transaction: Omit<FinancialTransaction, 'id'>) => void; onUpdate: (id: string, updates: Partial<FinancialTransaction>) => void; onDelete: (id: string) => void }) {
  const [form, setForm] = useState({ description: '', amount: '', date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10), account: accounts[0] || 'Conta principal' });
  const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const submit = () => {
    const amount = Number(form.amount.replace(',', '.'));
    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0 || !form.date) return;
    onAdd({ description: form.description.trim(), amount, type: kind, category: 'Planejado', account: form.account, status: 'pending', date: form.date });
    setForm((current) => ({ ...current, description: '', amount: '' }));
  };
  return <section className="overflow-hidden rounded-xl border border-card-border bg-card/80" style={{ boxShadow: `0 0 22px ${accent}08` }}>
    <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>Planejamento financeiro</p><h2 className="mt-1 text-base font-semibold text-foreground">{title}</h2><p className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p></div><div className="text-right"><p className="text-lg font-bold" style={{ color: accent }}>{formatCurrency(total)}</p><p className="text-[10px] text-muted-foreground">{transactions.length} previsto(s)</p></div></div>
    <div className="grid gap-2 border-b border-white/[0.06] p-4 sm:grid-cols-[1.5fr_100px_125px_1fr_auto]"><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} placeholder={kind === 'income' ? 'Ex.: recebimento Solar Machine' : 'Ex.: boleto Nubank'} className="h-9 rounded-md border border-border bg-background px-2.5 text-[10px] outline-none focus:border-primary" /><label className="flex h-9 items-center rounded-md border border-border bg-background px-2 focus-within:border-primary"><span className="mr-1 text-[10px] text-muted-foreground">R$</span><input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0,00" inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-[10px] outline-none" /></label><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="h-9 rounded-md border border-border bg-background px-2 text-[10px] outline-none focus:border-primary" /><select value={form.account} onChange={(event) => setForm({ ...form, account: event.target.value })} className="h-9 rounded-md border border-border bg-background px-2 text-[10px] outline-none focus:border-primary"><option value="Conta principal">Conta principal</option>{accounts.map((account) => <option key={account} value={account}>{account}</option>)}</select><button type="button" onClick={submit} className="h-9 rounded-md px-3 text-[10px] font-semibold text-primary-foreground transition hover:opacity-90" style={{ backgroundColor: accent }}>Adicionar</button></div>
    <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.05]">{transactions.length ? transactions.map((transaction) => <div key={transaction.id} className="flex items-center gap-3 px-5 py-3"><div className="min-w-0 flex-1"><input value={transaction.description} onChange={(event) => onUpdate(transaction.id, { description: event.target.value })} className="w-full truncate bg-transparent text-xs text-foreground outline-none focus:border-b focus:border-primary" /><p className="mt-1 text-[10px] text-muted-foreground">{transaction.account} · vence em {formatTransactionDate(transaction.date)}</p></div><label className="flex items-center gap-1"><span className="text-[10px] text-muted-foreground">R$</span><input type="number" value={transaction.amount} onChange={(event) => onUpdate(transaction.id, { amount: Math.max(0, Number(event.target.value) || 0) })} className="w-24 bg-transparent text-right text-xs font-semibold outline-none focus:border-b focus:border-primary" style={{ color: accent }} /></label><select value={transaction.status} onChange={(event) => onUpdate(transaction.id, { status: event.target.value as FinancialTransaction['status'] })} className="rounded bg-background px-1.5 py-1 text-[9px] text-muted-foreground outline-none"><option value="pending">Pendente</option><option value="paid">Baixado</option></select><button type="button" onClick={() => onDelete(transaction.id)} className="text-muted-foreground hover:text-red-300" aria-label={`Excluir ${transaction.description}`}><Trash2 className="h-3.5 w-3.5" /></button></div>) : <p className="px-5 py-6 text-xs text-muted-foreground">Nenhum compromisso futuro registrado.</p>}</div>
  </section>;
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return <div className="rounded-lg border border-card-border bg-card p-5" style={{ boxShadow: `0 0 16px ${accent}08` }}><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="text-2xl font-bold" style={{ color: accent }}>{formatCurrency(value)}</p><p className="mt-2 text-[10px] text-muted-foreground">Calculado pelos lanÃ§amentos registrados</p></div>;
}

function EditableSummaryCard({ label, value, accent, onSave }: { label: string; value: number; accent: string; onSave: (value: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const startEditing = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const save = () => {
    const nextValue = Number(draft.replace(',', '.'));
    if (Number.isFinite(nextValue)) onSave(nextValue);
    setEditing(false);
  };

  return (
    <div className="group rounded-lg border border-card-border bg-card p-5 transition-colors hover:border-primary/40" style={{ boxShadow: `0 0 16px ${accent}08` }}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {!editing && <button type="button" onClick={startEditing} className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100" aria-label={`Editar ${label}`}><Pencil className="h-3.5 w-3.5" /></button>}
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">R$</span>
          <input autoFocus type="text" inputMode="decimal" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') save(); if (event.key === 'Escape') setEditing(false); }} className="min-w-0 flex-1 rounded border border-primary/50 bg-background px-2 py-1 text-lg font-bold text-foreground outline-none" />
          <button type="button" onClick={save} className="text-[#10B981]" aria-label="Salvar valor"><Check className="h-4 w-4" /></button>
          <button type="button" onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground" aria-label="Cancelar ediÃ§Ã£o"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <button type="button" onClick={startEditing} className="text-left text-2xl font-bold transition-colors hover:text-primary" style={{ color: accent }}>
          {formatCurrency(value)}
        </button>
      )}
      <p className="mt-2 text-[10px] text-muted-foreground">Clique no valor para editar</p>
    </div>
  );
}

function ComparisonCard({ currentWeek, previousWeek, currentMonth, previousMonth }: { currentWeek: number; previousWeek: number; currentMonth: number; previousMonth: number }) {
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const current = period === 'week' ? currentWeek : currentMonth;
  const previous = period === 'week' ? previousWeek : previousMonth;
  const change = getPercentageChange(current, previous);
  const isPositive = change > 0;
  const isNeutral = change === 0;
  const accent = isNeutral ? '#94A3B8' : isPositive ? '#10B981' : '#F97316';

  return (
    <div className="rounded-lg border border-card-border bg-card p-5" style={{ boxShadow: `0 0 16px ${accent}08` }}>
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Comparativo</p><p className="mt-1 text-[10px] text-muted-foreground">Saldo combinado do perÃ­odo</p></div>
        <div className="flex rounded-md border border-[#ffffff10] bg-background p-0.5">
          <button type="button" onClick={() => setPeriod('week')} className={`rounded px-2 py-1 text-[10px] ${period === 'week' ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}`}>Semanal</button>
          <button type="button" onClick={() => setPeriod('month')} className={`rounded px-2 py-1 text-[10px] ${period === 'month' ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}`}>Mensal</button>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2" style={{ color: accent }}>
        <span className="text-2xl font-bold">{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
        {!isNeutral && (isPositive ? <ArrowUpRight className="mb-1 h-5 w-5" /> : <ArrowDownRight className="mb-1 h-5 w-5" />)}
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">vs. {period === 'week' ? 'semana' : 'mÃªs'} anterior</p>
      <div className="mt-3 flex items-center justify-between border-t border-[#ffffff0a] pt-3 text-[10px] text-muted-foreground"><span>Atual <strong className="ml-1 text-foreground">{formatCurrency(current)}</strong></span><span>Anterior <strong className="ml-1 text-foreground">{formatCurrency(previous)}</strong></span></div>
    </div>
  );
}

function ComparisonPill({ label, value }: { label: string; value: number }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const color = isNeutral ? '#94A3B8' : isPositive ? '#10B981' : '#F97316';
  const Icon = isNeutral ? null : isPositive ? ArrowUpRight : ArrowDownRight;
  return <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.07] bg-background px-2 py-1 text-[10px]" style={{ color }}><span>{label}</span>{Icon && <Icon className="h-3 w-3" />}<strong>{isPositive ? '+' : ''}{value.toFixed(1)}%</strong></span>;
}

function getPercentageChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function TransactionPanel({ title, subtitle, transactions, accent, icon, onUpdate, onDelete }: { title: string; subtitle: string; transactions: FinancialTransaction[]; accent: string; icon: React.ReactNode; onUpdate: (id: string, updates: Partial<FinancialTransaction>) => void; onDelete: (id: string) => void }) {
  const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const latest = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <section className="overflow-hidden rounded-lg border border-card-border bg-card">
      <div className="flex items-center justify-between border-b border-[#ffffff0a] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md" style={{ color: accent, backgroundColor: `${accent}18`, boxShadow: `0 0 12px ${accent}18` }}>{icon}</span>
          <div><h2 className="text-sm font-semibold text-foreground">{title}</h2><p className="text-[11px] text-muted-foreground">{subtitle}</p></div>
        </div>
        <p className="text-base font-bold" style={{ color: accent }}>{formatCurrency(total)}</p>
      </div>
      <div className="divide-y divide-[#ffffff08]">
        {latest.map((transaction) => <div key={transaction.id} className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02]"><div className="min-w-0"><input value={transaction.description} onChange={(event) => onUpdate(transaction.id, { description: event.target.value })} className="w-full truncate bg-transparent text-xs font-medium text-foreground outline-none focus:border-b focus:border-primary" /><p className="mt-1 text-[10px] text-muted-foreground">{transaction.category} · {transaction.account}</p></div><div className="flex shrink-0 items-center gap-2 text-right"><div><label className="flex items-center justify-end gap-1"><span className="text-[10px] text-muted-foreground">R$</span><input type="number" min="0" value={transaction.amount} onChange={(event) => onUpdate(transaction.id, { amount: Math.max(0, Number(event.target.value) || 0) })} className="w-24 bg-transparent text-right text-xs font-semibold outline-none focus:border-b focus:border-primary" style={{ color: accent }} /></label><p className="mt-1 text-[10px] text-muted-foreground">{formatTransactionDate(transaction.date)}</p></div><button type="button" onClick={() => onDelete(transaction.id)} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-300" aria-label={`Excluir ${transaction.description}`}><Trash2 className="h-3.5 w-3.5" /></button></div></div>)}
        {latest.length === 0 && <p className="px-5 py-6 text-xs text-muted-foreground">Nenhuma movimentaÃ§Ã£o registrada.</p>}
      </div>
      <div className="border-t border-[#ffffff0a] px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Ver todas as {title.toLowerCase()} <span className="ml-1 text-primary">â†’</span></div>
    </section>
  );
}

function StatementRow({ transaction, onUpdate, onDelete }: { transaction: FinancialTransaction; onUpdate: (id: string, updates: Partial<FinancialTransaction>) => void; onDelete: (id: string) => void }) {
  const isIncome = transaction.type === 'income';
  const statusStyles = transaction.status === 'paid'
    ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
    : transaction.status === 'pending'
      ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
      : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';
  const statusLabels = { paid: 'Pago', pending: 'Pendente', refunded: 'Estornado' };

  return <div className="grid grid-cols-[1.6fr_0.8fr_0.85fr_0.8fr_0.8fr_28px] items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02]"><div className="flex items-center gap-2.5"><span className={`flex h-7 w-7 items-center justify-center rounded-full ${isIncome ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F97316]/10 text-[#F97316]'}`}>{isIncome ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}</span><div><input value={transaction.description} onChange={(event) => onUpdate(transaction.id, { description: event.target.value })} className="w-full bg-transparent text-xs font-medium text-foreground outline-none focus:border-b focus:border-primary" /><p className="mt-0.5 text-[10px] text-muted-foreground">{formatTransactionDate(transaction.date)}</p></div></div><input value={transaction.category} onChange={(event) => onUpdate(transaction.id, { category: event.target.value })} className="min-w-0 truncate bg-transparent text-[11px] text-muted-foreground outline-none focus:border-b focus:border-primary" /><input value={transaction.account} onChange={(event) => onUpdate(transaction.id, { account: event.target.value })} className="min-w-0 truncate bg-transparent text-[11px] text-muted-foreground outline-none focus:border-b focus:border-primary" /><label className="flex items-center gap-1"><span className="text-[10px] text-muted-foreground">R$</span><input type="number" min="0" value={transaction.amount} onChange={(event) => onUpdate(transaction.id, { amount: Math.max(0, Number(event.target.value) || 0) })} className={`w-full bg-transparent text-xs font-semibold outline-none focus:border-b focus:border-primary ${isIncome ? 'text-[#10B981]' : 'text-[#F97316]'}`} /></label><select value={transaction.status} onChange={(event) => onUpdate(transaction.id, { status: event.target.value as FinancialTransaction['status'] })} className={`w-fit rounded border bg-transparent px-2 py-1 text-[10px] font-medium outline-none ${statusStyles}`}><option value="paid">Pago</option><option value="pending">Pendente</option><option value="refunded">Estornado</option></select><button type="button" onClick={() => onDelete(transaction.id)} className="text-muted-foreground hover:text-red-300" aria-label={`Excluir ${transaction.description}`}><Trash2 className="h-4 w-4" /></button></div>;
}

function formatTransactionDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(date));
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
