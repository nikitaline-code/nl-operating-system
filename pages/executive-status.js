import { useState } from "react";

const projects = [
  { name: "July Dealer Event", progress: 82, status: "On Track", milestone: "Costco Order – Jun 25", updated: "27 mins ago" },
  { name: "Seminole Expansion", progress: 65, status: "Waiting on Alex", milestone: "Drawings & Specs", updated: "1 hour ago" },
  { name: "Website Redesign", progress: 44, status: "On Track", milestone: "Content Review", updated: "2 hours ago" },
];

export default function ExecutiveStatus() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="page">
      <header>
        <div>
          <h1>Good morning, Mark.</h1>
          <p>Here’s where everything stands.</p>
        </div>
        <div className="date">Tuesday, June 23, 2025 · 11:42 AM</div>
      </header>

      <section className="metrics">
        <Metric number="5" label="Meetings Today" note="2h 45m total" />
        <Metric number="12" label="Tasks" note="3 due today" />
        <Metric number="4" label="Decisions Needed" note="2 overdue" />
        <Metric number="6" label="Waiting On" note="From 4 people" />
        <div className="greenStatus">✓ Everything On Track<br /><span>Updated 11:42 AM</span></div>
      </section>

      <section className="grid">
        <Card title="Today’s Schedule">
          <Schedule time="9:00 AM" title="Dealer Pricing Meeting" place="Conference Room / Teams" />
          <Schedule time="11:30 AM" title="Inventory Review" place="Office" />
          <Schedule time="1:00 PM" title="Marketing Budget Review" place="Teams" />
          <Schedule time="3:00 PM" title="Team Check-in" place="Teams" />
          <Schedule time="4:00 PM" title="Seminole Expansion Update" place="Conference Room / Teams" />
        </Card>

        <Card title="Active Projects">
          {projects.map((p) => (
            <button className="project" onClick={() => setSelected(p)} key={p.name}>
              <div className="projectTop">
                <strong>{p.name}</strong>
                <span className={p.status.includes("Waiting") ? "pill amber" : "pill"}>{p.status}</span>
              </div>
              <div className="bar"><div style={{ width: `${p.progress}%` }} /></div>
              <div className="projectBottom">
                <span>{p.milestone}</span>
                <span>{p.updated}</span>
              </div>
            </button>
          ))}
        </Card>

        <Card title="My Task Timeline">
          <Task label="OVERDUE" title="Follow up on dealer numbers" due="2 days overdue" priority="High" red />
          <Task label="OVERDUE" title="Review MBJ contract" due="1 day overdue" priority="High" red />
          <Task label="TODAY" title="Review updated pricing deck" due="Due today" priority="High" />
          <Task label="TODAY" title="Prepare inventory report" due="Due today" priority="Medium" />
          <Task label="TOMORROW" title="Follow up with Justin on pricing" due="Due tomorrow" priority="High" />
        </Card>

        <Card title="Communication Pipeline" wide compact>
          <div className="pipeline">
            <Metric number="12" label="Waiting on Dealer" />
            <Metric number="4" label="Waiting on Vendor" />
            <Metric number="3" label="Waiting on Internal" />
            <Metric number="2" label="Ready for Review" />
            <Metric number="5" label="Ready to Send" />
          </div>
        </Card>

        <Card title="Needs Your Decision" compact>
          <Decision title="Approve Pricing Exception – MBJ Ranch" priority="High" />
          <Decision title="Dealer Approval – Seminole Event" priority="Medium" />
          <Decision title="Travel Approval – July 7–9" priority="Low" />
        </Card>

        <Card title="Latest Updates" full compact>
          <div className="updates">
            <Update text="Dealer pricing approved" />
            <Update text="Costco quote received" />
            <Update text="Meeting scheduled – July 7–9" />
            <Update text="Inventory report uploaded" />
            <Update text="Seminole drawings updated" />
          </div>
        </Card>
      </section>

      {selected && (
        <aside className="drawer">
          <button onClick={() => setSelected(null)} className="close">×</button>
          <h2>{selected.name}</h2>
          <span className={selected.status.includes("Waiting") ? "pill amber" : "pill"}>{selected.status}</span>

          <div className="tabs">
            <span>Overview</span>
            <span>Tasks</span>
            <span>Files</span>
            <span>Notes</span>
            <span>Activity</span>
          </div>

          <h4>Project Overview</h4>
          <p>Live status for what Nikita is managing, what is waiting, and what needs your attention.</p>

          <div className="detailGrid">
            <div><small>Progress</small><strong>{selected.progress}%</strong></div>
            <div><small>Milestone</small><strong>{selected.milestone}</strong></div>
            <div><small>Updated</small><strong>{selected.updated}</strong></div>
          </div>

          <h4>Status Checklist</h4>
          {["Dealer list confirmed", "Initial pricing approved", "Costco order", "Final agenda"].map((x, i) => (
            <div className="check" key={x}>
              <span>{i < 2 ? "✓" : "○"} {x}</span>
              <small>{i < 2 ? "Complete" : "Pending"}</small>
            </div>
          ))}

          <button className="primary">Open Project Workspace →</button>
        </aside>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        .page {
          min-height: 100vh;
          background: #fbf8f1;
          color: #101827;
          padding: 26px 34px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        h1 {
          font-family: Georgia, serif;
          font-size: 31px;
          font-weight: 400;
          margin: 0 0 8px;
        }

        p {
          margin: 0;
          color: #334155;
          font-size: 14px;
        }

        .date {
          font-size: 13px;
          color: #0f172a;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 16px;
        }

        .metric {
          padding: 0 18px;
          border-right: 1px solid #e5dccc;
          min-height: 48px;
        }

        .metric:last-child {
          border-right: 0;
        }

        .metric strong {
          display: block;
          font-size: 25px;
          line-height: 1;
          margin-bottom: 5px;
        }

        .metric span {
          display: block;
          font-size: 13px;
          line-height: 1.2;
        }

        .metric small {
          display: block;
          color: #c2410c;
          font-size: 12px;
          margin-top: 3px;
        }

        .greenStatus {
          color: #047857;
          font-weight: 700;
          font-size: 14px;
          padding-left: 18px;
        }

        .greenStatus span {
          font-weight: 400;
          color: #64748b;
          font-size: 12px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
        }

        .card {
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 14px;
          padding: 16px;
          min-height: 0;
        }

        .card.compact {
          padding: 14px 16px;
        }

        .wide {
          grid-column: span 2;
        }

        .full {
          grid-column: span 3;
        }

        .cardHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          margin-bottom: 6px;
          border-bottom: 1px solid #ebe2d4;
          font-size: 14px;
        }

        .cardHead a {
          font-size: 12px;
          color: #64748b;
        }

        .schedule {
          display: grid;
          grid-template-columns: 78px 1fr;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid #ebe2d4;
          font-size: 14px;
          align-items: center;
        }

        .schedule small {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .project {
          width: 100%;
          border: 0;
          background: transparent;
          text-align: left;
          padding: 12px 0;
          border-bottom: 1px solid #ebe2d4;
          cursor: pointer;
        }

        .projectTop,
        .projectBottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .projectBottom {
          font-size: 12px;
          color: #64748b;
        }

        .bar {
          height: 6px;
          background: #e4ded4;
          border-radius: 99px;
          margin: 10px 0 7px;
        }

        .bar div {
          height: 100%;
          background: #047857;
          border-radius: 99px;
        }

        .pill {
          padding: 4px 9px;
          border-radius: 999px;
          background: #e7f3eb;
          color: #047857;
          font-size: 11px;
          white-space: nowrap;
        }

        .pill.amber {
          background: #fff2dc;
          color: #b45309;
        }

        .task {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          padding: 9px 0;
          border-bottom: 1px solid #ebe2d4;
        }

        .task strong {
          color: #047857;
          font-size: 11px;
          display: block;
          margin-bottom: 3px;
        }

        .task.red strong {
          color: #dc2626;
        }

        .task p {
          font-size: 14px;
          color: #111827;
        }

        .task small {
          color: #64748b;
          font-size: 12px;
        }

        .priority {
          font-size: 12px;
          color: #dc2626;
          align-self: center;
        }

        .pipeline {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          padding-top: 10px;
        }

        .pipeline .metric {
          min-height: 42px;
        }

        .decision {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #ebe2d4;
          font-size: 14px;
        }

        .decision small {
          color: #dc2626;
        }

        .updates {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        .update {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          font-size: 13px;
        }

        .updateIcon {
          color: #047857;
          font-weight: 700;
        }

        .update small {
          display: block;
          color: #64748b;
          margin-top: 2px;
        }

        .drawer {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: 400px;
          background: #fffdf8;
          border-left: 1px solid #e5dccc;
          padding: 28px;
          box-shadow: -16px 0 40px rgba(0,0,0,.08);
          overflow-y: auto;
          z-index: 1000;
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
          font-weight: 400;
          margin: 0 0 8px;
          font-size: 27px;
        }

        .tabs {
          display: flex;
          gap: 16px;
          border-bottom: 1px solid #e5dccc;
          padding-bottom: 10px;
          margin: 22px 0;
          font-size: 13px;
        }

        h4 {
          margin: 20px 0 8px;
        }

        .detailGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin-top: 14px;
        }

        .detailGrid div,
        .check {
          border: 1px solid #ebe2d4;
          background: #fbf8f1;
          border-radius: 10px;
          padding: 11px;
        }

        .detailGrid small,
        .check small {
          display: block;
          color: #64748b;
          font-size: 12px;
        }

        .check {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .primary {
          margin-top: 20px;
          width: 100%;
          padding: 13px;
          background: #111827;
          color: white;
          border: 0;
          border-radius: 10px;
        }

        @media (max-width: 1200px) {
          .grid,
          .metrics,
          .updates,
          .pipeline {
            grid-template-columns: 1fr;
          }

          .wide,
          .full {
            grid-column: span 1;
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

function Card({ title, children, wide, compact, full }) {
  return (
    <section className={`card ${wide ? "wide" : ""} ${compact ? "compact" : ""} ${full ? "full" : ""}`}>
      <div className="cardHead">
        <b>{title}</b>
        <a>View all →</a>
      </div>
      {children}
    </section>
  );
}

function Schedule({ time, title, place }) {
  return (
    <div className="schedule">
      <strong>{time}</strong>
      <div>
        <b>{title}</b>
        <small>{place}</small>
      </div>
    </div>
  );
}

function Task({ label, title, due, priority, red }) {
  return (
    <div className={`task ${red ? "red" : ""}`}>
      <div>
        <strong>{label}</strong>
        <p>{title}</p>
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
      <span className="updateIcon">✓</span>
      <div>
        <b>{text}</b>
        <small>Nikita · 1h ago</small>
      </div>
    </div>
  );
}
