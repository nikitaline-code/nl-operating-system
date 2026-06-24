import { useEffect, useMemo, useState } from "react";

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const DEFAULT_DATA = {
  priorities: [
    { id: "p1", title: "Dealer Pricing Approval", note: "Decision needed", owner: "Nikita", status: "Open" },
    { id: "p2", title: "July Event Catering", note: "Costco quote pending", owner: "Nikita", status: "Open" },
    { id: "p3", title: "Inventory Review", note: "Reports ready", owner: "Nikita", status: "Open" },
  ],
  projects: [
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
  ],
  timeline: [
    { id: "t1", label: "Overdue", count: 3 },
    { id: "t2", label: "Today", count: 5 },
    { id: "t3", label: "Tomorrow", count: 4 },
    { id: "t4", label: "This Week", count: 11 },
  ],
  waiting: [
    { id: "w1", label: "Mark", count: 2, details: "Pricing approval, dealer event final agenda" },
    { id: "w2", label: "Dealer", count: 8, details: "Dealer numbers, paperwork, signatures" },
    { id: "w3", label: "Vendor", count: 3, details: "Costco, AV quote, rentals" },
  ],
  decisions: [
    { id: "d1", title: "Pricing Exception – MBJ Ranch", priority: "High", status: "Pending", note: "Approval needed to move forward." },
    { id: "d2", title: "Dealer Approval – Seminole", priority: "Medium", status: "Pending", note: "Waiting on final confirmation." },
  ],
  communications: [
    { id: "c1", number: 12, label: "Dealer", details: "Waiting for dealer replies" },
    { id: "c2", number: 4, label: "Vendor", details: "Waiting for vendor quotes" },
    { id: "c3", number: 2, label: "Review", details: "Ready for Mark review" },
    { id: "c4", number: 5, label: "Ready", details: "Ready to send" },
  ],
};

const STORAGE_KEY = "executive-status-board-v2";

export default function ExecutiveStatus() {
  const [now, setNow] = useState(null);
  const [data, setData] = useState(DEFAULT_DATA);
  const [drawer, setDrawer] = useState(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [editing, setEditing] = useState(null);
  const [quickAdd, setQuickAdd] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        setData(DEFAULT_DATA);
      }
    }

    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

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
    ? now.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })
    : "";

  const metrics = [
    {
      number: data.projects.length,
      label: "Active Projects",
      note: `${data.projects.filter((p) => p.status === "On Track").length} on track`,
    },
    {
      number: data.waiting.reduce((sum, item) => sum + Number(item.count || 0), 0),
      label: "Waiting On",
      note: "Items currently stalled",
    },
    {
      number: data.decisions.filter((d) => d.status !== "Approved").length,
      label: "Needs Your Input",
      note: "Approvals / Decisions",
    },
    { number: "97%", label: "Operations Health", note: "Everything on track" },
    { number: "✓", label: "On Track", note: "Dealer Event · Friday" },
  ];

  function openDrawer(type, item) {
    setDrawer({ type, item });
    setDrawerTab("overview");
    setEditing(null);
    setQuickAdd(null);
  }

  function refreshDrawer(type, id) {
    const key = getCollectionKey(type);
    if (!key) return;
    const updated = data[key].find((item) => item.id === id);
    if (updated) setDrawer({ type, item: updated });
  }

  function addItem(type, payload) {
    const key = getCollectionKey(type);
    if (!key) return;

    const item = buildNewItem(type, payload);
    setData((prev) => ({ ...prev, [key]: [...prev[key], item] }));
    setQuickAdd(null);
  }

  function updateItem(type, id, changes) {
    const key = getCollectionKey(type);
    if (!key) return;

    setData((prev) => {
      const updatedCollection = prev[key].map((item) =>
        item.id === id ? { ...item, ...changes, updated: "Just now" } : item
      );

      const next = { ...prev, [key]: updatedCollection };

      if (drawer?.item?.id === id) {
        const updatedDrawerItem = updatedCollection.find((item) => item.id === id);
        setDrawer({ type, item: updatedDrawerItem });
      }

      return next;
    });

    setEditing(null);
  }

  function deleteItem(type, id) {
    const key = getCollectionKey(type);
    if (!key) return;

    setData((prev) => ({ ...prev, [key]: prev[key].filter((item) => item.id !== id) }));
    if (drawer?.item?.id === id) setDrawer(null);
  }

  function approveDecision(decision) {
    updateItem("decision", decision.id, { status: "Approved" });
    addItem("priority", {
      title: `Approved: ${decision.title}`,
      note: "Action created for Nikita",
      owner: "Nikita",
      status: "Open",
    });
  }

  function addDrawerListItem(field) {
    if (!drawer || drawer.type !== "project") return;
    const value = prompt(`Add ${field.slice(0, -1)}:`);
    if (!value) return;

    const existing = Array.isArray(drawer.item[field]) ? drawer.item[field] : [];
    updateItem("project", drawer.item.id, { [field]: [...existing, value] });
  }

  function editDrawerListItem(field, index, value) {
    if (!drawer || drawer.type !== "project") return;
    const existing = Array.isArray(drawer.item[field]) ? drawer.item[field] : [];
    const next = existing.map((item, i) => (i === index ? value : item));
    updateItem("project", drawer.item.id, { [field]: next });
  }

  function removeDrawerListItem(field, index) {
    if (!drawer || drawer.type !== "project") return;
    const existing = Array.isArray(drawer.item[field]) ? drawer.item[field] : [];
    const next = existing.filter((_, i) => i !== index);
    updateItem("project", drawer.item.id, { [field]: next });
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
          <button className="metric" key={metric.label} onClick={() => openDrawer("metric", metric)}>
            <strong>{metric.number}</strong>
            <span>{metric.label}</span>
            <small>{metric.note}</small>
          </button>
        ))}
      </section>

      <section className="layout">
        <div className="leftStack">
          <Panel title="Today’s Priorities" onAdd={() => setQuickAdd({ type: "priority" })}>
            {data.priorities.map((priority, index) => (
              <EditableRow
                key={priority.id}
                type="priority"
                item={priority}
                onOpen={() => openDrawer("priority", priority)}
                onEdit={() => setEditing({ type: "priority", item: priority })}
                onDelete={() => deleteItem("priority", priority.id)}
              >
                <span className="number">{index + 1}</span>
                <div>
                  <strong>{priority.title}</strong>
                  <small>{priority.note}</small>
                </div>
              </EditableRow>
            ))}
          </Panel>

          <Panel title="Waiting On" onAdd={() => setQuickAdd({ type: "waiting" })}>
            {data.waiting.map((item) => (
              <EditableRow
                key={item.id}
                type="waiting"
                item={item}
                onOpen={() => openDrawer("waiting", item)}
                onEdit={() => setEditing({ type: "waiting", item })}
                onDelete={() => deleteItem("waiting", item.id)}
                compact
              >
                <span>{item.label}</span>
                <b>{item.count}</b>
              </EditableRow>
            ))}
          </Panel>

          <Panel title="Communication Pipeline" onAdd={() => setQuickAdd({ type: "communication" })}>
            <div className="communicationGrid">
              {data.communications.map((item) => (
                <button className="commItem" key={item.id} onClick={() => openDrawer("communication", item)}>
                  <strong>{item.number}</strong>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Active Projects" className="projects" onAdd={() => setQuickAdd({ type: "project" })}>
          {data.projects.map((project) => (
            <div className="projectShell" key={project.id}>
              <button className="projectRow" onClick={() => openDrawer("project", project)}>
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

              <div className="inlineActions">
                <button onClick={() => setEditing({ type: "project", item: project })}>Edit</button>
                <button onClick={() => deleteItem("project", project.id)}>Delete</button>
              </div>
            </div>
          ))}
        </Panel>

        <div className="rightStack">
          <Panel title="Task Timeline" onAdd={() => setQuickAdd({ type: "timeline" })}>
            {data.timeline.map((item) => (
              <EditableRow
                key={item.id}
                type="timeline"
                item={item}
                onOpen={() => openDrawer("timeline", item)}
                onEdit={() => setEditing({ type: "timeline", item })}
                onDelete={() => deleteItem("timeline", item.id)}
                compact
              >
                <span>{item.label}</span>
                <b className={item.label === "Overdue" ? "danger" : ""}>{item.count}</b>
              </EditableRow>
            ))}
          </Panel>

          <Panel title="Needs Your Decision" onAdd={() => setQuickAdd({ type: "decision" })}>
            {data.decisions.map((decision) => (
              <div className="decisionWrap" key={decision.id}>
                <button className="decisionRow" onClick={() => openDrawer("decision", decision)}>
                  <span>{decision.title}</span>
                  <small className={decision.priority === "High" ? "danger" : ""}>
                    {decision.status === "Approved" ? "Approved" : decision.priority}
                  </small>
                </button>
                <div className="miniActions">
                  {decision.status !== "Approved" && (
                    <button onClick={() => approveDecision(decision)}>✓</button>
                  )}
                  <button onClick={() => setEditing({ type: "decision", item: decision })}>Edit</button>
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </section>

      {quickAdd && (
        <Modal title={`Add ${labelForType(quickAdd.type)}`} onClose={() => setQuickAdd(null)}>
          <ItemForm
            type={quickAdd.type}
            onCancel={() => setQuickAdd(null)}
            onSave={(payload) => addItem(quickAdd.type, payload)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title={`Edit ${labelForType(editing.type)}`} onClose={() => setEditing(null)}>
          <ItemForm
            type={editing.type}
            initial={editing.item}
            onCancel={() => setEditing(null)}
            onSave={(payload) => updateItem(editing.type, editing.item.id, payload)}
          />
        </Modal>
      )}

      {drawer && (
        <aside className="drawer">
          <button className="close" onClick={() => setDrawer(null)}>×</button>

          <h2>{getDrawerTitle(drawer)}</h2>
          <p>Click into each tab to update details, tasks, files, notes, and activity.</p>

          <div className="drawerTopActions">
            {drawer.type !== "metric" && (
              <button onClick={() => setEditing({ type: drawer.type, item: drawer.item })}>Edit Main Item</button>
            )}
            {drawer.type === "decision" && drawer.item.status !== "Approved" && (
              <button onClick={() => approveDecision(drawer.item)}>Approve</button>
            )}
          </div>

          {drawer.type === "project" && (
            <span className={`pill drawerPill ${getStatusClass(drawer.item.status)}`}>{drawer.item.status}</span>
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
            <EditableList
              title="Tasks"
              items={drawer.type === "project" ? drawer.item.tasks || [] : ["Review item", "Update status"]}
              onAdd={() => addDrawerListItem("tasks")}
              onEdit={(index, value) => editDrawerListItem("tasks", index, value)}
              onRemove={(index) => removeDrawerListItem("tasks", index)}
            />
          )}

          {drawerTab === "files" && (
            <EditableList
              title="Files"
              items={drawer.type === "project" ? drawer.item.files || [] : []}
              onAdd={() => addDrawerListItem("files")}
              onEdit={(index, value) => editDrawerListItem("files", index, value)}
              onRemove={(index) => removeDrawerListItem("files", index)}
            />
          )}

          {drawerTab === "notes" && (
            <EditableList
              title="Notes"
              items={drawer.type === "project" ? drawer.item.notes || [] : [drawer.item.note || drawer.item.details || ""]}
              onAdd={() => addDrawerListItem("notes")}
              onEdit={(index, value) => editDrawerListItem("notes", index, value)}
              onRemove={(index) => removeDrawerListItem("notes", index)}
            />
          )}

          {drawerTab === "activity" && (
            <EditableList
              title="Activity"
              items={drawer.type === "project" ? drawer.item.activity || [] : ["Item opened"]}
              onAdd={() => addDrawerListItem("activity")}
              onEdit={(index, value) => editDrawerListItem("activity", index, value)}
              onRemove={(index) => removeDrawerListItem("activity", index)}
            />
          )}

          <button className="primary">Open Workspace →</button>
        </aside>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

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
          grid-template-columns: minmax(260px, 23%) minmax(720px, 54%) minmax(260px, 23%);
          gap: 12px;
          width: 100%;
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
          width: 100%;
        }

        .projects {
          align-self: start;
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

        .editableRow {
          display: grid;
          grid-template-columns: 1fr auto;
          border-bottom: 1px solid #ebe2d4;
          align-items: center;
        }

        .rowContent {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 12px;
          align-items: center;
          padding: 13px 0;
          border: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .editableRow.compact .rowContent {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 13px;
        }

        .rowActions,
        .inlineActions,
        .miniActions {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
          align-items: center;
        }

        .rowActions button,
        .inlineActions button,
        .miniActions button,
        .drawerTopActions button,
        .listActions button {
          border: 1px solid #e5dccc;
          background: #fbf8f1;
          border-radius: 7px;
          padding: 4px 7px;
          font-size: 11px;
          cursor: pointer;
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

        .rowContent strong,
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

        .projectShell {
          border-bottom: 1px solid #ebe2d4;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }

        .projectRow {
          padding: 14px 0 8px;
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
          grid-template-columns: 1fr auto;
          border-bottom: 1px solid #ebe2d4;
          align-items: center;
        }

        .decisionWrap .decisionRow {
          border-bottom: 0;
        }

        .decisionRow small {
          font-size: 12px;
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
          width: 430px;
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

        .drawerTopActions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
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

        .modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(17, 24, 39, 0.35);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal {
          width: 430px;
          max-width: calc(100vw - 30px);
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.18);
        }

        .modalHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .modalHead h3 {
          margin: 0;
          font-size: 18px;
        }

        .formGrid {
          display: grid;
          gap: 10px;
        }

        .field label {
          display: block;
          font-size: 11px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          border: 1px solid #e5dccc;
          border-radius: 9px;
          background: #fbf8f1;
          padding: 9px;
          font: inherit;
        }

        .formActions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 12px;
        }

        .formActions button {
          border: 1px solid #e5dccc;
          background: #fbf8f1;
          border-radius: 9px;
          padding: 9px 12px;
          cursor: pointer;
        }

        .formActions button.save {
          background: #111827;
          color: white;
          border-color: #111827;
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

function EditableRow({ children, onOpen, onEdit, onDelete, compact }) {
  return (
    <div className={`editableRow ${compact ? "compact" : ""}`}>
      <button className="rowContent" onClick={onOpen}>
        {children}
      </button>
      <div className="rowActions">
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>×</button>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modalOverlay">
      <div className="modal">
        <div className="modalHead">
          <h3>{title}</h3>
          <button onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ItemForm({ type, initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState(() => normalizeInitial(type, initial));

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form className="formGrid" onSubmit={submit}>
      {getFields(type).map((field) => (
        <div className="field" key={field.name}>
          <label>{field.label}</label>
          {field.type === "select" ? (
            <select value={form[field.name] || ""} onChange={(e) => update(field.name, e.target.value)}>
              {field.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea rows={3} value={form[field.name] || ""} onChange={(e) => update(field.name, e.target.value)} />
          ) : (
            <input
              type={field.type || "text"}
              value={form[field.name] || ""}
              onChange={(e) => update(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
            />
          )}
        </div>
      ))}

      <div className="formActions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button className="save" type="submit">Save</button>
      </div>
    </form>
  );
}

function EditableList({ title, items, onAdd, onEdit, onRemove }) {
  return (
    <>
      <div className="panelHead">
        <b>{title}</b>
        <button className="addBtn" onClick={onAdd}>+</button>
      </div>

      {items.length === 0 && <div className="drawerBox">Nothing added yet.</div>}

      {items.map((item, index) => (
        <div className="drawerLine" key={`${item}-${index}`}>
          <span>{item}</span>
          <div className="listActions">
            <button onClick={() => {
              const value = prompt("Update item:", item);
              if (value) onEdit(index, value);
            }}>Edit</button>
            <button onClick={() => onRemove(index)}>×</button>
          </div>
        </div>
      ))}
    </>
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

function getCollectionKey(type) {
  return {
    priority: "priorities",
    project: "projects",
    timeline: "timeline",
    waiting: "waiting",
    decision: "decisions",
    communication: "communications",
  }[type];
}

function buildNewItem(type, payload) {
  const id = `${type}-${uid()}`;

  if (type === "project") {
    return {
      id,
      name: payload.name || "New Project",
      status: payload.status || "On Track",
      progress: Number(payload.progress || 0),
      phase: payload.phase || "New project",
      waitingOn: payload.waitingOn || "Not set",
      milestone: payload.milestone || "Not set",
      updated: "Just now",
      tasks: [],
      files: [],
      notes: [],
      activity: ["Project created"],
    };
  }

  if (type === "priority") {
    return { id, title: payload.title || "New Priority", note: payload.note || "", owner: "Nikita", status: "Open" };
  }

  if (type === "decision") {
    return { id, title: payload.title || "New Decision", priority: payload.priority || "Medium", status: payload.status || "Pending", note: payload.note || "" };
  }

  if (type === "waiting") {
    return { id, label: payload.label || "Waiting", count: Number(payload.count || 1), details: payload.details || "" };
  }

  if (type === "communication") {
    return { id, label: payload.label || "Communication", number: Number(payload.number || 1), details: payload.details || "" };
  }

  if (type === "timeline") {
    return { id, label: payload.label || "Today", count: Number(payload.count || 1) };
  }

  return { id, ...payload };
}

function getFields(type) {
  if (type === "project") {
    return [
      { name: "name", label: "Project Name" },
      { name: "status", label: "Status", type: "select", options: ["On Track", "Waiting on Alex", "Behind", "At Risk", "Planning"] },
      { name: "progress", label: "Progress %", type: "number" },
      { name: "phase", label: "Current Phase" },
      { name: "waitingOn", label: "Waiting On", type: "textarea" },
      { name: "milestone", label: "Next Milestone" },
    ];
  }

  if (type === "priority") return [{ name: "title", label: "Title" }, { name: "note", label: "Note" }];
  if (type === "decision") return [{ name: "title", label: "Decision" }, { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"] }, { name: "note", label: "Note" }];
  if (type === "waiting") return [{ name: "label", label: "Waiting On" }, { name: "count", label: "Count", type: "number" }, { name: "details", label: "Details", type: "textarea" }];
  if (type === "communication") return [{ name: "label", label: "Category" }, { name: "number", label: "Count", type: "number" }, { name: "details", label: "Details", type: "textarea" }];
  if (type === "timeline") return [{ name: "label", label: "Label" }, { name: "count", label: "Count", type: "number" }];

  return [{ name: "title", label: "Title" }];
}

function normalizeInitial(type, initial) {
  if (type === "project") {
    return {
      name: initial.name || "",
      status: initial.status || "On Track",
      progress: initial.progress || 0,
      phase: initial.phase || "",
      waitingOn: initial.waitingOn || "",
      milestone: initial.milestone || "",
    };
  }

  if (type === "priority") return { title: initial.title || "", note: initial.note || "" };
  if (type === "decision") return { title: initial.title || "", priority: initial.priority || "Medium", note: initial.note || "", status: initial.status || "Pending" };
  if (type === "waiting") return { label: initial.label || "", count: initial.count || 1, details: initial.details || "" };
  if (type === "communication") return { label: initial.label || "", number: initial.number || 1, details: initial.details || "" };
  if (type === "timeline") return { label: initial.label || "", count: initial.count || 1 };

  return initial;
}

function labelForType(type) {
  return {
    priority: "Priority",
    project: "Project",
    decision: "Decision",
    waiting: "Waiting Item",
    communication: "Communication",
    timeline: "Timeline Item",
  }[type] || "Item";
}

function getDrawerTitle(drawer) {
  if (!drawer) return "Details";
  if (drawer.item?.name) return drawer.item.name;
  if (drawer.item?.title) return drawer.item.title;
  if (drawer.item?.label) return drawer.item.label;
  return "Details";
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
  if (status === "At Risk") return "behind";
  return "";
}
