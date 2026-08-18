import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Check, CircleX, Plus, Trash2 } from "lucide-react";

type Activity = {
  id: string;
  text: string;
  area: string;
  quantity: number;
  date: string;
  status: "pending" | "executed" | "failed";
};
type OneOffTask = {
  id: string;
  title: string;
  area?: string;
  done: boolean;
  completedAt?: string | null;
};
const KEY = "founder-os-daily-productivity";

export function ProductivityPanel() {
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [text, setText] = useState("");
  const [area, setArea] = useState("Produtividade");
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState<Activity["status"]>("pending");
  const [timelinePeriod, setTimelinePeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("weekly");
  const [taskPeriod, setTaskPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [oneOffTitle, setOneOffTitle] = useState("");
  const [oneOffArea, setOneOffArea] = useState("Soul Krieg");
  const [oneOffTasks, setOneOffTasks] = useState<OneOffTask[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("founder-os-one-off-habit-tasks") || "[]",
      );
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(activities));
    window.dispatchEvent(new CustomEvent("founder-productivity-updated"));
  }, [activities]);
  const today = new Date().toISOString().slice(0, 10);
  const executed = activities
    .filter((item) => item.status === "executed")
    .reduce((sum, item) => sum + item.quantity, 0);
  const failed = activities
    .filter((item) => item.status === "failed")
    .reduce((sum, item) => sum + item.quantity, 0);
  const pending = activities
    .filter((item) => item.status === "pending")
    .reduce((sum, item) => sum + item.quantity, 0);
  const score =
    executed + failed ? Math.round((executed / (executed + failed)) * 100) : 0;
  const saveOneOff = (tasks: OneOffTask[]) => {
    setOneOffTasks(tasks);
    localStorage.setItem(
      "founder-os-one-off-habit-tasks",
      JSON.stringify(tasks),
    );
  };
  const addOneOff = () => {
    if (!oneOffTitle.trim()) return;
    saveOneOff([
      ...oneOffTasks,
      {
        id: `task-${Date.now()}`,
        title: oneOffTitle.trim(),
        area: oneOffArea.trim() || "Geral",
        done: false,
        completedAt: null,
      },
    ]);
    setOneOffTitle("");
  };
  const chartData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        const key = date.toISOString().slice(0, 10);
        return {
          name: date
            .toLocaleDateString("pt-BR", { weekday: "short" })
            .replace(".", ""),
          executadas: activities
            .filter((item) => item.date === key && item.status === "executed")
            .reduce((sum, item) => sum + item.quantity, 0),
          nãoConseguidas: activities
            .filter((item) => item.date === key && item.status === "failed")
            .reduce((sum, item) => sum + item.quantity, 0),
        };
      }),
    [activities],
  );
  const timelineRows = useMemo(
    () => {
      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);
      const monthKey = todayKey.slice(0, 7);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 6);
      const weekStartKey = weekStart.toISOString().slice(0, 10);
      const visibleActivities = activities.filter((item) =>
        timelinePeriod === "daily"
          ? item.date === todayKey
          : timelinePeriod === "monthly"
            ? item.date.startsWith(monthKey)
            : item.date >= weekStartKey && item.date <= todayKey,
      );
      return [...new Set(visibleActivities.map((item) => item.area || "Produtividade"))].map(
        (name) => {
          const items = visibleActivities.filter(
            (item) => (item.area || "Produtividade") === name,
          );
          const total = items.reduce((sum, item) => sum + item.quantity, 0);
          const done = items
            .filter((item) => item.status === "executed")
            .reduce((sum, item) => sum + item.quantity, 0);
          return {
            name,
            percent: total ? Math.round((done / total) * 100) : 0,
            status: items.some((item) => item.status === "pending")
              ? "Em andamento"
              : "Concluído",
          };
        },
      );
    },
    [activities, timelinePeriod],
  );
  const addActivity = () => {
    if (!text.trim()) return;
    setActivities([
      ...activities,
      {
        id: `activity-${Date.now()}`,
        text: text.trim(),
        area: area.trim() || "Produtividade",
        quantity: Math.max(1, Number(quantity) || 1),
        date: today,
        status,
      },
    ]);
    setText("");
    setQuantity("1");
    setStatus("pending");
  };
  const cycleStatus = (id: string) =>
    setActivities((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "pending"
                  ? "executed"
                  : item.status === "executed"
                    ? "failed"
                    : "pending",
            }
          : item,
      ),
    );
  return (
    <section className="flex flex-col rounded-2xl border border-emerald-400/20 bg-[#061510]/55 p-5 shadow-[0_18px_50px_rgba(16,185,129,.08)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-emerald-400/10 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-emerald-300">
            CENTRAL DE EXECUÇÃO
          </p>
          <h2 className="mt-1 text-xl font-semibold">Ritmo de produtividade</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Registre ações pontuais e veja o impacto real por área.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            ["Índice", `${score}%`, "text-emerald-300"],
            ["Feitas", executed, "text-cyan-300"],
            ["Pendentes", pending, "text-amber-300"],
            ["Não feitas", failed, "text-orange-300"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="min-w-[70px] rounded-xl border border-white/[.07] bg-background/45 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="order-2">
      <ProductivityTimeline
        rows={timelineRows}
        period={timelinePeriod}
        setPeriod={setTimelinePeriod}
      />
      <section className="mb-6 rounded-2xl border border-emerald-400/15 bg-background/25 p-4">
        <div className="mb-4 flex items-end justify-between gap-3 border-b border-emerald-400/10 pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-emerald-300">
              ÁREAS DE EXECUÇÃO
            </p>
            <h2 className="mt-1 text-lg font-semibold">Foco por área</h2>
          </div>
          <span className="text-xs text-muted-foreground">Atualizado pelos registros</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {timelineRows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/[.1] p-5 text-center text-xs text-muted-foreground md:col-span-2 xl:col-span-3">
              Registre uma atividade para criar sua primeira área de execução.
            </p>
          ) : timelineRows.map((row, index) => (
            <article
              key={row.name}
              className={`rounded-xl border p-4 ${index % 3 === 0 ? "border-cyan-400/25 bg-cyan-400/[.035]" : index % 3 === 1 ? "border-violet-400/25 bg-violet-400/[.035]" : "border-emerald-400/25 bg-emerald-400/[.035]"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-sm font-medium text-foreground/90">{row.name}</h3>
                <span className="rounded-full border border-white/[.1] bg-white/[.03] px-2 py-1 text-xs font-semibold text-emerald-300">
                  {row.percent}%
                </span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[.07]">
                <div
                  className={`h-full rounded-full ${index % 3 === 0 ? "bg-cyan-400" : index % 3 === 1 ? "bg-violet-400" : "bg-emerald-400"}`}
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">{row.status}</p>
            </article>
          ))}
        </div>
      </section>
      </div>
      {false && (
        <OneOffTaskList
          tasks={oneOffTasks}
          title={oneOffTitle}
          setTitle={setOneOffTitle}
          add={addOneOff}
          save={saveOneOff}
        />
      )}
      <UnifiedTaskList
        tasks={oneOffTasks}
        taskTitle={oneOffTitle}
        setTaskTitle={setOneOffTitle}
        taskArea={oneOffArea}
        setTaskArea={setOneOffArea}
        addTask={addOneOff}
        saveTasks={saveOneOff}
        activities={activities}
        taskPeriod={taskPeriod}
        setTaskPeriod={setTaskPeriod}
        chartData={chartData}
        text={text}
        setText={setText}
        area={area}
        setArea={setArea}
        quantity={quantity}
        setQuantity={setQuantity}
        status={status}
        setStatus={setStatus}
        addActivity={addActivity}
        toggleActivity={cycleStatus}
        removeActivity={(id) =>
          setActivities(activities.filter((item) => item.id !== id))
        }
      />
      {false && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-400">
              PRODUTIVIDADE DIÁRIA
            </p>
            <h2 className="mt-1 text-xl font-semibold">O que eu fiz hoje?</h2>
            <p className="text-xs text-muted-foreground">
              Registre o que foi executado e também o que não conseguiu
              realizar.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Metric label="Execução" value={`${score}%`} color="#10B981" />
            <Metric label="Feitas" value={executed} color="#00C9FF" />
            <Metric label="Não feitas" value={failed} color="#F97316" />
          </div>
        </div>
      )}
      {false && (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="mb-3 space-y-2">
              {activities
                .filter((item) => item.date === today)
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-black/20 p-3"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${activity.status === "executed" ? "bg-emerald-500/15 text-emerald-400" : "bg-orange-500/15 text-orange-300"}`}
                    >
                      {activity.status === "executed" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <CircleX className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 text-xs">
                      <span className="block">{activity.text}</span>
                      <small className="text-[10px] text-muted-foreground">
                        {activity.area} · {activity.quantity}x ·{" "}
                        {activity.status === "executed"
                          ? "Executado"
                          : "Não consegui executar"}
                      </small>
                    </span>
                    <button
                      onClick={() =>
                        setActivities(
                          activities.filter((item) => item.id !== activity.id),
                        )
                      }
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              {!activities.filter((item) => item.date === today).length && (
                <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-xs text-muted-foreground">
                  Registre sua primeira atividade de hoje.
                </p>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_140px_80px_170px_auto]">
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && addActivity()}
                placeholder="O que você fez ou não conseguiu fazer?"
                className="rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:border-emerald-400"
              />
              <input
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="Área"
                className="rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:border-emerald-400"
              />
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:border-emerald-400"
              />
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as Activity["status"])
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-xs outline-none"
              >
                <option value="executed">Consegui executar</option>
                <option value="failed">Não consegui executar</option>
              </select>
              <button
                onClick={addActivity}
                className={`inline-flex items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-medium text-black ${status === "executed" ? "bg-emerald-500" : "bg-orange-400"}`}
              >
                <Plus className="h-3.5 w-3.5" /> Registrar
              </button>
            </div>
          </div>
          <div className="h-64 rounded-xl border border-white/[0.07] bg-black/20 p-3">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              Execução x não execução · últimos 7 dias
            </p>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData}>
                <CartesianGrid
                  stroke="rgba(148,163,184,.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#061510",
                    border: "1px solid #10b98155",
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  dataKey="executadas"
                  name="Executadas"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="nãoConseguidas"
                  name="Não realizadas"
                  fill="#F97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}

function UnifiedTaskList({
  tasks,
  taskTitle,
  setTaskTitle,
  taskArea,
  setTaskArea,
  addTask,
  saveTasks,
  activities,
  taskPeriod,
  setTaskPeriod,
  chartData,
  text,
  setText,
  area,
  setArea,
  quantity,
  setQuantity,
  status,
  setStatus,
  addActivity,
  toggleActivity,
  removeActivity,
}: {
  tasks: OneOffTask[];
  taskTitle: string;
  setTaskTitle: (value: string) => void;
  taskArea: string;
  setTaskArea: (value: string) => void;
  addTask: () => void;
  saveTasks: (tasks: OneOffTask[]) => void;
  activities: Activity[];
  taskPeriod: "daily" | "weekly" | "monthly";
  setTaskPeriod: (period: "daily" | "weekly" | "monthly") => void;
  chartData: { name: string; executadas: number; nãoConseguidas: number }[];
  text: string;
  setText: (value: string) => void;
  area: string;
  setArea: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  status: Activity["status"];
  setStatus: (value: Activity["status"]) => void;
  addActivity: () => void;
  toggleActivity: (id: string) => void;
  removeActivity: (id: string) => void;
}) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const visibleActivities = activities.filter((activity) => {
    if (taskPeriod === "daily") return activity.date === todayKey;
    const start = new Date();
    start.setDate(start.getDate() - (taskPeriod === "weekly" ? 6 : 29));
    return activity.date >= start.toISOString().slice(0, 10) && activity.date <= todayKey;
  });
  const groupedActivities = Object.entries(
    visibleActivities.reduce<Record<string, Activity[]>>((groups, activity) => {
      (groups[activity.area || "Geral"] ||= []).push(activity);
      return groups;
    }, {}),
  );
  return (
    <section className="order-1 mb-6 rounded-2xl border border-white/[.08] bg-card/60 p-5 shadow-[0_12px_30px_rgba(16,185,129,.05)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Lista de tarefas avulsas</h2>
          <p className="text-xs text-muted-foreground">
            Tarefas pontuais e registros do dia, com métrica de execução.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-emerald-400/20 bg-background/50 p-1">
          {(["daily", "weekly", "monthly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTaskPeriod(value)}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${taskPeriod === value ? "bg-emerald-400/15 text-emerald-200" : "text-muted-foreground hover:text-foreground"}`}
            >
              {value === "daily" ? "Diário" : value === "weekly" ? "Semanal" : "Mensal"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && addTask()}
            placeholder="Ex.: renovar documento"
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-emerald-400"
          />
          <input
            value={taskArea}
            onChange={(event) => setTaskArea(event.target.value)}
            placeholder="Projeto ou área"
            className="h-9 w-36 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-emerald-400"
          />
          <button
            onClick={addTask}
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-400 px-3 text-sm font-semibold text-slate-950"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300">Tarefas para executar</p>
            <div className="grid gap-3 md:grid-cols-2">
              {groupedActivities.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma tarefa registrada neste período.</p>
              ) : groupedActivities.map(([group, groupItems], index) => (
                <article key={group} className={`rounded-xl border p-3 ${index % 3 === 0 ? "border-emerald-400/25 bg-emerald-400/[.035]" : index % 3 === 1 ? "border-amber-400/25 bg-amber-400/[.035]" : "border-cyan-400/25 bg-cyan-400/[.035]"}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground/90">{group}</h3>
                    <span className="text-[10px] text-muted-foreground">{groupItems.length} ações</span>
                  </div>
                  <div className="space-y-1.5">
                    {groupItems.map((activity) => (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => toggleActivity(activity.id)}
                        className="flex w-full items-center gap-2 rounded-lg border border-white/[.07] bg-background/45 p-2.5 text-left transition hover:border-emerald-400/35"
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${activity.status === "executed" ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300" : activity.status === "failed" ? "border-orange-400/60 bg-orange-400/15 text-orange-300" : "border-cyan-400/30 text-cyan-300"}`}>
                          {activity.status === "executed" ? "✓" : activity.status === "failed" ? "×" : "·"}
                        </span>
                        <span className={`flex-1 text-xs ${activity.status === "executed" ? "text-muted-foreground line-through" : "text-foreground/85"}`}>{activity.text}</span>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="mb-3 space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-white/[.07] bg-black/20 p-3"
              >
                <button
                  type="button"
                  onClick={() =>
                    saveTasks(
                      tasks.map((item) =>
                        item.id === task.id
                          ? {
                              ...item,
                              done: !item.done,
                              completedAt: item.done
                                ? null
                                : new Date().toISOString().slice(0, 10),
                            }
                          : item,
                      ),
                    )
                  }
                  className={`flex h-6 w-6 items-center justify-center rounded-full border ${task.done ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-300" : "border-emerald-400/30 text-transparent"}`}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <span
                  className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : "text-foreground/80"}`}
                >
                  {task.title}
                  <small className="ml-2 text-[10px] text-cyan-300/70">
                    {task.area || "Geral"}
                  </small>
                  <small className="ml-2 text-[10px] text-muted-foreground/60">
                    {task.done && task.completedAt
                      ? `executada em ${task.completedAt.split("-").reverse().join("/")}`
                      : "pendente"}
                  </small>
                </span>
                <button
                  onClick={() =>
                    saveTasks(tasks.filter((item) => item.id !== task.id))
                  }
                  className="text-muted-foreground/50 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {!tasks.length && (
              <p className="rounded-lg border border-dashed border-white/10 p-5 text-center text-xs text-muted-foreground">
                Nenhuma tarefa avulsa adicionada.
              </p>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_140px_80px_170px_auto]">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="O que você fez ou não conseguiu fazer?"
              className="rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:border-emerald-400"
            />
            <input
              value={area}
              onChange={(event) => setArea(event.target.value)}
              placeholder="Área"
              className="rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:border-emerald-400"
            />
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:border-emerald-400"
            />
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as Activity["status"])
              }
              className="rounded-md border border-border bg-background px-3 py-2 text-xs outline-none"
            >
              <option value="executed">Consegui executar</option>
              <option value="failed">Não consegui executar</option>
            </select>
            <button
              onClick={addActivity}
              className="inline-flex items-center justify-center gap-1 rounded-md bg-orange-400 px-3 py-2 text-xs font-medium text-black"
            >
              <Plus className="h-3.5 w-3.5" />
              Registrar
            </button>
          </div>
        </div>
        <div className="h-64 rounded-xl border border-white/[.07] bg-black/20 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            Execução x não execução · últimos 7 dias
          </p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="rgba(148,163,184,.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#061510",
                  border: "1px solid #10b98155",
                  borderRadius: 8,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar
                dataKey="executadas"
                name="Executadas"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="nãoConseguidas"
                name="Não realizadas"
                fill="#F97316"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function OneOffTaskList({
  tasks,
  title,
  setTitle,
  add,
  save,
}: {
  tasks: OneOffTask[];
  title: string;
  setTitle: (value: string) => void;
  add: () => void;
  save: (tasks: OneOffTask[]) => void;
}) {
  return (
    <section className="mb-6 rounded-2xl border border-white/[.08] bg-card/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Lista de tarefas avulsas</h2>
          <p className="text-xs text-muted-foreground">
            Ações pontuais que entram na métrica no dia em que forem executadas.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && add()}
            placeholder="Ex.: renovar documento"
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-emerald-400"
          />
          <button
            onClick={add}
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-400 px-3 text-sm font-semibold text-slate-950"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/[.1] px-4 py-5 text-center text-xs text-muted-foreground">
            Nenhuma tarefa avulsa adicionada.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-background/35 px-3 py-3"
            >
              <button
                type="button"
                onClick={() =>
                  save(
                    tasks.map((item) =>
                      item.id === task.id
                        ? {
                            ...item,
                            done: !item.done,
                            completedAt: item.done
                              ? null
                              : new Date().toISOString().slice(0, 10),
                          }
                        : item,
                    ),
                  )
                }
                className={`flex h-5 w-5 items-center justify-center rounded-md border ${task.done ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-300" : "border-emerald-400/30"}`}
              >
                {task.done && <Check className="h-3.5 w-3.5" />}
              </button>
              <span
                className={`flex-1 text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground/80"}`}
              >
                {task.title}
                <small className="ml-2 text-[10px] text-muted-foreground/60">
                  {task.done && task.completedAt
                    ? `executada em ${task.completedAt.split("-").reverse().join("/")}`
                    : "pendente"}
                </small>
              </span>
              <button
                type="button"
                onClick={() =>
                  save(tasks.filter((item) => item.id !== task.id))
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
  );
}

function ProductivityTimeline({
  rows,
  period,
  setPeriod,
}: {
  rows: { name: string; percent: number; status: string }[];
  period: "daily" | "weekly" | "monthly";
  setPeriod: (period: "daily" | "weekly" | "monthly") => void;
}) {
  const labels =
    period === "daily"
      ? ["HOJE"]
      : period === "weekly"
      ? [
          "28 JUL - 03 AGO",
          "04 AGO - 10 AGO",
          "11 AGO - 17 AGO",
          "18 AGO - 24 AGO",
          "25 AGO - 31 AGO",
        ]
      : period === "monthly"
        ? ["MAI", "JUN", "JUL", "AGO"]
        : ["2023", "2024", "2025", "2026"];
  return (
    <section className="mb-6 rounded-2xl border border-cyan-400/15 bg-[#06101a]/80 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-300">
            LINHA DO TEMPO GERAL
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Evolução das áreas registradas na produtividade.
          </p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-cyan-400/20 bg-background/40 p-0.5">
          {(
            [
              ["daily", "DIÁRIO"],
              ["weekly", "SEMANAL"],
              ["monthly", "MENSAL"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-3 py-1.5 text-[10px] font-medium transition ${period === value ? "rounded-md bg-cyan-400/15 text-cyan-200" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="mb-2 grid grid-cols-[150px_1fr_48px] gap-3 text-[9px] text-muted-foreground">
            <span>ÁREA</span>
            <div className="grid grid-cols-5 text-center">
              {labels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <span className="text-right">TOTAL</span>
          </div>
          <div className="space-y-2">
            {rows.length === 0 ? (
              <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-muted-foreground">
                Registre atividades para preencher a linha do tempo.
              </p>
            ) : (
              rows.map((row, index) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[150px_1fr_48px] items-center gap-3 rounded-lg border border-white/[.06] bg-black/20 px-3 py-2.5"
                >
                  <span className="truncate text-xs text-foreground/80">
                    {row.name}
                  </span>
                  <div className="relative h-2 overflow-hidden rounded-full bg-white/[.06]">
                    <div
                      className={`h-full rounded-full ${index % 3 === 0 ? "bg-cyan-400" : index % 3 === 1 ? "bg-violet-400" : "bg-emerald-400"}`}
                      style={{ width: `${Math.max(row.percent, 3)}%` }}
                    />
                  </div>
                  <span className="text-right text-xs font-semibold text-cyan-200">
                    {row.percent}%
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-5 text-[10px] text-muted-foreground">
            <span>
              <i className="mr-1 inline-block h-2 w-5 rounded-full bg-cyan-400" />
              Em andamento
            </span>
            <span>
              <i className="mr-1 inline-block h-2 w-5 rounded-full bg-emerald-400" />
              Concluído
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{ borderColor: `${color}55`, background: `${color}0d` }}
    >
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}
