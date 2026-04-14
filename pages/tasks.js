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

  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, []);

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

  const toggleHabit = async (habit) => {
    await supabase
      .from("habits")
      .update({ completed: !habit.completed })
      .eq("id", habit.id);

    fetchHabits();
  };

  const filteredTasks = tasks.filter(
    (t) => showCompleted || !t.is_complete
  );

  return (
    <div style={{
      background: "#f3f4f6",
      minHeight: "100vh",
      padding: "40px",
      fontFamily: "Inter, sans-serif"
    }}>

      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "600" }}>Daily page</h1>
        <p style={{ color: "#6b7280" }}>
          Tasks, goals, and habits for one day.
        </p>
      </div>

      {/* TOP CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gap: "16px",
        marginBottom: "20px"
      }}>
        <div style={card}>
          <p style={label}>SELECTED DAY</p>
          <h2>Today</h2>
        </div>

        <div style={card}>
          <p style={label}>OPEN TASKS</p>
          <h2>{tasks.filter(t => !t.is_complete).length}</h2>
        </div>

        <div style={card}>
          <p style={label}>COMPLETED</p>
          <h2>{tasks.filter(t => t.is_complete).length}</h2>
        </div>
      </div>

      {/* MAIN */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: "20px"
      }}>

        {/* HABITS */}
        <div style={card}>
          <p style={label}>DAILY HABITS</p>

          {habits.map(h => (
            <div
              key={h.id}
              onClick={() => toggleHabit(h)}
              style={{
                padding: "10px",
                borderRadius: "999px",
                background: h.completed ? "#d1fae5" : "#e5e7eb",
                marginTop: "8px",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              {h.name}
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div style={card}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px"
          }}>
            <p style={label}>DAILY TASKS</p>

            <button style={pillBtn} onClick={() => setShowCompleted(!showCompleted)}>
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </button>
          </div>

          {/* INPUT ROW */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginBottom: "15px"
          }}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add task..."
              style={input}
            />

            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={input}>
              <option>Mark</option>
              <option>Dane</option>
            </select>

            <select value={urgency} onChange={(e) => setUrgency(e.target.value)} style={input}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={input} />

            <button onClick={addTask} style={primaryBtn}>Add</button>
          </div>

          {/* TASK LIST */}
          {filteredTasks.map(task => (
            <div key={task.id} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #eee",
              opacity: task.is_complete ? 0.5 : 1
            }}>
              <div>
                <input
                  type="checkbox"
                  checked={task.is_complete}
                  onChange={() => toggleComplete(task)}
                />

                <span style={{ marginLeft: "10px" }}>
                  {task.content}
                </span>

                <span style={{
                  marginLeft: "10px",
                  fontSize: "12px",
                  color: urgencyColor(task.urgency)
                }}>
                  {task.urgency}
                </span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

/* STYLES */

const card = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
};

const label = {
  fontSize: "11px",
  color: "#6b7280",
  marginBottom: "6px"
};

const input = {
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb"
};

const primaryBtn = {
  padding: "8px 14px",
  borderRadius: "8px",
  background: "#111827",
  color: "#fff",
  border: "none",
  cursor: "pointer"
};

const pillBtn = {
  padding: "6px 12px",
  borderRadius: "999px",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer"
};

const urgencyColor = (u) => {
  if (u === "High") return "#ef4444";
  if (u === "Medium") return "#f59e0b";
  return "#10b981";
};
