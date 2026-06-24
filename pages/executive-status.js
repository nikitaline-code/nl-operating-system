import { useState } from "react";

const projects = [
  {
    name: "July Dealer Event",
    progress: 82,
    status: "On Track",
    phase: "Food Planning",
    milestone: "Costco Order – Jun 25",
    updated: "27 mins ago",
  },
  {
    name: "Seminole Expansion",
    progress: 65,
    status: "Waiting on Alex",
    phase: "Engineering Review",
    milestone: "Drawings & Specs",
    updated: "1 hour ago",
  },
  {
    name: "Website Redesign",
    progress: 44,
    status: "On Track",
    phase: "Design Review",
    milestone: "Content Review",
    updated: "2 hours ago",
  },
];

export default function ExecutiveStatus() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="page">
      <div className="top">
        <div>
          <h1>Good morning, Mark.</h1>
          <p>Here’s where everything stands.</p>
        </div>
        <span>Tuesday, June 23, 2025</span>
      </div>

      <section className="summary">
        <Metric number="5" label="Meetings Today" note="2h 45m total" />
        <Metric number="12" label="Tasks" note="3 due today" />
        <Metric number="4" label="Decisions Needed" note="2 overdue" />
        <Metric number="6" label="Waiting On" note="From 4 people" />
        <div className="track">✓ Everything On Track<br /><small>Updated 11:42 AM</small></div>
      </section>

      <section className="grid">
        <Card title="Today’s Schedule">
          {[
            ["9:00 AM", "Dealer Pricing Meeting", "Conference Room / Teams"],
            ["11:30 AM", "Inventory Review", "Office"],
            ["1:00 PM", "Marketing Budget Review", "Teams"],
            ["3:00 PM", "Team Check-in", "Teams"],
            ["4:00 PM", "Seminole Expansion Update", "Conference Room / Teams"],
          ].map(([time, title, location]) => (
            <div className="schedule" key={title}>
              <strong>{time}</strong>
              <div>
                <b>{title}</b>
                <small>{location}</small>
              </div>
            </div>
          ))}
        </Card>

        <Card title="Active Projects">
          {projects.map((p) => (
            <button className="project" key={p.name} onClick={() => setSelected(p)}>
              <div className="projectHead">
                <b>{p.name}</b>
                <span className={p.status.includes("Waiting") ? "pill wait" : "pill"}>
                  {p.status}
                </span>
              </div>
              <div className="bar">
                <div style={{ width: `${p.progress}%` }} />
              </div>
              <div className="meta">
                <span>{p.milestone}</span>
                <span>{p.updated}</span>
              </div>
            </button>
          ))}
        </Card>

        <Card title="My Task Timeline">
          <Task group="OVERDUE" task="Follow up on dealer numbers" due="2 days overdue" priority="High" />
          <Task group="OVERDUE" task="Review MBJ contract" due="1 day overdue" priority="High" />
          <Task group="TODAY" task="Review updated pricing deck" due="Due today" priority="High" />
          <Task group="TODAY" task="Prepare inventory report" due="Due today" priority="Medium" />
          <Task group="TOMORROW" task="Follow up with Justin on pricing" due="Due tomorrow" priority="High" />
        </Card>

        <Card title="Communication Pipeline" wide>
          <div className="pipeline">
            <Metric number="12" label="Waiting on Dealer" />
            <Metric number="4" label="Waiting on Vendor" />
            <Metric number="3" label="Waiting on Internal" />
            <Metric number="2" label="Ready for Review" />
            <Metric number="5" label="Ready to Send" />
          </div>
        </Card>

        <Card title="Needs Your Decision">
          <Decision title="Approve Pricing Exception – MBJ Ranch" priority="High" />
          <Decision title="Dealer Approval – Seminole Event" priority="Medium" />
          <Decision title="Travel Approval – July 7–9" priority="Low" />
        </Card>

        <Card title="Latest Updates">
          <Update text="Dealer pricing approved" />
          <Update text="Costco quote received" />
          <Update text="Meeting scheduled – July 7–9" />
          <Update text="Inventory report uploaded" />
        </Card>
      </section>

      {selected && (
        <aside className="drawer">
          <button className="close" onClick={() => setSelected(null)}>×</button>

          <h2>{selected.name}</h2>
          <span className={selected.status.includes("Waiting") ? "pill wait" : "pill"}>
            {selected.status}
          </span>

          <div className="tabs">
            <span>Overview</span>
            <span>Tasks</span>
            <span>Files</span>
            <span>Notes</span>
            <span>Activity</span>
          </div>

          <h4>Project Overview</h4>
          <p>
            Live status for what Nikita is managing, what is waiting, what is complete,
            and what needs your attention.
          </p>

          <div className="details">
            <div><small>Current Phase</small><b>{selected.phase}</b></div>
            <div><small>Progress</small><b>{selected.progress}%</b></div>
            <div><small>Updated</small><b>{selected.updated}</b></div>
          </div>

          <h4>Next Milestone</h4>
          <div className="box">{selected.milestone}</div>

          <h4>Status Checklist</h4>
          {["Dealer list confirmed", "Venue booked", "Initial pricing approved", "Costco order", "Final agenda"].map((item, i) => (
            <div className="check" key={item}>
              <span>{i < 3 ? "✓" : "○"} {item}</span>
              <small>{i < 3 ? "Complete" : "Pending"}</small>
            </div>
          ))}

          <button className="primary">Open Project Workspace →</button>
        </aside>
      )}

     <style jsx global>{`
     * {
  box-sizing: border-box;
}

body {
  margin: 0;
}
  .page {
          min-height: 100vh;
          padding: 36px;
          background: #fbf8f1;
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
        }

        h1 {
          margin: 0;
          font-size: 34px;
          font-family: Georgia, serif;
          font-weight: 400;
        }

        p {
          color: #4b5563;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          background: #fffdf8;
          border: 1px solid #e7dfd2;
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 22px;
        }

        .metric {
          padding: 0 18px;
          border-right: 1px solid #e7dfd2;
        }

        .metric:last-child {
          border-right: 0;
        }

        .metric strong {
          display: block;
          font-size: 28px;
        }

        .metric span {
          display: block;
          font-size: 13px;
        }

        .metric small {
          color: #c2410c;
        }

        .track {
          color: #177245;
          font-weight: 700;
          padding-left: 18px;
        }

        .track small {
          color: #6b7280;
          font-weight: 400;
        }

        .grid {
          display: grid;
          grid-template-columns: 1.05fr 1.05fr 1fr;
          gap: 16px;
        }

        .card {
          background: #fffdf8;
          border: 1px solid #e7dfd2;
          border-radius: 16px;
          padding: 20px;
        }

        .wide {
          grid-column: span 2;
        }

        .cardHead {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #eee7dc;
          padding-bottom: 14px;
          margin-bottom: 12px;
        }

        .cardHead span {
          font-size: 13px;
          color: #6b7280;
        }

        .schedule {
          display: grid;
          grid-template-columns: 90px 1fr;
          gap: 16px;
          padding: 15px 0;
          border-bottom: 1px solid #eee7dc;
        }

        .schedule small,
        .meta,
        .details small,
        .check small {
          color: #6b7280;
          font-size: 12px;
        }

        .project {
          width: 100%;
          background: transparent;
          border: 0;
          text-align: left;
          padding: 16px 0;
          border-bottom: 1px solid #eee7dc;
          cursor: pointer;
        }

        .project:hover {
          background: #faf4e9;
        }

        .projectHead,
        .meta,
        .decision,
        .update,
        .check {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pill {
          background: #e7f3eb;
          color: #177245;
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 12px;
        }

        .pill.wait {
          background: #fff1df;
          color: #b45309;
        }

        .bar {
          height: 6px;
          background: #e6e0d6;
          border-radius: 99px;
          margin: 12px 0;
        }

        .bar div {
          height: 100%;
          background: #177245;
          border-radius: 99px;
        }

        .task {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          padding: 13px 0;
          border-bottom: 1px solid #eee7dc;
        }

        .task strong {
          display: block;
          color: #177245;
          font-size: 12px;
        }

        .task.overdue strong {
          color: #b91c1c;
        }

        .task p {
          margin: 3px 0;
          color: #111827;
        }

        .priority {
          font-size: 12px;
          color: #b91c1c;
        }

        .pipeline {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
        }

        .decision,
        .update {
          padding: 14px 0;
          border-bottom: 1px solid #eee7dc;
        }

        .decision small {
          color: #b91c1c;
        }

        .update small {
          color: #177245;
        }

        .drawer {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: 410px;
          background: #fffdf8;
          border-left: 1px solid #e7dfd2;
          padding: 32px;
          box-shadow: -16px 0 40px rgba(0,0,0,.08);
          z-index: 20;
          overflow-y: auto;
        }

        .close {
          float: right;
          border: 0;
          background: transparent;
          font-size: 28px;
          cursor: pointer;
        }

        h2 {
          font-family: Georgia, serif;
          font-size: 28px;
          margin-bottom: 8px;
          font-weight: 400;
        }

        .tabs {
          display: flex;
          gap: 18px;
          margin: 28px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #e7dfd2;
          font-size: 13px;
        }

        .details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 20px 0;
        }

        .details div,
        .box {
          border: 1px solid #e7dfd2;
          border-radius: 12px;
          padding: 14px;
          background: #fbf8f1;
        }

        .check {
          padding: 12px 0;
          border-bottom: 1px solid #eee7dc;
        }

        .primary {
          width: 100%;
          margin-top: 28px;
          padding: 14px;
          background: #111827;
          color: white;
          border: 0;
          border-radius: 12px;
          cursor: pointer;
        }

        @media (max-width: 1000px) {
          .summary,
          .grid,
          .pipeline {
            grid-template-columns: 1fr;
          }

          .wide {
            grid-column: span 1;
          }

          .drawer {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

function Metric({ number, label, note }) {
  return (
    <div className="metric">
      <strong>{number}</strong>
      <span>{label}</span>
      {note && <small>{note}</small>}
    </div>
  );
}

function Card({ title, children, wide }) {
  return (
    <section className={`card ${wide ? "wide" : ""}`}>
      <div className="cardHead">
        <b>{title}</b>
        <span>View all →</span>
      </div>
      {children}
    </section>
  );
}

function Task({ group, task, due, priority }) {
  return (
    <div className={`task ${group === "OVERDUE" ? "overdue" : ""}`}>
      <div>
        <strong>{group}</strong>
        <p>{task}</p>
        <small>{due}</small>
      </div>
      <span className="priority">{priority}</span>
    </div>
  );
}

function Decision({ title, priority }) {
  return (
    <div className="decision">
      <span>{title}</span>
      <small>{priority} →</small>
    </div>
  );
}

function Update({ text }) {
  return (
    <div className="update">
      <span>✓ {text}</span>
      <small>Nikita</small>
    </div>
  );
}
