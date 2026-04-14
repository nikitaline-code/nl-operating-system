import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tasks() {
  // ================= STATE =================
  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState("");
  const [assignedTo, setAssignedTo] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [showCompleted, setShowCompleted] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from("Task List").select("*");
    if (data) setTasks(data);
  };

  // ================= ADD =================
  const addTask = async () => {
    if (!newTask) return;

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("Task List").insert([
      {
        content: newTask,
        user_id: user.id,
        is_complete: false,
        assigned_to: assignedTo,
        urgency: urgency,
        due_date: dueDate || null,
      },
    ]);

    setNewTask("");
    setDueDate("");
    fetchTasks();
  };

  // ================= DELETE =================
  const deleteTask = async (id) => {
    await supabase.from("Task List").delete().eq("id", id);
    fetchTasks();
  };

  // ================= TOGGLE =================
  const toggleComplete = async (task) => {
    await supabase
      .from("Task List")
      .update({ is_complete: !task.is_complete })
      .eq("id", task.id);

    fetchTasks();
  };

  // ================= GROUPING (FIXED LOCATION) =================
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

  // ================= UI =================
  return (
    <div style={{ padding: "40px" }}>
      <h1>Tasks</h1>

      {/* ADD */}
      <div style={{ marginBottom: "20px" }}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Task"
        />

        <select onChange={(e) => setAssignedTo(e.target.value)}>
          <option>Mark</option>
          <option>Dane</option>
        </select>

        <select onChange={(e) => setUrgency(e.target.value)}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <button onClick={addTask}>Add</button>
      </div>

      {/* GROUPS */}

      <h3>Overdue</h3>
      {overdueTasks.map((t) => (
        <div key={t.id}>{t.content}</div>
      ))}

      <h3>High</h3>
      {highTasks.map((t) => (
        <div key={t.id}>{t.content}</div>
      ))}

      <h3>Medium</h3>
      {mediumTasks.map((t) => (
        <div key={t.id}>{t.content}</div>
      ))}

      <h3>Low</h3>
      {lowTasks.map((t) => (
        <div key={t.id}>{t.content}</div>
      ))}
    </div>
  );
}
