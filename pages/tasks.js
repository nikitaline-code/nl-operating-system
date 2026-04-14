import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState("");
  const [assignedTo, setAssignedTo] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

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
        assigned_to: assignedTo,
        urgency,
        due_date: dueDate || null,
      },
    ]);

    setNewTask("");
    setDueDate("");
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    await supabase
      .from("Task List")
      .update({ is_complete: !task.is_complete })
      .eq("id", task.id);

    fetchTasks();
  };

  const deleteTask = async (id) => {
    await supabase.from("Task List").delete().eq("id", id);
    fetchTasks();
  };

  const openTasks = tasks.filter((t) => !t.is_complete).length;
  const completedTasks = tasks.filter((t) => t.is_complete).length;

  const today = new Date().toLocaleDateString();

  const renderTask = (task) => (
    <div key={task.id} style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid #eee"
    }}>
      <div>
        <input
          type="checkbox"
          checked={task.is_complete}
          onChange={() => toggleComplete(task)}
        />
        <span style={{ marginLeft: 10 }}>
          {task.content}
        </span>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          {task.assigned_to} • {task.urgency}
        </div>
      </div>
      <button onClick={() => deleteTask(task.id)}>✕</button>
    </div>
  );

  return (
    <div style={{
      background: "#f3f4f6",
      minHeight: "100vh",
      padding: "30px",
      fontFamily: "Inter"
    }}>

      <h2 style={{ marginBottom: "20px" }}>Daily page</h2>

      {/* TOP ROW */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gap: "20px",
        marginBottom: "20px"
      }}>

        {/* DATE CARD */}
        <div style={{
          background: "#e5e7eb",
          padding: "20px",
          borderRadius: "14px"
        }}>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>SELECTED DAY</p>
          <h2>{today}</h2>
        </div>

        {/* OPEN */}
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "14px"
        }}>
          <p>OPEN TASKS</p>
          <h2>{openTasks}</h2>
        </div>

        {/* COMPLETED */}
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "14px"
        }}>
          <p>COMPLETED</p>
          <h2>{completedTasks}</h2>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gap: "20px"
      }}>

        {/* LEFT COLUMN */}
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "14px"
        }}>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>DAILY HABITS</p>

          {["Wake up", "Workout", "Read", "Plan"].map((h, i) => (
            <div key={i} style={{
              padding: "10px",
              marginTop: "8px",
              background: "#f3f4f6",
              borderRadius: "10px"
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "14px"
        }}>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px"
          }}>
            <h3>Daily Tasks</h3>
          </div>

          {/* ADD */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginBottom: "10px"
          }}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add task"
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
              onChange={(e) => setDueDate(e.target.value)}
            />

            <button onClick={addTask}>Add</button>
          </div>

          {/* TASKS */}
          {tasks.map(renderTask)}

          {/* NOTES */}
          <div style={{ marginTop: "20px" }}>
            <p>Notes</p>
            <textarea style={{
              width: "100%",
              height: "80px",
              borderRadius: "10px",
              border: "1px solid #ddd"
            }} />
          </div>

        </div>
      </div>
    </div>
  );
}
