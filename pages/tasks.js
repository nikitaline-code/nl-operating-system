import { useEffect, useState } from "react";

const TASKS_KEY = "os-tasks";
const FOLLOWUPS_KEY = "dashboard-follow-ups";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [assignedFrom, setAssignedFrom] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [hideCompleted, setHideCompleted] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(TASKS_KEY);
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    if (!taskText.trim()) return;

    const newTask = {
      id: Date.now(),
      text: taskText,
      assignedFrom,
      urgency,
      dueDate,
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setTaskText("");
    setDueDate("");
  }

  function toggleTask(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function addTaskToFollowUps(task) {
    const saved = localStorage.getItem(FOLLOWUPS_KEY);
    const existing = saved ? JSON.parse(saved) : [];

    const followUp = {
      id: Date.now(),
      text: task.text,
      completed: false,
      createdAt: new Date().toLocaleDateString(),
    };

    localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify([followUp, ...existing]));
  }

  const visibleTasks = hideCompleted
    ? tasks.filter((task) => !task.completed)
    : tasks;

  return (
    <main className="page">
      <div className="shell">
        <div className="top">
          <div>
            <h1>Tasks</h1>
            <p>One clean place for priorities, delegated items, and follow-ups.</p>
          </div>

          <label className="hide-toggle">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
            />
            Hide completed
          </label>
        </div>

        <section className="card">
          <h2>Add Task</h2>

          <div className="add-row">
            <input
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Add a new task..."
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />

            <select
              value={assignedFrom}
              onChange={(e) => setAssignedFrom(e.target.value)}
            >
              <option>Mark</option>
              <option>Dane</option>
              <option>Weekly Meeting</option>
            </select>

            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <button onClick={addTask}>Add</button>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Task List</h2>
            <span>{visibleTasks.length} items</span>
          </div>

          <div className="task-list">
            {visibleTasks.map((task) => (
              <div className={`task-row ${task.completed ? "done" : ""}`} key={task.id}>
                <input
                  className="task-check"
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />

                <div className="task-main">
                  <h3>{task.text}</h3>
                  <p>
                    From: {task.assignedFrom}
                    {task.dueDate ? ` · Due: ${task.dueDate}` : ""}
                  </p>
                </div>

                <span className={`badge ${task.urgency.toLowerCase()}`}>
                  {task.urgency}
                </span>

                <button
                  className="followup-btn"
                  onClick={() => addTaskToFollowUps(task)}
                >
                  Follow-Up
                </button>

                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  ×
                </button>
              </div>
            ))}

            {visibleTasks.length === 0 && (
              <p className="empty">No tasks showing.</p>
            )}
          </div>
        </section>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          background: #f5f6f8;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .page {
          padding: 32px 24px;
        }

        .shell {
          max-width: 1200px;
          margin: 0 auto;
        }

        .top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
        }

        .top p {
          margin: 6px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .hide-toggle {
          font-size: 12px;
        }

        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
        }

        h2 {
          font-size: 14px;
          margin-bottom: 10px;
        }

        .add-row {
          display: grid;
          grid-template-columns: 1fr 110px 110px 140px 80px;
          gap: 8px;
        }

        input,
        select {
          height: 34px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 12px;
          padding: 0 10px;
        }

        button {
          border: none;
          border-radius: 999px;
          background: #020617;
          color: white;
          font-size: 10px;
          padding: 6px 10px;
          cursor: pointer;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .task-row {
          display: grid;
          grid-template-columns: 18px 1fr auto auto 24px;
          align-items: center;
          gap: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 7px 10px;
          min-height: 44px;
        }

        .task-row.done {
          opacity: 0.5;
        }

        .task-main h3 {
          margin: 0 0 2px;
          font-size: 12px;
          font-weight: 600;
        }

        .task-main p {
          margin: 0;
          font-size: 10px;
          color: #64748b;
        }

        .badge {
          padding: 3px 7px;
          border-radius: 999px;
          font-size: 9.5px;
          font-weight: 700;
        }

        .badge.low {
          background: #dcfce7;
        }

        .badge.medium {
          background: #fef3c7;
        }

        .badge.high {
          background: #fee2e2;
        }

        .followup-btn {
          background: #f1f5f9;
          color: #020617;
          border: 1px solid #d1d5db;
          font-size: 9.5px;
          padding: 4px 8px;
        }

        .delete-btn {
          background: transparent;
          color: #9ca3af;
          font-size: 10px;
        }

        .task-check {
          width: 12px;
          height: 12px;
        }

        .empty {
          font-size: 12px;
          color: #64748b;
          padding: 10px;
        }
      `}</style>
    </main>
  );
}
