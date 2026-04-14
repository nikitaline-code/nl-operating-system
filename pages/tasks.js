import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5" }}>
      
      {/* LEFT */}
      <div style={{
        width: "300px",
        padding: "20px",
        background: "#fff",
        borderRight: "1px solid #ddd"
      }}>
        <h2>Daily</h2>

        <h4>Habits</h4>
        {["Wake up early", "Workout", "Read", "Plan day"].map((h, i) => (
          <div key={i} style={{ padding: "10px", marginBottom: "8px", background: "#eee", borderRadius: "8px" }}>
            {h}
          </div>
        ))}

        <h4 style={{ marginTop: "20px" }}>Weekly Priorities</h4>
        {["Close deals", "Health focus", "System build"].map((p, i) => (
          <div key={i} style={{ padding: "10px", marginBottom: "8px", background: "#eee", borderRadius: "8px" }}>
            {p}
          </div>
        ))}
      </div>

      {/* RIGHT */}
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

        <div style={{ marginTop: "20px" }}>
          <h3>Progress</h3>
          <div style={{ height: "10px", background: "#ddd", borderRadius: "5px" }}>
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
