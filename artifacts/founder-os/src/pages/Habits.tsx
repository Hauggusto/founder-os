import { useMemo, useRef, useState } from "react";
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
  ArrowUpRight,
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
import { FutureVisionBlock } from "@/components/overview/FutureVisionBlock";
import { NextActionsBlock } from "@/components/overview/NextActionsBlock";
import { AgendaBlock } from "@/components/overview/AgendaBlock";
import { TagManager } from "@/components/overview/TagManager";
import { Link } from "wouter";

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

export default function Habits({ mode = "habits" }: any) {
  const isProductivity = mode === "productivity";
  const store = useAppStore();
  const habits = isProductivity ? store.productivityHabits : store.habits;
  const addHabitEntry = isProductivity ? store.addProductivityHabitEntry : store.addHabitEntry;
  const updateHabitEntry = isProductivity ? store.updateProductivityHabitEntry : store.updateHabitEntry;
  const deleteHabitEntry = isProductivity ? store.deleteProductivityHabitEntry : store.deleteHabitEntry;
  const habitCategories = isProductivity ? store.productivityCategories : store.habitCategories;
  const renameCategory = isProductivity ? store.renameProductivityCategory : store.renameHabitCategory;
  const deleteCategory = isProductivity ? store.deleteProductivityCategory : store.deleteHabitCategory;
  const setHabitCheck = isProductivity ? store.setProductivityHabitCheck : store.setHabitCheck;
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
  const editingHabitTitleRef = useRef("");
  const skipHabitBlurRef = useRef(false);
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);
  const [subtaskParentId, setSubtaskParentId] = useState<string | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState("");
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
  const categories = [...new Set([...habitCategories, ...habits.map((h) => h.category || "Rotina")])];
  const productivityProjects = isProductivity
    ? store.modules.filter((module) => module.type === "project")
    : [];
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
  const addSubtask = (parent: HabitEntry) => {
    if (!subtaskTitle.trim()) return;
    addHabitEntry({
      title: subtaskTitle.trim(),
      done: false,
      streak: 0,
      category: parent.category,
      project: parent.project,
      parentId: parent.id,
      order: habits.length,
    });
    setSubtaskTitle("");
    setSubtaskParentId(null);
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
      renameCategory(category, name);
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
      deleteCategory(category);
      if (categoryFilter === category) setCategoryFilter("all");
    }
  };
  const startEditingHabit = (habit: HabitEntry) => {
    skipHabitBlurRef.current = false;
    editingHabitTitleRef.current = habit.title;
    setEditingHabitId(habit.id);
    setEditingHabitTitle(habit.title);
  };
  const saveEditingHabit = (habit: HabitEntry, value = editingHabitTitle) => {
    const name = value.trim();
    if (name) updateHabitEntry(habit.id, { title: name });
    editingHabitTitleRef.current = "";
    setEditingHabitId(null);
    setEditingHabitTitle("");
  };
  const cancelEditingHabit = () => {
    skipHabitBlurRef.current = true;
    editingHabitTitleRef.current = "";
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
  const categoryEvolutionPoints = categoryEvolutionDays.map((day) => {
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
  const categoryEvolution = [
    {
      name: "",
      ...Object.fromEntries(categories.map((category) => [category, 0])),
    },
    ...categoryEvolutionPoints,
  ];
  const todayKey = keyOf(new Date());
  const todayActions = store.nextActions.filter((action) => !action.date || action.date === todayKey);
  const todayAgenda = store.agenda.filter((item) => !item.date || item.date === todayKey);
  const todayHabitDone = habits.filter((habit) => habit.checks?.[todayKey] === "done").length;
  const tip = {
    background: "#10141d",
    border: "1px solid #00c9ff55",
    borderRadius: 8,
  };
  return (
    <div className={`mx-auto w-full max-w-[1500px] space-y-6 ${isProductivity ? "productivity-workspace font-mono" : ""}`}>
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
      <TagManager />
      {isProductivity && (
        <section className="space-y-4 [&>div]:!rounded-2xl [&>div]:!border-amber-400/20 [&>div]:!bg-[#120f18]/80">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { label: "Ações abertas", value: todayActions.filter((action) => !action.done).length, tone: "text-orange-300", note: "para executar hoje" },
              { label: "Concluídas hoje", value: todayActions.filter((action) => action.done).length + todayHabitDone, tone: "text-emerald-300", note: "entregas registradas" },
              { label: "Agenda de hoje", value: todayAgenda.length, tone: "text-cyan-300", note: "compromissos" },
              { label: "Foco do dia", value: `${score}%`, tone: "text-amber-300", note: "execução atual" },
            ].map((metric) => (
              <article key={metric.label} className="rounded-xl border border-amber-300/15 bg-[#0d0b12]/80 px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,.16)]">
                <p className="text-[10px] uppercase tracking-[.16em] text-muted-foreground">{metric.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${metric.tone}`}>{metric.value}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{metric.note}</p>
              </article>
            ))}
          </div>
          <NextActionsBlock />
          <div className="grid gap-4 lg:grid-cols-2 [&>div]:!rounded-2xl [&>div]:!border-amber-400/20 [&>div]:!bg-[#120f18]/80">
            <div className="[&>div>section:first-child]:hidden [&>div>section:last-child]:lg:col-span-2"><FutureVisionBlock /></div>
            <AgendaBlock />
          </div>
        </section>
      )}
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
            <XAxis dataKey="name" padding={{ left: 0, right: 14 }} tick={{ fill: "#94a3b8", fontSize: 10 }} />
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
                strokeWidth={1.5}
                dot={{ r: 2.5, strokeWidth: 1.5 }}
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
        <div className={`border-b p-5 ${isProductivity ? 'border-orange-400/20 bg-gradient-to-r from-orange-400/[.09] via-card/80 to-amber-400/[.04]' : 'border-lime-400/15 bg-gradient-to-r from-lime-400/[.06] via-card/80 to-cyan-400/[.04]'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-[0_0_16px_rgba(249,115,22,.12)] ${isProductivity ? 'border-orange-400/35 bg-orange-400/[.1]' : 'border-lime-400/30 bg-lime-400/[.08]'}`}>
                <ClipboardCheck className={`h-5 w-5 ${isProductivity ? 'text-orange-300' : 'text-lime-300'}`} />
              </div>
              <div>
                <h2 className="font-semibold tracking-wide">
                  {isProductivity ? "Rotinas recorrentes" : "Acompanhamento dos hábitos"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isProductivity ? "Tarefas que se repetem e precisam de acompanhamento contínuo." : "Clique em cada dia para registrar feito, parcial ou não feito."}
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
                placeholder={`${isProductivity ? "Nome da tarefa" : "Nome do hábito"} (ex.: ${isProductivity ? "Revisar prioridades" : "Ler 20 minutos"})`}
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
                {isProductivity ? "Salvar tarefa" : "Salvar hábito"}
              </button>
            </div>
          )}
        </div>
        <div className="grid gap-4 p-3 sm:p-5">
          {Object.entries(grouped).map(([category, entries], categoryIndex) => {
            const categoryScore = categoryData.find((item) => item.name === category)?.execução ?? 0;
            const color = categoryColors[category] || ["#22D3EE", "#A78BFA", "#34D399", "#FB923C", "#F472B6"][categoryIndex % 5];
            const linkedProject = entries.find((entry) => entry.project)?.project || productivityProjects.find((project) => project.title.trim().toLowerCase() === category.trim().toLowerCase())?.title;
            return (
              <article
                key={category}
                className="overflow-hidden rounded-2xl border bg-card/70 shadow-[0_12px_30px_rgba(0,0,0,.14)]"
                style={{ borderColor: `${color}66` }}
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5"
                  style={{ borderColor: `${color}44`, background: `${color}10` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-1 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}99` }} />
                    <div>
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
                          className="h-8 w-48 rounded-md border border-cyan-400/60 bg-background px-2 text-sm outline-none"
                          aria-label={`Editar categoria ${category}`}
                        />
                      ) : (
                        <button type="button" onClick={() => startEditingCategory(category)} className="text-left text-base font-semibold text-foreground hover:text-cyan-300">
                          {category}
                        </button>
                      )}
                      <p className="text-[11px] text-muted-foreground">{entries.length} {entries.length === 1 ? (isProductivity ? "tarefa" : "hábito") : (isProductivity ? "tarefas" : "hábitos")} cadastradas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isProductivity && (
                      <select
                        value={linkedProject || ""}
                        onChange={(event) => {
                          const project = event.target.value || undefined;
                          habits
                            .filter((entry) => (entry.category || "Rotina") === category)
                            .forEach((entry) => updateHabitEntry(entry.id, { project }));
                        }}
                        className="h-8 min-w-32 max-w-44 appearance-none rounded-full border-0 bg-[#101923] px-3 text-[11px] font-medium text-foreground outline-none shadow-[0_0_14px_rgba(245,158,11,.08)] ring-1 ring-orange-400/30 transition hover:ring-orange-300/60 focus:ring-orange-300/80"
                        aria-label={`Projeto da categoria ${category}`}
                        title="Projeto vinculado"
                      >
                        <option value="">Sem projeto</option>
                        {productivityProjects.map((project) => <option key={project.id} value={project.title}>{project.title}</option>)}
                      </select>
                    )}
                    <button type="button" onClick={() => setAddingCategory(addingCategory === category ? null : category)} className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/25 px-2.5 py-1.5 text-[11px] text-cyan-300 hover:bg-cyan-400/10">
                      <Plus className="h-3 w-3" /> {isProductivity ? "Tarefa" : "Adicionar hábito"}
                    </button>
                    <button type="button" onClick={() => removeCategory(category)} title={`Excluir categoria ${category}`} className="rounded-lg border border-red-400/20 px-2 py-1.5 text-[11px] text-red-300/70 hover:bg-red-400/10">
                      Excluir
                    </button>
                    <span className="text-sm font-semibold text-lime-300">{categoryScore}%</span>
                    {isProductivity && linkedProject && (
                      <Link
                        href={`/projetos?project=${encodeURIComponent(linkedProject)}`}
                        className="rounded-lg border border-orange-400/25 p-1.5 text-orange-300/70 transition hover:bg-orange-400/10 hover:text-orange-200"
                        title={`Abrir projeto ${linkedProject}`}
                        aria-label={`Abrir projeto ${linkedProject}`}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
                {addingCategory === category && (
                  <div className="flex gap-2 border-b border-white/[.08] bg-background/20 p-3">
                    <input autoFocus value={categoryTitle} onChange={(e) => setCategoryTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addToCategory(category); if (e.key === "Escape") { setCategoryTitle(""); setAddingCategory(null); } }} placeholder={`${isProductivity ? "Nova tarefa" : "Novo hábito"} em ${category}`} className="h-9 min-w-0 flex-1 rounded-lg border border-white/[.1] bg-background px-3 text-sm outline-none focus:border-cyan-400" />
                    <button type="button" onClick={() => addToCategory(category)} className="rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-slate-950">Salvar</button>
                  </div>
                )}
                <div className="max-h-[360px] overflow-auto">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr className="border-b border-white/[.06] text-[10px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2.5 text-left font-medium sm:px-5">{isProductivity ? "Lista de tarefas" : "Hábito"}</th>
                        {executionDays.map((date) => (
                          <th key={keyOf(date)} className="px-2 py-2.5 text-center font-medium">
                            <span className="block">{dayLabel(date)}</span>
                            <span className="mt-0.5 block font-normal normal-case opacity-60">{dateLabel(date)}</span>
                          </th>
                        ))}
                        <th className="px-3 py-2.5 text-right font-medium text-lime-300/70">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((habit) => (
                        <tr
                          key={habit.id}
                          draggable
                          onDragStart={() => setDraggedHabitId(habit.id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => reorderWithinCategory(category, habit.id)}
                          onDragEnd={() => setDraggedHabitId(null)}
                          className={`border-b border-white/[.05] last:border-b-0 hover:bg-white/[.025] ${draggedHabitId === habit.id ? "opacity-40" : ""}`}
                        >
                          <td className="px-4 py-3 sm:px-5">
                            <div className={`flex items-center gap-2 ${habit.parentId ? "pl-7" : ""}`}>
                              <div className="min-w-0 flex-1">
                                {editingHabitId === habit.id ? (
                                  <input
                                    autoFocus
                                    value={editingHabitTitle}
                                    onChange={(e) => {
                                      editingHabitTitleRef.current = e.target.value;
                                      setEditingHabitTitle(e.target.value);
                                    }}
                                    onBlur={(e) => {
                                      if (skipHabitBlurRef.current) {
                                        skipHabitBlurRef.current = false;
                                        return;
                                      }
                                      saveEditingHabit(habit, editingHabitTitleRef.current || e.currentTarget.value);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        skipHabitBlurRef.current = true;
                                        saveEditingHabit(habit, editingHabitTitleRef.current || e.currentTarget.value);
                                      }
                                      if (e.key === "Escape") cancelEditingHabit();
                                    }}
                                    className="h-8 w-full max-w-[260px] rounded-md border border-cyan-400/60 bg-background px-2 text-sm text-foreground outline-none"
                                    aria-label={`Editar ${isProductivity ? "tarefa" : "hábito"} ${habit.title}`}
                                  />
                                ) : (
                                  <button type="button" onClick={() => startEditingHabit(habit)} className="block max-w-[260px] truncate text-left text-sm text-foreground/85 hover:text-cyan-300">{habit.title}</button>
                                )}
                                {subtaskParentId === habit.id && (
                                  <div className="mt-2 flex gap-1.5">
                                    <input
                                      autoFocus
                                      value={subtaskTitle}
                                      onChange={(event) => setSubtaskTitle(event.target.value)}
                                      onKeyDown={(event) => { if (event.key === "Enter") addSubtask(habit); if (event.key === "Escape") { setSubtaskTitle(""); setSubtaskParentId(null); } }}
                                      placeholder="Nome da subtarefa"
                                      className="h-7 min-w-0 flex-1 rounded-md border-0 bg-background px-2 text-[11px] outline-none ring-1 ring-cyan-400/40"
                                    />
                                    <button type="button" onClick={() => addSubtask(habit)} className="rounded-md bg-cyan-400 px-2 text-[10px] font-semibold text-slate-950">Salvar</button>
                                  </div>
                                )}
                              </div>
                              <button type="button" onClick={() => { setSubtaskParentId(subtaskParentId === habit.id ? null : habit.id); setSubtaskTitle(""); }} className="rounded-md p-1 text-muted-foreground/50 transition hover:bg-cyan-400/10 hover:text-cyan-300" title="Adicionar subtarefa" aria-label={`Adicionar subtarefa em ${habit.title}`}><Plus className="h-3.5 w-3.5" /></button>
                              <button type="button" onClick={() => removeHabit(habit)} className="text-muted-foreground/40 hover:text-red-400" title="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                          {executionDays.map((date) => (
                            <td key={keyOf(date)} className="px-2 py-3 text-center">
                              <HabitCell habit={habit} date={date} onChange={(status) => setHabitCheck(habit.id, keyOf(date), status)} />
                            </td>
                          ))}
                          <td className="px-3 py-3 text-right text-xs font-semibold text-lime-300/80">
                            {Math.round((executionDays.reduce((sum, date) => sum + statusScore(habit.checks?.[keyOf(date)]), 0) / executionDays.length) * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })}
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
