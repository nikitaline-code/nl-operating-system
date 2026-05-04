import { useEffect, useState } from "react";

const TASKS_KEY = "os-tasks";
const FOLLOWUPS_KEY = "dashboard-follow-ups";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [newFollowUp, setNewFollowUp] = useState("");

  useEffect(() => {
    const savedTasks = localStorage.getItem(TASKS_KEY);
    const savedFollowUps = localStorage.getItem(FOLLOWUPS_KEY);

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedFollowUps) setFollowUps(JSON.parse(savedFollowUps));
  }, []);

  useEffect(() => {
    localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(followUps));
  }, [followUps]);

  const openTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const openFollowUps = followUps.filter((item) => !item.completed);
  const completedFollowUps = followUps.filter((item) => item.completed);

  function addFollowUp(text) {
    if (!text.trim()) return;

    const item = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toLocaleDateString(),
    };

    setFollowUps([item, ...followUps]);
    setNewFollowUp("");
  }

  function toggleFollowUp(id) {
    setFollowUps(
      followUps.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }

  function deleteFollowUp(id) {
    setFollowUps(followUps.filter((item) => item.id !== id));
  }

  return (
    <main className="page">
      <div className="shell">
        <div className="top">
          <div>
            <p className="eyebrow">EA COMMAND CENTER</p>
            <h1>Dashboard</h1>
            <p className="subtitle">
              Tasks and follow-ups pulled from your operating system.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard label="Open Tasks" value={openTasks.length} />
          <StatCard label="Completed Tasks" value={completedTasks.length} />
          <StatCard label="Open Follow-Ups" value={openFollowUps.length} />
          <StatCard label="Completed Follow-Ups" value={completedFollowUps.length} />
        </div>

        <section className="card">
          <div className="card-header">
            <div>
              <h2>Follow-Ups</h2>
              <p>Items that need to be checked on, chased, or brought forward.</p>
            </div>
          </div>

          <div className="add-row">
            <input
              value={newFollowUp}
              onChange={(e) => setNewFollowUp(e.target.value)}
              placeholder="Add a follow-up..."
              onKeyDown={(e) => {
                if (e.key === "Enter") addFollowUp(newFollowUp);
              }}
            />
            <button onClick={() => addFollowUp(newFollowUp)}>Add</button>
          </div>

          <div className="follow-list">
            {openFollowUps.length === 0 ? (
              <p className="empty">No open follow-ups.</p>
            ) : (
              openFollowUps.map((item) => (
                <FollowUpItem
                  key={item.id}
                  item={item}
                  toggleFollowUp={toggleFollowUp}
                  deleteFollowUp={deleteFollowUp}
                />
              ))
            )}
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2>Open Tasks</h2>
              <p>These are pulled from your Tasks page.</p>
            </div>
          </div>

          <div className="task-list">
            {openTasks.length === 0 ? (
              <p className="empty">No open tasks.</p>
            ) : (
              openTasks.map((task) => (
                <div className="task-row" key={task.id}>
                  <div>
                    <h3>{task.text}</h3>
                    <p>
                      From: {task.assignedFrom || "N/A"}
                      {task.dueDate ? ` · Due: ${task.dueDate}` : ""}
                    </p>
                  </div>
                  <span className={`badge ${task.urgency?.toLowerCase()}`}>
                    {task.urgency}
                  </span>
                </div>
              ))
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
          padding: 40px 24px;
        }

        .shell {
          max-width: 1220px;
          margin: 0 auto;
        }

        .top {
          margin-bottom: 24px;
        }

        .eyebrow {
          margin: 0 0 12px;
          font-size: 10px;
          letter-spacing: 0.18em;
          font-weight: 600;
          color: #64748b;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          letter-spacing: -0.04em;
        }

        .subtitle {
          margin: 8px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }

        .stat-card,
        .card {
          background: white;
          border: 1px solid #dfe3ea;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.045);
        }

        .stat-card {
          padding: 20px 18px;
          min-height: 78px;
        }

        .stat-card p {
          margin: 0 0 8px;
          font-size: 11px;
          color: #64748b;
        }

        .stat-card strong {
          font-size: 26px;
          font-weight: 800;
        }

        .card {
          padding: 18px;
          margin-bottom: 18px;
        }

        .card-header h2 {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 800;
        }

        .card-header p {
          margin: 0 0 16px;
          font-size: 12px;
          color: #64748b;
        }

        .add-row {
          display: grid;
          grid-template-columns: 1fr 90px;
          gap: 10px;
          margin-bottom: 16px;
        }

        input {
          height: 38px;
          border-radius: 12px;
          border: 1px solid #cfd6df;
          background: #f8fafc;
          padding: 0 12px;
          font-size: 13px;
          outline: none;
        }

        button {
          border: none;
          background: #020617;
          color: white;
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .follow-list,
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .follow-item,
        .task-row {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 13px 14px;
          background: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }

        .follow-main {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .follow-main h3,
        .task-row h3 {
          margin: 0 0 5px;
          font-size: 13px;
          font-weight: 800;
        }

        .follow-main p,
        .task-row p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }

        .delete-btn {
          background: white;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .badge {
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 800;
          background: #fef3c7;
          color: #b45309;
        }

        .empty {
          margin: 0;
          padding: 14px;
          font-size: 12px;
          color: #64748b;
        }
      `}</style>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function FollowUpItem({ item, toggleFollowUp, deleteFollowUp }) {
  return (
    <div className="follow-item">
      <div className="follow-main">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => toggleFollowUp(item.id)}
        />

        <div>
          <h3>{item.text}</h3>
          <p>
            Added {item.createdAt}
            {item.sourceTask?.from ? ` · From: ${item.sourceTask.from}` : ""}
            {item.sourceTask?.dueDate ? ` · Due: ${item.sourceTask.dueDate}` : ""}
          </p>
        </div>
      </div>

      <button className="delete-btn" onClick={() => deleteFollowUp(item.id)}>
        Delete
      </button>
    </div>
  );
}
