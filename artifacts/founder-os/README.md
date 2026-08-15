# Founder OS

**Sistema operacional pessoal para founders que operam múltiplos negócios em paralelo.**

Founder OS é um dashboard premium e visual, inspirado em Linear e Notion, mas com personalidade própria. Escuro como grafite, preciso, modular, e totalmente local — sem backend, sem autenticação, sem complicação.

---

## 🎨 Design

### Vibe
Cockpit de comando de um founder que pensa em sistemas. Denso, mas respirando. Cada pixel ganha seu lugar.

### Paleta
- **Fundo principal**: Grafite quase preto (#0D0F14)
- **Cards em camadas**: Superfícies levemente elevadas (#14171F, #1A1D26)
- **Bordas discretas**: 1px sutis, quase invisíveis
- **Acentos**: Ciano/azul elétrico (#00C9FF, #0EA5E9) — usado com parcimônia
- **Tipografia**: Inter, hierarquia forte, muito espaço em branco

### Princípios
- Sofisticação > efeito
- Sem neon excessivo, sem gradientes chamativos
- Raio de borda médio (8-12px)
- Responsivo: sidebar recolhível em mobile

---

## 🏗️ Arquitetura

### Stack
- **React** + **TypeScript**
- **Wouter** para roteamento
- **Zustand** para estado global
- **Recharts** para visualizações
- **Framer Motion** para animações
- **shadcn/ui** + **Tailwind CSS** para UI
- **date-fns** para datas

### Persistência
100% **localStorage** (chave: `founder-os-data`). Sem backend, sem API, sem auth.

### Estrutura de Dados

```typescript
type ModuleType = "metric" | "project" | "financial_account" | "task" | "note" | "link";
type ModuleStatus = "active" | "paused" | "archived" | "done";

interface Module {
  id: string;
  type: ModuleType;
  title: string;
  category: string;
  subcategory?: string;
  color?: string;
  status: ModuleStatus;
  value?: number | string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  // + campos específicos por tipo
}
```

---

## 📂 Páginas

### 1. **Visão Geral** (`/`)
- Saudação + data atual
- 4 KPI cards (Caixa, Projetos Ativos, Foco da Semana, Alertas)
- Gráfico semanal de receita vs despesas
- Prioridades do dia (checkboxes editáveis)
- Captura rápida (textarea + histórico)
- Projetos em movimento (cards horizontais)

### 2. **Financeiro** (`/financeiro`)
- 3 KPI cards (Receita Total, Despesas, Saldo)
- BarChart de fluxo semanal
- Lista de contas financeiras (editável, com menu de ações)

### 3. **Projetos** (`/projetos`)
- Grid de cards de projetos
- Filtros por status (active, paused, done, archived)
- Progress bar, tags, menu de ações

### 4. **Placeholder** (`/identidade`, `/canais`, `/agentes`, `/biblioteca`)
- Empty state elegante com mensagem "Em breve"

---

## 🔧 Funcionalidades

### Modal de Criação/Edição
Acessível por:
- Botão "+ Adicionar" na sidebar
- Botões "+ Novo X" em cada seção
- Botão de editar em qualquer card

**Campos:**
- Tipo (select): Métrica | Projeto | Conta Financeira | Tarefa | Nota | Link
- Título (required)
- Categoria (select + criação inline)
- Subcategoria (filtrada por categoria pai)
- Cor (8 opções)
- Status (ativo, pausado, arquivado, concluído)
- Valor (dependendo do tipo)
- Observação (textarea)

**Campos condicionais por tipo:**
- **Projeto**: % progresso (slider), tags
- **Tarefa**: data limite, prioridade, checkbox concluído
- **Link**: URL
- **Métrica**: unidade, tendência
- **Conta Financeira**: tipo de conta, moeda

### Menu de Contexto
Disponível em cada card:
- ✏️ Editar
- 📋 Duplicar
- 🗄️ Arquivar
- 🗑️ Excluir

### Exportar/Importar Dados
Botões na sidebar (quando expandida):
- **Exportar**: Baixa JSON com todos os dados
- **Importar**: Restaura backup a partir de arquivo JSON

---

## 🚀 Como Usar

### Desenvolvimento
```bash
pnpm install
pnpm run dev
```

### Build
```bash
pnpm run build
```

### Typecheck
```bash
pnpm run typecheck
```

---

## 📦 Dados Iniciais (Seed)

Ao abrir pela primeira vez, o sistema carrega:
- 4 projetos: Soul Krieg, Solar Machine, Burry, 21GO
- 4 métricas: Caixa atual, Projetos ativos, Foco da semana, Alertas
- 3 contas financeiras: Conta PJ, Conta PF, Reserva
- 6 semanas de dados financeiros
- 3 prioridades de hoje
- 2 capturas rápidas de exemplo

Todos editáveis, deletáveis, duplicáveis.

---

## 🎯 Filosofia

Este sistema não é para gerenciar uma empresa — é para gerenciar **você como fundador**.

- **Modular**: Tudo é um módulo. Métricas, projetos, contas, notas, links.
- **Visual**: Cada número conta uma história. Progresso, tendências, alertas.
- **Flexível**: Categorias personalizadas, status customizados, cores escolhidas.
- **Local**: Seus dados nunca saem da sua máquina.
- **Rápido**: Captura rápida, prioridades do dia, foco da semana — tudo imediato.

---

## 🛠️ Próximos Passos (Sugeridos)

- Drag and drop nos grids de projetos
- Filtros avançados por categoria/status
- Timeline de atividades
- Widgets customizáveis na Visão Geral
- Modo focus (esconde tudo exceto foco da semana + prioridades)
- Integração com calendário (iCal)
- Métricas calculadas (ex: burn rate, runway)

---

## 📝 Notas Técnicas

- **Dark mode permanente**: `document.documentElement.classList.add('dark')` no main.tsx
- **CSS custom properties**: Paleta completa em `:root` e `.dark`
- **Recharts tooltips**: Customizados para tema dark
- **Framer Motion**: Animações sutis, scale(1.01) nos cards, stagger nos grids
- **Zustand middleware**: Auto-save em localStorage a cada mudança de estado
- **date-fns + pt-BR**: Todas as datas formatadas em português brasileiro

---

**Feito para founders que operam no ritmo do caos, mas pensam em sistemas.**
# Founder OS

Founder OS dashboard application.
