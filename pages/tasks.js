import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState("");
  const [assignedTo, setAssignedTo] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from("Task List").select("*");
    if (data) setTasks(data);
  };

  const addTask = async () => {
    if (!newTask) return;

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("Task List").insert([
      {
        content: newTask,
        user_id: user.id,
        is_complete: false,
        assigned_to: assignedTo,
        urgency: urgency,
        due_date: dueDate || null,
      },
    ]);

    setNewTask("");
    setDueDate("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await supabase.from("Task List").delete().eq("id", id);
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    await supabase
      .from("Task List")
      .update({ is_complete: !task.is_complete })
      .eq("id", task.id);

    fetchTasks();
  };

  // ===== GROUPING =====
  const today = new Date();

  const overdue = tasks.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date) < today &&
      !t.is_complete
  );

  const high = tasks.filter(
    (t) => t.urgency === "High" && !t.is_complete
  );

  const medium = tasks.filter(
    (t) => t.urgency === "Medium" && !t.is_complete
  );

  const low = tasks.filter(
    (t) => t.urgency === "Low" && !t.is_complete
  );

  const renderTask = (task) => (
    <div
      key={task.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px",
        borderRadius: "10px",
        background: "#f8fafc",
        marginBottom: "8px"
      }}
    >
      <div>
        <input
          type="checkbox"
          checked={task.is_complete}
          onChange={() => toggleComplete(task)}
        />

        <span style={{
          marginLeft: "10px",
          textDecoration: task.is_complete ? "line-through" : "none"
        }}>
          {task.content}
        </span>

        <div style={{
          fontSize: "11px",
          color: "#6b7280",
          marginTop: "4px"
        }}>
          {task.assigned_to && `👤 ${task.assigned_to}`}
          {task.due_date &&
            ` • ${new Date(task.due_date).toLocaleDateString()}`}
        </div>
      </div>

      <button onClick={() => deleteTask(task.id)}>✕</button>
    </div>
  );

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#f3f4f6",
      fontFamily: "Inter, sans-serif"
    }}>

      {/* SIDEBAR */}
      <div style={{
        width: "280px",
        background: "#ffffff",
        padding: "24px",
        borderRight: "1px solid #e5e7eb"
      }}>
        <h2 style={{ marginBottom: "20px" }}>Daily</h2>

        <p style={{ fontSize: "12px", color: "#9ca3af" }}>HABITS</p>

        {["Wake up early", "Workout", "Read", "Plan day"].map((h, i) => (
          <div key={i} style={{
            padding: "10px",
            marginTop: "8px",
            background: "#f1f5f9",
            borderRadius: "8px"
          }}>
            {h}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "40px" }}>
        <h1 style={{ marginBottom: "10px" }}>Daily OS 🚀</h1>

        {/* INPUT ROW */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px"
        }}>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add task..."
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
          />

          <select onChange={(e) => setAssignedTo(e.target.value)}>
            <option>Mark</option>
            <option>Dane</option>
          </select>

          <select onChange={(e) => setUrgency(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <input
            type="date"
            onChange={(e) => setDueDate(e.target.value)}
          />

          <button onClick={addTask}>Add</button>
        </div>

        {/* TASK CARD */}
        <div style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)"
        }}>

          {overdue.length > 0 && (
            <>
              <h3 style={{ color: "red" }}>Overdue</h3>
              {overdue.map(renderTask)}
            </>
          )}

          <h3>High</h3>
          {high.map(renderTask)}

          <h3>Medium</h3>
          {medium.map(renderTask)}

          <h3>Low</h3>
          {low.map(renderTask)}

        </div>
      </div>
    </div>
  );
}
