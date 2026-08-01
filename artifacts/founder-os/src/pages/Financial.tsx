import { useAppStore } from '@/store/useAppStore';
import { FinancialChart } from '@/components/charts/FinancialChart';
import { Button } from '@/components/ui/button';
import { MoreVertical, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Financial() {
  const { modules, weeklyData, openAddModal, duplicateModule, updateModule, deleteModule } = useAppStore();

  const accounts = modules.filter(m => m.type === 'financial_account');

  const totalRevenue = weeklyData.reduce((sum, week) => sum + week.revenue, 0);
  const totalExpenses = weeklyData.reduce((sum, week) => sum + week.expenses, 0);
  const balance = totalRevenue - totalExpenses;

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Financeiro</h1>
        <p className="text-sm text-muted-foreground">
          Visão completa das suas finanças
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-card-border rounded-lg p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Receita Total
          </p>
          <p className="text-2xl font-bold text-foreground">
            R$ {totalRevenue.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Despesas Totais
          </p>
          <p className="text-2xl font-bold text-foreground">
            R$ {totalExpenses.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Saldo
          </p>
          <p className="text-2xl font-bold text-chart-2">
            R$ {balance.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      <FinancialChart />

      <div className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Contas</h3>
          <Button
            onClick={() => openAddModal('financial_account')}
            className="bg-primary hover:bg-primary/90"
            data-testid="button-new-account"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>

        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:scale-[1.005] transition-transform duration-200"
              data-testid={`account-${account.id}`}
            >
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{account.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {account.accountType} • {account.currency}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xl font-bold text-foreground">
                  R$ {(account.balance || 0).toLocaleString('pt-BR')}
                </p>
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
