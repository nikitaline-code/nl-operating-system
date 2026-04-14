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
    { name: "Read", done: false },
  ]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("Task List")
      .select("*")
      .order("order", { ascending: true });

    if (data) setTasks(data);
  };

  const addTask = async () => {
    if (!newTask) return;

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("Task List").insert([
      {
        content: newTask,
        user_id: user.id,
        assigned_to: assigned,
        urgency,
        due_date: dueDate || null,
        is_complete: false,
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

    fetchTasks();
  };

  // ================= GROUPING =================
  const today = new Date();

  const visible = tasks.filter(
    (t) => showCompleted || !t.is_complete
  );

  const overdue = visible.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date) < today &&
      !t.is_complete
  );

  const high = visible.filter((t) => t.urgency === "High");
  const medium = visible.filter((t) => t.urgency === "Medium");
  const low = visible.filter((t) => t.urgency === "Low");

  const openCount = tasks.filter((t) => !t.is_complete).length;
  const completeCount = tasks.filter((t) => t.is_complete).length;

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // ================= UI =================
  const Section = ({ title, items }) =>
    items.length > 0 && (
      <div style={{ marginBottom: "18px" }}>
        <div style={{
          fontSize: "11px",
          color: "#9ca3af",
          marginBottom: "6px",
          letterSpacing: "0.08em"
        }}>
          {title}
        </div>

        {items.map((task, i) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #f1f5f9",
              cursor: "grab",
              opacity: task.is_complete ? 0.4 : 1,
              transition: "0.2s"
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
                fontSize: "14px"
              }}>
                {task.content}
              </span>

              <div style={{
                display: "flex",
                gap: "8px",
                marginTop: "4px",
                fontSize: "11px",
                color: "#9ca3af"
              }}>
                <span>{task.assigned_to}</span>
                <span>{task.urgency}</span>
                {task.due_date && <span>{task.due_date}</span>}
              </div>
            </div>

            <button onClick={() => deleteTask(task.id)}>✕</button>
          </div>
        ))}
      </div>
    );

  return (
    <div style={{
      padding: "30px",
      background: "#f3f4f6",
      minHeight: "100vh",
      fontFamily: "Inter, sans-serif"
    }}>

      <h1 style={{ marginBottom: "4px" }}>Daily page</h1>
      <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
        Tasks, goals, and habits for one day.
      </p>

      {/* TOP */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <div style={card(2)}>
          <small>SELECTED DAY</small>
          <h2>{formattedDate}</h2>
        </div>

        <div style={card()}>
          <small>OPEN TASKS</small>
          <h2>{openCount}</h2>
        </div>

        <div style={card()}>
          <small>COMPLETED</small>
          <h2>{completeCount}</h2>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display: "flex", gap: "20px" }}>

        {/* HABITS */}
        <div style={{ width: "260px", ...panel }}>
          <small>DAILY HABITS</small>

          {habits.map((h, i) => (
            <div
              key={i}
              onClick={() => {
                const updated = [...habits];
                updated[i].done = !updated[i].done;
                setHabits(updated);
              }}
              style={{
                padding: "10px",
                marginTop: "8px",
                borderRadius: "10px",
                background: h.done ? "#e0f2fe" : "#f1f5f9",
                textDecoration: h.done ? "line-through" : "none",
                cursor: "pointer"
              }}
            >
              {h.name}
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div style={{ flex: 1, ...panel }}>

          {/* HEADER */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "12px"
          }}>
            <small>DAILY TASKS</small>

            <button
              onClick={() => setShowCompleted(!showCompleted)}
              style={pill(showCompleted)}
            >
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </button>
          </div>

          {/* ADD */}
          <div style={inputBar}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add task..."
              style={input}
            />

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

          {/* SECTIONS */}
          <Section title="OVERDUE" items={overdue} />
          <Section title="HIGH" items={high} />
          <Section title="MEDIUM" items={medium} />
          <Section title="LOW" items={low} />

        </div>
      </div>
    </div>
  );
}

// ===== STYLE HELPERS =====
const card = (flex = 1) => ({
  flex,
  background: "#fff",
  borderRadius: "14px",
  padding: "18px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
});

const panel = {
  background: "#fff",
  borderRadius: "14px",
  padding: "18px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
};

const pill = (active) => ({
  padding: "6px 12px",
  borderRadius: "999px",
  border: "1px solid #e5e7eb",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#111",
  fontSize: "12px"
});

const inputBar = {
  display: "flex",
  gap: "8px",
  marginBottom: "16px",
  background: "#f9fafb",
  padding: "8px",
  borderRadius: "10px",
  border: "1px solid #eee"
};

const input = {
  flex: 2,
  border: "none",
  background: "transparent",
  outline: "none"
};
