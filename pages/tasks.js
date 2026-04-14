import { useState } from "react";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [hideCompleted, setHideCompleted] = useState(false);

  const [habits, setHabits] = useState([
    { name: "Wake up", done: false },
    { name: "Workout", done: false },
    { name: "Read", done: false },
  ]);

  const addTask = () => {
    if (!taskText) return;
    setTasks([
      ...tasks,
      {
        text: taskText,
        priority,
        done: false,
      },
    ]);
    setTaskText("");
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    setTasks(updated);
  };

  const toggleHabit = (index) => {
    const updated = [...habits];
    updated[index].done = !updated[index].done;
    setHabits(updated);
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Daily OS</h1>
          <p style={styles.subtitle}>Focused execution for today</p>
        </div>

        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          style={styles.toggleBtn}
        >
          {hideCompleted ? "Show Completed" : "Hide Completed"}
        </button>
      </div>

      {/* STATS */}
      <div style={styles.stats}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Open Tasks</span>
          <h2>{tasks.filter((t) => !t.done).length}</h2>
        </div>

        <div style={styles.card}>
          <span style={styles.cardLabel}>Completed</span>
          <h2>{tasks.filter((t) => t.done).length}</h2>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* HABITS */}
        <div style={styles.habits}>
          <h3 style={styles.sectionTitle}>Daily Habits</h3>

          {habits.map((habit, i) => (
            <div
              key={i}
              style={{
                ...styles.habitItem,
                opacity: habit.done ? 0.5 : 1,
              }}
              onClick={() => toggleHabit(i)}
            >
              <span>{habit.name}</span>
              <input type="checkbox" checked={habit.done} readOnly />
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div style={styles.tasks}>
          {/* INPUT */}
          <div style={styles.inputRow}>
            <input
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Add task..."
              style={styles.input}
            />

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
          <div>
            {tasks
              .filter((t) => (hideCompleted ? !t.done : true))
              .map((task, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.taskItem,
                    opacity: task.done ? 0.5 : 1,
                  }}
                  onClick={() => toggleTask(i)}
                >
                  <span>{task.text}</span>

                  <span
                    style={{
                      ...styles.badge,
                      background:
                        task.priority === "High"
                          ? "#fee2e2"
                          : task.priority === "Medium"
                          ? "#fef3c7"
                          : "#e0f2fe",
                    }}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    padding: 40,
    fontFamily: "Inter, sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: 28,
  },

  subtitle: {
    marginTop: 4,
    color: "#64748b",
  },

  toggleBtn: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    padding: "10px 16px",
    borderRadius: 999,
    cursor: "pointer",
  },

  stats: {
    display: "flex",
    gap: 20,
    marginTop: 30,
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    flex: 1,
  },

  cardLabel: {
    color: "#64748b",
    fontSize: 12,
  },

  main: {
    display: "flex",
    gap: 20,
    marginTop: 30,
  },

  habits: {
    width: 250,
    background: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  sectionTitle: {
    marginBottom: 10,
  },

  habitItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    cursor: "pointer",
    fontSize: 14,
  },

  tasks: {
    flex: 1,
    background: "#fff",
    padding: 20,
    borderRadius: 12,
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
    border: "1px solid #e2e8f0",
  },

  select: {
    padding: 10,
    borderRadius: 8,
  },

  addBtn: {
    background: "#111827",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },

  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
  },

  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
  },
};
