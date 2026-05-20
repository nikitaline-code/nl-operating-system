import { useEffect, useState } from "react";

const TASK_TABLE = "Task List";
const FOLLOWUPS_KEY = "dashboard-follow-ups";

function getTaskText(task) {
  return task.text || task.task || task.title || task.content || task.name || "";
}

function getTaskFrom(task) {
  return task.assignedFrom || task.assigned_from || task.from || task.owner || task.source || "N/A";
}

function getTaskDueDate(task) {
  return task.dueDate || task.due_date || task.date || "";
}

function getTaskUrgency(task) {
  return task.urgency || task.priority || "Medium";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [assignedFrom, setAssignedFrom] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [hideCompleted, setHideCompleted] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);

    const { data, error } = await supabase
      .from(TASK_TABLE)
      .select("*");

    if (error) {
      console.error("Supabase fetch error:", error);
      alert("Could not load tasks from Supabase. Check console.");
      setTasks([]);
    } else {
      setTasks(data || []);
    }

    setLoading(false);
  }

  async function addTask() {
    if (!taskText.trim()) return;

    const newTask = {
      task: taskText,
      assigned_from: assignedFrom,
      priority: urgency,
      due_date: dueDate || null,
      completed: false,
    };

    const { data, error } = await supabase
      .from(TASK_TABLE)
      .insert([newTask])
      .select();

    if (error) {
      console.error("Supabase add error:", error);
      alert("Task did not save. Check your column names in Supabase.");
      return;
    }

    setTasks([...(data || []), ...tasks]);
    setTaskText("");
    setDueDate("");
  }

  async function toggleTask(task) {
    const updatedCompleted = !task.completed;

    setTasks(
      tasks.map((item) =>
        item.id === task.id ? { ...item, completed: updatedCompleted } : item
      )
    );

    const { error } = await supabase
      .from(TASK_TABLE)
      .update({ completed: updatedCompleted })
      .eq("id", task.id);

    if (error) {
      console.error("Supabase update error:", error);
      alert("Could not update task.");
      fetchTasks();
    }
  }

  async function deleteTask(id) {
    const oldTasks = tasks;
    setTasks(tasks.filter((task) => task.id !== id));

    const { error } = await supabase
      .from(TASK_TABLE)
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      alert("Could not delete task.");
      setTasks(oldTasks);
    }
  }

  function addTaskToFollowUps(task) {
    const saved = localStorage.getItem(FOLLOWUPS_KEY);
    const existing = saved ? JSON.parse(saved) : [];

    const followUp = {
      id: Date.now(),
      text: getTaskText(task),
      sourceTask: {
        from: getTaskFrom(task),
        dueDate: getTaskDueDate(task),
        urgency: getTaskUrgency(task),
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
            <p className="eyebrow">OPERATING SYSTEM</p>
            <h1>Tasks</h1>
            <p className="subtitle">
              One clean place for priorities, delegated items, and follow-ups.
            </p>
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
          <div className="card-header">
            <h2>Add Task</h2>
          </div>

          <div className="add-row">
            <input
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Add a new task..."
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
              }}
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
          <div className="card-title-row">
            <div>
              <h2>Task List</h2>
              <p>
                {loading
                  ? "Loading from Supabase..."
                  : `${visibleTasks.length} showing · ${
                      tasks.filter((task) => task.completed).length
                    } completed`}
              </p>
            </div>

            <button className="refresh-btn" onClick={fetchTasks}>
              Refresh
            </button>
          </div>

          <div className="task-list">
            {visibleTasks.length === 0 ? (
              <p className="empty">
                {loading ? "Loading tasks..." : "No tasks showing."}
              </p>
            ) : (
              visibleTasks.map((task) => {
                const taskName = getTaskText(task);
                const from = getTaskFrom(task);
                const due = getTaskDueDate(task);
                const level = getTaskUrgency(task);

                return (
                  <div
                    className={`task-row ${task.completed ? "done" : ""}`}
                    key={task.id}
                  >
                    <input
                      className="task-check"
                      type="checkbox"
                      checked={!!task.completed}
                      onChange={() => toggleTask(task)}
                    />

                    <div className="task-main">
                      <h3>{taskName || "Untitled task"}</h3>
                      <p>
                        From: {from}
                        {due ? ` · Due: ${due}` : ""}
                      </p>
                    </div>

                    <span className={`badge ${String(level).toLowerCase()}`}>
                      {level}
                    </span>

                    <button
                      className="followup-btn"
                      onClick={() => addTaskToFollowUps(task)}
                    >
                      Add to Follow-Ups
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task.id)}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
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
          padding: 38px 24px 80px;
        }

        .shell {
          width: 100%;
          max-width: 1220px;
          margin: 0 auto;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: 10px;
          letter-spacing: 0.18em;
          font-weight: 700;
          color: #64748b;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .subtitle {
          margin: 10px 0 0;
          font-size: 12px;
          color: #475569;
        }

        .hide-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #334155;
        }

        .add-card,
        .task-card {
          background: #ffffff;
          border: 1px solid #dfe3ea;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.045);
          margin-bottom: 18px;
          padding: 18px;
        }

        .card-header h2,
        .card-title-row h2 {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 800;
        }

        .card-title-row {
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .card-title-row p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }

        .add-row {
          display: grid;
          grid-template-columns: 1fr 130px 130px 150px 90px;
          gap: 10px;
        }

        input,
        select {
          height: 38px;
          border-radius: 12px;
          border: 1px solid #cfd6df;
          background: #f8fafc;
          padding: 0 12px;
          font-size: 12px;
          color: #020617;
          outline: none;
        }

        button {
          border: none;
          border-radius: 999px;
          background: #020617;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          padding: 8px 13px;
          cursor: pointer;
        }

        .refresh-btn {
          background: #f8fafc;
          color: #020617;
          border: 1px solid #cfd6df;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-row {
          display: grid;
          grid-template-columns: 22px minmax(0, 1fr) auto auto 28px;
          align-items: center;
          gap: 10px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 14px;
          padding: 10px 12px;
          min-height: 56px;
        }

        .task-row:hover {
          background: #fbfcfe;
          border-color: #d7dde6;
        }

        .task-row.done {
          opacity: 0.52;
        }

        .task-row.done h3 {
          text-decoration: line-through;
        }

        .task-check {
          width: 14px;
          height: 14px;
          padding: 0;
        }

        .task-main {
          min-width: 0;
        }

        .task-main h3 {
          margin: 0 0 4px;
          font-size: 13px;
          line-height: 1.25;
          font-weight: 650;
          color: #020617;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .task-main p {
          margin: 0;
          font-size: 11px;
          line-height: 1.25;
          color: #64748b;
        }

        .badge {
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 10.5px;
          font-weight: 800;
          white-space: nowrap;
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
          padding: 6px 10px;
          font-size: 10.5px;
          font-weight: 800;
          white-space: nowrap;
        }

        .delete-btn {
          background: #f8fafc;
          color: #64748b;
          border: 1px solid transparent;
          padding: 5px 9px;
          font-size: 12px;
        }

        .delete-btn:hover {
          color: #991b1b;
          border-color: #fecaca;
          background: #fff;
        }

        .empty {
          margin: 0;
          padding: 14px;
          font-size: 12px;
          color: #64748b;
        }

        @media (max-width: 900px) {
          .top {
            flex-direction: column;
            gap: 12px;
          }

          .add-row {
            grid-template-columns: 1fr;
          }

          .task-row {
            grid-template-columns: 22px 1fr;
          }

          .badge,
          .followup-btn,
          .delete-btn {
            grid-column: 2;
            justify-self: flex-start;
          }
        }
      `}</style>
    </main>
  );
}
