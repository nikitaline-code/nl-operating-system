import { useState } from "react";
import {
  Home, Folder, CheckSquare, Clock, AlertCircle, Calendar,
  Users, Activity, FileText, Settings, MessageCircle, X
} from "lucide-react";

const projects = [
  {
    name: "July Dealer Event",
    progress: 82,
    status: "On Track",
    phase: "Food Planning",
    milestone: "Costco Order – Jun 25",
    updated: "27 minutes ago",
  },
  {
    name: "Seminole Expansion",
    progress: 65,
    status: "Waiting on Alex",
    phase: "Engineering Review",
    milestone: "Drawings & Specifications",
    updated: "1 hour ago",
  },
  {
    name: "Website Redesign",
    progress: 44,
    status: "On Track",
    phase: "Design Phase",
    milestone: "Design Review",
    updated: "2 hours ago",
  },
];

const timeline = [
  { group: "OVERDUE", task: "Follow up on dealer numbers", due: "2 days overdue", priority: "High" },
  { group: "OVERDUE", task: "Review MBJ contract", due: "1 day overdue", priority: "High" },
  { group: "TODAY", task: "Review updated pricing deck", due: "Due today", priority: "High" },
  { group: "TOMORROW", task: "Follow up with Justin on pricing", due: "Due tomorrow", priority: "High" },
];

export default function ExecutiveStatus() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">EA</div>
          <div>EXECUTIVE<br />OPERATIONS</div>
        </div>

        {[
          ["Overview", Home],
          ["Projects", Folder],
          ["Follow Ups", CheckSquare],
          ["Waiting On", Clock],
          ["Decisions", AlertCircle],
          ["Calendar", Calendar],
          ["Meetings", Users],
          ["Tasks", CheckSquare],
          ["Activity", Activity],
          ["Files", FileText],
        ].map(([label, Icon], i) => (
          <div className={`nav ${i === 0 ? "active" : ""}`} key={label}>
            <Icon size={18} /> {label}
          </div>
        ))}

        <div className="bottom">
          <div className="nav"><Settings size={18} /> Settings</div>
          <div className="help"><MessageCircle size={18} /> Message Nikita →</div>
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>Good morning, Mark.</h1>
            <p>Here’s where everything stands.</p>
          </div>
          <div className="date">Tuesday, June 23, 2025</div>
        </header>

        <section className="topbar">
          <Metric number="5" label="Meetings Today" note="2h 45m total" />
          <Metric number="12" label="Tasks" note="3 due today" />
          <Metric number="4" label="Decisions Needed" note="2 overdue" />
          <Metric number="6" label="Waiting On" note="From 4 people" />
          <div className="health">✓ Everything On Track<br /><span>Updated 11:42 AM</span></div>
        </section>

        <section className="grid">
          <Card title="Today’s Schedule">
            {["Dealer Pricing Meeting", "Inventory Review", "Marketing Budget Review", "Team Check-in", "Seminole Expansion Update"].map((m, i) => (
              <div className="row" key={m}>
                <strong>{["9:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "4:00 PM"][i]}</strong>
                <span>{m}<small>Conference Room / Teams</small></span>
              </div>
            ))}
          </Card>

          <Card title="Active Projects">
            {projects.map((p) => (
              <button className="project" key={p.name} onClick={() => setSelectedProject(p)}>
                <div className="projectTop">
                  <strong>{p.name}</strong>
                  <span className={p.status.includes("Waiting") ? "pill wait" : "pill"}>{p.status}</span>
                </div>
                <div className="bar"><div style={{ width: `${p.progress}%` }} /></div>
                <div className="projectMeta">
                  <span>{p.milestone}</span>
                  <span>{p.updated}</span>
                </div>
              </button>
            ))}
          </Card>

          <Card title="My Task Timeline">
            {timeline.map((t, i) => (
              <div className={`task ${t.group.toLowerCase()}`} key={i}>
                <span className="dot" />
                <div>
                  <strong>{t.group}</strong>
                  <p>{t.task}</p>
                </div>
                <small>{t.due}</small>
              </div>
            ))}
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
            {["Approve Pricing Exception – MBJ Ranch", "Dealer Approval – Seminole Event", "Travel Approval – July 7–9"].map((d) => (
              <div className="decision" key={d}>{d}<span>→</span></div>
            ))}
          </Card>

          <Card title="Latest Updates">
            {["Dealer pricing approved", "Costco quote received", "Meeting scheduled", "Inventory report uploaded"].map((u) => (
              <div className="update" key={u}>✓ {u}<span>Nikita</span></div>
            ))}
          </Card>
        </section>
      </main>

      {selectedProject && (
        <aside className="drawer">
          <button className="close" onClick={() => setSelectedProject(null)}><X size={20} /></button>
          <h2>{selectedProject.name}</h2>
          <span className="pill">{selectedProject.status}</span>

          <nav className="tabs">
            <span>Overview</span>
            <span>Tasks</span>
            <span>Files</span>
            <span>Notes</span>
            <span>Activity</span>
          </nav>

          <h4>Project Overview</h4>
          <p>Planning and execution including vendor coordination, pricing, logistics and agenda.</p>

          <div className="drawerGrid">
            <div><small>Current Phase</small><strong>{selectedProject.phase}</strong></div>
            <div><small>Progress</small><strong>{selectedProject.progress}%</strong></div>
            <div><small>Last Updated</small><strong>{selectedProject.updated}</strong></div>
          </div>

          <h4>Next Milestone</h4>
          <div className="milestone">{selectedProject.milestone}</div>

          <h4>Project Status</h4>
          {["Dealer list confirmed", "Venue booked", "Initial pricing approved", "Costco order", "Final agenda"].map((s, i) => (
            <div className="statusLine" key={s}>
              {i < 3 ? "✓" : "○"} {s}
              <span>{i < 3 ? "Complete" : "Not started"}</span>
            </div>
          ))}

          <button className="primary">Open Project Workspace →</button>
        </aside>
      )}

      <style jsx>{`
        .page {
          display: flex;
          min-height: 100vh;
          background: #fbf8f1;
          color: #111;
          font-family: Inter, Arial, sans-serif;
        }

        .sidebar {
          width: 230px;
          padding: 24px;
          border-right: 1px solid #e7e1d6;
          background: #f7f2e9;
        }

        .brand {
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 12px;
          letter-spacing: .08em;
          margin-bottom: 34px;
        }

        .logo {
          border: 1px solid #111;
          border-radius: 8px;
          padding: 10px;
          font-size: 20px;
        }

        .nav {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .nav.active {
          background: #eee7dc;
          border-left: 3px solid #111;
        }

        .bottom {
          position: absolute;
          bottom: 24px;
          width: 180px;
        }

        .help {
          display: flex;
          gap: 10px;
          background: #efe8dd;
          padding: 14px;
          border-radius: 12px;
          font-size: 13px;
          margin-top: 20px;
        }

        .main {
          flex: 1;
          padding: 36px 40px;
        }

        header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        h1 {
          font-family: Georgia, serif;
          font-size: 34px;
          margin: 0;
          font-weight: 400;
        }

        p {
          color: #333;
        }

        .topbar {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border: 1px solid #e5ded3;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
          background: #fffdf8;
        }

        .metric {
          border-right: 1px solid #e5ded3;
          padding: 0 20px;
        }

        .metric:last-child {
          border-right: 0;
        }

        .metric strong {
          font-size: 30px;
        }

        .metric span {
          display: block;
          font-size: 14px;
        }

        .metric small {
          color: #c64d2f;
        }

        .health {
          color: #177245;
          font-weight: 600;
          padding-left: 20px;
        }

        .health span {
          color: #777;
          font-weight: 400;
        }

        .grid {
          display: grid;
          grid-template-columns: 1.1fr 1.1fr 1fr;
          gap: 16px;
        }

        .card {
          background: #fffdf8;
          border: 1px solid #e5ded3;
          border-radius: 14px;
          padding: 20px;
        }

        .wide {
          grid-column: span 2;
        }

        .cardHead {
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .row, .decision, .update {
          display: flex;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid #eee7dc;
        }

        .row span {
          flex: 1;
          margin-left: 24px;
        }

        small {
          display: block;
          color: #777;
        }

        .project {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 0;
          border-bottom: 1px solid #eee7dc;
          padding: 16px 0;
          cursor: pointer;
        }

        .projectTop, .projectMeta {
          display: flex;
          justify-content: space-between;
        }

        .bar {
          height: 6px;
          background: #e6e0d6;
          border-radius: 20px;
          margin: 12px 0;
        }

        .bar div {
          height: 100%;
          background: #177245;
          border-radius: 20px;
        }

        .pill {
          background: #e7f3eb;
          color: #177245;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 12px;
        }

        .pill.wait {
          background: #fff0dc;
          color: #c46b00;
        }

        .task {
          display: grid;
          grid-template-columns: 16px 1fr auto;
          gap: 10px;
          padding: 12px 0;
          border-bottom: 1px solid #eee7dc;
        }

        .task strong {
          font-size: 12px;
          color: #177245;
        }

        .task.overdue strong {
          color: #c83232;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #177245;
          border-radius: 50%;
          margin-top: 6px;
        }

        .overdue .dot {
          background: #c83232;
        }

        .pipeline {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
        }

        .drawer {
          width: 390px;
          background: #fffdf8;
          border-left: 1px solid #e5ded3;
          padding: 32px;
          box-shadow: -10px 0 30px rgba(0,0,0,.06);
        }

        .close {
          float: right;
          background: transparent;
          border: 0;
          cursor: pointer;
        }

        .tabs {
          display: flex;
          gap: 18px;
          border-bottom: 1px solid #e5ded3;
          margin: 24px 0;
          padding-bottom: 10px;
          font-size: 13px;
        }

        .drawerGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 20px 0;
        }

        .drawerGrid div {
          border-right: 1px solid #e5ded3;
        }

        .milestone {
          border: 1px solid #e5ded3;
          padding: 14px;
          border-radius: 10px;
        }

        .statusLine {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #eee7dc;
        }

        .primary {
          width: 100%;
          margin-top: 28px;
          background: #111;
          color: white;
          border: 0;
          padding: 14px;
          border-radius: 10px;
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
        <strong>{title}</strong>
        <span>View all →</span>
      </div>
      {children}
    </section>
  );
}
