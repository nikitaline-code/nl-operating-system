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
      },
    ]);

    setNewTask("");
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

  // ===== DRAG =====

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

  // ================= UI =================

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f9fafb",
        fontFamily: "Inter, system-ui",
        color: "#111827",
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
        <h2 style={{ marginBottom: "20px" }}>Daily</h2>

        <p
          style={{
            fontSize: "11px",
            fontWeight: "600",
            letterSpacing: "0.08em",
            color: "#9ca3af",
          }}
        >
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
          <button
            onClick={addPriority}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              background: "#111827",
              color: "#fff",
              border: "none",
            }}
          >
            +
          </button>
        </div>

        <div style={{ marginTop: "12px" }}>
          {priorities.map((p, i) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              style={{
                padding: "12px",
                marginTop: "8px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                cursor: "grab",
              }}
            >
              <span>{p.content}</span>
              <button
                onClick={() => deletePriority(p.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "48px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "600" }}>Daily OS</h1>

        <p style={{ color: "#6b7280", marginBottom: "20px" }}>
          Open: {openTasks} • Completed: {completedTasks}
        </p>

        {/* INPUT */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add task..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
            }}
          />

          <select
            value={assignedBy}
            onChange={(e) => setAssignedBy(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
            }}
          >
            <option value="Mark">Mark</option>
            <option value="Dane">Dane</option>
          </select>

          <button
            onClick={addTask}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#111827",
              color: "#fff",
              border: "none",
            }}
          >
            Add
          </button>

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              background: "#fff",
            }}
          >
            {showCompleted ? "Hide Completed" : "Show Completed"}
          </button>
        </div>

        {/* TASK LIST */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #e5e7eb",
          }}
        >
          {tasks
            .filter((task) => showCompleted || !task.is_complete)
            .map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #f1f5f9",
                  opacity: task.is_complete ? 0.5 : 1,
                }}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={task.is_complete}
                    onChange={() => toggleComplete(task)}
                  />

                  <div style={{ marginLeft: "10px", display: "inline-block" }}>
                    <div>{task.content}</div>

                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background:
                          task.assigned_by === "Mark"
                            ? "#e0f2fe"
                            : "#fef3c7",
                        marginTop: "4px",
                        display: "inline-block",
                      }}
                    >
                      {task.assigned_by || "Unassigned"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>

        {/* PROGRESS */}
        <div style={{ marginTop: "30px" }}>
          <p style={{ marginBottom: "8px" }}>Progress</p>
          <div
            style={{
              height: "6px",
              background: "#e5e7eb",
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
                background: "#111827",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
