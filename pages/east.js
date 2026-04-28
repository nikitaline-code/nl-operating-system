import { useEffect, useMemo, useState } from "react";

const GOOGLE_SHEET_CSV_URL = "PASTE_YOUR_GOOGLE_SHEET_CSV_LINK_HERE";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
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
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows;
}

export default function EastPage() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSheet() {
      try {
        const res = await fetch(GOOGLE_SHEET_CSV_URL);
        const text = await res.text();

        const rows = parseCSV(text);
        const headers = rows[0].map((h) => h.toLowerCase().trim());

        const getIndex = (...names) =>
          names
            .map((name) => headers.indexOf(name.toLowerCase()))
            .find((index) => index !== -1);

        const taskIndex = getIndex("task name", "task", "item");
        const dealerIndex = getIndex("dealer name", "dealer", "account");
        const responsibleIndex = getIndex("responsible", "who", "owner");
        const dueDateIndex = getIndex("due date", "date", "deadline");
        const completedIndex = getIndex("completed", "complete", "done");

        const parsed = rows.slice(1).map((row, index) => ({
          id: index + 1,
          taskName: row[taskIndex] || "",
          dealerName: row[dealerIndex] || "",
          responsible: row[responsibleIndex] || "",
          dueDate: row[dueDateIndex] || "",
          completed:
            String(row[completedIndex] || "").toLowerCase().trim() === "true" ||
            String(row[completedIndex] || "").toLowerCase().trim() === "yes" ||
            String(row[completedIndex] || "").toLowerCase().trim() === "complete",
        }));

        setTasks(parsed.filter((task) => task.taskName || task.dealerName));
      } catch (error) {
        console.error("Could not load Google Sheet:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSheet();
  }, []);

  const responsibleOptions = useMemo(() => {
    const names = tasks
      .map((task) => task.responsible)
      .filter(Boolean);

    return ["All", ...new Set(names)];
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = `${task.taskName} ${task.dealerName} ${task.responsible} ${task.dueDate}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesResponsible =
        responsibleFilter === "All" || task.responsible === responsibleFilter;

      return matchesSearch && matchesResponsible;
    });
  }, [tasks, search, responsibleFilter]);

  const completedCount = visibleTasks.filter((task) => task.completed).length;
  const progress = visibleTasks.length
    ? Math.round((completedCount / visibleTasks.length) * 100)
    : 0;

  return (
    <div className="page">
      <div className="shell">
        <header className="topHeader">
          <div>
            <p className="eyebrow">Google Sheet Sync</p>
            <h1>East</h1>
            <p className="subtext">
              Task list pulled from your Google Sheet.
            </p>
          </div>

          <div className="progressCard">
            <span>Progress</span>
            <strong>{progress}%</strong>
          </div>
        </header>

        <section className="toolbarCard">
          <div>
            <h2>East Task List</h2>
            <p>{visibleTasks.length} tasks showing · {completedCount} completed</p>
          </div>

          <div className="filters">
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

        <section className="card">
          {loading ? (
            <div className="emptyState">Loading Google Sheet...</div>
          ) : visibleTasks.length === 0 ? (
            <div className="emptyState">
              No tasks showing. Check your Google Sheet headers.
            </div>
          ) : (
            <div className="taskTable">
              <div className="tableHeader">
                <span>Task Name</span>
                <span>Dealer Name</span>
                <span>Responsible</span>
                <span>Due Date</span>
                <span>Completed</span>
              </div>

              {visibleTasks.map((task) => (
                <div
                  className={`taskRow ${task.completed ? "completed" : ""}`}
                  key={task.id}
                >
                  <span className="taskName">{task.taskName}</span>
                  <span>{task.dealerName}</span>
                  <span>{task.responsible}</span>
                  <span>{task.dueDate}</span>
                  <span>
                    <span className={`checkBadge ${task.completed ? "done" : ""}`}>
                      {task.completed ? "✓" : ""}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f6f8;
          color: #111;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 32px;
        }

        .shell {
          max-width: 1380px;
          margin: 0 auto;
        }

        .topHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .eyebrow {
          margin: 0 0 7px;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6b7280;
        }

        h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.05em;
        }

        h2 {
          margin: 0;
          font-size: 15px;
        }

        p {
          margin: 5px 0 0;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }

        .progressCard,
        .toolbarCard,
        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
        }

        .progressCard {
          padding: 14px 18px;
          min-width: 130px;
          text-align: right;
        }

        .progressCard span {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .progressCard strong {
          font-size: 28px;
        }

        .toolbarCard {
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr 520px;
          gap: 16px;
          align-items: center;
          margin-bottom: 16px;
        }

        .filters {
          display: grid;
          grid-template-columns: 1fr 160px;
          gap: 10px;
        }

        input,
        select {
          width: 100%;
          border: 1px solid #e5e7eb;
          background: #f8f9fb;
          border-radius: 14px;
          padding: 10px 12px;
          font-size: 13px;
          color: #111;
          outline: none;
          box-sizing: border-box;
        }

        input:focus,
        select:focus {
          background: #fff;
          border-color: #111;
        }

        .card {
          padding: 18px;
        }

        .taskTable {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .tableHeader,
        .taskRow {
          display: grid;
          grid-template-columns: 1.6fr 1.2fr 1fr 0.8fr 90px;
          gap: 12px;
          align-items: center;
        }

        .tableHeader {
          padding: 0 12px 8px;
          font-size: 10px;
          color: #777;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 800;
        }

        .taskRow {
          background: #fafafa;
          border: 1px solid #eceef2;
          border-radius: 14px;
          padding: 12px;
          font-size: 13px;
        }

        .taskRow.completed {
          opacity: 0.65;
        }

        .taskRow.completed .taskName {
          text-decoration: line-through;
        }

        .taskName {
          font-weight: 700;
        }

        .checkBadge {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
        }

        .checkBadge.done {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .emptyState {
          padding: 28px;
          text-align: center;
          color: #777;
          font-size: 13px;
          border: 1px dashed #d1d5db;
          border-radius: 16px;
          background: #fafafa;
        }

        @media (max-width: 1050px) {
          .topHeader,
          .toolbarCard {
            grid-template-columns: 1fr;
            flex-direction: column;
          }

          .filters,
          .tableHeader,
          .taskRow {
            grid-template-columns: 1fr;
          }

          .progressCard {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}
