import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from("Task List").select("*");
    if (!error) setTasks(data);
  };

  const addTask = async () => {
    if (!newTask) return;

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("Task List").insert([
      {
        content: newTask,
        user_id: user.id,
        is_complete: false
      }
    ]);

    setNewTask("");
    fetchTasks();
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Tasks ✅</h1>

      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New task..."
      />

      <button onClick={addTask}>Add</button>

      <ul>
        {tasks.map((task) => (
         <li key={task.id} style={{ display: "flex", gap: "10px" }}>
  {task.content}
  <button onClick={() => deleteTask(task.id)}>❌</button>
</li>
        ))}
      </ul>
    </div>
  );const deleteTask = async (id) => {
  await supabase.from("Task List").delete().eq("id", id);
  fetchTasks();
};
}
