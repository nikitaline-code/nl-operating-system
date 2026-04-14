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
      .from("priorities")
      .select("*")
      .order("order", { ascending: true });

    if (data) setPriorities(data);
  };

  const addPriority = async () => {
    if (!newPriority) return;

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("priorities").insert([
      {
        content: newPriority,
        user_id: user.id,
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
        .from("priorities")
        .update({ order: i })
        .eq("id", updated[i].id);
    }

    fetchPriorities();
  };

  // ================= UI =================

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5" }}>

      {/* LEFT PANEL */}
      <div style={{
        width: "300px",
        padding: "20px",
        background: "#fff",
        borderRight: "1px solid #ddd"
      }}>
        <h2>Daily</h2>

        <h4>Habits</h4>
        {["Wake up early", "Workout", "Read", "Plan day"].map((h, i) => (
          <div key={i} style={{
            padding: "10px",
            marginBottom: "8px",
            background: "#eee",
            borderRadius: "8px"
          }}>
            {h}
          </div>
        ))}

        <h4 style={{ marginTop: "20px" }}>Weekly Priorities</h4>

        <input
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          placeholder="Add priority..."
        />
        <button onClick={addPriority}>Add</button>

        <div style={{ marginTop: "10px" }}>
          {priorities.map((p, i) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              style={{
                padding: "10px",
                marginBottom: "8px",
                background: "#eee",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                cursor: "grab"
              }}
            >
              <span>{p.content}</span>
              <button onClick={() => deletePriority(p.id)}>❌</button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, padding: "30px" }}>
        <h1>Daily OS 🚀</h1>

        <h3>Open: {openTasks} | Completed: {completedTasks}</h3>

        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add task..."
        />
        <button onClick={addTask}>Add</button>

        <button onClick={() => setShowCompleted(!showCompleted)}>
          {showCompleted ? "Hide Completed" : "Show Completed"}
        </button>

        <div style={{ marginTop: "20px" }}>
          {tasks
            .filter((task) => showCompleted || !task.is_complete)
            .map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  opacity: task.is_complete ? 0.5 : 1
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
                </div>

                <button onClick={() => deleteTask(task.id)}>❌</button>
              </div>
            ))}
        </div>

        {/* PROGRESS BAR */}
        <div style={{ marginTop: "20px" }}>
          <h3>Progress</h3>
          <div style={{
            height: "10px",
            background: "#ddd",
            borderRadius: "5px"
          }}>
            <div style={{
              width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%`,
              height: "100%",
              background: "green"
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
