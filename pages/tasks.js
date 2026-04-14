import { useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [assignee, setAssignee] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);

  const [habits, setHabits] = useState([
    { name: "Wake up", done: false },
    { name: "Workout", done: false },
    { name: "Read", done: false },
  ]);

  const addTask = () => {
    if (!taskInput) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: taskInput,
        assignee,
        urgency,
        dueDate,
        done: false,
      },
    ]);

    setTaskInput("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleHabit = (index) => {
    const updated = [...habits];
    updated[index].done = !updated[index].done;
    setHabits(updated);
  };

  const openTasks = tasks.filter((t) => !t.done).length;
  const completedTasks = tasks.filter((t) => t.done).length;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Daily OS</h1>
      <p style={styles.subtitle}>Focused execution for today</p>

      {/* TOP STATS */}
      <div style={styles.statsRow}>
        <div style={styles.card}>
          <p style={styles.label}>OPEN TASKS</p>
          <h2>{openTasks}</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>COMPLETED</p>
          <h2>{completedTasks}</h2>
        </div>

        <button
          style={styles.hideBtn}
          onClick={() => setHideCompleted(!hideCompleted)}
        >
          {hideCompleted ? "Show Completed" : "Hide Completed"}
        </button>
      </div>

      <div style={styles.grid}>
        {/* HABITS */}
        <div style={styles.card}>
          <h3>Daily Habits</h3>
          {habits.map((h, i) => (
            <div key={i} style={styles.habitRow}>
              <input
                type="checkbox"
                checked={h.done}
                onChange={() => toggleHabit(i)}
              />
              <span
                style={{
                  ...styles.habitText,
                  textDecoration: h.done ? "line-through" : "none",
                }}
              >
                {h.name}
              </span>
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div style={styles.card}>
          <h3>Daily Tasks</h3>

          {/* INPUT */}
          <div style={styles.inputRow}>
            <input
              placeholder="Add task..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              style={styles.input}
            />

            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option>Mark</option>
              <option>Dane</option>
            </select>

            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <button style={styles.addBtn} onClick={addTask}>
              Add
            </button>
          </div>

          {/* TASK LIST */}
          {tasks
            .filter((t) => (hideCompleted ? !t.done : true))
            .map((task) => (
              <div key={task.id} style={styles.taskRow}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      textDecoration: task.done ? "line-through" : "none",
                    }}
                  >
                    {task.text}
                  </div>

                  <div style={styles.meta}>
                    {task.assignee} • {task.urgency} • {task.dueDate || "No date"}
                  </div>
                </div>

                <button onClick={() => deleteTask(task.id)}>✕</button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  page: {
    padding: "40px",
    fontFamily: "Arial",
    background: "#f7f8fa",
    minHeight: "100vh",
  },
  title: {
    marginBottom: 5,
  },
  subtitle: {
    color: "#666",
    marginBottom: 30,
  },
  statsRow: {
    display: "flex",
    gap: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#888",
  },
  hideBtn: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: 20,
  },
  habitRow: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  habitText: {
    fontSize: 14,
  },
  inputRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 8,
  },
  addBtn: {
    background: "#111",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
  },
  taskRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: 10,
    borderBottom: "1px solid #eee",
  },
  meta: {
    fontSize: 12,
    color: "#888",
  },
};
