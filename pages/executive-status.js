import { useEffect, useMemo, useState } from "react";

const TASKS_KEY = "os-tasks";
const PROJECT_META_KEY = "executive-project-meta-clean-v1";
const DECISIONS_KEY = "executive-decisions-clean-v1";
const COMMUNICATION_KEY = "executive-communication-clean-v1";

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const DEFAULT_DECISIONS = [
  { id: "d1", title: "Pricing Exception – MBJ Ranch", priority: "High", status: "Pending", note: "Approval needed before sending." },
  { id: "d2", title: "Dealer Approval – Seminole", priority: "Medium", status: "Pending", note: "Waiting for final review." },
];

const DEFAULT_COMMUNICATION = {
  unread: 7,
  needsReview: 3,
  waitingReply: 9,
  dialpad: 6,
};

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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function toISODate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

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

function getTaskStatus(task) {
  return task.status || (isTaskComplete(task) ? "Complete" : "Open");
}

export default function ExecutiveStatus() {
  const [now, setNow] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectMeta, setProjectMeta] = useState({});
  const [decisions, setDecisions] = useState(DEFAULT_DECISIONS);
  const [communication, setCommunication] = useState(DEFAULT_COMMUNICATION);
  const [drawer, setDrawer] = useState(null);
  const [tab, setTab] = useState("overview");

  function loadData() {
    setTasks(readJSON(TASKS_KEY, []));
    setProjectMeta(readJSON(PROJECT_META_KEY, {}));
    setDecisions(readJSON(DECISIONS_KEY, DEFAULT_DECISIONS));
    setCommunication(readJSON(COMMUNICATION_KEY, DEFAULT_COMMUNICATION));
  }

  useEffect(() => {
    setNow(new Date());
    loadData();

    const timer = setInterval(() => {
      setNow(new Date());
      loadData();
    }, 30000);

    const onStorage = () => loadData();
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

  function saveProjectMeta(next) {
    setProjectMeta(next);
    writeJSON(PROJECT_META_KEY, next);
  }

  function saveDecisions(next) {
    setDecisions(next);
    writeJSON(DECISIONS_KEY, next);
  }

  const openTasks = useMemo(() => tasks.filter((task) => !isTaskComplete(task)), [tasks]);

  const due = useMemo(() => {
    const today = todayISO();
    const tomorrow = addDaysISO(1);
    const week = addDaysISO(7);

    return {
      overdue: openTasks.filter((task) => {
        const dueDate = toISODate(getTaskDueDate(task));
        return dueDate && dueDate < today;
      }),
      today: openTasks.filter((task) => toISODate(getTaskDueDate(task)) === today),
      tomorrow: openTasks.filter((task) => toISODate(getTaskDueDate(task)) === tomorrow),
      thisWeek: openTasks.filter((task) => {
        const dueDate = toISODate(getTaskDueDate(task));
        return dueDate && dueDate >= today && dueDate <= week;
      }),
    };
  }, [openTasks]);

  const projects = useMemo(() => {
    const map = {};

    openTasks.forEach((task) => {
      const name = getTaskProject(task);
      const sub = getTaskSubProject(task);

      if (!map[name]) {
        map[name] = {
          id: name,
          name,
          tasks: [],
          subProjects: {},
          openTasks: 0,
          overdueTasks: 0,
          waitingTasks: 0,
          highTasks: 0,
        };
      }

      if (!map[name].subProjects[sub]) map[name].subProjects[sub] = [];

      map[name].tasks.push(task);
      map[name].subProjects[sub].push(task);
      map[name].openTasks += 1;

      if (toISODate(getTaskDueDate(task)) && toISODate(getTaskDueDate(task)) < todayISO()) map[name].overdueTasks += 1;
      if (String(getTaskStatus(task)).toLowerCase().includes("wait")) map[name].waitingTasks += 1;
      if (String(getTaskPriority(task)).toLowerCase() === "high") map[name].highTasks += 1;
    });

    Object.keys(projectMeta).forEach((name) => {
      if (!map[name]) {
        map[name] = {
          id: name,
          name,
          tasks: [],
          subProjects: {},
          openTasks: 0,
          overdueTasks: 0,
          waitingTasks: 0,
          highTasks: 0,
        };
      }
    });

    return Object.values(map)
      .map((project) => {
        const meta = projectMeta[project.name] || {};
        const taskSubs = Object.entries(project.subProjects).map(([name, subTasks]) => ({
          id: name,
          name,
          tasks: subTasks,
          openTasks: subTasks.length,
          overdueTasks: subTasks.filter((task) => toISODate(getTaskDueDate(task)) < todayISO()).length,
        }));

        const manualSubs = meta.subProjects || [];
        const subProjectList = [
          ...taskSubs,
          ...manualSubs.filter((manual) => !taskSubs.some((sub) => sub.name === manual.name)),
        ];

        const status =
          meta.status ||
          (project.overdueTasks > 0
            ? "Needs Attention"
            : project.waitingTasks > 0
            ? "Waiting"
            : "On Track");

        return {
          ...project,
          status,
          owner: meta.owner || "Nikita",
          targetDate: meta.targetDate || "",
          description: meta.description || "",
          subProjectList,
          files: meta.files || [],
          notes: meta.notes || [],
          activity: meta.activity || [],
        };
      })
      .sort((a, b) => b.overdueTasks - a.overdueTasks || b.highTasks - a.highTasks || b.openTasks - a.openTasks);
  }, [openTasks, projectMeta]);

  const waitingGroups = useMemo(() => {
    const map = {};
    openTasks
      .filter((task) => String(getTaskStatus(task)).toLowerCase().includes("wait"))
      .forEach((task) => {
        const label = task.waitingOn || task.assignedFrom || task.from || "Other";
        map[label] = (map[label] || 0) + 1;
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

  const health = Math.max(70, 100 - due.overdue.length * 4);
  const metrics = [
    { number: projects.length, label: "Active Projects", note: "Grouped from Tasks" },
    { number: waitingGroups.reduce((sum, item) => sum + item.count, 0), label: "Waiting On", note: "From task statuses" },
    { number: decisions.filter((d) => d.status !== "Approved").length, label: "Needs Your Input", note: "Approvals / Decisions" },
    { number: `${health}%`, label: "Operations Health", note: due.overdue.length ? `${due.overdue.length} overdue` : "Everything on track" },
  ];

  function openDrawer(type, item, startingTab = "overview") {
    setDrawer({ type, item });
    setTab(startingTab);
  }

  function updateTask(id, patch) {
    const next = tasks.map((task) => (task.id === id ? { ...task, ...patch } : task));
    saveTasks(next);

    if (drawer?.type === "task" && drawer.item.id === id) {
      setDrawer({ type: "task", item: next.find((task) => task.id === id) });
    }
  }

  function addTask(project = "General", subProject = "General") {
    const item = {
      id: uid(),
      title: "New task",
      project,
      subProject,
      dueDate: todayISO(),
      priority: "Medium",
      status: "Open",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveTasks([...tasks, item]);
    openDrawer("task", item);
  }

  function deleteTask(id) {
    saveTasks(tasks.filter((task) => task.id !== id));
    setDrawer(null);
  }

  function updateProject(projectName, patch) {
    saveProjectMeta({
      ...projectMeta,
      [projectName]: {
        ...(projectMeta[projectName] || {}),
        ...patch,
      },
    });
  }

  function renameProject(oldName, newName) {
    const clean = newName.trim();
    if (!clean || clean === oldName) return;

    const nextTasks = tasks.map((task) => (getTaskProject(task) === oldName ? { ...task, project: clean } : task));
    const nextMeta = { ...projectMeta };
    nextMeta[clean] = { ...(nextMeta[oldName] || {}) };
    delete nextMeta[oldName];

    saveTasks(nextTasks);
    saveProjectMeta(nextMeta);
    setDrawer(null);
  }

  function addProject() {
    let name = "New Project";
    let count = 1;

    while (projects.some((project) => project.name === name) || projectMeta[name]) {
      count += 1;
      name = `New Project ${count}`;
    }

    saveProjectMeta({
      ...projectMeta,
      [name]: {
        status: "On Track",
        owner: "Nikita",
        description: "",
        subProjects: [],
        files: [],
        notes: [],
        activity: [{ id: uid(), text: "Project created", time: "Just now" }],
      },
    });

    openDrawer("project", {
      id: name,
      name,
      status: "On Track",
      owner: "Nikita",
      description: "",
      openTasks: 0,
      overdueTasks: 0,
      waitingTasks: 0,
      highTasks: 0,
      subProjectList: [],
      tasks: [],
      files: [],
      notes: [],
      activity: [],
    }, "overview");
  }

  function addManualSubProject(projectName) {
    const meta = projectMeta[projectName] || {};
    updateProject(projectName, {
      subProjects: [...(meta.subProjects || []), { id: uid(), name: "New Sub Project", tasks: [] }],
    });
  }

  function updateManualSubProject(projectName, id, name) {
    const meta = projectMeta[projectName] || {};
    updateProject(projectName, {
      subProjects: (meta.subProjects || []).map((item) => (item.id === id ? { ...item, name } : item)),
    });
  }

  function deleteManualSubProject(projectName, id) {
    const meta = projectMeta[projectName] || {};
    updateProject(projectName, {
      subProjects: (meta.subProjects || []).filter((item) => item.id !== id),
    });
  }

  function addProjectDetail(projectName, field, item) {
    const meta = projectMeta[projectName] || {};
    updateProject(projectName, {
      [field]: [...(meta[field] || []), item],
    });
  }

  function updateProjectDetail(projectName, field, id, patch) {
    const meta = projectMeta[projectName] || {};
    updateProject(projectName, {
      [field]: (meta[field] || []).map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function deleteProjectDetail(projectName, field, id) {
    const meta = projectMeta[projectName] || {};
    updateProject(projectName, {
      [field]: (meta[field] || []).filter((item) => item.id !== id),
    });
  }

  function addDecision() {
    const item = { id: uid(), title: "New decision", priority: "Medium", status: "Pending", note: "" };
    saveDecisions([...decisions, item]);
    openDrawer("decision", item);
  }

  function updateDecision(id, patch) {
    const next = decisions.map((decision) => (decision.id === id ? { ...decision, ...patch } : decision));
    saveDecisions(next);

    if (drawer?.type === "decision" && drawer.item.id === id) {
      setDrawer({ type: "decision", item: next.find((decision) => decision.id === id) });
    }
  }

  function approveDecision(decision) {
    updateDecision(decision.id, { status: "Approved" });
    addTask("Approvals", "Approved Decisions");
  }

  function deleteDecision(id) {
    saveDecisions(decisions.filter((decision) => decision.id !== id));
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
          <small>Live from Tasks · refreshes every 30 sec</small>
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

          <Panel title="Inbox + Communication">
            <button className="commStatusRow" onClick={() => openDrawer("communication", { label: "Unread Messages", count: communication.unread })}>
              <span>Unread messages</span><b>{communication.unread}</b>
            </button>
            <button className="commStatusRow" onClick={() => openDrawer("communication", { label: "Needs Review", count: communication.needsReview })}>
              <span>Needs review</span><b>{communication.needsReview}</b>
            </button>
            <button className="commStatusRow" onClick={() => openDrawer("communication", { label: "Waiting Reply", count: communication.waitingReply })}>
              <span>Waiting reply</span><b>{communication.waitingReply}</b>
            </button>
            <button className="commStatusRow" onClick={() => openDrawer("communication", { label: "Dialpad", count: communication.dialpad })}>
              <span>Dialpad</span><b>{communication.dialpad}</b>
            </button>
          </Panel>
        </div>

        <Panel title="Active Projects" className="projects" onAdd={addProject}>
          {projects.length === 0 && <EmptyLine text="No projects yet. Add tasks with a project name to populate this section." />}

          {projects.map((project) => (
            <button className="projectRow" key={project.name} onClick={() => openDrawer("project", project, "overview")}>
              <div className="projectTop">
                <div>
                  <strong>{project.name}</strong>
                  <small>{project.subProjectList.slice(0, 3).map((sub) => sub.name).join(" · ") || "No sub projects yet"}</small>
                </div>
                <span className={`pill ${getStatusClass(project.status)}`}>{project.status}</span>
              </div>

              <div className="projectBar">
                <span>{project.openTasks} tasks</span>
                <span>{project.subProjectList.length} sub projects</span>
                <span>{project.overdueTasks} overdue</span>
              </div>
            </button>
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
        </div>
      </section>

      {drawer && (
        <aside className="drawer">
          <button className="close" onClick={() => setDrawer(null)}>×</button>

          <h2>{getDrawerTitle(drawer)}</h2>
          <p>{getDrawerSubtitle(drawer)}</p>

          <div className="tabs">
            {(drawer.type === "project"
              ? ["overview", "subprojects", "tasks", "files", "notes", "activity"]
              : ["overview", "tasks", "notes"]
            ).map((item) => (
              <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
                {item}
              </button>
            ))}
          </div>

          {drawer.type === "project" && (
            <ProjectDrawer
              project={drawer.item}
              tab={tab}
              updateProject={updateProject}
              addTask={addTask}
              openTask={(task) => openDrawer("task", task)}
              addManualSubProject={addManualSubProject}
              updateManualSubProject={updateManualSubProject}
              deleteManualSubProject={deleteManualSubProject}
              addProjectDetail={addProjectDetail}
              updateProjectDetail={updateProjectDetail}
              deleteProjectDetail={deleteProjectDetail}
            />
          )}

          {drawer.type === "task" && (
            <TaskDrawer task={drawer.item} updateTask={updateTask} deleteTask={deleteTask} />
          )}

          {drawer.type === "taskList" && (
            <TaskListDrawer tasks={drawer.item.tasks || []} openTask={(task) => openDrawer("task", task)} />
          )}

          {drawer.type === "decision" && (
            <DecisionDrawer
              decision={drawer.item}
              updateDecision={updateDecision}
              deleteDecision={deleteDecision}
              approveDecision={approveDecision}
            />
          )}

          {!["project", "task", "taskList", "decision"].includes(drawer.type) && (
            <GeneralDrawer item={drawer.item} type={drawer.type} />
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

        .priorityRow strong,
        .projectTop strong {
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

        .projectRow {
          padding: 16px 0;
        }

        .projectTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
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

        .projectBar {
          display: flex;
          gap: 16px;
          color: #64748b;
          font-size: 12px;
          margin-top: 10px;
        }

        .projectBar span {
          border-left: 1px solid #e5dccc;
          padding-left: 10px;
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


        /* ---- Cleaner compact polish ---- */
        .opsPage {
          padding: 18px 24px;
          font-size: 12px;
        }

        h1 {
          font-size: 24px;
          margin-bottom: 3px;
        }

        .hero {
          margin-bottom: 10px;
        }

        .dateBlock {
          font-size: 11px;
        }

        .dateBlock small {
          font-size: 10px;
        }

        .metrics {
          gap: 10px;
          margin-bottom: 10px;
        }

        .metric {
          min-height: 66px;
          padding: 11px 14px;
          border-radius: 10px;
        }

        .metric strong {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .metric span {
          font-size: 11px;
        }

        .metric small {
          font-size: 10px;
        }

        .layout {
          gap: 10px;
          grid-template-columns: minmax(280px, 23%) minmax(760px, 54%) minmax(280px, 23%);
        }

        .leftStack,
        .rightStack {
          gap: 10px;
        }

        .panel {
          padding: 11px;
          border-radius: 10px;
        }

        .panelHead {
          padding-bottom: 7px;
          margin-bottom: 6px;
        }

        .panelHead b {
          font-size: 12px;
        }

        .headActions span {
          font-size: 10px;
        }

        .addBtn {
          width: 20px;
          height: 20px;
        }

        .priorityRow {
          padding: 9px 0;
          grid-template-columns: 25px 1fr;
          gap: 9px;
        }

        .number {
          width: 23px;
          height: 23px;
          font-size: 10px;
        }

        .priorityRow strong,
        .projectTop strong {
          font-size: 12px;
        }

        small {
          font-size: 10px;
          margin-top: 2px;
        }

        .simpleRow,
        .timelineRow,
        .commStatusRow {
          padding: 8px 0;
          font-size: 12px;
        }

        .simpleRow b,
        .commStatusRow b,
        .timelineRow b {
          font-size: 13px;
        }

        .projectRow {
          padding: 11px 0;
        }

        .projectBar {
          margin-top: 7px;
          gap: 12px;
          font-size: 10px;
        }

        .pill {
          font-size: 10px;
          padding: 3px 7px;
        }

        .decisionRow {
          padding: 8px 0;
          font-size: 11px;
        }

        .decisionRow small {
          font-size: 10px;
        }

        .approve {
          width: 20px;
          height: 20px;
          font-size: 10px;
        }

        .drawer {
          width: 480px;
          padding: 22px;
        }

        h2 {
          font-size: 24px;
          margin-bottom: 6px;
        }

        .drawer p {
          font-size: 12px;
        }

        .tabs {
          margin: 18px 0 16px;
          gap: 14px;
        }

        .tabs button {
          font-size: 12px;
          padding: 7px 0;
        }

        /* Make drawer editing feel like clean inline editing, not a form */
        .field {
          border: 0;
          border-bottom: 1px solid #ebe2d4;
          background: transparent;
          border-radius: 0;
          padding: 9px 0;
          margin-bottom: 0;
        }

        .field label {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .editableInput,
        .editableTextarea,
        .editableSelect {
          border: 0 !important;
          outline: 0;
          background: transparent !important;
          padding: 0;
          font-size: 13px;
          line-height: 1.35;
          color: #111827;
          width: 100%;
        }

        .editableInput:focus,
        .editableTextarea:focus,
        .editableSelect:focus {
          outline: 0 !important;
          background: #fffaf0 !important;
          border-radius: 4px;
          box-shadow: inset 0 -1px 0 #111827;
        }

        .editableTextarea {
          min-height: 44px;
          resize: vertical;
        }

        .drawerActions {
          margin-top: 14px;
          gap: 6px;
        }

        .drawerActions button,
        .detailHead button,
        .detailActions button {
          font-size: 11px;
          padding: 6px 9px;
          border-radius: 7px;
        }

        .drawerActions button {
          color: #64748b;
        }

        .detailRow,
        .drawerBox {
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 7px;
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

function EditableText({ value, onSave }) {
  const [draft, setDraft] = useState(value || "");

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  return (
    <input
      className="editableInput"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== value) onSave(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}

function EditableArea({ value, onSave }) {
  const [draft, setDraft] = useState(value || "");

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  return (
    <textarea
      className="editableTextarea"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onSave(draft)}
    />
  );
}

function EditableSelect({ value, options, onSave }) {
  return (
    <select className="editableSelect" value={value || options[0]} onChange={(e) => onSave(e.target.value)}>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );
}

function ProjectDrawer({
  project,
  tab,
  updateProject,
  addTask,
  openTask,
  addManualSubProject,
  updateManualSubProject,
  deleteManualSubProject,
  addProjectDetail,
  updateProjectDetail,
  deleteProjectDetail,
}) {
  if (tab === "overview") {
    return (
      <>
        <div className="field">
          <label>Status</label>
          <EditableSelect value={project.status} options={["On Track", "Waiting", "Needs Attention", "Behind", "At Risk"]} onSave={(value) => updateProject(project.name, { status: value })} />
        </div>
        <div className="field">
          <label>Owner</label>
          <EditableText value={project.owner || "Nikita"} onSave={(value) => updateProject(project.name, { owner: value })} />
        </div>
        <div className="field">
          <label>Target Date</label>
          <EditableText value={project.targetDate || ""} onSave={(value) => updateProject(project.name, { targetDate: value })} />
        </div>
        <div className="field">
          <label>Project Note</label>
          <EditableArea value={project.description || ""} onSave={(value) => updateProject(project.name, { description: value })} />
        </div>
        <DrawerBox label="Open Tasks" value={project.openTasks} />
        <DrawerBox label="Overdue" value={project.overdueTasks} />
        <DrawerBox label="Waiting" value={project.waitingTasks} />
      </>
    );
  }

  if (tab === "subprojects") {
    return (
      <DetailList
        title="Sub Projects"
        items={project.subProjectList}
        onAdd={() => addManualSubProject(project.name)}
        primaryKey="name"
        updateItem={(id, patch) => updateManualSubProject(project.name, id, patch.name)}
        deleteItem={(id) => deleteManualSubProject(project.name, id)}
        onOpen={(item) => addTask(project.name, item.name)}
      />
    );
  }

  if (tab === "tasks") {
    return <TaskList tasks={project.tasks} onAdd={() => addTask(project.name)} openTask={openTask} />;
  }

  if (tab === "files") {
    return (
      <DetailList
        title="Files"
        items={project.files}
        onAdd={() => addProjectDetail(project.name, "files", { id: uid(), name: "New file", type: "File" })}
        primaryKey="name"
        secondaryKey="type"
        updateItem={(id, patch) => updateProjectDetail(project.name, "files", id, patch)}
        deleteItem={(id) => deleteProjectDetail(project.name, "files", id)}
      />
    );
  }

  if (tab === "notes") {
    return (
      <DetailList
        title="Notes"
        items={project.notes}
        onAdd={() => addProjectDetail(project.name, "notes", { id: uid(), text: "New note" })}
        primaryKey="text"
        updateItem={(id, patch) => updateProjectDetail(project.name, "notes", id, patch)}
        deleteItem={(id) => deleteProjectDetail(project.name, "notes", id)}
      />
    );
  }

  return (
    <DetailList
      title="Activity"
      items={project.activity}
      onAdd={() => addProjectDetail(project.name, "activity", { id: uid(), text: "New activity", time: "Just now" })}
      primaryKey="text"
      secondaryKey="time"
      updateItem={(id, patch) => updateProjectDetail(project.name, "activity", id, patch)}
      deleteItem={(id) => deleteProjectDetail(project.name, "activity", id)}
    />
  );
}

function TaskDrawer({ task, updateTask, deleteTask }) {
  return (
    <>
      <div className="field"><label>Task</label><EditableText value={getTaskTitle(task)} onSave={(value) => updateTask(task.id, { title: value })} /></div>
      <div className="field"><label>Project</label><EditableText value={getTaskProject(task)} onSave={(value) => updateTask(task.id, { project: value })} /></div>
      <div className="field"><label>Sub Project</label><EditableText value={getTaskSubProject(task)} onSave={(value) => updateTask(task.id, { subProject: value })} /></div>
      <div className="field"><label>Due Date</label><EditableText value={getTaskDueDate(task)} onSave={(value) => updateTask(task.id, { dueDate: value })} /></div>
      <div className="field"><label>Priority</label><EditableSelect value={getTaskPriority(task)} options={["High", "Medium", "Low"]} onSave={(value) => updateTask(task.id, { priority: value })} /></div>
      <div className="field"><label>Status</label><EditableSelect value={getTaskStatus(task)} options={["Open", "Waiting", "In Progress", "Complete"]} onSave={(value) => updateTask(task.id, { status: value, completed: value === "Complete" })} /></div>
      <div className="drawerActions"><button onClick={() => deleteTask(task.id)}>Delete</button></div>
    </>
  );
}

function TaskListDrawer({ tasks, openTask }) {
  return (
    <>
      {tasks.length === 0 && <EmptyLine text="No tasks here." />}
      {tasks.map((task) => (
        <button className="detailRow" key={task.id || getTaskTitle(task)} onClick={() => openTask(task)}>
          <span>{getTaskTitle(task)}</span>
          <small>{getTaskPriority(task)}</small>
        </button>
      ))}
    </>
  );
}

function DecisionDrawer({ decision, updateDecision, deleteDecision, approveDecision }) {
  return (
    <>
      <div className="field"><label>Decision</label><EditableText value={decision.title} onSave={(value) => updateDecision(decision.id, { title: value })} /></div>
      <div className="field"><label>Priority</label><EditableSelect value={decision.priority} options={["High", "Medium", "Low"]} onSave={(value) => updateDecision(decision.id, { priority: value })} /></div>
      <div className="field"><label>Status</label><EditableSelect value={decision.status} options={["Pending", "Approved", "Declined", "Needs Changes"]} onSave={(value) => updateDecision(decision.id, { status: value })} /></div>
      <div className="field"><label>Note</label><EditableArea value={decision.note || ""} onSave={(value) => updateDecision(decision.id, { note: value })} /></div>
      <div className="drawerActions">
        {decision.status !== "Approved" && <button onClick={() => approveDecision(decision)}>Approve</button>}
        <button onClick={() => deleteDecision(decision.id)}>Delete</button>
      </div>
    </>
  );
}

function GeneralDrawer({ item, type }) {
  return (
    <>
      <DrawerBox label="Status" value={item.note || item.details || item.label || "Live"} />
      {item.count !== undefined && <DrawerBox label="Count" value={item.count} />}
      {type === "communication" && <DrawerBox label="Automation" value="Connect Outlook/Dialpad later for true live counts." />}
    </>
  );
}

function TaskList({ tasks, onAdd, openTask }) {
  return (
    <>
      <div className="detailHead">
        <h3>Tasks</h3>
        <button onClick={onAdd}>+ Add Task</button>
      </div>
      {tasks.length === 0 && <EmptyLine text="No tasks yet." />}
      {tasks.map((task) => (
        <button className="detailRow" key={task.id || getTaskTitle(task)} onClick={() => openTask(task)}>
          <span>{getTaskTitle(task)}</span>
          <small>{getTaskPriority(task)}</small>
        </button>
      ))}
    </>
  );
}

function DetailList({ title, items, onAdd, primaryKey, secondaryKey, updateItem, deleteItem, onOpen }) {
  return (
    <>
      <div className="detailHead">
        <h3>{title}</h3>
        <button onClick={onAdd}>+ Add</button>
      </div>
      {items.length === 0 && <EmptyLine text={`No ${title.toLowerCase()} yet.`} />}
      {items.map((item) => (
        <div className="detailRow" key={item.id}>
          <div onClick={() => onOpen?.(item)}>
            <EditableText value={item[primaryKey] || ""} onSave={(value) => updateItem(item.id, { [primaryKey]: value })} />
            {secondaryKey && <EditableText value={item[secondaryKey] || ""} onSave={(value) => updateItem(item.id, { [secondaryKey]: value })} />}
          </div>
          <div className="detailActions">
            <button onClick={() => deleteItem(item.id)}>Delete</button>
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
      <strong>{String(value || "—")}</strong>
    </div>
  );
}

function getDrawerTitle(drawer) {
  if (drawer.type === "project") return drawer.item.name;
  if (drawer.type === "task") return getTaskTitle(drawer.item);
  if (drawer.type === "taskList") return drawer.item.title;
  if (drawer.type === "decision") return drawer.item.title;
  if (drawer.item?.label) return drawer.item.label;
  return "Details";
}

function getDrawerSubtitle(drawer) {
  if (drawer.type === "project") return "Project workspace with subprojects and tasks behind it.";
  if (drawer.type === "task") return "Pulled from your main task list.";
  if (drawer.type === "taskList") return "Filtered live from your task list.";
  if (drawer.type === "decision") return "Decision item that can create action for Nikita.";
  return "Live executive status detail.";
}

function getStatusClass(status) {
  if (status === "Needs Attention" || status === "Behind" || status === "At Risk") return "behind";
  if (status === "Waiting") return "waiting";
  return "";
}
