import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const TASK_SHEET_URL = "PASTE_YOUR_TASK_GOOGLE_SHEET_LINK_HERE";
const TRADESHOW_EMBED_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTxLHqcPcoYXmoe40mw9SDVR_bzwowBdwR96IQww0DmH_pmVXEw97t9H559AO1AuFtLYyG2KD9G1AxG/pubhtml?gid=1501568534&single=true";
const COOP_EMBED_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTxLHqcPcoYXmoe40mw9SDVR_bzwowBdwR96IQww0DmH_pmVXEw97t9H559AO1AuFtLYyG2KD9G1AxG/pubhtml?gid=263884969&single=true";
const DEALER_DIRECTORY_EMBED_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTxLHqcPcoYXmoe40mw9SDVR_bzwowBdwR96IQww0DmH_pmVXEw97t9H559AO1AuFtLYyG2KD9G1AxG/pubhtml?gid=348786358&single=true";
const SMALL_SALES_ORDERS_EMBED_URL = "PASTE_SMALL_SALES_ORDERS_EMBED_LINK_HERE";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function sheetToCsvUrl(url) {
  if (!url) return "";
  if (url.includes("format=csv") || url.includes("output=csv")) return url;

  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = url.match(/gid=([0-9]+)/);

  if (!idMatch) return url;

  return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv&gid=${
    gidMatch ? gidMatch[1] : "0"
  }`;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (cell || row.length) {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = "";
      }
      if (char === "\r" && next === "\n") i++;
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }

  const cleanRows = rows.filter((r) => r.some((c) => c !== ""));
  if (cleanRows.length < 2) return [];

  const headers = cleanRows[0].map((h, i) => h || `Column ${i + 1}`);

  return cleanRows
    .slice(1)
    .map((r) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = r[i] || "";
      });
      return obj;
    })
    .filter((task) => String(task.Task || "").trim() !== "");
}

function isCompleted(task) {
  const completedValue = String(
    task["Completed?"] ||
      task.Completed ||
      task.Complete ||
      task.Done ||
      task.Status ||
      ""
  )
    .trim()
    .toLowerCase();

  return [
    "true",
    "yes",
    "y",
    "done",
    "complete",
    "completed",
    "checked",
    "✓",
    "✔",
  ].includes(completedValue);
}

async function fetchTasks(url) {
  if (!url || !url.includes("http")) return [];

  const res = await fetch(sheetToCsvUrl(url));
  const text = await res.text();

  if (text.includes("<html") || text.includes("<!DOCTYPE")) {
    console.error("Task sheet is loading HTML, not CSV.");
    return [];
  }

  return parseCSV(text);
}

export default function SouthCommandCenter() {
  const [tasks, setTasks] = useState([]);
  const [southTasks, setSouthTasks] = useState([]);
  const [southTasksLoading, setSouthTasksLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("All");
  const [showCompletedSouthTasks, setShowCompletedSouthTasks] = useState(false);

  const [tasksOpen, setTasksOpen] = useState(true);
  const [tradeshowsOpen, setTradeshowsOpen] = useState(false);
  const [coopOpen, setCoopOpen] = useState(false);
  const [dealerDirectoryOpen, setDealerDirectoryOpen] = useState(false);
  const [smallSalesOrdersOpen, setSmallSalesOrdersOpen] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      const data = await fetchTasks(TASK_SHEET_URL);
      setTasks(data);
    }

    loadTasks();
    fetchSouthTasks();
  }, []);

  async function fetchSouthTasks() {
    setSouthTasksLoading(true);

    const { data, error } = await supabase
      .from("Task List")
      .select("*")
      .eq("territory", "South")
      .order("completed", { ascending: true })
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error loading South tasks:", error);
      setSouthTasks([]);
    } else {
      setSouthTasks(data || []);
    }

    setSouthTasksLoading(false);
  }

  async function toggleSouthTaskComplete(task) {
    const { error } = await supabase
      .from("Task List")
      .update({ completed: !task.completed })
      .eq("id", task.id);

    if (error) {
      console.error("Error updating South task:", error);
      return;
    }

    fetchSouthTasks();
  }

  const completedTasks = tasks.filter(isCompleted);
  const openTasks = tasks.filter((task) => !isCompleted(task));

  const openSouthTasks = southTasks.filter((task) => !task.completed);
  const completedSouthTasks = southTasks.filter((task) => task.completed);

  const responsibleOptions = useMemo(() => {
    const sheetNames = openTasks
      .map(
        (task) =>
          task.Responsible ||
          task.Owner ||
          task.Assigned ||
          task["Assigned To"] ||
          ""
      )
      .filter(Boolean);

    const ticktickNames = openSouthTasks
      .map((task) => task.assigned_to || "")
      .filter(Boolean);

    return ["All", ...Array.from(new Set([...sheetNames, ...ticktickNames]))];
  }, [openTasks, openSouthTasks]);

  const filteredSouthTasks = useMemo(() => {
    return southTasks.filter((task) => {
      if (!showCompletedSouthTasks && task.completed) return false;

      const text = [
        task.task,
        task.assigned_to,
        task.priority,
        task.source,
        task.status,
        task.due_date,
      ]
        .join(" ")
        .toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (responsibleFilter === "All" || task.assigned_to === responsibleFilter)
      );
    });
  }, [southTasks, search, responsibleFilter, showCompletedSouthTasks]);

  const totalTaskCount = tasks.length + southTasks.length;
  const totalCompletedCount = completedTasks.length + completedSouthTasks.length;
  const totalOpenCount = openTasks.length + openSouthTasks.length;

  const progress =
    totalTaskCount > 0
      ? Math.round((totalCompletedCount / totalTaskCount) * 100)
      : 0;

  return (
    <main className="south-page">
      <div className="south-shell">
        <div className="south-top">
          <div>
            <p className="eyebrow">GOOGLE SHEET SYNC</p>
            <h1>South Command Center</h1>
            <p className="subtitle">
              South territory operations, tracking, and execution pulled from Google Sheets and TickTick.
            </p>
          </div>

          <div className="progress-card">
            <p>Progress</p>
            <strong>{progress}%</strong>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard label="Total Tasks" value={totalTaskCount} />
          <StatCard label="Open Tasks" value={totalOpenCount} />
          <StatCard label="Completed" value={totalCompletedCount} />
          <StatCard label="Showing" value={filteredSouthTasks.length} />
        </div>

        <section className="filters-card">
          <div>
            <h3>Filters</h3>
            <p>
              South tasks sync from TickTick. Completed tasks are hidden unless turned on.
            </p>
          </div>

          <div className="filters-right">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search task, dealer, responsible..."
            />

            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
            >
              {responsibleOptions.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
        </section>

        <SheetEmbedCard
          title="Tradeshows"
          subtitle="This year at a glance · live formatted sheet view"
          open={tradeshowsOpen}
          setOpen={setTradeshowsOpen}
          url={TRADESHOW_EMBED_URL}
        />

        <SheetEmbedCard
          title="Co-op Spend Tracker"
          subtitle="Dealer co-op spend pulled directly from Google Sheets"
          open={coopOpen}
          setOpen={setCoopOpen}
          url={COOP_EMBED_URL}
        />

        <SheetEmbedCard
          title="Dealer Directory"
          subtitle="Dealer contacts and key details pulled directly from Google Sheets"
          open={dealerDirectoryOpen}
          setOpen={setDealerDirectoryOpen}
          url={DEALER_DIRECTORY_EMBED_URL}
        />

        <SheetEmbedCard
          title="Small Sales Orders"
          subtitle="Small sales order tracking pulled directly from Google Sheets"
          open={smallSalesOrdersOpen}
          setOpen={setSmallSalesOrdersOpen}
          url={SMALL_SALES_ORDERS_EMBED_URL}
        />

        <CollapsibleCard
          title="South Task List"
          subtitle={`${openSouthTasks.length} open TickTick tasks · ${completedSouthTasks.length} completed hidden`}
          open={tasksOpen}
          setOpen={setTasksOpen}
        >
          <div className="task-actions">
            <button
              className="secondary-pill"
              onClick={() => setShowCompletedSouthTasks(!showCompletedSouthTasks)}
            >
              {showCompletedSouthTasks ? "Hide Completed" : "Show Completed"}
            </button>

            <button className="secondary-pill" onClick={fetchSouthTasks}>
              Refresh
            </button>
          </div>

          <SouthTaskList
            rows={filteredSouthTasks}
            loading={southTasksLoading}
            toggleComplete={toggleSouthTaskComplete}
          />
        </CollapsibleCard>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          background: #f5f6f8;
        }

        .south-page {
          min-height: 100vh;
          background: #f5f6f8;
          color: #020617;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 26px 24px 80px;
        }

        .south-shell {
          width: 100%;
          max-width: 1220px;
          margin: 0 auto;
        }

        .south-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .eyebrow {
          margin: 0 0 12px;
          font-size: 10px;
          letter-spacing: 0.18em;
          font-weight: 600;
          color: #64748b;
        }

        h1 {
          margin: 0;
          font-size: 29px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .subtitle {
          margin: 10px 0 0;
          font-size: 12px;
          color: #475569;
        }

        .progress-card,
        .stat-card,
        .filters-card,
        .section-card {
          background: #ffffff;
          border: 1px solid #dfe3ea;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.045);
        }

        .progress-card {
          width: 150px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .progress-card p {
          margin: 0 0 6px;
          font-size: 10px;
          color: #64748b;
        }

        .progress-card strong {
          font-size: 26px;
          line-height: 1;
          font-weight: 800;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }

        .stat-card {
          padding: 20px 18px;
          min-height: 78px;
        }

        .stat-card p {
          margin: 0 0 8px;
          font-size: 11px;
          color: #64748b;
        }

        .stat-card strong {
          font-size: 26px;
          font-weight: 800;
          line-height: 1;
        }

        .filters-card {
          min-height: 66px;
          padding: 16px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 18px;
        }

        .filters-card h3 {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 800;
        }

        .filters-card p {
          margin: 0;
          font-size: 12px;
          color: #475569;
        }

        .filters-right {
          display: grid;
          grid-template-columns: 310px 140px;
          gap: 10px;
          align-items: center;
        }

        .filters-right input,
        .filters-right select {
          height: 34px;
          border-radius: 10px;
          border: 1px solid #cfd6df;
          background: #f8fafc;
          padding: 0 12px;
          font-size: 12px;
          color: #020617;
          outline: none;
        }

        .section-card {
          margin-bottom: 18px;
          overflow: hidden;
          width: 100%;
        }

        .section-header {
          width: 100%;
          min-height: 82px;
          padding: 18px;
          background: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
        }

        .section-header h3 {
          margin: 0 0 7px;
          font-size: 14px;
          font-weight: 800;
          color: #020617;
        }

        .section-header p {
          margin: 0;
          font-size: 12px;
          color: #475569;
        }

        .open-btn {
          background: #020617;
          color: #ffffff;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 11px;
          font-weight: 800;
          min-width: 48px;
          text-align: center;
        }

        .section-body {
          padding: 0 18px 18px;
        }

        .sheet-frame {
          width: 100%;
          height: 520px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          background: #ffffff;
        }

        .task-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 12px;
        }

        .secondary-pill {
          border: 1px solid #d8dee8;
          background: #f8fafc;
          color: #020617;
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .south-task-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .south-task-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border: 1px solid #e5e9ef;
          border-radius: 14px;
          background: #f8fafc;
        }

        .south-task-item:hover {
          background: #ffffff;
        }

        .south-task-item.done {
          opacity: 0.55;
        }

        .tiny-check {
          width: 21px;
          height: 21px;
          border-radius: 999px;
          border: 1px solid #ccd3dd;
          background: #ffffff;
          font-size: 11px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .south-task-main {
          flex: 1;
          min-width: 0;
        }

        .south-task-top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
        }

        .south-task-name {
          font-size: 13px;
          line-height: 1.4;
          font-weight: 550;
          color: #061229;
        }

        .south-task-item.done .south-task-name {
          text-decoration: line-through;
          color: #7a8494;
        }

        .south-task-badges {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          flex-wrap: wrap;
        }

        .person-badge,
        .source-badge,
        .priority-badge,
        .status-badge {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid #dce2ea;
          background: #ffffff;
          color: #3f4754;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-badge {
          background: #f3f6fa;
          color: #334155;
          border-color: #dbe3ef;
        }

        .source-badge {
          background: #eef2f7;
        }

        .priority-badge.high {
          background: #fff1f0;
          color: #9f1d1d;
          border-color: #ffd4d4;
        }

        .priority-badge.medium {
          background: #fff8e6;
          color: #8a6500;
          border-color: #f3df9b;
        }

        .priority-badge.low {
          background: #edf8ef;
          color: #2f6b3b;
          border-color: #cde8d2;
        }

        .south-task-meta {
          margin-top: 7px;
          font-size: 11px;
          color: #7a8494;
        }

        .empty {
          margin: 0;
          padding: 14px;
          font-size: 12px;
          color: #64748b;
        }

        @media (max-width: 850px) {
          .south-top,
          .filters-card {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-right {
            width: 100%;
            grid-template-columns: 1fr;
          }

          .progress-card {
            width: 100%;
          }

          .south-task-top {
            flex-direction: column;
          }

          .south-task-badges {
            justify-content: flex-start;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function CollapsibleCard({ title, subtitle, open, setOpen, children }) {
  return (
    <section className="section-card">
      <button className="section-header" onClick={() => setOpen(!open)}>
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="open-btn">{open ? "Close" : "Open"}</span>
      </button>

      {open && <div className="section-body">{children}</div>}
    </section>
  );
}

function SheetEmbedCard({ title, subtitle, open, setOpen, url }) {
  return (
    <CollapsibleCard title={title} subtitle={subtitle} open={open} setOpen={setOpen}>
      {url && url.includes("http") ? (
        <iframe className="sheet-frame" src={url} />
      ) : (
        <p className="empty">Add your published Google Sheet embed link.</p>
      )}
    </CollapsibleCard>
  );
}

function SouthTaskList({ rows, loading, toggleComplete }) {
  if (loading) {
    return <p className="empty">Loading South tasks...</p>;
  }

  if (!rows || rows.length === 0) {
    return <p className="empty">No open tasks showing.</p>;
  }

  return (
    <div className="south-task-list">
      {rows.map((task) => (
        <div
          key={task.id}
          className={`south-task-item ${task.completed ? "done" : ""}`}
        >
          <button className="tiny-check" onClick={() => toggleComplete(task)}>
            {task.completed ? "✓" : ""}
          </button>

          <div className="south-task-main">
            <div className="south-task-top">
              <span className="south-task-name">
                {task.task || "Untitled Task"}
              </span>

              <div className="south-task-badges">
                {task.status && (
                  <span className="status-badge">{task.status}</span>
                )}

                {task.assigned_to && (
                  <span className="person-badge">{task.assigned_to}</span>
                )}

                {task.source === "ticktick" && (
                  <span className="source-badge">TickTick</span>
                )}

                {task.priority && (
                  <span
                    className={`priority-badge ${String(
                      task.priority
                    ).toLowerCase()}`}
                  >
                    {task.priority}
                  </span>
                )}
              </div>
            </div>

            <div className="south-task-meta">
              {task.due_date ? `Due: ${task.due_date}` : "No due date"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
