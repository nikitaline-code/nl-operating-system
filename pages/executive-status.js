import { useEffect, useMemo, useState } from "react";

const STORE_KEY = "ea-executive-status-v4";

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const DEFAULT_DATA = {
  priorities: [
    { id: "p1", title: "Dealer Pricing Approval", note: "Decision needed" },
    { id: "p2", title: "July Event Catering", note: "Costco quote pending" },
    { id: "p3", title: "Inventory Review", note: "Reports ready" },
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
      tasks: [
        { id: "pt1", title: "Confirm dealer numbers", status: "Open" },
        { id: "pt2", title: "Finalize catering order", status: "Open" },
        { id: "pt3", title: "Send final agenda", status: "Open" },
      ],
      files: [
        { id: "pf1", name: "Dealer Agenda.pdf", type: "PDF" },
        { id: "pf2", name: "Catering Quote.pdf", type: "PDF" },
      ],
      notes: [
        { id: "pn1", text: "Costco quote expected today." },
        { id: "pn2", text: "AV confirmation still pending." },
      ],
      activity: [
        { id: "pa1", text: "Project status updated", time: "27 mins ago" },
        { id: "pa2", text: "Task added from meeting", time: "1 hour ago" },
      ],
    },
    {
      id: "proj2",
      name: "Seminole Expansion",
      status: "Waiting",
      progress: 65,
      phase: "Drawings & Specs",
      waitingOn: "Drawings & Specs",
      milestone: "Presentation Draft · Jun 30",
      updated: "1 hour ago",
      tasks: [{ id: "pt4", title: "Review drawings", status: "Open" }],
      files: [{ id: "pf3", name: "Arena Notes.pdf", type: "PDF" }],
      notes: [{ id: "pn3", text: "Waiting on drawings before next review." }],
      activity: [{ id: "pa3", text: "Follow-up logged", time: "1 hour ago" }],
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
      tasks: [{ id: "pt5", title: "Review dashboard layout", status: "Open" }],
      files: [{ id: "pf4", name: "Dashboard Mockup.png", type: "Image" }],
      notes: [{ id: "pn4", text: "Keep styling clean and not too colourful." }],
      activity: [{ id: "pa4", text: "Mockup updated", time: "2 hours ago" }],
    },
  ],
  timeline: [
    { id: "tl1", label: "Overdue", count: 3 },
    { id: "tl2", label: "Today", count: 5 },
    { id: "tl3", label: "Tomorrow", count: 4 },
    { id: "tl4", label: "This Week", count: 11 },
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

export default function ExecutiveStatus() {
  const [now, setNow] = useState(null);
  const [data, setData] = useState(DEFAULT_DATA);
  const [drawer, setDrawer] = useState(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    setNow(new Date());

    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) setData(JSON.parse(saved));
    } catch {}

    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch {}
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
    { number: data.projects.length, label: "Active Projects", note: `${data.projects.filter(p => p.status === "On Track").length} on track` },
    { number: data.waiting.reduce((sum, x) => sum + Number(x.count || 0), 0), label: "Waiting On", note: "Items currently stalled" },
    { number: data.decisions.filter(x => x.status !== "Approved").length, label: "Needs Your Input", note: "Approvals / Decisions" },
    { number: "97%", label: "Operations Health", note: "Everything on track" },
    { number: "✓", label: "On Track", note: "Dealer Event · Friday" },
  ];

  function saveData(next) {
    setData(next);
  }

  function updateCollection(key, updater) {
    saveData({ ...data, [key]: updater(data[key]) });
  }

  function openDrawer(type, item) {
    setDrawer({ type, item });
    setDrawerTab("overview");
    setDraft(null);
  }

  function refreshDrawer(key, id, nextData = data) {
    const item = nextData[key]?.find((x) => x.id === id);
    if (item) setDrawer({ type: singularFromKey(key), item });
  }

  function addPriority() {
    const item = { id: uid(), title: "New priority", note: "Add details" };
    updateCollection("priorities", (items) => [...items, item]);
    openDrawer("priority", item);
    setDraft({ ...item });
  }

  function addProject() {
    const item = {
      id: uid(),
      name: "New Project",
      status: "On Track",
      progress: 0,
      phase: "New phase",
      waitingOn: "Not set",
      milestone: "Not set",
      updated: "Just now",
      tasks: [],
      files: [],
      notes: [],
      activity: [{ id: uid(), text: "Project created", time: "Just now" }],
    };
    updateCollection("projects", (items) => [...items, item]);
    openDrawer("project", item);
    setDraft({ ...item });
  }

  function addWaiting() {
    const item = { id: uid(), label: "New waiting item", count: 1, details: "Add details" };
    updateCollection("waiting", (items) => [...items, item]);
    openDrawer("waiting", item);
    setDraft({ ...item });
  }

  function addDecision() {
    const item = { id: uid(), title: "New decision", priority: "Medium", status: "Pending", note: "Add background" };
    updateCollection("decisions", (items) => [...items, item]);
    openDrawer("decision", item);
    setDraft({ ...item });
  }

  function addCommunication() {
    const item = { id: uid(), number: 1, label: "New", details: "Add details" };
    updateCollection("communications", (items) => [...items, item]);
    openDrawer("communication", item);
    setDraft({ ...item });
  }

  function addTimeline() {
    const item = { id: uid(), label: "New", count: 1 };
    updateCollection("timeline", (items) => [...items, item]);
    openDrawer("timeline", item);
    setDraft({ ...item });
  }

  function deleteItem(key, id) {
    const next = { ...data, [key]: data[key].filter((x) => x.id !== id) };
    saveData(next);
    if (drawer?.item?.id === id) setDrawer(null);
  }

  function startEdit(item) {
    setDraft(JSON.parse(JSON.stringify(item)));
  }

  function cancelEdit() {
    setDraft(null);
  }

  function saveDraft(type, id) {
    const key = collectionForType(type);
    if (!key || !draft) return;

    const next = {
      ...data,
      [key]: data[key].map((x) => (x.id === id ? { ...x, ...draft, updated: "Just now" } : x)),
    };

    saveData(next);
    setDraft(null);
    refreshDrawer(key, id, next);
  }

  function approveDecision(decision) {
    const nextDecisions = data.decisions.map((x) =>
      x.id === decision.id ? { ...x, status: "Approved" } : x
    );

    const newPriority = {
      id: uid(),
      title: `Approved: ${decision.title}`,
      note: "Action created for Nikita",
    };

    saveData({ ...data, decisions: nextDecisions, priorities: [...data.priorities, newPriority] });

    if (drawer?.item?.id === decision.id) {
      setDrawer({ type: "decision", item: { ...decision, status: "Approved" } });
    }
  }

  function addProjectDetail(field) {
    if (!drawer || drawer.type !== "project") return;

    const newItem =
      field === "tasks"
        ? { id: uid(), title: "New task", status: "Open" }
        : field === "files"
        ? { id: uid(), name: "New file", type: "File" }
        : field === "notes"
        ? { id: uid(), text: "New note" }
        : { id: uid(), text: "New activity", time: "Just now" };

    const nextProjects = data.projects.map((project) => {
      if (project.id !== drawer.item.id) return project;
      return { ...project, [field]: [...(project[field] || []), newItem], updated: "Just now" };
    });

    const next = { ...data, projects: nextProjects };
    saveData(next);
    refreshDrawer("projects", drawer.item.id, next);
  }

  function updateProjectDetail(field, detailId, patch) {
    if (!drawer || drawer.type !== "project") return;

    const nextProjects = data.projects.map((project) => {
      if (project.id !== drawer.item.id) return project;
      return {
        ...project,
        [field]: (project[field] || []).map((item) => (item.id === detailId ? { ...item, ...patch } : item)),
        updated: "Just now",
      };
    });

    const next = { ...data, projects: nextProjects };
    saveData(next);
    refreshDrawer("projects", drawer.item.id, next);
  }

  function deleteProjectDetail(field, detailId) {
    if (!drawer || drawer.type !== "project") return;

    const nextProjects = data.projects.map((project) => {
      if (project.id !== drawer.item.id) return project;
      return {
        ...project,
        [field]: (project[field] || []).filter((item) => item.id !== detailId),
        updated: "Just now",
      };
    });

    const next = { ...data, projects: nextProjects };
    saveData(next);
    refreshDrawer("projects", drawer.item.id, next);
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
          <Panel title="Today’s Priorities" onAdd={addPriority}>
            {data.priorities.map((item, index) => (
              <CleanRow
                key={item.id}
                onOpen={() => openDrawer("priority", item)}
                onDelete={() => deleteItem("priorities", item.id)}
              >
                <span className="number">{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.note}</small>
                </div>
              </CleanRow>
            ))}
          </Panel>

          <Panel title="Waiting On" onAdd={addWaiting}>
            {data.waiting.map((item) => (
              <CleanRow
                key={item.id}
                compact
                onOpen={() => openDrawer("waiting", item)}
                onDelete={() => deleteItem("waiting", item.id)}
              >
                <span>{item.label}</span>
                <b>{item.count}</b>
              </CleanRow>
            ))}
          </Panel>

          <Panel title="Communication Pipeline" onAdd={addCommunication}>
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

        <Panel title="Active Projects" className="projects" onAdd={addProject}>
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
              <button className="ghostDelete" onClick={() => deleteItem("projects", project.id)}>Delete</button>
            </div>
          ))}
        </Panel>

        <div className="rightStack">
          <Panel title="Task Timeline" onAdd={addTimeline}>
            {data.timeline.map((item) => (
              <CleanRow
                key={item.id}
                compact
                onOpen={() => openDrawer("timeline", item)}
                onDelete={() => deleteItem("timeline", item.id)}
              >
                <span>{item.label}</span>
                <b className={item.label === "Overdue" ? "danger" : ""}>{item.count}</b>
              </CleanRow>
            ))}
          </Panel>

          <Panel title="Needs Your Decision" onAdd={addDecision}>
            {data.decisions.map((item) => (
              <div className="decisionItem" key={item.id}>
                <button className="decisionRow" onClick={() => openDrawer("decision", item)}>
                  <span>{item.title}</span>
                  <small className={item.priority === "High" ? "danger" : ""}>
                    {item.status === "Approved" ? "Approved" : item.priority}
                  </small>
                </button>
                <div className="decisionActions">
                  {item.status !== "Approved" && <button onClick={() => approveDecision(item)}>✓</button>}
                  <button onClick={() => deleteItem("decisions", item.id)}>×</button>
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </section>

      {drawer && (
        <aside className="drawer">
          <button className="close" onClick={() => setDrawer(null)}>×</button>

          <div className="drawerHeader">
            <div>
              <h2>{getDrawerTitle(drawer)}</h2>
              <p>Update details directly here. No popups.</p>
            </div>
          </div>

          <div className="drawerActions">
            {drawer.type !== "metric" && !draft && (
              <button onClick={() => startEdit(drawer.item)}>Edit Details</button>
            )}
            {draft && (
              <>
                <button onClick={cancelEdit}>Cancel</button>
                <button className="darkBtn" onClick={() => saveDraft(drawer.type, drawer.item.id)}>Save</button>
              </>
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
              {draft ? (
                <InlineEditor type={drawer.type} draft={draft} setDraft={setDraft} />
              ) : (
                <Overview drawer={drawer} />
              )}
            </>
          )}

          {drawerTab === "tasks" && drawer.type === "project" && (
            <DetailList
              title="Tasks"
              items={drawer.item.tasks || []}
              field="tasks"
              addItem={addProjectDetail}
              updateItem={updateProjectDetail}
              deleteItem={deleteProjectDetail}
              primaryKey="title"
              secondaryKey="status"
            />
          )}

          {drawerTab === "files" && drawer.type === "project" && (
            <DetailList
              title="Files"
              items={drawer.item.files || []}
              field="files"
              addItem={addProjectDetail}
              updateItem={updateProjectDetail}
              deleteItem={deleteProjectDetail}
              primaryKey="name"
              secondaryKey="type"
            />
          )}

          {drawerTab === "notes" && drawer.type === "project" && (
            <DetailList
              title="Notes"
              items={drawer.item.notes || []}
              field="notes"
              addItem={addProjectDetail}
              updateItem={updateProjectDetail}
              deleteItem={deleteProjectDetail}
              primaryKey="text"
            />
          )}

          {drawerTab === "activity" && drawer.type === "project" && (
            <DetailList
              title="Activity"
              items={drawer.item.activity || []}
              field="activity"
              addItem={addProjectDetail}
              updateItem={updateProjectDetail}
              deleteItem={deleteProjectDetail}
              primaryKey="text"
              secondaryKey="time"
            />
          )}

          {drawer.type !== "project" && drawerTab !== "overview" && (
            <div className="emptyState">Detailed {drawerTab} can be added for this item later.</div>
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
        .rowMain:hover,
        .projectRow:hover,
        .decisionRow:hover,
        .commItem:hover {
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
          grid-template-columns: minmax(270px, 23%) minmax(760px, 54%) minmax(270px, 23%);
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

        .cleanRow {
          display: grid;
          grid-template-columns: 1fr 24px;
          align-items: center;
          border-bottom: 1px solid #ebe2d4;
        }

        .rowMain {
          border: 0;
          background: transparent;
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 12px;
          align-items: center;
          padding: 13px 0;
          text-align: left;
          cursor: pointer;
          width: 100%;
        }

        .cleanRow.compact .rowMain {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .deleteMini,
        .ghostDelete,
        .decisionActions button {
          opacity: 0;
          border: 1px solid #e5dccc;
          background: #fbf8f1;
          border-radius: 7px;
          padding: 3px 6px;
          cursor: pointer;
          color: #64748b;
        }

        .cleanRow:hover .deleteMini,
        .projectShell:hover .ghostDelete,
        .decisionItem:hover .decisionActions button {
          opacity: 1;
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

        .rowMain strong,
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
          position: relative;
        }

        .projectRow {
          padding: 14px 0 8px;
          border: 0;
          background: transparent;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .ghostDelete {
          position: absolute;
          right: 0;
          bottom: 8px;
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

        .danger {
          color: #dc2626 !important;
        }

        .decisionItem {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          border-bottom: 1px solid #ebe2d4;
        }

        .decisionRow {
          border: 0;
          background: transparent;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 12px 0;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          width: 100%;
        }

        .decisionActions {
          display: flex;
          gap: 5px;
        }

        .communicationGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .commItem {
          border: 0;
          background: transparent;
          text-align: center;
          border-right: 1px solid #e5dccc;
          padding: 8px 4px;
          cursor: pointer;
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
          width: 460px;
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

        .drawerActions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .drawerActions button,
        .detailHead button,
        .detailActions button {
          border: 1px solid #e5dccc;
          background: #fbf8f1;
          border-radius: 8px;
          padding: 7px 10px;
          cursor: pointer;
          font-size: 12px;
        }

        .drawerActions .darkBtn {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .drawerPill {
          display: inline-block;
          margin-top: 10px;
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
        .detailRow,
        .emptyState {
          border: 1px solid #ebe2d4;
          background: #fbf8f1;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 9px;
        }

        .drawerBox strong {
          display: block;
          margin-top: 4px;
        }

        .inlineForm {
          display: grid;
          gap: 10px;
        }

        .field label {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          border: 1px solid #e5dccc;
          background: #fbf8f1;
          border-radius: 8px;
          padding: 9px;
          font: inherit;
        }

        .detailHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .detailHead h3 {
          margin: 0;
          font-size: 15px;
        }

        .detailRow {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
        }

        .detailRow input {
          border: 0;
          background: transparent;
          width: 100%;
          font: inherit;
        }

        .detailRow input:focus {
          outline: 1px solid #e5dccc;
          background: #fffdf8;
          border-radius: 6px;
          padding: 4px;
        }

        .detailSub {
          color: #64748b;
          font-size: 11px;
          margin-top: 3px;
        }

        .detailActions {
          display: flex;
          gap: 6px;
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

          .drawer {
            width: min(460px, 100vw);
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
          {onAdd && <button className="addBtn" onClick={onAdd}>+</button>}
          <span>View all →</span>
        </div>
      </div>
      {children}
    </section>
  );
}

function CleanRow({ children, onOpen, onDelete, compact }) {
  return (
    <div className={`cleanRow ${compact ? "compact" : ""}`}>
      <button className="rowMain" onClick={onOpen}>{children}</button>
      <button className="deleteMini" onClick={onDelete}>×</button>
    </div>
  );
}

function InlineEditor({ type, draft, setDraft }) {
  const fields = fieldsForType(type);

  return (
    <div className="inlineForm">
      {fields.map((field) => (
        <div className="field" key={field.name}>
          <label>{field.label}</label>
          {field.type === "textarea" ? (
            <textarea
              rows={3}
              value={draft[field.name] || ""}
              onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}
            />
          ) : field.type === "select" ? (
            <select
              value={draft[field.name] || field.options[0]}
              onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}
            >
              {field.options.map((option) => <option key={option}>{option}</option>)}
            </select>
          ) : (
            <input
              type={field.type || "text"}
              value={draft[field.name] ?? ""}
              onChange={(e) => setDraft({ ...draft, [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Overview({ drawer }) {
  return (
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
  );
}

function DetailList({ title, items, field, addItem, updateItem, deleteItem, primaryKey, secondaryKey }) {
  return (
    <div>
      <div className="detailHead">
        <h3>{title}</h3>
        <button onClick={() => addItem(field)}>+ Add</button>
      </div>

      {items.length === 0 && <div className="emptyState">Nothing added yet.</div>}

      {items.map((item) => (
        <div className="detailRow" key={item.id}>
          <div>
            <input
              value={item[primaryKey] || ""}
              onChange={(e) => updateItem(field, item.id, { [primaryKey]: e.target.value })}
            />
            {secondaryKey && (
              <input
                className="detailSub"
                value={item[secondaryKey] || ""}
                onChange={(e) => updateItem(field, item.id, { [secondaryKey]: e.target.value })}
              />
            )}
          </div>
          <div className="detailActions">
            <button onClick={() => deleteItem(field, item.id)}>Delete</button>
          </div>
        </div>
      ))}
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

function fieldsForType(type) {
  if (type === "project") {
    return [
      { name: "name", label: "Project Name" },
      { name: "status", label: "Status", type: "select", options: ["On Track", "Waiting", "Behind", "At Risk", "Planning"] },
      { name: "progress", label: "Progress %", type: "number" },
      { name: "phase", label: "Current Phase" },
      { name: "waitingOn", label: "Waiting On", type: "textarea" },
      { name: "milestone", label: "Next Milestone" },
    ];
  }

  if (type === "priority") return [{ name: "title", label: "Title" }, { name: "note", label: "Note" }];
  if (type === "waiting") return [{ name: "label", label: "Waiting On" }, { name: "count", label: "Count", type: "number" }, { name: "details", label: "Details", type: "textarea" }];
  if (type === "decision") return [{ name: "title", label: "Decision" }, { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"] }, { name: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Declined", "Needs Changes"] }, { name: "note", label: "Note", type: "textarea" }];
  if (type === "communication") return [{ name: "label", label: "Category" }, { name: "number", label: "Count", type: "number" }, { name: "details", label: "Details", type: "textarea" }];
  if (type === "timeline") return [{ name: "label", label: "Label" }, { name: "count", label: "Count", type: "number" }];
  return [{ name: "label", label: "Label" }];
}

function collectionForType(type) {
  return {
    priority: "priorities",
    project: "projects",
    waiting: "waiting",
    decision: "decisions",
    communication: "communications",
    timeline: "timeline",
  }[type];
}

function singularFromKey(key) {
  return {
    priorities: "priority",
    projects: "project",
    waiting: "waiting",
    decisions: "decision",
    communications: "communication",
    timeline: "timeline",
  }[key];
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
  if (drawer.item?.details) return drawer.item.details;
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
  if (status === "Behind" || status === "At Risk") return "behind";
  if (status?.includes("Waiting")) return "waiting";
  return "";
}
