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
      {
        text: taskText,
        person,
        priority,
        done: false,
      },
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

  const openCount = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <h1 style={styles.title}>Daily OS</h1>

      {/* STATS */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span>Open Tasks</span>
          <h2 style={styles.statNumber}>{openCount}</h2>
        </div>

        <div style={styles.statCard}>
          <span>Completed</span>
          <h2 style={styles.statNumber}>{completedCount}</h2>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* LEFT */}
        <div style={styles.left}>
          <h3>Daily Habits</h3>

          {habits.map((h, i) => (
            <div
              key={i}
              style={{
                ...styles.habit,
                opacity: h.done ? 0.5 : 1,
              }}
              onClick={() => toggleHabit(i)}
            >
              {h.name}
            </div>
          ))}

          <h3 style={{ marginTop: 30 }}>Weekly Priorities</h3>

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
              Add
            </button>
          </div>

          {/* TASK LIST */}
          {tasks.map((t, i) => (
            <div
              key={i}
              style={{
                ...styles.task,
                opacity: t.done ? 0.5 : 1,
              }}
            >
              {/* TEXT */}
              <div onClick={() => toggleTask(i)} style={{ flex: 1 }}>
                {t.text}
              </div>

              {/* PRIORITY */}
              <span
                style={{
                  ...styles.badge,
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

              {/* PERSON */}
              <span style={styles.person}>{t.person}</span>

              {/* REORDER */}
              <div style={styles.reorder}>
                <button onClick={() => moveUp(i)}>↑</button>
                <button onClick={() => moveDown(i)}>↓</button>
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
  page: {
    background: "#f6f7f8",
    minHeight: "100vh",
    padding: 40,
    fontFamily: "Inter, sans-serif",
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
  },

  statsRow: {
    display: "flex",
    gap: 20,
    marginBottom: 20,
  },

  statCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    flex: 1,
  },

  statNumber: {
    fontSize: 28,
    marginTop: 10,
  },

  main: {
    display: "flex",
    gap: 20,
  },

  left: {
    width: 280,
    background: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  right: {
    flex: 1,
    background: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  habit: {
    background: "#f1f2f4",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    cursor: "pointer",
  },

  inputRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  select: {
    padding: 10,
    borderRadius: 8,
  },

  addBtn: {
    background: "#111",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },

  task: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderBottom: "1px solid #eee",
  },

  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
  },

  person: {
    fontSize: 12,
    background: "#e5e7eb",
    padding: "4px 8px",
    borderRadius: 8,
  },

  reorder: {
    display: "flex",
    gap: 4,
  },
};
