import { useEffect, useMemo, useState } from "react";

const TASK_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pubhtml?gid=1945000950&single=true";
const TRADESHOW_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pubhtml?gid=722935598&single=true";
const COOP_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pubhtml?gid=290340762&single=true";

function parseCSV(text) {
  const rows = text.trim().split("\n");
  const headers = rows[0].split(",").map((h) => h.trim());

  return rows.slice(1).map((row) => {
    const values = row.split(",").map((v) => v.trim());
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] || "";
      return acc;
    }, {});
  });
}

async function fetchSheet(url) {
  if (!url || !url.includes("http")) return [];
  const res = await fetch(url);
  const text = await res.text();
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
  const [tasksOpen, setTasksOpen] = useState(false);
  const [coopOpen, setCoopOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setTasks(await fetchSheet(TASK_SHEET_CSV_URL));
      setTradeshows(await fetchSheet(TRADESHOW_SHEET_CSV_URL));
      setCoopSpend(await fetchSheet(COOP_SHEET_CSV_URL));
    }

    loadData();
  }, []);

  const completedTasks = tasks.filter((task) => {
    const value = `${task.Completed || task.Status || ""}`.toLowerCase();
    return value === "true" || value === "yes" || value === "complete" || value === "completed";
  });

  const openTasks = tasks.filter((task) => !completedTasks.includes(task));

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchable = Object.values(task).join(" ").toLowerCase();
      const matchesSearch = searchable.includes(search.toLowerCase());

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
      .map((task) => task.Responsible || task.Owner || task.Assigned || task["Assigned To"])
      .filter(Boolean);

    return ["All", ...Array.from(new Set(names))];
  }, [tasks]);

  const progress =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <main className="page">
      <div className="shell">
        <div className="top-row">
          <div>
            <p className="eyebrow">GOOGLE SHEET SYNC</p>
            <h1>East Command Center</h1>
            <p className="subtitle">
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

        <section className="filter-card">
          <div>
            <h3>Filters</h3>
            <p>Search, filter by responsible person, or hide completed tasks.</p>
          </div>

          <div className="filter-controls">
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

            <label className="check-pill">
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

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f4f5f7;
          color: #020617;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 28px 24px 80px;
        }

        .shell {
          width: 100%;
          max-width: 1220px;
          margin: 0 auto;
        }

        .top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: 10px;
          letter-spacing: 0.18em;
          color: #64748b;
          font-weight: 600;
        }

        h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .subtitle {
          margin: 10px 0 0;
          font-size: 12px;
          color: #475569;
        }

        .progress-card {
          width: 150px;
          height: 76px;
          border-radius: 20px;
          background: #fff;
          border: 1px solid #dfe3ea;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
        }

        .progress-card p {
          margin: 0 0 6px;
          font-size: 10px;
          color: #64748b;
        }

        .progress-card strong {
          font-size: 26px;
          line-height: 1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }

        .stat-card,
        .filter-card,
        .section-card {
          background: #fff;
          border: 1px solid #dfe3ea;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.045);
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
          line-height: 1;
          font-weight: 800;
        }

        .filter-card {
          min-height: 66px;
          padding: 16px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 18px;
        }

        .filter-card h3 {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 800;
        }

        .filter-card p {
          margin: 0;
          font-size: 12px;
          color: #475569;
        }

        .filter-controls {
          display: grid;
          grid-template-columns: 310px 140px 142px;
          gap: 10px;
          align-items: center;
        }

        input,
        select {
          height: 34px;
          border-radius: 10px;
          border: 1px solid #cfd6df;
          background: #f8fafc;
          padding: 0 12px;
          font-size: 12px;
          outline: none;
          color: #020617;
        }

        .check-pill {
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
        }

        .section-header {
          width: 100%;
          min-height: 82px;
          padding: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 0;
          background: #fff;
          cursor: pointer;
          text-align: left;
        }

        .section-header h3 {
          margin: 0 0 7px;
          font-size: 14px;
          font-weight: 800;
        }

        .section-header p {
          margin: 0;
          font-size: 12px;
          color: #475569;
        }

        .open-btn {
          background: #020617;
          color: #fff;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 11px;
          font-weight: 800;
        }

        .section-body {
          padding: 0 18px 18px;
        }

        .table-wrap {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          background: #fff;
        }

        th {
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

        td {
          padding: 12px;
          border-bottom: 1px solid #eef2f7;
          color: #0f172a;
          white-space: nowrap;
        }

        tr:last-child td {
          border-bottom: 0;
        }

        tr:hover td {
          background: #fafafa;
        }

        .empty {
          margin: 0;
          padding: 10px 0;
          font-size: 12px;
          color: #64748b;
        }

        @media (max-width: 900px) {
          .top-row,
          .filter-card {
            flex-direction: column;
          }

          .progress-card {
            align-self: flex-start;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filter-controls {
            width: 100%;
            grid-template-columns: 1fr;
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

function SheetTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="empty">No sheet data loaded yet.</p>;
  }

  const headers = Object.keys(rows[0]);

  return (
    <div className="table-wrap">
      <table>
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
