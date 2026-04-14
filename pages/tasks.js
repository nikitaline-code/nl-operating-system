import { useState } from "react";

export default function Tasks() {
  const [person, setPerson] = useState("Mark");
  const [taskText, setTaskText] = useState("");
  const [tasks, setTasks] = useState([]);

  const [habits, setHabits] = useState([
    "Wake up at 5AM",
    "Pray",
    "Run",
    "Read Bible",
    "Workout",
  ]);

  const addTask = () => {
    if (!taskText) return;

    setTasks([
      ...tasks,
      {
        text: taskText,
        person,
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

  const groupedTasks = {
    Mark: tasks.filter((t) => t.person === "Mark"),
    Dane: tasks.filter((t) => t.person === "Dane"),
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Daily OS</h1>
      </div>

      {/* TOP CARDS */}
      <div style={styles.topRow}>
        <div style={styles.bigCard}>
          <div style={styles.dateLabel}>Selected Day</div>
          <h2>April 7, 2026</h2>
        </div>

        <div style={styles.smallCard}>
          <span>Open Tasks</span>
          <h2>{tasks.filter((t) => !t.done).length}</h2>
        </div>

        <div style={styles.smallCard}>
          <span>Completed</span>
          <h2>{tasks.filter((t) => t.done).length}</h2>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* LEFT */}
        <div style={styles.left}>
          <h3>Daily Habits</h3>

          {habits.map((h, i) => (
            <div key={i} style={styles.habit}>
              {h}
            </div>
          ))}

          <h3 style={{ marginTop: 30 }}>Long-Term Goals</h3>

          <div style={styles.habit}>Keep Purity Every Day</div>
          <div style={styles.habit}>Weigh 170lbs</div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <div style={styles.taskHeader}>
            <h3>Daily Tasks</h3>

            <div style={styles.controls}>
              <select
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                style={styles.select}
              >
                <option>Mark</option>
                <option>Dane</option>
              </select>

              <input
                placeholder="Add task..."
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                style={styles.input}
              />

              <button onClick={addTask} style={styles.addBtn}>
                Add
              </button>
            </div>
          </div>

          {/* MARK TASKS */}
          <div style={styles.section}>
            <h4>Mark</h4>
            {groupedTasks.Mark.map((t, i) => (
              <div
                key={i}
                style={{
                  ...styles.task,
                  opacity: t.done ? 0.5 : 1,
                }}
                onClick={() => toggleTask(i)}
              >
                {t.text}
              </div>
            ))}
          </div>

          {/* DANE TASKS */}
          <div style={styles.section}>
            <h4>Dane</h4>
            {groupedTasks.Dane.map((t, i) => (
              <div
                key={i}
                style={{
                  ...styles.task,
                  opacity: t.done ? 0.5 : 1,
                }}
                onClick={() => toggleTask(i)}
              >
                {t.text}
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
    background: "#f6f7f8",
    minHeight: "100vh",
    padding: 40,
    fontFamily: "Inter, sans-serif",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
  },

  topRow: {
    display: "flex",
    gap: 20,
    marginBottom: 30,
  },

  bigCard: {
    flex: 2,
    background: "#eaecec",
    padding: 20,
    borderRadius: 12,
  },

  smallCard: {
    flex: 1,
    background: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  dateLabel: {
    fontSize: 12,
    color: "#666",
  },

  main: {
    display: "flex",
    gap: 20,
  },

  left: {
    width: 300,
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
    fontSize: 14,
  },

  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  controls: {
    display: "flex",
    gap: 10,
  },

  input: {
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  select: {
    padding: 8,
    borderRadius: 8,
  },

  addBtn: {
    background: "#111",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },

  section: {
    marginTop: 20,
  },

  task: {
    padding: 10,
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },
};
