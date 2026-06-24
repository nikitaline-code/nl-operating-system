import { useEffect, useState } from "react";

const metrics = [
  { number: "14", label: "Active Projects", note: "12 On Track  •  2 At Risk" },
  { number: "8", label: "Waiting On", note: "From 5 people" },
  { number: "3", label: "Needs Your Input", note: "Approvals / Decisions" },
  { number: "97%", label: "Operations Health", note: "Everything on track" },
  { number: "✓", label: "Everything On Track", note: "Next milestone: Dealer Event  •  Friday" },
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
  const [now, setNow] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = now ? now.getHours() : 9;

  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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

        <div className="dateBlock">
          <div>{currentDateTime}</div>
          <small>↻ Updated {now ? now.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" }) : ""}</small>
        </div>
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
        <Card title="Today’s Priorities" className="left priorities">
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

        <Card title="Active Projects" className="projects">
          {projects.map((project) => (
            <button className="projectRow" key={project.name} onClick={() => openProject(project)}>
              <div className="projectTop">
                <div>
                  <strong>{project.name}</strong>
                  <small>{project.phase}</small>
                </div>
                <span className={`pill ${getStatusClass(project.status)}`}>{project.status}</span>
              </div>

              <div className="progressLine">
                <div className="bar">
                  <div style={{ width: `${project.progress}%` }} />
                </div>
                <b>{project.progress}%</b>
              </div>

              <div className="projectInfo">
                <div>
                  <small>Waiting On</small>
                  <span>{project.waitingOn}</span>
                </div>
                <div>
                  <small>Next Milestone</small>
                  <span>{project.milestone}</span>
                </div>
                <div>
                  <small>Updated</small>
                  <span>{project.updated}</span>
                </div>
              </div>
            </button>
          ))}
        </Card>

        <Card title="Task Timeline" className="right">
          {timeline.map((item) => (
            <button className="timelineRow" key={item.label}>
              <span>{item.label}</span>
              <b className={item.label === "Overdue" ? "danger" : ""}>{item.count}</b>
            </button>
          ))}
        </Card>

        <Card title="Waiting On" className="left waiting">
          {waitingOn.map((item) => (
            <button className="simpleRow" key={item.label}>
              <span>{item.label}</span>
              <b>{item.count}</b>
            </button>
          ))}
        </Card>

        <Card title="Needs Your Decision" className="right decisions">
          {decisions.map((item) => (
            <button className="decisionRow" key={item.title}>
              <span>{item.title}</span>
              <small className={item.priority === "High" ? "danger" : ""}>{item.priority}</small>
            </button>
          ))}
        </Card>

        <Card title="Communication Pipeline" className="left communication">
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
              <DrawerBox label="Progress" value={`${selectedProject.progress}%`} />
              <DrawerBox label="Waiting On" value={selectedProject.waitingOn} />
              <DrawerBox label="Next Milestone" value={selectedProject.milestone} />
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
          padding: 16px 24px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        h1 {
          font-family: Georgia, serif;
          font-size: 29px;
          font-weight: 400;
          margin: 0 0 4px;
        }

        p {
          margin: 0;
          color: #475569;
          font-size: 13px;
          line-height: 1.35;
        }

        .dateBlock {
          text-align: right;
          font-size: 12px;
          color: #0f172a;
          line-height: 1.4;
        }

        .dateBlock small {
          display: block;
          margin-top: 8px;
          color: #64748b;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-bottom: 10px;
        }

        .metric {
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 10px;
          padding: 14px 18px;
          min-height: 82px;
        }

        .metric strong {
          display: block;
          font-size: 25px;
          line-height: 1;
          margin-bottom: 7px;
          font-weight: 750;
        }

        .metric span {
          display: block;
          font-size: 13px;
          font-weight: 750;
          margin-bottom: 5px;
        }

        .metric small {
          color: #475569;
          font-size: 12px;
          line-height: 1.25;
        }

        .layout {
          display: grid;
          grid-template-columns: 0.72fr 1.7fr 0.78fr;
          grid-template-rows: 1fr auto auto;
          gap: 10px;
          height: calc(100vh - 145px);
        }

        .card {
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 10px;
          padding: 14px;
          min-height: 0;
          overflow: hidden;
        }

        .projects {
          grid-column: 2;
          grid-row: 1 / 4;
        }

        .left {
          grid-column: 1;
        }

        .right {
          grid-column: 3;
        }

        .cardHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ebe2d4;
          padding-bottom: 9px;
          margin-bottom: 8px;
        }

        .cardHead b {
          font-size: 14px;
          font-weight: 750;
        }

        .cardHead span {
          font-size: 11px;
          color: #64748b;
        }

        button {
          font: inherit;
        }

        .priorityRow,
        .projectRow,
        .simpleRow,
        .decisionRow,
        .timelineRow,
        .commItem {
          border: 0;
          background: transparent;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .priorityRow {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #ebe2d4;
        }

        .number {
          width: 28px;
          height: 28px;
          background: #f1ece3;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 750;
          font-size: 13px;
        }

        .priorityRow strong,
        .projectTop strong {
          display: block;
          font-size: 13px;
          line-height: 1.25;
        }

        small {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-top: 3px;
          line-height: 1.25;
        }

        .projectRow {
          padding: 12px 0;
          border-bottom: 1px solid #ebe2d4;
        }

        .projectTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .progressLine {
          display: grid;
          grid-template-columns: 1fr 38px;
          gap: 10px;
          align-items: center;
          margin: 10px 0;
        }

        .progressLine b {
          font-size: 12px;
          text-align: right;
        }

        .bar {
          height: 5px;
          background: #e4ded4;
          border-radius: 99px;
        }

        .bar div {
          height: 100%;
          background: #111827;
          border-radius: 99px;
        }

        .projectInfo {
          display: grid;
          grid-template-columns: 1fr 1fr 0.68fr;
          gap: 12px;
        }

        .projectInfo div {
          border-left: 1px solid #e5dccc;
          padding-left: 10px;
        }

        .projectInfo span {
          display: block;
          font-size: 12px;
          font-weight: 650;
          line-height: 1.25;
        }

        .pill {
          background: #e7f3eb;
          color: #0f7a4b;
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 11px;
          line-height: 1;
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 11px 0;
          border-bottom: 1px solid #ebe2d4;
          font-size: 13px;
        }

        .timelineRow b,
        .simpleRow b {
          font-size: 18px;
        }

        .danger {
          color: #dc2626 !important;
        }

        .decisionRow small {
          font-size: 12px;
        }

        .communication {
          max-height: 150px;
        }

        .communicationGrid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          padding-top: 6px;
        }

        .commItem {
          text-align: center;
          border-right: 1px solid #e5dccc;
          padding: 8px 4px;
        }

        .commItem:last-child {
          border-right: 0;
        }

        .commItem strong {
          font-size: 20px;
          display: block;
          margin-bottom: 4px;
        }

        .commItem span {
          font-size: 11px;
          line-height: 1.2;
          display: block;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 420px;
          background: #fffdf8;
          border-left: 1px solid #e5dccc;
          padding: 24px;
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
          font-size: 27px;
          font-weight: 400;
          margin: 0 0 8px;
        }

        .tabs {
          display: flex;
          gap: 14px;
          border-bottom: 1px solid #e5dccc;
          margin: 20px 0;
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
          font-weight: 750;
          border-bottom: 2px solid #111827;
        }

        h3 {
          margin: 16px 0 8px;
          font-size: 16px;
        }

        .drawerBox,
        .drawerLine {
          border: 1px solid #ebe2d4;
          background: #fbf8f1;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 9px;
        }

        .drawerLine {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 13px;
        }

        .primary {
          width: 100%;
          background: #111827;
          color: white;
          border: 0;
          border-radius: 10px;
          padding: 13px;
          margin-top: 16px;
          cursor: pointer;
        }

        @media (max-width: 1200px) {
          .page {
            overflow: auto;
          }

          .metrics,
          .layout {
            grid-template-columns: 1fr;
            height: auto;
          }

          .projects,
          .left,
          .right {
            grid-column: auto;
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

function DrawerBox({ label, value }) {
  return (
    <div className="drawerBox">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
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
