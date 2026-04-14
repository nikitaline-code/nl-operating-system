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
    <div style={{ display: "flex", height: "100vh", background: "#f9fafb" }}>
      {/* SIDEBAR */}
      <div style={{ width: "280px", padding: "24px", background: "#fff" }}>
        <h3>Weekly Priorities</h3>

        <input
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          placeholder="Add priority..."
        />
        <button onClick={addPriority}>+</button>

        {priorities.map((p, i) => (
          <div
            key={p.id}
            draggable
            onDragStart={() => handlePriorityDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handlePriorityDrop(i)}
          >
            {p.content}
            <button onClick={() => deletePriority(p.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "40px" }}>
        <h1>Tasks</h1>

        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Task..."
        />

        <select onChange={(e) => setAssignedBy(e.target.value)}>
          <option>Mark</option>
          <option>Dane</option>
        </select>

        <input type="date" onChange={(e) => setDueDate(e.target.value)} />

        <select onChange={(e) => setUrgency(e.target.value)}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <button onClick={addTask}>Add</button>

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
                padding: "10px",
                borderBottom: "1px solid #ddd",
                cursor: "grab",
              }}
            >
              <input
                type="checkbox"
                checked={task.is_complete}
                onChange={() => toggleComplete(task)}
              />

              {task.content}

              <div style={{ fontSize: "12px" }}>
                {task.assigned_by} | {task.urgency} | {task.due_date}
              </div>

              <button onClick={() => deleteTask(task.id)}>✕</button>
            </div>
          ))}
      </div>
    </div>
  );
}
