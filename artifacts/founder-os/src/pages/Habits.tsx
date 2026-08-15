import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Check,
  ClipboardCheck,
  ListTodo,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useAppStore,
  type HabitEntry,
  type IdentityStatus,
} from "@/store/useAppStore";

type Period = "week" | "fortnight" | "month" | "previousMonth";
const keyOf = (date: Date) => date.toISOString().slice(0, 10);
const dayLabel = (date: Date) => ['D', '2ª', '3ª', '4ª', '5ª', '6ª', 'S'][date.getDay()];
const dateLabel = (date: Date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
const shortDay = (date: Date) =>
  ["D", "2ª", "3ª", "4ª", "5ª", "6ª", "S"][date.getDay()];
const statusScore = (status?: IdentityStatus) =>
  status === "done" ? 1 : status === "partial" ? 0.5 : 0;
const nextStatus = (status?: IdentityStatus): IdentityStatus | null =>
  status === undefined
    ? "done"
    : status === "done"
      ? "partial"
      : status === "partial"
        ? "missed"
        : null;
const tone: Record<string, string> = {
  done: "border-emerald-500/70 bg-emerald-950/80 text-emerald-200",
  partial: "border-orange-500/70 bg-orange-950/80 text-orange-200",
  missed: "border-red-500/70 bg-red-950/80 text-red-200",
};
function periodDays(period: Period) {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  if (period === "week" || period === "fortnight") {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const total = period === "week" ? 7 : 14;
    return Array.from(
      { length: total },
      (_, i) =>
        new Date(
          monday.getFullYear(),
          monday.getMonth(),
          monday.getDate() + i,
          12,
        ),
    );
  }
  const offset = period === "previousMonth" ? -1 : 0;
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1, 12);
  const total = new Date(
    now.getFullYear(),
    now.getMonth() + offset + 1,
    0,
  ).getDate();
  return Array.from(
    { length: total },
    (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1, 12),
  );
}
function HabitCell({
  habit,
  date,
  onChange,
}: {
  habit: HabitEntry;
  date: Date;
  onChange: (status: IdentityStatus | null) => void;
}) {
  const status = habit.checks?.[keyOf(date)];
  return (
    <button
      title={status || "Não registrado"}
      onClick={() => onChange(nextStatus(status))}
      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg border transition hover:scale-110 ${status ? tone[status] : "border-cyan-500/25 bg-background/50 text-transparent"}`}
    >
      {status === "done" ? (
        <Check className="h-4 w-4" />
      ) : status === "partial" ? (
        <Minus className="h-4 w-4" />
      ) : status === "missed" ? (
        <X className="h-4 w-4" />
      ) : (
        "·"
      )}
    </button>
  );
}

export default function Habits() {
  const {
    habits,
    addHabitEntry,
    updateHabitEntry,
    deleteHabitEntry,
    setHabitCheck,
  } = useAppStore();
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState<Period>("week");
  const [statusFilter, setStatusFilter] = useState<"all" | IdentityStatus>(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [categoryTitle, setCategoryTitle] = useState("");
  const days = useMemo(() => periodDays(period), [period]);
  const categories = [...new Set(habits.map((h) => h.category || "Rotina"))];
  const filtered = habits.filter(
    (habit) =>
      (categoryFilter === "all" || habit.category === categoryFilter) &&
      (statusFilter === "all" ||
        days.some((day) => habit.checks?.[keyOf(day)] === statusFilter)),
  );
  const grouped = filtered.reduce<Record<string, HabitEntry[]>>(
    (groups, habit) => {
      (groups[habit.category || "Rotina"] ||= []).push(habit);
      return groups;
    },
    {},
  );
  const add = (category = "Rotina") => {
    if (!title.trim()) return;
    addHabitEntry({
      title: title.trim(),
      done: false,
      streak: 0,
      category,
      order: habits.length,
    });
    setTitle("");
  };
  const addToCategory = (category: string) => {
    if (!categoryTitle.trim()) return;
    addHabitEntry({
      title: categoryTitle.trim(),
      done: false,
      streak: 0,
      category,
      order: habits.length,
    });
    setCategoryTitle("");
    setAddingCategory(null);
  };
  const addCategory = () => {
    const name = window.prompt("Nome da nova categoria");
    if (name?.trim())
      addHabitEntry({
        title: "Novo item",
        done: false,
        streak: 0,
        category: name.trim(),
        order: habits.length,
      });
  };
  const renameCategory = (category: string) => {
    const name = window.prompt("Editar nome da categoria", category);
    if (name?.trim() && name.trim() !== category)
      habits
        .filter((h) => (h.category || "Rotina") === category)
        .forEach((h) => updateHabitEntry(h.id, { category: name.trim() }));
  };
  const editHabit = (habit: HabitEntry) => {
    const name = window.prompt("Editar hábito", habit.title);
    if (name?.trim()) updateHabitEntry(habit.id, { title: name.trim() });
  };
  const removeHabit = (habit: HabitEntry) => {
    if (window.confirm(`Excluir "${habit.title}"?`)) deleteHabitEntry(habit.id);
  };
  const score = habits.length
    ? Math.round(
        (habits.reduce(
          (sum, h) =>
            sum +
            days.reduce(
              (inner, d) => inner + statusScore(h.checks?.[keyOf(d)]),
              0,
            ),
          0,
        ) /
          (habits.length * days.length)) *
          100,
      )
    : 0;
  const dailyData = days.map((day) => {
    const values = habits
      .map((h) => h.checks?.[keyOf(day)])
      .filter(Boolean) as IdentityStatus[];
    return {
      name: dateLabel(day),
      execução: values.length
        ? Math.round(
            (values.reduce((s, v) => s + statusScore(v), 0) / values.length) *
              100,
          )
        : 0,
    };
  });
  const categoryData = categories.map((category) => {
    const items = habits.filter((h) => (h.category || "Rotina") === category);
    const total = items.length * days.length;
    return {
      name: category,
      execução: total
        ? Math.round(
            (items.reduce(
              (s, h) =>
                s +
                days.reduce((i, d) => i + statusScore(h.checks?.[keyOf(d)]), 0),
              0,
            ) /
              total) *
              100,
          )
        : 0,
    };
  });
  const categoryEvolution = days.map((day) => {
    const row: Record<string, string | number> = {
      name: dateLabel(day),
    };
    categories.forEach((category) => {
      const values = habits
        .filter((h) => (h.category || "Rotina") === category)
        .map((h) => h.checks?.[keyOf(day)])
        .filter(Boolean) as IdentityStatus[];
      row[category] = values.length
        ? Math.round(
            (values.reduce((s, v) => s + statusScore(v), 0) / values.length) *
              100,
          )
        : 0;
    });
    return row;
  });
  const tip = {
    background: "#10141d",
    border: "1px solid #00c9ff55",
    borderRadius: 8,
  };
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <header className="rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-[#07151d] via-card to-[#111421] p-6">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-cyan-400">
          ROTINA / EXECUÇÃO
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Checklist de Hábitos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Planeje, execute e reveja o que aconteceu em cada dia.
            </p>
          </div>
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-5 py-3 text-right">
            <p className="text-xs text-muted-foreground">Execução no período</p>
            <p className="text-2xl font-bold text-cyan-300">{score}%</p>
          </div>
        </div>
      </header>
      <section className="rounded-2xl border border-border/70 bg-card/70 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-2 flex items-center gap-2 text-sm font-semibold">
            <ListTodo className="h-4 w-4 text-cyan-400" />
            Período
          </div>
          {(["week", "fortnight", "month", "previousMonth"] as Period[]).map(
            (item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`rounded-lg border px-3 py-2 text-xs ${period === item ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-300" : "border-border text-muted-foreground"}`}
              >
                {item === "week"
                  ? "Semana"
                  : item === "fortnight"
                    ? "Quinzena"
                    : item === "month"
                      ? "Mês atual"
                      : "Mês anterior"}
              </button>
            ),
          )}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="ml-auto rounded-lg border border-border bg-background px-3 py-2 text-xs"
          >
            <option value="all">Todos os status</option>
            <option value="done">Feitos</option>
            <option value="partial">Parciais</option>
            <option value="missed">Não feitos</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={addCategory}
            className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/30 px-3 py-2 text-xs text-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova categoria
          </button>
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-3">
        <Chart title="Evolução dos hábitos" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <CartesianGrid stroke="rgba(148,163,184,.09)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={tip}
                formatter={(v) => [`${v}%`, "Execução"]}
              />
              <Area
                type="monotone"
                dataKey="execução"
                stroke="#00C9FF"
                fill="#00C9FF"
                fillOpacity={0.12}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Comparação por categoria">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid
                stroke="rgba(148,163,184,.09)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={tip}
                formatter={(v) => [`${v}%`, "Execução"]}
              />
              <Bar dataKey="execução" fill="#10B981" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
      </section>
      <Chart title="Evolução de cada categoria">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={categoryEvolution}>
            <CartesianGrid stroke="rgba(148,163,184,.09)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Tooltip contentStyle={tip} />
            <Line
              dataKey={categories[0]}
              stroke="#00C9FF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey={categories[1]}
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey={categories[2]}
              stroke="#F97316"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Chart>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categoryData.map((category) => {
          const items = habits.filter((habit) => (habit.category || "Rotina") === category.name);
          return <article key={category.name} className="rounded-2xl border border-cyan-400/15 bg-card/70 p-4 transition hover:border-cyan-400/30 hover:bg-card/90">
            <div className="mb-3 flex items-start justify-between gap-3"><div><p className="text-[11px] font-medium uppercase tracking-[.18em] text-cyan-200/75">Categoria</p><h3 className="mt-1 text-base font-semibold text-foreground/90">{category.name}</h3></div><span className="rounded-full border border-cyan-400/20 bg-cyan-400/[.04] px-2.5 py-1 text-xs font-medium text-cyan-300">{category.execução}%</span></div>
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-cyan-400/70 transition-all" style={{ width: `${category.execução}%` }} /></div>
            <div className="space-y-1.5">{items.map((habit) => <button key={habit.id} type="button" onClick={() => editHabit(habit)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground/75 transition hover:bg-white/[.04] hover:text-cyan-200"><span className="truncate">{habit.title}</span><span className="ml-2 text-[10px] text-muted-foreground/45">{habit.streak}d</span></button>)}</div>
          </article>;
        })}
      </section>
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/70">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-5">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-cyan-400" />
            <div>
              <h2 className="font-semibold">Grade de execução</h2>
              <p className="text-xs text-muted-foreground">
                Verde: feito · laranja: parcial · vermelho: não executado
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Adicionar tarefa ou hábito..."
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => add()}
              className="inline-flex h-9 items-center gap-1 rounded-lg bg-cyan-400 px-3 text-sm font-semibold text-slate-950"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-white/[.06] text-xs text-muted-foreground">
                <th className="sticky left-0 z-10 bg-card px-5 py-3 text-left">
                  Tarefa / hábito
                </th>
                {days.map((date) => (
                  <th key={keyOf(date)} className="border-l border-border/20 px-3 py-3 text-center">
                    <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">{dayLabel(date)}</span>
                    <span className="mt-1 block text-[10px] font-normal text-muted-foreground/60">{dateLabel(date)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([category, entries]) => (
                <>
                  <tr key={`category-${category}`}>
                    <td
                      colSpan={days.length + 1}
                      className="border-b border-white/[.06] bg-cyan-400/[.025] px-5 pb-3 pt-5 text-[11px] font-medium uppercase tracking-[.2em] text-cyan-200/80"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span>{category}</span>
                          <button
                            type="button"
                            onClick={() => renameCategory(category)}
                            className="rounded-md px-1.5 py-0.5 text-[10px] normal-case tracking-normal text-muted-foreground/50 transition hover:bg-white/[.05] hover:text-cyan-300"
                          >
                            Editar
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setAddingCategory(
                              addingCategory === category ? null : category,
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-cyan-400/20 bg-cyan-400/[.03] px-2 py-1 text-[10px] font-medium normal-case tracking-normal text-cyan-300/80 transition hover:border-cyan-400/50 hover:bg-cyan-400/[.08]"
                        >
                          <Plus className="h-3 w-3" />
                          Adicionar
                        </button>
                      </div>
                      {addingCategory === category && (
                        <div className="mt-3 flex max-w-md gap-2">
                          <input
                            autoFocus
                            value={categoryTitle}
                            onChange={(e) => setCategoryTitle(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && addToCategory(category)
                            }
                            placeholder={`Novo item em ${category}`}
                            className="h-8 flex-1 rounded-md border border-cyan-400/30 bg-background px-2 text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => addToCategory(category)}
                            className="rounded-md bg-cyan-400 px-3 text-xs font-semibold text-slate-950"
                          >
                            Salvar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {entries.map((habit) => (
                    <tr
                      key={habit.id}
                      className="border-b border-white/[.045] transition-colors hover:bg-white/[.018] last:border-0"
                    >
                      <td className="sticky left-0 bg-card/95 px-5 py-5">
                        <div className="flex items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <button type="button" onClick={() => editHabit(habit)} className="block text-left text-sm font-normal text-foreground/80 hover:text-cyan-300">
                              {habit.title}
                            </button>
                            <p className="mt-1 text-[11px] text-muted-foreground/60">
                              Sequência: {habit.streak} dias
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeHabit(habit)}
                            className="text-muted-foreground/50 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      {days.map((date) => (
                        <td key={keyOf(date)} className="border-l border-white/[.035] px-2 py-5 text-center">
                          <HabitCell
                            habit={habit}
                            date={date}
                            onChange={(status) =>
                              setHabitCheck(habit.id, keyOf(date), status)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
function Chart({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-cyan-400/15 bg-card/70 p-5 ${className}`}
    >
      <h2 className="font-semibold">{title}</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Acompanhe a execução no período selecionado.
      </p>
      <div className="h-56">{children}</div>
    </section>
  );
}
