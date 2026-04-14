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
    <div style={{ padding: "40px" }}>
      <h1>Tasks ✅</h1>

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
      <ul>
      tasks
  .filter(task => showCompleted || !task.is_complete)
  .map((task) => (
          <li
            key={task.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: task.is_complete ? "line-through" : "none",
              opacity: task.is_complete ? 0.5 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={task.is_complete}
              onChange={() => toggleComplete(task)}
            />

            {task.content}

            <button onClick={() => deleteTask(task.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
