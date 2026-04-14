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

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("Task List").insert([
      {
        content: newTask,
        user_id: user.id,
        is_complete: false,
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
      .from("Weekly Priorities") // ✅ FIXED
      .select("*")
      .order("order", { ascending: true });

    if (data) setPriorities(data);
  };

  const addPriority = async () => {
  if (!newPriority) return;

  const user = (await supabase.auth.getUser()).data.user;
  console.log("USER:", user);

  const { data, error } = await supabase
    .from("Weekly Priorities")
    .insert([
      {
        content: newPriority,
        user_id: user?.id,
        order: priorities.length,
      },
    ])
    .select();

  console.log("INSERT RESULT:", data);
  console.log("INSERT ERROR:", error);

  setNewPriority("");
  fetchPriorities();
};

  const deletePriority = async (id) => {
    await supabase.from("Weekly Priorities").delete().eq("id", id);
    fetchPriorities();
  };

  // ===== DRAG LOGIC =====

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

    // save order to DB
    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from("Weekly Priorities") // ✅ FIXED
        .update({ order: i })
        .eq("id", updated[i].id);
    }

    fetchPriorities();
  };

  // ================= UI =================

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f8fafc",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: "300px",
          padding: "24px",
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <h2>Daily</h2>

        <p style={{ fontSize: "12px", color: "#6b7280" }}>HABITS</p>

        {["Wake up early", "Workout", "Read", "Plan day"].map((h, i) => (
          <div
            key={i}
            style={{
              padding: "12px",
              marginTop: "8px",
              background: "#f1f5f9",
              borderRadius: "10px",
            }}
          >
            {h}
          </div>
        ))}

        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginTop: "24px",
          }}
        >
          WEEKLY PRIORITIES
        </p>

        {/* ADD PRIORITY */}
        <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
          <input
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            placeholder="Add priority..."
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={addPriority}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: "black",
              color: "white",
              border: "none",
            }}
          >
            +
          </button>
        </div>

        {/* PRIORITY LIST */}
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
                background: "#f1f5f9",
                borderRadius: "10px",
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
      <div style={{ flex: 1, padding: "40px" }}>
        <h1>Daily OS 🚀</h1>

        <p style={{ color: "#6b7280" }}>
          Open: {openTasks} • Completed: {completedTasks}
        </p>

        {/* ADD TASK */}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add task..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={addTask}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              background: "black",
              color: "white",
              border: "none",
            }}
          >
            Add
          </button>

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              background: "white",
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
            marginTop: "20px",
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
                  borderBottom: "1px solid #eee",
                  opacity: task.is_complete ? 0.5 : 1,
                }}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={task.is_complete}
                    onChange={() => toggleComplete(task)}
                  />
                  <span
                    style={{
                      marginLeft: "10px",
                      textDecoration: task.is_complete
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {task.content}
                  </span>
                </div>

                <button onClick={() => deleteTask(task.id)}>✕</button>
              </div>
            ))}
        </div>

        {/* PROGRESS */}
        <div style={{ marginTop: "30px" }}>
          <p>Progress</p>
          <div
            style={{
              height: "8px",
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
                background: "black",
                borderRadius: "999px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
