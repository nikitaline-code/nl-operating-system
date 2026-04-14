import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tasks() {
  // TASK STATE
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  // PRIORITY STATE
  const [priorities, setPriorities] = useState([]);
  const [newPriority, setNewPriority] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchPriorities();
  }, []);

  // =====================
  // TASK FUNCTIONS
  // =====================
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

  // =====================
  // PRIORITY FUNCTIONS
  // =====================
  const fetchPriorities = async () => {
    const { data } = await supabase
      .from("Priorities")
      .select("*")
      .order("order", { ascending: true });

    if (data) setPriorities(data);
  };

  const addPriority = async () => {
    if (!newPriority) return;

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("Priorities").insert([
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
    await supabase.from("Priorities").delete().eq("id", id);
    fetchPriorities();
  };

  // =====================
  // DRAG + DROP
  // =====================
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("dragIndex", index);
  };

  const handleDrop = async (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData("dragIndex");

    const updated = [...priorities];
    const draggedItem = updated.splice(dragIndex, 1)[0];
    updated.splice(dropIndex, 0, draggedItem);

    setPriorities(updated);

    // save new order
    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from("Priorities")
        .update({ order: i })
        .eq("id", updated[i].id);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // =====================
  // STATS
  // =====================
  const completedTasks = tasks.filter((t) => t.is_complete).length;
  const openTasks = tasks.filter((t) => !t.is_complete).length;

  // =====================
  // UI
  // =====================
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

        {/* HABITS (static for now) */}
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

        {/* PRIORITIES */}
        <h4 style={{ marginTop: "20px" }}>Weekly Priorities</h4>

        <input
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          placeholder="Add priority..."
        />
        <button onClick={addPriority}>Add</button>

        {priorities.map((p, i) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, i)}
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

        {/* TASK LIST */}
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
