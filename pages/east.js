import { useEffect, useMemo, useState } from "react";

const TASK_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pub?gid=1945000950&single=true&output=csv";
const TRADESHOW_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pub?gid=722935598&single=true&output=csv";
const COOP_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pub?gid=290340762&single=true&output=csv";

function googleSheetToCsvUrl(url) {
  if (!url) return "";

  if (url.includes("output=csv")) return url;

  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = url.match(/gid=([0-9]+)/);

  if (!idMatch) return url;

  const sheetId = idMatch[1];
  const gid = gidMatch ? gidMatch[1] : "0";

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

function parseCSV(text) {
  const rows = [];
  let current = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      current.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (value || current.length) {
        current.push(value.trim());
        rows.push(current);
        current = [];
        value = "";
      }
    } else {
      value += char;
    }
  }

  if (value || current.length) {
    current.push(value.trim());
    rows.push(current);
  }

  const cleanRows = rows.filter((row) => row.some((cell) => cell !== ""));
  const headers = cleanRows[0] || [];

  return cleanRows.slice(1).map((row) => {
    return headers.reduce((obj, header, index) => {
      obj[header || `Column ${index + 1}`] = row[index] || "";
      return obj;
    }, {});
  });
}

async function fetchSheet(url) {
  const csvUrl = googleSheetToCsvUrl(url);
  if (!csvUrl || !csvUrl.includes("http")) return [];

  const res = await fetch(csvUrl);
  const text = await res.text();

  if (text.trim().startsWith("<!DOCTYPE html") || text.includes("<html")) {
    console.error("This is still loading HTML, not CSV. Check sharing permissions.");
    return [];
  }

  return parseCSV(text);
}

export default function EastCommandCenter() {
  const [tasks, setTasks] = useState([]);
  const [tradeshows, setTradeshows] = useState([]);
  const [coopSpend, setCoopSpend] = useState([]);

  const [search, setSearch] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("All");
  const [hideCompleted, setHideCompleted] = useState(true);

  const [tradeshowsOpen, setTradeshowsOpen] = useState(false);
  const [coopOpen, setCoopOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setTasks(await fetchSheet(TASK_SHEET_URL));
      setTradeshows(await fetchSheet(TRADESHOW_SHEET_URL));
      setCoopSpend(await fetchSheet(COOP_SHEET_URL));
    }

    loadData();
  }, []);

  const completedTasks = tasks.filter((task) => {
    const status = `${task.Completed || task.Status || ""}`.toLowerCase();
    return ["true", "yes", "complete", "completed", "done"].includes(status);
  });

  const openTasks = tasks.filter((task) => !completedTasks.includes(task));

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const text = Object.values(task).join(" ").toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      const responsible =
        task.Responsible ||
        task.Owner ||
        task.Assigned ||
        task["Assigned To"] ||
        "";

      const matchesResponsible =
        responsibleFilter === "All" || responsible === responsibleFilter;

      const isCompleted = completedTasks.includes(task);
      const matchesCompleted = hideCompleted ? !isCompleted : true;

      return matchesSearch && matchesResponsible && matchesCompleted;
    });
  }, [tasks, search, responsibleFilter, hideCompleted]);

  const responsibleOptions = useMemo(() => {
    const names = tasks
      .map(
        (task) =>
          task.Responsible || task.Owner || task.Assigned || task["Assigned To"]
      )
      .filter(Boolean);

    return ["All", ...Array.from(new Set(names))];
  }, [tasks]);

  const progress =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <main className="east-page">
      <div className="east-shell">
        <div className="east-top">
          <div>
            <p className="east-eyebrow">GOOGLE SHEET SYNC</p>
            <h1>East Command Center</h1>
            <p className="east-subtitle">
              Tasks and tradeshow calendar pulled from Google Sheets.
            </p>
          </div>

          <div className="progress-card">
            <p>Progress</p>
            <strong>{progress}%</strong>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard label="Total Tasks" value={tasks.length} />
          <StatCard label="Open Tasks" value={openTasks.length} />
          <StatCard label="Completed" value={completedTasks.length} />
          <StatCard label="Showing" value={filteredTasks.length} />
        </div>

        <section className="filters-card">
          <div>
            <h3>Filters</h3>
            <p>Search, filter by responsible person, or hide completed tasks.</p>
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

            <label className="hide-pill">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
              />
              Hide completed
            </label>
          </div>
        </section>

        <CollapsibleCard
          title="Tradeshows"
          subtitle="This year at a glance · live formatted sheet view"
          open={tradeshowsOpen}
          setOpen={setTradeshowsOpen}
        >
          <SheetTable rows={tradeshows} />
        </CollapsibleCard>

        <CollapsibleCard
          title="Co-op Spend Tracker"
          subtitle="Dealer co-op spend pulled directly from Google Sheets"
          open={coopOpen}
          setOpen={setCoopOpen}
        >
          <SheetTable rows={coopSpend} />
        </CollapsibleCard>

        <CollapsibleCard
          title="East Task List"
          subtitle={`${filteredTasks.length} showing · ${openTasks.length} open · ${completedTasks.length} completed`}
          open={tasksOpen}
          setOpen={setTasksOpen}
        >
          <SheetTable rows={filteredTasks} />
        </CollapsibleCard>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          background: #f5f6f8;
        }

        .east-page {
          min-height: 100vh;
          background: #f5f6f8;
          color: #020617;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 26px 24px 80px;
        }

        .east-shell {
          width: 100%;
          max-width: 1220px;
          margin: 0 auto;
        }

        .east-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .east-eyebrow {
          margin: 0 0 12px;
          font-size: 10px;
          letter-spacing: 0.18em;
          font-weight: 600;
          color: #64748b;
        }

        .east-top h1 {
          margin: 0;
          font-size: 29px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .east-subtitle {
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
          grid-template-columns: 310px 140px 142px;
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

        .hide-pill {
          height: 34px;
          border-radius: 12px;
          border: 1px solid #cfd6df;
          background: #f8fafc;
          padding: 0 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
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

        .table-wrap {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
        }

        .sheet-table {
          width: 100%;
          border-collapse: collapse;
          background: #ffffff;
          font-size: 12px;
        }

        .sheet-table th {
          background: #f8fafc;
          color: #64748b;
          text-align: left;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 11px 12px;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .sheet-table td {
          padding: 12px;
          border-bottom: 1px solid #eef2f7;
          color: #0f172a;
          white-space: nowrap;
        }

        .sheet-table tr:last-child td {
          border-bottom: none;
        }

        .sheet-table tr:hover td {
          background: #fafafa;
        }

        .empty {
          margin: 0;
          padding: 10px 0;
          font-size: 12px;
          color: #64748b;
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

function SheetTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="empty">No sheet data loaded yet.</p>;
  }

  const headers = Object.keys(rows[0]);

  return (
    <div className="table-wrap">
      <table className="sheet-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
