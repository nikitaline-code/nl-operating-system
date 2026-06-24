import { useEffect, useMemo, useState } from "react";

const TASKS_KEY = "os-tasks";
const DECISIONS_KEY = "executive-status-decisions-v1";
const NOTES_KEY = "executive-status-notes-v1";
const COMMUNICATIONS_KEY = "executive-status-communications-v1";

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function getTaskTitle(task) {
  return task.title || task.text || task.task || task.content || task.name || "Untitled task";
}

function getTaskProject(task) {
  return task.project || task.projectName || task.category || task.workspace || "General";
}

function getTaskSubProject(task) {
  return task.subProject || task.subproject || task.section || task.area || "General";
}

function getTaskDueDate(task) {
  return task.dueDate || task.due_date || task.date || "";
}

function getTaskPriority(task) {
  return task.priority || task.urgency || "Medium";
}

function isTaskComplete(task) {
  return Boolean(task.completed || task.isComplete || task.is_complete || task.done);
}

function normalizeDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("storage"));
  } catch {}
}

const DEFAULT_DECISIONS = [
  { id: "d1", title: "Pricing Exception – MBJ Ranch", priority: "High", status: "Pending", note: "Approval needed before sending." },
  { id: "d2", title: "Dealer Approval – Seminole", priority: "Medium", status: "Pending", note: "Waiting for final review." },
];

const DEFAULT_NOTES = [
  { id: "n1", text: "This page is pulling live status from your task list." },
];

const DEFAULT_COMMUNICATIONS = {
  unread: 7,
  needsReview: 3,
  waitingReply: 9,
  dialpadMissed: 2,
  dialpadUnread: 4,
};

export default function ExecutiveStatus() {
  const [now, setNow] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [decisions, setDecisions] = useState(DEFAULT_DECISIONS);
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [communications, setCommunications] = useState(DEFAULT_COMMUNICATIONS);
  const [drawer, setDrawer] = useState(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

  function loadLiveData() {
    setTasks(readJSON(TASKS_KEY, []));
    setDecisions(readJSON(DECISIONS_KEY, DEFAULT_DECISIONS));
    setNotes(readJSON(NOTES_KEY, DEFAULT_NOTES));
    setCommunications(readJSON(COMMUNICATIONS_KEY, DEFAULT_COMMUNICATIONS));
  }

  useEffect(() => {
    setNow(new Date());
    loadLiveData();

    const timer = setInterval(() => {
      setNow(new Date());
      loadLiveData();
    }, 30000);

    const onStorage = () => loadLiveData();
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function saveTasks(next) {
    setTasks(next);
    writeJSON(TASKS_KEY, next);
  }

  function saveDecisions(next) {
    setDecisions(next);
    writeJSON(DECISIONS_KEY, next);
  }

  function saveNotes(next) {
    setNotes(next);
    writeJSON(NOTES_KEY, next);
  }

  function saveCommunications(next) {
    setCommunications(next);
    writeJSON(COMMUNICATIONS_KEY, next);
  }

  const openTasks = tasks.filter((task) => !isTaskComplete(task));

  const due = useMemo(() => {
    const today = todayString();
    const tomorrow = addDays(1);
    const week = addDays(7);

    return {
      overdue: openTasks.filter((task) => {
        const dueDate = normalizeDate(getTaskDueDate(task));
        return dueDate && dueDate < today;
      }),
      today: openTasks.filter((task) => normalizeDate(getTaskDueDate(task)) === today),
      tomorrow: openTasks.filter((task) => normalizeDate(getTaskDueDate(task)) === tomorrow),
      thisWeek: openTasks.filter((task) => {
        const dueDate = normalizeDate(getTaskDueDate(task));
        return dueDate && dueDate >= today && dueDate <= week;
      }),
    };
  }, [tasks]);

  const projects = useMemo(() => {
    const grouped = {};

    openTasks.forEach((task) => {
      const projectName = getTaskProject(task);
      const subProject = getTaskSubProject(task);

      if (!grouped[projectName]) {
        grouped[projectName] = {
          id: projectName,
          name: projectName,
          tasks: [],
          subProjects: new Set(),
          open: 0,
          complete: 0,
          overdue: 0,
          waiting: 0,
          high: 0,
        };
      }

      grouped[projectName].tasks.push(task);
      grouped[projectName].subProjects.add(subProject);
      grouped[projectName].open += 1;

      if (normalizeDate(getTaskDueDate(task)) && normalizeDate(getTaskDueDate(task)) < todayString()) grouped[projectName].overdue += 1;
      if ((task.status || "").toLowerCase().includes("wait")) grouped[projectName].waiting += 1;
      if (getTaskPriority(task).toLowerCase() === "high") grouped[projectName].high += 1;
    });

    return Object.values(grouped)
      .sort((a, b) => b.overdue - a.overdue || b.high - a.high || b.open - a.open)
      .slice(0, 8)
      .map((project) => {
        const status = project.overdue > 0 ? "Needs Attention" : project.waiting > 0 ? "Waiting" : "On Track";
        return {
          ...project,
          status,
          subProjectCount: Array.from(project.subProjects).filter(Boolean).length,
          subProjectList: Array.from(project.subProjects).filter(Boolean),
        };
      });
  }, [openTasks]);

  const waitingGroups = useMemo(() => {
    const waitingTasks = openTasks.filter((task) => (task.status || "").toLowerCase().includes("wait"));
    const map = {};

    waitingTasks.forEach((task) => {
      const key = task.waitingOn || task.assignedFrom || task.from || "Other";
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map).map(([label, count]) => ({ label, count }));
  }, [openTasks]);

  const greeting = useMemo(() => {
    const hour = now ? now.getHours() : 9;
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, [now]);

  const dateTime = now
    ? now.toLocaleString("en-CA", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const metrics = [
    { number: projects.length, label: "Active Projects", note: "Grouped from Tasks" },
    { number: waitingGroups.reduce((sum, item) => sum + item.count, 0), label: "Waiting On", note: "From task statuses" },
    { number: decisions.filter((d) => d.status !== "Approved").length, label: "Needs Your Input", note: "Approvals / Decisions" },
    { number: `${Math.max(70, 100 - due.overdue.length * 4)}%`, label: "Operations Health", note: due.overdue.length ? `${due.overdue.length} overdue` : "Everything on track" },
  ];

  function openDrawer(type, item) {
    setDrawer({ type, item });
    setDrawerTab("overview");
    setEditing(false);
    setDraft({});
  }

  function addTask(projectName = "", subProject = "General") {
    const newTask = {
      id: uid(),
      title: "New task",
      project: projectName || "General",
      subProject,
      dueDate: todayString(),
      priority: "Medium",
      status: "Open",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveTasks([...tasks, newTask]);
    openDrawer("task", newTask);
    setEditing(true);
    setDraft(newTask);
  }

  function renameProject(oldName, newName) {
    const clean = newName.trim();
    if (!clean || clean === oldName) return;

    const next = tasks.map((task) =>
      getTaskProject(task) === oldName ? { ...task, project: clean } : task
    );

    saveTasks(next);
  }

  function updateTask(id, patch) {
    const next = tasks.map((task) => (task.id === id ? { ...task, ...patch } : task));
    saveTasks(next);
    const updated = next.find((task) => task.id === id);
    if (updated) setDrawer({ type: "task", item: updated });
  }

  function addDecision() {
    const item = { id: uid(), title: "New decision", priority: "Medium", status: "Pending", note: "" };
    saveDecisions([...decisions, item]);
    openDrawer("decision", item);
    setEditing(true);
    setDraft(item);
  }

  function updateDecision(id, patch) {
    const next = decisions.map((item) => (item.id === id ? { ...item, ...patch } : item));
    saveDecisions(next);
    const updated = next.find((item) => item.id === id);
    if (updated) setDrawer({ type: "decision", item: updated });
  }

  function addNote() {
    const item = { id: uid(), text: "New note" };
    saveNotes([...notes, item]);
    openDrawer("note", item);
    setEditing(true);
    setDraft(item);
  }

  function approveDecision(decision) {
    updateDecision(decision.id, { status: "Approved" });
    addTask("Approvals");
  }

  function saveDrawerEdit() {
    if (!drawer) return;

    if (drawer.type === "task") updateTask(drawer.item.id, draft);
    if (drawer.type === "decision") updateDecision(drawer.item.id, draft);
    if (drawer.type === "note") {
      const next = notes.map((item) => (item.id === drawer.item.id ? { ...item, ...draft } : item));
      saveNotes(next);
      setDrawer({ type: "note", item: next.find((item) => item.id === drawer.item.id) });
    }

    setEditing(false);
  }

  function deleteDrawerItem() {
    if (!drawer) return;

    if (drawer.type === "task") saveTasks(tasks.filter((task) => task.id !== drawer.item.id));
    if (drawer.type === "decision") saveDecisions(decisions.filter((item) => item.id !== drawer.item.id));
    if (drawer.type === "note") saveNotes(notes.filter((item) => item.id !== drawer.item.id));

    setDrawer(null);
  }

  return (
    <div className="opsPage">
      <header className="hero">
        <div>
          <h1>{greeting}, Mark.</h1>
          <p>Here’s where everything stands.</p>
        </div>
        <div className="dateBlock">
          <div>{dateTime}</div>
          <small>Updated live from Tasks</small>
        </div>
      </header>

      <section className="board">
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
            <Panel title="Today’s Tasks" onAdd={() => addTask("Priorities")}>
              {due.today.slice(0, 4).map((task, index) => (
                <button className="priorityRow" key={task.id || index} onClick={() => openDrawer("task", task)}>
                  <span className="number">{index + 1}</span>
                  <div>
                    <strong>{getTaskTitle(task)}</strong>
                    <small>{getTaskProject(task)} · {getTaskPriority(task)}</small>
                  </div>
                </button>
              ))}
              {due.today.length === 0 && <EmptyLine text="No tasks due today." />}
              <button className="viewAllText" onClick={() => openDrawer("taskList", { title: "All Tasks", tasks: openTasks })}>
                View full task list →
              </button>
            </Panel>

            <Panel title="Waiting On">
              {(waitingGroups.length ? waitingGroups : [{ label: "None", count: 0 }]).map((item) => (
                <button className="simpleRow" key={item.label} onClick={() => openDrawer("waiting", item)}>
                  <span>{item.label}</span>
                  <b>{item.count}</b>
                </button>
              ))}
            </Panel>

            <Panel title="Notes" onAdd={addNote}>
              {notes.slice(0, 3).map((note) => (
                <button className="noteRow" key={note.id} onClick={() => openDrawer("note", note)}>
                  {note.text}
                </button>
              ))}
            </Panel>
          </div>

          <Panel title="Active Projects" className="projects" onAdd={() => addTask("New Project")}>
            {projects.length === 0 && <EmptyLine text="No projects yet. Add tasks with a project name to populate this section." />}

            {projects.map((project) => (
              <div className="projectRow bigProject" key={project.name} onClick={() => openDrawer("project", project)}>
                <div className="projectTop">
                  <EditableText
                    value={project.name}
                    className="bigProjectName"
                    onSave={(value) => renameProject(project.name, value)}
                  />
                  <span className={`pill ${getStatusClass(project.status)}`}>{project.status}</span>
                </div>

                <div className="projectStats">
                  <span><b>{project.open}</b> Open Tasks</span>
                  <span><b>{project.subProjectCount}</b> Sub Projects</span>
                  <span><b>{project.overdue}</b> Overdue</span>
                  <span><b>{project.waiting}</b> Waiting</span>
                </div>
              </div>
            ))}
          </Panel>

          <div className="rightStack">
            <Panel title="Task Timeline">
              <button className="timelineRow" onClick={() => openDrawer("taskList", { title: "Overdue", tasks: due.overdue })}>
                <span>Overdue</span><b className="danger">{due.overdue.length}</b>
              </button>
              <button className="timelineRow" onClick={() => openDrawer("taskList", { title: "Today", tasks: due.today })}>
                <span>Today</span><b>{due.today.length}</b>
              </button>
              <button className="timelineRow" onClick={() => openDrawer("taskList", { title: "Tomorrow", tasks: due.tomorrow })}>
                <span>Tomorrow</span><b>{due.tomorrow.length}</b>
              </button>
              <button className="timelineRow" onClick={() => openDrawer("taskList", { title: "This Week", tasks: due.thisWeek })}>
                <span>This Week</span><b>{due.thisWeek.length}</b>
              </button>
            </Panel>

            <Panel title="Needs Your Decision" onAdd={addDecision}>
              {decisions.slice(0, 4).map((decision) => (
                <div className="decisionItem" key={decision.id}>
                  <button className="decisionRow" onClick={() => openDrawer("decision", decision)}>
                    <span>{decision.title}</span>
                    <small className={decision.priority === "High" ? "danger" : ""}>
                      {decision.status === "Approved" ? "Approved" : decision.priority}
                    </small>
                  </button>
                  {decision.status !== "Approved" && <button className="approve" onClick={() => approveDecision(decision)}>✓</button>}
                </div>
              ))}
            </Panel>

            <Panel title="Inbox + Communication">
              <button className="commStatusRow" onClick={() => openDrawer("communication", { label: "Unread Messages", count: communications.unread, details: "Unread inbox messages" })}>
                <span>Unread messages</span><b>{communications.unread}</b>
              </button>
              <button className="commStatusRow" onClick={() => openDrawer("communication", { label: "Needs Review", count: communications.needsReview, details: "Messages ready for Mark review" })}>
                <span>Needs review</span><b>{communications.needsReview}</b>
              </button>
              <button className="commStatusRow" onClick={() => openDrawer("communication", { label: "Waiting Reply", count: communications.waitingReply, details: "Messages waiting on replies" })}>
                <span>Waiting reply</span><b>{communications.waitingReply}</b>
              </button>
              <button className="commStatusRow" onClick={() => openDrawer("communication", { label: "Dialpad", count: communications.dialpadMissed + communications.dialpadUnread, details: "Dialpad missed calls and unread texts" })}>
                <span>Dialpad</span><b>{communications.dialpadMissed + communications.dialpadUnread}</b>
              </button>
              <button className="viewAllText" onClick={() => openDrawer("communication", { label: "Communication Center", count: communications.unread + communications.needsReview + communications.waitingReply, details: "Inbox, review, waiting reply, and Dialpad summary" })}>
                View communication center →
              </button>
            </Panel>
          </div>
        </section>
      </section>

      {drawer && (
        <aside className="drawer">
          <button className="close" onClick={() => setDrawer(null)}>×</button>

          <h2>{getDrawerTitle(drawer)}</h2>
          <p>{getDrawerSubtitle(drawer)}</p>

          <div className="drawerActions">
            {["task", "decision", "note"].includes(drawer.type) && !editing && (
              <button onClick={() => { setDraft(drawer.item); setEditing(true); }}>Edit</button>
            )}
            {editing && (
              <>
                <button onClick={() => setEditing(false)}>Cancel</button>
                <button className="darkBtn" onClick={saveDrawerEdit}>Save</button>
              </>
            )}
            {["task", "decision", "note"].includes(drawer.type) && (
              <button onClick={deleteDrawerItem}>Delete</button>
            )}
          </div>

          <div className="tabs">
            {(drawer.type === "project" ? ["overview", "subprojects", "tasks", "files", "notes", "activity"] : ["overview", "tasks", "notes"]).map((tab) => (
              <button key={tab} className={drawerTab === tab ? "active" : ""} onClick={() => setDrawerTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {editing ? (
            <InlineEdit type={drawer.type} draft={draft} setDraft={setDraft} />
          ) : (
            <DrawerContent
              drawer={{ ...drawer, tab: drawerTab }}
              addTask={addTask}
              openTask={(task) => openDrawer("task", task)}
              updateTask={updateTask}
            />
          )}
        </aside>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        .opsPage {
          min-height: 100vh;
          background: #fbf8f1;
          color: #111827;
          padding: 24px 30px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow: hidden;
        }

        .hero {
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
          letter-spacing: -0.02em;
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
          color: #64748b;
          margin-top: 5px;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }

        .metric {
          min-height: 78px;
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 12px;
          padding: 14px 18px;
          text-align: left;
          cursor: pointer;
        }

        .metric:hover,
        .priorityRow:hover,
        .simpleRow:hover,
        .projectRow:hover,
        .timelineRow:hover,
        .decisionRow:hover,
        .commStatusRow:hover,
        .detailRow:hover {
          background: #faf4e9;
        }

        .metric strong {
          display: block;
          font-size: 24px;
          line-height: 1;
          margin-bottom: 6px;
          font-weight: 750;
        }

        .metric span {
          display: block;
          font-size: 13px;
          font-weight: 750;
          margin-bottom: 3px;
        }

        .metric small {
          display: block;
          color: #64748b;
          font-size: 11px;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(280px, 23%) minmax(760px, 54%) minmax(280px, 23%);
          gap: 12px;
          align-items: start;
          width: 100%;
        }

        .leftStack,
        .rightStack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .panel {
          width: 100%;
          background: #fffdf8;
          border: 1px solid #e5dccc;
          border-radius: 12px;
          padding: 14px;
        }

        .projects {
          min-height: calc(100vh - 230px);
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
        }

        .headActions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .headActions span {
          color: #64748b;
          font-size: 12px;
          cursor: pointer;
        }

        .addBtn {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          border: 1px solid #e5dccc;
          background: #fbf8f1;
          cursor: pointer;
          opacity: .75;
        }

        .addBtn:hover {
          opacity: 1;
          background: #f1ece3;
        }

        button { font: inherit; }

        .priorityRow,
        .simpleRow,
        .projectRow,
        .timelineRow,
        .decisionRow,
        .commStatusRow {
          width: 100%;
          border: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
          border-bottom: 1px solid #ebe2d4;
        }

        .priorityRow {
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 12px;
          padding: 12px 0;
          align-items: center;
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

        .priorityRow strong {
          display: block;
          font-size: 13px;
        }

        small {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-top: 3px;
        }

        .simpleRow,
        .timelineRow,
        .commStatusRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 11px 0;
          font-size: 13px;
        }

        .timelineRow b {
          font-size: 17px;
        }

        .simpleRow b,
        .commStatusRow b {
          font-size: 14px;
          font-weight: 750;
        }

        .bigProject {
          padding: 20px 0;
        }

        .projectTop {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
        }

        .bigProjectName {
          display: block;
          width: 100%;
          border: 0;
          background: transparent;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #111827;
          padding: 0;
          margin: 0;
        }

        .bigProjectName:focus,
        .editableInput:focus {
          outline: 1px solid #e5dccc;
          background: #fffaf0;
          border-radius: 6px;
        }

        .pill {
          background: #e7f3eb;
          color: #0f7a4b;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 11px;
          height: fit-content;
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

        .projectStats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 14px;
        }

        .projectStats span {
          border-left: 1px solid #e5dccc;
          padding-left: 10px;
          color: #475569;
          font-size: 12px;
        }

        .projectStats b {
          display: block;
          color: #111827;
          font-size: 17px;
          margin-bottom: 2px;
        }

        .decisionItem {
          display: grid;
          grid-template-columns: 1fr 28px;
          align-items: center;
          border-bottom: 1px solid #ebe2d4;
        }

        .decisionRow {
          border-bottom: 0;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 0;
          font-size: 12px;
        }

        .decisionRow small {
          font-size: 11px;
        }

        .approve {
          border: 1px solid #d7eadf;
          background: #f2fbf5;
          color: #0f7a4b;
          border-radius: 7px;
          height: 22px;
          width: 22px;
          cursor: pointer;
          font-size: 12px;
          padding: 0;
        }

        .viewAllText {
          width: 100%;
          border: 0;
          background: transparent;
          text-align: left;
          color: #475569;
          font-size: 12px;
          padding: 10px 0 2px;
          cursor: pointer;
        }

        .viewAllText:hover {
          color: #111827;
        }

        .danger {
          color: #dc2626 !important;
        }

        .emptyLine {
          color: #64748b;
          padding: 14px 0;
          font-size: 12px;
        }

        .drawer {
          position: fixed;
          inset: 0 0 0 auto;
          width: 500px;
          background: #fffdf8;
          border-left: 1px solid #e5dccc;
          box-shadow: -16px 0 40px rgba(0,0,0,.08);
          padding: 24px;
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
          font-weight: 400;
          font-size: 30px;
          margin: 0 0 8px;
          letter-spacing: -0.03em;
        }

        .tabs {
          display: flex;
          gap: 14px;
          border-bottom: 1px solid #e5dccc;
          margin: 20px 0;
          overflow-x: auto;
        }

        .tabs button {
          border: 0;
          background: transparent;
          padding: 8px 0;
          text-transform: capitalize;
          cursor: pointer;
          color: #475569;
          white-space: nowrap;
        }

        .tabs button.active {
          color: #111827;
          font-weight: 750;
          border-bottom: 2px solid #111827;
        }

        .drawerBox,
        .detailRow {
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

        .editableInput,
        .editableTextarea,
        .editableSelect {
          width: 100%;
          border: 0;
          background: transparent;
          font: inherit;
          color: #111827;
          padding: 3px;
        }

        .editableTextarea {
          resize: vertical;
          min-height: 60px;
        }

        .field {
          border: 1px solid #ebe2d4;
          background: #fbf8f1;
          border-radius: 10px;
          padding: 10px;
          margin-bottom: 9px;
        }

        .field label {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-bottom: 4px;
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

        .detailHead button,
        .detailActions button,
        .drawerActions button {
          border: 1px solid #e5dccc;
          background: #fbf8f1;
          border-radius: 8px;
          padding: 7px 10px;
          cursor: pointer;
        }

        .detailRow {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
        }

        .detailActions {
          display: flex;
          gap: 6px;
        }

        .drawerActions {
          display: flex;
          gap: 8px;
          margin: 16px 0;
          flex-wrap: wrap;
        }

        @media (max-width: 1200px) {
          .opsPage {
            overflow: auto;
          }

          .metrics,
          .layout {
            grid-template-columns: 1fr;
          }

          .projects {
            min-height: auto;
          }

          .drawer {
            width: min(500px, 100vw);
          }
        }
      `}</style>
    </div>
  );
}

function Panel({ title, children, onAdd, className = "" }) {
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

function EmptyLine({ text }) {
  return <div className="emptyLine">{text}</div>;
}

function InlineEdit({ type, draft, setDraft }) {
  const fields = fieldsForType(type);

  return (
    <div className="inlineForm">
      {fields.map((field) => (
        <div className="field" key={field.name}>
          <label>{field.label}</label>
          {field.type === "textarea" ? (
            <textarea rows={3} value={draft[field.name] || ""} onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })} />
          ) : field.type === "select" ? (
            <select value={draft[field.name] || field.options[0]} onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}>
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

function EditableText({ value, onSave, className = "" }) {
  const [draft, setDraft] = useState(value || "");

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  function save() {
    if (draft !== value) onSave(draft);
  }

  return (
    <input
      className={`editableInput ${className}`}
      value={draft}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}

function DrawerContent({ drawer, addTask, openTask, updateTask }) {
  if (drawer.type === "project") {
    const project = drawer.item;

    if (drawer.tab === "subprojects") {
      return (
        <>
          <div className="detailHead">
            <h3>Sub Projects</h3>
            <button onClick={() => addTask(project.name, "New Sub Project")}>+ Add Sub Project</button>
          </div>
          {(project.subProjectList || []).map((name) => {
            const subTasks = project.tasks.filter((task) => getTaskSubProject(task) === name);
            return (
              <button className="detailRow" key={name} onClick={() => addTask(project.name, name)}>
                <span>{name}</span>
                <small>{subTasks.length} task{subTasks.length === 1 ? "" : "s"}</small>
              </button>
            );
          })}
        </>
      );
    }

    if (drawer.tab === "tasks") {
      return <DetailTasks tasks={project.tasks} addTask={() => addTask(project.name)} openTask={openTask} />;
    }

    if (drawer.tab === "files") {
      return <DrawerBox label="Files" value="Files can be connected to Drive/Supabase next." />;
    }

    if (drawer.tab === "notes") {
      return <DrawerBox label="Notes" value="Project notes can be added in the next version." />;
    }

    if (drawer.tab === "activity") {
      return <DrawerBox label="Activity" value="Activity log can be connected next." />;
    }

    return (
      <>
        <DrawerBox label="Status" value={project.status} />
        <DrawerBox label="Open Tasks" value={project.open} />
        <DrawerBox label="Sub Projects" value={project.subProjectCount} />
        <DrawerBox label="Overdue" value={project.overdue} />
        <DrawerBox label="Waiting" value={project.waiting} />
      </>
    );
  }

  if (drawer.type === "taskList") {
    return (
      <>
        {(drawer.item.tasks || []).map((task) => (
          <button className="detailRow" key={task.id || getTaskTitle(task)} onClick={() => openTask(task)}>
            <span>{getTaskTitle(task)}</span>
            <small>{getTaskProject(task)}</small>
          </button>
        ))}
      </>
    );
  }

  if (drawer.type === "task") {
    return (
      <>
        <DrawerBox label="Project" value={getTaskProject(drawer.item)} />
        <DrawerBox label="Due" value={getTaskDueDate(drawer.item) || "No due date"} />
        <DrawerBox label="Priority" value={getTaskPriority(drawer.item)} />
        <DrawerBox label="Status" value={drawer.item.status || "Open"} />
      </>
    );
  }

  if (drawer.type === "decision") {
    return (
      <>
        <DrawerBox label="Priority" value={drawer.item.priority} />
        <DrawerBox label="Status" value={drawer.item.status} />
        <DrawerBox label="Note" value={drawer.item.note || "No note"} />
      </>
    );
  }

  if (drawer.type === "note") {
    return <DrawerBox label="Note" value={drawer.item.text} />;
  }

  if (drawer.type === "communication") {
    return (
      <>
        <DrawerBox label="Count" value={drawer.item.count || drawer.item.number || 0} />
        <DrawerBox label="Details" value={drawer.item.details || "Connect this to Outlook/Dialpad for live data."} />
        <DrawerBox label="Source" value="Placeholder until Outlook/Dialpad API connection is added" />
      </>
    );
  }

  if (drawer.type === "waiting") {
    return (
      <>
        <DrawerBox label="Count" value={drawer.item.count} />
        <DrawerBox label="Details" value={drawer.item.details || "No details"} />
      </>
    );
  }

  return (
    <>
      <DrawerBox label="Status" value={drawer.item.note || drawer.item.label || "Live"} />
    </>
  );
}

function DetailTasks({ tasks, addTask, openTask }) {
  return (
    <div>
      <div className="detailHead">
        <h3>Tasks Behind This</h3>
        <button onClick={addTask}>+ Add Task</button>
      </div>
      {tasks.map((task) => (
        <button className="detailRow" key={task.id || getTaskTitle(task)} onClick={() => openTask(task)}>
          <span>{getTaskTitle(task)}</span>
          <small>{getTaskPriority(task)}</small>
        </button>
      ))}
    </div>
  );
}

function DrawerBox({ label, value }) {
  return (
    <div className="drawerBox">
      <small>{label}</small>
      <strong>{String(value)}</strong>
    </div>
  );
}

function fieldsForType(type) {
  if (type === "task") {
    return [
      { name: "title", label: "Task Name" },
      { name: "project", label: "Project" },
      { name: "dueDate", label: "Due Date", type: "date" },
      { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"] },
      { name: "status", label: "Status", type: "select", options: ["Open", "Waiting", "In Progress", "Complete"] },
    ];
  }

  if (type === "decision") {
    return [
      { name: "title", label: "Decision" },
      { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"] },
      { name: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Declined", "Needs Changes"] },
      { name: "note", label: "Note", type: "textarea" },
    ];
  }

  if (type === "note") return [{ name: "text", label: "Note", type: "textarea" }];

  return [{ name: "label", label: "Label" }];
}

function getDrawerTitle(drawer) {
  if (drawer.type === "project") return drawer.item.name;
  if (drawer.type === "task") return getTaskTitle(drawer.item);
  if (drawer.type === "taskList") return drawer.item.title;
  if (drawer.item?.title) return drawer.item.title;
  if (drawer.item?.label) return drawer.item.label;
  return "Details";
}

function getDrawerSubtitle(drawer) {
  if (drawer.type === "project") return "Live project view built from your task list.";
  if (drawer.type === "task") return "This task is pulled from your main task list.";
  if (drawer.type === "taskList") return "Tasks filtered live from your task list.";
  return "Live executive status detail.";
}

function getStatusClass(status) {
  if (status === "Needs Attention" || status === "Behind" || status === "At Risk") return "behind";
  if (status === "Waiting") return "waiting";
  return "";
}
