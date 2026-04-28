import { useEffect, useMemo, useState } from "react";

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pub?gid=1945000950&single=true&output=csv";

const TRADESHOW_EMBED_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pubhtml?gid=722935598&single=true";

function parseCSV(text) {
  const delimiter = text.includes("\t") ? "\t" : ",";

  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((row) =>
      row
        .split(delimiter)
        .map((cell) => cell.replace(/^"|"$/g, "").trim())
    );
}

function isCompleted(value) {
  return [
    "true",
    "yes",
    "complete",
    "completed",
    "done",
    "x",
    "✓",
    "checked",
    "1",
    "y",
  ].includes(String(value || "").toLowerCase().trim());
}

export default function EastPage() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("All");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [taskListOpen, setTaskListOpen] = useState(true);
  const [tradeshowsOpen, setTradeshowsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
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
        const completedIndex = getIndex(
          "completed",
          "completed?",
          "complete",
          "done"
        );

        const parsed = rows.slice(1).map((row, index) => ({
          id: index + 1,
          taskName: row[taskIndex] || "",
          dealerName: row[dealerIndex] || "",
          responsible: row[responsibleIndex] || "",
          dueDate: row[dueDateIndex] || "",
          completed: isCompleted(row[completedIndex]),
        }));

        setTasks(parsed.filter((task) => task.taskName || task.dealerName));
      } catch (error) {
        console.error("Could not load tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const responsibleOptions = useMemo(() => {
    const names = tasks.map((task) => task.responsible).filter(Boolean);
    return ["All", ...new Set(names)];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText =
        `${task.taskName} ${task.dealerName} ${task.responsible} ${task.dueDate}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesResponsible =
        responsibleFilter === "All" || task.responsible === responsibleFilter;

      const matchesCompleted = hideCompleted ? !task.completed : true;

      return matchesSearch && matchesResponsible && matchesCompleted;
    });
  }, [tasks, search, responsibleFilter, hideCompleted]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.filter((task) => !task.completed).length;
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="page">
      <div className="shell">
        <header className="topHeader">
          <div>
            <p className="eyebrow">Google Sheet Sync</p>
            <h1>East Command Center</h1>
            <p className="subtext">
              Tasks and tradeshow calendar pulled from Google Sheets.
            </p>
          </div>

          <div className="progressCard">
            <span>Progress</span>
            <strong>{progress}%</strong>
          </div>
        </header>

        <section className="statsGrid">
          <div className="statCard">
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>

          <div className="statCard">
            <span>Open Tasks</span>
            <strong>{openCount}</strong>
          </div>

          <div className="statCard">
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>

          <div className="statCard">
            <span>Showing</span>
            <strong>{filteredTasks.length}</strong>
          </div>
        </section>

        <section className="toolbarCard">
          <div>
            <h2>Filters</h2>
            <p>Search, filter by responsible person, or hide completed tasks.</p>
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

            <label className="hideToggle">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={() => setHideCompleted(!hideCompleted)}
              />
              Hide completed
            </label>
          </div>
        </section>

        <main className="mainGrid">
          <section className="card fullWidth">
            <div className="sectionHeader">
              <div>
                <h2>Tradeshows</h2>
                <p>This year at a glance · live formatted sheet view</p>
              </div>

              <button
                className="collapseBtn"
                onClick={() => setTradeshowsOpen(!tradeshowsOpen)}
              >
                {tradeshowsOpen ? "Minimize" : "Open"}
              </button>
            </div>

            {tradeshowsOpen && (
              <div className="sheetEmbedWrap">
                <iframe
                  src={TRADESHOW_EMBED_URL}
                  className="sheetEmbed"
                  title="Tradeshows Year at a Glance"
                />
              </div>
            )}
          </section>

          <section className="card fullWidth">
            <div className="sectionHeader">
              <div>
                <h2>East Task List</h2>
                <p>
                  {filteredTasks.length} showing · {openCount} open ·{" "}
                  {completedCount} completed
                </p>
              </div>

              <button
                className="collapseBtn"
                onClick={() => setTaskListOpen(!taskListOpen)}
              >
                {taskListOpen ? "Minimize" : "Open"}
              </button>
            </div>

            {taskListOpen && (
              <>
                {loading ? (
                  <div className="emptyState">Loading Google Sheet...</div>
                ) : filteredTasks.length === 0 ? (
                  <div className="emptyState">No tasks showing.</div>
                ) : (
                  <div className="taskTable">
                    <div className="tableHeader">
                      <span>Task Name</span>
                      <span>Dealer Name</span>
                      <span>Responsible</span>
                      <span>Due Date</span>
                      <span>Completed</span>
                    </div>

                    {filteredTasks.map((task) => (
                      <div
                        className={`taskRow ${
                          task.completed ? "completed" : ""
                        }`}
                        key={task.id}
                      >
                        <span className="taskName">{task.taskName}</span>
                        <span>{task.dealerName || "—"}</span>
                        <span>{task.responsible || "—"}</span>
                        <span>{task.dueDate || "—"}</span>
                        <span>
                          <span
                            className={`checkBadge ${
                              task.completed ? "done" : ""
                            }`}
                          >
                            {task.completed ? "✓" : ""}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </main>
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
        .card,
        .statCard {
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

        .progressCard span,
        .statCard span {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .progressCard strong,
        .statCard strong {
          font-size: 28px;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .statCard {
          padding: 16px;
        }

        .toolbarCard {
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr 680px;
          gap: 16px;
          align-items: center;
          margin-bottom: 16px;
        }

        .filters {
          display: grid;
          grid-template-columns: 1fr 160px 150px;
          gap: 10px;
          align-items: center;
        }

        .hideToggle {
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: #f8f9fb;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 700;
          color: #111;
        }

        .hideToggle input {
          width: 13px;
          height: 13px;
          padding: 0;
          accent-color: #111;
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

        .mainGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .fullWidth {
          grid-column: 1 / -1;
        }

        .card {
          padding: 18px;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
        }

        .collapseBtn {
          border: none;
          background: #111;
          color: #fff;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .sheetEmbedWrap {
          width: 100%;
          height: 720px;
          overflow: hidden;
          border: 1px solid #eceef2;
          border-radius: 16px;
          background: #fff;
        }

        .sheetEmbed {
          width: 100%;
          height: 100%;
          border: none;
        }

        .taskTable {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .tableHeader,
        .taskRow {
          display: grid;
          grid-template-columns: 1.6fr 1.1fr 0.9fr 0.75fr 80px;
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
          opacity: 0.55;
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
          padding: 22px;
          text-align: center;
          color: #777;
          font-size: 13px;
          border: 1px dashed #d1d5db;
          border-radius: 16px;
          background: #fafafa;
          line-height: 1.5;
        }

        @media (max-width: 1050px) {
          .topHeader,
          .toolbarCard,
          .statsGrid {
            grid-template-columns: 1fr;
          }

          .filters,
          .tableHeader,
          .taskRow {
            grid-template-columns: 1fr;
          }

          .progressCard {
            text-align: left;
          }

          .sheetEmbedWrap {
            height: 520px;
          }
        }
      `}</style>
    </div>
  );
}
