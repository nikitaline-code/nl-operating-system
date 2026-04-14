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

  // ================= UPDATE =================
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

  // ================= DATA =================
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const visibleTasks = tasks.filter(
    (t) => showCompleted || !t.is_complete
  );

  const openCount = tasks.filter((t) => !t.is_complete).length;
  const completeCount = tasks.filter((t) => t.is_complete).length;

  // ================= UI HELPERS =================
  const urgencyColor = {
    High: "#fee2e2",
    Medium: "#fef3c7",
    Low: "#e0f2fe",
  };

  const urgencyText = {
    High: "#dc2626",
    Medium: "#d97706",
    Low: "#0284c7",
  };

  const card = {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  };

  // ================= UI =================
  return (
    <div style={{ padding: "30px", background: "#f5f6f7", minHeight: "100vh" }}>

      <h1>Daily page</h1>
      <p style={{ color: "#6b7280", marginBottom: "20px" }}>
        Tasks, goals, and habits for one day.
      </p>

      {/* TOP */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ ...card, flex: 2 }}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            SELECTED DAY
          </div>
          <h2>{formattedDate}</h2>
        </div>

        <div style={{ ...card, flex: 1 }}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            OPEN TASKS
          </div>
          <h2>{openCount}</h2>
        </div>

        <div style={{ ...card, flex: 1 }}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            COMPLETED
          </div>
          <h2>{completeCount}</h2>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display: "flex", gap: "20px" }}>

        {/* HABITS */}
        <div style={{ width: "280px", ...card }}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px" }}>
            DAILY HABITS
          </div>

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
                marginBottom: "8px",
                borderRadius: "10px",
                background: h.done ? "#dcfce7" : "#f1f5f9",
                textDecoration: h.done ? "line-through" : "none",
                cursor: "pointer",
              }}
            >
              {h.name}
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div style={{ flex: 1, ...card }}>

          {/* HEADER */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px"
          }}>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              DAILY TASKS
            </div>

            <button
              onClick={() => setShowCompleted(!showCompleted)}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: "1px solid #e5e7eb",
                background: showCompleted ? "#111" : "#fff",
                color: showCompleted ? "#fff" : "#111",
                fontSize: "12px",
              }}
            >
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </button>
          </div>

          {/* ADD ROW */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
            background: "#f9fafb",
            padding: "10px",
            borderRadius: "12px",
            border: "1px solid #eee"
          }}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add task..."
              style={{ flex: 2, border: "none", background: "transparent" }}
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

          {/* TASK LIST */}
          {visibleTasks.map((task, i) => (
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
                borderBottom: "1px solid #eee",
                opacity: task.is_complete ? 0.5 : 1,
                cursor: "grab",
              }}
            >
              <div>
                <input
                  type="checkbox"
                  checked={task.is_complete}
                  onChange={() => toggleComplete(task)}
                />

                <span style={{ marginLeft: "10px" }}>
                  {task.content}
                </span>

                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <span style={{
                    background: urgencyColor[task.urgency],
                    color: urgencyText[task.urgency],
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "11px"
                  }}>
                    {task.urgency}
                  </span>

                  <span style={{ fontSize: "11px", color: "#6b7280" }}>
                    {task.assigned_to}
                  </span>

                  {task.due_date && (
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {task.due_date}
                    </span>
                  )}
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
