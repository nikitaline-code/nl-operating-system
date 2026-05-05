import { useEffect, useState } from "react";

const MEETINGS_KEY = "os-meetings";
const LEGACY_KEYS = [
  "meetings",
  "meeting-data",
  "meetingItems",
  "daily-meetings",
  "weekly-meetings",
  "os-meeting-data",
];

const DEFAULT_MEETINGS = {
  daily: {
    title: "Daily Meeting",
    sections: {
      calendar: [],
      tasks: [],
      decisions: [],
    },
  },
  weekly: {
    title: "Weekly Meeting",
    sections: {
      calendar: [],
      tasks: [],
      decisions: [],
    },
  },
};

export default function MeetingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState("daily");
  const [meetings, setMeetings] = useState(DEFAULT_MEETINGS);

  const current = meetings[mode];

  useEffect(() => {
    const saved = localStorage.getItem(MEETINGS_KEY);

    if (saved) {
      setMeetings(safeMerge(JSON.parse(saved)));
      setLoaded(true);
      return;
    }

    for (const key of LEGACY_KEYS) {
      const oldData = localStorage.getItem(key);

      if (oldData) {
        const parsed = JSON.parse(oldData);
        const restored = safeMerge(parsed);

        localStorage.setItem(MEETINGS_KEY, JSON.stringify(restored));
        setMeetings(restored);
        setLoaded(true);
        return;
      }
    }

    setMeetings(DEFAULT_MEETINGS);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
  }, [meetings, loaded]);

  function safeMerge(data) {
    return {
      daily: {
        ...DEFAULT_MEETINGS.daily,
        ...(data.daily || {}),
        sections: {
          ...DEFAULT_MEETINGS.daily.sections,
          ...(data.daily?.sections || data.sections || {}),
        },
      },
      weekly: {
        ...DEFAULT_MEETINGS.weekly,
        ...(data.weekly || {}),
        sections: {
          ...DEFAULT_MEETINGS.weekly.sections,
          ...(data.weekly?.sections || {}),
        },
      },
    };
  }

  function addItem(section) {
    const item = {
      id: Date.now(),
      text: "",
      owner: "Nikita",
      status: "Open",
    };

    setMeetings((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        sections: {
          ...prev[mode].sections,
          [section]: [...(prev[mode].sections[section] || []), item],
        },
      },
    }));
  }

  function updateItem(section, id, field, value) {
    setMeetings((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        sections: {
          ...prev[mode].sections,
          [section]: prev[mode].sections[section].map((item) =>
            item.id === id ? { ...item, [field]: value } : item
          ),
        },
      },
    }));
  }

  function deleteItem(section, id) {
    setMeetings((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        sections: {
          ...prev[mode].sections,
          [section]: prev[mode].sections[section].filter((item) => item.id !== id),
        },
      },
    }));
  }

  function exportAgenda() {
    const allItems = [
      ...current.sections.calendar.map((item) => ({
        section: "Calendar Review",
        ...item,
      })),
      ...current.sections.tasks.map((item) => ({
        section: "Tasks",
        ...item,
      })),
      ...current.sections.decisions.map((item) => ({
        section: "Decisions Needed",
        ...item,
      })),
    ].filter((item) => item.text?.trim());

    const rows = allItems
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.section}</td>
            <td>${item.text || ""}</td>
            <td>${item.owner || ""}</td>
            <td>${item.status || ""}</td>
          </tr>
        `
      )
      .join("");

    const win = window.open("", "_blank");

    win.document.write(`
      <html>
        <head>
          <title>${current.title} Agenda</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 36px;
              color: #111;
            }

            .header {
              border-bottom: 4px solid #111;
              padding-bottom: 14px;
              margin-bottom: 24px;
            }

            .brand {
              font-size: 12px;
              letter-spacing: 0.15em;
              font-weight: 700;
              text-transform: uppercase;
            }

            h1 {
              margin: 8px 0 4px;
              font-size: 28px;
            }

            .meta {
              font-size: 13px;
              color: #555;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th {
              background: #111;
              color: white;
              text-align: left;
              padding: 10px;
              font-size: 12px;
              text-transform: uppercase;
            }

            td {
              border: 1px solid #ddd;
              padding: 10px;
              font-size: 13px;
              vertical-align: top;
            }

            tr:nth-child(even) td {
              background: #f7f7f7;
            }

            .footer {
              margin-top: 28px;
              font-size: 11px;
              color: #777;
            }
          </style>
        </head>

        <body>
          <div class="header">
            <div class="brand">Arrowquip</div>
            <h1>${current.title} Agenda</h1>
            <div class="meta">Exported ${new Date().toLocaleDateString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Section</th>
                <th>Agenda Item</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="footer">Arrowquip Internal Meeting Agenda</div>

          <script>window.print();</script>
        </body>
      </html>
    `);

    win.document.close();
  }

  return (
    <main className="page">
      <div className="shell">
        <div className="top">
          <div>
            <p className="eyebrow">MEETING CENTER</p>
            <h1>Meetings</h1>
            <p className="subtitle">
              Daily and weekly agendas with clean Arrowquip agenda export.
            </p>
          </div>

          <button onClick={exportAgenda}>Export Agenda</button>
        </div>

        <div className="mode-row">
          <button
            className={mode === "daily" ? "active" : ""}
            onClick={() => setMode("daily")}
          >
            Daily
          </button>
          <button
            className={mode === "weekly" ? "active" : ""}
            onClick={() => setMode("weekly")}
          >
            Weekly
          </button>
        </div>

        <SectionCard
          title="Calendar Review"
          section="calendar"
          items={current.sections.calendar}
          addItem={addItem}
          updateItem={updateItem}
          deleteItem={deleteItem}
        />

        <SectionCard
          title="Tasks"
          section="tasks"
          items={current.sections.tasks}
          addItem={addItem}
          updateItem={updateItem}
          deleteItem={deleteItem}
        />

        <SectionCard
          title="Decisions Needed"
          section="decisions"
          items={current.sections.decisions}
          addItem={addItem}
          updateItem={updateItem}
          deleteItem={deleteItem}
        />
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          background: #f5f6f8;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #020617;
        }

        .page {
          min-height: 100vh;
          padding: 32px 24px 80px;
        }

        .shell {
          max-width: 1220px;
          margin: 0 auto;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: 10px;
          letter-spacing: 0.18em;
          font-weight: 700;
          color: #64748b;
        }

        h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .subtitle {
          margin: 8px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        button {
          border: none;
          border-radius: 999px;
          background: #020617;
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          padding: 8px 14px;
          cursor: pointer;
        }

        .mode-row {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
        }

        .mode-row button {
          background: #ffffff;
          color: #020617;
          border: 1px solid #dfe3ea;
        }

        .mode-row button.active {
          background: #020617;
          color: #ffffff;
        }

        .card {
          background: #ffffff;
          border: 1px solid #dfe3ea;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.045);
          padding: 18px;
          margin-bottom: 16px;
        }

        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .card-head h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
        }

        .agenda-row {
          display: grid;
          grid-template-columns: 1fr 120px 120px 34px;
          gap: 8px;
          margin-bottom: 8px;
          align-items: center;
        }

        input,
        select {
          height: 34px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          background: #f8fafc;
          padding: 0 10px;
          font-size: 12px;
          outline: none;
        }

        .delete-btn {
          background: transparent;
          color: #9ca3af;
          padding: 5px 8px;
          font-size: 14px;
        }

        .empty {
          margin: 0;
          padding: 8px 0;
          font-size: 12px;
          color: #64748b;
        }
      `}</style>
    </main>
  );
}

function SectionCard({ title, section, items, addItem, updateItem, deleteItem }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>{title}</h2>
        <button onClick={() => addItem(section)}>Add</button>
      </div>

      {items.length === 0 ? (
        <p className="empty">No items yet.</p>
      ) : (
        items.map((item) => (
          <div className="agenda-row" key={item.id}>
            <input
              value={item.text || ""}
              onChange={(e) => updateItem(section, item.id, "text", e.target.value)}
              placeholder="Agenda item..."
            />

            <select
              value={item.owner || "Nikita"}
              onChange={(e) => updateItem(section, item.id, "owner", e.target.value)}
            >
              <option>Nikita</option>
              <option>Mark</option>
              <option>Dane</option>
            </select>

            <select
              value={item.status || "Open"}
              onChange={(e) => updateItem(section, item.id, "status", e.target.value)}
            >
              <option>Open</option>
              <option>Pending</option>
              <option>Complete</option>
            </select>

            <button className="delete-btn" onClick={() => deleteItem(section, item.id)}>
              ×
            </button>
          </div>
        ))
      )}
    </section>
  );
}
