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
  <div style={{ display: "flex", padding: "30px", gap: "30px" }}>

    {/* LEFT - Weekly Priorities */}
    <div style={{ width: "25%" }}>
      <h2>Weekly Priorities</h2>

      <ul>
        <li>Close deals</li>
        <li>Health routine</li>
        <li>Deep work blocks</li>
      </ul>
    </div>

    {/* CENTER - Tasks */}
    <div style={{ width: "50%" }}>
      <h2>Daily Tasks</h2>

      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Add task..."
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

    {/* RIGHT - Notes */}
    <div style={{ width: "25%" }}>
      <h2>Notes</h2>
      <textarea placeholder="Write notes..." style={{ width: "100%", height: "200px" }} />

      <h3>Day Score</h3>
      <p>0</p>
    </div>

  </div>
);
  );const deleteTask = async (id) => {
  await supabase.from("Task List").delete().eq("id", id);
  fetchTasks();
};
}
