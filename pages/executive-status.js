import { useEffect, useState } from "react";

const startingPriorities = [
  { title: "Dealer Pricing Approval", note: "Decision needed" },
  { title: "July Event Catering", note: "Costco quote pending" },
  { title: "Inventory Review", note: "Reports ready" },
];

const startingProjects = [
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
];

const startingDecisions = [
  { title: "Pricing Exception – MBJ Ranch", priority: "High" },
  { title: "Dealer Approval – Seminole", priority: "Medium" },
];

const startingWaiting = [
  { label: "Mark", count: 2 },
  { label: "Dealer", count: 8 },
  { label: "Vendor", count: 3 },
];

const startingComms = [
  { number: 12, label: "Dealer" },
  { number: 4, label: "Vendor" },
  { number: 2, label: "Review" },
  { number: 5, label: "Ready" },
];

export default function ExecutiveStatus() {
  const [now, setNow] = useState(null);
  const [drawer, setDrawer] = useState(null);

  const [priorities, setPriorities] = useState(startingPriorities);
  const [projects, setProjects] = useState(startingProjects);
  const [decisions, setDecisions] = useState(startingDecisions);
  const [waiting, setWaiting] = useState(startingWaiting);
  const [comms, setComms] = useState(startingComms);

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
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  function addPriority() {
    const title = prompt("Priority title:");
    if (!title) return;
    const note = prompt("Short note:") || "";
    setPriorities([...priorities, { title, note }]);
  }

  function addProject() {
    const name = prompt("Project name:");
    if (!name) return;
    setProjects([
      ...projects,
      {
        name,
        status: "On Track",
        progress: 0,
        phase: "New project",
        waitingOn: "Not set",
        milestone: "Not set",
        updated: "Just now",
      },
    ]);
  }

  function addDecision() {
    const title = prompt("Decision needed:");
    if (!title) return;
    setDecisions([...decisions, { title, priority: "Medium" }]);
  }

  function addWaiting() {
    const label = prompt("Waiting on who/what:");
    if (!label) return;
    setWaiting([...waiting, { label, count: 1 }]);
  }

  function addCommunication() {
    const label = prompt("Communication category:");
    if (!label) return;
    setComms([...comms, { label, number: 1 }]);
  }

  const metrics = [
    { number: projects.length, label: "Active Projects", note: "Live project count" },
    { number: waiting.reduce((a, b) => a + Number(b.count), 0), label: "Waiting On", note: "Items currently stalled" },
    { number: decisions.length, label: "Needs Your Input", note: "Approvals / Decisions" },
    { number: "97%", label: "Operations Health", note: "Everything on track" },
    { number: "✓", label: "On Track", note: "Dealer Event · Friday" },
  ];

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>{greeting}, Mark.</h1>
          <p>Here’s where everything stands.</p>
        </div>
        <div className="dateBlock">
          <div>{currentDateTime}</div>
          <small>Updated {now ? now.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" }) : ""}</small>
        </div>
      </header>

      <section className="metrics">
        {metrics.map((item) => (
          <button className="metric" key={item.label} onClick={() => setDrawer({ type: "metric", item })}>
            <strong>{item.number}</strong>
            <span>{item.label}</span>
            <small>{item.note}</small>
          </button>
        ))}
      </section>

      <section className="layout">
        <div className="leftStack">
          <Card title="Today’s Priorities" onAdd={addPriority}>
            {priorities.map((item, index) => (
              <button className="priorityRow" key={item.title} onClick={() => setDrawer({ type: "priority", item })}>
                <span className="number">{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.note}</small>
                </div>
              </button>
            ))}
          </Card>

          <Card title="Waiting On" onAdd={addWaiting}>
            {waiting.map((item) => (
              <button className="simpleRow" key={item.label} onClick={() => setDrawer({ type: "waiting", item })}>
                <span>{item.label}</span>
                <b>{item.count}</b>
              </button>
            ))}
          </Card>

          <Card title="Communication Pipeline" onAdd={addCommunication}>
            <div className="communicationGrid">
              {comms.map((item) => (
                <button className="commItem" key={item.label} onClick={() => setDrawer({ type: "communication", item })}>
                  <strong>{item.number}</strong>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Active Projects" className="projects" onAdd={addProject}>
          {projects.map((project) => (
            <button className="projectRow" key={project.name} onClick={() => setDrawer({ type: "project", item: project })}>
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
                  <small>Next</small>
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

        <div className="rightStack">
          <Card title="Task Timeline">
            {[
              ["Overdue", 3],
              ["Today", 5],
              ["Tomorrow", 4],
              ["This Week", 11],
            ].map(([label, count]) => (
              <button className="timelineRow" key={label} onClick={() => setDrawer({ type: "task", item: { label, count } })}>
                <span>{label}</span>
                <b className={label === "Overdue" ? "danger" : ""}>{count}</b>
              </button>
            ))}
          </Card>

          <Card title="Needs Your Decision" onAdd={addDecision}>
            {decisions.map((item) => (
              <button className="decisionRow" key={item.title} onClick={() => setDrawer({ type: "decision", item })}>
                <span>{item.title}</span>
                <small className={item.priority === "High" ? "danger" : ""}>{item.priority}</small>
              </button>
            ))}
          </Card>
        </div>
      </section>

      {drawer && (
        <aside className="drawer">
          <button className="close" onClick={() => setDrawer(null)}>×</button>

          <h2>{getDrawerTitle(drawer)}</h2>
          <p>Details behind this item. This is where approvals, notes, files, tasks, status history, and next actions can live.</p>

          {drawer.type === "project" && (
            <>
              <span className={`pill ${getStatusClass(drawer.item.status)}`}>{drawer.item.status}</span>
              <Tabs />
              <DrawerBox label="Progress" value={`${drawer.item.progress}%`} />
              <DrawerBox label="Waiting On" value={drawer.item.waitingOn} />
              <DrawerBox label="Next Milestone" value={drawer.item.milestone} />
              <DrawerBox label="Last Updated" value={drawer.item.updated} />
            </>
          )}

          {drawer.type !== "project" && (
            <>
              <Tabs />
              <DrawerBox label="Current Status" value={drawer.item.note || drawer.item.priority || drawer.item.label || "Open"} />
              <DrawerBox label="Owner" value="Nikita" />
              <DrawerBox label="Next Action" value="Review and update status" />
            </>
          )}

          <button className="primary">Open Workspace →</button>
        </aside>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        .page {
          min-height: 100vh;
          background: #fbf8f1;
          color: #111827;
          padding: 12px 18px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 11px;
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        h1 {
          font-family: Georgia, serif;
          font-size: 23px;
          font-weight: 400;
          margin: 0 0 2px;
        }

        p {
          margin: 0;
          color: #475569;
          font-size: 11px;
          line-height: 1.3;
        }

        .dateBlock {
          text-align: right;
          font-size: 10px;
          color: #0f172a;
        }

        .dateBlock small {
          display: block;
          color: #64748b;
          margin-top: 4px;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 7px;
          margin-bottom: 8px;
        }

        .metric {
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 8px;
          padding: 9px 12px;
          min-height: 58px;
          text-align: left;
          cursor: pointer;
        }

        .metric strong {
          display: block;
          font-size: 18px;
          line-height: 1;
          margin-bottom: 3px;
        }

        .metric span {
          display: block;
          font-size: 10.5px;
          font-weight: 750;
        }

        .metric small {
          color: #64748b;
          font-size: 9.5px;
        }

        .layout {
          display: grid;
          grid-template-columns: 0.64fr 1.95fr 0.7fr;
          gap: 8px;
          height: calc(100vh - 95px);
          align-items: start;
        }

        .leftStack,
        .rightStack {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card {
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 8px;
          padding: 9px;
          overflow: hidden;
        }

        .projects {
          height: auto;
          align-self: start;
        }

        .cardHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ebe2d4;
          padding-bottom: 6px;
          margin-bottom: 5px;
        }

        .cardHead b {
          font-size: 11.5px;
        }

        .headActions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .cardHead span {
          font-size: 10px;
          color: #64748b;
        }

        .addBtn {
          border: 1px solid #e5dccc;
          background: #fbf8f1;
          border-radius: 999px;
          width: 20px;
          height: 20px;
          cursor: pointer;
          line-height: 1;
        }

        button { font: inherit; }

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
          grid-template-columns: 22px 1fr;
          gap: 8px;
          align-items: center;
          padding: 7px 0;
          border-bottom: 1px solid #ebe2d4;
        }

        .number {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: #f1ece3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 750;
        }

        .priorityRow strong,
        .projectTop strong {
          display: block;
          font-size: 10.5px;
          line-height: 1.2;
        }

        small {
          display: block;
          color: #64748b;
          font-size: 9px;
          margin-top: 2px;
        }

        .projectRow {
          padding: 8px 0;
          border-bottom: 1px solid #ebe2d4;
        }

        .projectTop {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        .progressLine {
          display: grid;
          grid-template-columns: 1fr 28px;
          gap: 7px;
          align-items: center;
          margin: 6px 0;
        }

        .progressLine b {
          font-size: 9.5px;
          text-align: right;
        }

        .bar {
          height: 4px;
          border-radius: 99px;
          background: #e4ded4;
        }

        .bar div {
          height: 100%;
          border-radius: 99px;
          background: #111827;
        }

        .projectInfo {
          display: grid;
          grid-template-columns: 1fr 1fr 0.65fr;
          gap: 7px;
        }

        .projectInfo div {
          border-left: 1px solid #e5dccc;
          padding-left: 7px;
        }

        .projectInfo span {
          display: block;
          font-size: 9.5px;
          font-weight: 650;
          line-height: 1.2;
        }

        .pill {
          background: #e7f3eb;
          color: #0f7a4b;
          border-radius: 999px;
          padding: 3px 7px;
          font-size: 9px;
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
          padding: 7px 0;
          border-bottom: 1px solid #ebe2d4;
          font-size: 10.5px;
        }

        .timelineRow b,
        .simpleRow b {
          font-size: 13px;
        }

        .danger {
          color: #dc2626 !important;
        }

        .decisionRow small {
          font-size: 9.5px;
        }

        .communicationGrid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
        }

        .commItem {
          text-align: center;
          border-right: 1px solid #e5dccc;
          padding: 5px 2px;
        }

        .commItem:last-child {
          border-right: 0;
        }

        .commItem strong {
          display: block;
          font-size: 15px;
        }

        .commItem span {
          display: block;
          font-size: 8.5px;
          line-height: 1.15;
        }

        .drawer {
          position: fixed;
          inset: 0 0 0 auto;
          width: 390px;
          background: #fffdf8;
          border-left: 1px solid #e5dccc;
          padding: 22px;
          box-shadow: -16px 0 40px rgba(0,0,0,.08);
          z-index: 1000;
          overflow-y: auto;
        }

        .close {
          float: right;
          border: 0;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
        }

        h2 {
          font-family: Georgia, serif;
          font-weight: 400;
          font-size: 24px;
          margin: 0 0 8px;
        }

        .tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid #e5dccc;
          margin: 18px 0;
        }

        .tabs span {
          padding-bottom: 7px;
          font-size: 12px;
          color: #475569;
        }

        .tabs span:first-child {
          color: #111827;
          font-weight: 750;
          border-bottom: 2px solid #111827;
        }

        .drawerBox,
        .drawerLine {
          border: 1px solid #ebe2d4;
          background: #fbf8f1;
          border-radius: 9px;
          padding: 10px;
          margin-bottom: 8px;
        }

        .primary {
          width: 100%;
          background: #111827;
          color: white;
          border: 0;
          border-radius: 9px;
          padding: 11px;
          margin-top: 14px;
        }

        @media (max-width: 1200px) {
          .page { overflow: auto; }
          .metrics, .layout { grid-template-columns: 1fr; height: auto; }
        }
      `}</style>
    </div>
  );
}

function Card({ title, children, className = "", onAdd }) {
  return (
    <section className={`card ${className}`}>
      <div className="cardHead">
        <b>{title}</b>
        <div className="headActions">
          {onAdd && <button className="addBtn" onClick={onAdd}>+</button>}
          <span>View all →</span>
        </div>
      </div>
      {children}
    </section>
  );
}

function Tabs() {
  return (
    <div className="tabs">
      <span>Overview</span>
      <span>Tasks</span>
      <span>Files</span>
      <span>Notes</span>
      <span>Activity</span>
    </div>
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

function getDrawerTitle(drawer) {
  if (drawer.type === "project") return drawer.item.name;
  if (drawer.item.title) return drawer.item.title;
  if (drawer.item.label) return drawer.item.label;
  return "Details";
}

function getStatusClass(status) {
  if (status === "Behind") return "behind";
  if (status?.includes("Waiting")) return "waiting";
  return "";
}
