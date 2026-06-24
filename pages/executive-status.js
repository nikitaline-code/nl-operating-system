import { useEffect, useState } from "react";

const metrics = [
  { number: "14", label: "Active Projects", note: "12 On Track · 2 At Risk" },
  { number: "8", label: "Waiting On", note: "From 5 people" },
  { number: "3", label: "Needs Your Input", note: "Approvals / Decisions" },
  { number: "97%", label: "Operations Health", note: "Everything on track" },
  { number: "✓", label: "Everything On Track", note: "Next milestone: Dealer Event · Friday" },
];

const priorities = [
  { title: "Dealer Pricing Approval", note: "Decision needed" },
  { title: "July Dealer Event Catering", note: "Costco quote pending" },
  { title: "Inventory Review", note: "Reports ready for review" },
];

const projects = [
  {
    name: "July Dealer Event",
    status: "On Track",
    progress: 82,
    phase: "Costco Order – Jun 25",
    waitingOn: "Costco Quote, AV Quote, Dealer Numbers",
    milestone: "Final Catering Order · Jun 25",
    updated: "27 mins ago",
  },
  {
    name: "Seminole Expansion",
    status: "Waiting on Alex",
    progress: 65,
    phase: "Drawings & Specs",
    waitingOn: "Drawings & Specs",
    milestone: "Presentation Draft · Jun 30",
    updated: "1 hour ago",
  },
  {
    name: "Website Redesign",
    status: "On Track",
    progress: 44,
    phase: "Content Review",
    waitingOn: "Content from Marketing",
    milestone: "Design Finalization · Jul 2",
    updated: "2 hours ago",
  },
  {
    name: "MBJ Transfer",
    status: "Behind",
    progress: 28,
    phase: "Pricing Review",
    waitingOn: "Pricing Exception Approval",
    milestone: "Ownership Transfer · Jul 10",
    updated: "Yesterday",
  },
];

const timeline = [
  { label: "Overdue", count: 3 },
  { label: "Today", count: 5 },
  { label: "Tomorrow", count: 4 },
  { label: "This Week", count: 11 },
];

const topTasks = [
  { task: "Review updated pricing deck", priority: "High" },
  { task: "Confirm AV setup for dealer event", priority: "Medium" },
  { task: "Send final agenda to dealer group", priority: "Medium" },
];

const waitingOn = [
  { label: "Waiting on Mark", count: 2 },
  { label: "Waiting on Dane", count: 1 },
  { label: "Waiting on Dealer", count: 8 },
  { label: "Waiting on Vendor", count: 3 },
  { label: "Waiting on Finance", count: 2 },
];

const decisions = [
  { title: "Approve Pricing Exception – MBJ Ranch", priority: "High" },
  { title: "Dealer Approval – Seminole Event", priority: "Medium" },
  { title: "Travel Approval – July 7–9", priority: "Low" },
];

const communications = [
  { number: 12, label: "Waiting on Dealer" },
  { number: 4, label: "Waiting on Vendor" },
  { number: 3, label: "Waiting on Internal" },
  { number: 2, label: "Ready for Review" },
  { number: 5, label: "Ready to Send" },
];

export default function ExecutiveStatus() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const hour = now ? now.getHours() : 9;

  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    "Good evening";

  const currentDateTime = now
    ? now.toLocaleString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  function openProject(project) {
    setSelectedProject(project);
    setActiveTab("overview");
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>{greeting}, Mark.</h1>
          <p>Here’s where everything stands.</p>
        </div>
        <div className="date">{currentDateTime}</div>
      </header>

      <section className="metrics">
        {metrics.map((item) => (
          <div className="metric" key={item.label}>
            <strong>{item.number}</strong>
            <span>{item.label}</span>
            <small>{item.note}</small>
          </div>
        ))}
      </section>

      <section className="layout">
        <Card title="Today’s Priorities" className="priorities">
          {priorities.map((item, index) => (
            <button className="priorityRow" key={item.title}>
              <span className="number">{index + 1}</span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.note}</small>
              </div>
            </button>
          ))}
        </Card>

        <Card title="Active Projects" className="projects wide">
          {projects.map((project) => (
            <button className="projectRow" key={project.name} onClick={() => openProject(project)}>
              <div className="projectMain">
                <div>
                  <strong>{project.name}</strong>
                  <small>{project.phase}</small>
                </div>
                <span className={`pill ${getStatusClass(project.status)}`}>{project.status}</span>
              </div>

              <div className="progressArea">
                <div className="bar">
                  <div style={{ width: `${project.progress}%` }} />
                </div>
                <span>{project.progress}%</span>
              </div>

              <div className="projectDetails">
                <div>
                  <small>Waiting On</small>
                  <b>{project.waitingOn}</b>
                </div>
                <div>
                  <small>Next Milestone</small>
                  <b>{project.milestone}</b>
                </div>
                <div>
                  <small>Updated</small>
                  <b>{project.updated}</b>
                </div>
              </div>
            </button>
          ))}
        </Card>

        <Card title="Task Timeline" className="tasks">
          {timeline.map((item) => (
            <div className="timelineRow" key={item.label}>
              <span>{item.label}</span>
              <strong className={item.label === "Overdue" ? "danger" : ""}>{item.count}</strong>
            </div>
          ))}

          <div className="topTasks">
            <h4>Top 3 Tasks</h4>
            {topTasks.map((item) => (
              <div className="taskLine" key={item.task}>
                <span>○ {item.task}</span>
                <small className={item.priority === "High" ? "danger" : ""}>{item.priority}</small>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Waiting On" className="waiting">
          {waitingOn.map((item) => (
            <button className="simpleRow" key={item.label}>
              <span>{item.label}</span>
              <b>{item.count}</b>
            </button>
          ))}
        </Card>

        <Card title="Needs Your Decision" className="decisions">
          {decisions.map((item) => (
            <button className="decisionRow" key={item.title}>
              <span>{item.title}</span>
              <small className={item.priority === "High" ? "danger" : ""}>{item.priority}</small>
            </button>
          ))}
        </Card>

        <Card title="Communication Pipeline" className="communication">
          <div className="communicationGrid">
            {communications.map((item) => (
              <button className="commItem" key={item.label}>
                <strong>{item.number}</strong>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </section>

      {selectedProject && (
        <aside className="drawer">
          <button className="close" onClick={() => setSelectedProject(null)}>×</button>

          <h2>{selectedProject.name}</h2>
          <span className={`pill ${getStatusClass(selectedProject.status)}`}>{selectedProject.status}</span>

          <div className="tabs">
            {["overview", "tasks", "files", "notes", "activity"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <>
              <h3>Overview</h3>
              <p>Live project status, current blockers, next milestone, and items needing attention.</p>
              <div className="drawerBox"><small>Progress</small><strong>{selectedProject.progress}%</strong></div>
              <div className="drawerBox"><small>Waiting On</small><strong>{selectedProject.waitingOn}</strong></div>
              <div className="drawerBox"><small>Next Milestone</small><strong>{selectedProject.milestone}</strong></div>
            </>
          )}

          {activeTab === "tasks" && (
            <>
              <h3>Tasks</h3>
              <DrawerLine text="Finalize next milestone" note="High" />
              <DrawerLine text="Confirm outstanding items" note="Medium" />
              <DrawerLine text="Send status update" note="Today" />
            </>
          )}

          {activeTab === "files" && (
            <>
              <h3>Files</h3>
              <DrawerLine text="Pricing Sheet.xlsx" note="Open" />
              <DrawerLine text="Dealer Agenda.pdf" note="Open" />
              <DrawerLine text="Project Notes.docx" note="Open" />
            </>
          )}

          {activeTab === "notes" && (
            <>
              <h3>Notes</h3>
              <div className="drawerBox">Waiting on final confirmation before moving to the next step.</div>
              <div className="drawerBox">Mark may need to approve if this is still pending tomorrow.</div>
            </>
          )}

          {activeTab === "activity" && (
            <>
              <h3>Activity</h3>
              <DrawerLine text="Project status updated" note="27 mins ago" />
              <DrawerLine text="New task added" note="1 hour ago" />
              <DrawerLine text="File uploaded" note="Yesterday" />
            </>
          )}

          <button className="primary">Open Project Workspace →</button>
        </aside>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        .page {
          min-height: 100vh;
          background: #fbf8f1;
          color: #111827;
          padding: 28px 34px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 22px;
        }

        h1 {
          font-family: Georgia, serif;
          font-size: 34px;
          font-weight: 400;
          margin: 0 0 6px;
        }

        p {
          margin: 0;
          color: #475569;
          font-size: 14px;
        }

        .date {
          font-size: 13px;
          color: #0f172a;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }

        .metric {
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 12px;
          padding: 22px 24px;
          min-height: 118px;
        }

        .metric strong {
          display: block;
          font-size: 28px;
          line-height: 1;
          margin-bottom: 9px;
        }

        .metric span {
          display: block;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .metric small {
          color: #475569;
          font-size: 13px;
        }

        .layout {
          display: grid;
          grid-template-columns: 0.82fr 1.75fr 0.92fr;
          gap: 14px;
        }

        .card {
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 12px;
          padding: 18px;
          min-height: 0;
        }

        .wide {
          grid-row: span 2;
        }

        .cardHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ebe2d4;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }

        .cardHead b {
          font-size: 15px;
        }

        .cardHead span {
          font-size: 12px;
          color: #64748b;
        }

        button {
          font: inherit;
        }

        .priorityRow,
        .projectRow,
        .simpleRow,
        .decisionRow,
        .commItem {
          border: 0;
          background: transparent;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .priorityRow {
          display: grid;
          grid-template-columns: 36px 1fr;
          gap: 16px;
          align-items: center;
          padding: 18px 0;
          border-bottom: 1px solid #ebe2d4;
        }

        .number {
          width: 32px;
          height: 32px;
          background: #f1ece3;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        small {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-top: 3px;
        }

        .projectRow {
          padding: 18px 0;
          border-bottom: 1px solid #ebe2d4;
        }

        .projectMain,
        .progressArea,
        .projectDetails,
        .timelineRow,
        .simpleRow,
        .decisionRow,
        .taskLine {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .progressArea {
          margin: 12px 0;
        }

        .bar {
          height: 6px;
          background: #e4ded4;
          border-radius: 99px;
          flex: 1;
        }

        .bar div {
          height: 100%;
          background: #111827;
          border-radius: 99px;
        }

        .projectDetails {
          display: grid;
          grid-template-columns: 1fr 1fr 0.7fr;
          border-left: 1px solid #e5dccc;
          padding-left: 16px;
        }

        .pill {
          background: #e7f3eb;
          color: #0f7a4b;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 12px;
          white-space: nowrap;
        }

        .pill.waiting {
          background: #fff1df;
          color: #b45309;
        }

        .pill.behind {
          background: #fbe4df;
          color: #b91c1c;
        }

        .timelineRow,
        .simpleRow,
        .decisionRow {
          padding: 13px 0;
          border-bottom: 1px solid #ebe2d4;
        }

        .timelineRow strong {
          font-size: 20px;
        }

        .danger {
          color: #dc2626 !important;
        }

        .topTasks {
          border: 1px solid #ebe2d4;
          border-radius: 10px;
          margin-top: 14px;
          padding: 14px;
        }

        .topTasks h4 {
          margin: 0 0 10px;
        }

        .taskLine {
          padding: 8px 0;
          font-size: 13px;
        }

        .communication {
          grid-column: span 1;
        }

        .communicationGrid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
        }

        .commItem {
          text-align: center;
          border-right: 1px solid #e5dccc;
          padding: 20px 8px;
        }

        .commItem:last-child {
          border-right: 0;
        }

        .commItem strong {
          font-size: 25px;
          display: block;
          margin-bottom: 8px;
        }

        .commItem span {
          font-size: 13px;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 420px;
          background: #fffdf8;
          border-left: 1px solid #e5dccc;
          padding: 28px;
          box-shadow: -16px 0 40px rgba(0,0,0,.08);
          z-index: 1000;
          overflow-y: auto;
        }

        .close {
          float: right;
          border: 0;
          background: transparent;
          font-size: 26px;
          cursor: pointer;
        }

        h2 {
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          margin: 0 0 10px;
        }

        .tabs {
          display: flex;
          gap: 14px;
          border-bottom: 1px solid #e5dccc;
          margin: 22px 0;
        }

        .tabs button {
          border: 0;
          background: transparent;
          padding: 8px 0;
          text-transform: capitalize;
          cursor: pointer;
          color: #475569;
          font-size: 13px;
        }

        .tabs button.active {
          color: #111827;
          font-weight: 700;
          border-bottom: 2px solid #111827;
        }

        h3 {
          margin: 18px 0 8px;
        }

        .drawerBox,
        .drawerLine {
          border: 1px solid #ebe2d4;
          background: #fbf8f1;
          border-radius: 10px;
          padding: 13px;
          margin-bottom: 10px;
        }

        .drawerLine {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .primary {
          width: 100%;
          background: #111827;
          color: white;
          border: 0;
          border-radius: 10px;
          padding: 14px;
          margin-top: 18px;
          cursor: pointer;
        }

        @media (max-width: 1200px) {
          .metrics,
          .layout {
            grid-template-columns: 1fr;
          }

          .wide,
          .communication {
            grid-column: span 1;
            grid-row: auto;
          }

          .communicationGrid {
            grid-template-columns: 1fr;
          }

          .commItem {
            border-right: 0;
            border-bottom: 1px solid #e5dccc;
          }
        }
      `}</style>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      <div className="cardHead">
        <b>{title}</b>
        <span>View all →</span>
      </div>
      {children}
    </section>
  );
}

function DrawerLine({ text, note }) {
  return (
    <div className="drawerLine">
      <span>{text}</span>
      <small>{note}</small>
    </div>
  );
}

function getStatusClass(status) {
  if (status === "Behind") return "behind";
  if (status.includes("Waiting")) return "waiting";
  return "";
}
