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

    // persist order
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

  const visibleTasks = tasks.filter(
    (t) => showCompleted || !t.is_complete
  );

  const overdue = visibleTasks.filter(
    (t) => t.due_date && new Date(t.due_date) < today && !t.is_complete
  );

  const high = visibleTasks.filter((t) => t.urgency === "High");
  const medium = visibleTasks.filter((t) => t.urgency === "Medium");
  const low = visibleTasks.filter((t) => t.urgency === "Low");

  const openCount = tasks.filter((t) => !t.is_complete).length;
  const completeCount = tasks.filter((t) => t.is_complete).length;

  // ================= STYLES =================
  const card = {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  };

  const sectionTitle = {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "10px",
    letterSpacing: "0.05em",
  };

  // ================= UI =================
  return (
    <div style={{ padding: "30px", background: "#f5f6f7" }}>

      <h1 style={{ marginBottom: "5px" }}>Daily page</h1>
      <p style={{ color: "#6b7280", marginBottom: "20px" }}>
        Tasks, goals, and habits for one day.
      </p>

      {/* TOP CARDS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ ...card, flex: 2 }}>
          <div style={sectionTitle}>SELECTED DAY</div>
          <h2>Today</h2>
        </div>

        <div style={{ ...card, flex: 1 }}>
          <div style={sectionTitle}>OPEN TASKS</div>
          <h2>{openCount}</h2>
        </div>

        <div style={{ ...card, flex: 1 }}>
          <div style={sectionTitle}>COMPLETED</div>
          <h2>{completeCount}</h2>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display: "flex", gap: "20px" }}>

        {/* LEFT */}
        <div style={{ width: "300px", ...card }}>
          <div style={sectionTitle}>DAILY HABITS</div>

          {["Wake up", "Workout", "Read"].map((h, i) => (
            <div key={i} style={{
              padding: "10px",
              marginBottom: "8px",
              background: "#f1f5f9",
              borderRadius: "10px"
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, ...card }}>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px"
          }}>
            <div style={sectionTitle}>DAILY TASKS</div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowCompleted(!showCompleted)}>
                {showCompleted ? "Hide Completed" : "Show Completed"}
              </button>
            </div>
          </div>

          {/* ADD */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Task"
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
          {[...overdue, ...high, ...medium, ...low].map((task, i) => (
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
                cursor: "grab"
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

                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  {task.assigned_to} • {task.urgency} • {task.due_date || "No date"}
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
