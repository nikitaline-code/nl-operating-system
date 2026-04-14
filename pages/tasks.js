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
        urgency: urgency,
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

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

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

  // ================= HABITS =================

  const toggleHabit = async (habit) => {
    await supabase
      .from("habits")
      .update({ completed: !habit.completed })
      .eq("id", habit.id);

    fetchHabits();
  };

  // ================= UI HELPERS =================

  const today = new Date();

  const overdueTasks = tasks.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date) < today &&
      !t.is_complete
  );

  const highTasks = tasks.filter(
    (t) => t.urgency === "High" && !t.is_complete
  );

  const mediumTasks = tasks.filter(
    (t) => t.urgency === "Medium" && !t.is_complete
  );

  const lowTasks = tasks.filter(
    (t) => t.urgency === "Low" && !t.is_complete
  );

  const completedCount = tasks.filter((t) => t.is_complete).length;
  const openCount = tasks.filter((t) => !t.is_complete).length;

  const urgencyColor = (u) => {
    if (u === "High") return "#ef4444";
    if (u === "Medium") return "#f59e0b";
    return "#10b981";
  };

  // ================= UI =================

  return (
    <div style={{ display: "flex", padding: "30px", gap: "20px", background: "#f8fafc", minHeight: "100vh" }}>

      {/* LEFT - HABITS */}
      <div style={{ width: "220px" }}>
        <h3>Habits</h3>

        {habits.map((h) => (
          <div
            key={h.id}
            onClick={() => toggleHabit(h)}
            style={{
              padding: "10px",
              marginTop: "8px",
              borderRadius: "10px",
              background: h.completed ? "#d1fae5" : "#ffffff",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            {h.name}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1 }}>

        <h1>Daily OS</h1>

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div>Open: {openCount}</div>
          <div>Completed: {completedCount}</div>
        </div>

        {/* CONTROLS */}
        <div style={{ marginBottom: "15px" }}>
          <button onClick={() => setShowCompleted(!showCompleted)}>
            {showCompleted ? "Hide Completed" : "Show Completed"}
          </button>
        </div>

        {/* ADD TASK */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Task..."
          />

          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
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

        {/* TASK GROUPS */}
        {[{ title: "Overdue", data: overdueTasks },
          { title: "High", data: highTasks },
          { title: "Medium", data: mediumTasks },
          { title: "Low", data: lowTasks }
        ].map((group) => (
          <div key={group.title} style={{ marginBottom: "20px" }}>
            <h3>{group.title}</h3>

            {group.data.map((task, i) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                style={{
                  padding: "10px",
                  marginTop: "6px",
                  background: "#ffffff",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: task.is_complete ? 0.5 : 1
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

                  <span style={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    color: urgencyColor(task.urgency)
                  }}>
                    {task.urgency}
                  </span>
                </div>

                <button onClick={() => deleteTask(task.id)}>✕</button>
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  );
}
