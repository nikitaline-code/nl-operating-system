import { useEffect, useMemo, useState } from "react";

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

    const nextTasks = [
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
      [dateKey]: nextTasks,
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

  const handleDragStart = (index) => setDragIndex(index);

  const handleDrop = (index) => {
    if (dragIndex === null) return;

    const updated = [...tasks];
    const dragged = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(index, 0, dragged);

    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: updated,
    }));

    setDragIndex(null);
  };

  const open = tasks.filter((t) => !t.done).length;
  const done = tasks.filter((t) => t.done).length;

  const availableDays = Object.keys(tasksByDate)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 10);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Daily page</h1>
          <p style={styles.subtitle}>Focused execution for today</p>
        </div>

        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          style={styles.toggleBtn}
        >
          {hideCompleted ? "Show Completed" : "Hide Completed"}
        </button>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.bigDateCard}>
          <span style={styles.statLabel}>Selected Day</span>

          <div style={styles.dateRow}>
            <button
              style={styles.dateNavBtn}
              onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
            >
              ←
            </button>

            <div style={styles.dateText}>{formatPrettyDate(selectedDate)}</div>

            <button
              style={styles.dateNavBtn}
              onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
            >
              →
            </button>
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

      <div style={styles.main}>
        <div style={styles.left}>
          <h4 style={styles.sectionTitle}>Daily Habits</h4>

          {habits.map((h, i) => (
            <div
              key={i}
              style={{
                ...styles.habit,
                opacity: h.done ? 0.4 : 1,
              }}
              onClick={() => toggleHabit(i)}
            >
              {h.name}
            </div>
          ))}

          <h4 style={styles.sectionTitle}>Weekly Priorities</h4>

          {weekly.map((w, i) => (
            <div key={i} style={styles.habit}>
              {w}
            </div>
          ))}

          <h4 style={styles.sectionTitle}>Recent Days</h4>

          {availableDays.length === 0 && (
            <div style={styles.recentDay}>No saved days yet</div>
          )}

          {availableDays.map((day) => (
            <div
              key={day}
              style={{
                ...styles.recentDay,
                background: day === dateKey ? "#e9eefc" : "#f1f2f4",
              }}
              onClick={() => setSelectedDate(new Date(`${day}T12:00:00`))}
            >
              {day}
            </div>
          ))}
        </div>

        <div style={styles.right}>
          <div style={styles.inputRow}>
            <input
              placeholder="Add task..."
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              style={styles.input}
            />

            <select
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              style={styles.select}
            >
              <option>Mark</option>
              <option>Dane</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={styles.select}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <button onClick={addTask} style={styles.addBtn}>
              Add task
            </button>
          </div>

          <div style={styles.taskList}>
            {tasks
              .filter((t) => (hideCompleted ? !t.done : true))
              .map((t, i) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                  style={{
                    ...styles.task,
                    opacity: t.done ? 0.4 : 1,
                  }}
                >
                  <div
                    style={styles.taskText}
                    onClick={() => toggleTask(i)}
                  >
                    {t.text}
                  </div>

                  <div style={styles.taskRight}>
                    <span
                      style={{
                        ...styles.priorityPill,
                        background:
                          t.priority === "High"
                            ? "#fee2e2"
                            : t.priority === "Medium"
                            ? "#fef3c7"
                            : "#e0f2fe",
                      }}
                    >
                      {t.priority}
                    </span>

                    <span style={styles.personPill}>{t.person}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f4f5f7",
    minHeight: "100vh",
    padding: "40px 60px",
    fontFamily: "Inter, sans-serif",
    color: "#111",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    marginBottom: 4,
  },

  subtitle: {
    color: "#6b7280",
  },

  toggleBtn: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 12,
  },

  statsRow: {
    display: "flex",
    gap: 20,
    marginBottom: 20,
  },

  bigDateCard: {
    background: "#ebecef",
    borderRadius: 16,
    padding: 20,
    flex: 2,
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },

  dateRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },

  dateText: {
    fontSize: 24,
    fontWeight: 600,
  },

  dateNavBtn: {
    background: "#fff",
    border: "1px solid #d8dbe2",
    borderRadius: 10,
    width: 32,
    height: 32,
    cursor: "pointer",
  },

  statCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    flex: 1,
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },

  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },

  statValue: {
    fontSize: 28,
    marginTop: 8,
  },

  main: {
    display: "flex",
    gap: 20,
  },

  left: {
    width: 280,
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },

  right: {
    flex: 1,
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },

  sectionTitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
    marginTop: 20,
  },

  habit: {
    background: "#f1f2f4",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    cursor: "pointer",
    fontSize: 13,
  },

  recentDay: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    cursor: "pointer",
    fontSize: 13,
  },

  inputRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
  },

  select: {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
  },

  addBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
  },

  taskList: {
    marginTop: 10,
  },

  task: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f0f0f0",
    cursor: "grab",
  },

  taskText: {
    fontSize: 13,
    cursor: "pointer",
  },

  taskRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  priorityPill: {
    fontSize: 12,
    color: "#6b7280",
    padding: "4px 10px",
    borderRadius: 999,
  },

  personPill: {
    fontSize: 12,
    background: "#eef2ff",
    padding: "4px 10px",
    borderRadius: 999,
  },
};
