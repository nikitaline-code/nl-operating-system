import { useEffect, useState } from "react";

export default function Dashboard() {
  const [followUps, setFollowUps] = useState([]);
  const [newFollowUp, setNewFollowUp] = useState("");

  const [tasks] = useState([
    {
      id: 1,
      task: "Plan for current Powerpack inventory",
      dealer: "Jonsey",
      responsible: "Ryan",
      dueDate: "3/18/2026",
    },
    {
      id: 2,
      task: "Schedule marketing review session with Brodie",
      dealer: "Chatsworth",
      responsible: "Ryan",
      dueDate: "3/20/2026",
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("dashboard-follow-ups");
    if (saved) setFollowUps(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard-follow-ups", JSON.stringify(followUps));
  }, [followUps]);

  function addFollowUp(text, sourceTask = null) {
    if (!text.trim()) return;

    const item = {
      id: Date.now(),
      text,
      sourceTask,
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

  const openFollowUps = followUps.filter((item) => !item.completed);
  const completedFollowUps = followUps.filter((item) => item.completed);

  return (
    <main className="page">
      <div className="shell">
        <div className="top">
          <div>
            <p className="eyebrow">EA COMMAND CENTER</p>
            <h1>Dashboard</h1>
            <p className="subtitle">
              Follow-ups, priorities, and task actions in one place.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard label="Follow-Ups" value={openFollowUps.length} />
          <StatCard label="Completed Follow-Ups" value={completedFollowUps.length} />
          <StatCard label="Tasks" value={tasks.length} />
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
              <h2>Task List</h2>
              <p>Add any task into Follow-Ups when it needs to be chased later.</p>
            </div>
          </div>

          <div className="task-list">
            {tasks.map((task) => (
              <div className="task-row" key={task.id}>
                <div>
                  <h3>{task.task}</h3>
                  <p>
                    {task.dealer || "No dealer"} · {task.responsible || "No owner"} ·{" "}
                    {task.dueDate || "No due date"}
                  </p>
                </div>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    addFollowUp(task.task, {
                      dealer: task.dealer,
                      responsible: task.responsible,
                      dueDate: task.dueDate,
                    })
                  }
                >
                  Add to Follow-Ups
                </button>
              </div>
            ))}
          </div>
        </section>

        {completedFollowUps.length > 0 && (
          <section className="card">
            <div className="card-header">
              <div>
                <h2>Completed Follow-Ups</h2>
                <p>Finished items kept here for reference.</p>
              </div>
            </div>

            <div className="follow-list">
              {completedFollowUps.map((item) => (
                <FollowUpItem
                  key={item.id}
                  item={item}
                  toggleFollowUp={toggleFollowUp}
                  deleteFollowUp={deleteFollowUp}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          background: #f5f6f8;
        }

        .page {
          min-height: 100vh;
          background: #f5f6f8;
          color: #020617;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 26px 24px 80px;
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
          font-size: 29px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .subtitle {
          margin: 10px 0 0;
          font-size: 12px;
          color: #475569;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }

        .stat-card,
        .card {
          background: #ffffff;
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
          line-height: 1;
        }

        .card {
          padding: 18px;
          margin-bottom: 18px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .card-header h2 {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 800;
        }

        .card-header p {
          margin: 0;
          font-size: 12px;
          color: #475569;
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
          color: #020617;
          outline: none;
        }

        button {
          border: none;
          background: #020617;
          color: #ffffff;
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .secondary-btn {
          background: #f8fafc;
          color: #020617;
          border: 1px solid #cfd6df;
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
          background: #ffffff;
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
        }

        .follow-item.done {
          opacity: 0.55;
        }

        .follow-main {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .follow-main input {
          width: 16px;
          height: 16px;
          margin-top: 3px;
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
          background: #ffffff;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .empty {
          margin: 0;
          padding: 14px;
          font-size: 12px;
          color: #64748b;
        }

        @media (max-width: 800px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .add-row {
            grid-template-columns: 1fr;
          }

          .follow-item,
          .task-row {
            align-items: flex-start;
            flex-direction: column;
          }
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
    <div className={`follow-item ${item.completed ? "done" : ""}`}>
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
            {item.sourceTask?.dealer ? ` · Dealer: ${item.sourceTask.dealer}` : ""}
            {item.sourceTask?.responsible
              ? ` · Owner: ${item.sourceTask.responsible}`
              : ""}
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
