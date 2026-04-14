import { useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [assignee, setAssignee] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);

  const addTask = () => {
    if (!taskInput) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: taskInput,
        assignee,
        urgency,
        dueDate,
        done: false,
      },
    ]);

    setTaskInput("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const openTasks = tasks.filter(t => !t.done).length;
  const completedTasks = tasks.filter(t => t.done).length;

  return (
    <div style={{ padding: 40, fontFamily: "Arial", background: "#f7f8fa", minHeight: "100vh" }}>
      <h1>Daily OS</h1>
      <p style={{ color: "#666" }}>Focused execution for today</p>

      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <div style={card}>
          <small>OPEN TASKS</small>
          <h2>{openTasks}</h2>
        </div>

        <div style={card}>
          <small>COMPLETED</small>
          <h2>{completedTasks}</h2>
        </div>

        <button onClick={() => setHideCompleted(!hideCompleted)}>
          {hideCompleted ? "Show Completed" : "Hide Completed"}
        </button>
      </div>

      <div style={card}>
        <h3>Daily Tasks</h3>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            placeholder="Add task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />

          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option>Mark</option>
            <option>Dane</option>
          </select>

          <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

          <button onClick={addTask}>Add</button>
        </div>

        {tasks
          .filter(t => (hideCompleted ? !t.done : true))
          .map(task => (
            <div key={task.id} style={taskRow}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />

              <div style={{ flex: 1 }}>
                <div style={{ textDecoration: task.done ? "line-through" : "none" }}>
                  {task.text}
                </div>

                <small style={{ color: "#888" }}>
                  {task.assignee} • {task.urgency} • {task.dueDate || "No date"}
                </small>
              </div>

              <button onClick={() => deleteTask(task.id)}>✕</button>
            </div>
          ))}
      </div>
    </div>
  );
}

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const taskRow = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: 10,
  borderBottom: "1px solid #eee",
};
