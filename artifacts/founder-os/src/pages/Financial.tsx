import { useMemo, useState } from 'react';
import { FINANCIAL_CATEGORIES, useAppStore, type FinancialTransaction } from '@/store/useAppStore';
import { FinancialChart } from '@/components/charts/FinancialChart';
import { FinancialInsightsCharts } from '@/components/charts/FinancialInsightsCharts';
import { PortfolioPanel } from '@/components/financial/PortfolioPanel';
import { BankStatementImporter } from '@/components/financial/BankStatementImporter';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownLeft, ArrowDownRight, ArrowUpRight, CalendarDays, Check, MoreVertical, Pencil, Plus, ReceiptText, Trash2, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const INCOME_CATEGORIES = ['Renda', 'Serviços', 'Vendas', 'Projetos', 'Investimentos', 'Transferências', 'Empréstimos recebidos', 'Outras receitas'];
const EXPENSE_CATEGORIES = ['Alimentação', 'Animais de estimação', 'Assinaturas', 'Compras', 'Contas', 'Cuidados pessoais', 'Doações', 'Educação', 'Empréstimos', 'Entretenimento', 'Esporte', 'Gastos diversos', 'Impostos', 'Investimentos', 'Mercado', 'Moradia', 'Saúde', 'Seguros', 'Serviços', 'Tarifas financeiras', 'Transferências', 'Transporte', 'Viagem', 'Não categorizado'];

export default function Financial() {
  const { modules, weeklyData, transactions, addTransaction, addTransactions, updateTransaction, deleteTransaction, openAddModal, duplicateModule, updateModule, deleteModule } = useAppStore();
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all');
  const [statementPeriod, setStatementPeriod] = useState<'all' | 'month' | 'week'>('all');
  const [statementSort, setStatementSort] = useState<'date' | 'description' | 'category' | 'account' | 'amount'>('date');
  const [statementSortDirection, setStatementSortDirection] = useState<'asc' | 'desc'>('desc');
  const [accountFilter, setAccountFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const accounts = modules.filter(m => m.type === 'financial_account');
  const accountBalances = useMemo(() => new Map(accounts.map((account) => {
    const accountTransactions = transactions.filter((transaction) => transaction.accountId === account.id || (!transaction.accountId && transaction.account === account.title));
    const movementTotal = accountTransactions.reduce((sum, transaction) => {
      if (transaction.status === 'pending') return sum;
      if (transaction.type === 'income') return sum + transaction.amount;
      return sum + (transaction.status === 'refunded' ? transaction.amount : -transaction.amount);
    }, 0);
    return [account.id, (account.balance || 0) + movementTotal] as const;
  })), [accounts, transactions]);

  const filteredTransactions = useMemo(() => {
    const selectedAccount = accounts.find((account) => account.title === accountFilter);
    const byAccount = accountFilter === 'all' ? transactions : transactions.filter((transaction) => selectedAccount && (transaction.accountId === selectedAccount.id || transaction.account === selectedAccount.title));
    const byCategory = categoryFilter === 'all' ? byAccount : byAccount.filter((transaction) => transaction.category === categoryFilter);
    if (period === 'all') return byCategory;
    const days = period === 'week' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return byCategory.filter((transaction) => new Date(`${transaction.date}T12:00:00`) >= cutoff);
  }, [accountFilter, categoryFilter, period, transactions]);
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

  const revenues = filteredTransactions.filter((transaction) => transaction.type === 'income');
  const expenses = filteredTransactions.filter((transaction) => transaction.type === 'expense');
  const recentTransactions = [...filteredTransactions].sort((a, b) => b.date.localeCompare(a.date));
  const statementTransactions = useMemo(() => {
    let scoped = recentTransactions;
    if (statementPeriod !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (statementPeriod === 'week' ? 7 : 30));
      scoped = recentTransactions.filter((transaction) => new Date(`${transaction.date}T12:00:00`) >= cutoff);
    }
    return [...scoped].sort((a, b) => {
      const result = statementSort === 'amount'
        ? a.amount - b.amount
        : statementSort === 'description'
          ? a.description.localeCompare(b.description, 'pt-BR')
          : statementSort === 'category'
            ? a.category.localeCompare(b.category, 'pt-BR')
            : statementSort === 'account'
              ? a.account.localeCompare(b.account, 'pt-BR')
              : a.date.localeCompare(b.date);
      return statementSortDirection === 'asc' ? result : -result;
    });
  }, [recentTransactions, statementPeriod, statementSort, statementSortDirection]);

  const toggleStatementSort = (sort: typeof statementSort) => {
    if (sort === statementSort) setStatementSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
    else {
      setStatementSort(sort);
      setStatementSortDirection('asc');
    }
  };

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
          <StyledSelect value={accountFilter} onChange={setAccountFilter} options={[['all', 'Todas as contas'], ...accounts.map((account) => [account.title, account.title] as [string, string])]} />
          <StyledSelect value={categoryFilter} onChange={setCategoryFilter} options={[['all', 'Todas as categorias'], ...FINANCIAL_CATEGORIES.map((category) => [category, category] as [string, string])]} className="max-w-[180px]" />
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
          categoryOptions={INCOME_CATEGORIES}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
        />
        <TransactionPanel
          title="Despesas da conta"
          subtitle={`${expenses.length} saídas registradas`}
          transactions={expenses}
          accent="#F97316"
          icon={<ArrowUpRight className="h-4 w-4" />}
          categoryOptions={EXPENSE_CATEGORIES}
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
              <p className="mt-0.5 text-[11px] text-muted-foreground">Movimentações recentes de todas as contas</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary"><CalendarDays className="h-3.5 w-3.5" /><StyledSelect value={statementPeriod} onChange={(value) => setStatementPeriod(value as typeof statementPeriod)} options={[["all", "Todo o período"], ["month", "Últimos 30 dias"], ["week", "Últimos 7 dias"]]} /></div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.6fr_0.85fr_0.9fr_0.85fr_0.9fr_28px] gap-4 border-b border-[#ffffff08] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {([['description', 'Descrição'], ['date', 'Data'], ['category', 'Categoria'], ['account', 'Conta'], ['amount', 'Valor']] as const).map(([sort, label]) => <button key={sort} type="button" onClick={() => toggleStatementSort(sort)} className="text-left transition-colors hover:text-primary">{label}{statementSort === sort ? <span className="ml-1 text-primary">{statementSortDirection === 'asc' ? '↑' : '↓'}</span> : null}</button>)}<span />
            </div>
            <div className="max-h-[560px] overflow-y-auto overscroll-contain divide-y divide-[#ffffff08] [scrollbar-color:rgba(0,201,255,.45)_rgba(255,255,255,.04)] [scrollbar-width:thin]">
              {statementTransactions.map((transaction) => <StatementRow key={transaction.id} transaction={transaction} categoryOptions={Array.from(new Set([...FINANCIAL_CATEGORIES, ...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]))} accountOptions={accounts.map((account) => account.title).filter(Boolean)} onUpdate={updateTransaction} onDelete={deleteTransaction} />)}
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
                  {account.thumbnail ? <img src={account.thumbnail} alt={`Cartão de ${account.title}`} className="h-full w-full object-cover" /> : 'Faça upload do cartão'}
                </a>
                <div className="flex items-start justify-between gap-3 border-b border-border/60 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{account.title || 'Conta sem nome'}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{account.accountType || 'Conta financeira'} · {account.currency || 'BRL'}</p>
                  </div>
                  <div className="shrink-0 text-right"><p className="text-sm font-bold text-primary">{formatCurrency(accountBalances.get(account.id) || 0)}</p><span className="text-[9px] uppercase tracking-wider text-muted-foreground">Saldo atual</span></div>
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
  const [form, setForm] = useState({ type: 'income' as FinancialTransaction['type'], description: '', amount: '', category: 'Não categorizado', account: 'Conta principal', date: new Date().toISOString().slice(0, 10), status: 'paid' as FinancialTransaction['status'] });
  const submit = () => {
    const amount = parseCurrency(form.amount);
    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0) return;
    onAdd({ ...form, description: form.description.trim(), amount });
    setForm((current) => ({ ...current, description: '', amount: '' }));
  };
  return <section className="mb-5 rounded-xl border border-primary/20 bg-card/70 p-4 shadow-[0_0_24px_#00c9ff08]">
    <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Novo lançamento</h2><p className="mt-0.5 text-[10px] text-muted-foreground">Registre uma entrada ou saída e os indicadores serão recalculados.</p></div><ReceiptText className="h-4 w-4 text-primary" /></div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[130px_minmax(180px,1.3fr)_130px_minmax(130px,.8fr)_minmax(150px,.9fr)_145px_auto]">
      <StyledSelect value={form.type} onChange={(value) => setForm({ ...form, type: value as FinancialTransaction['type'] })} options={[["income", "Receita"], ["expense", "Despesa"]]} className="h-10" />
      <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} placeholder="Descrição" className="h-10 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary" />
      <div className="flex h-10 items-center rounded-lg border border-border bg-background px-3 focus-within:border-primary"><span className="mr-1.5 text-xs text-muted-foreground">R$</span><input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} inputMode="decimal" placeholder="0,00" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></div>
      <StyledSelect value={form.category} onChange={(value) => setForm({ ...form, category: value })} options={FINANCIAL_CATEGORIES.map((category) => [category, category] as [string, string])} className="h-10" />
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
  const [form, setForm] = useState({ description: '', amount: '', category: kind === 'income' ? 'Renda' : 'Não categorizado', date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10), account: accounts[0] || 'Conta principal' });
  const [categoryOptions, setCategoryOptions] = useState(kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES);
  const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const submit = () => {
    const amount = parseCurrency(form.amount);
    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0 || !form.date) return;
    onAdd({ description: form.description.trim(), amount, type: kind, category: form.category, account: form.account, status: 'pending', date: form.date });
    setForm((current) => ({ ...current, description: '', amount: '' }));
  };
  const addCategory = () => {
    const name = window.prompt('Nome da nova categoria');
    if (!name?.trim()) return;
    const category = name.trim();
    setCategoryOptions((current) => current.includes(category) ? current : [...current, category]);
    setForm((current) => ({ ...current, category }));
  };
  return <section className="overflow-hidden rounded-xl border border-card-border bg-card/80" style={{ boxShadow: `0 0 22px ${accent}08` }}>
    <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>Planejamento financeiro</p><h2 className="mt-1 text-base font-semibold text-foreground">{title}</h2><p className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p></div><div className="text-right"><p className="text-lg font-bold" style={{ color: accent }}>{formatCurrency(total)}</p><p className="text-[10px] text-muted-foreground">{transactions.length} previsto(s)</p></div></div>
    <div className="grid gap-2 border-b border-white/[0.06] p-4 sm:grid-cols-[1.35fr_100px_1fr_125px_1fr_auto]"><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} placeholder={kind === 'income' ? 'Ex.: recebimento Solar Machine' : 'Ex.: boleto Nubank'} className="h-9 rounded-md border border-border bg-background px-2.5 text-[10px] outline-none focus:border-primary" /><label className="flex h-9 items-center rounded-md border border-border bg-background px-2 focus-within:border-primary"><span className="mr-1 text-[10px] text-muted-foreground">R$</span><input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0,00" inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-[10px] outline-none" /></label><StyledSelect value={form.category} onChange={(value) => value === '__add__' ? addCategory() : setForm({ ...form, category: value })} options={categoryOptions.map((category) => [category, category] as [string, string])} onAddOption={addCategory} className="h-9" /><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="h-9 rounded-md border border-border bg-background px-2 text-[10px] outline-none focus:border-primary" /><StyledSelect value={form.account} onChange={(value) => setForm({ ...form, account: value })} options={['Conta principal', ...accounts].map((account) => [account, account] as [string, string])} className="h-9" /><button type="button" onClick={submit} className="h-9 rounded-md px-3 text-[10px] font-semibold text-primary-foreground transition hover:opacity-90" style={{ backgroundColor: accent }}>Adicionar</button></div>
    <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.05]"><div className="hidden grid-cols-[minmax(150px,1.5fr)_92px_minmax(110px,1fr)_minmax(90px,0.9fr)_112px_92px_20px] gap-2 px-5 pb-1 pt-3 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid"><span>Descrição</span><span>Data</span><span>Categoria</span><span>Conta</span><span className="text-right">Valor</span><span>Status</span><span /></div>{transactions.length ? transactions.map((transaction) => <div key={transaction.id} className="grid items-center gap-2 px-5 py-3 sm:grid-cols-[minmax(150px,1.5fr)_92px_minmax(110px,1fr)_minmax(90px,0.9fr)_112px_92px_20px]"><input value={transaction.description} onChange={(event) => onUpdate(transaction.id, { description: event.target.value })} className="min-w-0 truncate bg-transparent text-xs text-foreground outline-none focus:border-b focus:border-primary" aria-label="Descrição" /><span className="text-[10px] text-muted-foreground">{formatTransactionDate(transaction.date)}</span><span className="truncate text-[10px] text-muted-foreground" title={transaction.category}>{transaction.category}</span><span className="truncate text-[10px] text-muted-foreground" title={transaction.account}>{transaction.account}</span><label className="flex items-center gap-1"><span className="text-[10px] text-muted-foreground">R$</span><input type="text" inputMode="decimal" value={formatCurrency(transaction.amount)} onFocus={(event) => event.currentTarget.select()} onChange={(event) => onUpdate(transaction.id, { amount: parseCurrency(event.target.value) })} className="min-w-0 w-full bg-transparent text-right text-xs font-semibold outline-none focus:border-b focus:border-primary" style={{ color: accent }} aria-label="Valor" /></label><StyledSelect value={transaction.status} onChange={(value) => onUpdate(transaction.id, { status: value as FinancialTransaction['status'] })} options={[["pending", "Pendente"], ["paid", "Baixado"]]} compact /><button type="button" onClick={() => onDelete(transaction.id)} className="text-muted-foreground hover:text-red-300" aria-label={`Excluir ${transaction.description}`}><Trash2 className="h-3.5 w-3.5" /></button></div>) : <p className="px-5 py-6 text-xs text-muted-foreground">Nenhum compromisso futuro registrado.</p>}</div>
  </section>;
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return <div className="rounded-lg border border-card-border bg-card p-5" style={{ boxShadow: `0 0 16px ${accent}08` }}><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="text-2xl font-bold" style={{ color: accent }}>{formatCurrency(value)}</p><p className="mt-2 text-[10px] text-muted-foreground">Calculado pelos lançamentos registrados</p></div>;
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
          <button type="button" onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground" aria-label="Cancelar edição"><X className="h-4 w-4" /></button>
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
        <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Comparativo</p><p className="mt-1 text-[10px] text-muted-foreground">Saldo combinado do período</p></div>
        <div className="flex rounded-md border border-[#ffffff10] bg-background p-0.5">
          <button type="button" onClick={() => setPeriod('week')} className={`rounded px-2 py-1 text-[10px] ${period === 'week' ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}`}>Semanal</button>
          <button type="button" onClick={() => setPeriod('month')} className={`rounded px-2 py-1 text-[10px] ${period === 'month' ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}`}>Mensal</button>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2" style={{ color: accent }}>
        <span className="text-2xl font-bold">{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
        {!isNeutral && (isPositive ? <ArrowUpRight className="mb-1 h-5 w-5" /> : <ArrowDownRight className="mb-1 h-5 w-5" />)}
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">vs. {period === 'week' ? 'semana' : 'mês'} anterior</p>
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

function TransactionPanel({ title, subtitle, transactions, accent, icon, categoryOptions, onUpdate, onDelete }: { title: string; subtitle: string; transactions: FinancialTransaction[]; accent: string; icon: React.ReactNode; categoryOptions: string[]; onUpdate: (id: string, updates: Partial<FinancialTransaction>) => void; onDelete: (id: string) => void }) {
  const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const latest = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const [editableCategories, setEditableCategories] = useState(categoryOptions);
  const addCategory = (transactionId: string) => {
    const name = window.prompt('Nome da nova categoria');
    if (!name?.trim()) return;
    const category = name.trim();
    setEditableCategories((current) => current.includes(category) ? current : [...current, category]);
    onUpdate(transactionId, { category });
  };

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
        {latest.map((transaction) => <TransactionPanelRow key={transaction.id} transaction={transaction} accent={accent} editableCategories={editableCategories} onUpdate={onUpdate} onDelete={onDelete} onAddCategory={addCategory} />)}
        {latest.length === 0 && <p className="px-5 py-6 text-xs text-muted-foreground">Nenhuma movimentação registrada.</p>}
      </div>
      <div className="border-t border-[#ffffff0a] px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Ver todas as {title.toLowerCase()} <span className="ml-1 text-primary">→</span></div>
    </section>
  );
}

function TransactionPanelRow({ transaction, accent, editableCategories, onUpdate, onDelete, onAddCategory }: { transaction: FinancialTransaction; accent: string; editableCategories: string[]; onUpdate: (id: string, updates: Partial<FinancialTransaction>) => void; onDelete: (id: string) => void; onAddCategory: (id: string) => void }) {
  const [editingCategory, setEditingCategory] = useState(false);
  const accountTone = getAccountTone(transaction.account);
  const categories = [...editableCategories, transaction.category].filter((category, index, all) => all.indexOf(category) === index).map((category) => [category, category] as [string, string]);
  return <div className="grid items-center gap-3 px-5 py-3 sm:grid-cols-[minmax(140px,1.3fr)_minmax(135px,1fr)_minmax(85px,0.7fr)_145px_20px]"><input value={transaction.description} onChange={(event) => onUpdate(transaction.id, { description: event.target.value })} className="min-w-0 truncate bg-transparent text-xs font-medium text-foreground outline-none focus:border-b focus:border-primary" aria-label="Descrição" />{editingCategory ? <StyledSelect value={transaction.category} onChange={(value) => { if (value === '__add__') onAddCategory(transaction.id); else { onUpdate(transaction.id, { category: value }); setEditingCategory(false); } }} options={categories} onAddOption={() => onAddCategory(transaction.id)} compact /> : <button type="button" onClick={() => setEditingCategory(true)} className="min-w-0 truncate text-left text-[10px] text-muted-foreground transition-colors hover:text-primary" title="Clique para alterar a categoria">{transaction.category}</button>}<span className="inline-flex min-w-0 max-w-full items-center truncate rounded-full border px-2.5 py-1 text-[10px] font-medium" style={{ color: accountTone.foreground, backgroundColor: accountTone.background, borderColor: accountTone.border }} title={`Conta de origem: ${transaction.account}`}>{transaction.account}</span><div className="text-right"><label className="flex items-center justify-end gap-1"><span className="text-[10px] text-muted-foreground">R$</span><input type="text" inputMode="decimal" value={formatCurrency(transaction.amount)} onFocus={(event) => event.currentTarget.select()} onChange={(event) => onUpdate(transaction.id, { amount: parseCurrency(event.target.value) })} className="w-32 bg-transparent text-right text-xs font-semibold outline-none focus:border-b focus:border-primary" style={{ color: accent }} aria-label="Valor" /></label><p className="mt-1 text-[10px] text-muted-foreground">{formatTransactionDate(transaction.date)}</p></div><button type="button" onClick={() => onDelete(transaction.id)} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-300" aria-label={`Excluir ${transaction.description}`}><Trash2 className="h-3.5 w-3.5" /></button></div>;
}

function StatementRow({ transaction, categoryOptions, accountOptions, onUpdate, onDelete }: { transaction: FinancialTransaction; categoryOptions: string[]; accountOptions: string[]; onUpdate: (id: string, updates: Partial<FinancialTransaction>) => void; onDelete: (id: string) => void }) {
  const isIncome = transaction.type === 'income';
  const [editingCategory, setEditingCategory] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const accountTone = getAccountTone(transaction.account);
  const categories = Array.from(new Set([transaction.category, ...categoryOptions])).map((category) => [category, category] as [string, string]);
  const accounts = Array.from(new Set([transaction.account, ...accountOptions])).map((account) => [account, account] as [string, string]);
  return <div className="grid grid-cols-[1.6fr_0.85fr_0.9fr_0.85fr_0.9fr_28px] items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02]"><div className="flex min-w-0 items-center gap-2.5"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isIncome ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F97316]/10 text-[#F97316]'}`}>{isIncome ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}</span><input value={transaction.description} onChange={(event) => onUpdate(transaction.id, { description: event.target.value })} className="min-w-0 w-full truncate bg-transparent text-xs font-medium text-foreground outline-none focus:border-b focus:border-primary" /></div><span className="text-[10px] text-muted-foreground">{formatTransactionDate(transaction.date)}</span>{editingCategory ? <StyledSelect value={transaction.category} onChange={(value) => { onUpdate(transaction.id, { category: value }); setEditingCategory(false); }} options={categories} compact /> : <button type="button" onClick={() => setEditingCategory(true)} className="min-w-0 truncate text-left text-[11px] text-muted-foreground transition-colors hover:text-primary" title="Clique para alterar a categoria">{transaction.category}</button>}{editingAccount ? <StyledSelect value={transaction.account} onChange={(value) => { onUpdate(transaction.id, { account: value }); setEditingAccount(false); }} options={accounts} compact /> : <button type="button" onClick={() => setEditingAccount(true)} className="inline-flex min-w-0 max-w-full items-center truncate rounded-full border px-2.5 py-1 text-left text-[10px] font-medium transition hover:brightness-125" style={{ color: accountTone.foreground, backgroundColor: accountTone.background, borderColor: accountTone.border }} title="Clique para alterar a conta">{transaction.account}</button>}<label className="flex items-center justify-end gap-1"><span className="text-[10px] text-muted-foreground">R$</span><input type="text" inputMode="decimal" value={formatCurrency(transaction.amount)} onFocus={(event) => event.currentTarget.select()} onChange={(event) => onUpdate(transaction.id, { amount: parseCurrency(event.target.value) })} className={`min-w-0 w-full bg-transparent text-right text-xs font-semibold outline-none focus:border-b focus:border-primary ${isIncome ? 'text-[#10B981]' : 'text-[#F97316]'}`} /></label><button type="button" onClick={() => onDelete(transaction.id)} className="text-muted-foreground hover:text-red-300" aria-label={`Excluir ${transaction.description}`}><Trash2 className="h-4 w-4" /></button></div>;
}

function getAccountTone(account: string) {
  const normalized = account.toLowerCase();
  if (normalized.includes('nubank')) return { foreground: '#C084FC', background: '#A855F714', border: '#A855F755' };
  if (normalized.includes('banco do brasil') || normalized.includes('brasil')) return { foreground: '#F5C451', background: '#F5B94214', border: '#F5B94255' };
  if (normalized.includes('xp')) return { foreground: '#FACC15', background: '#FACC1514', border: '#FACC1555' };
  if (normalized.includes('inter')) return { foreground: '#FB923C', background: '#F9731614', border: '#F9731655' };
  return { foreground: '#67E8F9', background: '#06B6D414', border: '#06B6D455' };
}

function formatTransactionDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(date));
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseCurrency(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  return Math.max(0, Number(normalized) || 0);
}

function StyledSelect({ value, onChange, options, className = '', compact = false, onAddOption }: { value: string; onChange: (value: string) => void; options: [string, string][]; className?: string; compact?: boolean; onAddOption?: () => void }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger className={`border-primary/20 bg-[#0b1118]/90 text-[10px] text-foreground shadow-none hover:border-primary/45 focus:ring-1 focus:ring-primary/30 ${compact ? 'h-7 min-w-[88px] px-2 py-1 text-[9px]' : 'h-8 min-w-[128px] px-2.5 py-1.5'} ${className}`}><SelectValue /></SelectTrigger><SelectContent className="border-primary/25 bg-[#0b1118] text-foreground shadow-[0_12px_35px_#0009]">{options.map(([optionValue, label]) => <SelectItem key={optionValue} value={optionValue} className="py-2 text-[10px] focus:bg-primary/20 focus:text-primary">{label}</SelectItem>)}{onAddOption && <SelectItem value="__add__" className="mt-1 border-t border-primary/15 py-2 text-[10px] font-semibold text-primary focus:bg-primary/20 focus:text-primary">＋ Adicionar categoria</SelectItem>}</SelectContent></Select>;
}
