import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [assigned, setAssigned] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [showCompleted, setShowCompleted] = useState(true);
  const [dragIndex, setDragIndex] = useState(null);

  const [habits, setHabits] = useState([
    { name: "Wake up", done: false },
    { name: "Workout", done: false },
    { name: "Read", done: false }
  ]);

  useEffect(() => {
    fetchTasks();
  }, []);

  // ================= FETCH =================
  const fetchTasks = async () => {
    const { data } = await supabase
      .from("Task List")
      .select("*")
      .order("order", { ascending: true });

    if (data) setTasks(data);
  };

  // ================= ADD =================
  const addTask = async () => {
    if (!newTask) return;

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("Task List").insert([
      {
        content: newTask,
        assigned,
        urgency,
        due_date: dueDate || null,
        is_complete: false,
        user_id: user.id,
        order: tasks.length
      }
    ]);

    setNewTask("");
    setDueDate("");
    fetchTasks();
  };

  // ================= DELETE =================
  const deleteTask = async (id) => {
    await supabase.from("Task List").delete().eq("id", id);
    fetchTasks();
  };

  // ================= TOGGLE =================
  const toggleComplete = async (task) => {
    await supabase
      .from("Task List")
      .update({ is_complete: !task.is_complete })
      .eq("id", task.id);

    fetchTasks();
  };

  // ================= DRAG =================
  const handleDragStart = (index) => setDragIndex(index);

  const handleDrop = async (dropIndex) => {
    if (dragIndex === null) return;

    const updated = [...tasks];
    const dragged = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, dragged);

    setTasks(updated);
    setDragIndex(null);

    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from("Task List")
        .update({ order: i })
        .eq("id", updated[i].id);
    }
  };

  // ================= HELPERS =================
  const completed = tasks.filter((t) => t.is_complete).length;
  const open = tasks.filter((t) => !t.is_complete).length;

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const getBadgeStyle = (u) => {
    const map = {
      High: { background: "#fee2e2", color: "#991b1b" },
      Medium: { background: "#fef3c7", color: "#92400e" },
      Low: { background: "#dcfce7", color: "#166534" }
    };
    return {
      padding: "2px 8px",
      borderRadius: "999px",
      fontSize: "10px",
      fontWeight: "600",
      ...map[u]
    };
  };

  // ================= UI =================
  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh", fontFamily: "Inter" }}>

      {/* HEADER */}
      <h1>Daily page</h1>
      <p style={{ color: "#6b7280" }}>Tasks, goals, and habits for one day.</p>

      {/* TOP CARDS */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={card}>
          <p style={label}>SELECTED DAY</p>
          <h2>
            Today
            <span style={dateText}>{todayFormatted}</span>
          </h2>
        </div>

        <div style={card}>
          <p style={label}>OPEN TASKS</p>
          <h2>{open}</h2>
        </div>

        <div style={card}>
          <p style={label}>COMPLETED</p>
          <h2>{completed}</h2>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>

        {/* HABITS */}
        <div style={{ ...card, width: "250px" }}>
          <p style={label}>DAILY HABITS</p>

          {habits.map((h, i) => (
            <div
              key={i}
              style={habitItem}
            >
              <input
                type="checkbox"
                checked={h.done}
                onChange={() => {
                  const updated = [...habits];
                  updated[i].done = !updated[i].done;
                  setHabits(updated);
                }}
              />
              <span style={{
                fontSize: "12px",
                textDecoration: h.done ? "line-through" : "none",
                opacity: h.done ? 0.5 : 1
              }}>
                {h.name}
              </span>
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div style={{ ...card, flex: 1 }}>

          {/* HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={label}>DAILY TASKS</p>

            <button
              onClick={() => setShowCompleted(!showCompleted)}
              style={toggleBtn}
            >
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </button>
          </div>

          {/* INPUT ROW */}
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Task" />
            <select value={assigned} onChange={(e) => setAssigned(e.target.value)}>
              <option>Mark</option>
              <option>Dane</option>
            </select>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <button onClick={addTask}>Add</button>
          </div>

          {/* TASK LIST */}
          <div style={{ marginTop: "20px" }}>
            {tasks
              .filter((t) => showCompleted || !t.is_complete)
              .map((task, i) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                  style={taskItem}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={task.is_complete}
                      onChange={() => toggleComplete(task)}
                    />
                    <span>{task.content}</span>
                    <span style={getBadgeStyle(task.urgency)}>{task.urgency}</span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {task.assigned} • {task.due_date || ""}
                    <button onClick={() => deleteTask(task.id)} style={{ marginLeft: "10px" }}>✕</button>
                  </div>
                </div>
              ))}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  transition: "all 0.2s ease"
};

const label = {
  fontSize: "12px",
  color: "#6b7280"
};

const dateText = {
  marginLeft: "10px",
  fontSize: "12px",
  color: "#6b7280"
};

const habitItem = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  padding: "10px",
  marginTop: "8px",
  background: "#f1f5f9",
  borderRadius: "10px",
  transition: "all 0.2s ease"
};

const taskItem = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  borderBottom: "1px solid #eee",
  transition: "all 0.2s ease"
};

const toggleBtn = {
  padding: "6px 12px",
  borderRadius: "999px",
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  fontSize: "12px",
  cursor: "pointer"
};
