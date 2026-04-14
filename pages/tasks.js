import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);

  const [newTask, setNewTask] = useState("");
  const [assignee, setAssignee] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [showCompleted, setShowCompleted] = useState(true);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, []);

  // ================= FETCH =================

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("Task List")
      .select("*")
      .order("order", { ascending: true });

    if (data) setTasks(data);
  };

  const fetchHabits = async () => {
    const { data } = await supabase.from("habits").select("*");
    if (data) setHabits(data);
  };

  // ================= TASKS =================

  const addTask = async () => {
    if (!newTask) return;

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("Task List").insert([
      {
        content: newTask,
        user_id: user.id,
        is_complete: false,
        assigned_to: assignee,
        urgency,
        due_date: dueDate || null,
        order: tasks.length,
      },
    ]);

    setNewTask("");
    setDueDate("");
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    await supabase
      .from("Task List")
      .update({ is_complete: !task.is_complete })
      .eq("id", task.id);

    fetchTasks();
  };

  const deleteTask = async (id) => {
    await supabase.from("Task List").delete().eq("id", id);
    fetchTasks();
  };

  // ================= DRAG =================

  const handleDragStart = (index) => setDragIndex(index);

  const handleDrop = async (index) => {
    if (dragIndex === null) return;

    const updated = [...tasks];
    const dragged = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(index, 0, dragged);

    setTasks(updated);
    setDragIndex(null);

    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from("Task List")
        .update({ order: i })
        .eq("id", updated[i].id);
    }

    fetchTasks();
  };

  // ================= HABITS =================

  const toggleHabit = async (habit) => {
    await supabase
      .from("habits")
      .update({ completed: !habit.completed })
      .eq("id", habit.id);

    fetchHabits();
  };

  const completedHabits = habits.filter(h => h.completed).length;
  const habitProgress = habits.length
    ? (completedHabits / habits.length) * 100
    : 0;

  // ================= UI =================

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Daily OS</h1>
          <p style={styles.subtitle}>Focused execution for today</p>
        </div>

        <button style={styles.pillBtn} onClick={() => setShowCompleted(!showCompleted)}>
          {showCompleted ? "Hide Completed" : "Show Completed"}
        </button>
      </div>

      {/* STATS */}
      <div style={styles.stats}>
        <Stat label="OPEN TASKS" value={tasks.filter(t => !t.is_complete).length} />
        <Stat label="COMPLETED" value={tasks.filter(t => t.is_complete).length} />
      </div>

      {/* MAIN GRID */}
      <div style={styles.grid}>

        {/* HABITS */}
        <div style={styles.card}>
          <p style={styles.label}>DAILY HABITS</p>

          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${habitProgress}%` }} />
          </div>

          {habits.map(h => (
            <div
              key={h.id}
              onClick={() => toggleHabit(h)}
              style={{
                ...styles.habit,
                background: h.completed ? "#d1fae5" : "#f3f4f6"
              }}
            >
              {h.name}
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div style={styles.card}>

          {/* INPUT ROW */}
          <div style={styles.inputRow}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add task..."
              style={styles.input}
            />

            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={styles.input}>
              <option>Mark</option>
              <option>Dane</option>
            </select>

            <select value={urgency} onChange={(e) => setUrgency(e.target.value)} style={styles.input}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={styles.input} />

            <button onClick={addTask} style={styles.primaryBtn}>Add</button>
          </div>

          {/* TASK LIST */}
          {tasks
            .filter(t => showCompleted || !t.is_complete)
            .map((task, i) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                style={styles.task}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={task.is_complete}
                    onChange={() => toggleComplete(task)}
                  />

                  <span style={{ marginLeft: "10px" }}>{task.content}</span>

                  <span style={{
                    ...styles.badge,
                    background: urgencyColor(task.urgency)
                  }}>
                    {task.urgency}
                  </span>
                </div>

                <button onClick={() => deleteTask(task.id)} style={styles.delete}>
                  ✕
                </button>
              </div>
            ))}

        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

const Stat = ({ label, value }) => (
  <div style={styles.statCard}>
    <p style={styles.label}>{label}</p>
    <h2>{value}</h2>
  </div>
);

/* STYLES */

const styles = {
  page: {
    background: "#f8fafc",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Inter, sans-serif"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px"
  },

  title: {
    fontSize: "28px",
    fontWeight: 600
  },

  subtitle: {
    color: "#6b7280"
  },

  stats: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px"
  },

  statCard: {
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    flex: 1
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: "20px"
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  },

  label: {
    fontSize: "11px",
    color: "#6b7280",
    marginBottom: "8px"
  },

  inputRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "15px"
  },

  input: {
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  },

  primaryBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    background: "#111827",
    color: "#fff",
    border: "none",
    cursor: "pointer"
  },

  pillBtn: {
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer"
  },

  task: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "6px",
    background: "#f9fafb",
    transition: "all 0.2s ease",
    cursor: "grab"
  },

  badge: {
    marginLeft: "10px",
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "999px",
    color: "#fff"
  },

  delete: {
    background: "transparent",
    border: "none",
    cursor: "pointer"
  },

  habit: {
    padding: "8px",
    borderRadius: "999px",
    marginTop: "6px",
    fontSize: "13px",
    cursor: "pointer"
  },

  progressBar: {
    height: "6px",
    background: "#e5e7eb",
    borderRadius: "999px",
    marginBottom: "10px"
  },

  progressFill: {
    height: "100%",
    background: "#111827",
    borderRadius: "999px"
  }
};

const urgencyColor = (u) => {
  if (u === "High") return "#ef4444";
  if (u === "Medium") return "#f59e0b";
  return "#10b981";
};
