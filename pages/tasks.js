import { useEffect, useState } from "react";

const TASKS_KEY = "os-tasks";
const FOLLOWUPS_KEY = "dashboard-follow-ups";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [assignedFrom, setAssignedFrom] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);

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
      sourceTask: {
        from: task.assignedFrom,
        dueDate: task.dueDate,
        urgency: task.urgency,
      },
      completed: false,
      createdAt: new Date().toLocaleDateString(),
    };

    localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify([followUp, ...existing]));
    alert("Added to Follow-Ups");
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

        <section className="add-card">
          <h2>Add Task</h2>

          <div className="add-row">
            <input
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Add a new task..."
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

        <section className="task-card">
          <div className="card-head">
            <h2>Task List</h2>
            <span>{visibleTasks.length} items</span>
          </div>

          <div className="task-list">
            {visibleTasks.map((task) => (
              <div className={`task-row ${task.completed ? "done" : ""}`} key={task.id}>
                <input
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
                  Add to Follow-Ups
                </button>

                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          background: #f5f6f8;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #020617;
        }

        .page {
          min-height: 100vh;
          padding: 40px 24px;
        }

        .shell {
          max-width: 1220px;
          margin: 0 auto;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          letter-spacing: -0.04em;
        }

        .top p {
          margin: 8px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .hide-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #334155;
        }

        .add-card,
        .task-card {
          background: #ffffff;
          border: 1px solid #dfe3ea;
          border-radius: 18px;
          padding: 18px;
          margin-bottom: 18px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.045);
        }

        h2 {
          margin: 0 0 14px;
          font-size: 16px;
          font-weight: 800;
        }

        .add-row {
          display: grid;
          grid-template-columns: 1fr 130px 130px 150px 90px;
          gap: 10px;
        }

        input,
        select {
          height: 40px;
          border-radius: 12px;
          border: 1px solid #cfd6df;
          background: #f8fafc;
          padding: 0 12px;
          font-size: 13px;
          outline: none;
        }

        button {
          border: none;
          border-radius: 999px;
          background: #020617;
          color: white;
          font-size: 12px;
          font-weight: 800;
          padding: 8px 13px;
          cursor: pointer;
        }

        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .card-head span {
          font-size: 14px;
          color: #020617;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .task-row {
          display: grid;
          grid-template-columns: 24px 1fr auto auto 34px;
          align-items: center;
          gap: 12px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 14px;
          padding: 14px;
        }

        .task-row.done {
          opacity: 0.5;
        }

        .task-row.done h3 {
          text-decoration: line-through;
        }

        .task-main h3 {
          margin: 0 0 5px;
          font-size: 14px;
          font-weight: 800;
        }

        .task-main p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }

        .badge {
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 800;
        }

        .badge.low {
          background: #dcfce7;
          color: #166534;
        }

        .badge.medium {
          background: #fef3c7;
          color: #b45309;
        }

        .badge.high {
          background: #fee2e2;
          color: #b91c1c;
        }

        .followup-btn {
          background: #f8fafc;
          color: #020617;
          border: 1px solid #cfd6df;
        }

        .delete-btn {
          background: #f8fafc;
          color: #64748b;
          padding: 7px 10px;
        }
      `}</style>
    </main>
  );
}
