import { useEffect, useMemo, useState } from "react";

const STARTING_PRIORITIES = [
  { id: "p1", title: "Dealer Pricing Approval", note: "Decision needed", owner: "Nikita", status: "Open" },
  { id: "p2", title: "July Event Catering", note: "Costco quote pending", owner: "Nikita", status: "Open" },
  { id: "p3", title: "Inventory Review", note: "Reports ready", owner: "Nikita", status: "Open" },
];

const STARTING_PROJECTS = [
  {
    id: "proj1",
    name: "July Dealer Event",
    status: "On Track",
    progress: 82,
    phase: "Costco Order – Jun 25",
    waitingOn: "Costco Quote, AV Quote, Dealer Numbers",
    milestone: "Final Catering Order · Jun 25",
    updated: "27 mins ago",
    tasks: ["Confirm dealer numbers", "Finalize catering order", "Send final agenda"],
    files: ["Dealer Agenda.pdf", "Catering Quote.pdf"],
    notes: ["Costco quote expected today.", "AV confirmation still pending."],
    activity: ["Status updated 27 mins ago", "Task added from meeting"],
  },
  {
    id: "proj2",
    name: "Seminole Expansion",
    status: "Waiting on Alex",
    progress: 65,
    phase: "Drawings & Specs",
    waitingOn: "Drawings & Specs",
    milestone: "Presentation Draft · Jun 30",
    updated: "1 hour ago",
    tasks: ["Review drawings", "Prepare internal summary"],
    files: ["Arena Notes.pdf"],
    notes: ["Waiting on drawings before next review."],
    activity: ["Follow-up logged", "Meeting created"],
  },
  {
    id: "proj3",
    name: "Website Redesign",
    status: "On Track",
    progress: 44,
    phase: "Content Review",
    waitingOn: "Content from Marketing",
    milestone: "Design Finalization · Jul 2",
    updated: "2 hours ago",
    tasks: ["Review dashboard layout", "Update task view"],
    files: ["Dashboard Mockup.png"],
    notes: ["Keep styling clean and not too colourful."],
    activity: ["Mockup updated"],
  },
];

const STARTING_TIMELINE = [
  { id: "t1", label: "Overdue", count: 3 },
  { id: "t2", label: "Today", count: 5 },
  { id: "t3", label: "Tomorrow", count: 4 },
  { id: "t4", label: "This Week", count: 11 },
];

const STARTING_WAITING = [
  { id: "w1", label: "Mark", count: 2, details: "Pricing approval, dealer event final agenda" },
  { id: "w2", label: "Dealer", count: 8, details: "Dealer numbers, paperwork, signatures" },
  { id: "w3", label: "Vendor", count: 3, details: "Costco, AV quote, rentals" },
];

const STARTING_DECISIONS = [
  { id: "d1", title: "Pricing Exception – MBJ Ranch", priority: "High", status: "Pending" },
  { id: "d2", title: "Dealer Approval – Seminole", priority: "Medium", status: "Pending" },
];

const STARTING_COMMS = [
  { id: "c1", number: 12, label: "Dealer", details: "Waiting for dealer replies" },
  { id: "c2", number: 4, label: "Vendor", details: "Waiting for vendor quotes" },
  { id: "c3", number: 2, label: "Review", details: "Ready for Mark review" },
  { id: "c4", number: 5, label: "Ready", details: "Ready to send" },
];

export default function ExecutiveStatus() {
  const [now, setNow] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [drawerTab, setDrawerTab] = useState("overview");

  const [priorities, setPriorities] = useState(STARTING_PRIORITIES);
  const [projects, setProjects] = useState(STARTING_PROJECTS);
  const [timeline, setTimeline] = useState(STARTING_TIMELINE);
  const [waiting, setWaiting] = useState(STARTING_WAITING);
  const [decisions, setDecisions] = useState(STARTING_DECISIONS);
  const [communications, setCommunications] = useState(STARTING_COMMS);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = now ? now.getHours() : 9;
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, [now]);

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

  const lastUpdated = now
    ? now.toLocaleTimeString("en-CA", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const metrics = [
    {
      number: projects.length,
      label: "Active Projects",
      note: `${projects.filter((p) => p.status === "On Track").length} on track`,
      type: "metric",
    },
    {
      number: waiting.reduce((sum, item) => sum + Number(item.count || 0), 0),
      label: "Waiting On",
      note: "Items currently stalled",
      type: "metric",
    },
    {
      number: decisions.length,
      label: "Needs Your Input",
      note: "Approvals / Decisions",
      type: "metric",
    },
    {
      number: "97%",
      label: "Operations Health",
      note: "Everything on track",
      type: "metric",
    },
    {
      number: "✓",
      label: "On Track",
      note: "Dealer Event · Friday",
      type: "metric",
    },
  ];

  function openDrawer(type, item) {
    setDrawer({ type, item });
    setDrawerTab("overview");
  }

  function addPriority() {
    const title = prompt("Priority title:");
    if (!title) return;
    const note = prompt("Short note:") || "";
    setPriorities((prev) => [
      ...prev,
      { id: `p${Date.now()}`, title, note, owner: "Nikita", status: "Open" },
    ]);
  }

  function addProject() {
    const name = prompt("Project name:");
    if (!name) return;
    setProjects((prev) => [
      ...prev,
      {
        id: `proj${Date.now()}`,
        name,
        status: "On Track",
        progress: 0,
        phase: "New project",
        waitingOn: "Not set",
        milestone: "Not set",
        updated: "Just now",
        tasks: [],
        files: [],
        notes: [],
        activity: ["Project created"],
      },
    ]);
  }

  function addDecision() {
    const title = prompt("Decision needed:");
    if (!title) return;
    setDecisions((prev) => [
      ...prev,
      { id: `d${Date.now()}`, title, priority: "Medium", status: "Pending" },
    ]);
  }

  function addWaiting() {
    const label = prompt("Waiting on who/what:");
    if (!label) return;
    const count = Number(prompt("Count:") || 1);
    setWaiting((prev) => [
      ...prev,
      { id: `w${Date.now()}`, label, count, details: "New waiting item" },
    ]);
  }

  function addCommunication() {
    const label = prompt("Communication category:");
    if (!label) return;
    const number = Number(prompt("Count:") || 1);
    setCommunications((prev) => [
      ...prev,
      { id: `c${Date.now()}`, label, number, details: "New communication category" },
    ]);
  }

  function approveDecision(decisionId) {
    const decision = decisions.find((d) => d.id === decisionId);
    setDecisions((prev) =>
      prev.map((d) => (d.id === decisionId ? { ...d, status: "Approved" } : d))
    );
    setPriorities((prev) => [
      ...prev,
      {
        id: `p${Date.now()}`,
        title: `Action approved: ${decision?.title || "Decision"}`,
        note: "Created from Mark approval",
        owner: "Nikita",
        status: "Open",
      },
    ]);
  }

  return (
    <div className="opsPage">
      <header className="header">
        <div>
          <h1>{greeting}, Mark.</h1>
          <p>Here’s where everything stands.</p>
        </div>
        <div className="dateBlock">
          <div>{currentDateTime}</div>
          <small>Updated {lastUpdated}</small>
        </div>
      </header>

      <section className="metrics">
        {metrics.map((metric) => (
          <button
            className="metric"
            key={metric.label}
            onClick={() => openDrawer("metric", metric)}
          >
            <strong>{metric.number}</strong>
            <span>{metric.label}</span>
            <small>{metric.note}</small>
          </button>
        ))}
      </section>

      <section className="layout">
        <div className="leftStack">
          <Panel title="Today’s Priorities" onAdd={addPriority}>
            {priorities.map((priority, index) => (
              <button
                className="priorityRow"
                key={priority.id}
                onClick={() => openDrawer("priority", priority)}
              >
                <span className="number">{index + 1}</span>
                <div>
                  <strong>{priority.title}</strong>
                  <small>{priority.note}</small>
                </div>
              </button>
            ))}
          </Panel>

          <Panel title="Waiting On" onAdd={addWaiting}>
            {waiting.map((item) => (
              <button
                className="simpleRow"
                key={item.id}
                onClick={() => openDrawer("waiting", item)}
              >
                <span>{item.label}</span>
                <b>{item.count}</b>
              </button>
            ))}
          </Panel>

          <Panel title="Communication Pipeline" onAdd={addCommunication}>
            <div className="communicationGrid">
              {communications.map((item) => (
                <button
                  className="commItem"
                  key={item.id}
                  onClick={() => openDrawer("communication", item)}
                >
                  <strong>{item.number}</strong>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Active Projects" className="projects" onAdd={addProject}>
          {projects.map((project) => (
            <button
              className="projectRow"
              key={project.id}
              onClick={() => openDrawer("project", project)}
            >
              <div className="projectTop">
                <div>
                  <strong>{project.name}</strong>
                  <small>{project.phase}</small>
                </div>
                <span className={`pill ${getStatusClass(project.status)}`}>
                  {project.status}
                </span>
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
        </Panel>

        <div className="rightStack">
          <Panel title="Task Timeline">
            {timeline.map((item) => (
              <button
                className="timelineRow"
                key={item.id}
                onClick={() => openDrawer("timeline", item)}
              >
                <span>{item.label}</span>
                <b className={item.label === "Overdue" ? "danger" : ""}>
                  {item.count}
                </b>
              </button>
            ))}
          </Panel>

          <Panel title="Needs Your Decision" onAdd={addDecision}>
            {decisions.map((decision) => (
              <div className="decisionWrap" key={decision.id}>
                <button
                  className="decisionRow"
                  onClick={() => openDrawer("decision", decision)}
                >
                  <span>{decision.title}</span>
                  <small className={decision.priority === "High" ? "danger" : ""}>
                    {decision.status === "Approved" ? "Approved" : decision.priority}
                  </small>
                </button>
                {decision.status !== "Approved" && (
                  <button
                    className="approveBtn"
                    onClick={() => approveDecision(decision.id)}
                    title="Approve and create task for Nikita"
                  >
                    ✓
                  </button>
                )}
              </div>
            ))}
          </Panel>
        </div>
      </section>

      {drawer && (
        <aside className="drawer">
          <button className="close" onClick={() => setDrawer(null)}>
            ×
          </button>

          <h2>{getDrawerTitle(drawer)}</h2>
          <p>
            Details behind this item. This is where status, next actions, notes,
            files, approvals, and activity can live.
          </p>

          {drawer.type === "project" && (
            <span className={`pill drawerPill ${getStatusClass(drawer.item.status)}`}>
              {drawer.item.status}
            </span>
          )}

          <div className="tabs">
            {["overview", "tasks", "files", "notes", "activity"].map((tab) => (
              <button
                key={tab}
                className={drawerTab === tab ? "active" : ""}
                onClick={() => setDrawerTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {drawerTab === "overview" && (
            <>
              <DrawerBox label="Status" value={getItemStatus(drawer)} />
              <DrawerBox label="Owner" value="Nikita" />
              <DrawerBox label="Next Action" value={getNextAction(drawer)} />
              {drawer.type === "project" && (
                <>
                  <DrawerBox label="Progress" value={`${drawer.item.progress}%`} />
                  <DrawerBox label="Waiting On" value={drawer.item.waitingOn} />
                  <DrawerBox label="Next Milestone" value={drawer.item.milestone} />
                  <DrawerBox label="Last Updated" value={drawer.item.updated} />
                </>
              )}
            </>
          )}

          {drawerTab === "tasks" && (
            <ListBlock
              emptyText="No tasks added yet."
              items={
                drawer.type === "project"
                  ? drawer.item.tasks
                  : ["Review item", "Update status", "Confirm next action"]
              }
            />
          )}

          {drawerTab === "files" && (
            <ListBlock
              emptyText="No files attached yet."
              items={drawer.type === "project" ? drawer.item.files : ["No files attached"]}
            />
          )}

          {drawerTab === "notes" && (
            <ListBlock
              emptyText="No notes added yet."
              items={
                drawer.type === "project"
                  ? drawer.item.notes
                  : [drawer.item.note || drawer.item.details || "No notes yet"]
              }
            />
          )}

          {drawerTab === "activity" && (
            <ListBlock
              emptyText="No activity yet."
              items={
                drawer.type === "project"
                  ? drawer.item.activity
                  : ["Item opened", "Status available"]
              }
            />
          )}

          <button className="primary">Open Workspace →</button>
        </aside>
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .opsPage {
          min-height: 100vh;
          background: #fbf8f1;
          color: #111827;
          padding: 22px 28px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 13px;
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
          font-size: 30px;
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
          line-height: 1.35;
        }

        .dateBlock small {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 11px;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 12px;
        }

        .metric {
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 12px;
          padding: 16px 20px;
          min-height: 88px;
          text-align: left;
          cursor: pointer;
        }

        .metric:hover,
        .priorityRow:hover,
        .projectRow:hover,
        .simpleRow:hover,
        .decisionRow:hover,
        .commItem:hover,
        .timelineRow:hover {
          background: #faf4e9;
        }

        .metric strong {
          display: block;
          font-size: 26px;
          line-height: 1;
          margin-bottom: 7px;
          font-weight: 750;
        }

        .metric span {
          display: block;
          font-size: 13px;
          font-weight: 750;
          margin-bottom: 4px;
        }

        .metric small {
          color: #64748b;
          font-size: 11px;
          line-height: 1.25;
        }

        .layout {
          display: grid;
          grid-template-columns: 0.75fr 1.85fr 0.82fr;
          gap: 12px;
          height: calc(100vh - 135px);
          align-items: start;
        }

        .leftStack,
        .rightStack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 0;
        }

        .panel {
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 12px;
          padding: 14px;
          overflow: hidden;
        }

        .projects {
          align-self: start;
          max-height: calc(100vh - 135px);
          overflow: auto;
        }

        .panelHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ebe2d4;
          padding-bottom: 9px;
          margin-bottom: 8px;
        }

        .panelHead b {
          font-size: 14px;
          font-weight: 750;
        }

        .headActions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panelHead span {
          font-size: 12px;
          color: #64748b;
        }

        .addBtn {
          border: 1px solid #e5dccc;
          background: #fbf8f1;
          color: #111827;
          border-radius: 999px;
          width: 22px;
          height: 22px;
          cursor: pointer;
          line-height: 1;
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
          padding: 13px 0;
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
          font-size: 12px;
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
          padding: 14px 0;
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
          grid-template-columns: 1fr 36px;
          gap: 10px;
          align-items: center;
          margin: 10px 0;
        }

        .progressLine b {
          font-size: 11px;
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
          grid-template-columns: 1fr 1fr 0.7fr;
          gap: 10px;
        }

        .projectInfo div {
          border-left: 1px solid #e5dccc;
          padding-left: 9px;
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
          padding: 4px 9px;
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
          padding: 12px 0;
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

        .decisionWrap {
          display: grid;
          grid-template-columns: 1fr 30px;
          border-bottom: 1px solid #ebe2d4;
          align-items: center;
        }

        .decisionWrap .decisionRow {
          border-bottom: 0;
        }

        .decisionRow small {
          font-size: 12px;
        }

        .approveBtn {
          border: 1px solid #d7eadf;
          background: #f2fbf5;
          color: #0f7a4b;
          border-radius: 8px;
          height: 24px;
          cursor: pointer;
        }

        .communicationGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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
          display: block;
          font-size: 22px;
          margin-bottom: 4px;
        }

        .commItem span {
          display: block;
          font-size: 11px;
          line-height: 1.2;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 410px;
          background: #fffdf8;
          border-left: 1px solid #e5dccc;
          padding: 24px;
          box-shadow: -16px 0 40px rgba(0, 0, 0, 0.08);
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
          font-size: 26px;
          font-weight: 400;
          margin: 0 0 8px;
        }

        .drawerPill {
          display: inline-block;
          margin-top: 8px;
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
          font-weight: 750;
          border-bottom: 2px solid #111827;
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
          .opsPage {
            overflow: auto;
          }

          .metrics,
          .layout {
            grid-template-columns: 1fr;
            height: auto;
          }

          .projects {
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
}

function Panel({ title, children, className = "", onAdd }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panelHead">
        <b>{title}</b>
        <div className="headActions">
          {onAdd && (
            <button className="addBtn" onClick={onAdd} aria-label={`Add ${title}`}>
              +
            </button>
          )}
          <span>View all →</span>
        </div>
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

function ListBlock({ items, emptyText }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!safeItems.length) return <div className="drawerBox">{emptyText}</div>;

  return (
    <>
      {safeItems.map((item, index) => (
        <div className="drawerLine" key={`${item}-${index}`}>
          <span>{item}</span>
          <small>Open</small>
        </div>
      ))}
    </>
  );
}

function getDrawerTitle(drawer) {
  if (!drawer) return "Details";
  if (drawer.item?.name) return drawer.item.name;
  if (drawer.item?.title) return drawer.item.title;
  if (drawer.item?.label) return drawer.item.label;
  return drawer.item?.label || "Details";
}

function getItemStatus(drawer) {
  if (drawer.type === "project") return drawer.item.status;
  if (drawer.item?.status) return drawer.item.status;
  if (drawer.item?.priority) return drawer.item.priority;
  if (drawer.item?.note) return drawer.item.note;
  return "Open";
}

function getNextAction(drawer) {
  if (drawer.type === "decision") return "Review and approve, decline, or request changes";
  if (drawer.type === "waiting") return "Follow up or escalate if overdue";
  if (drawer.type === "communication") return "Review communication thread";
  if (drawer.type === "project") return drawer.item.milestone;
  return "Review and update status";
}

function getStatusClass(status) {
  if (status === "Behind") return "behind";
  if (status?.includes("Waiting")) return "waiting";
  return "";
}
