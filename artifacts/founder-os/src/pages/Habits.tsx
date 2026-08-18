import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Check,
  ClipboardCheck,
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

type Period = "day" | "week" | "fortnight" | "month" | "previousMonth";
const keyOf = (date: Date) => date.toISOString().slice(0, 10);
const dayLabel = (date: Date) =>
  ["D", "2ª", "3ª", "4ª", "5ª", "6ª", "S"][date.getDay()];
const dateLabel = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
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
  if (period === "day") return [now];
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
      className={`mx-auto flex h-6 w-6 items-center justify-center rounded-sm border transition hover:scale-110 ${status ? tone[status] : "border-cyan-500/25 bg-background/50 text-transparent"}`}
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

export default function Habits({ mode = "habits" }: { mode?: "habits" | "productivity" }) {
  const isProductivity = mode === "productivity";
  const {
    habits,
    addHabitEntry,
    updateHabitEntry,
    deleteHabitEntry,
    setHabitCheck,
  } = useAppStore();
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState<Period>("week");
  const [dailyChartPeriod, setDailyChartPeriod] = useState<Period>("week");
  const [comparisonPeriod, setComparisonPeriod] = useState<Period>("week");
  const [categoryEvolutionPeriod, setCategoryEvolutionPeriod] =
    useState<Period>("week");
  const [categoryPanelPeriod, setCategoryPanelPeriod] =
    useState<Period>("week");
  const [executionPeriod, setExecutionPeriod] = useState<Period>("week");
  const [statusFilter, setStatusFilter] = useState<"all" | IdentityStatus>(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("Rotina");
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#22d3ee");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitTitle, setEditingHabitTitle] = useState("");
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [oneOffTitle, setOneOffTitle] = useState("");
  const [oneOffTasks, setOneOffTasks] = useState<
    { id: string; title: string; done: boolean; completedAt?: string | null }[]
  >([]);
  const days = useMemo(() => periodDays(period), [period]);
  const dailyChartDays = useMemo(
    () => periodDays(dailyChartPeriod),
    [dailyChartPeriod],
  );
  const comparisonDays = useMemo(
    () => periodDays(comparisonPeriod),
    [comparisonPeriod],
  );
  const categoryEvolutionDays = useMemo(
    () => periodDays(categoryEvolutionPeriod),
    [categoryEvolutionPeriod],
  );
  const categoryPanelDays = useMemo(
    () => periodDays(categoryPanelPeriod),
    [categoryPanelPeriod],
  );
  const executionDays = useMemo(
    () => periodDays(executionPeriod),
    [executionPeriod],
  );
  const categories = [...new Set(habits.map((h) => h.category || "Rotina"))];
  const categoryColors = Object.fromEntries(
    habits
      .filter((habit) => habit.categoryColor)
      .map((habit) => [habit.category || "Rotina", habit.categoryColor]),
  ) as Record<string, string | undefined>;
  const filtered = habits.filter(
    (habit) =>
      (categoryFilter === "all" || habit.category === categoryFilter) &&
      (statusFilter === "all" ||
        executionDays.some((day) => {
          const check = habit.checks?.[keyOf(day)] ?? null;
          if (statusFilter === "done") return check === "done";
          if (statusFilter === "partial") return check === "partial";
          return check === "missed" || check === null;
        })),
  );
  const grouped = filtered.reduce<Record<string, HabitEntry[]>>(
    (groups, habit) => {
      (groups[habit.category || "Rotina"] ||= []).push(habit);
      return groups;
    },
    {},
  );
  Object.values(grouped).forEach((entries) =>
    entries.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
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
    setShowHabitForm(false);
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
  const createCategory = (rawName: string) => {
    const name = rawName.trim();
    if (name) {
      addHabitEntry({
        title: "Novo item",
        done: false,
        streak: 0,
        category: name,
        categoryColor: newCategoryColor,
        order: habits.length,
      });
      setNewCategoryName("");
      setNewCategoryColor("#22d3ee");
      setShowCategoryForm(false);
    }
  };
  const addCategory = () => createCategory(newCategoryName);
  const saveOneOff = (
    tasks: {
      id: string;
      title: string;
      done: boolean;
      completedAt?: string | null;
    }[],
  ) => setOneOffTasks(tasks);
  const addOneOff = () => undefined;
  const startEditingCategory = (category: string) => {
    setEditingCategory(category);
    setEditingCategoryName(category);
  };
  const saveEditingCategory = (category: string) => {
    const name = editingCategoryName.trim();
    if (name && name !== category) {
      habits
        .filter((h) => (h.category || "Rotina") === category)
        .forEach((h) => updateHabitEntry(h.id, { category: name }));
      if (categoryFilter === category) setCategoryFilter(name);
    }
    setEditingCategory(null);
    setEditingCategoryName("");
  };
  const cancelEditingCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName("");
  };
  const removeCategory = (category: string) => {
    const entries = habits.filter(
      (habit) => (habit.category || "Rotina") === category,
    );
    if (!entries.length) return;
    if (
      window.confirm(
        `Excluir a categoria "${category}" e seus ${entries.length} hábitos?`,
      )
    ) {
      entries.forEach((habit) => deleteHabitEntry(habit.id));
      if (categoryFilter === category) setCategoryFilter("all");
    }
  };
  const startEditingHabit = (habit: HabitEntry) => {
    setEditingHabitId(habit.id);
    setEditingHabitTitle(habit.title);
  };
  const saveEditingHabit = (habit: HabitEntry) => {
    const name = editingHabitTitle.trim();
    if (name) updateHabitEntry(habit.id, { title: name });
    setEditingHabitId(null);
    setEditingHabitTitle("");
  };
  const cancelEditingHabit = () => {
    setEditingHabitId(null);
    setEditingHabitTitle("");
  };
  const removeHabit = (habit: HabitEntry) => {
    if (window.confirm(`Excluir "${habit.title}"?`)) deleteHabitEntry(habit.id);
  };
  const reorderWithinCategory = (category: string, targetId: string) => {
    if (!draggedHabitId || draggedHabitId === targetId) return;
    const entries = habits
      .filter((habit) => (habit.category || "Rotina") === category)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const from = entries.findIndex((habit) => habit.id === draggedHabitId);
    const to = entries.findIndex((habit) => habit.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = entries.splice(from, 1);
    entries.splice(to, 0, moved);
    entries.forEach((habit, index) => updateHabitEntry(habit.id, { order: index }));
    setDraggedHabitId(null);
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
  const dailyData = dailyChartDays.map((day) => {
    const executed = habits.reduce(
      (sum, habit) => sum + statusScore(habit.checks?.[keyOf(day)]),
      0,
    );
    return {
      name: dateLabel(day),
      execução: habits.length ? Math.round((executed / habits.length) * 100) : 0,
    };
  });
  const categoryData = categories.map((category) => {
    const items = habits.filter((h) => (h.category || "Rotina") === category);
    const total = items.length * categoryPanelDays.length;
    return {
      name: category,
      execução: total
        ? Math.round(
            (items.reduce(
              (s, h) =>
                s +
                categoryPanelDays.reduce(
                  (i, d) => i + statusScore(h.checks?.[keyOf(d)]),
                  0,
                ),
              0,
            ) /
              total) *
              100,
          )
        : 0,
    };
  });
  const categoryEvolution = categoryEvolutionDays.map((day) => {
    const row: Record<string, string | number> = {
      name: dateLabel(day),
    };
    categories.forEach((category) => {
      const items = habits.filter(
        (habit) => (habit.category || "Rotina") === category,
      );
      const executed = items.reduce(
        (sum, habit) => sum + statusScore(habit.checks?.[keyOf(day)]),
        0,
      );
      row[category] = items.length
        ? Math.round((executed / items.length) * 100)
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
    <div className={`mx-auto w-full max-w-[1500px] space-y-6 ${isProductivity ? "productivity-workspace" : ""}`}>
      <header className={`rounded-2xl border p-6 ${isProductivity ? "border-amber-400/30 bg-gradient-to-r from-[#1b1308] via-card to-[#17111d] shadow-[0_18px_45px_rgba(245,158,11,.08)]" : "border-cyan-400/25 bg-gradient-to-r from-[#07151d] via-card to-[#111421]"}`}>
        <p className={`text-xs font-semibold uppercase tracking-[.25em] ${isProductivity ? "text-amber-300" : "text-cyan-400"}`}>
          {isProductivity ? "FOCO / ENTREGA" : "ROTINA / EXECUÇÃO"}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isProductivity ? "Checklist de Produtividade" : "Checklist de Hábitos"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isProductivity ? "Transforme prioridades em entregas concretas, dia após dia." : "Planeje, execute e reveja o que aconteceu em cada dia."}
            </p>
          </div>
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-5 py-3 text-right">
            <p className="text-xs text-muted-foreground">Execução no período</p>
            <p className="text-2xl font-bold text-cyan-300">{score}%</p>
          </div>
        </div>
      </header>
      <section className="grid gap-6 xl:grid-cols-2">
          <Chart title={isProductivity ? "Ritmo de entregas" : "Evolução dos hábitos"} period={dailyChartPeriod} setPeriod={setDailyChartPeriod}>
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
                stroke={isProductivity ? "#f59e0b" : "#00C9FF"}
                fill={isProductivity ? "#f59e0b" : "#00C9FF"}
                fillOpacity={0.12}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Comparação por categoria" period={comparisonPeriod} setPeriod={setComparisonPeriod}>
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
              <Bar dataKey="execução" fill={isProductivity ? "#a855f7" : "#10B981"} radius={[0, 5, 5, 0]}>
                <LabelList
                  dataKey="execução"
                  position="right"
                  formatter={(value: number) => `${value}%`}
                  fill="#d8f3ff"
                  fontSize={11}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Chart>
      </section>
      <Chart
        title={isProductivity ? "Evolução por frente de trabalho" : "Evolução de cada categoria"}
        period={categoryEvolutionPeriod}
        setPeriod={setCategoryEvolutionPeriod}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={categoryEvolution}
            margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid stroke="rgba(148,163,184,.09)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={tip}
              formatter={(value, name) => [`${value}%`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {categories.map((category, index) => (
              <Line
                key={category}
                dataKey={category}
                name={category}
                stroke={
                  (isProductivity ? ["#f59e0b", "#a855f7", "#38bdf8", "#fb7185", "#34d399"] : ["#00C9FF", "#10B981", "#F97316", "#A855F7", "#F43F5E"])[
                    index % 5
                  ]
                }
                type="monotone"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 1.5 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Chart>
      <section className="rounded-2xl border border-cyan-400/15 bg-card/45 p-4 shadow-[0_14px_40px_rgba(0,0,0,.12)]">
        <div className="mb-4 flex items-end justify-between gap-3 border-b border-white/[.07] pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-cyan-300">
              PAINEL DE CATEGORIAS
            </p>
            <h2 className="mt-1 text-lg font-semibold">Evolução por área</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <span className="text-xs text-muted-foreground">
              {categoryData.length} áreas acompanhadas
            </span>
            <PeriodSelector
              period={categoryPanelPeriod}
              setPeriod={setCategoryPanelPeriod}
              compact
            />
          </div>
        </div>
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categoryData.map((category, categoryIndex) => {
          const categoryTone = [
            {
              border: "border-cyan-400/30",
              glow: "shadow-cyan-500/[.08]",
              bar: "bg-cyan-400",
              label: "text-cyan-300",
            },
            {
              border: "border-violet-400/30",
              glow: "shadow-violet-500/[.08]",
              bar: "bg-violet-400",
              label: "text-violet-300",
            },
            {
              border: "border-emerald-400/30",
              glow: "shadow-emerald-500/[.08]",
              bar: "bg-emerald-400",
              label: "text-emerald-300",
            },
          ][categoryIndex % 3];
          return (
            <article
              key={category.name}
              style={categoryColors[category.name] ? { borderColor: `${categoryColors[category.name]}88` } : undefined}
              className={`relative overflow-hidden rounded-xl border bg-background/35 p-4 shadow-[0_8px_24px_rgba(0,0,0,.12)] transition hover:-translate-y-0.5 hover:bg-card/80 ${categoryTone.border} ${categoryTone.glow}`}
            >
              <div
                style={categoryColors[category.name] ? { backgroundColor: categoryColors[category.name] } : undefined}
                className={`absolute inset-x-0 top-0 h-0.5 ${categoryTone.bar}`}
              />
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-foreground/90">
                    {category.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full border border-white/[.1] bg-white/[.025] px-2.5 py-1 text-xs font-semibold ${categoryTone.label}`}
                  >
                    {category.execução}%
                  </span>
                </div>
              </div>
              <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/[.06]">
                <div
                  className={`h-full rounded-full transition-all ${categoryTone.bar}`}
                  style={{ width: `${category.execução}%` }}
                />
              </div>
            </article>
          );
        })}
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-white/[.08] bg-card/45 shadow-[0_14px_40px_rgba(0,0,0,.14)]">
        <div className="border-b border-lime-400/15 bg-gradient-to-r from-lime-400/[.06] via-card/80 to-cyan-400/[.04] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-lime-400/30 bg-lime-400/[.08] shadow-[0_0_16px_rgba(163,230,53,.12)]">
                <ClipboardCheck className="h-5 w-5 text-lime-300" />
              </div>
              <div>
                <h2 className="font-semibold tracking-wide">
                  {isProductivity ? "Acompanhamento das entregas" : "Acompanhamento dos hábitos"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isProductivity ? "Marque o avanço de cada frente e veja sua consistência." : "Clique em cada dia para registrar feito, parcial ou não feito."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategoryForm(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <Plus className="h-4 w-4" /> Nova categoria
              </button>
              <PeriodSelector
                period={executionPeriod}
                setPeriod={setExecutionPeriod}
                compact
              />
            </div>
          </div>
          {showCategoryForm && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[.04] p-2">
              <input
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCategory();
                  if (e.key === "Escape") {
                    setNewCategoryName("");
                    setShowCategoryForm(false);
                  }
                }}
                placeholder="Nome da categoria"
                className="h-9 min-w-52 flex-1 rounded-lg border border-white/[.1] bg-background px-3 text-sm outline-none focus:border-cyan-400"
              />
              <label className="flex h-9 items-center gap-2 rounded-lg border border-white/[.1] bg-background px-2 text-xs text-muted-foreground">
                <input type="color" value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="Cor da categoria" />
                Cor
              </label>
              <button
                onClick={addCategory}
                className="h-9 rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-slate-950"
              >
                Criar categoria
              </button>
            </div>
          )}
          {showHabitForm && (
            <div className="mt-4 grid gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[.035] p-3 sm:grid-cols-[1fr_180px_auto]">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") add(newHabitCategory);
                  if (e.key === "Escape") {
                    setTitle("");
                    setShowHabitForm(false);
                  }
                }}
                placeholder="Nome do hábito (ex.: Ler 20 minutos)"
                className="h-10 rounded-lg border border-white/[.1] bg-background px-3 text-sm outline-none focus:border-cyan-400"
              />
              <select
                value={newHabitCategory}
                onChange={(e) => setNewHabitCategory(e.target.value)}
                className="h-10 rounded-lg border border-white/[.1] bg-background px-3 text-sm outline-none focus:border-cyan-400"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <button
                onClick={() => add(newHabitCategory)}
                className="h-10 rounded-lg border border-cyan-400/40 px-4 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/10"
              >
                Salvar hábito
              </button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-y-1">
            <thead>
              <tr className="border-b border-white/[.08] bg-background/25 text-xs text-muted-foreground">
                <th className="sticky left-0 z-10 bg-card px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-lime-300/75">
                  Tarefa / hábito
                </th>
                {executionDays.map((date) => (
                  <th
                    key={keyOf(date)}
                    className="border-l border-border/20 px-3 py-3 text-center"
                  >
                    <span className="block text-xs font-semibold uppercase tracking-wide text-lime-300/85">
                      {dayLabel(date)}
                    </span>
                    <span className="mt-1 block text-[11px] font-normal text-muted-foreground/70">
                      {dateLabel(date)}
                    </span>
                  </th>
                ))}
                <th className="border-l border-lime-400/15 px-3 py-3 text-right text-[10px] font-medium uppercase tracking-wide text-lime-300/70">
                  Semana %
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(
                ([category, entries], categoryIndex) => (
                  <>
                    <tr key={`category-${category}`}>
                      <td
                        colSpan={999}
                        style={categoryColors[category] ? { borderColor: `${categoryColors[category]}88`, boxShadow: `inset 3px 0 ${categoryColors[category]}` } : undefined}
                        className={`border px-5 pb-3 pt-4 text-sm font-normal text-foreground/80 shadow-[0_8px_18px_rgba(0,0,0,.12)] ${categoryIndex % 3 === 0 ? "rounded-t-xl border-cyan-400/35 bg-cyan-400/[.05]" : categoryIndex % 3 === 1 ? "rounded-t-xl border-violet-400/30 bg-violet-400/[.045]" : "rounded-t-xl border-emerald-400/30 bg-emerald-400/[.04]"}`}
                      >
                        <div className="flex items-center justify-between">
                          {editingCategory === category ? (
                            <input
                              autoFocus
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              onBlur={() => saveEditingCategory(category)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditingCategory(category);
                                if (e.key === "Escape") cancelEditingCategory();
                              }}
                              className="h-8 w-48 rounded-md border border-cyan-400/60 bg-background px-2 text-sm outline-none shadow-[0_0_12px_rgba(34,211,238,.1)]"
                              aria-label={`Editar categoria ${category}`}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditingCategory(category)}
                              className="flex items-center gap-2 text-left text-sm font-semibold tracking-wide text-foreground/90 transition hover:text-cyan-300"
                              title="Clique para editar a categoria"
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${categoryIndex % 3 === 0 ? "bg-cyan-300 shadow-[0_0_8px_#67e8f9]" : categoryIndex % 3 === 1 ? "bg-violet-300 shadow-[0_0_8px_#c4b5fd]" : "bg-emerald-300 shadow-[0_0_8px_#6ee7b7]"}`}
                              />
                              {category}
                            </button>
                          )}
                          <div className="flex items-center gap-2">
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
                              Adicionar hábito
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCategory(category)}
                              title={`Excluir categoria ${category}`}
                              className="rounded-md p-1 text-muted-foreground/50 transition hover:bg-red-400/10 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {addingCategory === category && (
                          <div className="mt-3 flex max-w-md gap-2">
                            <input
                              autoFocus
                              value={categoryTitle}
                              onChange={(e) => setCategoryTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") addToCategory(category);
                                if (e.key === "Escape") {
                                  setCategoryTitle("");
                                  setAddingCategory(null);
                                }
                              }}
                              placeholder={`Novo item em ${category}`}
                              className="h-8 flex-1 rounded-md border border-cyan-400/30 bg-background px-2 text-sm font-normal text-foreground/80 outline-none placeholder:text-muted-foreground/50 focus:border-cyan-400"
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
                    {entries.map((habit, index) => (
                      <tr
                        key={habit.id}
                        draggable
                        onDragStart={() => setDraggedHabitId(habit.id)}
                        onDragEnd={() => setDraggedHabitId(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => reorderWithinCategory(category, habit.id)}
                        className={`border-x border-white/[.07] bg-background/25 transition-colors hover:bg-cyan-400/[.035] ${index === entries.length - 1 ? "rounded-b-xl border-b border-cyan-400/25" : "border-b border-white/[.045]"}`}
                      >
                        <td className="sticky left-0 bg-card/95 px-5 py-2">
                          <div className="flex items-center gap-2">
                            <div className="min-w-0 flex-1">
                              {editingHabitId === habit.id ? (
                                <input
                                  autoFocus
                                  value={editingHabitTitle}
                                  onChange={(e) => setEditingHabitTitle(e.target.value)}
                                  onBlur={() => saveEditingHabit(habit)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEditingHabit(habit);
                                    if (e.key === "Escape") cancelEditingHabit();
                                  }}
                                  className="block w-full rounded-md border border-cyan-400/60 bg-background px-2 py-1 text-sm text-foreground outline-none shadow-[0_0_12px_rgba(34,211,238,.1)]"
                                  aria-label={`Editar ${habit.title}`}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startEditingHabit(habit)}
                                  title="Clique para editar este hábito"
                                  className="group block w-full rounded-md border border-transparent px-1 py-0.5 text-left text-sm font-normal text-foreground/80 transition hover:border-cyan-400/30 hover:bg-cyan-400/[.04] hover:text-cyan-300"
                                >
                                  {habit.title}
                                </button>
                              )}
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
                        {executionDays.map((date) => (
                          <td
                            key={keyOf(date)}
                            className="border-l border-white/[.035] px-2 py-3 text-center"
                          >
                            <HabitCell
                              habit={habit}
                              date={date}
                              onChange={(status) =>
                                setHabitCheck(habit.id, keyOf(date), status)
                              }
                            />
                          </td>
                        ))}
                        <td className="border-l border-lime-400/10 px-3 py-4 text-right text-xs font-semibold text-lime-300/80">
                          {Math.round(
                            (days.reduce(
                              (sum, date) =>
                                sum + statusScore(habit.checks?.[keyOf(date)]),
                              0,
                            ) /
                              days.length) *
                              100,
                          )}
                          %
                        </td>
                      </tr>
                    ))}
                  </>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>
      {false && (
        <section className="rounded-2xl border border-white/[.08] bg-card/60 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Lista de tarefas avulsas</h2>
              <p className="text-xs text-muted-foreground">
                Para ações que não precisam ser repetidas todos os dias.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                value={oneOffTitle}
                onChange={(e) => setOneOffTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addOneOff()}
                placeholder="Ex.: renovar documento"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-cyan-400"
              />
              <button
                onClick={addOneOff}
                className="inline-flex h-9 items-center gap-1 rounded-lg bg-cyan-400 px-3 text-sm font-semibold text-slate-950"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {oneOffTasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/[.1] px-4 py-5 text-center text-xs text-muted-foreground">
                Nenhuma tarefa avulsa adicionada.
              </p>
            ) : (
              oneOffTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-background/35 px-3 py-3"
                >
                  <button
                    type="button"
                    onClick={() =>
                      saveOneOff(
                        oneOffTasks.map((item) =>
                          item.id === task.id
                            ? {
                                ...item,
                                done: !item.done,
                                completedAt: item.done
                                  ? null
                                  : keyOf(new Date()),
                              }
                            : item,
                        ),
                      )
                    }
                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${task.done ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-300" : "border-cyan-400/30"}`}
                  >
                    {task.done && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground/80"}`}
                  >
                    {task.title}
                    <small className="ml-2 text-[10px] text-muted-foreground/60">
                      {task.done && task.completedAt
                        ? `executada em ${dateLabel(new Date(`${task.completedAt}T12:00:00`))}`
                        : "pendente"}
                    </small>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      saveOneOff(
                        oneOffTasks.filter((item) => item.id !== task.id),
                      )
                    }
                    className="text-muted-foreground/50 hover:text-red-400"
                    title="Excluir tarefa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
function Chart({
  title,
  period,
  setPeriod,
  children,
  className = "",
}: {
  title: string;
  period: Period;
  setPeriod: (period: Period) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-cyan-400/15 bg-card/70 p-5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">
            Acompanhe a execução no período selecionado.
          </p>
        </div>
        <PeriodSelector period={period} setPeriod={setPeriod} compact />
      </div>
      <div className="mb-3" />
      <div className="h-56">{children}</div>
    </section>
  );
}

function PeriodSelector({
  period,
  setPeriod,
  compact = false,
}: {
  period: Period;
  setPeriod: (period: Period) => void;
  compact?: boolean;
}) {
  const options: [Period, string][] = [
    ["day", "Diário"],
    ["week", "Semanal"],
    ["fortnight", "Quinzenal"],
    ["month", "Mensal"],
  ];
  return (
    <div
      className={`flex items-center gap-0.5 rounded-lg border border-cyan-400/20 bg-background/50 p-0.5 ${compact ? "text-xs" : "text-sm"}`}
    >
      {options.map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setPeriod(value)}
          className={`rounded-md px-2 py-1 transition ${period === value ? "bg-cyan-400/15 text-cyan-200" : "text-muted-foreground hover:text-foreground"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
