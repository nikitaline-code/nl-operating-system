import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [travelData, setTravelData] = useState(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const savedPriorities = JSON.parse(localStorage.getItem("weeklyPriorities") || "[]");
    const savedTravel = JSON.parse(localStorage.getItem("travelPageData") || "null");

    setTasks(savedTasks);
    setPriorities(savedPriorities);
    setTravelData(savedTravel);

    const now = new Date();
    setToday(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.complete).length;
    const open = total - completed;
    const high = tasks.filter((task) => task.urgency === "High" && !task.complete).length;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    return { total, completed, open, high, progress };
  }, [tasks]);

  const activeTrips = travelData?.trips || [];
  const upcomingTrips = activeTrips.slice(0, 4);
  const openTasks = tasks.filter((task) => !task.complete).slice(0, 6);
  const activePriorities = priorities.filter((priority) => priority && priority.trim());

  return (
    <div className="dashboardPage">
      <header className="hero">
        <div>
          <p className="eyebrow">Command Center</p>
          <h1>Dashboard</h1>
          <p className="subtext">{today} · Your operating system overview</p>
        </div>

        <div className="scoreCard">
          <span>Weekly Progress</span>
          <strong>{stats.progress}%</strong>
        </div>
      </header>

      <section className="statsGrid">
        <div className="statCard">
          <span>Open Tasks</span>
          <strong>{stats.open}</strong>
        </div>

        <div className="statCard">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>

        <div className="statCard">
          <span>High Priority</span>
          <strong>{stats.high}</strong>
        </div>

        <div className="statCard">
          <span>Trips</span>
          <strong>{activeTrips.length}</strong>
        </div>
      </section>

      <main className="grid">
        <section className="card large">
          <div className="sectionHeader">
            <div>
              <h2>Top Priorities</h2>
              <p>Weekly focus items from your Tasks page.</p>
            </div>
            <a href="/tasks">Open Tasks</a>
          </div>

          <div className="priorityList">
            {activePriorities.length > 0 ? (
              activePriorities.map((priority, index) => (
                <div className="priorityItem" key={index}>
                  <span>{index + 1}</span>
                  <p>{priority}</p>
                </div>
              ))
            ) : (
              <div className="empty">No priorities added yet.</div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="sectionHeader">
            <div>
              <h2>Progress</h2>
              <p>Task completion overview.</p>
            </div>
          </div>

          <div className="progressRing">
            <div>
              <strong>{stats.progress}%</strong>
              <span>complete</span>
            </div>
          </div>

          <div className="progressBar">
            <div style={{ width: `${stats.progress}%` }} />
          </div>

          <p className="tiny">
            {stats.completed} of {stats.total} tasks completed.
          </p>
        </section>

        <section className="card large">
          <div className="sectionHeader">
            <div>
              <h2>Open Tasks</h2>
              <p>Most recent active items.</p>
            </div>
            <a href="/tasks">View All</a>
          </div>

          <div className="taskList">
            {openTasks.length > 0 ? (
              openTasks.map((task) => (
                <div className="taskItem" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>
                      From: {task.assignedFrom || "N/A"}
                      {task.dueDate ? ` · Due: ${task.dueDate}` : ""}
                    </p>
                  </div>

                  <span className={`badge ${task.urgency?.toLowerCase() || "medium"}`}>
                    {task.urgency || "Medium"}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty">No open tasks.</div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="sectionHeader">
            <div>
              <h2>Travel</h2>
              <p>Upcoming trip planning.</p>
            </div>
            <a href="/travel">Open Travel</a>
          </div>

          <div className="tripList">
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip) => (
                <div className="tripItem" key={trip.id}>
                  <strong>{trip.name}</strong>
                  <p>{trip.owner} · {trip.date}</p>
                  <span>{trip.status}</span>
                </div>
              ))
            ) : (
              <div className="empty">No trips added yet.</div>
            )}
          </div>
        </section>

        <section className="card quick">
          <h2>Quick Launch</h2>

          <div className="quickGrid">
            <a href="/tasks">Tasks</a>
            <a href="/meetings">Meetings</a>
            <a href="/travel">Travel</a>
            <a href="/communications">Comms</a>
          </div>
        </section>
      </main>

      <style jsx>{`
        .dashboardPage {
          min-height: 100vh;
          background: #f5f6f8;
          color: #111;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 32px;
          max-width: 1380px;
          margin: 0 auto;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .eyebrow {
          margin: 0 0 7px;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6b7280;
        }

        h1 {
          margin: 0;
          font-size: 36px;
          letter-spacing: -0.05em;
        }

        h2 {
          margin: 0;
          font-size: 14px;
          letter-spacing: -0.02em;
        }

        .subtext,
        p {
          margin: 5px 0 0;
          font-size: 12px;
          color: #6b7280;
        }

        .scoreCard,
        .statCard,
        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
        }

        .scoreCard {
          padding: 16px 20px;
          min-width: 160px;
          text-align: right;
        }

        .scoreCard span,
        .statCard span {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .scoreCard strong {
          font-size: 30px;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 16px;
        }

        .statCard {
          padding: 16px;
        }

        .statCard strong {
          font-size: 28px;
          letter-spacing: -0.04em;
        }

        .grid {
          display: grid;
          grid-template-columns: 1.4fr 0.9fr;
          gap: 16px;
        }

        .card {
          padding: 18px;
        }

        .large {
          min-height: 220px;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
        }

        a {
          color: #111;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          background: #f3f4f6;
          padding: 7px 10px;
          border-radius: 999px;
        }

        .priorityList,
        .taskList,
        .tripList {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .priorityItem {
          display: grid;
          grid-template-columns: 26px 1fr;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid #eceef2;
          border-radius: 14px;
          background: #fafafa;
        }

        .priorityItem span {
          width: 22px;
          height: 22px;
          background: #111;
          color: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
        }

        .priorityItem p {
          margin: 0;
          color: #111;
          font-size: 13px;
          font-weight: 650;
        }

        .taskItem,
        .tripItem {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          padding: 11px;
          border: 1px solid #eceef2;
          border-radius: 14px;
          background: #fafafa;
        }

        .taskItem strong,
        .tripItem strong {
          font-size: 13px;
        }

        .tripItem span {
          font-size: 10px;
          font-weight: 700;
          background: #111;
          color: #fff;
          padding: 5px 8px;
          border-radius: 999px;
        }

        .badge {
          font-size: 11px;
          font-weight: 700;
          padding: 6px 9px;
          border-radius: 999px;
        }

        .badge.high {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge.medium {
          background: #fef3c7;
          color: #92400e;
        }

        .badge.low {
          background: #dcfce7;
          color: #166534;
        }

        .progressRing {
          width: 150px;
          height: 150px;
          border-radius: 999px;
          border: 16px solid #111;
          margin: 18px auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progressRing div {
          text-align: center;
        }

        .progressRing strong {
          display: block;
          font-size: 28px;
        }

        .progressRing span {
          font-size: 11px;
          color: #6b7280;
        }

        .progressBar {
          height: 9px;
          background: #f1f1f1;
          border-radius: 999px;
          overflow: hidden;
        }

        .progressBar div {
          height: 100%;
          background: #111;
          border-radius: 999px;
        }

        .tiny {
          text-align: center;
          margin-top: 10px;
        }

        .quickGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 14px;
        }

        .quickGrid a {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 52px;
          border-radius: 16px;
          background: #111;
          color: #fff;
        }

        .empty {
          padding: 18px;
          text-align: center;
          color: #777;
          font-size: 13px;
          border: 1px dashed #d1d5db;
          border-radius: 14px;
          background: #fafafa;
        }

        @media (max-width: 1000px) {
          .hero,
          .sectionHeader {
            flex-direction: column;
          }

          .statsGrid,
          .grid {
            grid-template-columns: 1fr;
          }

          .scoreCard {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}
