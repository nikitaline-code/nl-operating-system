import { useState } from "react";

export default function Tasks() {
  const [taskText, setTaskText] = useState("");
  const [person, setPerson] = useState("Mark");
  const [priority, setPriority] = useState("Medium");
  const [tasks, setTasks] = useState([]);

  const [habits, setHabits] = useState([
    { name: "Pray", done: false },
    { name: "Read", done: false },
    { name: "Run", done: false },
  ]);

  const [weekly] = useState([
    "Win the week",
    "Stay disciplined",
  ]);

  const addTask = () => {
    if (!taskText) return;

    setTasks([
      ...tasks,
      { text: taskText, person, priority, done: false },
    ]);

    setTaskText("");
  };

  const toggleTask = (i) => {
    const updated = [...tasks];
    updated[i].done = !updated[i].done;
    setTasks(updated);
  };

  const moveUp = (i) => {
    if (i === 0) return;
    const updated = [...tasks];
    [updated[i - 1], updated[i]] = [updated[i], updated[i - 1]];
    setTasks(updated);
  };

  const moveDown = (i) => {
    if (i === tasks.length - 1) return;
    const updated = [...tasks];
    [updated[i + 1], updated[i]] = [updated[i], updated[i + 1]];
    setTasks(updated);
  };

  const toggleHabit = (i) => {
    const updated = [...habits];
    updated[i].done = !updated[i].done;
    setHabits(updated);
  };

  const open = tasks.filter(t => !t.done).length;
  const done = tasks.filter(t => t.done).length;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Daily page</h1>
          <p style={styles.subtitle}>
            Focused execution for today
          </p>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsRow}>
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
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          {/* INPUT */}
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

          {/* TASK LIST */}
          <div style={styles.taskList}>
            {tasks.map((t, i) => (
              <div
                key={i}
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
                  <span style={styles.priority}>
                    {t.priority}
                  </span>

                  <span style={styles.person}>
                    {t.person}
                  </span>

                  <div style={styles.reorder}>
                    <span onClick={() => moveUp(i)}>↑</span>
                    <span onClick={() => moveDown(i)}>↓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: {
    background: "#f4f5f7",
    minHeight: "100vh",
    padding: "40px 60px",
    fontFamily: "Inter, sans-serif",
    color: "#111",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    marginBottom: 4,
  },

  subtitle: {
    color: "#6b7280",
  },

  statsRow: {
    display: "flex",
    gap: 20,
    marginBottom: 20,
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

  /* 🔥 UPDATED HABIT STYLE */
  habit: {
    background: "#f1f2f4",
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
    padding: "14px 0",
    borderBottom: "1px solid #f0f0f0",
  },

  taskText: {
    cursor: "pointer",
  },

  taskRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  priority: {
    fontSize: 12,
    color: "#6b7280",
  },

  person: {
    fontSize: 12,
    background: "#eef2ff",
    padding: "4px 10px",
    borderRadius: 999,
  },

  reorder: {
    display: "flex",
    gap: 6,
    cursor: "pointer",
    color: "#9ca3af",
  },
};
