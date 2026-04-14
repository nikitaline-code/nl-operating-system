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
  const [dueDate, setDueDate] = useState("");
  const [urgency, setUrgency] = useState("Medium");

  const [showCompleted, setShowCompleted] = useState(true);

  const [dragTaskIndex, setDragTaskIndex] = useState(null);
  const [dragPriorityIndex, setDragPriorityIndex] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchPriorities();
  }, []);

  // ================= TASKS =================

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("Task List")
      .select("*")
      .order("order", { ascending: true });

    if (data) setTasks(data);
  };

  const addTask = async () => {
    if (!newTask) return;

    await supabase.from("Task List").insert([
      {
        content: newTask,
        is_complete: false,
        assigned_by: assignedBy,
        due_date: dueDate || null,
        urgency: urgency,
        order: tasks.length,
      },
    ]);

    setNewTask("");
    setDueDate("");
    setUrgency("Medium");
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

  // ===== TASK DRAG =====

  const handleTaskDragStart = (index) => {
    setDragTaskIndex(index);
  };

  const handleTaskDrop = async (dropIndex) => {
    if (dragTaskIndex === null) return;

    const updated = [...tasks];
    const dragged = updated[dragTaskIndex];

    updated.splice(dragTaskIndex, 1);
    updated.splice(dropIndex, 0, dragged);

    setTasks(updated);
    setDragTaskIndex(null);

    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from("Task List")
        .update({ order: i })
        .eq("id", updated[i].id);
    }
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

  const handlePriorityDragStart = (index) => {
    setDragPriorityIndex(index);
  };

  const handlePriorityDrop = async (dropIndex) => {
    if (dragPriorityIndex === null) return;

    const updated = [...priorities];
    const dragged = updated[dragPriorityIndex];

    updated.splice(dragPriorityIndex, 1);
    updated.splice(dropIndex, 0, dragged);

    setPriorities(updated);
    setDragPriorityIndex(null);

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
      background: "#f5f6f8",
      minHeight: "100vh",
      padding: "24px",
      fontFamily: "Inter, system-ui",
    }}
  >
    {/* HEADER */}
    <div style={{ marginBottom: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>
        Daily page
      </h1>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Tasks, habits, and execution for the day
      </p>
    </div>

    {/* TOP CARDS */}
    <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
      <div style={cardStyle}>
        <p style={labelStyle}>OPEN TASKS</p>
        <h2>{openTasks}</h2>
      </div>

      <div style={cardStyle}>
        <p style={labelStyle}>COMPLETED</p>
        <h2>{completedTasks}</h2>
      </div>
    </div>

    <div style={{ display: "flex", gap: "20px" }}>
      
      {/* LEFT PANEL */}
      <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* PRIORITIES */}
        <div style={cardStyle}>
          <p style={labelStyle}>WEEKLY PRIORITIES</p>

          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <input
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              placeholder="Add priority..."
              style={inputStyle}
            />
            <button onClick={addPriority} style={buttonStyle}>+</button>
          </div>

          <div style={{ marginTop: "10px" }}>
            {priorities.map((p, i) => (
              <div
                key={p.id}
                draggable
                onDragStart={() => handlePriorityDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handlePriorityDrop(i)}
                style={pillStyle}
              >
                {p.content}
                <button onClick={() => deletePriority(p.id)} style={iconBtn}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div style={{ flex: 1 }}>
        
        {/* TASK INPUT */}
        <div style={{ ...cardStyle, marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add task..."
              style={{ ...inputStyle, flex: 1 }}
            />

            <select onChange={(e) => setAssignedBy(e.target.value)} style={inputStyle}>
              <option>Mark</option>
              <option>Dane</option>
            </select>

            <input type="date" onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />

            <select onChange={(e) => setUrgency(e.target.value)} style={inputStyle}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <button onClick={addTask} style={buttonStyle}>
              Add
            </button>
          </div>
        </div>

        {/* TASK LIST */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <p style={labelStyle}>DAILY TASKS</p>

            <button
              onClick={() => setShowCompleted(!showCompleted)}
              style={ghostBtn}
            >
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </button>
          </div>

          {tasks
            .filter((task) => showCompleted || !task.is_complete)
            .map((task, i) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleTaskDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleTaskDrop(i)}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: task.is_complete ? 0.5 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={task.is_complete}
                    onChange={() => toggleComplete(task)}
                  />

                  <div>
                    <div>{task.content}</div>

                    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      <span style={tagStyle}>{task.assigned_by}</span>
                      <span style={tagStyle}>{task.urgency}</span>
                      {task.due_date && <span style={tagStyle}>{task.due_date}</span>}
                    </div>
                  </div>
                </div>

                <button onClick={() => deleteTask(task.id)} style={iconBtn}>
                  ✕
                </button>
              </div>
            ))}
        </div>

        {/* PROGRESS */}
        <div style={{ ...cardStyle, marginTop: "16px" }}>
          <p style={labelStyle}>PROGRESS</p>

          <div style={{
            height: "8px",
            background: "#e5e7eb",
            borderRadius: "999px",
            marginTop: "8px"
          }}>
            <div style={{
              width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%`,
              height: "100%",
              background: "#111827",
              borderRadius: "999px"
            }} />
          </div>
        </div>
      </div>
    </div>
  </div>
);
 
