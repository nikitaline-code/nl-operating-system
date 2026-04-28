import { useEffect, useMemo, useState } from "react";

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pub?gid=1945000950&single=true&output=csv";

const TRADESHOW_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pub?gid=722935598&single=true&output=csv";

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
  const [tradeshows, setTradeshows] = useState([]);
  const [search, setSearch] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("All");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [taskListOpen, setTaskListOpen] = useState(true);
  const [tradeshowsOpen, setTradeshowsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tradeshowLoading, setTradeshowLoading] = useState(true);

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
        const completedIndex = getIndex("completed", "completed?", "complete", "done");

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

  useEffect(() => {
    async function fetchTradeshows() {
      try {
        const res = await fetch(TRADESHOW_CSV_URL);
        const text = await res.text();

        const rows = parseCSV(text);
        const headers = rows[0].map((h) => h.toLowerCase().trim());

        const getIndex = (...names) =>
          names
            .map((name) => headers.indexOf(name.toLowerCase()))
            .find((index) => index !== -1);

        const showIndex = getIndex("show", "event");
        const dateIndex = getIndex("date");
        const locationIndex = getIndex("location");
        const ownerIndex = getIndex("owner");
        const notesIndex = getIndex("notes");

        const parsed = rows.slice(1).map((row, index) => ({
          id: index + 1,
          show: row[showIndex] || "",
          date: row[dateIndex] || "",
          location: row[locationIndex] || "",
          owner: row[ownerIndex] || "",
          notes: row[notesIndex] || "",
        }));

        setTradeshows(parsed);
      } catch (error) {
        console.error("Could not load tradeshows:", error);
      } finally {
        setTradeshowLoading(false);
      }
    }

    fetchTradeshows();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText =
        `${task.taskName} ${task.dealerName} ${task.responsible}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesResponsible =
        responsibleFilter === "All" || task.responsible === responsibleFilter;
      const matchesCompleted = hideCompleted ? !task.completed : true;

      return matchesSearch && matchesResponsible && matchesCompleted;
    });
  }, [tasks, search, responsibleFilter, hideCompleted]);

  return (
    <div className="page">
      <h1>East Command Center</h1>

      <div className="controls">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={responsibleFilter}
          onChange={(e) => setResponsibleFilter(e.target.value)}
        >
          <option>All</option>
          {[...new Set(tasks.map((t) => t.responsible))].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={() => setHideCompleted(!hideCompleted)}
          />
          Hide Completed
        </label>
      </div>

      {/* Tradeshows */}
      <section>
        <h2 onClick={() => setTradeshowsOpen(!tradeshowsOpen)}>
          Tradeshows ({tradeshows.length})
        </h2>

        {tradeshowsOpen &&
          (tradeshowLoading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {tradeshows.map((t) => (
                <div key={t.id} className="card">
                  <strong>{t.show}</strong>
                  <p>{t.location}</p>
                  <span>{t.date}</span>
                </div>
              ))}
            </div>
          ))}
      </section>

      {/* Tasks */}
      <section>
        <h2 onClick={() => setTaskListOpen(!taskListOpen)}>
          East Tasks ({filteredTasks.length})
        </h2>

        {taskListOpen &&
          (loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {filteredTasks.map((task) => (
                <div key={task.id} className="card">
                  <strong>{task.taskName}</strong>
                  <p>{task.dealerName}</p>
                  <span>{task.responsible}</span>
                  <span>{task.dueDate}</span>
                  <span>{task.completed ? "✓" : ""}</span>
                </div>
              ))}
            </div>
          ))}
      </section>

      <style jsx>{`
        .page {
          padding: 30px;
        }
        .controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .card {
          border: 1px solid #ddd;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
