import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [priorities, setPriorities] = useState([]);

  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("");

  const [assignedBy, setAssignedBy] = useState("Mark");
  const [dueDate, setDueDate] = useState("");
  const [urgency, setUrgency] = useState("Medium");

  const [showCompleted, setShowCompleted] = useState(true);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchPriorities();
  }, []);

  // ================= TASKS =================

  const fetchTasks = async () => {
    const { data } = await supabase.from("Task List").select("*");
    if (data) setTasks(data);
  };

  const addTask = async () => {
    if (!newTask) return;

    await supabase.from("Task List").insert([
      {
        content: newTask,
        is_complete: false,
        assigned_by: assignedBy,
        due_date: dueDate || null,
        urgency: urgency,
      },
    ]);

    setNewTask("");
    setDueDate("");
    setUrgency("Medium");
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

  const completedTasks = tasks.filter((t) => t.is_complete).length;
  const openTasks = tasks.filter((t) => !t.is_complete).length;

  // ================= PRIORITIES =================

  const fetchPriorities = async () => {
    const { data } = await supabase
      .from("priorities")
      .select("*")
      .order("order", { ascending: true });

    if (data) setPriorities(data);
  };

  const addPriority = async () => {
    if (!newPriority) return;

    await supabase.from("priorities").insert([
      {
        content: newPriority,
        order: priorities.length,
      },
    ]);

    setNewPriority("");
    fetchPriorities();
  };

  const deletePriority = async (id) => {
    await supabase.from("priorities").delete().eq("id", id);
    fetchPriorities();
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDrop = async (dropIndex) => {
    if (dragIndex === null) return;

    const updated = [...priorities];
    const draggedItem = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    setPriorities(updated);
    setDragIndex(null);

    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from("priorities")
        .update({ order: i })
        .eq("id", updated[i].id);
    }
  };

  // ================= SORTING =================

  const sortedTasks = tasks
    .filter((task) => showCompleted || !task.is_complete)
    .sort((a, b) => {
      const urgencyOrder = { High: 1, Medium: 2, Low: 3 };

      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }

      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }

      return 0;
    });

  // ================= UI =================

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f9fafb",
        fontFamily: "Inter, system-ui",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: "280px",
          padding: "24px",
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <h2>Daily</h2>

        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "20px" }}>
          WEEKLY PRIORITIES
        </p>

        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <input
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            placeholder="Add priority..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
            }}
          />
          <button onClick={addPriority}>+</button>
        </div>

        {priorities.map((p, i) => (
          <div
            key={p.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            style={{
              padding: "10px",
              marginTop: "8px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              background: "#fff",
            }}
          >
            {p.content}
            <button onClick={() => deletePriority(p.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "40px" }}>
        <h1>Daily OS</h1>

        <p>
          Open: {openTasks} • Completed: {completedTasks}
        </p>

        {/* INPUT */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add task..."
          />

          <select
            value={assignedBy}
            onChange={(e) => setAssignedBy(e.target.value)}
          >
            <option value="Mark">Mark</option>
            <option value="Dane">Dane</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button onClick={addTask}>Add</button>
        </div>

        {/* TASK LIST */}
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            style={{
              padding: "10px",
              borderBottom: "1px solid #eee",
              opacity: task.is_complete ? 0.5 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={task.is_complete}
              onChange={() => toggleComplete(task)}
            />

            {task.content}

            <div style={{ fontSize: "12px" }}>
              {task.assigned_by} | {task.urgency} | {task.due_date}
            </div>

            <button onClick={() => deleteTask(task.id)}>✕</button>
          </div>
        ))}

        {/* PROGRESS */}
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              height: "6px",
              background: "#ddd",
              borderRadius: "999px",
            }}
          >
            <div
              style={{
                width: `${
                  tasks.length
                    ? (completedTasks / tasks.length) * 100
                    : 0
                }%`,
                height: "100%",
                background: "black",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
