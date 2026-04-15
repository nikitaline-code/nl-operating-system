import { useEffect, useMemo, useState } from "react";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatPrettyDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function shiftDate(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export default function Tasks() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  const [taskText, setTaskText] = useState("");
  const [person, setPerson] = useState("Mark");
  const [priority, setPriority] = useState("Medium");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const defaultHabits = useMemo(
    () => [
      { name: "Pray", done: false },
      { name: "Read", done: false },
      { name: "Run", done: false },
    ],
    []
  );

  const [tasksByDate, setTasksByDate] = useState({});
  const [habitsByDate, setHabitsByDate] = useState({});

  const weekly = useMemo(() => ["Win the week", "Stay disciplined"], []);

  useEffect(() => {
    const savedTasks = localStorage.getItem("daily-os-tasks-by-date");
    const savedHabits = localStorage.getItem("daily-os-habits-by-date");

    if (savedTasks) setTasksByDate(JSON.parse(savedTasks));
    if (savedHabits) setHabitsByDate(JSON.parse(savedHabits));
  }, []);

  useEffect(() => {
    localStorage.setItem("daily-os-tasks-by-date", JSON.stringify(tasksByDate));
  }, [tasksByDate]);

  useEffect(() => {
    localStorage.setItem("daily-os-habits-by-date", JSON.stringify(habitsByDate));
  }, [habitsByDate]);

  useEffect(() => {
    if (!habitsByDate[dateKey]) {
      setHabitsByDate((prev) => ({
        ...prev,
        [dateKey]: defaultHabits,
      }));
    }
  }, [dateKey, habitsByDate, defaultHabits]);

  const tasks = tasksByDate[dateKey] || [];
  const habits = habitsByDate[dateKey] || defaultHabits;

  const addTask = () => {
    if (!taskText.trim()) return;

    const next = [
      ...tasks,
      {
        id: Date.now(),
        text: taskText.trim(),
        person,
        priority,
        done: false,
      },
    ];

    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: next,
    }));

    setTaskText("");
  };

  const toggleTask = (i) => {
    const updated = [...tasks];
    updated[i].done = !updated[i].done;

    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: updated,
    }));
  };

  const toggleHabit = (i) => {
    const updated = [...habits];
    updated[i].done = !updated[i].done;

    setHabitsByDate((prev) => ({
      ...prev,
      [dateKey]: updated,
    }));
  };

  const handleDragStart = (i) => setDragIndex(i);

  const handleDrop = (i) => {
    if (dragIndex === null) return;

    const updated = [...tasks];
    const dragged = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(i, 0, dragged);

    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: updated,
    }));

    setDragIndex(null);
  };

  const open = tasks.filter((t) => !t.done).length;
  const done = tasks.filter((t) => t.done).length;

  const recentDays = Object.keys(tasksByDate)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 7);

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Daily page</h1>
          <p style={styles.subtitle}>Focused execution for today</p>
        </div>
      </div>

      {/* TOP CARDS */}
      <div style={styles.statsRow}>
        <div style={styles.bigDateCard}>
          <span style={styles.statLabel}>Selected Day</span>

          <div style={styles.dateRow}>
            <button onClick={() => setSelectedDate((d) => shiftDate(d, -1))} style={styles.dateBtn}>←</button>
            <div style={styles.dateText}>{formatPrettyDate(selectedDate)}</div>
            <button onClick={() => setSelectedDate((d) => shiftDate(d, 1))} style={styles.dateBtn}>→</button>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Open Tasks</span>
          <div style={styles.statValue}>{open}</div>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Completed</span>
          <div style={styles.statValue}>{done}</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* LEFT */}
        <div style={styles.left}>
          <h4 style={styles.sectionTitle}>Daily Habits</h4>

          {habits.map((h, i) => (
            <div
              key={i}
              style={{ ...styles.habit, opacity: h.done ? 0.4 : 1 }}
              onClick={() => toggleHabit(i)}
            >
              {h.name}
            </div>
          ))}

          <h4 style={styles.sectionTitle}>Weekly Priorities</h4>
          {weekly.map((w, i) => (
            <div key={i} style={styles.habit}>{w}</div>
          ))}

          <h4 style={styles.sectionTitle}>Recent Days</h4>
          {recentDays.map((d) => (
            <div
              key={d}
              style={{
                ...styles.recent,
                background: d === dateKey ? "#e9eefc" : "#f1f2f4",
              }}
              onClick={() => setSelectedDate(new Date(`${d}T12:00:00`))}
            >
              {d}
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          {/* INPUT */}
          <div style={styles.inputRow}>
            <input
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Add task..."
              style={styles.input}
            />

            <select value={person} onChange={(e) => setPerson(e.target.value)} style={styles.select}>
              <option>Mark</option>
              <option>Dane</option>
            </select>

            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.select}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <button onClick={addTask} style={styles.addBtn}>Add</button>
          </div>

          {/* 🔥 MOVED TOGGLE HERE */}
          <div style={styles.taskToolbar}>
            <button onClick={() => setHideCompleted(!hideCompleted)} style={styles.toggle}>
              {hideCompleted ? "Show Completed" : "Hide Completed"}
            </button>
          </div>

          {/* TASKS */}
          {tasks
            .filter((t) => (hideCompleted ? !t.done : true))
            .map((t, i) => (
              <div
                key={t.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                style={{ ...styles.task, opacity: t.done ? 0.4 : 1 }}
              >
                <div onClick={() => toggleTask(i)} style={styles.taskText}>
                  {t.text}
                </div>

                <div style={styles.taskRight}>
                  <span style={styles.priority}>{t.priority}</span>
                  <span style={styles.person}>{t.person}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: { background: "#f4f5f7", minHeight: "100vh", padding: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 28 },
  subtitle: { color: "#6b7280" },

  statsRow: { display: "flex", gap: 20, marginBottom: 20 },

  bigDateCard: { flex: 2, background: "#ebecef", padding: 20, borderRadius: 16 },
  statCard: { flex: 1, background: "#fff", padding: 20, borderRadius: 16 },

  statLabel: { fontSize: 12, color: "#6b7280" },
  statValue: { fontSize: 28 },

  dateRow: { display: "flex", alignItems: "center", gap: 10 },
  dateText: { fontSize: 22, fontWeight: 600 },
  dateBtn: { padding: 6, borderRadius: 8 },

  main: { display: "flex", gap: 20 },

  left: { width: 260, background: "#fff", padding: 20, borderRadius: 16 },
  right: { flex: 1, background: "#fff", padding: 20, borderRadius: 16 },

  sectionTitle: { fontSize: 12, color: "#6b7280", marginTop: 20 },

  habit: { padding: 10, background: "#f1f2f4", borderRadius: 10, marginBottom: 8, fontSize: 13 },
  recent: { padding: 10, borderRadius: 10, marginBottom: 6, fontSize: 13 },

  inputRow: { display: "flex", gap: 10, marginBottom: 10 },
  input: { flex: 1, padding: 10 },
  select: { padding: 10 },
  addBtn: { padding: "10px 16px", background: "#111", color: "#fff", borderRadius: 10 },

  taskToolbar: { marginBottom: 10 },

  toggle: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#fff",
    fontSize: 12,
  },

  task: { display: "flex", justifyContent: "space-between", padding: 10, borderBottom: "1px solid #eee" },
  taskText: { fontSize: 13 },

  taskRight: { display: "flex", gap: 10 },
  priority: { fontSize: 12, color: "#6b7280" },
  person: { fontSize: 12, background: "#eef2ff", padding: "4px 8px", borderRadius: 999 },
};
