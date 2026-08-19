import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  Check,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Minus,
  Sparkles,
  X,
} from "lucide-react";
import { useAppStore, type IdentityStatus } from "@/store/useAppStore";

const keyOf = (date: Date) => date.toISOString().slice(0, 10);
const scoreOf: Record<IdentityStatus, number> = {
  done: 1,
  partial: 0.5,
  missed: 0,
};
const formatDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
const daysOf = (
  period: "day" | "week" | "fortnight" | "month" | "previousMonth",
) => {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  if (period === "day") return [now];
  if (period === "week" || period === "fortnight") {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return Array.from({ length: period === "week" ? 7 : 14 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
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
    (_, index) =>
      new Date(first.getFullYear(), first.getMonth(), index + 1, 12),
  );
};
function levelFor(score: number) {
  if (score >= 75)
    return {
      name: "Hauggusto IV",
      subtitle: "Expansão / Excelência",
      color: "#F97316",
    };
  if (score >= 50)
    return {
      name: "Hauggusto III",
      subtitle: "Estrutura / Consistência",
      color: "#3B82F6",
    };
  if (score >= 25)
    return {
      name: "Hauggusto II",
      subtitle: "Em Construção",
      color: "#10B981",
    };
  return {
    name: "Hauggusto I",
    subtitle: "Reativo / Sobrevivência",
    color: "#EF4444",
  };
}

export default function Identity() {
  const { habits, nextActions } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(() => keyOf(new Date()));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1, 12);
  });
  const [period, setPeriod] = useState<
    "day" | "week" | "fortnight" | "month" | "previousMonth"
  >("week");
  const [productivity, setProductivity] = useState<
    {
      status: "pending" | "executed" | "failed";
      quantity: number;
      date: string;
    }[]
  >([]);
  const [oneOffTasks, setOneOffTasks] = useState<
    { done: boolean; completedAt?: string | null }[]
  >([]);
  const [productivityTick, setProductivityTick] = useState(0);
  useEffect(() => {
    const load = () => {
      try {
        setProductivity(
          JSON.parse(
            localStorage.getItem("founder-os-daily-productivity") || "[]",
          ),
        );
        setOneOffTasks(
          JSON.parse(
            localStorage.getItem("founder-os-one-off-habit-tasks") || "[]",
          ),
        );
      } catch {
        setProductivity([]);
        setOneOffTasks([]);
      }
    };
    load();
    const event = () => {
      load();
      setProductivityTick((value) => value + 1);
    };
    window.addEventListener("founder-productivity-updated", event);
    window.addEventListener("storage", event);
    return () => {
      window.removeEventListener("founder-productivity-updated", event);
      window.removeEventListener("storage", event);
    };
  }, []);
  const days = useMemo(() => daysOf(period), [period]);
  void productivityTick;
  const statusAt = (habit: (typeof habits)[number], date: Date) =>
    habit.checks?.[keyOf(date)] || null;
  const chartData = days.map((date) => {
    const statuses = habits
      .map((habit) => statusAt(habit, date))
      .filter(Boolean) as IdentityStatus[];
    const habitScore = statuses.length
      ? Math.round(
          (statuses.reduce((sum, status) => sum + scoreOf[status], 0) /
            statuses.length) *
            100,
        )
      : null;
    const entries = productivity.filter((item) => item.date === keyOf(date));
    const actionEntries = nextActions.filter((item) => item.date === keyOf(date) || item.completedAt === keyOf(date));
    const oneOffDone = oneOffTasks.filter(
      (item) => item.done && item.completedAt === keyOf(date),
    ).length;
    const actionDone = actionEntries.filter((item) => item.done).length;
    const actionFailed = actionEntries.filter((item) => item.executionStatus === 'failed').length;
    const done =
      entries
        .filter((item) => item.status === "executed")
        .reduce((sum, item) => sum + item.quantity, 0) + oneOffDone;
    const failed = entries
      .filter((item) => item.status === "failed")
      .reduce((sum, item) => sum + item.quantity, 0) + actionFailed;
    const totalActionDone = done + actionDone;
    const productivityScore =
      totalActionDone + failed ? Math.round((totalActionDone / (totalActionDone + failed)) * 100) : null;
    const values = [habitScore, productivityScore].filter(
      (value): value is number => value !== null,
    );
    return {
      label: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      }),
      score: values.length
        ? Math.round(
            values.reduce((sum, value) => sum + value, 0) / values.length,
          )
        : 0,
    };
  });
  const tracked = chartData.filter((day) => day.score > 0);
  const score = tracked.length
    ? Math.round(
        tracked.reduce((sum, day) => sum + day.score, 0) / tracked.length,
      )
    : 0;
  const level = levelFor(score);
  const periodKeys = new Set(days.map(keyOf));
  const habitValues = habits.flatMap(
    (habit) =>
      days
        .map((date) => statusAt(habit, date))
        .filter(Boolean) as IdentityStatus[],
  );
  const habitScore = habitValues.length
    ? Math.round(
        (habitValues.reduce((sum, status) => sum + scoreOf[status], 0) /
          habitValues.length) *
          100,
      )
    : 0;
  const periodProductivity = productivity.filter((item) =>
    periodKeys.has(item.date),
  );
  const productivityDone = periodProductivity
    .filter((item) => item.status === "executed")
    .reduce((sum, item) => sum + item.quantity, 0);
  const productivityFailed = periodProductivity
    .filter((item) => item.status === "failed")
    .reduce((sum, item) => sum + item.quantity, 0);
  const productivityScore =
    productivityDone + productivityFailed
      ? Math.round(
          (productivityDone / (productivityDone + productivityFailed)) * 100,
        )
      : 0;
  const selectedDateObject = new Date(`${selectedDate}T12:00:00`);
  const selectedHabits = habits
    .map((habit) => ({ habit, status: habit.checks?.[selectedDate] || null }))
    .filter((item) => item.status !== null);
  const selectedProductivity = productivity.filter(
    (item) => item.date === selectedDate,
  );
  const selectedOneOffDone = oneOffTasks.filter(
    (item) => item.done && item.completedAt === selectedDate,
  ).length;
  const selectedExecuted =
    selectedProductivity
      .filter((item) => item.status === "executed")
      .reduce((sum, item) => sum + item.quantity, 0) + selectedOneOffDone;
  const selectedFailed = selectedProductivity
    .filter((item) => item.status === "failed")
    .reduce((sum, item) => sum + item.quantity, 0);
  const selectedActions = nextActions.filter((item) => item.date === selectedDate || item.completedAt === selectedDate);
  const selectedActionDone = selectedActions.filter((item) => item.done).length;
  const selectedActionFailed = selectedActions.filter((item) => item.executionStatus === 'failed').length;
  const selectedHabitScore = selectedHabits.length
    ? Math.round(
        (selectedHabits.reduce(
          (sum, item) => sum + scoreOf[item.status as IdentityStatus],
          0,
        ) /
          selectedHabits.length) *
          100,
      )
    : null;
  const selectedProductivityTotal =
    selectedExecuted + selectedFailed + selectedProductivity.length + selectedActions.length;
  const selectedProductivityScore = selectedProductivityTotal
    ? Math.round(
        ((selectedExecuted + selectedActionDone) / (selectedExecuted + selectedActionDone + selectedFailed + selectedActionFailed || 1)) * 100,
      )
    : null;
  const selectedValues = [
    selectedHabitScore,
    selectedProductivityScore,
  ].filter((value): value is number => value !== null);
  const selectedScore = selectedValues.length
    ? Math.round(
        selectedValues.reduce((sum, value) => sum + value, 0) /
          selectedValues.length,
      )
    : 0;
  const selectedLevel = levelFor(selectedScore);
  const selectedLabel = selectedDateObject.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
  const pickerDays = useMemo(() => {
    const firstDay = new Date(
      pickerMonth.getFullYear(),
      pickerMonth.getMonth(),
      1,
      12,
    );
    const offset = (firstDay.getDay() + 6) % 7;
    const totalDays = new Date(
      pickerMonth.getFullYear(),
      pickerMonth.getMonth() + 1,
      0,
      12,
    ).getDate();
    return Array.from({ length: offset + totalDays }, (_, index) =>
      index < offset
        ? null
        : new Date(
            pickerMonth.getFullYear(),
            pickerMonth.getMonth(),
            index - offset + 1,
            12,
          ),
    );
  }, [pickerMonth]);
  const distribution = [
    {
      name: "Hauggusto I",
      subtitle: "Reativo / Sobrevivência",
      color: "#EF4444",
      min: 0,
      max: 24,
    },
    {
      name: "Hauggusto II",
      subtitle: "Em Construção",
      color: "#10B981",
      min: 25,
      max: 49,
    },
    {
      name: "Hauggusto III",
      subtitle: "Estrutura / Consistência",
      color: "#3B82F6",
      min: 50,
      max: 74,
    },
    {
      name: "Hauggusto IV",
      subtitle: "Expansão / Excelência",
      color: "#F97316",
      min: 75,
      max: 100,
    },
  ].map((item) => {
    const daysInLevel = tracked.filter(
      (day) => day.score >= item.min && day.score <= item.max,
    ).length;
    return {
      ...item,
      days: daysInLevel,
      percentage: tracked.length
        ? Math.round((daysInLevel / tracked.length) * 100)
        : 0,
    };
  });
  const dominant = [...distribution].sort((a, b) => b.days - a.days)[0];
  const statusIcon = (status: IdentityStatus | null) =>
    status === "done" ? (
      <Check className="h-3.5 w-3.5" />
    ) : status === "partial" ? (
      <Minus className="h-3.5 w-3.5" />
    ) : status === "missed" ? (
      <X className="h-3.5 w-3.5" />
    ) : (
      <span>·</span>
    );
  const statusClass = (status: IdentityStatus | null) =>
    status === "done"
      ? "border-emerald-500/60 bg-emerald-950/70 text-emerald-300"
      : status === "partial"
        ? "border-orange-500/60 bg-orange-950/70 text-orange-300"
        : status === "missed"
          ? "border-red-500/60 bg-red-950/70 text-red-300"
          : "border-border/50 bg-background/40 text-transparent";
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <header className="rounded-2xl border border-purple-400/25 bg-gradient-to-r from-[#141024] via-card to-[#10141e] p-6">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-purple-300">
          IDENTIDADE / RESUMO
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Identidade</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Um resumo automático de quem você está sendo através dos hábitos
              executados.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/40 px-4 py-3">
            <CalendarDays className="h-7 w-7 text-purple-300" />
            <div>
              <p className="text-2xl font-bold">{score}%</p>
              <p className="text-xs text-muted-foreground">
                execução no período
              </p>
            </div>
          </div>
        </div>
        <div
          className="mt-5 flex items-center gap-4 rounded-xl border p-4"
          style={{
            borderColor: `${level.color}66`,
            background: `${level.color}0d`,
          }}
        >
          <div
            className="h-11 w-11 rounded-full"
            style={{
              background: level.color,
              boxShadow: `0 0 20px ${level.color}88`,
            }}
          />
          <div>
            <p className="text-xl font-bold" style={{ color: level.color }}>
              {level.name}
            </p>
            <p className="text-sm text-muted-foreground">{level.subtitle}</p>
          </div>
        </div>
      </header>
      <section className="rounded-xl border border-purple-400/20 bg-card/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-purple-300">
              LEITURA DO DIA
            </p>
            <h2 className="mt-1 text-xl font-semibold capitalize">
              {selectedLabel}
            </h2>
            <p className="text-xs text-muted-foreground">
              Hábitos e tarefas executadas consolidados em uma única visão.
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-400/35 bg-background/80 px-3 py-2 text-sm text-foreground transition hover:border-cyan-300"
            >
              <CalendarDays className="h-4 w-4 text-cyan-300" />
              {formatDate(selectedDate)}
            </button>
            {pickerOpen && (
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-purple-400/30 bg-[#121722] p-3 shadow-[0_18px_45px_rgba(0,0,0,.45)]">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setPickerMonth(
                        new Date(
                          pickerMonth.getFullYear(),
                          pickerMonth.getMonth() - 1,
                          1,
                          12,
                        ),
                      )
                    }
                    className="rounded-md p-1 text-muted-foreground hover:bg-purple-400/10 hover:text-cyan-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold capitalize">
                    {pickerMonth.toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPickerMonth(
                        new Date(
                          pickerMonth.getFullYear(),
                          pickerMonth.getMonth() + 1,
                          1,
                          12,
                        ),
                      )
                    }
                    className="rounded-md p-1 text-muted-foreground hover:bg-purple-400/10 hover:text-cyan-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="mb-1 grid grid-cols-7 text-center text-[10px] uppercase text-muted-foreground">
                  {['2ª', '3ª', '4ª', '5ª', '6ª', 'S', 'D'].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {pickerDays.map((date, index) =>
                    date ? (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => {
                          setSelectedDate(keyOf(date));
                          setPickerOpen(false);
                        }}
                        className={`h-8 rounded-md text-xs transition ${keyOf(date) === selectedDate ? "bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,.45)]" : "text-muted-foreground hover:bg-cyan-400/10 hover:text-cyan-200"}`}
                      >
                        {date.getDate()}
                      </button>
                    ) : (
                      <span key={`empty-${index}`} />
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-purple-400/25 bg-purple-400/5 p-3">
            <p className="text-xs text-muted-foreground">Execução do dia</p>
            <p className="text-2xl font-bold" style={{ color: selectedLevel.color }}>
              {selectedScore}%
            </p>
          </div>
          <div className="rounded-lg border border-cyan-400/25 bg-cyan-400/5 p-3">
            <p className="text-xs text-muted-foreground">Hábitos</p>
            <p className="text-xl font-semibold text-cyan-300">
              {selectedHabitScore === null ? "—" : `${selectedHabitScore}%`}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-3">
            <p className="text-xs text-muted-foreground">Produtividade</p>
            <p className="text-xl font-semibold text-emerald-300">
              {selectedProductivityScore === null
                ? "—"
                : `${selectedProductivityScore}%`}
            </p>
          </div>
          <div
            className="rounded-lg border p-3"
            style={{
              borderColor: `${selectedLevel.color}55`,
              background: `${selectedLevel.color}0d`,
            }}
          >
            <p className="text-xs text-muted-foreground">Leitura</p>
            <p className="text-sm font-semibold" style={{ color: selectedLevel.color }}>
              {selectedScore >= 75
                ? "Dia de expansão"
                : selectedScore >= 50
                  ? "Dia consistente"
                  : selectedScore >= 25
                    ? "Dia em construção"
                    : "Atenção necessária"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          <div className="rounded-lg border border-white/[.08] bg-background/30 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              O que foi feito
            </p>
            {selectedHabits.filter((item) => item.status === "done").length ||
            selectedExecuted ? (
              <p className="text-sm text-emerald-300">
                {selectedHabits.filter((item) => item.status === "done").length} hábitos concluídos, {selectedExecuted} entregas e {selectedActionDone} ações pontuais executadas.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Nada concluído neste dia.</p>
            )}
          </div>
          <div className="rounded-lg border border-white/[.08] bg-background/30 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pontos de atenção
            </p>
            {selectedHabits.filter((item) => item.status !== "done").length ||
            selectedFailed ? (
              <p className="text-sm text-orange-300">
                {selectedHabits.filter((item) => item.status !== "done").length} hábitos parciais ou não executados, {selectedFailed + selectedActionFailed} tarefas não realizadas e {selectedActions.filter((item) => !item.done && item.executionStatus !== 'failed').length} ações pendentes.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum ponto de atenção registrado.</p>
            )}
          </div>
        </div>
      </section>
      <section className="rounded-xl border border-border/70 bg-card/70 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-300" />
            <div>
              <h2 className="font-semibold">
                Consolidação: hábitos + produtividade
              </h2>
              <p className="text-xs text-muted-foreground">
                A Identidade combina rotina e entregas para mostrar sua evolução
                real.
              </p>
            </div>
          </div>
          <div className="flex gap-1 rounded-lg border border-border/70 bg-background/40 p-1">
            <button
              onClick={() => setPeriod("day")}
              className={`rounded-md px-3 py-1.5 text-xs ${period === "day" ? "bg-purple-500 text-white" : "text-muted-foreground"}`}
            >
              Dia
            </button>
            <button
              onClick={() => setPeriod("week")}
              className={`rounded-md px-3 py-1.5 text-xs ${period === "week" ? "bg-purple-500 text-white" : "text-muted-foreground"}`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriod("fortnight")}
              className={`rounded-md px-3 py-1.5 text-xs ${period === "fortnight" ? "bg-purple-500 text-white" : "text-muted-foreground"}`}
            >
              Quinzena
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`rounded-md px-3 py-1.5 text-xs ${period === "month" ? "bg-purple-500 text-white" : "text-muted-foreground"}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setPeriod("previousMonth")}
              className={`rounded-md px-3 py-1.5 text-xs ${period === "previousMonth" ? "bg-purple-500 text-white" : "text-muted-foreground"}`}
            >
              Mês anterior
            </button>
          </div>
        </div>
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-3">
            <p className="text-xs text-muted-foreground">Hábitos</p>
            <p className="text-2xl font-bold text-cyan-300">{habitScore}%</p>
          </div>
          <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-3">
            <p className="text-xs text-muted-foreground">Produtividade</p>
            <p className="text-2xl font-bold text-emerald-300">
              {productivityScore}%
            </p>
          </div>
          <div className="rounded-xl border border-purple-400/25 bg-purple-400/5 p-3">
            <p className="text-xs text-muted-foreground">
              Identidade consolidada
            </p>
            <p className="text-2xl font-bold text-purple-300">{score}%</p>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid stroke="rgba(148,163,184,.09)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#10141d",
                  border: "1px solid #334155",
                  borderRadius: 8,
                }}
                formatter={(value) => [`${value}%`, "Consolidação"]}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke={level.color}
                fill={level.color}
                fillOpacity={0.14}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card/70">
        <div className="border-b border-border/60 p-5">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-purple-300" />
            <div>
              <h2 className="font-semibold">Resumo do checklist de hábitos</h2>
              <p className="text-xs text-muted-foreground">
                Somente leitura. Para registrar ou editar, use a aba Hábitos.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-xs text-muted-foreground">
                <th className="sticky left-0 z-10 bg-card px-5 py-3 text-left">
                  Hábito
                </th>
                {days.map((date) => (
                  <th key={keyOf(date)} className="px-2 py-3 text-center">
                    <span className="block uppercase">
                      {date
                        .toLocaleDateString("pt-BR", { weekday: "short" })
                        .replace(".", "")}
                    </span>
                    <span>{date.getDate()}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr
                  key={habit.id}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="sticky left-0 bg-card px-5 py-4">
                    <p className="text-sm font-medium">{habit.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {habit.category}
                    </p>
                  </td>
                  {days.map((date) => {
                    const status = statusAt(habit, date);
                    return (
                      <td key={keyOf(date)} className="px-2 py-4 text-center">
                        <span
                          className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md border ${statusClass(status)}`}
                        >
                          {statusIcon(status)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-xl border border-border/70 bg-card/70 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Distribuição da identidade</h2>
            <p className="text-xs text-muted-foreground">
              A evolução dos hábitos define o nível dominante no período.
            </p>
          </div>
          <div
            className="rounded-lg border px-3 py-2 text-right"
            style={{
              borderColor: `${dominant.color}66`,
              background: `${dominant.color}12`,
            }}
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Modo dominante
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: dominant.color }}
            >
              {dominant.name}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {dominant.subtitle}
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {distribution.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border p-4"
              style={{
                borderColor: `${item.color}66`,
                background: `${item.color}0d`,
                boxShadow: `0 0 14px ${item.color}12`,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: item.color }}
                  >
                    {item.percentage}%
                  </p>
                  <p
                    className="mt-1 text-sm font-medium"
                    style={{ color: item.color }}
                  >
                    {item.name}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.days} {item.days === 1 ? "dia" : "dias"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {item.subtitle}
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
