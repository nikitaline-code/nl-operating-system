import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);

  const [newTask, setNewTask] = useState("");
  const [assigned, setAssigned] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [showCompleted, setShowCompleted] = useState(true);
  const [autoSort, setAutoSort] = useState(false);

  const [dragIndex, setDragIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, []);

  // ================= FETCH =================
  const fetchTasks = async () => {
    const { data } = await supabase
      .from("Task List")
      .select("*")
      .order("order", { ascending: true });

    if (data) setTasks(data);
  };

  const fetchHabits = async () => {
    const user = (await supabase.auth.getUser()).data.user;

    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id);

    if (data) setHabits(data);
  };

  // ================= ADD TASK =================
  const addTask = async () => {
    if (!newTask) return;

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("Task List").insert([
      {
        content: newTask,
        user_id: user.id,
        assigned_to: assigned,
        urgency,
        due_date: dueDate || null,
        is_complete: false,
        order: tasks.length
      }
    ]);

    setNewTask("");
    setDueDate("");
    fetchTasks();
  };

  const handleKey = (e) => {
    if (e.key === "Enter") addTask();
  };

  // ================= TASK ACTIONS =================
  const toggleComplete = async (task) => {
    await supabase
      .from("Task List")
      .update({ is_complete: !task.is_complete })
      .eq("id", task.id);

    fetchTasks();
  };

  const updateTaskText = async (id) => {
    await supabase
      .from("Task List")
      .update({ content: editingText })
      .eq("id", id);

    setEditingId(null);
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await supabase.from("Task List").delete().eq("id", id);
    fetchTasks();
  };

  // ================= DRAG =================
  const handleDragStart = (i) => setDragIndex(i);

  const handleDrop = async (dropIndex) => {
    if (dragIndex === null || autoSort) return;

    const updated = [...tasks];
    const dragged = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, dragged);

    setTasks(updated);
    setDragIndex(null);

    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from("Task List")
        .update({ order: i })
        .eq("id", updated[i].id);
    }
  };

  // ================= AUTO SORT =================
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!autoSort) return 0;

    const urgencyRank = { High: 1, Medium: 2, Low: 3 };

    if (urgencyRank[a.urgency] !== urgencyRank[b.urgency]) {
      return urgencyRank[a.urgency] - urgencyRank[b.urgency];
    }

    return new Date(a.due_date || 999999999) - new Date(b.due_date || 999999999);
  });

  const visibleTasks = (autoSort ? sortedTasks : tasks).filter(
    (t) => showCompleted || !t.is_complete
  );

  // ================= HABITS =================
  const toggleHabit = async (habit) => {
    const today = new Date().toISOString().split("T")[0];

    let newStreak = habit.streak || 0;

    if (!habit.done) {
      if (habit.last_completed) {
        const last = new Date(habit.last_completed);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const lastDate = last.toISOString().split("T")[0];
        const yDate = yesterday.toISOString().split("T")[0];

        if (lastDate === yDate) newStreak += 1;
        else if (lastDate !== today) newStreak = 1;
      } else {
        newStreak = 1;
      }
    }

    await supabase
      .from("habits")
      .update({
        done: !habit.done,
        streak: newStreak,
        last_completed: today
      })
      .eq("id", habit.id);

    fetchHabits();
  };

  // ================= PROGRESS =================
  const completedHabits = habits.filter((h) => h.done).length;
  const progress = habits.length
    ? (completedHabits / habits.length) * 100
    : 0;

  // ================= UI =================
  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh", fontFamily: "Inter" }}>

      <h1>Daily OS</h1>

      {/* CONTROLS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setShowCompleted(!showCompleted)} style={pill}>
          {showCompleted ? "Hide Completed" : "Show Completed"}
        </button>

        <button onClick={() => setAutoSort(!autoSort)} style={pill}>
          {autoSort ? "Manual Order" : "Auto Sort"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>

        {/* HABITS */}
        <div style={card}>
          <h4>Habits</h4>

          {/* PROGRESS */}
          <div style={{ marginBottom: "12px" }}>
            <div style={progressBarBg}>
              <div style={{ ...progressBarFill, width: `${progress}%` }} />
            </div>
            <p style={smallText}>
              {completedHabits} / {habits.length} completed
            </p>
          </div>

          {habits.map((h) => (
            <div key={h.id} style={habitRow}>
              <input
                type="checkbox"
                checked={h.done}
                onChange={() => toggleHabit(h)}
              />
              <span style={{
                fontSize: "12px",
                textDecoration: h.done ? "line-through" : "none"
              }}>
                {h.name}
              </span>

              <span style={streak}>
                🔥 {h.streak || 0}
              </span>
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div style={{ flex: 1, ...card }}>

          {/* INPUT */}
          <div style={inputBar}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Add task..."
              style={input}
            />

            <select onChange={(e) => setAssigned(e.target.value)}>
              <option>Mark</option>
              <option>Dane</option>
            </select>

            <select onChange={(e) => setUrgency(e.target.value)}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <input type="date" onChange={(e) => setDueDate(e.target.value)} />

            <button onClick={addTask}>Add</button>
          </div>

          {/* LIST */}
          {visibleTasks.map((task, i) => (
            <div
              key={task.id}
              draggable={!autoSort}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              style={taskRow}
            >
              <div>
                <input
                  type="checkbox"
                  checked={task.is_complete}
                  onChange={() => toggleComplete(task)}
                />

                {editingId === task.id ? (
                  <input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => updateTaskText(task.id)}
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => {
                      setEditingId(task.id);
                      setEditingText(task.content);
                    }}
                    style={{ marginLeft: "10px" }}
                  >
                    {task.content}
                  </span>
                )}
              </div>

              <div style={meta}>
                {task.assigned_to} • {task.urgency}
              </div>

              <button onClick={() => deleteTask(task.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const card = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const pill = {
  padding: "6px 12px",
  borderRadius: "999px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  fontSize: "12px"
};

const inputBar = {
  display: "flex",
  gap: "8px",
  marginBottom: "16px"
};

const input = {
  flex: 2,
  border: "none",
  outline: "none"
};

const taskRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  borderBottom: "1px solid #eee"
};

const habitRow = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px"
};

const progressBarBg = {
  height: "6px",
  background: "#e5e7eb",
  borderRadius: "999px"
};

const progressBarFill = {
  height: "100%",
  background: "#111",
  borderRadius: "999px",
  transition: "width 0.3s ease"
};

const smallText = {
  fontSize: "11px",
  color: "#6b7280"
};

const streak = {
  marginLeft: "auto",
  fontSize: "11px",
  color: "#9ca3af"
};

const meta = {
  fontSize: "12px",
  color: "#6b7280"
};
